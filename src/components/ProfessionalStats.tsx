'use client'

import { TrendingUp, Flame, Trophy, Star, DollarSign, Calendar, Target, Zap } from 'lucide-react'
import { formatPrecio } from '@/lib/constants'

interface StatsProps {
  totalGanado: number
  gananciasMes: number
  trabajosCompletados: number
  trabajosMes: number
  calificacion: number
  totalReviews: number
  rachaActual: number
  mejorRacha: number
}

const BADGES = [
  { id: 'first_job', nombre: 'Primer Trabajo', icono: Zap, descripcion: 'Completaste tu primer trabajo', desbloqueado: true },
  { id: 'five_stars', nombre: 'Cinco Estrellas', icono: Star, descripcion: '5 reviews de 5 estrellas', desbloqueado: true },
  { id: 'streak_7', nombre: 'Racha Semanal', icono: Flame, descripcion: '7 dias consecutivos trabajando', desbloqueado: false },
  { id: 'top_100', nombre: 'Top 100', icono: Trophy, descripcion: 'Estas en el top 100 de tu zona', desbloqueado: false },
  { id: 'money_100k', nombre: 'Club 100K', icono: DollarSign, descripcion: 'Ganaste mas de $100.000', desbloqueado: true },
  { id: 'reliable', nombre: 'Confiable', icono: Target, descripcion: '10 trabajos sin cancelar', desbloqueado: true },
]

export default function ProfessionalStats({
  totalGanado,
  gananciasMes,
  trabajosCompletados,
  trabajosMes,
  calificacion,
  totalReviews,
  rachaActual,
  mejorRacha
}: StatsProps) {
  const porcentajeMeta = Math.min((gananciasMes / 200000) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Main Earnings Card - Big and motivating */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-primary-200 text-sm font-medium">Este mes llevas</span>
            <TrendingUp className="w-5 h-5 text-primary-200" />
          </div>

          <div className="text-4xl md:text-5xl font-bold mb-2">
            {formatPrecio(gananciasMes)}
          </div>

          <p className="text-primary-200 text-sm mb-4">
            {trabajosMes} trabajos completados
          </p>

          {/* Progress to goal */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-primary-200">Meta mensual</span>
              <span className="text-white font-medium">{porcentajeMeta.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${porcentajeMeta}%` }}
              />
            </div>
            <p className="text-xs text-primary-200 mt-1">
              Faltan {formatPrecio(Math.max(200000 - gananciasMes, 0))} para llegar a {formatPrecio(200000)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak - Gamification core */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              rachaActual > 0 ? 'bg-orange-500/20' : 'bg-dark-800'
            }`}>
              <Flame className={`w-5 h-5 ${rachaActual > 0 ? 'text-orange-400' : 'text-dark-500'}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-100">
            {rachaActual} dias
          </div>
          <p className="text-sm text-dark-400">Racha actual</p>
          {rachaActual > 0 && rachaActual === mejorRacha && (
            <span className="inline-block mt-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
              Tu mejor racha!
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-100 flex items-center gap-1">
            {calificacion.toFixed(1)}
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-sm text-dark-400">{totalReviews} reviews</p>
        </div>

        {/* Total trabajos */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-100">
            {trabajosCompletados}
          </div>
          <p className="text-sm text-dark-400">Trabajos totales</p>
        </div>

        {/* Total ganado historico */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-100">
            {formatPrecio(totalGanado)}
          </div>
          <p className="text-sm text-dark-400">Ganado total</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-100">Tus Logros</h3>
          <span className="text-xs text-dark-400">
            {BADGES.filter(b => b.desbloqueado).length}/{BADGES.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const Icon = badge.icono
            return (
              <div
                key={badge.id}
                className={`relative p-3 rounded-xl text-center transition-all ${
                  badge.desbloqueado
                    ? 'bg-dark-800 hover:bg-dark-700 cursor-pointer'
                    : 'bg-dark-800/50 opacity-50'
                }`}
                title={badge.descripcion}
              >
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  badge.desbloqueado ? 'bg-primary-500/20' : 'bg-dark-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    badge.desbloqueado ? 'text-primary-400' : 'text-dark-500'
                  }`} />
                </div>
                <span className={`text-xs ${
                  badge.desbloqueado ? 'text-dark-200' : 'text-dark-500'
                }`}>
                  {badge.nombre}
                </span>
                {!badge.desbloqueado && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 rounded-xl">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Motivational message */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 rounded-2xl p-4 border border-dark-700">
        <p className="text-center text-dark-300">
          {rachaActual === 0 && (
            <>Completa un trabajo hoy para empezar tu racha! 🔥</>
          )}
          {rachaActual > 0 && rachaActual < 7 && (
            <>{7 - rachaActual} dias mas para desbloquear "Racha Semanal"! 💪</>
          )}
          {rachaActual >= 7 && (
            <>Increible racha! Seguí así y llegaras al top de tu zona! 🏆</>
          )}
        </p>
      </div>
    </div>
  )
}
