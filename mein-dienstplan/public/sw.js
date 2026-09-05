// public/sw.js
self.addEventListener('push', function (event) {
    if (!(self.registration && self.registration.showNotification)) {
        return;
    }

    let data = { title: 'Neue Benachrichtigung', body: 'Du hast eine neue Nachricht.', url: '/home' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/favicon.ico', // Passe das an dein Icon an
        badge: '/favicon.ico',
        data: { url: data.url || '/home' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Klick auf die Benachrichtigung öffnet die App
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients.get(i);
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});