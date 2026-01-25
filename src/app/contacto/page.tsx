'use client'

import { useState } from 'react'
import { Send, Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    // Simulate sending (in production, send to API)
    await new Promise(resolve => setTimeout(resolve, 1000))

    setEnviado(true)
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="section pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-dark-100 mb-4">
              Contactanos
            </h1>
            <p className="text-dark-400">
              Estamos acá para ayudarte
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-6">
              <ContactCard
                icon={Mail}
                title="Email"
                value="hola@enermax.com.ar"
                href="mailto:hola@enermax.com.ar"
              />
              <ContactCard
                icon={Phone}
                title="WhatsApp"
                value="+54 9 11 1234-5678"
                href="https://wa.me/5491112345678"
              />
              <ContactCard
                icon={MapPin}
                title="Ubicación"
                value="Buenos Aires, Argentina"
              />
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                {enviado ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-dark-100 mb-2">
                      Mensaje enviado
                    </h3>
                    <p className="text-dark-400">
                      Te responderemos a la brevedad
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nombre</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                          className="input"
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="input"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Asunto</label>
                      <select
                        value={formData.asunto}
                        onChange={(e) => setFormData(prev => ({ ...prev, asunto: e.target.value }))}
                        className="input"
                        required
                      >
                        <option value="">Seleccioná un tema</option>
                        <option value="consulta">Consulta general</option>
                        <option value="problema">Problema con un servicio</option>
                        <option value="profesional">Quiero ser profesional</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Mensaje</label>
                      <textarea
                        value={formData.mensaje}
                        onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                        className="input min-h-[150px] resize-none"
                        placeholder="Contanos en qué podemos ayudarte..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full btn-primary"
                    >
                      {enviando ? (
                        <>
                          <div className="spinner" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ContactCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: any
  title: string
  value: string
  href?: string
}) {
  const content = (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 hover:border-dark-700 transition-colors">
      <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary-400" />
      </div>
      <h3 className="text-sm text-dark-400 mb-1">{title}</h3>
      <p className="font-medium text-dark-100">{value}</p>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}
