import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validatePanelAuth } from '@/lib/auth-panel'
import { sanitizeString, isValidUUID } from '@/lib/sanitize'

// GET - Fetch portfolio items (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') || 12), 50)

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('portfolio')
      .select('id, foto_url, descripcion, subido_por, created_at')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      // Table may not exist yet
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({ items: data || [] })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

// POST - Upload portfolio item (panel auth for professional, open for clients with solicitud_id)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { foto_url, descripcion, solicitud_id, subido_por } = body

    if (!foto_url) {
      return NextResponse.json({ error: 'Falta la URL de la foto' }, { status: 400 })
    }

    const supabase = createServerClient()

    // If uploaded by professional, require panel auth
    if (subido_por === 'profesional') {
      if (!validatePanelAuth(request)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    } else if (solicitud_id) {
      // Client upload - verify solicitud exists and is completed
      if (!isValidUUID(solicitud_id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }
      const { data: sol } = await supabase
        .from('solicitudes')
        .select('estado')
        .eq('id', solicitud_id)
        .single()
      if (!sol || sol.estado !== 'completada') {
        return NextResponse.json({ error: 'Solo para trabajos completados' }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('portfolio')
      .insert({
        foto_url,
        descripcion: descripcion ? sanitizeString(descripcion, 200) : null,
        solicitud_id: solicitud_id || null,
        subido_por: subido_por || 'cliente',
        visible: true,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Portfolio insert error:', error)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove portfolio item (panel auth required)
export async function DELETE(request: NextRequest) {
  if (!validatePanelAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const supabase = createServerClient()
    await supabase.from('portfolio').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
