'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock, CheckCircle, MessageCircle, Star, MapPin,
  ChevronRight, AlertCircle, Calendar, FileText
} from 'lucide-react'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrecio, formatFecha, ESTADOS_SOLICITUD } from '@/lib/constants'
import type { Solicitud, Profesional, Servicio } from '@/lib/database.types'

type SolicitudConDetalles = Solicitud & {
  profesional: Profesional
  servicio: Servicio | null
}

export default function ClienteDashboard() {
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<SolicitudConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'activas' | 'historial'>('activas')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    async function fetchSolicitudes() {
      const { data } = await supabase
        .from('solicitudes')
        .select(`
          *,
          profesional:profesionales(*),
          servicio:servicios(*)
        `)
        .eq('cliente_auth_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setSolicitudes(data as SolicitudConDetalles[])
      }
      setLoading(false)
    }

    fetchSolicitudes()
  }, [user])

  const solicitudesActivas = solicitudes.filter(s =>
    !['confirmada', 'cancelada'].includes(s.estado)
  )
  const historial = solicitudes.filter(s =>
    ['confirmada', 'cancelada'].includes(s.estado)
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <div className="section pt-24 pb-12">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">
          Mis Trabajos
        </h1>
        <p className="text-dark-400 mb-8">
          Seguí el estado de tus servicios contratados
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('activas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'activas'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Activas ({solicitudesActivas.length})
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'historial'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Historial ({historial.length})
          </button>
        </div>

        {/* Solicitudes list */}
        <div className="space-y-4">
          {(tab === 'activas' ? solicitudesActivas : historial).length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-100 mb-2">
                {tab === 'activas' ? 'No tenés trabajos activos' : 'Sin historial'}
              </h3>
              <p className="text-dark-400 mb-6">
                {tab === 'activas'
                  ? 'Cuando contrates un servicio, aparecerá acá'
                  : 'Tus trabajos completados aparecerán acá'
                }
              </p>
              <Link href="/" className="btn-primary">
                Buscar profesionales
              </Link>
            </div>
          ) : (
            (tab === 'activas' ? solicitudesActivas : historial).map((sol) => (
              <SolicitudCard key={sol.id} solicitud={sol} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function SolicitudCard({ solicitud }: { solicitud: SolicitudConDetalles }) {
  const estado = ESTADOS_SOLICITUD[solicitud.estado as keyof typeof ESTADOS_SOLICITUD]

  return (
    <Link
      href={`/dashboard/cliente/solicitud/${solicitud.id}`}
      className="block bg-dark-900 border border-dark-800 rounded-2xl p-5 hover:border-dark-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Status badge */}
          <span className={`badge ${estado?.color || 'badge-info'} mb-3`}>
            {estado?.label || solicitud.estado}
          </span>

          {/* Service name */}
          <h3 className="font-semibold text-dark-100 mb-1">
            {solicitud.servicio?.nombre || 'Servicio'}
          </h3>

          {/* Professional */}
          <p className="text-sm text-dark-400 mb-2">
            con {solicitud.profesional.nombre} {solicitud.profesional.apellido}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm text-dark-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {solicitud.direccion}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatFecha(solicitud.created_at)}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-primary-400 mb-1">
            {formatPrecio(solicitud.monto_total)}
          </div>
          <ChevronRight className="w-5 h-5 text-dark-600 ml-auto" />
        </div>
      </div>

      {/* Action hint */}
      {solicitud.estado === 'completada' && (
        <div className="mt-4 pt-4 border-t border-dark-800 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="w-4 h-4" />
          Confirmá el trabajo para liberar el pago
        </div>
      )}
    </Link>
  )
}
