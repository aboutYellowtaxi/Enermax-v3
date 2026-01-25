'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, CreditCard, CheckCircle, ChevronRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfessionalCard from '@/components/ProfessionalCard'
import ProfessionalsStorySection from '@/components/ProfessionalsStorySection'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { supabase } from '@/lib/supabase'
import { CATEGORIAS, ZONAS_AMBA } from '@/lib/constants'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

type ProfesionalConDetalles = Profesional & {
  servicios: Servicio[]
  zona_base: Zona | null
}

function HomeContent() {
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
        let resultado = data.map((p: any) => ({
          ...p,
          zona_base: Array.isArray(p.zona_base) ? p.zona_base[0] || null : p.zona_base
        }))

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
    router.push(`/?${params.toString()}#profesionales`, { scroll: false })
  }

  const handleZonaChange = (z: string) => {
    setZona(z)
    const params = new URLSearchParams()
    if (categoria) params.set('categoria', categoria)
    if (z) params.set('zona', z)
    router.push(`/?${params.toString()}#profesionales`, { scroll: false })
  }

  return (
    <>
      {/* Compact Hero */}
      <section className="pt-20 pb-6 bg-dark-950">
        <div className="section">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-dark-100 mb-3">
              Encontra tu profesional
            </h1>
            <p className="text-dark-400">
              Electricistas, plomeros, gasistas y mas. Pago protegido.
            </p>
          </div>
        </div>
      </section>

      {/* Stories Section - Instagram style */}
      <ProfessionalsStorySection
        profesionales={profesionales}
        loading={loading}
      />

      {/* Category Pills - Horizontal scroll */}
      <section className="py-4 bg-dark-950 sticky top-16 z-30 border-b border-dark-800">
        <div className="section">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoriaChange('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !categoria
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              Todos
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoriaChange(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoria === cat.id
                    ? 'bg-primary-500 text-dark-900'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Zone filter */}
          <div className="mt-3 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-dark-500" />
            <select
              value={zona}
              onChange={(e) => handleZonaChange(e.target.value)}
              className="bg-transparent text-sm text-dark-300 border-none focus:ring-0 cursor-pointer"
            >
              <option value="">Todas las zonas</option>
              {ZONAS_AMBA.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* All Professionals Grid */}
      <section id="profesionales" className="py-8">
        <div className="section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-100">
              {loading ? 'Buscando...' : (
                profesionales.length > 0
                  ? `${profesionales.length} profesional${profesionales.length !== 1 ? 'es' : ''}`
                  : 'Sin resultados'
              )}
              {categoria && ` en ${CATEGORIAS.find(c => c.id === categoria)?.nombre}`}
              {zona && ` - ${zona}`}
            </h2>

            {(categoria || zona) && (
              <button
                onClick={() => {
                  setCategoria('')
                  setZona('')
                  router.push('/')
                }}
                className="text-sm text-primary-400 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" text="Cargando profesionales..." />
            </div>
          ) : profesionales.length === 0 ? (
            <EmptyState
              title="No encontramos profesionales"
              description="Proba con otros filtros o en otra zona"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profesionales.map((pro) => (
                <ProfessionalCard key={pro.id} profesional={pro} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works - Simplified */}
      <section id="como-funciona" className="py-16 bg-dark-900/50">
        <div className="section">
          <h2 className="text-2xl font-bold text-dark-100 text-center mb-10">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="font-semibold text-dark-100 mb-2">1. Elegi</h3>
              <p className="text-sm text-dark-400">
                Busca por categoria y zona
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="font-semibold text-dark-100 mb-2">2. Paga seguro</h3>
              <p className="text-sm text-dark-400">
                Tu dinero queda protegido
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="font-semibold text-dark-100 mb-2">3. Confirma</h3>
              <p className="text-sm text-dark-400">
                Solo pagas si queda bien
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for professionals */}
      <section className="py-16">
        <div className="section">
          <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-2xl p-8 text-center border border-primary-500/20">
            <h2 className="text-2xl font-bold text-dark-100 mb-3">
              Sos profesional?
            </h2>
            <p className="text-dark-300 mb-6 max-w-md mx-auto">
              Unite y consegui nuevos clientes. Registro gratis.
            </p>
            <Link href="/registro-profesional" className="btn-primary">
              Registrarme gratis
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <Suspense fallback={<div className="py-20"><LoadingSpinner size="lg" text="Cargando..." /></div>}>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  )
}
