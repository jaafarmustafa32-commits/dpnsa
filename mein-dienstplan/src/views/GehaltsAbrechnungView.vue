<template>
  <div class="page-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/profile" class="user-info user-info-link">
          <div class="avatar-icon">
            <i class="fa-solid fa-user-gear"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ isAdmin ? 'Admin Portal' : 'Mitarbeiter Portal' }}</span>
          </div>
        </router-link>

        <!-- Mobile Menü Button -->
        <button class="menu-toggle" @click.stop="toggleMobileMenu" aria-label="Menü öffnen">
          <i class="fa-solid" :class="isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
        </button>

        <nav class="nav-buttons" :class="{ show: isMobileMenuOpen }">
          <router-link to="/home" class="btn-nav" @click="closeMobileMenu">
            <i class="fa-solid fa-calendar-days"></i> Home
          </router-link>
          <router-link to="/antraege" class="btn-nav" @click="closeMobileMenu">
            <i class="fa-solid fa-file-pen"></i> Anträge
          </router-link>
          <router-link to="/gehalt" class="btn-nav active" @click="closeMobileMenu">
            <i class="fa-solid fa-file-invoice-dollar"></i> Gehalt
          </router-link>
          <router-link to="/anweisungen" class="btn-nav" @click="closeMobileMenu">
            <i class="fa-solid fa-file-pdf"></i> Anweisungen
          </router-link>
          <router-link to="/kontakt" class="btn-nav" @click="closeMobileMenu">
            <i class="fa-solid fa-paper-plane"></i> Büro Kontakt
          </router-link>
          <router-link to="/profile" class="btn-nav" @click="closeMobileMenu">
            <i class="fa-solid fa-user"></i> Profil
          </router-link>
          <button class="btn-nav btn-logout" @click="handleLogout">
            <i class="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="app-main">
      <div class="section-title">
        <h2><i class="fa-solid fa-file-invoice-dollar"></i> Gehaltsabrechnungen</h2>
        <p>Übersicht Ihrer monatlichen Lohnzettel und Auszahlungen.</p>
      </div>

      <!-- Upload-Bereich: Wird NUR für Admins angezeigt -->
      <div v-if="isAdmin" class="upload-card">
        <h3><i class="fa-solid fa-cloud-arrow-up"></i> Neuen Lohnzettel hochladen</h3>
        <form @submit.prevent="uploadSalaryPdf" class="upload-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Monat</label>
              <select v-model="newSalary.month" required class="form-input">
                <option value="" disabled>Monat wählen</option>
                <option v-for="m in ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Jahr</label>
              <input type="number" v-model="newSalary.year" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Netto (€)</label>
              <input type="text" v-model="newSalary.netto" placeholder="z.B. 2.140,50" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Brutto (€)</label>
              <input type="text" v-model="newSalary.brutto" placeholder="z.B. 3.050,00" required class="form-input" />
            </div>
          </div>

          <div class="form-group full-width">
            <label>Lohnzettel PDF Datei</label>
            <input type="file" @change="handleFileChange" accept="application/pdf" required class="form-input file-input" />
          </div>

          <button type="submit" class="btn-submit" :disabled="uploading">
            <i class="fa-solid fa-upload"></i> {{ uploading ? 'Wird hochgeladen...' : 'Lohnzettel hochladen' }}
          </button>
        </form>
      </div>

      <!-- Ladeanzeige -->
      <div v-if="loading" class="text-center" style="padding: 30px; color: #94a3b8; text-align: center;">
        Lade Lohnzettel...
      </div>

      <!-- Gehaltsliste / Karten -->
      <div v-else class="salary-list">
        <div v-for="item in salaryData" :key="item.id" class="salary-card">
          <div class="salary-info">
            <div class="salary-icon"><i class="fa-solid fa-file-pdf"></i></div>
            <div>
              <h3>{{ item.month }} {{ item.year }}</h3>
              <span class="salary-amount">Netto: <strong>{{ item.netto }} €</strong> (Brutto: {{ item.brutto }} €)</span>
            </div>
          </div>

          <div class="salary-action">
            <span class="badge-status success">Ausbezahlt</span>
            <a v-if="item.file_url" :href="item.file_url" target="_blank" class="btn-download">
              <i class="fa-solid fa-download"></i> Lohnzettel
            </a>
          </div>
        </div>

        <!-- Fallback wenn keine Lohnzettel da sind -->
        <div v-if="salaryData.length === 0" class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <p>Keine Gehaltsabrechnungen vorhanden.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const salaryData = ref([])
const loading = ref(true)
const uploading = ref(false)
const userName = ref('Mitarbeiter')
const isAdmin = ref(false)

const newSalary = ref({
  month: '',
  year: new Date().getFullYear(),
  netto: '',
  brutto: ''
})
const selectedFile = ref(null)

