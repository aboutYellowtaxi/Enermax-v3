'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ChatMensaje } from '@/lib/database.types'

interface UseChatProps {
  solicitudId: string
  autorTipo: 'cliente' | 'profesional'
  autorId?: string
}

export function useChat({ solicitudId, autorTipo, autorId }: UseChatProps) {
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)

  // Load initial messages
  useEffect(() => {
    async function loadMensajes() {
      const { data, error } = await supabase
        .from('chat_mensajes')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMensajes(data)
      }
      setLoading(false)
    }

    loadMensajes()
  }, [solicitudId])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${solicitudId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_mensajes',
          filter: `solicitud_id=eq.${solicitudId}`,
        },
        (payload) => {
          const nuevoMensaje = payload.new as ChatMensaje
          setMensajes(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === nuevoMensaje.id)) return prev
            return [...prev, nuevoMensaje]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [solicitudId])

  // Mark messages as read when viewing
  useEffect(() => {
    if (mensajes.length === 0) return

    const unreadIds = mensajes
      .filter(m => !m.leido && m.autor_tipo !== autorTipo)
      .map(m => m.id)

    if (unreadIds.length === 0) return

    supabase
      .from('chat_mensajes')
      .update({ leido: true })
      .in('id', unreadIds)
      .then(() => {
        setMensajes(prev =>
          prev.map(m =>
            unreadIds.includes(m.id) ? { ...m, leido: true } : m
          )
        )
      })
  }, [mensajes, autorTipo])

  const enviarMensaje = useCallback(async (mensaje: string, archivoUrl?: string) => {
    if (!mensaje.trim() && !archivoUrl) return { error: 'Mensaje vacío' }

    setEnviando(true)

    const { data, error } = await supabase
      .from('chat_mensajes')
      .insert({
        solicitud_id: solicitudId,
        autor_tipo: autorTipo,
        autor_id: autorId || null,
        mensaje: mensaje.trim(),
        archivo_url: archivoUrl || null,
        leido: false,
      })
      .select()
      .single()

    setEnviando(false)

    if (error) {
      return { error: error.message }
    }

    return { data }
  }, [solicitudId, autorTipo, autorId])

  const mensajesNoLeidos = mensajes.filter(
    m => !m.leido && m.autor_tipo !== autorTipo
  ).length

  return {
    mensajes,
    loading,
    enviando,
    enviarMensaje,
    mensajesNoLeidos,
  }
}
