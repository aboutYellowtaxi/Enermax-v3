'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, CheckCircle2, Shield, Zap, ChevronRight, Phone, Search } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfessionalCard from '@/components/ProfessionalCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { CATEGORIAS, ZONAS_AMBA } from '@/lib/constants'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

type ProfesionalConDetalles = Profesional & {
  servicios: Servicio[]
  zona_base: Zona | null
}

// SEO content for each category
const SEO_CONTENT: Record<string, { titulo: string; descripcion: string; beneficios: string[] }> = {
  electricidad: {
    titulo: 'Electricistas Profesionales',
    descripcion: 'Encontra electricistas matriculados y verificados en tu zona. Instalaciones, reparaciones, urgencias 24hs.',
    beneficios: [
      'Electricistas matriculados y verificados',
      'Instalaciones domiciliarias e industriales',
      'Urgencias electricas 24 horas',
      'Precios transparentes sin sorpresas',
    ]
  },
  plomeria: {
    titulo: 'Plomeros Profesionales',
    descripcion: 'Plomeros con experiencia para destapes, reparaciones, instalaciones sanitarias y mas.',
    beneficios: [
      'Destapes con maquina profesional',
      'Reparacion de perdidas',
      'Instalacion de griferias',
      'Termotanques y calefones',
    ]
  },
  gas: {
    titulo: 'Gasistas Matriculados',
    descripcion: 'Gasistas con matricula ENARGAS vigente. Instalaciones seguras, certificaciones y reparaciones.',
    beneficios: [
      'Matricula ENARGAS vigente',
      'Certificaciones de gas',
      'Instalacion de calefactores',
      'Deteccion de perdidas de gas',
    ]
  },
  pintura: {
    titulo: 'Pintores Profesionales',
    descripcion: 'Pintores con experiencia para interiores, exteriores, empapelado e impermeabilizacion.',
    beneficios: [
      'Pintura de interiores y exteriores',
      'Empapelado profesional',
      'Impermeabilizacion de terrazas',
      'Materiales de primera calidad',
    ]
  },
  carpinteria: {
    titulo: 'Carpinteros y Muebleros',
    descripcion: 'Carpinteros para muebles a medida, placares, cocinas y reparaciones.',
    beneficios: [
      'Muebles a medida',
      'Placares y vestidores',
      'Cocinas y bajo mesadas',
      'Reparacion de muebles',
    ]
  },
  cerrajeria: {
    titulo: 'Cerrajeros 24 Horas',
    descripcion: 'Cerrajeros de urgencia las 24 horas. Apertura de puertas, cambio de cerraduras.',
    beneficios: [
      'Atencion 24 horas',
      'Apertura sin danos',
      'Cerraduras de seguridad',
      'Respuesta rapida',
    ]
  },
  aire: {
    titulo: 'Tecnicos de Aire Acondicionado',
    descripcion: 'Instalacion, mantenimiento y reparacion de aires split. Carga de gas, limpieza.',
    beneficios: [
      'Instalacion de split',
      'Carga de gas refrigerante',
      'Mantenimiento preventivo',
      'Todas las marcas',
    ]
  },
  limpieza: {
    titulo: 'Servicios de Limpieza',
    descripcion: 'Limpieza profesional para hogares y oficinas. Limpieza profunda, post obra, mudanzas.',
    beneficios: [
      'Limpieza profunda',
      'Post obra y mudanzas',
      'Productos incluidos',
      'Personal de confianza',
    ]
  },
}

