'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface PhotoUploadProps {
  solicitudId: string
  tipo: 'trabajo' | 'diagnostico'
  maxFotos?: number
  onFotosChange: (urls: string[]) => void
  initialFotos?: string[]
}

export default function PhotoUpload({
  solicitudId,
  tipo,
  maxFotos = 5,
  onFotosChange,
  initialFotos = [],
}: PhotoUploadProps) {
  const [fotos, setFotos] = useState<string[]>(initialFotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (fotos.length + files.length > maxFotos) {
      setError(`Máximo ${maxFotos} fotos`)
      return
    }

    setError('')
    setUploading(true)

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('solicitud_id', solicitudId)
        formData.append('tipo', tipo)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Error al subir')
        }

        setFotos((prev) => {
          const updated = [...prev, data.url]
          onFotosChange(updated)
          return updated
        })
      } catch (err: any) {
        setError(err.message)
      }
    }

    setUploading(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    setFotos((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      onFotosChange(updated)
      return updated
    })
  }

  return (
    <div>
      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {fotos.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-dark-800">
            <Image
              src={url}
              alt={`Foto ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-dark-900/80 rounded-full flex items-center justify-center text-dark-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {fotos.length < maxFotos && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-dark-700 flex flex-col items-center justify-center text-dark-500 hover:border-primary-500/50 hover:text-primary-400 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">Agregar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Success indicator */}
      {fotos.length > 0 && !error && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          {fotos.length} foto{fotos.length !== 1 ? 's' : ''} subida{fotos.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
