'use client'

import { useState, useEffect } from 'react'
import { Shield, Clock, CheckCircle, Loader2, Zap, Star, Calendar, Search, GraduationCap, Briefcase, Wrench, MapPin } from 'lucide-react'

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
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)
  const [portfolio, setPortfolio] = useState<{ id: string; foto_url: string; descripcion: string }[]>([])

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false)
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

  // Fetch portfolio
  useEffect(() => {
    fetch('/api/portfolio?limit=8').then(r => r.json()).then(d => {
      if (d.items) setPortfolio(d.items)
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.telefono.trim()) { setError('Necesitamos tu teléfono'); return }
    setLoading(true)
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
        setLoading(false)
      }
    } catch {
      setError('Error de conexión.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
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
        {/* Hero + Form */}
        <section className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight text-center mb-1">
              Electricista profesional en tu casa
            </h1>
            <p className="text-center text-gray-500 text-sm mb-4">
              Agendá gratis y te contactamos lo antes posible
            </p>

            {/* Professional info */}
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

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-700 font-medium">Disponible · Seguimiento en tiempo real</span>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Tu teléfono (ej: 1112345678)"
                value={form.telefono}
                onChange={(e) => {
                  const nums = e.target.value.replace(/\D/g, '')
                  setForm({ ...form, telefono: nums })
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                           text-gray-900 placeholder:text-gray-400 text-base
                           focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                           transition-all"
                autoFocus
              />

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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700
                           text-white font-semibold text-base py-4 rounded-xl
                           shadow-lg shadow-blue-600/20
                           transition-all duration-200 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
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

              <div className="flex items-center justify-center gap-4 pt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Matriculado</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Seguimiento en vivo</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Garantía</span>
              </div>
            </form>

            <a
              href="/mi-solicitud"
              className="block w-full text-center mt-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500
                         text-gray-700 hover:text-blue-600 font-semibold text-sm transition-all"
            >
              <Search className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              ¿Ya agendaste? Consultá tu solicitud
            </a>
          </div>
        </section>

        {/* How it works */}
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
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Te contactamos</p>
                <p className="text-xs text-gray-400 hidden sm:block">Lo antes posible</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">Resuelto</p>
                <p className="text-xs text-gray-400 hidden sm:block">En tu casa</p>
              </div>
            </div>
          </div>
        </section>

        {/* Professional profile */}
        <section className="w-full py-8 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">Conocé al profesional</h2>
            <div className="max-w-md mx-auto">
              {/* Profile header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  L
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Leonel Vivas</h3>
                  <p className="text-sm text-gray-500">Electricista matriculado</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Moreno, Buenos Aires</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">5+</p>
                  <p className="text-[10px] text-blue-600">Años exp.</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Calificación</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-amber-700">100%</p>
                  <p className="text-[10px] text-amber-600">Garantía</p>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Técnico Electromecánico</p>
                    <p className="text-xs text-gray-500">Escuela Técnica N°2 de Moreno</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Electricista Domiciliario</p>
                    <p className="text-xs text-gray-500">Instalaciones, tableros, térmicas, disyuntores, detección de fallas</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mantenimiento Industrial</p>
                    <p className="text-xs text-gray-500">Soldadura SMAW/MIG · Pintura industrial</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Construcción</p>
                    <p className="text-xs text-gray-500">Albañilería · Obra civil · 2+ años en DARQ</p>
                  </div>
                </div>
              </div>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {['Instalaciones eléctricas', 'Tableros', 'Lectura de planos', 'Normas de seguridad', 'Soldadura', 'Cableado estructurado'].map(skill => (
                  <span key={skill} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio section */}
        {portfolio.length > 0 && (
          <section className="w-full py-8 border-t border-gray-100 bg-gray-50/50">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-lg font-bold text-gray-900 text-center mb-6">Trabajos realizados</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {portfolio.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-200">
                    <img src={p.foto_url} alt={p.descripcion || 'Trabajo'} className="w-full h-full object-cover" />
                    {p.descripcion && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-xs line-clamp-2">{p.descripcion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="w-full py-8 border-t border-gray-100">
          <div className="max-w-md mx-auto px-4 space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 text-sm">¿Es gratis agendar?</h3>
              <p className="text-xs text-gray-500">Sí. Agendás gratis, sin compromiso. El pago es directo al profesional una vez realizado el trabajo.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-sm">¿Cuánto tiempo tardan en contactarme?</h3>
              <p className="text-xs text-gray-500">Lo antes posible. Podés seguir el estado de tu solicitud en tiempo real desde la página de seguimiento.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-sm">¿Cómo se paga el trabajo?</h3>
              <p className="text-xs text-gray-500">El pago es directo al profesional una vez terminado el trabajo. Acordás el precio antes de empezar.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