export default function CategoriaPage() {
  const params = useParams()
  const categoria = params.categoria as string

  const [profesionales, setProfesionales] = useState<ProfesionalConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [zonaFilter, setZonaFilter] = useState('')

  const categoriaInfo = CATEGORIAS.find(c => c.id === categoria)
  const seoContent = SEO_CONTENT[categoria] || {
    titulo: `${categoriaInfo?.nombre || 'Profesionales'}`,
    descripcion: `Encontra los mejores profesionales de ${categoriaInfo?.nombre || 'servicios'} en tu zona.`,
    beneficios: ['Profesionales verificados', 'Pago protegido', 'Garantia de satisfaccion', 'Sin sorpresas']
  }

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
        .contains('categorias', [categoria])
        .order('calificacion', { ascending: false })

      const { data, error } = await query

      if (!error && data) {
        let resultado = data.map((p: any) => ({
          ...p,
          zona_base: Array.isArray(p.zona_base) ? p.zona_base[0] || null : p.zona_base
        }))

        if (zonaFilter) {
          resultado = resultado.filter((p: ProfesionalConDetalles) =>
            p.zona_base?.nombre?.toLowerCase().includes(zonaFilter.toLowerCase())
          )
        }

        setProfesionales(resultado)
      }

      setLoading(false)
    }

    fetchProfesionales()
  }, [categoria, zonaFilter])

  if (!categoriaInfo) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Header />
        <div className="section pt-24 text-center py-20">
          <h1 className="text-2xl font-bold text-dark-100 mb-4">
            Categoria no encontrada
          </h1>
          <Link href="/" className="btn-primary">
            Ver todos los servicios
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      {/* Hero Section with SEO content */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="section">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-dark-400 mb-6">
              <Link href="/" className="hover:text-dark-200">Inicio</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/#categorias" className="hover:text-dark-200">Servicios</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-dark-200">{categoriaInfo.nombre}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-bold text-dark-100 mb-4">
              {seoContent.titulo}
              <span className="block text-primary-400 mt-2">en Buenos Aires</span>
            </h1>

            <p className="text-lg text-dark-400 mb-8 max-w-2xl">
              {seoContent.descripcion}
            </p>

            {/* Benefits grid */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {seoContent.beneficios.map((beneficio, i) => (
                <div key={i} className="flex items-center gap-2 text-dark-300">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  {beneficio}
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-dark-800/50 rounded-full px-4 py-2 text-sm">
                <Shield className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Pago protegido</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800/50 rounded-full px-4 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Profesionales verificados</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800/50 rounded-full px-4 py-2 text-sm">
                <Star className="w-4 h-4 text-primary-400" />
                <span className="text-dark-300">Garantia de satisfaccion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone filter */}
      <section className="py-6 bg-dark-950 sticky top-16 z-30 border-b border-dark-800">
        <div className="section">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <select
                  value={zonaFilter}
                  onChange={(e) => setZonaFilter(e.target.value)}
                  className="input pl-12"
                >
                  <option value="">Todas las zonas</option>
                  {ZONAS_AMBA.map((zona) => (
                    <option key={zona} value={zona}>{zona}</option>
                  ))}
                </select>
              </div>
            </div>
            <span className="text-sm text-dark-400">
              {loading ? 'Buscando...' : `${profesionales.length} profesional${profesionales.length !== 1 ? 'es' : ''}`}
            </span>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="section">
          {loading ? (
            <div className="py-20">
              <LoadingSpinner size="lg" text={`Buscando ${categoriaInfo.nombre.toLowerCase()}...`} />
            </div>
          ) : profesionales.length === 0 ? (
            <div className="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl">
              <Search className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-100 mb-2">
                No encontramos {categoriaInfo.nombre.toLowerCase()} en esta zona
              </h3>
              <p className="text-dark-400 mb-6">
                Proba buscando en otra zona o mirá todos los profesionales
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setZonaFilter('')}
                  className="btn-secondary"
                >
                  Ver todas las zonas
                </button>
                <Link href="/" className="btn-primary">
                  Ver todos los servicios
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profesionales.map((pro) => (
                <ProfessionalCard key={pro.id} profesional={pro} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEO content section */}
      <section className="py-16 bg-dark-900/50">
        <div className="section">
          <div className="max-w-3xl mx-auto prose prose-invert">
            <h2 className="text-2xl font-bold text-dark-100 mb-6">
              Encontra {categoriaInfo.nombre} de confianza
            </h2>
            <p className="text-dark-300 mb-4">
              En Enermax conectamos a los mejores profesionales de {categoriaInfo.nombre.toLowerCase()} con
              clientes que necesitan servicios de calidad. Todos nuestros profesionales estan verificados
              y cuentan con experiencia comprobada.
            </p>
            <p className="text-dark-300 mb-4">
              Al contratar a traves de Enermax, tu pago queda protegido hasta que confirmes que el trabajo
              esta bien hecho. Si no estas satisfecho, te devolvemos el dinero.
            </p>

            <h3 className="text-xl font-bold text-dark-100 mt-8 mb-4">
              Zonas de cobertura
            </h3>
            <p className="text-dark-300">
              Contamos con {categoriaInfo.nombre.toLowerCase()} disponibles en: {ZONAS_AMBA.slice(0, 8).join(', ')} y mas localidades del AMBA.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="section">
          <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl p-8 md:p-12 text-center border border-primary-500/20">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-100 mb-4">
              Sos {categoriaInfo.nombre.toLowerCase()}?
            </h2>
            <p className="text-dark-300 mb-8 max-w-xl mx-auto">
              Unite a Enermax y consegui nuevos clientes. Cobra de forma segura y hace crecer tu negocio.
            </p>
            <Link href="/registro?tipo=profesional" className="btn-primary btn-lg">
              Registrate gratis
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
