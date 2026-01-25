import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Enermax',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="section pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-dark-100 mb-8">
            Política de Privacidad
          </h1>

          <div className="prose prose-invert prose-dark max-w-none space-y-6">
            <p className="text-dark-300">
              Última actualización: Enero 2026
            </p>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">1. Información que Recopilamos</h2>
              <p className="text-dark-300 mb-4">Recopilamos la siguiente información:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li><strong>Datos de registro:</strong> nombre, email, teléfono</li>
                <li><strong>Datos de ubicación:</strong> dirección para los servicios</li>
                <li><strong>Datos de pago:</strong> procesados por MercadoPago</li>
                <li><strong>Datos de uso:</strong> cómo interactuás con la plataforma</li>
                <li><strong>Fotos:</strong> subidas por profesionales para documentar trabajos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">2. Uso de la Información</h2>
              <p className="text-dark-300 mb-4">Utilizamos tu información para:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Facilitar la conexión entre clientes y profesionales</li>
                <li>Procesar pagos de forma segura</li>
                <li>Enviar notificaciones sobre tus servicios</li>
                <li>Mejorar nuestros servicios</li>
                <li>Prevenir fraude y abusos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">3. Compartición de Datos</h2>
              <p className="text-dark-300">
                Compartimos información limitada entre clientes y profesionales para facilitar
                los servicios. No vendemos tu información a terceros. Podemos compartir datos con:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2 mt-4">
                <li>MercadoPago (procesamiento de pagos)</li>
                <li>Supabase (almacenamiento seguro)</li>
                <li>Autoridades legales cuando sea requerido</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">4. Seguridad</h2>
              <p className="text-dark-300">
                Implementamos medidas de seguridad para proteger tu información, incluyendo
                encriptación SSL, autenticación segura y almacenamiento cifrado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">5. Tus Derechos</h2>
              <p className="text-dark-300 mb-4">Tenés derecho a:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Acceder a tu información personal</li>
                <li>Corregir datos inexactos</li>
                <li>Solicitar la eliminación de tu cuenta</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">6. Cookies</h2>
              <p className="text-dark-300">
                Utilizamos cookies para mejorar tu experiencia, mantener tu sesión activa
                y analizar el uso de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">7. Retención de Datos</h2>
              <p className="text-dark-300">
                Conservamos tu información mientras tu cuenta esté activa o sea necesaria
                para brindarte servicios. Podés solicitar la eliminación en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark-100 mb-4">8. Contacto</h2>
              <p className="text-dark-300">
                Para consultas sobre privacidad, contactanos en{' '}
                <a href="mailto:privacidad@enermax.com.ar" className="text-primary-400 hover:underline">
                  privacidad@enermax.com.ar
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
