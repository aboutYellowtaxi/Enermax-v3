import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sanitizeString, isValidUUID } from '@/lib/sanitize'
import { validatePanelAuth } from '@/lib/auth-panel'

// GET - Fetch reviews (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const solicitudId = searchParams.get('solicitud_id')
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50)

    const supabase = createServerClient()

    // If solicitud_id provided, check if review exists
    if (solicitudId) {
      const { data } = await supabase
        .from('reviews')
        .select('id, calificacion, comentario, cliente_nombre, created_at')
        .eq('solicitud_id', solicitudId)
        .single()

      return NextResponse.json({ review: data || null })
    }

    // Otherwise return recent visible reviews
    const { data, error } = await supabase
      .from('reviews')
      .select('id, calificacion, comentario, cliente_nombre, respuesta, created_at')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reviews: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a review (no auth, keyed by solicitud UUID)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solicitud_id, calificacion, comentario, cliente_nombre } = body

    if (!solicitud_id || !calificacion) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (!isValidUUID(solicitud_id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    if (calificacion < 1 || calificacion > 5) {
      return NextResponse.json({ error: 'Calificación debe ser entre 1 y 5' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check solicitud exists and is completada
    const { data: solicitud } = await supabase
      .from('solicitudes')
      .select('id, estado, profesional_id, cliente_nombre')
      .eq('id', solicitud_id)
      .single()

    if (!solicitud || solicitud.estado !== 'completada') {
      return NextResponse.json({ error: 'Solo podés dejar review en trabajos completados' }, { status: 400 })
    }

    // Check no existing review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('solicitud_id', solicitud_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ya dejaste una review para este trabajo' }, { status: 409 })
    }

    // Create review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        solicitud_id,
        profesional_id: solicitud.profesional_id,
        cliente_nombre: sanitizeString(cliente_nombre || solicitud.cliente_nombre || 'Cliente', 100),
        calificacion,
        comentario: comentario ? sanitizeString(comentario, 1000) : null,
        visible: true,
      })
      .select('id, calificacion')
      .single()

    if (error) {
      console.error('Review insert error:', error)
      return NextResponse.json({ error: 'Error al guardar review' }, { status: 500 })
    }

    return NextResponse.json({ success: true, review: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Respond to a review (panel auth required)
export async function PATCH(request: NextRequest) {
  if (!validatePanelAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { review_id, respuesta } = await request.json()

    if (!review_id || !respuesta) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabase = createServerClient()

    await supabase
      .from('reviews')
      .update({
        respuesta: sanitizeString(respuesta, 1000),
        fecha_respuesta: new Date().toISOString(),
      })
      .eq('id', review_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
