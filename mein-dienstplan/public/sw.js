/* public/sw.js */

self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installiert')
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker aktiviert')

    event.waitUntil(
        self.clients.claim()
    )
})

self.addEventListener('push', (event) => {
    console.log('📩 Push-Nachricht empfangen')

    let data = {
        title: '📅 Neue Benachrichtigung',
        body: 'Du hast eine neue Nachricht.',
        url: '/'
    }

    // Push-Daten lesen
    if (event.data) {
        try {
            data = {
                ...data,
                ...event.data.json()
            }
        } catch (error) {
            try {
                data.body = event.data.text()
            } catch {
                console.error('Push-Daten konnten nicht gelesen werden:', error)
            }
        }
    }

    const notificationOptions = {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'dienstplan-notification',
        renotify: true,
        requireInteraction: false,
        data: {
            url: data.url || '/'
        }
    }

    event.waitUntil(
        self.registration.showNotification(
            data.title || '📅 Dienstplan',
            notificationOptions
        )
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const url = event.notification?.data?.url || '/'

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {

            // Bereits geöffnete App verwenden
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(url)
                    return client.focus()
                }
            }

            // Neue App öffnen
            if (clients.openWindow) {
                return clients.openWindow(url)
            }

            return null
        })
    )
})

self.addEventListener('notificationclose', () => {
    console.log('🔕 Benachrichtigung geschlossen')
})