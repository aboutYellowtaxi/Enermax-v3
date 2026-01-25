'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Shield, Clock, CheckCircle, Star, MapPin,
  Calendar, Phone, Mail, FileText, Plus, Minus, Zap, Lock
} from 'lucide-react'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { formatPrecio, calcularComision, HORARIOS, validarTelefono } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import type { Profesional, Servicio, Zona } from '@/lib/database.types'

type ProfesionalConServicio = Profesional & {
  zona_base: Zona | null
}

export default function ContratarPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [profesional, setProfesional] = useState<ProfesionalConServicio | null>(null)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    nombre: user?.user_metadata?.nombre || '',
    telefono: user?.user_metadata?.telefono || '',
    email: user?.email || '',
    direccion: '',
    notas: '',
    fecha: '',
    horario: 'manana',
  })

  // Upsell - diagnostico
  const [addDiagnostico, setAddDiagnostico] = useState(false)
  const diagnosticoPrecio = 15000

  // Coupon
  const [cuponCodigo, setCuponCodigo] = useState('')
  const [cuponDescuento, setCuponDescuento] = useState(0)
  const [cuponError, setCuponError] = useState('')

  useEffect(() => {
    async function fetchData() {
      // Fetch profesional
      const { data: proData } = await supabase
        .from('profesionales')
        .select(`*, zona_base:zonas!profesionales_zona_base_id_fkey (*)`)
        .eq('id', params.profesionalId)
        .single()

      // Fetch servicio
      const { data: servData } = await supabase
        .from('servicios')
        .select('*')
        .eq('id', params.servicioId)
        .single()

      if (proData) {
        setProfesional({
          ...proData,
          zona_base: Array.isArray(proData.zona_base) ? proData.zona_base[0] || null : proData.zona_base
        })
      }
      if (servData) {
        setServicio(servData)
      }
      setLoading(false)
    }

    fetchData()
  }, [params.profesionalId, params.servicioId])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.user_metadata?.nombre || prev.nombre,
        telefono: user.user_metadata?.telefono || prev.telefono,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const validateCupon = async () => {
    if (!cuponCodigo) return

    setCuponError('')
    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .eq('codigo', cuponCodigo.toUpperCase())
      .eq('activo', true)
      .single()

    if (error || !data) {
      setCuponError('Cupón no válido')
      setCuponDescuento(0)
      return
    }

    // Check expiry
    if (data.fecha_fin && new Date(data.fecha_fin) < new Date()) {
      setCuponError('Cupón expirado')
      setCuponDescuento(0)
      return
    }

    // Check usage limit
    if (data.usos_maximos && data.usos_actuales >= data.usos_maximos) {
      setCuponError('Cupón agotado')
      setCuponDescuento(0)
      return
    }

    // Calculate discount
    const subtotal = (servicio?.precio || 0) + (addDiagnostico ? diagnosticoPrecio : 0)
    if (data.minimo_compra && subtotal < data.minimo_compra) {
      setCuponError(`Mínimo de compra: ${formatPrecio(data.minimo_compra)}`)
      setCuponDescuento(0)
      return
    }

    const descuento = data.tipo === 'porcentaje'
      ? Math.round(subtotal * (data.valor / 100))
      : data.valor

    setCuponDescuento(descuento)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.nombre.trim()) {
      setError('Ingresá tu nombre')
      return
    }
    if (!validarTelefono(formData.telefono)) {
      setError('Ingresá un teléfono válido')
      return
    }
    if (!formData.direccion.trim()) {
      setError('Ingresá tu dirección')
      return
    }

    setSubmitting(true)

    try {
      // Create preference in MercadoPago
      const subtotal = (servicio?.precio || 0) + (addDiagnostico ? diagnosticoPrecio : 0)
      const { total, comision, profesional: montoProfesional } = calcularComision(subtotal, cuponDescuento)

      const response = await fetch('/api/mercadopago/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profesionalId: params.profesionalId,
          servicioId: params.servicioId,
          servicioNombre: servicio?.nombre + (addDiagnostico ? ' + Diagnóstico' : ''),
          monto: total,
          comision,
          montoProfesional,
          cliente: {
            authId: user?.id || null,
            nombre: formData.nombre,
            telefono: formData.telefono,
            email: formData.email,
            direccion: formData.direccion,
            notas: formData.notas,
            fechaSolicitada: formData.fecha,
            horarioPreferido: formData.horario,
          },
          cuponCodigo: cuponDescuento > 0 ? cuponCodigo : null,
          descuento: cuponDescuento,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago')
      }

      // Redirect to MercadoPago
      window.location.href = data.init_point
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profesional || !servicio) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Header />
        <div className="section pt-24 text-center py-20">
          <h1 className="text-2xl font-bold text-dark-100 mb-4">
            Servicio no encontrado
          </h1>
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = servicio.precio + (addDiagnostico ? diagnosticoPrecio : 0)
  const { total } = calcularComision(subtotal, cuponDescuento)

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <div className="section pt-20 pb-12">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <h1 className="text-2xl font-bold text-dark-100 mb-6">
                Completá tus datos
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Contact info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="11-1234-5678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email (opcional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="label">Dirección del trabajo</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Calle 123, Ciudad"
                    required
                  />
                </div>

                {/* Date and time */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Fecha preferida (opcional)</label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="label">Horario preferido</label>
                    <select
                      name="horario"
                      value={formData.horario}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {HORARIOS.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Descripción del problema (opcional)</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    className="input min-h-[100px] resize-none"
                    placeholder="Contanos más sobre lo que necesitás..."
                  />
                </div>

                {/* Upsell */}
                <div
                  onClick={() => setAddDiagnostico(!addDiagnostico)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    addDiagnostico
                      ? 'bg-primary-500/10 border-primary-500/30'
                      : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        addDiagnostico
                          ? 'bg-primary-400 border-primary-400'
                          : 'border-dark-500'
                      }`}>
                        {addDiagnostico && <CheckCircle className="w-3 h-3 text-dark-900" />}
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">Agregar diagnóstico completo</p>
                        <p className="text-sm text-dark-400">Revisión detallada del problema</p>
                      </div>
                    </div>
                    <span className="text-primary-400 font-semibold">
                      +{formatPrecio(diagnosticoPrecio)}
                    </span>
                  </div>
                </div>

                {/* Coupon */}
                <div>
                  <label className="label">¿Tenés un cupón?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cuponCodigo}
                      onChange={(e) => {
                        setCuponCodigo(e.target.value.toUpperCase())
                        setCuponError('')
                      }}
                      className="input flex-1"
                      placeholder="CODIGO"
                    />
                    <button
                      type="button"
                      onClick={validateCupon}
                      className="btn-secondary"
                    >
                      Aplicar
                    </button>
                  </div>
                  {cuponError && (
                    <p className="text-red-400 text-sm mt-1">{cuponError}</p>
                  )}
                  {cuponDescuento > 0 && (
                    <p className="text-green-400 text-sm mt-1">
                      Descuento aplicado: -{formatPrecio(cuponDescuento)}
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary btn-lg"
                >
                  {submitting ? (
                    <>
                      <div className="spinner" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pagar {formatPrecio(total)} con MercadoPago
                    </>
                  )}
                </button>

                {/* Trust */}
                <div className="flex flex-wrap justify-center gap-4 text-xs text-dark-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Pago protegido
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Datos encriptados
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Garantía de satisfacción
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-dark-100 mb-4">Resumen</h2>

              {/* Professional */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-800">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
                  {profesional.foto_url ? (
                    <Image
                      src={profesional.foto_url}
                      alt={profesional.nombre}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-500/20">
                      <Zap className="w-6 h-6 text-primary-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-dark-100">
                    {profesional.nombre} {profesional.apellido?.charAt(0)}.
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-dark-400">{profesional.calificacion.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div className="space-y-3 mb-4 pb-4 border-b border-dark-800">
                <div className="flex justify-between">
                  <span className="text-dark-300">{servicio.nombre}</span>
                  <span className="text-dark-100">{formatPrecio(servicio.precio)}</span>
                </div>
                {addDiagnostico && (
                  <div className="flex justify-between">
                    <span className="text-dark-300">Diagnóstico completo</span>
                    <span className="text-dark-100">{formatPrecio(diagnosticoPrecio)}</span>
                  </div>
                )}
                {cuponDescuento > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Descuento</span>
                    <span>-{formatPrecio(cuponDescuento)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-dark-100">Total</span>
                <span className="text-2xl font-bold text-primary-400">
                  {formatPrecio(total)}
                </span>
              </div>

              <p className="text-xs text-dark-500 mt-4 text-center">
                El pago queda retenido hasta que confirmes que el trabajo está completo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
