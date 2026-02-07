'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface VideoCallProps {
  solicitudId: string
  role: 'cliente' | 'profesional'
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export default function VideoCall({ solicitudId, role }: VideoCallProps) {
  const [active, setActive] = useState(false)
  const [incoming, setIncoming] = useState(false)
  const [connected, setConnected] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const pendingOfferRef = useRef<string | null>(null)

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setActive(false)
    setConnected(false)
    setIncoming(false)
  }, [])

  // Setup signaling channel
  useEffect(() => {
    const channel = supabase
      .channel(`video:${solicitudId}`)
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (!payload || payload.from === role) return

        if (payload.type === 'offer') {
          setIncoming(true)
          pendingOfferRef.current = payload.sdp
        } else if (payload.type === 'answer' && pcRef.current) {
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: payload.sdp })
          )
        } else if (payload.type === 'ice' && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate))
          } catch { /* ignore */ }
        } else if (payload.type === 'hangup') {
          cleanup()
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      cleanup()
      supabase.removeChannel(channel)
    }
  }, [solicitudId, role, cleanup])

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'ice', candidate: e.candidate, from: role },
        })
      }
    }

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0]
      }
      setConnected(true)
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        cleanup()
      }
    }

    return pc
  }

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: true,
    })
    localStreamRef.current = stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    return stream
  }

  const startCall = async () => {
    setActive(true)
    try {
      const stream = await getMedia()
      const pc = createPeerConnection()
      pcRef.current = pc

      stream.getTracks().forEach(t => pc.addTrack(t, stream))

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'offer', sdp: offer.sdp, from: role },
      })
    } catch {
      cleanup()
    }
  }

  const acceptCall = async () => {
    setActive(true)
    setIncoming(false)
    try {
      const stream = await getMedia()
      const pc = createPeerConnection()
      pcRef.current = pc

      stream.getTracks().forEach(t => pc.addTrack(t, stream))

      const pendingOffer = pendingOfferRef.current
      if (pendingOffer) {
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'offer', sdp: pendingOffer })
        )
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'answer', sdp: answer.sdp, from: role },
        })
      }
    } catch {
      cleanup()
    }
  }

  const hangup = () => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type: 'hangup', from: role },
    })
    cleanup()
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setVideoEnabled(prev => !prev)
  }

  const toggleAudio = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setAudioEnabled(prev => !prev)
  }

  // Incoming call banner
  if (incoming && !active) {
    return (
      <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5" />
          <span className="font-semibold text-sm">Videollamada entrante...</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={acceptCall}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Aceptar
          </button>
          <button
            onClick={() => { setIncoming(false); cleanup() }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Rechazar
          </button>
        </div>
      </div>
    )
  }

  // Not in call: show start button
  if (!active) {
    return (
      <button
        onClick={startCall}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200
                   text-gray-700 font-semibold text-sm py-3 rounded-xl transition-colors border border-gray-200"
      >
        <Camera className="w-4 h-4" />
        {role === 'cliente' ? 'Mostrar problema por video' : 'Iniciar videollamada'}
      </button>
    )
  }

  // Active call
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden relative">
      {/* Remote video (full) */}
      <div className="aspect-video bg-gray-800 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!connected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm animate-pulse">Conectando...</span>
          </div>
        )}
      </div>

      {/* Local video (small overlay) */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-3 right-3 w-24 h-32 sm:w-32 sm:h-24 object-cover rounded-xl border-2 border-white/20"
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 p-3">
        <button
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            audioEnabled ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            videoEnabled ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button
          onClick={hangup}
          className="w-12 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
