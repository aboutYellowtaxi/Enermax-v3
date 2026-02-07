'use client'

import { useState } from 'react'
import { Shield, Clock, CheckCircle, ArrowRight, Loader2, MapPin, Lock, Zap, Phone } from 'lucide-react'

const PRECIO_DIAGNOSTICO = 10000

export default function LandingPage() {
  const [form, setForm] = useState({
    telefono: '',
    direccion: '',
    descripcion: '',
    lat: null as number | null,
    lng: null as number | null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setForm(prev => ({ ...prev, lat: latitude, lng: longitude }))
        setLocationGranted(true)
        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          )
          const data = await res.json()
          if (data.display_name) {
            const short = [
              data.address?.road,
              data.address?.suburb || data.address?.city_district,
              data.address?.city || data.address?.town
            ].filter(Boolean).join(', ')
            setForm(prev => ({ ...prev, direccion: short || data.display_name.split(',').slice(0, 3).join(',') }))
          }
        } catch {
          // Geocode failed, user can type manually
        }
        setLocationLoading(false)
      },
      () => {
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.telefono.trim()) {
      setError('Necesitamos tu teléfono para contactarte')
      return
    }
    if (!form.direccion.trim()) {
      setError('Necesitamos saber dónde ir')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: form.telefono,
          direccion: form.direccion,
          descripcion: form.descripcion,
          lat: form.lat,
          lng: form.lng,
        }),
      })

      const data = await res.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Error al procesar. Intentá de nuevo.')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Enermax</span>
          </div>
          <a
            href="tel:+5491131449673"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Contacto</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center pt-14">
        <section className="w-full max-w-3xl mx-auto px-4 py-10 sm:py-16 md:py-20">
          <div className="text-center max-w-xl mx-auto">
            {/* Security badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Pago seguro con MercadoPago</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Diagnóstico eléctrico{' '}
              <span className="text-blue-600">profesional</span>{' '}
              en tu casa
            </h1>

            <p className="text-base sm:text-lg text-gray-500 mb-3 max-w-md mx-auto">
              Un técnico matriculado te visita, evalúa el problema y te da un presupuesto detallado.
            </p>

            {/* Price */}
            <div className="mb-8">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-sm text-gray-400">desde</span>
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ${PRECIO_DIAGNOSTICO.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                El costo final puede variar según el tipo de diagnóstico
              </p>
            </div>

            {/* CTA Button or Form */}
            {!showForm ? (
              <button
                onClick={() => {
                  setShowForm(true)
                  requestLocation()
                }}
                className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700
                           text-white font-semibold text-lg px-10 py-4 sm:py-5
                           rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30
                           transition-all duration-200 active:scale-[0.98]"
              >
                Agendar visita
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6
                           text-left max-w-sm mx-auto shadow-xl shadow-gray-100
                           animate-slide-up"
              >
                <div className="space-y-3">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="11 1234-5678"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                                 text-gray-900 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                 transition-all"
                      autoFocus
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    {locationLoading ? (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Obteniendo ubicación...</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Calle y barrio"
                          value={form.direccion}
                          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                                     text-gray-900 placeholder:text-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                     transition-all"
                        />
                        {!locationGranted && (
                          <button
                            type="button"
                            onClick={requestLocation}
                            className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Usar mi ubicación actual
                          </button>
                        )}
                        {locationGranted && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Ubicación detectada
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Qué problema tenés? <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      placeholder="Ej: se corta la luz cuando enciendo el horno"
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                                 text-gray-900 placeholder:text-gray-400 resize-none
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                 transition-all"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700
                               text-white font-semibold text-base px-6 py-3.5 rounded-xl
                               shadow-lg shadow-blue-600/20
                               transition-all duration-200 active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pagar y agendar
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Pago protegido</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Datos encriptados</span>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Trust */}
        <section className="w-full border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Garantía de devolución</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Te contactan en minutos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Técnico matriculado</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-10">
              Así de simple
            </h2>

            <div className="grid sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Agendá</h3>
                <p className="text-sm text-gray-500">
                  Dejá tu teléfono y ubicación. Pagá seguro con MercadoPago.
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Te llamamos</h3>
                <p className="text-sm text-gray-500">
                  Un técnico verificado te contacta en minutos para coordinar.
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Diagnóstico</h3>
                <p className="text-sm text-gray-500">
                  Va a tu casa, evalúa el problema y te da un presupuesto claro.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-10 border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-8">Preguntas frecuentes</h2>
            <div className="max-w-xl mx-auto space-y-5">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">¿Qué incluye la visita?</h3>
                <p className="text-sm text-gray-500">
                  Un electricista matriculado va a tu domicilio, evalúa el problema eléctrico
                  y te entrega un presupuesto detallado. La reparación se cotiza aparte.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">¿Puede variar el precio?</h3>
                <p className="text-sm text-gray-500">
                  El precio base es de ${PRECIO_DIAGNOSTICO.toLocaleString('es-AR')}. Según la complejidad del problema
                  o la distancia, el costo puede ajustarse. Siempre lo sabés antes de confirmar.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">¿Qué pasa si no resuelven mi problema?</h3>
                <p className="text-sm text-gray-500">
                  Si el técnico no se presenta o no puede diagnosticar tu problema,
                  te devolvemos el 100% del dinero. Sin preguntas.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">¿Es seguro pagar online?</h3>
                <p className="text-sm text-gray-500">
                  Sí. El pago se procesa por MercadoPago, la plataforma de pagos más grande
                  de Argentina. Tus datos están protegidos y encriptados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 bg-white">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">Enermax</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Lock className="w-3 h-3" />
            <span>Conexión segura</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