onMounted(async () => {
  const userJson = localStorage.getItem('currentUser')
  if (userJson) {
    try {
      const user = JSON.parse(userJson)
      if (user && user.name) {
        userName.value = user.name
      }
      // Prüfen ob der User Admin ist (passe hier die E-Mail oder Rolle an deine DB/LocalStorage an)
      if (user && (user.email === 'deine-admin-email@domain.at' || user.role === 'admin')) {
        isAdmin.value = true
      }
    } catch (e) {
      console.error('Fehler beim Parsen des Users', e)
    }
  }

  window.addEventListener('resize', checkScreenSize)
  await fetchSalaries()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const fetchSalaries = async () => {
  loading.value = true
  const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Lohnzettel:', error.message)
  } else if (data) {
    salaryData.value = data
  }
  loading.value = false
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadSalaryPdf = async () => {
  if (!selectedFile.value) {
    alert('Bitte wähle eine PDF-Datei aus.')
    return
  }

  uploading.value = true
  try {
    const fileExt = selectedFile.value.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `salaries/${fileName}`

    // 1. Datei in Storage hochladen
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile.value)

    if (uploadError) throw uploadError

    // 2. Öffentliche URL abrufen
    const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

    const fileUrl = publicUrlData.publicUrl

    // 3. Datensatz in die Tabelle eintragen
    const { error: dbError } = await supabase
        .from('salaries')
        .insert([{
          month: newSalary.value.month,
          year: Number(newSalary.value.year),
          netto: newSalary.value.netto,
          brutto: newSalary.value.brutto,
          file_url: fileUrl
        }])

    if (dbError) throw dbError

    alert('Lohnzettel erfolgreich hochgeladen!')

    // Formular zurücksetzen
    newSalary.value.month = ''
    newSalary.value.netto = ''
    newSalary.value.brutto = ''
    selectedFile.value = null

    // Liste neu laden
    await fetchSalaries()
  } catch (err) {
    console.error('Fehler beim Upload:', err)
    alert('Fehler beim Hochladen (Keine Berechtigung?): ' + (err.message || err))
  } finally {
    uploading.value = false
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const checkScreenSize = () => {
  if (window.innerWidth > 768) {
    isMobileMenuOpen.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  router.push('/login')
}
</script>

<style scoped>
/* Styles bleiben unverändert wie zuvor */
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.page-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  background-color: #0b0f19;
}

.app-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  gap: 24px;
}

.user-info-link { text-decoration: none; flex-shrink: 0; }
.user-info { display: flex; align-items: center; gap: 12px; }

.avatar-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.user-details { display: flex; flex-direction: column; text-align: left; }
.user-name { font-size: 0.9rem; font-weight: 600; color: #f8fafc; line-height: 1.2; white-space: nowrap; }
.user-role { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #f8fafc;
  cursor: pointer;
  padding: 8px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-nav {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-nav:active { transform: scale(0.96); }
.btn-nav.router-link-active, .btn-nav.active { background: #2563eb; border-color: #3b82f6; color: #fff; }
.btn-logout { background: rgba(239, 68, 68, 0.12); color: #fca5a5; border-color: rgba(239, 68, 68, 0.2); }

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title h2 { font-size: 1.3rem; color: #fff; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
.section-title p { font-size: 0.85rem; color: #94a3b8; margin: 0; }

.upload-card {
  background: #161e2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 10px;
}
.upload-card h3 { font-size: 1.05rem; color: #fff; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.upload-form { display: flex; flex-direction: column; gap: 14px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
.form-input {
  background: #0b0f19;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
}
.form-input:focus { border-color: #3b82f6; }
.file-input { padding: 8px; cursor: pointer; }

.btn-submit {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  margin-top: 4px;
}
.btn-submit:hover { background: #059669; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.salary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.salary-card {
  background: #161e2e;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  gap: 16px;
}

.salary-info { display: flex; align-items: center; gap: 14px; }
.salary-icon { width: 42px; height: 42px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.salary-card h3 { font-size: 1rem; color: #fff; margin: 0 0 4px 0; }
.salary-amount { font-size: 0.82rem; color: #94a3b8; }
.salary-amount strong { color: #34d399; }

.salary-action { display: flex; align-items: center; gap: 14px; }

.badge-status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
}
.badge-status.success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

.btn-download {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-download:hover { background: #1d4ed8; }

.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
  background: #161e2e;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.empty-state i { font-size: 2.5rem; margin-bottom: 10px; color: #475569; }

@media (max-width: 768px) {
  .app-main {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 16px 12px !important;
  }
  .header-inner {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 12px 14px !important;
  }
  .menu-toggle { display: block !important; }
  .nav-buttons {
    display: none !important;
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    width: 100% !important;
    background: #0f172a !important;
    flex-direction: column !important;
    padding: 16px !important;
    gap: 8px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
    z-index: 1000 !important;
  }
  .nav-buttons.show { display: flex !important; }
  .btn-nav { width: 100% !important; justify-content: flex-start !important; padding: 12px 14px !important; font-size: 0.9rem !important; }
  .salary-card { padding: 14px !important; flex-direction: column; align-items: flex-start; gap: 12px; }
  .salary-action { width: 100%; justify-content: space-between; }
}
</style>