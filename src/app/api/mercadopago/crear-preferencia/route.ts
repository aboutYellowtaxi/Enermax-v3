import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createServerClient } from '@/lib/supabase'
import { calculateFraudScore } from '@/lib/ai-matching'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      profesionalId,
      servicioId,
      servicioNombre,
      monto,
      comision,
      montoProfesional,
      cliente,
      cuponCodigo,
      descuento,
    } = body

    const supabase = createServerClient()

    // Fraud detection
    const fraudScore = calculateFraudScore({
      clienteEmail: cliente.email,
      clienteTelefono: cliente.telefono,
      direccion: cliente.direccion,
      monto,
      esNuevoUsuario: !cliente.authId,
      intentosPrevios: 0, // Would check from DB in production
    })

    // Create solicitud
    const { data: solicitud, error: solicitudError } = await supabase
      .from('solicitudes')
      .insert({
        cliente_auth_id: cliente.authId,
        profesional_id: profesionalId,
        servicio_id: servicioId,
        cliente_nombre: cliente.nombre,
        cliente_telefono: cliente.telefono,
        cliente_email: cliente.email,
        direccion: cliente.direccion,
        notas: cliente.notas,
        fecha_solicitada: cliente.fechaSolicitada || null,
        horario_preferido: cliente.horarioPreferido,
        monto_total: monto,
        comision_enermax: comision,
        monto_profesional: montoProfesional,
        cupon_id: null,
        descuento_aplicado: descuento || 0,
        estado: 'pendiente_pago',
        score_fraude: fraudScore.score,
      })
      .select()
      .single()

    if (solicitudError || !solicitud) {
      console.error('Error creating solicitud:', solicitudError)
      return NextResponse.json(
        { error: 'Error al crear la solicitud' },
        { status: 500 }
      )
    }

    // Update coupon usage if used
    if (cuponCodigo) {
      await supabase
        .from('cupones')
        .update({ usos_actuales: supabase.rpc('increment') })
        .eq('codigo', cuponCodigo)
    }

    // Create MercadoPago preference
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enermax.com.ar'

    const preferenceClient = new Preference(client)
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: solicitud.id,
            title: servicioNombre,
            description: `Servicio profesional - Enermax`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: monto,
          },
        ],
        payer: {
          name: cliente.nombre,
          email: cliente.email || 'cliente@enermax.com.ar',
          phone: {
            number: cliente.telefono,
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
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
    })

    // Create pago record
    await supabase.from('pagos').insert({
      solicitud_id: solicitud.id,
      mercadopago_preference_id: preference.id,
      monto,
      comision_mp: 0,
      estado: 'pendiente',
    })

    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      preference_id: preference.id,
      solicitud_id: solicitud.id,
    })
  } catch (error: any) {
    console.error('Error creating preference:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear preferencia' },
      { status: 500 }
    )
  }
}
