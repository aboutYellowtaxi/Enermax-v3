'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Phone, MessageSquare, Zap, MapPin, Truck, Wrench, Bookmark, Video } from 'lucide-react'
import Link from 'next/link'
import Chat from '@/components/Chat'
import VideoRecorder from '@/components/VideoRecorder'

const PROFESIONAL_TELEFONO = '1131449673'
const PROFESIONAL_NOMBRE = 'Leonel'

interface Solicitud {
  id: string
  estado: string
  created_at: string
  monto_total: number
  direccion: string
}

const PASOS = [
  { estado: 'pendiente', label: 'Recibida', icon: CheckCircle },
  { estado: 'aceptada', label: 'Contactado', icon: Phone },
  { estado: 'en_progreso', label: 'En curso', icon: Truck },
  { estado: 'completada', label: 'Listo', icon: Wrench },
]

function getStepIndex(estado: string): number {
  const idx = PASOS.findIndex(p => p.estado === estado)
  return idx >= 0 ? idx : 0
}

export default function SeguimientoPage({ params }: { params: { id: string } }) {
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/seguimiento/${params.id}`)
      const data = await res.json()
      if (data.solicitud) {
        setSolicitud(data.solicitud)
      } else {
        setNotFound(true)
      }
    } catch { /* retry */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (notFound || !solicitud) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Solicitud no encontrada</p>
        <Link href="/" className="text-blue-600 text-sm">Volver al inicio</Link>
      </div>
    )
  }

  const currentStep = getStepIndex(solicitud.estado)
  const esCancelada = solicitud.estado === 'cancelada'
  const esCompletada = solicitud.estado === 'completada'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Mi solicitud</span>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Mi solicitud Enermax', url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              }
            }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {saved ? 'Link copiado!' : 'Guardar'}
          </button>
        </div>
      </header>

      <main className="flex-1 pt-14 pb-4 px-4">
        <div className="max-w-lg mx-auto">

          {/* Professional card - the first thing they see */}
          <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{PROFESIONAL_NOMBRE} V.</p>
                <p className="text-xs text-gray-500">Electricista matriculado · 5 años exp.</p>
              </div>
              <div className="flex gap-1.5">
                <a
                  href={`tel:+549${PROFESIONAL_TELEFONO}`}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <Phone className="w-4 h-4 text-gray-700" />
                </a>
                <a
                  href={`https://wa.me/549${PROFESIONAL_TELEFONO}?text=${encodeURIComponent(`Hola ${PROFESIONAL_NOMBRE}, agendé por Enermax (Ref: ${params.id.slice(0, 8)})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                </a>
              </div>
            </div>
          </div>

          {/* Progress bar - compact horizontal */}
          {!esCancelada && (
            <div className="bg-white rounded-2xl px-4 py-3 mb-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                {PASOS.map((paso, i) => {
                  const done = i <= currentStep
                  const isActive = i === currentStep && !esCompletada
                  const PasoIcon = paso.icon
                  return (
                    <div key={paso.estado} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        done ? 'bg-blue-600' : 'bg-gray-200'
                      } ${isActive ? 'ring-2 ring-blue-200' : ''}`}>
                        <PasoIcon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-[10px] ${done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {paso.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Progress line */}
              <div className="flex gap-1">
                {PASOS.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full ${i <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status message for special states */}
          {esCancelada && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-3 text-center">
              <p className="font-semibold text-red-700 text-sm">Solicitud cancelada</p>
              <p className="text-xs text-red-500 mt-1">Podés agendar una nueva visita cuando quieras.</p>
              <Link href="/" className="inline-block mt-3 text-sm text-blue-600 font-medium">Agendar de nuevo</Link>
            </div>
          )}

          {esCompletada && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-3 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-emerald-700 text-sm">Trabajo completado</p>
              <p className="text-xs text-emerald-600 mt-1">Gracias por confiar en Enermax.</p>
            </div>
          )}

          {/* Chat - THE MAIN THING */}
          <div className="mb-3">
            <Chat solicitudId={params.id} autorTipo="cliente" />
          </div>

          {/* Video recorder - "Mostrá tu problema" */}
          {!esCancelada && !esCompletada && (
            <div className="mb-3">
              <VideoRecorder solicitudId={params.id} />
            </div>
          )}

          {/* Address */}
          {solicitud.direccion && solicitud.direccion !== 'Sin especificar' && (
            <div className="bg-white rounded-2xl px-4 py-3 mb-3 border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{solicitud.direccion}</span>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="text-center space-y-2 mt-4">
            <p className="text-xs text-gray-400">
              Ref: {solicitud.id.slice(0, 8)} · Se actualiza automáticamente
            </p>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
