'use client'

import { useState, useRef } from 'react'
import { Video, Square, Send, X, Camera, Loader2 } from 'lucide-react'

interface VideoRecorderProps {
  solicitudId: string
}

export default function VideoRecorder({ solicitudId }: VideoRecorderProps) {
  const [mode, setMode] = useState<'idle' | 'recording' | 'preview' | 'sending'>('idle')
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [sent, setSent] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const blobRef = useRef<Blob | null>(null)

  const startRecording = async () => {
    setError('')
    setSent(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      chunksRef.current = []
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' })
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        blobRef.current = blob
        if (previewRef.current) {
          previewRef.current.src = URL.createObjectURL(blob)
        }
        setMode('preview')
      }

      recorder.start(1000)
      setMode('recording')
      setSeconds(0)

      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 59) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    blobRef.current = null
    setMode('idle')
    setSeconds(0)
  }

  const sendVideo = async () => {
    if (!blobRef.current) return
    setMode('sending')

    try {
      // Upload video
      const formData = new FormData()
      formData.append('file', blobRef.current, `video-${Date.now()}.webm`)
      formData.append('solicitudId', solicitudId)

      const uploadRes = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (uploadData.url) {
        // Send as chat message
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solicitudId,
            autorTipo: 'cliente',
            mensaje: '📹 Video del problema enviado',
            archivoUrl: uploadData.url,
          }),
        })
        setSent(true)
        blobRef.current = null
        setMode('idle')
      } else {
        setError('Error al subir el video. Intentá de nuevo.')
        setMode('preview')
      }
    } catch {
      setError('Error al enviar. Intentá de nuevo.')
      setMode('preview')
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
        <p className="text-emerald-700 font-medium text-sm">Video enviado al profesional</p>
        <button onClick={() => setSent(false)} className="text-xs text-emerald-600 mt-2 underline">
          Grabar otro
        </button>
      </div>
    )
  }

  // Idle state
  if (mode === 'idle') {
    return (
      <div>
        <button
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50
                     text-gray-700 font-semibold text-sm py-3.5 rounded-2xl transition-colors
                     border border-gray-200"
        >
          <Camera className="w-4 h-4" />
          Grabar video del problema
        </button>
        {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
      </div>
    )
  }

  // Recording state
  if (mode === 'recording') {
    return (
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="relative aspect-video">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {/* Timer */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {formatTime(seconds)}
          </div>
          <div className="absolute top-3 right-3 text-white text-xs bg-black/50 px-2 py-1 rounded-full">
            Máx 60s
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 p-3">
          <button
            onClick={cancel}
            className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={stopRecording}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Square className="w-5 h-5 fill-white" />
          </button>
        </div>
      </div>
    )
  }

  // Preview state
  if (mode === 'preview') {
    return (
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="aspect-video">
          <video ref={previewRef} controls playsInline className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center justify-center gap-3 p-3">
          <button
            onClick={cancel}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold text-sm py-3 rounded-xl"
          >
            <X className="w-4 h-4" />
            Descartar
          </button>
          <button
            onClick={sendVideo}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
        {error && <p className="text-red-400 text-xs text-center pb-2">{error}</p>}
      </div>
    )
  }

  // Sending state
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Enviando video...</p>
    </div>
  )
}
