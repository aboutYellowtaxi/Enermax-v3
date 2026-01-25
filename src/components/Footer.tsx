import Link from 'next/link'
import { Zap, Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="section py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-400 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-dark-900" />
              </div>
              <span className="text-xl font-bold text-dark-100">Enermax</span>
            </Link>
            <p className="text-dark-400 text-sm mb-4">
              Profesionales de confianza para tu hogar. Pago protegido y garantía de satisfacción.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/enermax.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/enermax.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/enermax_ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-semibold text-dark-100 mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/?categoria=electricidad" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Electricistas
                </Link>
              </li>
              <li>
                <Link href="/?categoria=plomeria" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Plomeros
                </Link>
              </li>
              <li>
                <Link href="/?categoria=gas" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Gasistas
                </Link>
              </li>
              <li>
                <Link href="/?categoria=pintura" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Pintores
                </Link>
              </li>
              <li>
                <Link href="/?categoria=carpinteria" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Carpinteros
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-dark-100 mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ayuda" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/registro?tipo=profesional" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Trabajá con nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-dark-100 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Política de privacidad
                </Link>
              </li>
            </ul>

            <div className="mt-6 space-y-2">
              <a
                href="mailto:hola@enermax.com.ar"
                className="flex items-center gap-2 text-dark-400 hover:text-primary-400 text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                hola@enermax.com.ar
              </a>
              <a
                href="tel:+5491112345678"
                className="flex items-center gap-2 text-dark-400 hover:text-primary-400 text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                +54 9 11 1234-5678
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © {currentYear} Enermax. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <span>Hecho con</span>
            <span className="text-red-500">❤</span>
            <span>en Argentina</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
