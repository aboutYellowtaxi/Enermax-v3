'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Zap } from 'lucide-react'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

interface ProfessionalStoryCardProps {
  profesional: Profesional & {
    servicios: Servicio[]
    zona_base: Zona | null
  }
}

// Mapeo de categorías a nombres legibles
const CATEGORIA_NOMBRES: Record<string, string> = {
  electricidad: 'Electricista',
  plomeria: 'Plomero',
  gas: 'Gasista',
  pintura: 'Pintor',
  carpinteria: 'Carpintero',
  cerrajeria: 'Cerrajero',
  aire: 'Aire Acond.',
  limpieza: 'Limpieza',
}

export default function ProfessionalStoryCard({ profesional }: ProfessionalStoryCardProps) {
  const categoriaPrincipal = profesional.categorias?.[0] || 'profesional'
  const nombreCategoria = CATEGORIA_NOMBRES[categoriaPrincipal] || categoriaPrincipal

  return (
    <Link
      href={`/profesional/${profesional.id}`}
      className="flex-shrink-0 w-32 group"
    >
      {/* Card container - Instagram Story style */}
      <div className="relative w-32 h-44 rounded-2xl overflow-hidden bg-dark-800 border-2 border-dark-700 group-hover:border-primary-500 transition-all shadow-lg group-hover:shadow-primary-500/20">
        {/* Background image */}
        {profesional.foto_url ? (
          <Image
            src={profesional.foto_url}
            alt={profesional.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Zap className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

        {/* Rating badge - top right */}
        <div className="absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-white">
            {profesional.calificacion.toFixed(1)}
          </span>
        </div>

        {/* Content - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Name */}
          <h3 className="font-bold text-white text-sm truncate">
            {profesional.nombre}
          </h3>

          {/* Category */}
          <p className="text-primary-400 text-xs font-medium">
            {nombreCategoria}
          </p>

          {/* Location */}
          {profesional.zona_base && (
            <p className="text-dark-300 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {profesional.zona_base.nombre}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
