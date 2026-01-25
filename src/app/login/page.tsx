'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signInWithEmail } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard/cliente'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signInWithEmail(email, password)

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push(redirect)
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
            Iniciar sesión
          </h1>
          <p className="text-dark-400 text-center mb-8">
            Ingresá a tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="tu@email.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-12"
                  placeholder="••••••••"
                  required
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
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/recuperar-password"
              className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center mt-6 text-dark-400">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-primary-400 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
