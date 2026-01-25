import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de Enermax',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="section pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-dark-100 mb-8">
            Términos y Condiciones
          </h1>

          <div className="prose prose-invert prose-dark max-w-none space-y-6">
            <p className="text-dark-300">
              Última actualización: Enero 2026
            </p>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-dark-300">
                Al acceder y utilizar Enermax, aceptás estos términos y condiciones en su totalidad.
                Si no estás de acuerdo con alguna parte de estos términos, no deberías usar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">2. Descripción del Servicio</h2>
              <p className="text-dark-300">
                Enermax es una plataforma que conecta clientes con profesionales de servicios del hogar
                (electricistas, plomeros, gasistas, etc.). Actuamos como intermediarios y no somos
                responsables directos de los servicios prestados por los profesionales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">3. Sistema de Pagos</h2>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Los pagos se procesan a través de MercadoPago</li>
                <li>El dinero queda retenido (escrow) hasta que el cliente confirme el trabajo</li>
                <li>Enermax cobra una comisión del 15% sobre el monto del servicio</li>
                <li>Los profesionales reciben el pago una vez confirmado el trabajo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">4. Responsabilidades del Cliente</h2>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Proporcionar información veraz y actualizada</li>
                <li>Estar presente o designar a alguien para recibir al profesional</li>
                <li>Confirmar la finalización del trabajo una vez completado</li>
                <li>Reportar cualquier problema dentro de las 48 horas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">5. Responsabilidades del Profesional</h2>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Mantener sus datos y disponibilidad actualizados</li>
                <li>Cumplir con los servicios acordados</li>
                <li>Subir fotos del trabajo completado</li>
                <li>Mantener una conducta profesional</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">6. Cancelaciones y Reembolsos</h2>
              <p className="text-dark-300">
                Las cancelaciones antes de que el profesional acepte el trabajo son gratuitas.
                Una vez aceptado, pueden aplicarse cargos según el caso. Los reembolsos se procesan
                en un plazo de 5-10 días hábiles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">7. Disputas</h2>
              <p className="text-dark-300">
                En caso de disputa, Enermax actuará como mediador. Nos reservamos el derecho
                de tomar decisiones vinculantes basadas en la evidencia presentada por ambas partes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">8. Modificaciones</h2>
              <p className="text-dark-300">
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Los cambios serán notificados a través de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">9. Contacto</h2>
              <p className="text-dark-300">
                Para consultas sobre estos términos, contactanos en{' '}
                <a href="mailto:legal@enermax.com.ar" className="text-primary-400 hover:underline">
                  legal@enermax.com.ar
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
