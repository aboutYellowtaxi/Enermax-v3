import { Metadata } from 'next'
import Link from 'next/link'
import {
  HelpCircle, Shield, CreditCard, Clock, Star, MessageCircle,
  AlertTriangle, ChevronRight
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Centro de Ayuda',
  description: 'Preguntas frecuentes y soporte de Enermax',
}

const faqs = [
  {
    pregunta: '¿Cómo funciona Enermax?',
    respuesta: 'Enermax conecta clientes con profesionales verificados de servicios del hogar. Elegís un profesional, contratás el servicio, pagás de forma segura y el dinero se libera cuando confirmás que el trabajo está completo.',
  },
  {
    pregunta: '¿El pago es seguro?',
    respuesta: 'Sí. Usamos MercadoPago para procesar los pagos. Tu dinero queda retenido (escrow) hasta que confirmes que el trabajo fue completado satisfactoriamente.',
  },
  {
    pregunta: '¿Qué pasa si no estoy conforme con el trabajo?',
    respuesta: 'Tenés 48 horas para reportar cualquier problema. Nuestro equipo revisará el caso y mediará para encontrar una solución. Podemos ordenar correcciones o reembolsos según corresponda.',
  },
  {
    pregunta: '¿Cómo sé que el profesional es confiable?',
    respuesta: 'Todos los profesionales pasan por un proceso de verificación. Además, podés ver sus calificaciones, reseñas de otros clientes y cantidad de trabajos completados.',
  },
  {
    pregunta: '¿Puedo cancelar una solicitud?',
    respuesta: 'Sí. Si el profesional aún no aceptó la solicitud, la cancelación es gratuita. Una vez aceptada, pueden aplicarse cargos según el caso.',
  },
  {
    pregunta: '¿Cuánto cobra Enermax?',
    respuesta: 'Enermax cobra una comisión del 15% sobre el monto del servicio. Esta comisión ya está incluida en el precio que ves. Como cliente, no pagás ningún cargo adicional.',
  },
  {
    pregunta: '¿Cómo me hago profesional en Enermax?',
    respuesta: 'Registrate como profesional, completá tu perfil con tus datos y servicios, y esperá la verificación. Una vez aprobado, empezarás a recibir solicitudes de trabajo.',
  },
  {
    pregunta: '¿Cuándo recibo el pago como profesional?',
    respuesta: 'El pago se libera cuando el cliente confirma que el trabajo está completo. Los fondos se transfieren a tu cuenta de MercadoPago en 24-48 horas hábiles.',
  },
]

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="section pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-dark-100 mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-dark-400">
              Encontrá respuestas a las preguntas más frecuentes
            </p>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <QuickLink
              icon={Shield}
              title="Pago Protegido"
              description="Tu dinero está seguro"
            />
            <QuickLink
              icon={Star}
              title="Garantía"
              description="Satisfacción garantizada"
            />
            <QuickLink
              icon={MessageCircle}
              title="Soporte"
              description="Estamos para ayudarte"
            />
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-100 mb-6">
              Preguntas Frecuentes
            </h2>
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-dark-900 border border-dark-800 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-dark-100 pr-4">{faq.pregunta}</span>
                  <ChevronRight className="w-5 h-5 text-dark-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-dark-300">
                  {faq.respuesta}
                </div>
              </details>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 bg-dark-900 border border-dark-800 rounded-2xl p-8 text-center">
            <HelpCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-100 mb-2">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-dark-400 mb-6">
              Nuestro equipo está disponible para ayudarte
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:ayuda@enermax.com.ar"
                className="btn-primary"
              >
                Enviar email
              </a>
              <Link href="/contacto" className="btn-secondary">
                Formulario de contacto
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function QuickLink({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 text-center">
      <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-primary-400" />
      </div>
      <h3 className="font-medium text-dark-100 mb-1">{title}</h3>
      <p className="text-sm text-dark-400">{description}</p>
    </div>
  )
}
