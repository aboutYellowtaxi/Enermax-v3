'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'cliente' | 'profesional' | 'admin' | null

export interface AuthUser {
  user: User | null
  session: Session | null
  role: UserRole
  profesionalId: string | null
  loading: boolean
}

export function useAuth(): AuthUser {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [profesionalId, setProfesionalId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserRole(session.user.id)
        } else {
          setRole(null)
          setProfesionalId(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserRole(userId: string) {
    // Check if admin (by email domain or metadata)
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email?.endsWith('@enermax.com.ar') || user?.user_metadata?.role === 'admin') {
      setRole('admin')
      setLoading(false)
      return
    }

    // Check if profesional
    const { data: profesional } = await supabase
      .from('profesionales')
      .select('id')
      .eq('auth_id', userId)
      .maybeSingle()

    if (profesional) {
      setRole('profesional')
      setProfesionalId(profesional.id)
    } else {
      setRole('cliente')
      setProfesionalId(null)
    }
    setLoading(false)
  }

  return { user, session, role, profesionalId, loading }
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { nombre?: string; telefono?: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return { data, error }
}
