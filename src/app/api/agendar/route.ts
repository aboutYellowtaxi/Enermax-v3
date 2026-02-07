import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createServerClient } from '@/lib/supabase'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const PRECIO_DIAGNOSTICO = 10000
const COMISION_ENERMAX = 0.15 // 15%
const PROFESIONAL_TELEFONO = '5491131449673'
const PROFESIONAL_NOMBRE = 'Leonel Vivas'

export async function POST(request: NextRequest) {
  try {
    const { nombre, telefono, direccion, descripcion } = await request.json()

    if (!nombre || !telefono || !direccion) {
      return NextResponse.json(
        { error: 'Completá nombre, teléfono y dirección' },
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
        cliente_nombre: nombre,
        cliente_telefono: telefono,
        cliente_email: `lead-${Date.now()}@enermax.com.ar`,
        direccion,
        notas: descripcion || 'Visita diagnóstico eléctrico',
        monto_total: PRECIO_DIAGNOSTICO,
        comision_enermax: comision,
        monto_profesional: montoProfesional,
        estado: 'pendiente_pago',
        score_fraude: 0,
      })
      .select()
      .single()

    if (dbError || !solicitud) {
      console.error('DB Error:', dbError)
      return NextResponse.json(
        { error: 'Error al crear la solicitud' },
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
            description: `Electricista verificado visita tu domicilio. ${direccion}`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: PRECIO_DIAGNOSTICO,
          },
        ],
        payer: {
          name: nombre,
          email: `lead-${Date.now()}@enermax.com.ar`,
          phone: {
            number: telefono,
          },
        },
        back_urls: {
          success: `${appUrl}/pago/exito?solicitud=${solicitud.id}`,
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

    // Create pago record
    await supabase.from('pagos').insert({
      solicitud_id: solicitud.id,
      mercadopago_preference_id: preference.id,
      monto: PRECIO_DIAGNOSTICO,
      comision_mp: 0,
      estado: 'pendiente',
    })

    // Notify professional via WhatsApp API (URL scheme for now)
    // In production, use Twilio/WhatsApp Business API
    console.log(
      `[ENERMAX] Nuevo pedido! Cliente: ${nombre}, Tel: ${telefono}, Dir: ${direccion}. ` +
      `Notificar a ${PROFESIONAL_NOMBRE} (${PROFESIONAL_TELEFONO})`
    )

    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      solicitud_id: solicitud.id,
    })
  } catch (error: any) {
    console.error('Error in /api/agendar:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar' },
      { status: 500 }
    )
  }
}
