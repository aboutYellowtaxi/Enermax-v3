'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Phone, MessageSquare, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PROFESIONAL_TELEFONO = '1131449673'
const PROFESIONAL_NOMBRE = 'Leonel'

function ExitoContent() {
  const searchParams = useSearchParams()
  const solicitudId = searchParams.get('solicitud')

  const whatsappUrl = `https://wa.me/549${PROFESIONAL_TELEFONO}?text=${encodeURIComponent(
    `Hola ${PROFESIONAL_NOMBRE}, acabo de agendar una visita diagnóstico por Enermax (ref: ${solicitudId || 'N/A'})`
  )}`

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-dark-50 mb-3 animate-slide-up">
          ¡Listo!
        </h1>

        <p className="text-lg text-dark-300 mb-2">
          Tu visita diagnóstico está agendada.
        </p>
        <p className="text-dark-400 mb-8">
          <strong className="text-dark-200">{PROFESIONAL_NOMBRE}</strong> te va a contactar
          en menos de <strong className="text-primary-400">30 minutos</strong> para coordinar.
        </p>

        {/* Contact options */}
        <div className="space-y-3 mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700
                       text-white font-semibold px-6 py-4 rounded-xl transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Escribirle por WhatsApp
          </a>

          <a
            href={`tel:+549${PROFESIONAL_TELEFONO}`}
            className="w-full flex items-center justify-center gap-3 bg-dark-800 hover:bg-dark-700
                       text-dark-100 font-semibold px-6 py-4 rounded-xl border border-dark-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Llamar al {PROFESIONAL_TELEFONO}
          </a>
        </div>

        {/* Ref number */}
        {solicitudId && (
          <p className="text-xs text-dark-600 mb-6">
            Referencia: {solicitudId}
          </p>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 flex items-center gap-2 text-dark-600 text-sm">
        <Zap className="w-4 h-4" />
        <span>Enermax</span>
      </div>
    </div>
  )
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-dark-400">Cargando...</div>
      </div>
    }>
      <ExitoContent />
    </Suspense>
  )
}
