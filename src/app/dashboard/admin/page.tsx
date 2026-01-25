'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Briefcase, DollarSign, TrendingUp, Star, Clock,
  ArrowUpRight, ArrowDownRight, Activity, AlertTriangle
} from 'lucide-react'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { formatPrecio } from '@/lib/constants'

interface Metricas {
  totalProfesionales: number
  totalClientes: number
  solicitudesHoy: number
  solicitudesMes: number
  gmvMes: number
  comisionesMes: number
  avgRating: string
  estadosCounts: Record<string, number>
  nuevosProfesionales: number
}

export default function AdminDashboard() {
  const { role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && role !== 'admin') {
      router.push('/')
    }
  }, [role, authLoading, router])

  useEffect(() => {
    async function fetchMetricas() {
      const res = await fetch('/api/admin/metricas')
      const data = await res.json()
      setMetricas(data)
      setLoading(false)
    }
    fetchMetricas()
  }, [])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <div className="section pt-24 pb-12">
        <h1 className="text-3xl font-bold text-dark-100 mb-2">
          Panel de Administración
        </h1>
        <p className="text-dark-400 mb-8">
          Métricas y gestión de Enermax
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Profesionales"
            value={metricas?.totalProfesionales || 0}
            change={metricas?.nuevosProfesionales || 0}
            changeLabel="este mes"
            positive
          />
          <StatCard
            icon={Briefcase}
            label="Solicitudes Hoy"
            value={metricas?.solicitudesHoy || 0}
            sublabel={`${metricas?.solicitudesMes || 0} este mes`}
          />
          <StatCard
            icon={DollarSign}
            label="GMV Mes"
            value={formatPrecio(metricas?.gmvMes || 0)}
            sublabel={`Comisiones: ${formatPrecio(metricas?.comisionesMes || 0)}`}
          />
          <StatCard
            icon={Star}
            label="Rating Promedio"
            value={metricas?.avgRating || '0'}
            sublabel="Calificación general"
          />
        </div>

        {/* Status breakdown */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">
            Solicitudes por Estado
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(metricas?.estadosCounts || {}).map(([estado, count]) => (
              <div key={estado} className="text-center">
                <div className="text-2xl font-bold text-dark-100">{count}</div>
                <div className="text-xs text-dark-400 capitalize">
                  {estado.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <QuickAction
            icon={Users}
            title="Gestionar Profesionales"
            description="Ver, aprobar y verificar profesionales"
            href="/dashboard/admin/profesionales"
          />
          <QuickAction
            icon={AlertTriangle}
            title="Disputas"
            description="Resolver conflictos entre partes"
            href="/dashboard/admin/disputas"
          />
          <QuickAction
            icon={Activity}
            title="Logs del Sistema"
            description="Ver actividad y errores"
            href="/dashboard/admin/logs"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  positive,
  sublabel,
}: {
  icon: any
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  positive?: boolean
  sublabel?: string
}) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            positive ? 'text-green-400' : 'text-red-400'
          }`}>
            {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            +{change}
            {changeLabel && <span className="text-dark-500">{changeLabel}</span>}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-dark-100 mb-1">{value}</div>
      <div className="text-sm text-dark-400">{sublabel || label}</div>
    </div>
  )
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: any
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="bg-dark-900 border border-dark-800 rounded-2xl p-6 hover:border-primary-500/30 transition-colors group"
    >
      <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/10 transition-colors">
        <Icon className="w-6 h-6 text-dark-400 group-hover:text-primary-400 transition-colors" />
      </div>
      <h3 className="font-semibold text-dark-100 mb-1">{title}</h3>
      <p className="text-sm text-dark-400">{description}</p>
    </a>
  )
}
