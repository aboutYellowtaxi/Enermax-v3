'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, Clock, Star, ChevronRight, Zap, Users, CreditCard, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfessionalCard from '@/components/ProfessionalCard'
import SearchFilters from '@/components/SearchFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { supabase } from '@/lib/supabase'
import { CATEGORIAS, formatPrecio } from '@/lib/constants'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

type ProfesionalConDetalles = Profesional & {
  servicios: Servicio[]
  zona_base: Zona | null
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [profesionales, setProfesionales] = useState<ProfesionalConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '')
  const [zona, setZona] = useState(searchParams.get('zona') || '')

  useEffect(() => {
    async function fetchProfesionales() {
      setLoading(true)

      let query = supabase
        .from('profesionales')
        .select(`
          *,
          servicios (*),
          zona_base:zonas!profesionales_zona_base_id_fkey (*)
        `)
        .eq('activo', true)
        .eq('disponible', true)
        .order('calificacion', { ascending: false })

      if (categoria) {
        query = query.contains('categorias', [categoria])
      }

      const { data, error } = await query

      if (!error && data) {
        // Process zona_base (may come as array from Supabase)
        let resultado = data.map((p: any) => ({
          ...p,
          zona_base: Array.isArray(p.zona_base) ? p.zona_base[0] || null : p.zona_base
        }))

        // Filter by zona if selected
        if (zona) {
          resultado = resultado.filter((p: ProfesionalConDetalles) =>
            p.zona_base?.nombre?.toLowerCase().includes(zona.toLowerCase())
          )
        }

        setProfesionales(resultado)
      }

      setLoading(false)
    }

    fetchProfesionales()
  }, [categoria, zona])

  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat)
    const params = new URLSearchParams()
    if (cat) params.set('categoria', cat)
    if (zona) params.set('zona', zona)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleZonaChange = (z: string) => {
    setZona(z)
    const params = new URLSearchParams()
    if (categoria) params.set('categoria', categoria)
    if (z) params.set('zona', z)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="section">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-100 mb-4">
              Profesionales de confianza
              <span className="block gradient-text">para tu hogar</span>
            </h1>
            <p className="text-lg text-dark-400 mb-8">
              Electricistas, plomeros, gasistas y más. Verificados, con pago protegido
              y garantía de satisfacción.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-dark-800/50 rounded-full px-4 py-2 text-sm">
                <Shield className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Pago protegido</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800/50 rounded-full px-4 py-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Profesionales verificados</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800/50 rounded-full px-4 py-2 text-sm">
                <Star className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Garantía de satisfacción</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section id="categorias" className="py-6 bg-dark-950 sticky top-16 z-30 border-b border-dark-800">
        <div className="section">
          <SearchFilters
            categoria={categoria}
            zona={zona}
            onCategoriaChange={handleCategoriaChange}
            onZonaChange={handleZonaChange}
          />
        </div>
      </section>

      {/* Professionals Grid */}
      <section className="py-12">
        <div className="section">
          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-100">
              {loading ? 'Buscando profesionales...' : (
                profesionales.length > 0
                  ? `${profesionales.length} profesional${profesionales.length !== 1 ? 'es' : ''} disponible${profesionales.length !== 1 ? 's' : ''}`
                  : 'No hay profesionales'
              )}
              {categoria && ` en ${CATEGORIAS.find(c => c.id === categoria)?.nombre || categoria}`}
              {zona && ` en ${zona}`}
            </h2>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingSpinner size="lg" text="Cargando profesionales..." />
            </div>
          ) : profesionales.length === 0 ? (
            <EmptyState
              title="No encontramos profesionales"
              description="Probá cambiando los filtros o buscando en otra zona"
              action={{
                label: 'Ver todos',
                onClick: () => {
                  setCategoria('')
                  setZona('')
                  router.push('/')
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
              {profesionales.map((pro) => (
                <ProfessionalCard key={pro.id} profesional={pro} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-dark-900/50">
        <div className="section">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-100 mb-4">
              Cómo funciona
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Contratar un profesional nunca fue tan fácil y seguro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">
                1. Elegí un profesional
              </h3>
              <p className="text-dark-400">
                Buscá por categoría y zona. Compará precios, calificaciones y reviews de otros clientes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">
                2. Pagá de forma segura
              </h3>
              <p className="text-dark-400">
                Tu pago queda protegido. Solo se libera cuando confirmás que el trabajo está bien hecho.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">
                3. Recibí el trabajo
              </h3>
              <p className="text-dark-400">
                El profesional realiza el trabajo. Cuando estés conforme, confirmás y el pago se libera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="section">
          <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl p-8 md:p-12 text-center border border-primary-500/20">
            <h2 className="text-3xl font-bold text-dark-100 mb-4">
              ¿Sos profesional?
            </h2>
            <p className="text-dark-300 mb-8 max-w-xl mx-auto">
              Unite a Enermax y conseguí nuevos clientes. Cobrá de forma segura y hacé crecer tu negocio.
            </p>
            <a href="/registro?tipo=profesional" className="btn-primary btn-lg">
              Registrate gratis
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
