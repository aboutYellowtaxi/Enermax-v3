'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Mensaje {
  id: string
  autor_tipo: 'cliente' | 'profesional' | 'sistema'
  mensaje: string
  archivo_url?: string | null
  created_at: string
}

interface ChatProps {
  solicitudId: string
  autorTipo: 'cliente' | 'profesional'
  compact?: boolean
}

export default function Chat({ solicitudId, autorTipo, compact = false }: ChatProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(!compact)
  const [unread, setUnread] = useState(0)
  const [otherTyping, setOtherTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingSentRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Fetch messages from API (bypasses RLS via service role)
  const fetchMensajes = async () => {
    try {
      const res = await fetch(`/api/chat?solicitud_id=${solicitudId}`)
      const data = await res.json()
      if (data.mensajes) {
        setMensajes(data.mensajes)
      }
    } catch { /* retry on next poll */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchMensajes()

    // Subscribe to broadcast channel for instant delivery (no RLS needed)
    const channel = supabase
      .channel(`chat-live:${solicitudId}`)
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        if (payload && payload.mensaje) {
          setMensajes(prev => {
            if (prev.some(m => m.id === payload.mensaje.id)) return prev
            return [...prev, payload.mensaje as Mensaje]
          })
          if (!open && payload.mensaje.autor_tipo !== autorTipo) {
            setUnread(prev => prev + 1)
          }
          // Stop typing indicator when message arrives
          if (payload.mensaje.autor_tipo !== autorTipo) {
            setOtherTyping(false)
          }
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload && payload.autor !== autorTipo) {
          setOtherTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [solicitudId])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current && open) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, open])

  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  const enviar = async () => {
    if (!texto.trim() || enviando) return

    const textoEnviar = texto.trim()
    setTexto('')
    setEnviando(true)

    // Optimistic update
    const tempMsg: Mensaje = {
      id: `temp-${Date.now()}`,
      autor_tipo: autorTipo,
      mensaje: textoEnviar,
      created_at: new Date().toISOString(),
    }
    setMensajes(prev => [...prev, tempMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitudId,
          autorTipo,
          mensaje: textoEnviar,
        }),
      })
      const data = await res.json()

      if (data.mensaje) {
        setMensajes(prev =>
          prev.map(m => m.id === tempMsg.id ? data.mensaje : m)
        )
        // Broadcast to the other side
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { mensaje: data.mensaje },
        })
      }
    } catch {
      setMensajes(prev => prev.filter(m => m.id !== tempMsg.id))
      setTexto(textoEnviar)
    }

    setEnviando(false)
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  // Compact mode: floating button
  if (compact && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700
                   text-white rounded-full shadow-lg flex items-center justify-center
                   transition-all active:scale-95"
      >
        <MessageSquare className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                          font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={compact
      ? 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[70vh]'
      : 'bg-white rounded-2xl border border-gray-100 flex flex-col'
    }>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm text-gray-900">Chat</span>
          <span className="text-xs text-gray-400">
            {autorTipo === 'cliente' ? 'con el profesional' : 'con el cliente'}
          </span>
        </div>
        {compact && (
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
          >
            &times;
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 py-3 space-y-2 ${compact ? 'min-h-[200px] max-h-[50vh]' : 'min-h-[150px] max-h-[300px]'}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando...
          </div>
        ) : mensajes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Enviá un mensaje para iniciar la conversación
          </div>
        ) : (
          mensajes.map((m) => (
            <div key={m.id} className={`flex ${m.autor_tipo === autorTipo ? 'justify-end' : 'justify-start'}`}>
              {m.autor_tipo === 'sistema' ? (
                <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mx-auto">
                  {m.mensaje}
                </div>
              ) : (
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  m.autor_tipo === autorTipo
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  {m.archivo_url && (
                    /\.(jpg|jpeg|png|gif|webp|heic)(\?|$)/i.test(m.archivo_url) ? (
                      <img
                        src={m.archivo_url}
                        alt="Foto"
                        className="rounded-xl mb-1.5 max-w-full cursor-pointer"
                        style={{ maxHeight: 200 }}
                        onClick={() => window.open(m.archivo_url!, '_blank')}
                      />
                    ) : (
                      <video
                        src={m.archivo_url}
                        controls
                        playsInline
                        className="rounded-xl mb-1.5 max-w-full"
                        style={{ maxHeight: 200 }}
                      />
                    )
                  )}
                  {m.mensaje && <p>{m.mensaje}</p>}
                  <p className={`text-[10px] mt-0.5 ${m.autor_tipo === autorTipo ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Typing indicator */}
      {otherTyping && (
        <div className="px-4 py-1">
          <span className="text-xs text-gray-400 italic">
            {autorTipo === 'cliente' ? 'El profesional' : 'El cliente'} está escribiendo...
          </span>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-gray-100">
        <form onSubmit={(e) => { e.preventDefault(); enviar() }} className="flex items-center gap-2">
          <input
            type="text"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              // Broadcast typing (max once per 2s)
              const now = Date.now()
              if (now - lastTypingSentRef.current > 2000 && channelRef.current) {
                lastTypingSentRef.current = now
                channelRef.current.send({
                  type: 'broadcast',
                  event: 'typing',
                  payload: { autor: autorTipo },
                })
              }
            }}
            placeholder="Escribí un mensaje..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5
                       text-sm text-gray-900 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl
                       flex items-center justify-center transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
