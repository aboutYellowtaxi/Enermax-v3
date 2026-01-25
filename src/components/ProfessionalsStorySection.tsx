'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Plus, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import ProfessionalStoryCard from './ProfessionalStoryCard'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

type ProfesionalConDetalles = Profesional & {
  servicios: Servicio[]
  zona_base: Zona | null
}

interface ProfessionalsStorySectionProps {
  profesionales: ProfesionalConDetalles[]
  loading: boolean
}

export default function ProfessionalsStorySection({
  profesionales,
  loading
}: ProfessionalsStorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-8 bg-dark-950">
      <div className="section">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-100">
            Profesionales destacados
          </h2>

          {/* Scroll controls - desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stories scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            // Loading skeletons
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-32 h-44 rounded-2xl bg-dark-800 animate-pulse"
                />
              ))}
            </>
          ) : (
            <>
              {/* Professional cards */}
              {profesionales.slice(0, 10).map((pro) => (
                <div key={pro.id} className="snap-start">
                  <ProfessionalStoryCard profesional={pro} />
                </div>
              ))}

              {/* "Add your service" card - always at the end */}
              <Link
                href="/registro-profesional"
                className="flex-shrink-0 w-32 group snap-start"
              >
                <div className="w-32 h-44 rounded-2xl border-2 border-dashed border-dark-600 hover:border-primary-500 bg-dark-800/50 hover:bg-dark-800 transition-all flex flex-col items-center justify-center gap-3 group-hover:shadow-lg group-hover:shadow-primary-500/10">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 group-hover:bg-primary-500/30 flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm font-medium text-dark-200">Sos profesional?</p>
                    <p className="text-xs text-primary-400">Unite gratis</p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Hint for mobile */}
        <p className="md:hidden text-center text-xs text-dark-500 mt-2">
          Desliza para ver mas
        </p>
      </div>
    </section>
  )
}
