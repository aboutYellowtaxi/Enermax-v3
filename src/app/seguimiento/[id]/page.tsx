'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Phone, MessageSquare, ArrowLeft, Zap, User, MapPin, Truck, Wrench } from 'lucide-react'
import Link from 'next/link'

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
  {
    estado: 'pendiente',
    label: 'Solicitud recibida',
    descripcion: 'Recibimos tu solicitud. El profesional va a revisarla.',
    icon: CheckCircle,
  },
  {
    estado: 'aceptada',
    label: 'Te contactamos',
    descripcion: 'El profesional se comunicó con vos para coordinar.',
    icon: Phone,
  },
  {
    estado: 'en_progreso',
    label: 'Visita en curso',
    descripcion: 'El profesional está en camino o trabajando.',
    icon: Truck,
  },
  {
    estado: 'completada',
    label: 'Trabajo terminado',
    descripcion: 'El servicio fue completado.',
    icon: Wrench,
  },
]

function getStepIndex(estado: string): number {
  const idx = PASOS.findIndex(p => p.estado === estado)
  return idx >= 0 ? idx : 0
}

export default function SeguimientoPage({ params }: { params: { id: string } }) {
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/seguimiento/${params.id}`)
      const data = await res.json()
      if (data.solicitud) {
        setSolicitud(data.solicitud)
      } else {
        setNotFound(true)
      }
    } catch {
      // silently retry on next interval
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [params.id])

  const whatsappUrl = `https://wa.me/549${PROFESIONAL_TELEFONO}?text=${encodeURIComponent(
    `Hola ${PROFESIONAL_NOMBRE}, agendé una visita por Enermax (Ref: ${params.id.slice(0, 8)})`
  )}`

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (notFound || !solicitud) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Solicitud no encontrada</p>
        <Link href="/" className="text-blue-600 text-sm">Volver al inicio</Link>
      </div>
    )
  }

  const currentStep = getStepIndex(solicitud.estado)
  const esCancelada = solicitud.estado === 'cancelada'
  const esCompletada = solicitud.estado === 'completada'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Tu seguimiento</span>
          </div>
          <span className="text-xs text-gray-400">Ref: {solicitud.id.slice(0, 8)}</span>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-8 px-4">
        <div className="max-w-lg mx-auto">

          {/* Status hero */}
          <div className="text-center mb-8">
            {esCancelada ? (
              <>
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Solicitud cancelada</h1>
                <p className="text-sm text-gray-500">Podés agendar una nueva visita cuando quieras.</p>
              </>
            ) : esCompletada ? (
              <>
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Trabajo completado</h1>
                <p className="text-sm text-gray-500">Gracias por confiar en Enermax.</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  {currentStep === 0 && <Clock className="w-8 h-8 text-blue-500" />}
                  {currentStep === 1 && <Phone className="w-8 h-8 text-blue-500" />}
                  {currentStep === 2 && <Truck className="w-8 h-8 text-blue-500" />}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {PASOS[currentStep].label}
                </h1>
                <p className="text-sm text-gray-500">
                  {PASOS[currentStep].descripcion}
                </p>
              </>
            )}
          </div>

          {/* Timeline */}
          {!esCancelada && (
            <div className="mb-8">
              <div className="relative pl-8">
                {PASOS.map((paso, i) => {
                  const done = i <= currentStep
                  const active = i === currentStep && !esCompletada
                  const PasoIcon = paso.icon

                  return (
                    <div key={paso.estado} className="relative pb-6 last:pb-0">
                      {/* Line */}
                      {i < PASOS.length - 1 && (
                        <div
                          className={`absolute left-[-20px] top-8 w-0.5 h-full ${
                            i < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      {/* Dot */}
                      <div
                        className={`absolute left-[-28px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          done
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        } ${active ? 'ring-4 ring-blue-100' : ''}`}
                      >
                        {done && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      {/* Content */}
                      <div>
                        <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                          {paso.label}
                        </p>
                        {(done || active) && (
                          <p className="text-xs text-gray-500 mt-0.5">{paso.descripcion}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Professional card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">L</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{PROFESIONAL_NOMBRE} V.</p>
                <p className="text-xs text-gray-500">Electricista matriculado · 5 años exp.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700
                           text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:+549${PROFESIONAL_TELEFONO}`}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-100
                           text-gray-800 font-semibold text-sm py-3 rounded-xl border border-gray-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Llamar
              </a>
            </div>
          </div>

          {/* Info */}
          {solicitud.direccion && solicitud.direccion !== 'Sin especificar' && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 px-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{solicitud.direccion}</span>
            </div>
          )}

          <p className="text-xs text-gray-300 text-center mt-6 mb-4">
            Esta página se actualiza automáticamente
          </p>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-3">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-300">
          <Zap className="w-3 h-3" />
          <span>Enermax</span>
        </div>
      </footer>
    </div>
  )
}
