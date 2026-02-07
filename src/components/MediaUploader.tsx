'use client'

import { useState, useRef } from 'react'
import { Camera, Image, Send, X, Loader2 } from 'lucide-react'

interface MediaUploaderProps {
  solicitudId: string
}

export default function MediaUploader({ solicitudId }: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    // Limit: 20MB
    if (f.size > 20 * 1024 * 1024) {
      setError('Archivo muy grande (máx 20MB)')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const sendMedia = async () => {
    if (!file) return
    setSending(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('solicitudId', solicitudId)

      const uploadRes = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (uploadData.url) {
        const isVideo = file.type.startsWith('video/')
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solicitudId,
            autorTipo: 'cliente',
            mensaje: isVideo ? '📹 Video del problema' : '📷 Foto del problema',
            archivoUrl: uploadData.url,
          }),
        })
        setSent(true)
        clear()
      } else {
        setError(uploadData.error || 'Error al subir')
      }
    } catch {
      setError('Error al enviar. Intentá de nuevo.')
    }
    setSending(false)
  }

  const isVideo = file?.type.startsWith('video/')

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
        <p className="text-emerald-700 font-medium text-sm">Archivo enviado al profesional</p>
        <button onClick={() => setSent(false)} className="text-xs text-emerald-600 mt-2 underline">
          Enviar otro
        </button>
      </div>
    )
  }

  // Has file selected - show preview
  if (file && preview) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="relative aspect-video bg-gray-100">
          {isVideo ? (
            <video src={preview} controls playsInline className="w-full h-full object-contain" />
          ) : (
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          )}
        </div>
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={clear}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold text-sm py-3 rounded-xl"
          >
            <X className="w-4 h-4" />
            Descartar
          </button>
          <button
            onClick={sendMedia}
            disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs text-center pb-3">{error}</p>}
      </div>
    )
  }

  // No file - show upload button
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50
                   text-gray-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors
                   border border-gray-200"
      >
        <Camera className="w-4 h-4" />
        Enviar foto o video del problema
      </button>
      {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
    </div>
  )
}
