const RESEND_API_KEY = process.env.RESEND_API_KEY
const NOTIFY_EMAIL = 'valentinbke@gmail.com'

type NotificationType = 'nuevo_lead' | 'pago_confirmado'

interface ClienteData {
  telefono: string
  direccion: string
  descripcion?: string
  solicitudId?: string
  monto?: number
}

export async function notificarNuevoCliente(tipo: NotificationType, cliente: ClienteData) {
  if (!RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not set, skipping email')
    return
  }

  const whatsappUrl = `https://wa.me/549${cliente.telefono.replace(/[\s\-\(\)]/g, '')}?text=${encodeURIComponent(
    `Hola, soy Leonel de Enermax. Recibí tu solicitud de diagnóstico eléctrico. ¿Cuándo te queda bien coordinar la visita?`
  )}`

  const esConfirmado = tipo === 'pago_confirmado'

  const subject = esConfirmado
    ? `✅ PAGO CONFIRMADO - Nuevo cliente para diagnostico`
    : `🔔 Nuevo lead - Pendiente de pago`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:16px;">⚡</span>
        </div>
        <span style="font-size:18px;font-weight:700;color:#111827;">Enermax</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Status bar -->
      <div style="background:${esConfirmado ? '#059669' : '#f59e0b'};padding:12px 24px;text-align:center;">
        <span style="color:white;font-weight:600;font-size:14px;">
          ${esConfirmado ? '✅ PAGO CONFIRMADO' : '⏳ PENDIENTE DE PAGO'}
        </span>
      </div>

      <!-- Content -->
      <div style="padding:24px;">
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
          ${esConfirmado ? '¡Nuevo cliente!' : 'Nuevo lead'}
        </h2>

        <!-- Client info -->
        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:16px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;width:90px;">Teléfono</td>
              <td style="padding:6px 0;color:#111827;font-weight:600;font-size:15px;">
                <a href="tel:+549${cliente.telefono.replace(/[\s\-\(\)]/g, '')}" style="color:#2563eb;text-decoration:none;">
                  ${cliente.telefono}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Ubicación</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;">${cliente.direccion}</td>
            </tr>
            ${cliente.descripcion ? `
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;vertical-align:top;">Problema</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;">${cliente.descripcion}</td>
            </tr>
            ` : ''}
            ${cliente.monto ? `
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Monto</td>
              <td style="padding:6px 0;color:#111827;font-weight:600;font-size:15px;">$${cliente.monto.toLocaleString('es-AR')}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${esConfirmado ? `
        <!-- WhatsApp CTA -->
        <a href="${whatsappUrl}" target="_blank" style="display:block;background:#25D366;color:white;text-align:center;padding:14px;border-radius:12px;font-weight:600;font-size:16px;text-decoration:none;margin-bottom:12px;">
          💬 Contactar por WhatsApp
        </a>

        <!-- Call CTA -->
        <a href="tel:+549${cliente.telefono.replace(/[\s\-\(\)]/g, '')}" style="display:block;background:#f1f5f9;color:#111827;text-align:center;padding:14px;border-radius:12px;font-weight:600;font-size:15px;text-decoration:none;">
          📞 Llamar al cliente
        </a>
        ` : `
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
          Te avisamos cuando confirme el pago.
        </p>
        `}
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #f1f5f9;padding:12px 24px;text-align:center;">
        <span style="color:#9ca3af;font-size:11px;">
          ${cliente.solicitudId ? `Ref: ${cliente.solicitudId} · ` : ''}${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
        </span>
      </div>
    </div>

    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
      Enermax · Servicios eléctricos profesionales
    </p>
  </div>
</body>
</html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Enermax <onboarding@resend.dev>',
        to: [NOTIFY_EMAIL],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[EMAIL] Error:', err)
    } else {
      console.log(`[EMAIL] Sent ${tipo} notification for ${cliente.telefono}`)
    }
  } catch (err) {
    console.error('[EMAIL] Failed to send:', err)
  }
}
