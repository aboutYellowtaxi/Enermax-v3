'use client'

import Link from 'next/link'
import { Zap, Droplets, Flame, Paintbrush, Hammer, Key, Wind, Sparkles, AlertTriangle, Phone } from 'lucide-react'

const SERVICIOS_RAPIDOS = [
  { id: 'electricidad', nombre: 'Electricista', icono: Zap, color: 'bg-yellow-500', emoji: '' },
  { id: 'plomeria', nombre: 'Plomero', icono: Droplets, color: 'bg-blue-500', emoji: '' },
  { id: 'gas', nombre: 'Gasista', icono: Flame, color: 'bg-orange-500', emoji: '' },
  { id: 'pintura', nombre: 'Pintor', icono: Paintbrush, color: 'bg-purple-500', emoji: '' },
  { id: 'carpinteria', nombre: 'Carpintero', icono: Hammer, color: 'bg-amber-600', emoji: '' },
  { id: 'cerrajeria', nombre: 'Cerrajero', icono: Key, color: 'bg-gray-500', emoji: '' },
  { id: 'aire', nombre: 'Aire Acondicionado', icono: Wind, color: 'bg-cyan-500', emoji: '' },
  { id: 'limpieza', nombre: 'Limpieza', icono: Sparkles, color: 'bg-pink-500', emoji: '' },
]

export default function QuickHireSection() {
  return (
    <section className="py-8 bg-dark-900">
      <div className="section">
        {/* Emergency Banner - Super visible for urgent needs */}
        <Link
          href="tel:+5491112345678"
          className="block mb-8 p-6 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  EMERGENCIA 24HS
                </h3>
                <p className="text-red-100 text-sm md:text-base">
                  Electricidad, plomeria, cerrajeria urgente
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Phone className="w-5 h-5 text-white" />
              <span className="text-white font-bold">LLAMAR AHORA</span>
            </div>
          </div>
        </Link>

        {/* Main Question */}
        <h2 className="text-2xl md:text-4xl font-bold text-center text-dark-100 mb-3">
          ¿Qué necesitas?
        </h2>
        <p className="text-center text-dark-400 mb-8 text-lg">
          Toca el servicio que buscas
        </p>

        {/* Big Service Buttons - Super accessible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICIOS_RAPIDOS.map((servicio) => {
            const Icon = servicio.icono
            return (
              <Link
                key={servicio.id}
                href={`/?categoria=${servicio.id}#categorias`}
                className="group relative overflow-hidden rounded-2xl p-6 bg-dark-800 border-2 border-dark-700 hover:border-primary-500 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {/* Colored accent */}
                <div className={`absolute top-0 left-0 w-full h-1 ${servicio.color}`} />

                {/* Icon */}
                <div className={`w-16 h-16 ${servicio.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Name */}
                <h3 className="text-center font-bold text-dark-100 text-lg group-hover:text-primary-400 transition-colors">
                  {servicio.nombre}
                </h3>
              </Link>
            )
          })}
        </div>

        {/* Help text for elderly users */}
        <div className="mt-8 text-center p-4 bg-dark-800/50 rounded-xl border border-dark-700">
          <p className="text-dark-300 text-lg">
            <strong className="text-primary-400">Facil de usar:</strong> Toca el servicio que necesitas,
            elegi un profesional, y paga de forma segura. Nosotros te protegemos.
          </p>
        </div>
      </div>
    </section>
  )
}
