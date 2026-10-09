# Push-Benachrichtigungen – Mein Dienstplan

Die Push-Funktion ist jetzt vorbereitet.

## 1. Supabase SQL

In Supabase → SQL Editor den Inhalt von:

`supabase/push_subscriptions.sql`

ausführen.

## 2. VAPID-Schlüssel erzeugen

Auf deinem PC im Projekt:

```bash
npx web-push generate-vapid-keys
```

Du bekommst:

- Public Key
- Private Key

Der **Private Key darf niemals in Vue/Frontend oder Git** gespeichert werden.

## 3. Supabase Edge Function Secrets

In Supabase → Edge Functions → Secrets anlegen:

```text
VAPID_PUBLIC_KEY=DEIN_PUBLIC_KEY
VAPID_PRIVATE_KEY=DEIN_PRIVATE_KEY
```

Der Private Key bleibt ausschließlich auf der Edge Function.

## 4. Frontend Public Key

Im Projekt eine `.env.local` anlegen:

```env
VITE_VAPID_PUBLIC_KEY=DEIN_PUBLIC_KEY
```

Nur der Public Key kommt ins Frontend.

Danach:

```bash
npm install
npm run build
```

und die neue `dist` deployen.

## 5. Was der Mitarbeiter macht

Nach dem Login sieht der Mitarbeiter:

**Push-Benachrichtigungen → Push aktivieren**

Dann muss er im Browser **Erlauben** auswählen.

Die Subscription wird zusammen mit seiner Supabase `user_id` in
`push_subscriptions` gespeichert.

## 6. Was beim Dienstplan passiert

Die Edge Function sammelt die `user_id`s der tatsächlich eingeplanten
Mitarbeiter und sucht nur deren Push-Subscriptions.

Danach erhält jeder betroffene Mitarbeiter:

**📅 Neuer Dienstplan da!**

Auch wenn die Webseite gerade geschlossen ist, übernimmt `public/sw.js`
den Empfang und zeigt die Browser-/Systembenachrichtigung.

## Wichtig

Web Push benötigt HTTPS (localhost ist für Entwicklung ebenfalls erlaubt).

Wenn ein Mitarbeiter Benachrichtigungen im Browser einmal blockiert hat,
muss er sie in den Website-/Browser-Einstellungen wieder erlauben.
