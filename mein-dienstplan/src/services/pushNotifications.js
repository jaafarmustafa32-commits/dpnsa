import { supabase } from '../config/supabase.js'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)

  const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

  const rawData = window.atob(base64)

  return Uint8Array.from(
      [...rawData].map((char) => char.charCodeAt(0))
  )
}

export const isPushSupported = () => {
  return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
  )
}

export const getPushPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  return Notification.permission
}

/**
 * Erstellt oder aktualisiert die Push-Subscription
 * für den aktuell eingeloggten Benutzer.
 */
export const ensurePushSubscription = async ({
                                               requestPermission = false
                                             } = {}) => {
  if (!isPushSupported()) {
    return {
      enabled: false,
      reason: 'unsupported'
    }
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error(
        'VITE_VAPID_PUBLIC_KEY fehlt in den Frontend-Umgebungsvariablen.'
    )
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error('Bitte zuerst anmelden.')
  }

  let permission = Notification.permission

  if (permission === 'default' && requestPermission) {
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') {
    return {
      enabled: false,
      reason: permission
    }
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  })

  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
  }

  const subscriptionJson = subscription.toJSON()

  if (!subscriptionJson.endpoint) {
    throw new Error(
        'Push-Subscription enthält keinen Endpoint.'
    )
  }

  const { error: saveError } = await supabase
      .from('push_subscriptions')
      .upsert(
          {
            user_id: user.id,
            endpoint: subscriptionJson.endpoint,
            subscription: subscriptionJson,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'endpoint'
          }
      )

  if (saveError) {
    console.error(
        'Fehler beim Speichern der Push-Subscription:',
        saveError
    )

    throw saveError
  }

  console.info('✅ Push-Subscription gespeichert', {
    user_id: user.id,
    endpoint: subscriptionJson.endpoint
  })

  return {
    enabled: true,
    subscription
  }
}

/**
 * Push manuell aktivieren.
 */
export const enablePushNotifications = async () => {
  const result = await ensurePushSubscription({
    requestPermission: true
  })

  if (!result.enabled) {
    throw new Error(
        'Push konnte nicht aktiviert werden.'
    )
  }

  return result.subscription
}

/**
 * Aktuelle Subscription holen.
 */
export const getCurrentPushSubscription = async () => {
  if (!isPushSupported()) {
    return null
  }

  const registration =
      await navigator.serviceWorker.ready

  return registration.pushManager.getSubscription()
}

/**
 * Push deaktivieren.
 */
export const disablePushNotifications = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const registration =
      await navigator.serviceWorker.ready

  const subscription =
      await registration.pushManager.getSubscription()

  if (!subscription) {
    return
  }

  const endpoint = subscription.endpoint

  await subscription.unsubscribe()

  if (user) {
    const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint)

    if (error) {
      console.error(
          'Fehler beim Löschen der Push-Subscription:',
          error
      )
    }
  }
}