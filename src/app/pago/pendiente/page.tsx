'use client'

import { Clock, ArrowLeft, Zap, Phone } from 'lucide-react'
import Link from 'next/link'

const PROFESIONAL_TELEFONO = '1131449673'

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-amber-400" />
        </div>

        <h1 className="text-3xl font-bold text-dark-50 mb-3">
          Pago pendiente
        </h1>

        <p className="text-dark-400 mb-4">
          Tu pago está siendo procesado. Te notificamos apenas se confirme.
        </p>
        <p className="text-dark-400 mb-8">
          Si pagaste en efectivo (Rapipago/Pago Fácil), puede demorar hasta 2 horas hábiles.
        </p>

        <div className="space-y-3 mb-8">
          <a
            href={`tel:+549${PROFESIONAL_TELEFONO}`}
            className="w-full flex items-center justify-center gap-3 bg-dark-800 hover:bg-dark-700
                       text-dark-100 font-semibold px-6 py-4 rounded-xl border border-dark-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            ¿Dudas? Llamanos
          </a>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="absolute bottom-6 flex items-center gap-2 text-dark-600 text-sm">
        <Zap className="w-4 h-4" />
        <span>Enermax</span>
      </div>
    </div>
  )
}
