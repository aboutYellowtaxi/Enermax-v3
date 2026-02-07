'use client'

import { useState, useEffect } from 'react'
import { Zap, Phone, MapPin, MessageSquare, Clock, CheckCircle, RefreshCw, AlertCircle, Truck, Wrench, X } from 'lucide-react'

interface Solicitud {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  direccion: string
  notas: string
  monto_total: number
  estado: string
  created_at: string
}

const ESTADOS_FLOW = [
  { estado: 'aceptada', label: 'Contacté', icon: Phone, color: 'bg-blue-600 text-white hover:bg-blue-700' },
  { estado: 'en_progreso', label: 'En camino', icon: Truck, color: 'bg-amber-500 text-white hover:bg-amber-600' },
  { estado: 'completada', label: 'Terminado', icon: Wrench, color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
]

export default function PanelPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchSolicitudes = async () => {
    setError('')
    try {
      const res = await fetch('/api/panel')
      const data = await res.json()
      if (data.solicitudes) {
        setSolicitudes(data.solicitudes)
      } else {
        setError(data.error || 'Error al cargar')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSolicitudes()
    const interval = setInterval(fetchSolicitudes, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateEstado = async (solicitudId: string, nuevoEstado: string) => {
    setUpdating(solicitudId)
    try {
      const res = await fetch('/api/panel/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitud_id: solicitudId, estado: nuevoEstado }),
      })
      const data = await res.json()
      if (data.success) {
        setSolicitudes(prev =>
          prev.map(s => s.id === solicitudId ? { ...s, estado: nuevoEstado } : s)
        )
      }
    } catch {
      // silent fail, user can retry
    }
    setUpdating(null)
  }

  const estadoConfig: Record<string, { label: string, color: string, icon: typeof Clock }> = {
    pendiente: { label: 'Nuevo', color: 'text-blue-600 bg-blue-50', icon: Clock },
    pendiente_pago: { label: 'Pendiente pago', color: 'text-amber-600 bg-amber-50', icon: Clock },
    aceptada: { label: 'Contactado', color: 'text-indigo-600 bg-indigo-50', icon: Phone },
    en_progreso: { label: 'En curso', color: 'text-amber-600 bg-amber-50', icon: Truck },
    completada: { label: 'Completado', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
    cancelada: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  }

  const getNextAction = (estado: string) => {
    if (estado === 'pendiente') return ESTADOS_FLOW[0] // → Contacté
    if (estado === 'aceptada') return ESTADOS_FLOW[1]  // → En camino
    if (estado === 'en_progreso') return ESTADOS_FLOW[2] // → Terminado
    return null
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  const nuevos = solicitudes.filter(s => s.estado === 'pendiente' || s.estado === 'pendiente_pago')
  const enProceso = solicitudes.filter(s => s.estado === 'aceptada' || s.estado === 'en_progreso')
  const terminados = solicitudes.filter(s => s.estado === 'completada' || s.estado === 'cancelada')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Panel Enermax</span>
          </div>
          <button
            onClick={fetchSolicitudes}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{nuevos.length}</p>
            <p className="text-xs text-gray-500">Nuevos</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-2xl font-bold text-amber-600">{enProceso.length}</p>
            <p className="text-xs text-gray-500">En proceso</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-2xl font-bold text-emerald-600">{terminados.length}</p>
            <p className="text-xs text-gray-500">Terminados</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && solicitudes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-1">No hay solicitudes todavía</p>
            <p className="text-xs text-gray-300">Se actualiza cada 30 segundos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.map((s) => {
              const config = estadoConfig[s.estado] || estadoConfig.pendiente
              const StatusIcon = config.icon
              const tel = s.cliente_telefono.replace(/[\s\-\(\)]/g, '')
              const whatsappUrl = `https://wa.me/549${tel}?text=${encodeURIComponent(
                'Hola, soy Leonel de Enermax. Recibí tu solicitud de diagnóstico eléctrico. ¿Cuándo te queda bien coordinar la visita?'
              )}`
              const nextAction = getNextAction(s.estado)
              const esGratis = s.monto_total === 0
              const isUpdating = updating === s.id

              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {/* Status + date + type */}
                  <div className="flex items-center justify-between px-4 pt-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      {esGratis ? (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Gratis</span>
                      ) : (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          ${s.monto_total?.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(s.created_at)}</span>
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:+549${tel}`} className="text-sm font-medium text-blue-600">{s.cliente_telefono}</a>
                    </div>
                    {s.direccion && s.direccion !== 'Sin especificar' && (
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{s.direccion}</span>
                      </div>
                    )}
                    {s.notas && !['Visita diagnóstico eléctrico', 'Consulta / Agendamiento sin pago'].includes(s.notas) && (
                      <p className="text-xs text-gray-500 mt-1 ml-5">{s.notas}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-3 space-y-2">
                    {/* Contact buttons */}
                    <div className="flex gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:+549${tel}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800
                                   text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Llamar
                      </a>
                    </div>

                    {/* Next status action */}
                    {nextAction && (
                      <button
                        onClick={() => updateEstado(s.id, nextAction.estado)}
                        disabled={isUpdating}
                        className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 ${nextAction.color}`}
                      >
                        <nextAction.icon className="w-4 h-4" />
                        {isUpdating ? 'Actualizando...' : `Marcar: ${nextAction.label}`}
                      </button>
                    )}

                    {/* Cancel option for active ones */}
                    {['pendiente', 'aceptada', 'en_progreso'].includes(s.estado) && (
                      <button
                        onClick={() => updateEstado(s.id, 'cancelada')}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 py-1.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancelar solicitud
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
