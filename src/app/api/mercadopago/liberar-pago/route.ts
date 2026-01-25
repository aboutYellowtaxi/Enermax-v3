import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { solicitudId } = await request.json()

    if (!solicitudId) {
      return NextResponse.json(
        { error: 'Solicitud ID requerido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get solicitud and pago
    const { data: solicitud } = await supabase
      .from('solicitudes')
      .select('*, pago:pagos(*)')
      .eq('id', solicitudId)
      .single()

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (solicitud.estado !== 'completada') {
      return NextResponse.json(
        { error: 'La solicitud debe estar completada primero' },
        { status: 400 }
      )
    }

    // Update pago to liberado
    await supabase
      .from('pagos')
      .update({
        estado: 'liberado',
        fecha_liberacion: new Date().toISOString(),
      })
      .eq('solicitud_id', solicitudId)

    // Update solicitud to confirmada
    await supabase
      .from('solicitudes')
      .update({ estado: 'confirmada' })
      .eq('id', solicitudId)

    // Notify professional
    await supabase.from('notificaciones').insert({
      profesional_id: solicitud.profesional_id,
      tipo: 'pago_liberado',
      titulo: 'Pago liberado',
      mensaje: `El pago de ${solicitud.cliente_nombre} fue liberado a tu cuenta`,
      solicitud_id: solicitudId,
      leida: false,
      enviada_email: false,
      enviada_push: false,
    })

    // Update professional stats
    await supabase.rpc('increment_trabajos_completados', {
      prof_id: solicitud.profesional_id
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error releasing payment:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
