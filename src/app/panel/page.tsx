'use client'

import { useState, useEffect } from 'react'
import { Zap, Phone, MapPin, MessageSquare, Clock, CheckCircle, RefreshCw, AlertCircle, Truck, Wrench, X, Undo2, ChevronDown, DollarSign, Lock } from 'lucide-react'
import Chat from '@/components/Chat'

interface Solicitud {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  direccion: string
  notas: string
  monto_total: number
  comision_enermax: number
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
  const [expandedChat, setExpandedChat] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [secretInput, setSecretInput] = useState('')
  const [completarModal, setCompletarModal] = useState<string | null>(null)
  const [montoTrabajo, setMontoTrabajo] = useState('')

  // Check auth on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('panel_secret')
    if (stored) {
      setSecret(stored)
      setAuthed(true)
    }
  }, [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (secretInput.trim()) {
      sessionStorage.setItem('panel_secret', secretInput.trim())
      setSecret(secretInput.trim())
      setAuthed(true)
    }
  }

  const headers = () => ({
    'Content-Type': 'application/json',
    'x-panel-secret': secret,
  })

  const fetchSolicitudes = async () => {
    setError('')
    try {
      const res = await fetch('/api/panel', { headers: { 'x-panel-secret': secret } })
      if (res.status === 401) {
        sessionStorage.removeItem('panel_secret')
        setAuthed(false)
        setSecret('')
        return
      }
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
    if (!authed) return
    fetchSolicitudes()
    const interval = setInterval(fetchSolicitudes, 10000)
    return () => clearInterval(interval)
  }, [authed, secret])

  const updateEstado = async (solicitudId: string, nuevoEstado: string, monto?: number) => {
    setUpdating(solicitudId)
    try {
      const body: any = { solicitud_id: solicitudId, estado: nuevoEstado }
      if (monto) body.monto_trabajo = monto
      const res = await fetch('/api/panel/estado', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      })
      if (res.status === 401) {
        sessionStorage.removeItem('panel_secret')
        setAuthed(false)
        return
      }
      const data = await res.json()
      if (data.success) {
        setSolicitudes(prev =>
          prev.map(s => s.id === solicitudId ? {
            ...s,
            estado: nuevoEstado,
            ...(monto ? { monto_total: monto, comision_enermax: Math.round(monto * 0.15) } : {}),
          } : s)
        )
      }
    } catch { /* silent */ }
    setUpdating(null)
    setCompletarModal(null)
    setMontoTrabajo('')
  }

  const estadoConfig: Record<string, { label: string, color: string, icon: typeof Clock }> = {
    pendiente: { label: 'Nuevo', color: 'text-blue-600 bg-blue-50', icon: Clock },
    aceptada: { label: 'Contactado', color: 'text-indigo-600 bg-indigo-50', icon: Phone },
    en_progreso: { label: 'En curso', color: 'text-amber-600 bg-amber-50', icon: Truck },
    completada: { label: 'Completado', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
    cancelada: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  }

  const getNextAction = (estado: string) => {
    if (estado === 'pendiente') return ESTADOS_FLOW[0]
    if (estado === 'aceptada') return ESTADOS_FLOW[1]
    if (estado === 'en_progreso') return ESTADOS_FLOW[2]
    return null
  }

  const getPrevEstado = (estado: string): string | null => {
    if (estado === 'aceptada') return 'pendiente'
    if (estado === 'en_progreso') return 'aceptada'
    if (estado === 'completada') return 'en_progreso'
    if (estado === 'cancelada') return 'pendiente'
    return null
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  // Auth screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Panel Enermax</h1>
            <p className="text-sm text-gray-500">Ingresá la contraseña</p>
          </div>
          <input
            type="password"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="Contraseña del panel"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  const nuevos = solicitudes.filter(s => s.estado === 'pendiente')
  const enProceso = solicitudes.filter(s => s.estado === 'aceptada' || s.estado === 'en_progreso')
  const terminados = solicitudes.filter(s => s.estado === 'completada' || s.estado === 'cancelada')

  // Commission totals
  const comisionTotal = solicitudes
    .filter(s => s.estado === 'completada' && s.comision_enermax > 0)
    .reduce((acc, s) => acc + s.comision_enermax, 0)
  const facturacionTotal = solicitudes
    .filter(s => s.estado === 'completada' && s.monto_total > 0)
    .reduce((acc, s) => acc + s.monto_total, 0)

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
        <div className="grid grid-cols-3 gap-3 mb-4">
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

        {/* Commission summary */}
        {facturacionTotal > 0 && (
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Facturación total</p>
              <p className="text-lg font-bold text-gray-900">${facturacionTotal.toLocaleString('es-AR')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Comisión Enermax (15%)</p>
              <p className="text-lg font-bold text-blue-600">${comisionTotal.toLocaleString('es-AR')}</p>
            </div>
          </div>
        )}

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
            <p className="text-xs text-gray-300">Se actualiza cada 10 segundos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.map((s) => {
              const config = estadoConfig[s.estado] || estadoConfig.pendiente
              const StatusIcon = config.icon
              const tel = s.cliente_telefono.replace(/[\s\-\(\)]/g, '')
              const whatsappUrl = `https://wa.me/549${tel}?text=${encodeURIComponent(
                'Hola, soy Leonel de Enermax. Recibí tu solicitud. ¿Cuándo te queda bien coordinar la visita?'
              )}`
              const nextAction = getNextAction(s.estado)
              const prevEstado = getPrevEstado(s.estado)
              const isUpdating = updating === s.id

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
                    {s.direccion && s.direccion !== 'Sin especificar' && (
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{s.direccion}</span>
                      </div>
                    )}
                    {s.notas && !['Consulta / Agendamiento', 'Consulta / Agendamiento sin pago'].includes(s.notas) && (
                      <p className="text-xs text-gray-500 mt-1 ml-5">{s.notas}</p>
                    )}
                    {/* Show financials for completed jobs */}
                    {s.estado === 'completada' && s.monto_total > 0 && (
                      <div className="flex items-center gap-3 mt-2 ml-5 text-xs">
                        <span className="text-gray-500">Cobrado: <strong className="text-gray-900">${s.monto_total.toLocaleString('es-AR')}</strong></span>
                        <span className="text-blue-600">Comisión: <strong>${s.comision_enermax.toLocaleString('es-AR')}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-3 space-y-2">
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
                      nextAction.estado === 'completada' ? (
                        <button
                          onClick={() => setCompletarModal(s.id)}
                          disabled={isUpdating}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 ${nextAction.color}`}
                        >
                          <nextAction.icon className="w-4 h-4" />
                          Marcar: Terminado
                        </button>
                      ) : (
                        <button
                          onClick={() => updateEstado(s.id, nextAction.estado)}
                          disabled={isUpdating}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 ${nextAction.color}`}
                        >
                          <nextAction.icon className="w-4 h-4" />
                          {isUpdating ? 'Actualizando...' : `Marcar: ${nextAction.label}`}
                        </button>
                      )
                    )}

                    {/* Completar modal - inline */}
                    {completarModal === s.id && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">¿Cuánto se cobró el trabajo?</p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={montoTrabajo}
                            onChange={(e) => setMontoTrabajo(e.target.value)}
                            placeholder="Ej: 25000"
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            autoFocus
                          />
                        </div>
                        {montoTrabajo && Number(montoTrabajo) > 0 && (
                          <p className="text-xs text-gray-500">
                            Comisión Enermax (15%): <strong className="text-blue-600">${Math.round(Number(montoTrabajo) * 0.15).toLocaleString('es-AR')}</strong>
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const monto = Number(montoTrabajo)
                              if (monto > 0) updateEstado(s.id, 'completada', monto)
                            }}
                            disabled={!montoTrabajo || Number(montoTrabajo) <= 0}
                            className="flex-1 bg-emerald-600 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-40"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateEstado(s.id, 'completada')}
                            className="px-4 bg-gray-200 text-gray-600 font-medium py-2 rounded-lg text-sm"
                          >
                            Sin monto
                          </button>
                          <button
                            onClick={() => { setCompletarModal(null); setMontoTrabajo('') }}
                            className="px-3 text-gray-400 hover:text-gray-600 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Chat toggle */}
                    {!['completada', 'cancelada'].includes(s.estado) && (
                      <button
                        onClick={() => setExpandedChat(expandedChat === s.id ? null : s.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100
                                   text-blue-700 font-medium text-sm py-2.5 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat con cliente
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedChat === s.id ? 'rotate-180' : ''}`} />
                      </button>
                    )}

                    {expandedChat === s.id && (
                      <Chat solicitudId={s.id} autorTipo="profesional" />
                    )}

                    {/* Undo + Cancel */}
                    <div className="flex items-center justify-between">
                      {prevEstado ? (
                        <button
                          onClick={() => updateEstado(s.id, prevEstado)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 py-1.5 transition-colors"
                        >
                          <Undo2 className="w-3 h-3" />
                          Volver atrás
                        </button>
                      ) : <span />}
                      {['pendiente', 'aceptada', 'en_progreso'].includes(s.estado) && (
                        <button
                          onClick={() => updateEstado(s.id, 'cancelada')}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 py-1.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancelar
                        </button>
                      )}
                    </div>
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
