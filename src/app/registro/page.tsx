'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { signUpWithEmail } from '@/hooks/useAuth'

export default function RegistroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'cliente'

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await signUpWithEmail(formData.email, formData.password, {
      nombre: formData.nombre,
      telefono: formData.telefono,
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email ya está registrado')
      } else {
        setError('Error al crear la cuenta')
      }
      setLoading(false)
      return
    }

    setSuccess(true)

    // If profesional, redirect to complete profile
    if (tipo === 'profesional') {
      setTimeout(() => {
        router.push('/registro-profesional')
      }, 2000)
    } else {
      setTimeout(() => {
        router.push('/dashboard/cliente')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark-100 mb-2">
            ¡Cuenta creada!
          </h1>
          <p className="text-dark-400">
            {tipo === 'profesional'
              ? 'Redirigiendo para completar tu perfil...'
              : 'Redirigiendo a tu dashboard...'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-400 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-dark-900" />
          </div>
          <span className="text-2xl font-bold text-dark-100">Enermax</span>
        </Link>

        {/* Form */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-dark-100 text-center mb-2">
            Crear cuenta
          </h1>
          <p className="text-dark-400 text-center mb-8">
            {tipo === 'profesional'
              ? 'Registrate como profesional'
              : 'Registrate para contratar servicios'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="input pl-12"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input pl-12"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="input pl-12"
                  placeholder="11-1234-5678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="input pl-12 pr-12"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>

            <p className="text-xs text-dark-500 text-center">
              Al registrarte, aceptás nuestros{' '}
              <Link href="/terminos" className="text-primary-400 hover:underline">
                Términos
              </Link>{' '}
              y{' '}
              <Link href="/privacidad" className="text-primary-400 hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-dark-400">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-primary-400 hover:underline">
            Iniciá sesión
          </Link>
        </p>

        {/* Switch type */}
        {tipo === 'cliente' ? (
          <p className="text-center mt-4 text-dark-500 text-sm">
            ¿Sos profesional?{' '}
            <Link href="/registro?tipo=profesional" className="text-primary-400 hover:underline">
              Registrate como profesional
            </Link>
          </p>
        ) : (
          <p className="text-center mt-4 text-dark-500 text-sm">
            ¿Querés contratar servicios?{' '}
            <Link href="/registro" className="text-primary-400 hover:underline">
              Registrate como cliente
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
