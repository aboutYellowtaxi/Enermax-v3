'use client'

import { useState, useEffect } from 'react'
import { Zap, Phone, MapPin, MessageSquare, Clock, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'

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

export default function PanelPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSolicitudes = async () => {
    setLoading(true)
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
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSolicitudes, 30000)
    return () => clearInterval(interval)
  }, [])

  const estadoConfig: Record<string, { label: string, color: string, icon: typeof Clock }> = {
    pendiente_pago: { label: 'Pendiente de pago', color: 'text-amber-600 bg-amber-50', icon: Clock },
    pendiente: { label: 'Pago confirmado', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
    aceptada: { label: 'Aceptada', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
    en_progreso: { label: 'En progreso', color: 'text-blue-600 bg-blue-50', icon: Clock },
    completada: { label: 'Completada', color: 'text-gray-600 bg-gray-50', icon: CheckCircle },
    cancelada: { label: 'Cancelada', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

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
            <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-2xl font-bold text-emerald-600">
              {solicitudes.filter(s => s.estado === 'pendiente').length}
            </p>
            <p className="text-xs text-gray-500">Pagados</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-2xl font-bold text-amber-600">
              {solicitudes.filter(s => s.estado === 'pendiente_pago').length}
            </p>
            <p className="text-xs text-gray-500">Pendientes</p>
          </div>
        </div>

        {/* List */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}

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
              const config = estadoConfig[s.estado] || estadoConfig.pendiente_pago
              const StatusIcon = config.icon
              const tel = s.cliente_telefono.replace(/[\s\-\(\)]/g, '')
              const whatsappUrl = `https://wa.me/549${tel}?text=${encodeURIComponent(
                'Hola, soy Leonel de Enermax. Recibí tu solicitud de diagnóstico eléctrico. ¿Cuándo te queda bien coordinar la visita?'
              )}`

              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {/* Status + date */}
                  <div className="flex items-center justify-between px-4 pt-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(s.created_at)}</span>
                  </div>

                  {/* Info */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:+549${tel}`} className="text-sm font-medium text-blue-600">{s.cliente_telefono}</a>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{s.direccion}</span>
                    </div>
                    {s.notas && s.notas !== 'Visita diagnóstico eléctrico' && (
                      <p className="text-xs text-gray-500 mt-1 pl-5">{s.notas}</p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      ${s.monto_total?.toLocaleString('es-AR')}
                    </p>
                  </div>

                  {/* Actions */}
                  {s.estado === 'pendiente' && (
                    <div className="flex gap-2 px-4 pb-3">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white
                                   text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
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
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
