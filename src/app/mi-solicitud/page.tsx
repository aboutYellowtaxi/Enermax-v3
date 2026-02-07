'use client'

import { useState } from 'react'
import { Zap, Search, ArrowRight, Clock, CheckCircle, Phone, Truck, Wrench, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface SolicitudResumen {
  id: string
  estado: string
  created_at: string
}

const estadoConfig: Record<string, { label: string, color: string, icon: typeof Clock }> = {
  pendiente: { label: 'En revisión', color: 'text-blue-600 bg-blue-50', icon: Clock },
  pendiente_pago: { label: 'Pendiente de pago', color: 'text-amber-600 bg-amber-50', icon: Clock },
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
      if (data.solicitudes) {
        setSolicitudes(data.solicitudes)
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Enermax</span>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-8 px-4">
        <div className="max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
            Consultá tu solicitud
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Ingresá el teléfono con el que agendaste
          </p>

          <form onSubmit={buscar} className="space-y-3 mb-6">
            <input
              type="tel"
              placeholder="Tu teléfono (ej: 11 1234-5678)"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
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
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {solicitudes.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 text-center">
                {solicitudes.length === 1 ? 'Tu solicitud:' : `${solicitudes.length} solicitudes encontradas:`}
              </p>
              {solicitudes.map((s) => {
                const config = estadoConfig[s.estado] || estadoConfig.pendiente
                const StatusIcon = config.icon
                return (
                  <Link
                    key={s.id}
                    href={`/seguimiento/${s.id}`}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors border border-gray-100"
                  >
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <p className="text-xs text-gray-400 mt-1.5">{formatDate(s.created_at)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                )
              })}
            </div>
          )}

          {searched && solicitudes.length === 0 && !error && (
            <p className="text-sm text-gray-400 text-center">No encontramos solicitudes</p>
          )}

          <div className="text-center mt-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
