'use client'

import { useState } from 'react'
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'
import CategoryPill from './CategoryPill'
import { CATEGORIAS, ZONAS_AMBA } from '@/lib/constants'

interface SearchFiltersProps {
  categoria: string
  zona: string
  onCategoriaChange: (cat: string) => void
  onZonaChange: (zona: string) => void
}

export default function SearchFilters({
  categoria,
  zona,
  onCategoriaChange,
  onZonaChange
}: SearchFiltersProps) {
  const [showZonas, setShowZonas] = useState(false)

  return (
    <div className="space-y-4">
      {/* Categories horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryPill
          id="todos"
          nombre="Todos"
          icono="Sparkles"
          isActive={!categoria}
          onClick={() => onCategoriaChange('')}
        />
        {CATEGORIAS.map((cat) => (
          <CategoryPill
            key={cat.id}
            id={cat.id}
            nombre={cat.nombre}
            icono={cat.icono}
            isActive={categoria === cat.id}
            onClick={() => onCategoriaChange(cat.id)}
          />
        ))}
      </div>

      {/* Zone filter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowZonas(!showZonas)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
            zona
              ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-transparent'
          }`}
        >
          <MapPin className="w-4 h-4" />
          {zona || 'Seleccionar zona'}
          {zona && (
            <X
              className="w-4 h-4 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation()
                onZonaChange('')
              }}
            />
          )}
        </button>
      </div>

      {/* Zone dropdown */}
      {showZonas && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 animate-slide-up">
          <div className="flex flex-wrap gap-2">
            {ZONAS_AMBA.map((z) => (
              <button
                key={z}
                onClick={() => {
                  onZonaChange(z)
                  setShowZonas(false)
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  zona === z
                    ? 'bg-primary-400 text-dark-900'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
