'use client'

import { XCircle, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'

export default function PagoErrorPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pago no procesado
        </h1>

        <p className="text-gray-500 mb-8">
          No se te cobró nada. Podés intentar de nuevo.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700
                     text-white font-semibold text-lg px-8 py-4 rounded-xl
                     shadow-lg shadow-blue-600/20 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a intentar
        </Link>
      </div>
    </div>
  )
}
