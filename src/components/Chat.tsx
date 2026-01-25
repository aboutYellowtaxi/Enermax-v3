'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Image as ImageIcon, X } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { formatTiempoRelativo } from '@/lib/constants'

interface ChatProps {
  solicitudId: string
  autorTipo: 'cliente' | 'profesional'
  autorId?: string
  otroNombre: string
}

export default function Chat({ solicitudId, autorTipo, autorId, otroNombre }: ChatProps) {
  const { mensajes, loading, enviando, enviarMensaje } = useChat({
    solicitudId,
    autorTipo,
    autorId,
  })
  const [mensaje, setMensaje] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensaje.trim() || enviando) return

    const result = await enviarMensaje(mensaje)
    if (!result.error) {
      setMensaje('')
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
          <span className="text-primary-400 font-semibold">
            {otroNombre.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-dark-100">{otroNombre}</h3>
          <p className="text-xs text-dark-500">Chat del trabajo</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-dark-400">
            Cargando mensajes...
          </div>
        ) : mensajes.length === 0 ? (
          <div className="text-center py-8 text-dark-400">
            <p>No hay mensajes todavía</p>
            <p className="text-sm">Comenzá la conversación</p>
          </div>
        ) : (
          mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.autor_tipo === autorTipo ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  msg.autor_tipo === 'sistema'
                    ? 'max-w-[90%] text-center text-xs text-dark-500 py-2'
                    : msg.autor_tipo === autorTipo
                    ? 'chat-bubble-sent'
                    : 'chat-bubble-received'
                }
              >
                {msg.autor_tipo === 'sistema' ? (
                  <span className="bg-dark-800 rounded-full px-3 py-1">{msg.mensaje}</span>
                ) : (
                  <>
                    <p className="break-words">{msg.mensaje}</p>
                    {msg.archivo_url && (
                      <a
                        href={msg.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-xs underline"
                      >
                        Ver archivo adjunto
                      </a>
                    )}
                    <span className={`text-[10px] mt-1 block ${
                      msg.autor_tipo === autorTipo ? 'text-dark-700' : 'text-dark-500'
                    }`}>
                      {formatTiempoRelativo(msg.created_at)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            disabled={enviando}
          />
          <button
            type="submit"
            disabled={!mensaje.trim() || enviando}
            className="bg-primary-400 hover:bg-primary-500 text-dark-900 rounded-xl px-4 py-2.5 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
