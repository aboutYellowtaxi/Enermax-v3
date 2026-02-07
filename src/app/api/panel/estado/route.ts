import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validatePanelAuth } from '@/lib/auth-panel'
import { isValidUUID } from '@/lib/sanitize'

const ESTADOS_VALIDOS = ['pendiente', 'aceptada', 'en_progreso', 'completada', 'cancelada']

export async function POST(request: NextRequest) {
  if (!validatePanelAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { solicitud_id, estado, monto_trabajo } = await request.json()

    if (!solicitud_id || !estado) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (!isValidUUID(solicitud_id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // If completing, require job amount and create commission
    if (estado === 'completada' && monto_trabajo && monto_trabajo > 0) {
      const comision = Math.round(monto_trabajo * 0.30)

      await supabase
        .from('solicitudes')
        .update({
          estado: 'completada',
          monto_total: monto_trabajo,
          comision_enermax: comision,
          monto_profesional: monto_trabajo - comision,
        })
        .eq('id', solicitud_id)

      // Try to create commission record (table may not exist yet)
      try {
        await supabase
          .from('comisiones')
          .insert({
            solicitud_id,
            monto_trabajo,
            porcentaje_comision: 0.30,
            monto_comision: comision,
            estado: 'pendiente',
          })
      } catch { /* table may not exist yet */ }

      return NextResponse.json({ success: true, estado })
    }

    // Normal status update
    const { error } = await supabase
      .from('solicitudes')
      .update({ estado })
      .eq('id', solicitud_id)

    if (error) {
      console.error('Error updating estado:', error)
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, estado })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
