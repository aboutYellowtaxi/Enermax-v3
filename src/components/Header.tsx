'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Menu, X, User, LogOut, LayoutDashboard, Bell, Settings } from 'lucide-react'
import { useAuth, signOut } from '@/hooks/useAuth'

export default function Header() {
  const { user, role, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (role === 'admin') return '/dashboard/admin'
    if (role === 'profesional') return '/dashboard/profesional'
    return '/dashboard/cliente'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800">
      <div className="section">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-400 rounded-lg flex items-center justify-center group-hover:bg-primary-500 transition-colors">
              <Zap className="w-5 h-5 text-dark-900" />
            </div>
            <span className="text-xl font-bold text-dark-100">Enermax</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#categorias"
              className="text-dark-300 hover:text-dark-100 transition-colors text-sm"
            >
              Servicios
            </Link>
            <Link
              href="/#como-funciona"
              className="text-dark-300 hover:text-dark-100 transition-colors text-sm"
            >
              Cómo funciona
            </Link>
            <Link
              href="/ayuda"
              className="text-dark-300 hover:text-dark-100 transition-colors text-sm"
            >
              Ayuda
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-dark-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="btn-ghost btn-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-ghost btn-sm text-dark-400 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost btn-sm">
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="btn-primary btn-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-dark-400 hover:text-dark-100 transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-900 border-b border-dark-800 animate-slide-up">
          <nav className="section py-4 flex flex-col gap-2">
            <Link
              href="/#categorias"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-dark-300 hover:text-dark-100"
            >
              Servicios
            </Link>
            <Link
              href="/#como-funciona"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-dark-300 hover:text-dark-100"
            >
              Cómo funciona
            </Link>
            <Link
              href="/ayuda"
              onClick={() => setMenuOpen(false)}
              className="py-2 text-dark-300 hover:text-dark-100"
            >
              Ayuda
            </Link>

            <hr className="border-dark-800 my-2" />

            {loading ? null : user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-dark-100 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="py-2 text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-dark-100"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary text-center"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
