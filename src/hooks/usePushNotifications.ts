'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function usePushNotifications(userId?: string, profesionalId?: string) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    setLoading(false)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { error: 'Notificaciones no soportadas' }
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      await subscribeUser()
    }

    return { permission: result }
  }, [])

  const subscribeUser = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return { error: 'Service Worker no soportado' }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY

      if (!vapidKey) {
        return { error: 'VAPID key no configurada' }
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      setSubscription(sub)

      // Save to database
      const { error } = await supabase.from('push_subscriptions').insert({
        usuario_auth_id: userId || null,
        profesional_id: profesionalId || null,
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
          auth: arrayBufferToBase64(sub.getKey('auth')),
        },
      })

      if (error) {
        console.error('Error saving subscription:', error)
        return { error: error.message }
      }

      return { subscription: sub }
    } catch (err) {
      console.error('Error subscribing:', err)
      return { error: 'Error al suscribirse' }
    }
  }, [userId, profesionalId])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return

    await subscription.unsubscribe()
    setSubscription(null)

    // Remove from database
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subscription.endpoint)
  }, [subscription])

  return {
    permission,
    subscription,
    loading,
    requestPermission,
    unsubscribe,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
  }
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
