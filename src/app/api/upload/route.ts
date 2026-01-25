import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const solicitudId = formData.get('solicitud_id') as string
    const tipo = formData.get('tipo') as string || 'trabajo'

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      )
    }

    if (!solicitudId) {
      return NextResponse.json(
        { error: 'ID de solicitud requerido' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usa JPG, PNG o WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (máximo 5MB)' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const filename = `${solicitudId}/${tipo}_${timestamp}.${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('trabajos')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json(
        { error: 'Error al subir el archivo' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('trabajos')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el archivo' },
      { status: 500 }
    )
  }
}
