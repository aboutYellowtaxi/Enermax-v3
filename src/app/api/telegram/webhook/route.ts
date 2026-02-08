import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

// Extract short ID (8 hex chars) from a Telegram message text
// Telegram strips HTML so <code>abc12345</code> becomes plain "abc12345"
// Our notifications always include: — abc12345
function extractShortId(text: string): string | null {
  // Look for "— " followed by 8 hex chars (plain text, no HTML)
  const match = text.match(/— ([a-f0-9]{8})/i)
  return match ? match[1].toLowerCase() : null
}

// Send a reply to a solicitud's web chat + broadcast
async function sendToSolicitud(shortId: string, replyText: string): Promise<boolean> {
  const supabase = createServerClient()

  // Find solicitud by short ID prefix
  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select('id')
    .ilike('id', `${shortId}%`)
    .limit(1)

  if (!solicitudes || solicitudes.length === 0) {
    await sendTelegramMessage(`No encontré solicitud con ID <code>${shortId}</code>`)
    return false
  }

  const solicitudId = solicitudes[0].id

  // Insert message as professional
  const { data: msgData, error } = await supabase
    .from('chat_mensajes')
    .insert({
      solicitud_id: solicitudId,
      autor_tipo: 'profesional',
      mensaje: replyText,
      leido: false,
    })
    .select()
    .single()

  if (error) {
    await sendTelegramMessage('Error al enviar mensaje.')
    return false
  }

  // Broadcast to web chat via Supabase realtime
  const channel = supabase.channel(`chat-live:${solicitudId}`)
  await channel.send({
    type: 'broadcast',
    event: 'new_message',
    payload: { mensaje: msgData },
  })
  supabase.removeChannel(channel)

  await sendTelegramMessage(`✅ Enviado a <code>${shortId}</code>`)
  return true
}

// Telegram sends updates here when Leo messages the bot
export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Only handle text messages
    const message = update.message
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const expectedChatId = process.env.TELEGRAM_CHAT_ID || ''

    // Only accept messages from Leo's chat
    if (chatId !== expectedChatId) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        '🔌 <b>Enermax Bot activo</b>\n\n' +
        'Cuando un cliente te escriba, te llega acá.\n' +
        'Para responder: <b>deslizá sobre el mensaje y escribí tu respuesta</b>.\n\n' +
        'Comandos:\n' +
        '/activas — Ver solicitudes activas\n' +
        '/start — Ver esta ayuda'
      )
      return NextResponse.json({ ok: true })
    }

    // Handle /activas command
    if (text === '/activas') {
      const supabase = createServerClient()
      const { data: solicitudes } = await supabase
        .from('solicitudes')
        .select('id, estado, direccion, cliente_telefono, created_at')
        .in('estado', ['pendiente', 'aceptada', 'en_progreso'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (!solicitudes || solicitudes.length === 0) {
        await sendTelegramMessage('No hay solicitudes activas.')
        return NextResponse.json({ ok: true })
      }

      let msg = '📋 <b>Solicitudes activas:</b>\n\n'
      solicitudes.forEach((s) => {
        const shortId = s.id.slice(0, 8)
        const estado = s.estado === 'pendiente' ? '🔵 Nueva' :
                       s.estado === 'aceptada' ? '📞 Contactado' : '🔧 En curso'
        msg += `${estado} — <code>${shortId}</code>\n`
        if (s.direccion && s.direccion !== 'Sin especificar') {
          msg += `📍 ${s.direccion}\n`
        }
        msg += `📱 ${s.cliente_telefono}\n\n`
      })

      await sendTelegramMessage(msg)
      return NextResponse.json({ ok: true })
    }

    // Handle /r ID message (manual fallback)
    const replyMatch = text.match(/^\/r\s+([a-f0-9]{8})\s+(.+)$/is)
    if (replyMatch) {
      await sendToSolicitud(replyMatch[1].toLowerCase(), replyMatch[2].trim())
      return NextResponse.json({ ok: true })
    }

    // Handle REPLY to a notification message (main flow!)
    // Leo swipes on a notification and types his reply
    if (message.reply_to_message && message.reply_to_message.text) {
      const originalText = message.reply_to_message.text
      const shortId = extractShortId(originalText)

      if (shortId) {
        await sendToSolicitud(shortId, text)
        return NextResponse.json({ ok: true })
      }
    }

    // Also check if reply is to a photo caption
    if (message.reply_to_message && message.reply_to_message.caption) {
      const shortId = extractShortId(message.reply_to_message.caption)
      if (shortId) {
        await sendToSolicitud(shortId, text)
        return NextResponse.json({ ok: true })
      }
    }

    // Unknown command or plain text without reply context
    if (text.startsWith('/')) {
      await sendTelegramMessage(
        'Comandos:\n' +
        '/activas — Ver solicitudes activas\n' +
        '/start — Ver ayuda\n\n' +
        'Para responder a un cliente, deslizá sobre su mensaje y escribí tu respuesta.'
      )
    } else {
      // Plain text without replying to anything
      await sendTelegramMessage(
        'Para responder a un cliente, deslizá sobre su mensaje y escribí tu respuesta.'
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
