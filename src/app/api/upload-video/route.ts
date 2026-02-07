import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { ensureBucket } from '@/lib/storage'

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
      return NextResponse.json({ error: 'Archivo muy grande (máx 20MB)' }, { status: 400 })
    }

    // Auto-create bucket if it doesn't exist
    await ensureBucket('videos', true)

    const supabase = createServerClient()

    const ext = file.name.split('.').pop() || 'bin'
    const fileName = `${solicitudId}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
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
