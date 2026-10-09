<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { supabase } from '@/config/supabase.js'


/* =========================================================
   PUSH NOTIFICATIONS
========================================================= */

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat(
      (4 - (base64String.length % 4)) % 4
  )

  const base64 = (
      base64String + padding
  )
      .replace(/-/g, '+')
      .replace(/_/g, '/')

  const rawData = window.atob(base64)

  const outputArray = new Uint8Array(
      rawData.length
  )

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}


/* =========================================================
   PUSH REGISTRIEREN
========================================================= */

const registerPushNotifications = async () => {

  if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
  ) {
    console.log(
        'Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.'
    )

    return
  }

  try {

    const registration =
        await navigator.serviceWorker.register('/sw.js')


    const permissionResult =
        await Notification.requestPermission()


    if (permissionResult !== 'granted') {

      console.log(
          'Benachrichtigungs-Berechtigung wurde verweigert.'
      )

      return
    }


    const publicVapidKey =
        'BCiQsCC6zBIpqZkwGLpGOKpT-tzIFkPlHSGu_nlg0D3sqtl0dR06QW_jV8OsgEkLSH3-_hezK6kO_6Ih6Jo68tA'


    const convertedVapidKey =
        urlBase64ToUint8Array(publicVapidKey)


    const subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })


    const {
      data: { user }
    } = await supabase.auth.getUser()


    if (!user) {

      console.log(
          'Kein Nutzer eingeloggt – Push-Abo wurde nicht gespeichert.'
      )

      return
    }


    const { error } =
        await supabase
            .from('push_subscriptions')
            .upsert(
                {
                  user_id: user.id,
                  subscription: subscription
                },
                {
                  onConflict: 'user_id'
                }
            )


    if (error) {

      console.error(
          'Fehler beim Speichern des Push-Abos:',
          error
      )

    } else {

      console.log(
          'Push-Abo erfolgreich erstellt und gespeichert.'
      )

    }

  } catch (error) {

    console.error(
        'Fehler bei der Push-Registrierung:',
        error
    )

  }

}


/* =========================================================
   APP START
========================================================= */

onMounted(() => {

  registerPushNotifications()

})
</script>


<style>
/* =========================================================
   GLOBAL RESET
========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}


/* =========================================================
   HTML / BODY
========================================================= */

html {
  width: 100%;
  min-height: 100%;
}

html,
body {
  margin: 0;
  padding: 0;

  width: 100%;
  min-width: 320px;
  min-height: 100%;

  overflow-x: hidden;

  font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  background: var(--background);
  color: var(--text);

  transition:
      background-color 0.25s ease,
      color 0.25s ease;
}


/* =========================================================
   APP
========================================================= */

#app {
  width: 100%;
  min-height: 100vh;

  margin: 0;
  padding: 0;

  background: var(--background);
  color: var(--text);
}


/* =========================================================
   DEFAULT THEME
========================================================= */

:root {

  --background: #0b1120;
  --surface: #111827;
  --surface-2: #172033;

  --text: #f8fafc;
  --text-secondary: #aab4c5;
  --text-muted: #6f7b90;

  --border: rgba(255, 255, 255, 0.08);

  --accent: #7c6ff2;

  --success: #35d39a;
  --warning: #f4b860;
  --danger: #ef6678;

}


/* =========================================================
   LIGHT THEME
========================================================= */

html.light-theme {

  --background: #f5f7fb;
  --surface: #ffffff;
  --surface-2: #f0f3f8;

  --text: #172033;
  --text-secondary: #596579;
  --text-muted: #8b95a7;

  --border: #e3e8f0;

  --accent: #6d5ce7;

  --success: #25b982;
  --warning: #e8a63d;
  --danger: #dc5268;

}


/* =========================================================
   DARK THEME
========================================================= */

html:not(.light-theme) {

  color-scheme: dark;

}


/* =========================================================
   LIGHT THEME
========================================================= */

html.light-theme {

  color-scheme: light;

}


/* =========================================================
   FORM ELEMENTS
========================================================= */

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}


/* =========================================================
   LINKS
========================================================= */

a {
  color: inherit;
  text-decoration: none;
}


/* =========================================================
   IMAGES
========================================================= */

img {
  display: block;
  max-width: 100%;
}


/* =========================================================
   SCROLLBAR
========================================================= */

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.35) transparent;
}

*::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 999px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.55);
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {

  html,
  body,
  #app {
    width: 100%;
    min-width: 320px;
    max-width: 100%;
  }

}
</style>