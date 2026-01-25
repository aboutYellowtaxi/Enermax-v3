'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, CheckCircle2, Clock, Zap } from 'lucide-react'
import { formatPrecio } from '@/lib/constants'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

interface ProfessionalCardProps {
  profesional: Profesional & {
    servicios: Servicio[]
    zona_base: Zona | null
  }
  showDistance?: boolean
  distance?: number
}

export default function ProfessionalCard({
  profesional,
  showDistance,
  distance
}: ProfessionalCardProps) {
  const minPrecio = profesional.servicios.length > 0
    ? Math.min(...profesional.servicios.map(s => s.precio))
    : null

  const categoriaPrincipal = profesional.categorias?.[0] || 'Profesional'

  return (
    <Link href={`/profesional/${profesional.id}`}>
      <article className="pro-card">
        {/* Image/Avatar section */}
        <div className="relative h-48 bg-dark-800 overflow-hidden">
          {profesional.foto_url ? (
            <Image
              src={profesional.foto_url}
              alt={`${profesional.nombre} ${profesional.apellido || ''}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-600/10">
              <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Zap className="w-10 h-10 text-primary-400" />
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {profesional.verificado && (
              <span className="badge-success text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                Verificado
              </span>
            )}
            {profesional.premium && (
              <span className="badge-primary text-[10px]">
                Premium
              </span>
            )}
          </div>

          {/* Rating pill */}
          <div className="absolute bottom-3 right-3 bg-dark-900/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-dark-100">
              {profesional.calificacion.toFixed(1)}
            </span>
            <span className="text-xs text-dark-400">
              ({profesional.total_reviews})
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name and category */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors">
                {profesional.nombre} {profesional.apellido?.charAt(0)}.
              </h3>
              <p className="text-sm text-dark-400 capitalize">
                {categoriaPrincipal.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4 text-sm text-dark-400 mb-3">
            {profesional.zona_base && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profesional.zona_base.nombre}
              </span>
            )}
            {showDistance && distance !== undefined && (
              <span className="flex items-center gap-1 text-primary-400">
                <MapPin className="w-3.5 h-3.5" />
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-dark-500 mb-4">
            <span>{profesional.total_trabajos} trabajos</span>
            <span>{profesional.experiencia_anos} años exp.</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-dark-800">
            <span className="text-sm text-dark-400">Desde</span>
            <span className="text-lg font-bold text-primary-400">
              {minPrecio ? formatPrecio(minPrecio) : 'Consultar'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
