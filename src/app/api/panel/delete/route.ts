import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validatePanelAuth } from '@/lib/auth-panel'
import { isValidUUID } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  if (!validatePanelAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { solicitud_id } = await request.json()

    if (!solicitud_id || !isValidUUID(solicitud_id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Delete related records first
    await supabase.from('chat_mensajes').delete().eq('solicitud_id', solicitud_id)
    await supabase.from('comisiones').delete().eq('solicitud_id', solicitud_id)
    await supabase.from('reviews').delete().eq('solicitud_id', solicitud_id)
    await supabase.from('solicitudes').delete().eq('id', solicitud_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
