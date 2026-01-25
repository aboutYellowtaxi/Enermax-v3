'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, ChevronRight, ChevronLeft, CheckCircle, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { CATEGORIAS } from '@/lib/constants'
import LoadingSpinner from '@/components/LoadingSpinner'

type Zona = {
  id: string
  nombre: string
}

export default function RegistroProfesionalPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [zonas, setZonas] = useState<Zona[]>([])

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    dni: '',
    direccion: '',
    zona_id: '',
    bio: '',
    experiencia_anos: 0,
    categorias: [] as string[],
    cbu: '',
    alias_cbu: '',
  })

  // Fetch zonas from DB
  useEffect(() => {
    async function fetchZonas() {
      const { data } = await supabase
        .from('zonas')
        .select('id, nombre')
        .eq('activa', true)
        .order('nombre')
      if (data) setZonas(data)
    }
    fetchZonas()
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/registro?tipo=profesional')
    }
  }, [user, authLoading, router])

  // Pre-fill with user data
  useEffect(() => {
    if (user?.user_metadata) {
      setFormData(prev => ({
        ...prev,
        nombre: user.user_metadata.nombre || '',
        telefono: user.user_metadata.telefono || '',
      }))
    }
  }, [user])

  const handleCategoriaToggle = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(catId)
        ? prev.categorias.filter(c => c !== catId)
        : [...prev.categorias, catId]
    }))
  }

  const handleSubmit = async () => {
    if (!user) return

    setError('')
    setLoading(true)

    try {
      // Create profesional record
      const { error: profError } = await supabase
        .from('profesionales')
        .insert({
          auth_id: user.id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          email: user.email,
          dni: formData.dni || null,
          direccion: formData.direccion || null,
          zona_base_id: formData.zona_id || null,
          bio: formData.bio || null,
          experiencia_anos: formData.experiencia_anos,
          categorias: formData.categorias,
          cbu: formData.cbu || null,
          alias_cbu: formData.alias_cbu || null,
          activo: true,
          disponible: true,
        })

      if (profError) throw profError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/profesional')
      }, 2000)

    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error al crear el perfil')
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
            ¡Perfil creado!
          </h1>
          <p className="text-dark-400">
            Redirigiendo a tu dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-400 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-dark-900" />
          </div>
          <span className="text-2xl font-bold text-dark-100">Enermax</span>
        </Link>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-12 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary-400' : 'bg-dark-700'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-dark-100 mb-2">
                Información personal
              </h2>
              <p className="text-dark-400 mb-6">
                Contanos sobre vos
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="input"
                      placeholder="Juan"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                      className="input"
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="input"
                    placeholder="11-1234-5678"
                    required
                  />
                </div>

                <div>
                  <label className="label">DNI (opcional)</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                    className="input"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label className="label">Dirección (opcional)</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    className="input"
                    placeholder="Av. Corrientes 1234, CABA"
                  />
                </div>

                <div>
                  <label className="label">Zona de trabajo</label>
                  <select
                    value={formData.zona_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, zona_id: e.target.value }))}
                    className="input"
                  >
                    <option value="">Seleccioná una zona</option>
                    {zonas.map((zona) => (
                      <option key={zona.id} value={zona.id}>
                        {zona.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-dark-100 mb-2">
                Información profesional
              </h2>
              <p className="text-dark-400 mb-6">
                Contanos sobre tu experiencia
              </p>

              <div className="space-y-5">
                <div>
                  <label className="label">Categorías de trabajo</label>
                  <p className="text-sm text-dark-500 mb-3">
                    Seleccioná todas las que apliquen
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIAS.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoriaToggle(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          formData.categorias.includes(cat.id)
                            ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                            : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
                        }`}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Años de experiencia</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experiencia_anos}
                    onChange={(e) => setFormData(prev => ({ ...prev, experiencia_anos: parseInt(e.target.value) || 0 }))}
                    className="input"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="label">Descripción / Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="input min-h-[120px]"
                    placeholder="Contá un poco sobre vos, tu experiencia y los servicios que ofrecés..."
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Payment Info */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-dark-100 mb-2">
                Datos de cobro
              </h2>
              <p className="text-dark-400 mb-6">
                Para recibir tus pagos (podés completar después)
              </p>

              <div className="space-y-5">
                <div>
                  <label className="label">CBU (opcional)</label>
                  <input
                    type="text"
                    value={formData.cbu}
                    onChange={(e) => setFormData(prev => ({ ...prev, cbu: e.target.value }))}
                    className="input"
                    placeholder="0000000000000000000000"
                    maxLength={22}
                  />
                  <p className="text-xs text-dark-500 mt-1">
                    22 dígitos - podés agregarlo después
                  </p>
                </div>

                <div>
                  <label className="label">Alias CBU (opcional)</label>
                  <input
                    type="text"
                    value={formData.alias_cbu}
                    onChange={(e) => setFormData(prev => ({ ...prev, alias_cbu: e.target.value }))}
                    className="input"
                    placeholder="mi.alias.mp"
                  />
                </div>

                <div className="bg-dark-800 rounded-xl p-4">
                  <h4 className="font-medium text-dark-100 mb-2">
                    Cómo funciona el cobro
                  </h4>
                  <ul className="space-y-2 text-sm text-dark-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      El cliente paga al contratar el servicio
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      El dinero queda retenido hasta que el cliente confirma
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Recibís el 85% del monto en tu cuenta
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-primary"
                disabled={step === 1 && (!formData.nombre || !formData.telefono)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || formData.categorias.length === 0}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Creando perfil...
                  </>
                ) : (
                  <>
                    Completar registro
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        <p className="text-center mt-6 text-dark-500 text-sm">
          <Link href="/" className="hover:text-dark-300">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
