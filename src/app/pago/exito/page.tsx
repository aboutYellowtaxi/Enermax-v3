'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Phone, MessageSquare, Zap, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

const PROFESIONAL_TELEFONO = '1131449673'
const PROFESIONAL_NOMBRE = 'Leonel'

function ExitoContent() {
  const searchParams = useSearchParams()
  const solicitudId = searchParams.get('solicitud')

  const whatsappUrl = `https://wa.me/549${PROFESIONAL_TELEFONO}?text=${encodeURIComponent(
    `Hola ${PROFESIONAL_NOMBRE}, acabo de agendar una visita diagnóstico por Enermax`
  )}`

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Listo!
        </h1>

        <p className="text-lg text-gray-600 mb-2">
          Tu visita diagnóstico está confirmada.
        </p>
        <p className="text-gray-500 mb-8">
          <strong className="text-gray-800">{PROFESIONAL_NOMBRE}</strong> te va a contactar
          en menos de <strong className="text-blue-600">30 minutos</strong>.
        </p>

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
            className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200
                       text-gray-800 font-semibold px-6 py-4 rounded-xl transition-colors"
          >
            <Phone className="w-5 h-5" />
            Llamar
          </a>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-6">
          <Shield className="w-3.5 h-3.5" />
          <span>Tu pago está protegido. Si no te contactan, te devolvemos el dinero.</span>
        </div>

        {solicitudId && (
          <p className="text-xs text-gray-300 mb-4">Ref: {solicitudId}</p>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    }>
      <ExitoContent />
    </Suspense>
  )
}
