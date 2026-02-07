import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const ESTADOS_VALIDOS = ['pendiente', 'aceptada', 'en_progreso', 'completada', 'cancelada']

export async function POST(request: NextRequest) {
  try {
    const { solicitud_id, estado } = await request.json()

    if (!solicitud_id || !estado) {
      return NextResponse.json(
        { error: 'Faltan datos' },
        { status: 400 }
      )
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('solicitudes')
      .update({ estado })
      .eq('id', solicitud_id)

    if (error) {
      console.error('Error updating estado:', error)
      return NextResponse.json(
        { error: 'Error al actualizar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, estado })
  } catch {
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}
