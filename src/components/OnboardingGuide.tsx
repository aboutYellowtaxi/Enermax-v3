'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X, Check, ChevronRight, User, Briefcase, DollarSign,
  Image as ImageIcon, Star, Zap, Trophy, Gift
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: typeof User
  completed: boolean
  link?: string
  action?: string
}

interface OnboardingGuideProps {
  profesionalId: string
  nombre?: string
  tieneServicios: boolean
  tieneFoto: boolean
  tieneBio: boolean
  onDismiss: () => void
}

export default function OnboardingGuide({
  profesionalId,
  nombre,
  tieneServicios,
  tieneFoto,
  tieneBio,
  onDismiss
}: OnboardingGuideProps) {
  const [showReward, setShowReward] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'perfil',
      title: 'Completa tu perfil',
      description: 'Agrega una foto y bio para generar confianza',
      icon: User,
      completed: tieneFoto && tieneBio,
      link: '/dashboard/profesional/perfil',
      action: 'Completar perfil'
    },
    {
      id: 'servicios',
      title: 'Agrega tu primer servicio',
      description: 'Publica lo que ofreces para que te contraten',
      icon: Briefcase,
      completed: tieneServicios,
      link: '/dashboard/profesional/servicios/nuevo',
      action: 'Agregar servicio'
    },
    {
      id: 'precios',
      title: 'Define tus precios',
      description: 'Precios claros = mas contrataciones',
      icon: DollarSign,
      completed: tieneServicios,
      link: '/dashboard/profesional/servicios/nuevo',
      action: 'Ver servicios'
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const progress = (completedCount / steps.length) * 100
  const allComplete = completedCount === steps.length

  useEffect(() => {
    if (allComplete) {
      setShowReward(true)
    }
  }, [allComplete])

  if (allComplete && !showReward) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 border border-primary-500/30 rounded-2xl p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl" />

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-dark-400 hover:text-dark-200 transition-colors"
        title="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>

      {showReward ? (
        // Celebration screen
        <div className="text-center py-4 relative z-10">
          <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Trophy className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-dark-100 mb-2">
            Felicitaciones, {nombre}!
          </h3>
          <p className="text-dark-300 mb-4">
            Tu perfil esta completo. Ya podes recibir solicitudes!
          </p>
          <div className="flex items-center justify-center gap-2 text-primary-400">
            <Gift className="w-5 h-5" />
            <span className="font-medium">Ganaste el badge "Perfil Completo"</span>
          </div>
          <button
            onClick={onDismiss}
            className="mt-6 btn-primary"
          >
            Empezar a trabajar
          </button>
        </div>
      ) : (
        // Onboarding steps
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-dark-100 text-lg">
                Bienvenido a Enermax!
              </h3>
              <p className="text-dark-400 text-sm">
                Completa estos pasos para empezar a recibir clientes
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-400">Progreso</span>
              <span className="text-primary-400 font-medium">{completedCount}/{steps.length}</span>
            </div>
            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    step.completed
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-dark-800/50 border border-dark-700 hover:border-primary-500/30'
                  }`}
                >
                  {/* Icon/Check */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                    {step.completed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${
                      step.completed ? 'text-green-400' : 'text-dark-100'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-dark-400 truncate">
                      {step.description}
                    </p>
                  </div>

                  {/* Action */}
                  {!step.completed && step.link && (
                    <Link
                      href={step.link}
                      className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 font-medium whitespace-nowrap"
                    >
                      {step.action}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {/* Motivation */}
          <div className="mt-4 p-3 bg-dark-800/30 rounded-lg text-center">
            <p className="text-sm text-dark-300">
              Los profesionales con perfil completo reciben{' '}
              <span className="text-primary-400 font-medium">3x mas solicitudes</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
