'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock, CheckCircle, MessageCircle, Star, MapPin,
  ChevronRight, AlertCircle, Calendar, DollarSign, Users,
  TrendingUp, Bell
} from 'lucide-react'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrecio, formatFecha, formatTiempoRelativo, ESTADOS_SOLICITUD } from '@/lib/constants'
import type { Solicitud, Servicio } from '@/lib/database.types'

type SolicitudConServicio = Solicitud & {
  servicio: Servicio | null
}

export default function ProfesionalDashboard() {
  const { user, role, profesionalId, loading: authLoading } = useAuth()
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<SolicitudConServicio[]>([])
  const [stats, setStats] = useState({
    pendientes: 0,
    enProgreso: 0,
    completadas: 0,
    ingresos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pendientes' | 'activas' | 'historial'>('pendientes')

  useEffect(() => {
    if (!authLoading && role !== 'profesional') {
      router.push('/')
    }
  }, [role, authLoading, router])

  useEffect(() => {
    if (!profesionalId) return

    async function fetchData() {
      // Fetch solicitudes
      const { data } = await supabase
        .from('solicitudes')
        .select(`*, servicio:servicios(*)`)
        .eq('profesional_id', profesionalId)
        .order('created_at', { ascending: false })

      if (data) {
        setSolicitudes(data as SolicitudConServicio[])

        // Calculate stats
        const pendientes = data.filter(s => s.estado === 'pendiente').length
        const enProgreso = data.filter(s => ['aceptada', 'en_progreso'].includes(s.estado)).length
        const completadas = data.filter(s => s.estado === 'confirmada').length
        const ingresos = data
          .filter(s => s.estado === 'confirmada')
          .reduce((acc, s) => acc + s.monto_profesional, 0)

        setStats({ pendientes, enProgreso, completadas, ingresos })
      }
      setLoading(false)
    }

    fetchData()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('profesional-solicitudes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitudes',
          filter: `profesional_id=eq.${profesionalId}`,
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profesionalId])

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente')
  const activas = solicitudes.filter(s => ['aceptada', 'en_progreso', 'completada'].includes(s.estado))
  const historial = solicitudes.filter(s => ['confirmada', 'cancelada'].includes(s.estado))

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-100 mb-2">
              Dashboard
            </h1>
            <p className="text-dark-400">
              Gestiona tus trabajos y solicitudes
            </p>
          </div>
          <Link href="/dashboard/profesional/notificaciones" className="btn-secondary">
            <Bell className="w-4 h-4" />
            Notificaciones
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="Pendientes"
            value={stats.pendientes}
            color="text-amber-400"
          />
          <StatCard
            icon={Users}
            label="En Progreso"
            value={stats.enProgreso}
            color="text-blue-400"
          />
          <StatCard
            icon={CheckCircle}
            label="Completados"
            value={stats.completadas}
            color="text-green-400"
          />
          <StatCard
            icon={DollarSign}
            label="Ingresos"
            value={formatPrecio(stats.ingresos)}
            color="text-primary-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('pendientes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'pendientes'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => setTab('activas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'activas'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Activas ({activas.length})
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
          {getListForTab().length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-100 mb-2">
                No hay solicitudes
              </h3>
              <p className="text-dark-400">
                Las nuevas solicitudes aparecerán acá
              </p>
            </div>
          ) : (
            getListForTab().map((sol) => (
              <SolicitudCard key={sol.id} solicitud={sol} />
            ))
          )}
        </div>
      </div>
    </div>
  )

  function getListForTab() {
    switch (tab) {
      case 'pendientes': return pendientes
      case 'activas': return activas
      case 'historial': return historial
    }
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm text-dark-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-dark-100">{value}</div>
    </div>
  )
}

function SolicitudCard({ solicitud }: { solicitud: SolicitudConServicio }) {
  const estado = ESTADOS_SOLICITUD[solicitud.estado as keyof typeof ESTADOS_SOLICITUD]

  return (
    <Link
      href={`/dashboard/profesional/solicitud/${solicitud.id}`}
      className="block bg-dark-900 border border-dark-800 rounded-2xl p-5 hover:border-dark-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge ${estado?.color || 'badge-info'}`}>
              {estado?.label || solicitud.estado}
            </span>
            <span className="text-xs text-dark-500">
              {formatTiempoRelativo(solicitud.created_at)}
            </span>
          </div>

          {/* Client name */}
          <h3 className="font-semibold text-dark-100 mb-1">
            {solicitud.cliente_nombre}
          </h3>

          {/* Service */}
          <p className="text-sm text-dark-400 mb-2">
            {solicitud.servicio?.nombre || 'Servicio'}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm text-dark-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {solicitud.direccion}
            </span>
            {solicitud.fecha_solicitada && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatFecha(solicitud.fecha_solicitada)}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-primary-400 mb-1">
            {formatPrecio(solicitud.monto_profesional)}
          </div>
          <div className="text-xs text-dark-500">para vos</div>
          <ChevronRight className="w-5 h-5 text-dark-600 ml-auto mt-2" />
        </div>
      </div>

      {/* Action hint for pending */}
      {solicitud.estado === 'pendiente' && (
        <div className="mt-4 pt-4 border-t border-dark-800 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="w-4 h-4" />
          Nueva solicitud - Respondé para aceptar
        </div>
      )}
    </Link>
  )
}
