import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const solicitudId = formData.get('solicitudId') as string | null

    if (!file || !solicitudId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Limit file size to 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'El video es muy grande (máx 20MB)' }, { status: 400 })
    }

    const supabase = createServerClient()

    const fileName = `${solicitudId}/${Date.now()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, buffer, {
        contentType: file.type || 'video/webm',
        upsert: false,
      })

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json(
        { error: 'Error al subir el video. Verificá que el bucket "videos" exista en Supabase Storage.' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir' }, { status: 500 })
  }
}
