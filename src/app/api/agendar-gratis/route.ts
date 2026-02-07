import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { notificarNuevoCliente } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { telefono, direccion, descripcion, lat, lng } = await request.json()

    if (!telefono) {
      return NextResponse.json(
        { error: 'Necesitamos tu teléfono para contactarte' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: solicitud, error: dbError } = await supabase
      .from('solicitudes')
      .insert({
        cliente_nombre: telefono,
        cliente_telefono: telefono,
        cliente_email: `lead-${Date.now()}@enermax.app`,
        direccion: direccion || 'Sin especificar',
        lat: lat || null,
        lng: lng || null,
        notas: descripcion || 'Consulta / Agendamiento sin pago',
        monto_total: 0,
        comision_enermax: 0,
        monto_profesional: 0,
        estado: 'pendiente',
        score_fraude: 0,
      })
      .select('id')
      .single()

    if (dbError || !solicitud) {
      console.error('DB Error:', dbError)
      return NextResponse.json(
        { error: 'Error al guardar. Intentá de nuevo.' },
        { status: 500 }
      )
    }

    // Create initial chat message
    await supabase.from('chat_mensajes').insert({
      solicitud_id: solicitud.id,
      autor_tipo: 'sistema',
      mensaje: 'Solicitud recibida. El profesional va a revisar tu pedido y se va a comunicar con vos por este chat.',
      leido: false,
    })

    // Notify admin
    notificarNuevoCliente('pago_confirmado', {
      telefono,
      direccion: direccion || 'Sin especificar',
      descripcion: descripcion || 'Agendamiento sin pago',
      solicitudId: solicitud.id,
      monto: 0,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      solicitud_id: solicitud.id,
      redirect: `/seguimiento/${solicitud.id}`,
    })
  } catch (error: any) {
    console.error('Error in /api/agendar-gratis:', error)
    return NextResponse.json(
      { error: 'Hubo un error. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}
