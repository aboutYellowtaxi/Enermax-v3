import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data, error } = await supabase
      .from('solicitudes')
      .select('id, estado, created_at, monto_total, direccion')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ solicitud: data })
  } catch {
    return NextResponse.json(
      { error: 'Error al consultar' },
      { status: 500 }
    )
  }
}
