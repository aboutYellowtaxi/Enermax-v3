import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { notificarNuevoCliente } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeString } from '@/lib/sanitize'
import { sendTelegramMessage, isTelegramConfigured } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!rateLimit(`agendar:${ip}`, 5, 3600000)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intentá en un rato.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const telefono = sanitizeString(body.telefono || '', 20)
    const direccion = sanitizeString(body.direccion || '', 200)
    const descripcion = sanitizeString(body.descripcion || '', 500)
    const lat = body.lat || null
    const lng = body.lng || null

    if (!telefono) {
      return NextResponse.json(
        { error: 'Necesitamos tu teléfono para contactarte' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: solicitud, error: dbError } = await supabase
      .from('solicitudes')
      .insert({
        cliente_nombre: telefono,
        cliente_telefono: telefono,
        cliente_email: `lead-${Date.now()}@enermax.app`,
        direccion: direccion || 'Sin especificar',
        lat,
        lng,
        notas: descripcion || 'Consulta / Agendamiento',
        monto_total: 0,
        comision_enermax: 0,
        monto_profesional: 0,
        estado: 'pendiente',
        score_fraude: 0,
      })
      .select('id')
      .single()

    if (dbError || !solicitud) {
      console.error('DB Error:', dbError)
      return NextResponse.json(
        { error: 'Error al guardar. Intentá de nuevo.' },
        { status: 500 }
      )
    }

    // Create initial chat messages
    await supabase.from('chat_mensajes').insert([
      {
        solicitud_id: solicitud.id,
        autor_tipo: 'sistema',
        mensaje: 'Solicitud creada',
        leido: false,
      },
      {
        solicitud_id: solicitud.id,
        autor_tipo: 'profesional',
        mensaje: 'Hola! Soy Leonel, electricista matriculado. Recibí tu solicitud y la voy a revisar. Estoy disponible de lunes a sábado de 8 a 18hs. Si querés, grabá un video del problema así lo veo antes de ir. Te contacto lo antes posible!',
        leido: false,
      },
    ])

    // Notify admin via email
    notificarNuevoCliente('nueva_solicitud', {
      telefono,
      direccion: direccion || 'Sin especificar',
      descripcion: descripcion || 'Agendamiento',
      solicitudId: solicitud.id,
    }).catch(() => {})

    // Notify via Telegram
    if (isTelegramConfigured()) {
      const shortId = solicitud.id.slice(0, 8)
      sendTelegramMessage(
        `🆕 <b>Nueva solicitud</b> — <code>${shortId}</code>\n\n` +
        `📱 <b>Tel:</b> ${telefono}\n` +
        `📍 <b>Dir:</b> ${direccion || 'Sin especificar'}\n` +
        (descripcion ? `📝 ${descripcion}\n` : '') +
        `\nResponder: <code>/r ${shortId} tu mensaje</code>`
      ).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      solicitud_id: solicitud.id,
      redirect: `/seguimiento/${solicitud.id}`,
    })
  } catch (error: any) {
    console.error('Error in /api/agendar-gratis:', error)
    return NextResponse.json(
      { error: 'Hubo un error. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}
