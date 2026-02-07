'use client'

import { XCircle, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'

export default function PagoErrorPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-dark-50 mb-3">
          Pago no procesado
        </h1>

        <p className="text-dark-400 mb-8">
          Hubo un problema con tu pago. No se te cobró nada. Podés intentar de nuevo.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-3 bg-primary-400 hover:bg-primary-500
                     text-dark-900 font-bold text-lg px-8 py-4 rounded-xl
                     shadow-lg shadow-primary-500/25 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a intentar
        </Link>
      </div>

      <div className="absolute bottom-6 flex items-center gap-2 text-dark-600 text-sm">
        <Zap className="w-4 h-4" />
        <span>Enermax</span>
      </div>
    </div>
  )
}
