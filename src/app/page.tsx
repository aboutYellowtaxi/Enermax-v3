'use client'

import { useState, useEffect } from 'react'
import { Shield, Clock, CheckCircle, Loader2, Lock, Zap, Star, Calendar } from 'lucide-react'

const PRECIO_DIAGNOSTICO = 10000

export default function LandingPage() {
  const [form, setForm] = useState({
    telefono: '',
    direccion: '',
    descripcion: '',
    lat: null as number | null,
    lng: null as number | null,
  })
  const [loading, setLoading] = useState<'pago' | 'gratis' | null>(null)
  const [error, setError] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(null)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // Request location on mount
  useEffect(() => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setForm(prev => ({ ...prev, lat: latitude, lng: longitude }))
        setLocationGranted(true)
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
        } catch { /* user types manually */ }
        setLocationLoading(false)
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.telefono.trim()) { setError('Necesitamos tu teléfono'); return }
    if (!form.direccion.trim()) { setError('Necesitamos tu ubicación'); return }
    setLoading('pago')
    try {
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Error al procesar.')
        setLoading(null)
      }
    } catch {
      setError('Error de conexión.')
      setLoading(null)
    }
  }

  const handleGratis = async () => {
    setError('')
    if (!form.telefono.trim()) { setError('Necesitamos tu teléfono'); return }
    setLoading('gratis')
    try {
      const res = await fetch('/api/agendar-gratis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = data.redirect || `/seguimiento/${data.solicitud_id}`
      } else {
        setError(data.error || 'Error al procesar.')
        setLoading(null)
      }
    } catch {
      setError('Error de conexión.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - minimal */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Enermax</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Verificado
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-12">
        {/* Hero + Form - Everything above the fold */}
        <section className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
          <div className="max-w-md mx-auto">

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight text-center mb-1">
              Electricista profesional en tu casa
            </h1>
            <p className="text-center text-gray-500 text-sm mb-4">
              Agendá y te contactamos lo antes posible
            </p>

            {/* Professional info - inline, no photo */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">L</div>
                <span className="text-sm font-medium text-gray-700">Leonel V.</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">5 años exp.</span>
            </div>

            {/* Urgency */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-700 font-medium">Disponible hoy · Turnos limitados</span>
            </div>

            {/* FORM - Always visible, no extra click needed */}
            <form onSubmit={handlePago} className="space-y-3">
              {/* Phone */}
              <input
                type="tel"
                placeholder="Tu teléfono (ej: 11 1234-5678)"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                           text-gray-900 placeholder:text-gray-400 text-base
                           focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                           transition-all"
                autoFocus
              />

              {/* Location */}
              <div className="relative">
                {locationLoading ? (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Detectando ubicación...</span>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Tu dirección (calle y barrio)"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                                 text-gray-900 placeholder:text-gray-400 text-base
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                 transition-all"
                    />
                    {locationGranted && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description - optional */}
              <textarea
                placeholder="Describí tu problema (opcional)"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                           text-gray-900 placeholder:text-gray-400 resize-none text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                           transition-all"
                rows={2}
              />

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Primary CTA: Agendar gratis */}
              <button
                type="button"
                onClick={handleGratis}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700
                           text-white font-semibold text-base py-4 rounded-xl
                           shadow-lg shadow-blue-600/20
                           transition-all duration-200 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'gratis' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Agendar visita gratis
                  </>
                )}
              </button>

              {/* Secondary: Pagar diagnóstico */}
              <button
                type="submit"
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50
                           text-gray-600 font-medium text-sm py-3 rounded-xl
                           border border-gray-200
                           transition-all duration-200 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'pago' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Pagar diagnóstico ${PRECIO_DIAGNOSTICO.toLocaleString('es-AR')} y tener prioridad
                  </>
                )}
              </button>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-4 pt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Matriculado</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Respuesta inmediata</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Garantía</span>
              </div>
            </form>

            {/* Social proof */}
            <p className="text-center text-xs text-gray-400 mt-4">
              7 personas agendaron esta semana en tu zona
            </p>
          </div>
        </section>

        {/* How it works - compact */}
        <section className="w-full py-8 border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">Así de fácil</h2>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
              <div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Agendás</p>
                <p className="text-xs text-gray-400 hidden sm:block">Dejá tu teléfono</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Te llamamos</p>
                <p className="text-xs text-gray-400 hidden sm:block">En minutos</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Resuelto</p>
                <p className="text-xs text-gray-400 hidden sm:block">En tu casa</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - compact */}
        <section className="w-full py-8">
          <div className="max-w-md mx-auto px-4 space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 text-sm">¿Es gratis agendar?</h3>
              <p className="text-xs text-gray-500">Sí. Agendás gratis, sin compromiso. Si querés prioridad podés pagar el diagnóstico por adelantado.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-sm">¿Cuánto tiempo tardan en contactarme?</h3>
              <p className="text-xs text-gray-500">Lo antes posible. Podés seguir el estado de tu solicitud en tiempo real desde la página de seguimiento.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-sm">¿Qué pasa si pago y no me contactan?</h3>
              <p className="text-xs text-gray-500">Devolución del 100%. Sin preguntas.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - minimal */}
      <footer className="border-t border-gray-100 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            <span>Enermax</span>
          </div>
          <span>Servicios eléctricos profesionales</span>
        </div>
      </footer>
    </div>
  )
}
