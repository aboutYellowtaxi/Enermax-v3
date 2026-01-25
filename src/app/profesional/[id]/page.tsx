'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Star, MapPin, CheckCircle2, Clock, Shield,
  Phone, MessageCircle, Calendar, Zap, ChevronRight
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { formatPrecio, formatFecha } from '@/lib/constants'
import type { Profesional, Servicio, Zona, Review } from '@/lib/database.types'

type ProfesionalCompleto = Profesional & {
  servicios: Servicio[]
  zona_base: Zona | null
  reviews: (Review & { cliente_nombre?: string })[]
}

export default function ProfesionalPage() {
  const params = useParams()
  const router = useRouter()
  const [profesional, setProfesional] = useState<ProfesionalCompleto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfesional() {
      const { data, error } = await supabase
        .from('profesionales')
        .select(`
          *,
          servicios (*),
          zona_base:zonas!profesionales_zona_base_id_fkey (*),
          reviews (*)
        `)
        .eq('id', params.id)
        .single()

      if (!error && data) {
        setProfesional({
          ...data,
          zona_base: Array.isArray(data.zona_base) ? data.zona_base[0] || null : data.zona_base
        } as ProfesionalCompleto)
      }
      setLoading(false)
    }

    if (params.id) {
      fetchProfesional()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    )
  }

  if (!profesional) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Header />
        <div className="section pt-24">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-dark-100 mb-4">
              Profesional no encontrado
            </h1>
            <Link href="/" className="btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      {/* Back button */}
      <div className="section pt-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Profile Header */}
      <section className="section pb-8">
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-40 md:h-56 bg-gradient-to-br from-primary-500/20 to-primary-600/10 relative">
            {profesional.banner_url && (
              <Image
                src={profesional.banner_url}
                alt="Banner"
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Profile info */}
          <div className="p-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl border-4 border-dark-900 overflow-hidden bg-dark-800 flex-shrink-0">
                {profesional.foto_url ? (
                  <Image
                    src={profesional.foto_url}
                    alt={profesional.nombre}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-500/20">
                    <Zap className="w-12 h-12 text-primary-400" />
                  </div>
                )}
              </div>

              {/* Name and badges */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-dark-100">
                    {profesional.nombre} {profesional.apellido}
                  </h1>
                  {profesional.verificado && (
                    <span className="badge-success">
                      <CheckCircle2 className="w-3 h-3" />
                      Verificado
                    </span>
                  )}
                  {profesional.premium && (
                    <span className="badge-primary">Premium</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{profesional.calificacion.toFixed(1)}</span>
                    <span className="text-dark-400">({profesional.total_reviews} reseñas)</span>
                  </div>
                  {profesional.zona_base && (
                    <div className="flex items-center gap-1 text-dark-400">
                      <MapPin className="w-4 h-4" />
                      {profesional.zona_base.nombre}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-dark-400">
                    <Clock className="w-4 h-4" />
                    {profesional.experiencia_anos} años de experiencia
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profesional.bio && (
              <p className="text-dark-300 mb-6">
                {profesional.bio}
              </p>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2 text-sm">
                <Shield className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Pago protegido</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2 text-sm">
                <Clock className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Responde rápido</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">{profesional.total_trabajos} trabajos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section py-8">
        <h2 className="text-xl font-bold text-dark-100 mb-6">Servicios</h2>

        <div className="grid gap-4">
          {profesional.servicios.map((servicio) => (
            <Link
              key={servicio.id}
              href={`/contratar/${profesional.id}/${servicio.id}`}
              className="bg-dark-900 border border-dark-800 rounded-xl p-5 hover:border-primary-500/30 hover:bg-dark-800/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors mb-1">
                    {servicio.nombre}
                  </h3>
                  {servicio.descripcion && (
                    <p className="text-sm text-dark-400 mb-2 line-clamp-2">
                      {servicio.descripcion}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{servicio.duracion_minutos} min
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-xl font-bold text-primary-400">
                    {servicio.precio_desde && 'Desde '}
                    {formatPrecio(servicio.precio)}
                  </div>
                  <span className="text-xs text-dark-500">precio final</span>
                </div>
                <ChevronRight className="w-5 h-5 text-dark-600 ml-2 group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}

          {profesional.servicios.length === 0 && (
            <div className="text-center py-12 text-dark-400">
              Este profesional no tiene servicios disponibles
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="section py-8">
        <h2 className="text-xl font-bold text-dark-100 mb-6">
          Reseñas ({profesional.reviews.length})
        </h2>

        {profesional.reviews.length > 0 ? (
          <div className="grid gap-4">
            {profesional.reviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="bg-dark-900 border border-dark-800 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.calificacion
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-dark-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-dark-500">
                    {formatFecha(review.created_at)}
                  </span>
                </div>
                {review.comentario && (
                  <p className="text-dark-300 text-sm">{review.comentario}</p>
                )}
                {review.respuesta && (
                  <div className="mt-3 pl-4 border-l-2 border-primary-500/30">
                    <p className="text-xs text-dark-500 mb-1">Respuesta del profesional:</p>
                    <p className="text-dark-400 text-sm">{review.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark-400">
            Todavía no hay reseñas
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
