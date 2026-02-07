'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Phone, MessageSquare, ArrowLeft, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

const PROFESIONAL_TELEFONO = '1131449673'
const PROFESIONAL_NOMBRE = 'Leonel'

function ExitoContent() {
  const searchParams = useSearchParams()
  const solicitudId = searchParams.get('solicitud')
  const tipo = searchParams.get('tipo')
  const esGratis = tipo === 'gratis'

  const whatsappUrl = `https://wa.me/549${PROFESIONAL_TELEFONO}?text=${encodeURIComponent(
    `Hola ${PROFESIONAL_NOMBRE}, acabo de agendar una visita por Enermax`
  )}`

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {esGratis ? '¡Agendado!' : '¡Listo!'}
        </h1>

        <p className="text-gray-500 mb-6">
          <strong className="text-gray-800">{PROFESIONAL_NOMBRE}</strong> va a revisar tu solicitud
          y se va a comunicar con vos <strong className="text-blue-600">lo antes posible</strong>.
        </p>

        <div className="space-y-3 mb-6">
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

        {!esGratis && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Tu pago está protegido. Si no te contactan, devolución total.</span>
          </div>
        )}

        {solicitudId && (
          <p className="text-xs text-gray-300 mb-4">Ref: {solicitudId}</p>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-gray-300">
        <Zap className="w-3 h-3" />
        <span>Enermax</span>
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
