import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

// Insert a message into web chat + broadcast via realtime
async function sendToWebChat(solicitudId: string, replyText: string, topicId?: number): Promise<boolean> {
  const supabase = createServerClient()

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
    await sendTelegramMessage('Error al enviar mensaje.', { topicId })
    return false
  }

  // Broadcast to web chat via Supabase realtime
  try {
    const channel = supabase.channel(`chat-live:${solicitudId}`)
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: { mensaje: msgData },
    })
    supabase.removeChannel(channel)
  } catch { /* best effort */ }

  return true
}

// Telegram sends updates here when Leo messages the bot/group
export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    const message = update.message
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const expectedChatId = process.env.TELEGRAM_CHAT_ID || ''

    // Only accept messages from our configured chat (group or private)
    if (chatId !== expectedChatId) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()
    const topicId: number | undefined = message.message_thread_id || undefined

    // Handle /start command (only in general/private, not in topics)
    if (text === '/start' && !topicId) {
      await sendTelegramMessage(
        '🔌 <b>Enermax Bot activo</b>\n\n' +
        'Cada cliente tiene su propio tema/hilo.\n' +
        'Escribí directamente en el hilo del cliente para responderle.\n\n' +
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
        await sendTelegramMessage('No hay solicitudes activas.', { topicId })
        return NextResponse.json({ ok: true })
      }

      let msg = '📋 <b>Solicitudes activas:</b>\n\n'
      solicitudes.forEach((s) => {
        const estado = s.estado === 'pendiente' ? '🔵 Nueva' :
                       s.estado === 'aceptada' ? '📞 Contactado' : '🔧 En curso'
        msg += `${estado}\n`
        if (s.direccion && s.direccion !== 'Sin especificar') {
          msg += `📍 ${s.direccion}\n`
        }
        msg += `📱 ${s.cliente_telefono}\n\n`
      })

      await sendTelegramMessage(msg, { topicId })
      return NextResponse.json({ ok: true })
    }

    // MAIN FLOW: message inside a topic → route to that solicitud
    if (topicId) {
      const supabase = createServerClient()

      // Find solicitud by telegram_topic_id
      const { data: solicitud } = await supabase
        .from('solicitudes')
        .select('id')
        .eq('telegram_topic_id', topicId)
        .single()

      if (solicitud) {
        await sendToWebChat(solicitud.id, text, topicId)
        return NextResponse.json({ ok: true })
      }

      // Topic not linked to any solicitud
      await sendTelegramMessage(
        'Este hilo no está vinculado a ninguna solicitud.',
        { topicId }
      )
      return NextResponse.json({ ok: true })
    }

    // Message in general chat without topic context
    if (text.startsWith('/')) {
      await sendTelegramMessage(
        'Comandos:\n' +
        '/activas — Ver solicitudes activas\n' +
        '/start — Ver ayuda'
      )
    } else {
      await sendTelegramMessage(
        'Respondé dentro del hilo de cada cliente para hablar con ellos.'
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
