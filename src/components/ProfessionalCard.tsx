'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Phone, MessageSquare, Zap } from 'lucide-react'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

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

interface ProfessionalCardProps {
  profesional: Profesional & {
    servicios: Servicio[]
    zona_base: Zona | null
  }
}

export default function ProfessionalCard({ profesional }: ProfessionalCardProps) {
  const categoriaPrincipal = profesional.categorias?.[0] || 'profesional'
  const nombreCategoria = CATEGORIA_NOMBRES[categoriaPrincipal] || categoriaPrincipal

  // Limpiar teléfono para links
  const telefonoLimpio = profesional.telefono.replace(/\D/g, '')
  const whatsappLink = `https://wa.me/54${telefonoLimpio}?text=Hola ${profesional.nombre}! Te contacto por Enermax.`
  const telLink = `tel:+54${telefonoLimpio}`

  return (
    <article className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden hover:border-dark-700 transition-all">
      {/* Header con foto y info básica */}
      <Link href={`/profesional/${profesional.id}`} className="block">
        <div className="p-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
            {profesional.foto_url ? (
              <Image
                src={profesional.foto_url}
                alt={profesional.nombre}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/30 to-primary-600/20">
                <Zap className="w-8 h-8 text-primary-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-dark-100 truncate">
                {profesional.nombre} {profesional.apellido?.charAt(0)}.
              </h3>
              <div className="flex items-center gap-1 text-xs bg-dark-800 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-dark-200">{profesional.calificacion.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-sm text-primary-400 font-medium">
              {nombreCategoria}
            </p>

            {profesional.zona_base && (
              <p className="text-xs text-dark-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {profesional.zona_base.nombre}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Botones de contacto directo */}
      <div className="px-4 pb-4 flex gap-2">
        <a
          href={telLink}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl text-dark-200 text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="w-4 h-4" />
          Llamar
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </article>
  )
}
