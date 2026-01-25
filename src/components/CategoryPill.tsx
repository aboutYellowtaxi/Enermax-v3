'use client'

import {
  Zap, Droplets, Flame, PaintBucket, Hammer, Key,
  Wind, Sparkles, TreePine, LucideIcon, Blocks
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Droplets,
  Flame,
  PaintBucket,
  Hammer,
  Key,
  Wind,
  Sparkles,
  TreePine,
  Blocks,
}

interface CategoryPillProps {
  id: string
  nombre: string
  icono?: string
  isActive: boolean
  onClick: () => void
}

export default function CategoryPill({
  id,
  nombre,
  icono,
  isActive,
  onClick
}: CategoryPillProps) {
  const Icon = icono ? ICONS[icono] || Zap : Zap

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        isActive
          ? 'bg-primary-400 text-dark-900 shadow-lg shadow-primary-500/25'
          : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-dark-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {nombre}
    </button>
  )
}
