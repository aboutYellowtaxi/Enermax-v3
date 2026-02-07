import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validatePanelAuth } from '@/lib/auth-panel'

export async function GET(request: NextRequest) {
  if (!validatePanelAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('solicitudes')
      .select('id, cliente_nombre, cliente_telefono, direccion, notas, monto_total, comision_enermax, estado, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ solicitudes: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
