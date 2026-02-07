import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!rateLimit(`mi-solicitud:${ip}`, 10, 3600000)) {
    return NextResponse.json(
      { error: 'Demasiadas consultas. Intentá en un rato.' },
      { status: 429 }
    )
  }

  try {
    const { telefono } = await request.json()

    if (!telefono || telefono.trim().length < 6) {
      return NextResponse.json(
        { error: 'Ingresá tu número de teléfono' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const cleanPhone = telefono.replace(/[\s\-\(\)]/g, '')

    // Use exact match on cleaned phone (no wildcards)
    const { data, error } = await supabase
      .from('solicitudes')
      .select('id, estado, created_at')
      .or(`cliente_telefono.eq.${cleanPhone},cliente_telefono.eq.${telefono.trim()}`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: 'Error al buscar' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No encontramos solicitudes con ese teléfono' },
        { status: 404 }
      )
    }

    return NextResponse.json({ solicitudes: data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
