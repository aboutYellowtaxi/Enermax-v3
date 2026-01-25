import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generarCodigoReferido, RECOMPENSA_REFERIDO } from '@/lib/constants'

// GET - Get referral code for user or create one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuario_id')

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuario_id requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if user has a code
    let { data: codigoData } = await supabase
      .from('codigos_referido')
      .select('*')
      .eq('usuario_auth_id', usuarioId)
      .single()

    // Create code if doesn't exist
    if (!codigoData) {
      const codigo = generarCodigoReferido()

      const { data: newCodigo, error } = await supabase
        .from('codigos_referido')
        .insert({
          usuario_auth_id: usuarioId,
          codigo,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      codigoData = newCodigo
    }

    // Get referrals made
    const { data: referidos } = await supabase
      .from('referidos')
      .select('*')
      .eq('referente_auth_id', usuarioId)

    return NextResponse.json({
      codigo: codigoData,
      referidos: referidos || [],
      totalGanado: codigoData.monto_ganado,
      totalReferidos: codigoData.usos_totales,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Apply referral code
export async function POST(request: NextRequest) {
  try {
    const { codigoReferido, referidoAuthId } = await request.json()

    if (!codigoReferido || !referidoAuthId) {
      return NextResponse.json(
        { error: 'Código y usuario requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Find the referral code
    const { data: codigo } = await supabase
      .from('codigos_referido')
      .select('*')
      .eq('codigo', codigoReferido.toUpperCase())
      .single()

    if (!codigo) {
      return NextResponse.json({ error: 'Código no válido' }, { status: 404 })
    }

    // Check if user is trying to use their own code
    if (codigo.usuario_auth_id === referidoAuthId) {
      return NextResponse.json(
        { error: 'No podés usar tu propio código' },
        { status: 400 }
      )
    }

    // Check if user already used a code
    const { data: existing } = await supabase
      .from('referidos')
      .select('id')
      .eq('referido_auth_id', referidoAuthId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya usaste un código de referido' },
        { status: 400 }
      )
    }

    // Create referral record
    const { error: refError } = await supabase.from('referidos').insert({
      referente_auth_id: codigo.usuario_auth_id,
      referido_auth_id: referidoAuthId,
      codigo_usado: codigoReferido.toUpperCase(),
      monto_recompensa: RECOMPENSA_REFERIDO,
    })

    if (refError) {
      return NextResponse.json({ error: refError.message }, { status: 500 })
    }

    // Update code stats
    await supabase
      .from('codigos_referido')
      .update({
        usos_totales: codigo.usos_totales + 1,
      })
      .eq('id', codigo.id)

    return NextResponse.json({
      success: true,
      message: `Código aplicado. Recibirás ${RECOMPENSA_REFERIDO} ARS de descuento en tu primer servicio.`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Complete referral (after first purchase)
export async function PATCH(request: NextRequest) {
  try {
    const { referidoAuthId } = await request.json()

    const supabase = createServerClient()

    // Find pending referral
    const { data: referido } = await supabase
      .from('referidos')
      .select('*, codigo:codigos_referido(*)')
      .eq('referido_auth_id', referidoAuthId)
      .eq('estado', 'pendiente')
      .single()

    if (!referido) {
      return NextResponse.json({ error: 'No hay referido pendiente' }, { status: 404 })
    }

    // Mark as completed
    await supabase
      .from('referidos')
      .update({ estado: 'completado' })
      .eq('id', referido.id)

    // Update referrer's earnings
    await supabase
      .from('codigos_referido')
      .update({
        monto_ganado: (referido.codigo?.monto_ganado || 0) + RECOMPENSA_REFERIDO,
      })
      .eq('usuario_auth_id', referido.referente_auth_id)

    // Notify referrer
    await supabase.from('notificaciones').insert({
      usuario_auth_id: referido.referente_auth_id,
      tipo: 'sistema',
      titulo: '¡Ganaste una recompensa!',
      mensaje: `Tu referido completó su primer servicio. Ganaste $${RECOMPENSA_REFERIDO}`,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
