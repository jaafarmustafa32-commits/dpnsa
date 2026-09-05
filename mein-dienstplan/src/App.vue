<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { supabase } from '@/config/supabase.js' // Passe den Pfad an, falls er bei dir anders ist

// Hilfsfunktion, um den Public Key für den Browser kompatibel zu machen
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Funktion zum Registrieren der Push-Benachrichtigungen
const registerPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.')
    return
  }

  try {
    // 1. Service Worker aus dem public-Ordner registrieren
    const registration = await navigator.serviceWorker.register('/sw.js')

    // 2. Erlaubnis beim Nutzer anfragen (Browser zeigt das Pop-up)
    const permissionResult = await Notification.requestPermission()
    if (permissionResult !== 'granted') {
      console.log('Benachrichtigungs-Berechtigung wurde verweigert.')
      return
    }

    // 3. Deinen Public Key einbinden
    const publicVapidKey = 'BCiQsCC6zBIpqZkwGLpGOKpT-tzIFkPlHSGu_nlg0D3sqtl0dR06QW_jV8OsgEkLSH3-_hezK6kO_6Ih6Jo68tA'
    const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey)

    // 4. Push-Abonnement beim Browser anfordern
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    })

    // 5. In Supabase speichern (für den aktuell eingeloggten Mitarbeiter)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription: subscription
      }, { onConflict: 'user_id' })

      if (error) {
        console.error('Fehler beim Speichern des Push-Abos in Supabase:', error)
      } else {
        console.log('Push-Abo erfolgreich erstellt und in Supabase gespeichert!')
      }
    } else {
      console.log('Kein Nutzer eingeloggt – Abo konnte nicht mit Nutzer verknüpft werden.')
    }

  } catch (error) {
    console.error('Fehler bei der Push-Registrierung:', error)
  }
}

// Sobald die App startet, wird die Registrierung angestoßen
onMounted(() => {
  registerPushNotifications()
})
</script>

<style>
/* Globale Einstellungen */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

html, body {
  background-color: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100% !important; /* Erzwingt die volle Bildschirmbreite */
  margin: 0 !important;
  padding: 0 !important;
}

@media (max-width: 768px) {
  body, html, #app {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>