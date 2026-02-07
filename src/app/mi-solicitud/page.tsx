'use client'

import { useState } from 'react'
import { Zap, Search, ArrowRight, Clock, CheckCircle, Phone, Truck, Wrench, AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

interface SolicitudResumen {
  id: string
  estado: string
  direccion?: string
  notas?: string
  created_at: string
}

const estadoConfig: Record<string, { label: string, color: string, icon: typeof Clock }> = {
  pendiente: { label: 'En revisión', color: 'text-blue-600 bg-blue-50', icon: Clock },
  aceptada: { label: 'Contactado', color: 'text-indigo-600 bg-indigo-50', icon: Phone },
  en_progreso: { label: 'En curso', color: 'text-amber-600 bg-amber-50', icon: Truck },
  completada: { label: 'Completado', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  cancelada: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: AlertCircle },
}

export default function MiSolicitudPage() {
  const [telefono, setTelefono] = useState('')
  const [solicitudes, setSolicitudes] = useState<SolicitudResumen[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSolicitudes([])
    setSearched(false)

    if (!telefono.trim()) {
      setError('Ingresá tu teléfono')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mi-solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: telefono.trim() }),
      })
      const data = await res.json()
      setSearched(true)
      if (data.solicitudes && data.solicitudes.length > 0) {
        setSolicitudes(data.solicitudes)
      } else if (data.solicitudes && data.solicitudes.length === 0) {
        setError('No encontramos solicitudes con ese número')
      } else {
        setError(data.error || 'No encontramos solicitudes')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    })
  }

  const tiempoRelativo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Ahora mismo'
    if (mins < 60) return `Hace ${mins} min`
    if (hrs < 24) return `Hace ${hrs}h`
    if (days < 7) return `Hace ${days} días`
    return formatDate(dateStr)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Enermax</span>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Inicio
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-8 px-4">
        <div className="max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
            Mis solicitudes
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Ingresá el teléfono con el que agendaste
          </p>

          <form onSubmit={buscar} className="space-y-3 mb-6">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Tu teléfono (ej: 1112345678)"
              value={telefono}
              onChange={(e) => {
                const nums = e.target.value.replace(/\D/g, '')
                setTelefono(nums)
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                         text-gray-900 placeholder:text-gray-400 text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                         transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                         text-white font-semibold py-3.5 rounded-xl transition-colors
                         disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Buscando...' : 'Buscar mis solicitudes'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {solicitudes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 text-center mb-2">
                {solicitudes.length === 1 ? 'Tu solicitud' : `${solicitudes.length} solicitudes`}
              </p>
              {solicitudes.map((s) => {
                const config = estadoConfig[s.estado] || estadoConfig.pendiente
                const StatusIcon = config.icon
                return (
                  <Link
                    key={s.id}
                    href={`/seguimiento/${s.id}`}
                    className="block bg-white hover:bg-gray-50 rounded-xl p-4 transition-colors border-2 border-gray-100 hover:border-blue-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400">{tiempoRelativo(s.created_at)}</span>
                    </div>
                    {s.direccion && s.direccion !== 'Sin especificar' && (
                      <p className="text-sm text-gray-600 mb-1">{s.direccion}</p>
                    )}
                    {s.notas && !['Consulta / Agendamiento', 'Consulta / Agendamiento sin pago'].includes(s.notas) && (
                      <p className="text-xs text-gray-400 line-clamp-1">{s.notas}</p>
                    )}
                    <div className="flex items-center justify-end mt-2">
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        Ver seguimiento <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {searched && solicitudes.length === 0 && !error && (
            <p className="text-sm text-gray-400 text-center">No encontramos solicitudes</p>
          )}

          {/* Bottom action */}
          <div className="mt-8">
            <Link
              href="/"
              className="block w-full text-center py-3.5 rounded-xl border-2 border-gray-200 hover:border-blue-500
                         text-gray-700 hover:text-blue-600 font-semibold text-sm transition-all"
            >
              Agendar nueva visita
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
