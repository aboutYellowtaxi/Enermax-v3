import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createServerClient } from '@/lib/supabase'
import { notificarNuevoCliente } from '@/lib/email'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Only process payment notifications
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    // Get payment details from MercadoPago
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const solicitudId = payment.external_reference
    const supabase = createServerClient()

    // Get current solicitud
    const { data: solicitud } = await supabase
      .from('solicitudes')
      .select('*, profesional:profesionales(nombre, apellido)')
      .eq('id', solicitudId)
      .single()

    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud not found' }, { status: 404 })
    }

    // Handle payment status
    if (payment.status === 'approved') {
      // Update pago to retenido (escrow)
      await supabase
        .from('pagos')
        .update({
          mercadopago_payment_id: paymentId.toString(),
          mercadopago_status: payment.status,
          estado: 'retenido',
        })
        .eq('solicitud_id', solicitudId)

      // Update solicitud to pendiente (visible to professional)
      await supabase
        .from('solicitudes')
        .update({ estado: 'pendiente' })
        .eq('id', solicitudId)

      // Create notification for professional
      await supabase.from('notificaciones').insert({
        profesional_id: solicitud.profesional_id,
        tipo: 'nueva_solicitud',
        titulo: 'Nueva solicitud de trabajo',
        mensaje: `${solicitud.cliente_nombre} solicitó un servicio`,
        solicitud_id: solicitudId,
        leida: false,
        enviada_email: false,
        enviada_push: false,
      })

      // Send system message to chat
      await supabase.from('chat_mensajes').insert({
        solicitud_id: solicitudId,
        autor_tipo: 'sistema',
        mensaje: '¡Pago confirmado! El profesional fue notificado y te contactará pronto.',
        leido: false,
      })

      // Send email with WhatsApp link to contact client
      notificarNuevoCliente('pago_confirmado', {
        telefono: solicitud.cliente_telefono,
        direccion: solicitud.direccion,
        descripcion: solicitud.notas,
        solicitudId,
        monto: solicitud.monto_total,
      }).catch(() => {})

    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      // Update pago status
      await supabase
        .from('pagos')
        .update({
          mercadopago_payment_id: paymentId.toString(),
          mercadopago_status: payment.status,
        })
        .eq('solicitud_id', solicitudId)

      // Delete the solicitud (cleanup)
      await supabase
        .from('solicitudes')
        .delete()
        .eq('id', solicitudId)
    }

    return NextResponse.json({ received: true, status: payment.status })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// MercadoPago sends GET to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
