'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock, CheckCircle, MessageCircle, Star, MapPin,
  ChevronRight, AlertCircle, Calendar, DollarSign, Users,
  TrendingUp, Bell, Settings, Plus, Briefcase, Eye
} from 'lucide-react'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProfessionalStats from '@/components/ProfessionalStats'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrecio, formatFecha, formatTiempoRelativo, ESTADOS_SOLICITUD } from '@/lib/constants'
import type { Solicitud, Servicio, Profesional } from '@/lib/database.types'

type SolicitudConServicio = Solicitud & {
  servicio: Servicio | null
}

export default function ProfesionalDashboard() {
  const { user, role, profesionalId, loading: authLoading } = useAuth()
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<SolicitudConServicio[]>([])
  const [profesional, setProfesional] = useState<Profesional | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'solicitudes' | 'servicios'>('overview')
  const [tab, setTab] = useState<'pendientes' | 'activas' | 'historial'>('pendientes')

  useEffect(() => {
    if (!authLoading && role !== 'profesional') {
      router.push('/')
    }
  }, [role, authLoading, router])

  useEffect(() => {
    if (!profesionalId) return

    async function fetchData() {
      // Fetch profesional data
      const { data: profData } = await supabase
        .from('profesionales')
        .select('*')
        .eq('id', profesionalId)
        .single()

      if (profData) setProfesional(profData)

      // Fetch servicios
      const { data: serviciosData } = await supabase
        .from('servicios')
        .select('*')
        .eq('profesional_id', profesionalId)
        .order('destacado', { ascending: false })

      if (serviciosData) setServicios(serviciosData)

      // Fetch solicitudes
      const { data } = await supabase
        .from('solicitudes')
        .select(`*, servicio:servicios(*)`)
        .eq('profesional_id', profesionalId)
        .order('created_at', { ascending: false })

      if (data) {
        setSolicitudes(data as SolicitudConServicio[])
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

  // Calculate stats
  const confirmadas = solicitudes.filter(s => s.estado === 'confirmada')
  const totalGanado = confirmadas.reduce((acc, s) => acc + s.monto_profesional, 0)

  // Calculate this month
  const mesActual = new Date()
  mesActual.setDate(1)
  mesActual.setHours(0, 0, 0, 0)
  const solicitudesMes = solicitudes.filter(s =>
    new Date(s.created_at) >= mesActual
  )
  const gananciasMes = solicitudesMes
    .filter(s => s.estado === 'confirmada')
    .reduce((acc, s) => acc + s.monto_profesional, 0)
  const trabajosMes = solicitudesMes.filter(s => s.estado === 'confirmada').length

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
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-100 mb-1">
              Hola, {profesional?.nombre}! 👋
            </h1>
            <p className="text-dark-400">
              {pendientes.length > 0 ? (
                <span className="text-primary-400 font-medium">
                  Tenes {pendientes.length} solicitud{pendientes.length !== 1 ? 'es' : ''} nueva{pendientes.length !== 1 ? 's' : ''}!
                </span>
              ) : (
                'Tu dashboard esta al dia'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/profesional/${profesionalId}`}
              className="btn-ghost btn-sm hidden md:flex"
            >
              <Eye className="w-4 h-4" />
              Ver perfil
            </Link>
            <Link href="/dashboard/profesional/configuracion" className="btn-secondary btn-sm">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-2 mb-8 border-b border-dark-800 pb-4">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveView('solicitudes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeView === 'solicitudes'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Solicitudes
            {pendientes.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('servicios')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'servicios'
                ? 'bg-primary-400 text-dark-900'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Mis Servicios
          </button>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats Column */}
            <div className="lg:col-span-2">
              <ProfessionalStats
                totalGanado={totalGanado}
                gananciasMes={gananciasMes}
                trabajosCompletados={confirmadas.length}
                trabajosMes={trabajosMes}
                calificacion={profesional?.calificacion || 5}
                totalReviews={profesional?.total_reviews || 0}
                rachaActual={3} // TODO: Calculate real streak
                mejorRacha={7}
              />
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark-100">Actividad reciente</h3>
                <button
                  onClick={() => setActiveView('solicitudes')}
                  className="text-sm text-primary-400 hover:underline"
                >
                  Ver todas
                </button>
              </div>

              {pendientes.length > 0 ? (
                <div className="space-y-3">
                  {pendientes.slice(0, 3).map((sol) => (
                    <MiniSolicitudCard key={sol.id} solicitud={sol} />
                  ))}
                </div>
              ) : activas.length > 0 ? (
                <div className="space-y-3">
                  {activas.slice(0, 3).map((sol) => (
                    <MiniSolicitudCard key={sol.id} solicitud={sol} />
                  ))}
                </div>
              ) : (
                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 text-center">
                  <Briefcase className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 text-sm">
                    No tenes solicitudes pendientes
                  </p>
                  <p className="text-dark-500 text-xs mt-1">
                    Las nuevas solicitudes aparecerán acá
                  </p>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-4">
                <h4 className="text-sm font-medium text-dark-300 mb-3">Acciones rápidas</h4>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/profesional/servicios/nuevo"
                    className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-dark-200">Agregar servicio</span>
                  </Link>
                  <Link
                    href="/dashboard/profesional/perfil"
                    className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-dark-200">Editar perfil</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solicitudes View */}
        {activeView === 'solicitudes' && (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab('pendientes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === 'pendientes'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                Pendientes ({pendientes.length})
              </button>
              <button
                onClick={() => setTab('activas')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === 'activas'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                Activas ({activas.length})
              </button>
              <button
                onClick={() => setTab('historial')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  tab === 'historial'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                Historial ({historial.length})
              </button>
            </div>

            <div className="space-y-4">
              {getListForTab().length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-100 mb-2">
                    No hay solicitudes
                  </h3>
                  <p className="text-dark-400">
                    {tab === 'pendientes' && 'Las nuevas solicitudes aparecerán acá'}
                    {tab === 'activas' && 'Cuando aceptes una solicitud aparecerá acá'}
                    {tab === 'historial' && 'Tu historial de trabajos aparecerá acá'}
                  </p>
                </div>
              ) : (
                getListForTab().map((sol) => (
                  <SolicitudCard key={sol.id} solicitud={sol} />
                ))
              )}
            </div>
          </>
        )}

        {/* Servicios View */}
        {activeView === 'servicios' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-dark-400">
                {servicios.length} servicio{servicios.length !== 1 ? 's' : ''} publicado{servicios.length !== 1 ? 's' : ''}
              </p>
              <Link href="/dashboard/profesional/servicios/nuevo" className="btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Agregar servicio
              </Link>
            </div>

            {servicios.length === 0 ? (
              <div className="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl">
                <Briefcase className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-100 mb-2">
                  Todavía no tenés servicios
                </h3>
                <p className="text-dark-400 mb-6">
                  Agregá tus servicios para que los clientes puedan contratarte
                </p>
                <Link href="/dashboard/profesional/servicios/nuevo" className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Agregar primer servicio
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {servicios.map((servicio) => (
                  <ServiceCard key={servicio.id} servicio={servicio} />
                ))}
              </div>
            )}
          </>
        )}
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

function MiniSolicitudCard({ solicitud }: { solicitud: SolicitudConServicio }) {
  const estado = ESTADOS_SOLICITUD[solicitud.estado as keyof typeof ESTADOS_SOLICITUD]

  return (
    <Link
      href={`/dashboard/profesional/solicitud/${solicitud.id}`}
      className="block bg-dark-900 border border-dark-800 rounded-xl p-4 hover:border-primary-500/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`badge ${estado?.color || 'badge-info'} text-xs`}>
          {estado?.label || solicitud.estado}
        </span>
        <span className="text-xs text-dark-500">
          {formatTiempoRelativo(solicitud.created_at)}
        </span>
      </div>
      <h4 className="font-medium text-dark-100 text-sm mb-1 truncate">
        {solicitud.cliente_nombre}
      </h4>
      <div className="flex items-center justify-between">
        <span className="text-xs text-dark-400 truncate">
          {solicitud.servicio?.nombre || 'Servicio'}
        </span>
        <span className="text-sm font-bold text-primary-400">
          {formatPrecio(solicitud.monto_profesional)}
        </span>
      </div>
    </Link>
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
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge ${estado?.color || 'badge-info'}`}>
              {estado?.label || solicitud.estado}
            </span>
            <span className="text-xs text-dark-500">
              {formatTiempoRelativo(solicitud.created_at)}
            </span>
          </div>

          <h3 className="font-semibold text-dark-100 mb-1">
            {solicitud.cliente_nombre}
          </h3>

          <p className="text-sm text-dark-400 mb-2">
            {solicitud.servicio?.nombre || 'Servicio'}
          </p>

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

      {solicitud.estado === 'pendiente' && (
        <div className="mt-4 pt-4 border-t border-dark-800 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="w-4 h-4" />
          Nueva solicitud - Respondé para aceptar
        </div>
      )}
    </Link>
  )
}

function ServiceCard({ servicio }: { servicio: Servicio }) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 hover:border-dark-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          {servicio.destacado && (
            <span className="badge-primary text-xs mb-2">Destacado</span>
          )}
          <h3 className="font-semibold text-dark-100">{servicio.nombre}</h3>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary-400">
            {formatPrecio(servicio.precio)}
          </div>
          {servicio.precio_desde && (
            <span className="text-xs text-dark-500">desde</span>
          )}
        </div>
      </div>

      {servicio.descripcion && (
        <p className="text-sm text-dark-400 mb-3 line-clamp-2">
          {servicio.descripcion}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-500">
          {servicio.duracion_minutos} min aprox.
        </span>
        <Link
          href={`/dashboard/profesional/servicios/${servicio.id}`}
          className="text-primary-400 hover:underline"
        >
          Editar
        </Link>
      </div>
    </div>
  )
}
