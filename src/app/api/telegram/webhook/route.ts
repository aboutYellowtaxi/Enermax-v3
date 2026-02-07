import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

// Telegram sends updates here when Leo replies
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
        'Vas a recibir mensajes de clientes acá.\n' +
        'Para responder, usá:\n' +
        '<code>/r ID mensaje</code>\n\n' +
        'Ejemplo: <code>/r abc12345 Ya voy para allá</code>\n\n' +
        'También podés usar <code>/activas</code> para ver solicitudes activas.'
      )
      return NextResponse.json({ ok: true })
    }

    // Handle /activas command - list active solicitudes
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
        msg += `${estado} <code>${shortId}</code>\n`
        if (s.direccion && s.direccion !== 'Sin especificar') {
          msg += `📍 ${s.direccion}\n`
        }
        msg += `📱 ${s.cliente_telefono}\n\n`
      })
      msg += 'Respondé con: <code>/r ID tu mensaje</code>'

      await sendTelegramMessage(msg)
      return NextResponse.json({ ok: true })
    }

    // Handle /r ID message - reply to a solicitud chat
    const replyMatch = text.match(/^\/r\s+([a-f0-9]{8})\s+(.+)$/is)
    if (replyMatch) {
      const shortId = replyMatch[1].toLowerCase()
      const replyText = replyMatch[2].trim()

      if (!replyText) {
        await sendTelegramMessage('Escribí un mensaje después del ID.')
        return NextResponse.json({ ok: true })
      }

      const supabase = createServerClient()

      // Find solicitud by short ID prefix
      const { data: solicitudes } = await supabase
        .from('solicitudes')
        .select('id')
        .ilike('id', `${shortId}%`)
        .limit(1)

      if (!solicitudes || solicitudes.length === 0) {
        await sendTelegramMessage(`No encontré solicitud con ID <code>${shortId}</code>`)
        return NextResponse.json({ ok: true })
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
        return NextResponse.json({ ok: true })
      }

      // Broadcast to web chat via Supabase realtime
      const channel = supabase.channel(`chat-live:${solicitudId}`)
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: { mensaje: msgData },
      })
      supabase.removeChannel(channel)

      await sendTelegramMessage(`✅ Mensaje enviado a solicitud <code>${shortId}</code>`)
      return NextResponse.json({ ok: true })
    }

    // If message doesn't match any command, show help
    if (text.startsWith('/')) {
      await sendTelegramMessage(
        'Comandos:\n' +
        '/activas - Ver solicitudes activas\n' +
        '/r ID mensaje - Responder a un cliente\n' +
        '/start - Ver ayuda'
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
