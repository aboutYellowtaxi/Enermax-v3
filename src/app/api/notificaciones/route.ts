import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profesionalId = searchParams.get('profesional_id')
    const usuarioId = searchParams.get('usuario_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    const supabase = createServerClient()

    let query = supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (profesionalId) {
      query = query.eq('profesional_id', profesionalId)
    } else if (usuarioId) {
      query = query.eq('usuario_auth_id', usuarioId)
    } else {
      return NextResponse.json(
        { error: 'profesional_id o usuario_id requerido' },
        { status: 400 }
      )
    }

    if (unreadOnly) {
      query = query.eq('leida', false)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notificaciones: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, profesionalId, usuarioId, markAll } = body

    const supabase = createServerClient()

    if (markAll) {
      // Mark all as read
      let query = supabase
        .from('notificaciones')
        .update({ leida: true })

      if (profesionalId) {
        query = query.eq('profesional_id', profesionalId)
      } else if (usuarioId) {
        query = query.eq('usuario_auth_id', usuarioId)
      }

      await query.eq('leida', false)
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .in('id', ids)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
