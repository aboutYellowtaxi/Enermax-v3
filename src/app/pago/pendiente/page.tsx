'use client'

import { Clock, ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-amber-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pago pendiente
        </h1>

        <p className="text-gray-500 mb-4">
          Tu pago está siendo procesado.
        </p>
        <p className="text-gray-400 mb-8 text-sm">
          Si pagaste en efectivo (Rapipago/Pago Fácil), puede demorar hasta 2 horas.
        </p>

        <a
          href="tel:+5491131449673"
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200
                     text-gray-800 font-semibold px-6 py-4 rounded-xl transition-colors mb-6"
        >
          <Phone className="w-5 h-5" />
          ¿Dudas? Llamanos
        </a>

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
