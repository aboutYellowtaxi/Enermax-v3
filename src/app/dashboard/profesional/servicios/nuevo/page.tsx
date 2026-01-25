'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Plus, DollarSign, Clock, Star, AlertCircle, CheckCircle
} from 'lucide-react'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { CATEGORIAS } from '@/lib/constants'

export default function NuevoServicioPage() {
  const { user, role, profesionalId, loading: authLoading } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_desde: false,
    duracion_minutos: 60,
    categoria_id: '',
    destacado: false,
  })

  // Suggested services based on common needs
  const SERVICIOS_SUGERIDOS = [
    { nombre: 'Instalación de tomacorriente', precio: 8500, duracion: 60 },
    { nombre: 'Destape de cañería', precio: 12000, duracion: 60 },
    { nombre: 'Revisión de pérdida de gas', precio: 12000, duracion: 60 },
    { nombre: 'Reparación de pérdida de agua', precio: 8000, duracion: 45 },
    { nombre: 'Instalación de aire split', precio: 55000, duracion: 240 },
    { nombre: 'Pintura de habitación', precio: 45000, duracion: 480 },
    { nombre: 'Apertura de puerta', precio: 15000, duracion: 45 },
    { nombre: 'Limpieza profunda', precio: 25000, duracion: 180 },
  ]

  useEffect(() => {
    if (!authLoading && role !== 'profesional') {
      router.push('/')
    }
  }, [role, authLoading, router])

  const handleSugerido = (sugerido: typeof SERVICIOS_SUGERIDOS[0]) => {
    setFormData(prev => ({
      ...prev,
      nombre: sugerido.nombre,
      precio: sugerido.precio.toString(),
      duracion_minutos: sugerido.duracion,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profesionalId) return

    setError('')
    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('servicios')
        .insert({
          profesional_id: profesionalId,
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          precio: parseFloat(formData.precio),
          precio_desde: formData.precio_desde,
          duracion_minutos: formData.duracion_minutos,
          destacado: formData.destacado,
          activo: true,
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/profesional?view=servicios')
      }, 1500)

    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error al crear el servicio')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark-100 mb-2">
            Servicio creado!
          </h1>
          <p className="text-dark-400">
            Redirigiendo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <div className="section pt-24 pb-12">
        {/* Back button */}
        <Link
          href="/dashboard/profesional"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-dark-100 mb-2">
            Agregar nuevo servicio
          </h1>
          <p className="text-dark-400 mb-8">
            Los clientes verán este servicio en tu perfil y podrán contratarlo
          </p>

          {/* Quick suggestions */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 mb-8">
            <h3 className="font-medium text-dark-100 mb-3">
              Servicios populares (toca para usar)
            </h3>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_SUGERIDOS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSugerido(sug)}
                  className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-dark-300 text-sm rounded-lg transition-colors"
                >
                  {sug.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Nombre del servicio *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="input"
                placeholder="Ej: Instalación de tomacorriente"
                required
              />
            </div>

            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                className="input min-h-[100px]"
                placeholder="Describí el servicio, qué incluye, materiales, etc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.precio}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                    className="input pl-12"
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Duración aprox.</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <select
                    value={formData.duracion_minutos}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) }))}
                    className="input pl-12"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                    <option value={180}>3 horas</option>
                    <option value={240}>4 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="precio_desde"
                checked={formData.precio_desde}
                onChange={(e) => setFormData(prev => ({ ...prev, precio_desde: e.target.checked }))}
                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="precio_desde" className="text-dark-300">
                Es precio "desde" (el precio final puede variar)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="destacado"
                checked={formData.destacado}
                onChange={(e) => setFormData(prev => ({ ...prev, destacado: e.target.checked }))}
                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="destacado" className="text-dark-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Marcar como destacado (aparece primero en tu perfil)
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/profesional" className="btn-secondary flex-1">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.nombre || !formData.precio}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear servicio
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
