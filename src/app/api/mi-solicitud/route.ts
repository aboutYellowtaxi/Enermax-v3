import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
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

    const { data, error } = await supabase
      .from('solicitudes')
      .select('id, estado, created_at')
      .or(`cliente_telefono.ilike.%${cleanPhone}%,cliente_telefono.ilike.%${telefono.trim()}%`)
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
