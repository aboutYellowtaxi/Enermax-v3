'use client'

import { useState } from 'react'
import { Zap, Shield, Clock, CheckCircle, Phone, ArrowRight, Loader2 } from 'lucide-react'

const PRECIO_DIAGNOSTICO = 10000

export default function LandingPage() {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    descripcion: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim() || !form.telefono.trim() || !form.direccion.trim()) {
      setError('Completá nombre, teléfono y dirección')
      return
    }

    setLoading(true)

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
        setError(data.error || 'Error al procesar el pago')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Minimal header */}
      <header className="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-md border-b border-dark-800/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary-400" />
            <span className="font-bold text-lg text-dark-100">Enermax</span>
          </div>
          <a
            href="tel:+5491131449673"
            className="flex items-center gap-2 text-sm text-dark-300 hover:text-primary-400 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">11 3144-9673</span>
          </a>
        </div>
      </header>

      {/* Hero - Full viewport */}
      <main className="flex-1 flex flex-col items-center justify-center pt-14">
        <section className="w-full max-w-5xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-primary-400 font-medium">Disponible ahora en Moreno</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark-50 leading-tight mb-4">
              ¿Problema{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                eléctrico
              </span>
              ?
            </h1>

            <p className="text-lg sm:text-xl text-dark-300 mb-2">
              Un electricista verificado te contacta en minutos.
            </p>

            {/* Price */}
            <div className="mb-8">
              <span className="text-3xl sm:text-4xl font-bold text-dark-50">
                ${PRECIO_DIAGNOSTICO.toLocaleString('es-AR')}
              </span>
              <span className="text-dark-400 ml-2 text-lg">visita diagnóstico</span>
            </div>

            {/* CTA Button */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="group inline-flex items-center gap-3 bg-primary-400 hover:bg-primary-500
                           text-dark-900 font-bold text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5
                           rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40
                           transition-all duration-200 active:scale-[0.98] animate-pulse-glow"
              >
                Agendar electricista
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              /* Inline Form */
              <form
                onSubmit={handleSubmit}
                className="bg-dark-900/80 backdrop-blur-sm border border-dark-800 rounded-2xl p-6
                           text-left max-w-md mx-auto animate-slide-up"
              >
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="input"
                      autoFocus
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Teléfono (ej: 11 1234-5678)"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dirección (calle y barrio)"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="¿Qué problema tenés? (opcional)"
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className="input resize-none"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-primary-400 hover:bg-primary-500
                               text-dark-900 font-bold text-lg px-8 py-4 rounded-xl
                               shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40
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
                        Pagar ${PRECIO_DIAGNOSTICO.toLocaleString('es-AR')} y agendar
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-dark-500 text-center">
                    Pago seguro con MercadoPago. Si no te contactamos, te devolvemos el dinero.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="w-full border-t border-dark-800/50 bg-dark-900/30">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <Shield className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-dark-300 font-medium">Pago protegido</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-dark-300 font-medium">Respuesta en minutos</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-dark-300 font-medium">Electricista verificado</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark-100 text-center mb-10">
              ¿Cómo funciona?
            </h2>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
              <div className="relative text-center sm:text-left">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <span className="text-primary-400 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-dark-100 mb-1">Agendá</h3>
                <p className="text-sm text-dark-400">
                  Completá tus datos y pagá la visita diagnóstico.
                </p>
              </div>

              <div className="relative text-center sm:text-left">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <span className="text-primary-400 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-dark-100 mb-1">Te contactamos</h3>
                <p className="text-sm text-dark-400">
                  Un electricista verificado te llama para coordinar.
                </p>
              </div>

              <div className="relative text-center sm:text-left">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3">
                  <span className="text-primary-400 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-dark-100 mb-1">Problema resuelto</h3>
                <p className="text-sm text-dark-400">
                  El profesional va a tu casa, diagnostica y soluciona.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Minimal */}
        <section className="w-full py-12 border-t border-dark-800/50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="font-semibold text-dark-200 mb-1">¿Qué incluye la visita diagnóstico?</h3>
                <p className="text-sm text-dark-400">
                  Un electricista matriculado va a tu domicilio, evalúa el problema y te da un diagnóstico
                  con presupuesto detallado para la reparación.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dark-200 mb-1">¿Qué pasa si no pueden solucionar el problema?</h3>
                <p className="text-sm text-dark-400">
                  Si el electricista no puede resolver tu problema, te devolvemos el 100% del dinero.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dark-200 mb-1">¿En cuánto tiempo me contactan?</h3>
                <p className="text-sm text-dark-400">
                  Después de tu pago, te contactamos en menos de 30 minutos para coordinar la visita.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-dark-800/50 py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <Zap className="w-4 h-4" />
            <span>Enermax</span>
          </div>
          <p className="text-xs text-dark-600">Moreno, Buenos Aires</p>
        </div>
      </footer>
    </div>
  )
}
