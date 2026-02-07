import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createServerClient } from '@/lib/supabase'
import { notificarNuevoCliente } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const PRECIO_DIAGNOSTICO = 10000
const COMISION_ENERMAX = 0.15

export async function POST(request: NextRequest) {
  try {
    const { telefono, direccion, descripcion, lat, lng } = await request.json()

    if (!telefono || !direccion) {
      return NextResponse.json(
        { error: 'Necesitamos tu teléfono y ubicación' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enermax-steel.vercel.app'
    const comision = Math.round(PRECIO_DIAGNOSTICO * COMISION_ENERMAX)
    const montoProfesional = PRECIO_DIAGNOSTICO - comision

    // Create solicitud in DB
    const { data: solicitud, error: dbError } = await supabase
      .from('solicitudes')
      .insert({
        cliente_nombre: telefono, // Use phone as identifier (nombre is NOT NULL in schema)
        cliente_telefono: telefono,
        cliente_email: `lead-${Date.now()}@enermax.app`,
        direccion,
        lat: lat || null,
        lng: lng || null,
        notas: descripcion || 'Visita diagnóstico eléctrico',
        monto_total: PRECIO_DIAGNOSTICO,
        comision_enermax: comision,
        monto_profesional: montoProfesional,
        estado: 'pendiente_pago',
        score_fraude: 0,
      })
      .select('id')
      .single()

    if (dbError || !solicitud) {
      console.error('DB Error:', dbError)
      return NextResponse.json(
        { error: `Error DB: ${dbError?.message || 'sin datos'} (code: ${dbError?.code || 'N/A'})` },
        { status: 500 }
      )
    }

    // Create MercadoPago preference
    const preferenceClient = new Preference(client)
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: solicitud.id,
            title: 'Visita Diagnóstico Eléctrico - Enermax',
            description: `Electricista matriculado visita tu domicilio`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: PRECIO_DIAGNOSTICO,
          },
        ],
        payer: {
          email: `lead-${Date.now()}@enermax.app`,
          phone: { number: telefono },
        },
        back_urls: {
          success: `${appUrl}/seguimiento/${solicitud.id}?pago=ok`,
          failure: `${appUrl}/pago/error?solicitud=${solicitud.id}`,
          pending: `${appUrl}/pago/pendiente?solicitud=${solicitud.id}`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        statement_descriptor: 'ENERMAX',
        external_reference: solicitud.id,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })

    if (!preference.init_point) {
      return NextResponse.json(
        { error: 'Error al generar el link de pago. Intentá de nuevo.' },
        { status: 500 }
      )
    }

    // Create pago record
    await supabase.from('pagos').insert({
      solicitud_id: solicitud.id,
      mercadopago_preference_id: preference.id,
      monto: PRECIO_DIAGNOSTICO,
      comision_mp: 0,
      estado: 'pendiente',
    })

    // Create initial chat message
    await supabase.from('chat_mensajes').insert({
      solicitud_id: solicitud.id,
      autor_tipo: 'sistema',
      mensaje: 'Solicitud creada. Completá el pago para confirmar. El profesional te va a contactar por este chat.',
      leido: false,
    })

    // Notify admin (non-blocking)
    notificarNuevoCliente('nuevo_lead', {
      telefono,
      direccion,
      descripcion,
      solicitudId: solicitud.id,
      monto: PRECIO_DIAGNOSTICO,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      solicitud_id: solicitud.id,
    })
  } catch (error: any) {
    console.error('Error in /api/agendar:', error)
    return NextResponse.json(
      { error: 'Hubo un error. Por favor intentá de nuevo.' },
      { status: 500 }
    )
  }
}
