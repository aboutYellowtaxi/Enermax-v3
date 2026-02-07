import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validatePanelAuth } from '@/lib/auth-panel'

export async function GET(request: NextRequest) {
  if (!validatePanelAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    const { count: totalProfesionales } = await supabase
      .from('profesionales')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    const { count: solicitudesHoy } = await supabase
      .from('solicitudes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)

    const { count: solicitudesMes } = await supabase
      .from('solicitudes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)

    // Commission-based metrics
    const { data: completadas } = await supabase
      .from('solicitudes')
      .select('monto_total, comision_enermax')
      .eq('estado', 'completada')
      .gte('created_at', startOfMonth)

    const gmvMes = completadas?.reduce((acc, s) => acc + (s.monto_total || 0), 0) || 0
    const comisionesMes = completadas?.reduce((acc, s) => acc + (s.comision_enermax || 0), 0) || 0

    const { data: ratingsData } = await supabase
      .from('reviews')
      .select('calificacion')

    const avgRating = ratingsData && ratingsData.length > 0
      ? ratingsData.reduce((acc, r) => acc + r.calificacion, 0) / ratingsData.length
      : 0

    const { data: statusData } = await supabase
      .from('solicitudes')
      .select('estado')

    const estadosCounts = (statusData || []).reduce((acc: Record<string, number>, s) => {
      acc[s.estado] = (acc[s.estado] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      totalProfesionales: totalProfesionales || 0,
      solicitudesHoy: solicitudesHoy || 0,
      solicitudesMes: solicitudesMes || 0,
      gmvMes,
      comisionesMes,
      avgRating: avgRating.toFixed(1),
      estadosCounts,
    })
  } catch (error: any) {
    console.error('Metrics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
