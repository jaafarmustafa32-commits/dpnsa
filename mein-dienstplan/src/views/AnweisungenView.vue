<template>
  <div class="page-container">
    <header class="app-header">
      <div class="header-inner">
        <!-- Profil-Link -->
        <router-link to="/profile" class="user-info user-info-link">
          <div class="avatar-icon">
            <i class="fa-solid fa-user-gear"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">Mitarbeiter Portal</span>
          </div>
        </router-link>

        <button class="menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Menü öffnen">
          <i class="fa-solid" :class="isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
        </button>

        <nav class="nav-buttons" :class="{ show: isMobileMenuOpen }">
          <router-link to="/home" class="btn-nav" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-calendar-days"></i> Home
          </router-link>
          <router-link to="/antraege" class="btn-nav" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-file-pen"></i> Anträge
          </router-link>
          <router-link to="/anweisungen" class="btn-nav active" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-file-pdf"></i> Anweisungen
          </router-link>
          <router-link to="/gehalt" class="btn-nav" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-file-invoice-dollar"></i> Gehalt
          </router-link>
          <router-link to="/kontakt" class="btn-nav" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-paper-plane"></i> Büro Kontakt
          </router-link>
          <router-link to="/profile" class="btn-nav" @click="isMobileMenuOpen = false">
            <i class="fa-solid fa-user"></i> Profil
          </router-link>
          <button class="btn-nav btn-logout" @click="handleLogout">
            <i class="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <section class="card">
        <div class="card-header">
          <div class="card-icon red">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <div>
            <h2>Dienstanweisungen & Dokumente</h2>
            <p class="card-subtitle">Offizielle Richtlinien und PDFs vom Büro</p>
          </div>
        </div>

        <div class="pdf-list">
          <!-- Lade-Animation -->
          <div v-if="loading" class="text-center" style="padding: 20px; color: #94a3b8;">
            Lade Dokumente...
          </div>

          <!-- Wenn Dokumente vorhanden sind -->
          <div v-for="doc in pdfDocuments" :key="doc.id" class="pdf-item">
            <div class="pdf-info">
              <i class="fa-regular fa-file-pdf pdf-icon"></i>
              <div class="pdf-text-details">
                <strong>{{ doc.title }}</strong>
                <p class="pdf-content-text" v-if="doc.content">{{ doc.content }}</p>
                <span class="pdf-meta">Von: {{ doc.sender || 'Admin' }} | Datum: {{ formatDate(doc.created_at) }}</span>
              </div>
            </div>

            <!-- Download / Öffnen Button (Nur wenn eine Datei angehängt wurde) -->
            <a v-if="doc.file_url" :href="doc.file_url" target="_blank" class="btn-download">
              <i class="fa-solid fa-download"></i>
              <span>PDF Öffnen</span>
            </a>
            <span v-else class="no-file-badge">Nur Nachricht</span>
          </div>

          <!-- Fallback falls keine Nachrichten/Dokumente da sind -->
          <div v-if="!loading && pdfDocuments.length === 0" class="text-center" style="padding: 20px; color: #64748b;">
            Keine Dienstanweisungen vorhanden.
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const pdfDocuments = ref([])
const loading = ref(true)
const userName = ref('Mitarbeiter')

onMounted(async () => {
  // Benutzername aus dem LocalStorage auslesen
  const userJson = localStorage.getItem('currentUser')
  if (userJson) {
    try {
      const user = JSON.parse(userJson)
      if (user && user.name) {
        userName.value = user.name
      }
    } catch (e) {
      console.error('Fehler beim Parsen des Benutzers', e)
    }
  }

  await fetchAnnouncements()
})

const fetchAnnouncements = async () => {
  loading.value = true
  const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

  if (!error && data) {
    pdfDocuments.value = data
  }
  loading.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  router.push('/login')
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

/* Base Layout & Desktop-Zentrierung */
.page-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #0b0f19;
  color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Full-Width Header */
.app-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info-link { text-decoration: none; }
.user-info { display: flex; align-items: center; gap: 10px; }

.avatar-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.user-details { display: flex; flex-direction: column; text-align: left; }
.user-name { font-size: 0.85rem; font-weight: 600; color: #f8fafc; }
.user-role { font-size: 0.7rem; color: #94a3b8; }

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #f8fafc;
  cursor: pointer;
  padding: 6px;
}

.nav-buttons { display: flex; gap: 8px; }

.btn-nav {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  touch-action: manipulation;
}

.btn-nav:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
.btn-nav.active { background: #2563eb; border-color: #3b82f6; color: #fff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
.btn-logout { background: rgba(239, 68, 68, 0.12); color: #fca5a5; border-color: rgba(239, 68, 68, 0.2); cursor: pointer; }

/* Zentrierter Hauptbereich für PC & Mobile */
.app-main {
  flex: 1;
  padding: 20px 16px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.card {
  background: #161e2e;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }

.card-icon.red {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.card h2 { font-size: 1.15rem; font-weight: 700; margin: 0 0 2px 0; color: #f8fafc; }
.card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 0; }

.pdf-list { display: flex; flex-direction: column; gap: 12px; }

.pdf-item {
  background: #0b0f19;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
}

.pdf-item:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: #0d1322;
}

.pdf-info { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.pdf-icon { font-size: 1.8rem; color: #ef4444; flex-shrink: 0; }
.pdf-text-details { display: flex; flex-direction: column; text-align: left; width: 100%; min-width: 0; }
.pdf-info strong { font-size: 0.92rem; color: #f8fafc; font-weight: 600; line-height: 1.3; }
.pdf-content-text { font-size: 0.82rem; color: #cbd5e1; margin: 4px 0 2px 0; white-space: pre-line; word-break: break-word; }
.pdf-meta { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

.btn-download {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(37, 99, 235, 0.3);
  padding: 9px 14px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: all 0.2s ease;
  touch-action: manipulation;
}

.btn-download:hover { background: #2563eb; color: #fff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

.no-file-badge { font-size: 0.75rem; color: #64748b; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; white-space: nowrap; }

/* Mobile Anpassungen */
@media (max-width: 768px) {
  .menu-toggle { display: block; }

  .nav-buttons {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #0f172a;
    flex-direction: column;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }

  .nav-buttons.show { display: flex; }

  .btn-nav {
    width: 100%;
    justify-content: flex-start;
    padding: 12px 16px;
  }

  .app-main { padding: 14px 12px; }
  .card { padding: 18px 16px; border-radius: 14px; }

  .pdf-item { flex-direction: column; align-items: flex-start; gap: 12px; }
  .btn-download, .no-file-badge { width: 100%; justify-content: center; text-align: center; }
}
</style>