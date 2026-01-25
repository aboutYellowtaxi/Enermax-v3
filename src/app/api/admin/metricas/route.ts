import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get various metrics
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    // Total professionals
    const { count: totalProfesionales } = await supabase
      .from('profesionales')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    // Total clients (unique from solicitudes)
    const { count: totalClientes } = await supabase
      .from('solicitudes')
      .select('cliente_auth_id', { count: 'exact', head: true })
      .not('cliente_auth_id', 'is', null)

    // Solicitudes today
    const { count: solicitudesHoy } = await supabase
      .from('solicitudes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)

    // Solicitudes this month
    const { count: solicitudesMes } = await supabase
      .from('solicitudes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)

    // GMV this month (confirmed payments)
    const { data: pagosData } = await supabase
      .from('pagos')
      .select('monto')
      .eq('estado', 'liberado')
      .gte('created_at', startOfMonth)

    const gmvMes = pagosData?.reduce((acc, p) => acc + p.monto, 0) || 0

    // Comisiones this month
    const { data: comisionesData } = await supabase
      .from('solicitudes')
      .select('comision_enermax')
      .eq('estado', 'confirmada')
      .gte('created_at', startOfMonth)

    const comisionesMes = comisionesData?.reduce((acc, s) => acc + s.comision_enermax, 0) || 0

    // Average rating
    const { data: ratingsData } = await supabase
      .from('reviews')
      .select('calificacion')

    const avgRating = ratingsData && ratingsData.length > 0
      ? ratingsData.reduce((acc, r) => acc + r.calificacion, 0) / ratingsData.length
      : 0

    // Solicitudes by status
    const { data: statusData } = await supabase
      .from('solicitudes')
      .select('estado')

    const estadosCounts = (statusData || []).reduce((acc: Record<string, number>, s) => {
      acc[s.estado] = (acc[s.estado] || 0) + 1
      return acc
    }, {})

    // New professionals this month
    const { count: nuevosProfesionales } = await supabase
      .from('profesionales')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)

    return NextResponse.json({
      totalProfesionales: totalProfesionales || 0,
      totalClientes: totalClientes || 0,
      solicitudesHoy: solicitudesHoy || 0,
      solicitudesMes: solicitudesMes || 0,
      gmvMes,
      comisionesMes,
      avgRating: avgRating.toFixed(1),
      estadosCounts,
      nuevosProfesionales: nuevosProfesionales || 0,
    })
  } catch (error: any) {
    console.error('Metrics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
