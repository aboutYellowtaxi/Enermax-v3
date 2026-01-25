// AI Matching Algorithm for Enermax V3
// Matches clients with the best professional based on multiple factors

import type { Profesional, Servicio } from './database.types'
import { calcularDistancia } from './constants'

export interface MatchScore {
  profesional: Profesional & { servicios: Servicio[] }
  score: number
  factors: {
    rating: number
    distance: number
    availability: number
    experience: number
    price: number
    responseTime: number
    completionRate: number
  }
  explanation: string[]
}

export interface MatchCriteria {
  categoria: string
  lat?: number
  lng?: number
  presupuesto?: number
  urgencia?: 'baja' | 'media' | 'alta'
  fecha?: Date
  horario?: string
}

// Weights for each factor (must sum to 1)
const WEIGHTS = {
  rating: 0.25,
  distance: 0.20,
  availability: 0.15,
  experience: 0.15,
  price: 0.10,
  responseTime: 0.10,
  completionRate: 0.05,
}

export function calculateMatchScore(
  profesional: Profesional & { servicios: Servicio[] },
  criteria: MatchCriteria
): MatchScore {
  const factors = {
    rating: calculateRatingScore(profesional),
    distance: calculateDistanceScore(profesional, criteria),
    availability: calculateAvailabilityScore(profesional, criteria),
    experience: calculateExperienceScore(profesional),
    price: calculatePriceScore(profesional.servicios, criteria),
    responseTime: calculateResponseTimeScore(profesional),
    completionRate: calculateCompletionRateScore(profesional),
  }

  const score = Object.entries(factors).reduce((acc, [key, value]) => {
    return acc + value * WEIGHTS[key as keyof typeof WEIGHTS]
  }, 0)

  const explanation = generateExplanation(profesional, factors)

  return { profesional, score, factors, explanation }
}

function calculateRatingScore(profesional: Profesional): number {
  // Rating score: 0-100 based on calificacion (1-5)
  const baseScore = ((profesional.calificacion - 1) / 4) * 80
  // Bonus for having many reviews (up to 20 points)
  const reviewBonus = Math.min(profesional.total_reviews / 50, 1) * 20
  return Math.min(baseScore + reviewBonus, 100)
}

function calculateDistanceScore(
  profesional: Profesional,
  criteria: MatchCriteria
): number {
  if (!criteria.lat || !criteria.lng || !profesional.lat || !profesional.lng) {
    return 50 // Neutral score if no location
  }

  const distance = calcularDistancia(
    criteria.lat, criteria.lng,
    profesional.lat, profesional.lng
  )

  // Score based on distance (0-10km = 100, 10-25km = 75, 25-50km = 50, >50km = 25)
  if (distance <= 10) return 100
  if (distance <= 25) return 75
  if (distance <= 50) return 50
  return 25
}

function calculateAvailabilityScore(
  profesional: Profesional,
  criteria: MatchCriteria
): number {
  // Base availability
  if (!profesional.disponible) return 0
  if (!profesional.activo) return 0

  let score = 70 // Base score for being available

  // Premium professionals get a boost
  if (profesional.premium) score += 15

  // Verified professionals get a boost
  if (profesional.verificado) score += 15

  return Math.min(score, 100)
}

function calculateExperienceScore(profesional: Profesional): number {
  const years = profesional.experiencia_anos

  // Score based on experience
  if (years >= 10) return 100
  if (years >= 5) return 80
  if (years >= 3) return 60
  if (years >= 1) return 40
  return 20
}

function calculatePriceScore(
  servicios: Servicio[],
  criteria: MatchCriteria
): number {
  if (!criteria.presupuesto || servicios.length === 0) return 50

  const avgPrecio = servicios.reduce((acc, s) => acc + s.precio, 0) / servicios.length

  // Score based on how well price matches budget
  const ratio = avgPrecio / criteria.presupuesto

  if (ratio <= 0.5) return 100 // Well under budget
  if (ratio <= 0.8) return 90
  if (ratio <= 1.0) return 80 // At budget
  if (ratio <= 1.2) return 60 // Slightly over
  if (ratio <= 1.5) return 40
  return 20 // Way over budget
}

function calculateResponseTimeScore(profesional: Profesional): number {
  // This would use historical data - for now using total_trabajos as proxy
  // More jobs = faster responder assumption
  const jobs = profesional.total_trabajos

  if (jobs >= 100) return 100
  if (jobs >= 50) return 80
  if (jobs >= 20) return 60
  if (jobs >= 5) return 40
  return 20
}

function calculateCompletionRateScore(profesional: Profesional): number {
  // This would use historical data - for now assuming based on verification
  let score = 70
  if (profesional.verificado) score += 20
  if (profesional.premium) score += 10
  return Math.min(score, 100)
}

function generateExplanation(
  profesional: Profesional,
  factors: MatchScore['factors']
): string[] {
  const explanation: string[] = []

  if (factors.rating >= 80) {
    explanation.push(`Excelente calificación de ${profesional.calificacion.toFixed(1)} estrellas`)
  }

  if (factors.distance >= 80) {
    explanation.push('Muy cerca de tu ubicación')
  }

  if (profesional.verificado) {
    explanation.push('Profesional verificado por Enermax')
  }

  if (profesional.premium) {
    explanation.push('Profesional Premium')
  }

  if (factors.experience >= 80) {
    explanation.push(`${profesional.experiencia_anos}+ años de experiencia`)
  }

  if (profesional.total_trabajos >= 50) {
    explanation.push(`${profesional.total_trabajos} trabajos completados`)
  }

  return explanation
}

// Main matching function
export function matchProfesionales(
  profesionales: (Profesional & { servicios: Servicio[] })[],
  criteria: MatchCriteria
): MatchScore[] {
  // Filter by category first
  const filtered = profesionales.filter(p =>
    p.categorias?.includes(criteria.categoria) &&
    p.activo &&
    p.disponible
  )

  // Calculate scores
  const scored = filtered.map(p => calculateMatchScore(p, criteria))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  return scored
}

// Fraud detection score
export function calculateFraudScore(data: {
  clienteEmail?: string | null
  clienteTelefono: string
  direccion: string
  monto: number
  esNuevoUsuario: boolean
  intentosPrevios: number
}): { score: number; flags: string[] } {
  let score = 0
  const flags: string[] = []

  // New user + high amount = suspicious
  if (data.esNuevoUsuario && data.monto > 50000) {
    score += 20
    flags.push('Primer pedido con monto alto')
  }

  // Multiple attempts
  if (data.intentosPrevios > 3) {
    score += 30
    flags.push('Múltiples intentos de pago')
  }

  // No email provided
  if (!data.clienteEmail) {
    score += 10
    flags.push('Sin email registrado')
  }

  // Very high amount
  if (data.monto > 100000) {
    score += 15
    flags.push('Monto inusualmente alto')
  }

  return { score: Math.min(score, 100), flags }
}
