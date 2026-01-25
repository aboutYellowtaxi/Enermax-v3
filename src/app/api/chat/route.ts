import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET - Fetch messages for a solicitud
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const solicitudId = searchParams.get('solicitud_id')

    if (!solicitudId) {
      return NextResponse.json(
        { error: 'solicitud_id requerido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('chat_mensajes')
      .select('*')
      .eq('solicitud_id', solicitudId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ mensajes: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solicitudId, autorTipo, autorId, mensaje, archivoUrl } = body

    if (!solicitudId || !autorTipo || !mensaje) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Insert message
    const { data, error } = await supabase
      .from('chat_mensajes')
      .insert({
        solicitud_id: solicitudId,
        autor_tipo: autorTipo,
        autor_id: autorId || null,
        mensaje,
        archivo_url: archivoUrl || null,
        leido: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for the other party
    const { data: solicitud } = await supabase
      .from('solicitudes')
      .select('profesional_id, cliente_auth_id')
      .eq('id', solicitudId)
      .single()

    if (solicitud) {
      if (autorTipo === 'cliente') {
        // Notify professional
        await supabase.from('notificaciones').insert({
          profesional_id: solicitud.profesional_id,
          tipo: 'nuevo_mensaje',
          titulo: 'Nuevo mensaje',
          mensaje: mensaje.substring(0, 50) + (mensaje.length > 50 ? '...' : ''),
          solicitud_id: solicitudId,
          leida: false,
          enviada_email: false,
          enviada_push: false,
        })
      } else if (autorTipo === 'profesional' && solicitud.cliente_auth_id) {
        // Notify client
        await supabase.from('notificaciones').insert({
          usuario_auth_id: solicitud.cliente_auth_id,
          tipo: 'nuevo_mensaje',
          titulo: 'Nuevo mensaje',
          mensaje: mensaje.substring(0, 50) + (mensaje.length > 50 ? '...' : ''),
          solicitud_id: solicitudId,
          leida: false,
          enviada_email: false,
          enviada_push: false,
        })
      }
    }

    return NextResponse.json({ mensaje: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageIds, solicitudId, readBy } = body

    const supabase = createServerClient()

    if (messageIds && messageIds.length > 0) {
      // Mark specific messages as read
      await supabase
        .from('chat_mensajes')
        .update({ leido: true })
        .in('id', messageIds)
    } else if (solicitudId && readBy) {
      // Mark all messages from other party as read
      await supabase
        .from('chat_mensajes')
        .update({ leido: true })
        .eq('solicitud_id', solicitudId)
        .neq('autor_tipo', readBy)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
