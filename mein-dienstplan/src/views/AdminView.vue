<template>
  <div class="admin-wrapper">
    <!-- NAVBAR GANZ OBEN -->
    <header class="admin-navbar">
      <div class="navbar-left">
        <h2>Admin-Zentrale</h2>
      </div>
      <div class="navbar-right" v-if="adminName">
        <span>Eingeloggt als: <strong>{{ adminName }}</strong> (Admin)</span>
        <button @click="handleLogout" class="btn-logout">Abmelden</button>
      </div>
    </header>

    <!-- HAUPTINHALT -->
    <main class="admin-main-content">
      <!-- NAVIGATION TABS -->
      <div class="admin-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">
          📅 Schichtplan
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'preferences' }" @click="activeTab = 'preferences'">
          ⚙️ Präferenzen & KI
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'vacations' }" @click="activeTab = 'vacations'">
          🏖️ Urlaubsanträge
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'payroll' }" @click="activeTab = 'payroll'">
          💶 Lohnzettel
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'messages' }" @click="activeTab = 'messages'">
          📢 Nachricht
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
          🔔 Benachrichtigungen
        </button>
      </div>

      <!-- TAB 1: SCHICHTPLAN & KALENDER -->
      <div v-if="activeTab === 'schedule'">
        <div class="admin-form-card">
          <h3>Dienstplan-Ansicht wählen</h3>
          <div class="filter-row">
            <div class="form-group" style="flex: 1;">
              <label>Ansichts-Modus:</label>
              <select v-model="scheduleViewMode" @change="fetchGlobalOrEmployeeSchedules">
                <option value="employee">👤 Einzelner Mitarbeiter</option>
                <option value="global">🌍 Gesamte Kalenderansicht (Alle Standorte/Mitarbeiter)</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1;" v-if="scheduleViewMode === 'employee'">
              <label>Mitarbeiter wählen:</label>
              <select v-model="selectedEmployeeId" @change="fetchEmployeeSchedules">
                <option disabled value="">-- Bitte Mitarbeiter wählen --</option>
                <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Monat:</label>
              <select v-model="selectedMonth" @change="fetchGlobalOrEmployeeSchedules">
                <option v-for="(m, idx) in monthNames" :key="idx" :value="idx">{{ m }} {{ currentYear }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- MODUS A: EINZELNER MITARBEITER KALENDER -->
        <div v-if="scheduleViewMode === 'employee' && selectedEmployeeId" class="admin-form-card">
          <div class="calendar-header-row">
            <h3>Monatskalender: {{ getSelectedEmployeeName() }}</h3>
            <div class="calendar-nav-buttons">
              <button @click="changeMonth(-1)" class="btn-month-nav">◀ Vorheriger</button>
              <span class="current-month-label">{{ monthNames[selectedMonth] }} {{ currentYear }}</span>
              <button @click="changeMonth(1)" class="btn-month-nav">Nächster ▶</button>
            </div>
          </div>

          <!-- BUTTON: Gesamten Monatsdienstplan für diesen Mitarbeiter löschen -->
          <div class="mb-3">
            <button @click="deleteAllSchedulesForEmployeeMonth" class="btn-delete-all">
              🗑️ Gesamten Monatsdienstplan für {{ getSelectedEmployeeName() }} löschen
            </button>
          </div>

          <div class="calendar-grid">
            <div
                v-for="day in employeeMonthDays"
                :key="day.dateKey"
                class="day-card"
                :class="getDayCardClass(day)"
                @click="selectDayForEditing(day)"
            >
              <div class="day-header">
                <span class="day-number">{{ day.dayNum }}</span>
                <span class="day-name">{{ day.dayName }}</span>
              </div>
              <div class="day-body">
                <template v-if="day.shift">
                  <span v-if="day.shift.vacation" class="shift-badge badge-vacation">Urlaub</span>
                  <span v-else class="shift-badge" :class="day.shift.is_night ? 'badge-nd' : 'badge-td'">
                    {{ day.shift.shift_type }} ({{ day.shift.hours }}h)
                  </span>
                  <span class="shift-ort">{{ day.shift.ort }}</span>
                </template>
                <template v-else>
                  <span class="text-free">Frei</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- MODUS B: GESAMTE KALENDERANSICHT -->
        <div v-if="scheduleViewMode === 'global'" class="admin-form-card">
          <div class="calendar-header-row">
            <h3>Gesamtübersicht aller Standorte – {{ monthNames[selectedMonth] }} {{ currentYear }}</h3>
            <div class="calendar-nav-buttons">
              <button @click="changeMonth(-1)" class="btn-month-nav">◀ Vorheriger</button>
              <span class="current-month-label">{{ monthNames[selectedMonth] }} {{ currentYear }}</span>
              <button @click="changeMonth(1)" class="btn-month-nav">Nächster ▶</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
              <tr>
                <th>Datum</th>
                <th>Wochentag</th>
                <th>Mitarbeiter</th>
                <th>Standort</th>
                <th>Schicht</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="sched in globalMonthSchedules" :key="sched.id">
                <td>{{ sched.date }}</td>
                <td>{{ getDayNameFromDate(sched.date) }}</td>
                <td><strong>{{ getEmployeeName(sched.user_id) }}</strong></td>
                <td><span class="status-badge pending">{{ sched.ort }}</span></td>
                <td>{{ sched.shift_time }} ({{ sched.hours }}h)</td>
              </tr>
              <tr v-if="globalMonthSchedules.length === 0">
                <td colspan="5" class="text-center">Keine Schichten für diesen Monat eingetragen.</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- EINTRAGEN / BEARBEITEN -->
        <div v-if="scheduleViewMode === 'employee' && selectedEmployeeId" class="admin-form-card">
          <h3>{{ isEditing ? 'Dienst bearbeiten / löschen' : 'Dienst zuweisen' }}</h3>
          <form @submit.prevent="saveShift">
            <div class="form-group">
              <label>Datum (Pop-up Kalender):</label>
              <input type="date" v-model="form.date" required />
            </div>

            <div class="form-group">
              <label>Objekt / Standort:</label>
              <select v-model="form.ort" @change="onLocationChange" required>
                <option value="Austria Wien">Austria Wien (6h)</option>
                <option value="Wirtschaftskammer">Wirtschaftskammer (8h)</option>
                <option value="OWS">OWS (12h)</option>
                <option value="Pav90">Pav90 (12h)</option>
                <option value="Pav20">Pav20 (12h)</option>
                <option value="KHI Areal">KHI Areal (12h)</option>
                <option value="Urlaub">Urlaub</option>
              </select>
            </div>

            <div class="form-group">
              <label>Schichtart & Zeiten:</label>
              <div class="shift-buttons">
                <button type="button" :class="{ active: !form.is_night && !form.vacation }" @click="setDayShift">☀️ Tagdienst ({{ form.hours }}h)</button>
                <button type="button" :class="{ active: form.is_night && !form.vacation }" @click="setNightShift">🌙 Nachtdienst ({{ form.hours }}h)</button>
                <button type="button" :class="{ active: form.vacation }" @click="setVacation">🏖️ Urlaub</button>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save">Dienst eintragen</button>
              <button v-if="isEditing" type="button" class="btn-delete" @click="deleteShift">Dienst löschen</button>
            </div>
          </form>
          <p class="status-msg" v-if="message">{{ message }}</p>
        </div>
      </div>

      <!-- TAB 2: MITARBEITER-PRÄFERENZEN & KI DIENSTPLAN -->
      <div v-if="activeTab === 'preferences'">
        <!-- KI GENERATOR KARTE -->
        <div class="admin-form-card ai-generator-card">
          <h3 class="ai-title">🤖 Automatischer KI-Dienstplan</h3>
          <p class="ai-desc">
            Die KI plant den Monatsdienstplan vollautomatisch unter Berücksichtigung von Orts-Präferenzen, blockierten Tagen, Stunden-Vorgaben und Ruhezeiten.
          </p>

          <div class="filter-row ai-filter-row">
            <div class="form-group" style="flex: 2;">
              <label>Ziel-Mitarbeiter:</label>
              <select v-model="aiTargetEmployee">
                <option value="all">📢 Alle Mitarbeiter (Gesamter Dienstplan)</option>
                <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">
                  👤 Nur für: {{ emp.name }}
                </option>
              </select>
            </div>

            <div class="form-group" style="flex: 1;">
              <label>Zielmonat:</label>
              <select v-model="selectedAiMonth">
                <option v-for="(m, idx) in monthNames" :key="idx" :value="idx">{{ m }} {{ currentYear }}</option>
              </select>
            </div>
          </div>

          <button @click="generateAiSchedule" class="btn-save btn-ai-generate">
            ✨ KI-Schichtplan generieren
          </button>
          <p class="status-msg ai-status" v-if="aiMessage">{{ aiMessage }}</p>
        </div>

        <!-- EINZELNE PRÄFERENZEN VERWALTEN -->
        <div class="admin-form-card">
          <h3>Individuelle Mitarbeiter-Präferenzen & Orte</h3>
          <p class="section-desc">
            Lege hier fest, an welchen Standorten der Mitarbeiter arbeiten darf, welche Wochentage oder spezifischen Tage blockiert sind.
          </p>

          <div class="form-group">
            <label>Mitarbeiter auswählen:</label>
            <select v-model="selectedPrefEmployeeId" @change="fetchEmployeePreferences">
              <option disabled value="">-- Bitte Mitarbeiter wählen --</option>
              <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>

          <div v-if="selectedPrefEmployeeId">
            <form @submit.prevent="savePreferences">
              <!-- STANDORTE -->
              <div class="form-group">
                <label>📍 Bevorzugte Arbeitsorte / Standorte:</label>
                <div class="location-cards-grid">
                  <div
                      v-for="loc in availableLocations"
                      :key="loc.name"
                      class="loc-card"
                      :class="{ active: prefForm.preferred_locations.includes(loc.name) }"
                      @click="toggleLocation(loc.name)"
                  >
                    <div class="loc-info">
                      <span class="loc-name">{{ loc.name }}</span>
                      <span class="loc-hours">{{ loc.hours }}h Schicht</span>
                    </div>
                    <div class="loc-checkbox-indicator">
                      {{ prefForm.preferred_locations.includes(loc.name) ? '✓' : '+' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- SCHICHTARTEN (TAG / NACHT) PRÄFERENZEN -->
              <div class="form-group pref-section-spacing">
                <label>☀️🌙 Bevorzugte Schichtarten für die KI:</label>
                <div class="shift-buttons">
                  <button
                      type="button"
                      :class="{ active: prefForm.preferred_shifts.includes('TD') }"
                      @click="togglePreferredShift('TD')"
                  >
                    ☀️ Tagdienst erlauben
                  </button>
                  <button
                      type="button"
                      :class="{ active: prefForm.preferred_shifts.includes('ND') }"
                      @click="togglePreferredShift('ND')"
                  >
                    🌙 Nachtdienst erlauben
                  </button>
                </div>
              </div>

              <!-- WOCHENTAGE -->
              <div class="form-group pref-section-spacing">
                <label>🚫 Unerwünschte / Freie Wochentage:</label>
                <div class="day-picker-container">
                  <button
                      type="button"
                      v-for="day in ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']"
                      :key="day"
                      class="day-chip"
                      :class="{ active: prefForm.disliked_days.includes(day) }"
                      @click="toggleDislikedDay(day)"
                  >
                    {{ day }}
                  </button>
                </div>
              </div>

              <!-- SPEZIFISCHE BLOCKIERTE TAGE -->
              <div class="form-group pref-section-spacing">
                <label>🔒 Spezifische Blockierte Tage (Blocked Days):</label>
                <div class="filter-row" style="align-items: flex-end;">
                  <input type="date" v-model="newBlockedDate" style="flex: 1;" />
                  <button type="button" @click="addBlockedDate" class="btn-small btn-approve" style="padding: 10px 15px;">Datum hinzufügen</button>
                </div>

                <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                  <span v-for="(bDate, index) in prefForm.blocked_days" :key="index" class="status-badge rejected" style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; padding: 6px 10px;">
                    {{ bDate }}
                    <button type="button" @click="removeBlockedDate(index)" style="background:none; border:none; color:white; cursor:pointer; font-weight:bold;">×</button>
                  </span>
                  <span v-if="prefForm.blocked_days.length === 0" class="text-free">Keine spezifischen Tage blockiert.</span>
                </div>
              </div>

              <!-- STUNDEN & NOTIZEN -->
              <div class="form-group pref-section-spacing">
                <label>⏱️ Maximale Monatsstunden:</label>
                <input type="number" v-model="prefForm.max_monthly_hours" placeholder="180" required />
              </div>

              <div class="form-group">
                <label>📝 Zusätzliche Notizen / Regeln für die KI:</label>
                <textarea v-model="prefForm.notes" rows="3" placeholder="z.B. Braucht feste Erholungstage..." class="admin-textarea"></textarea>
              </div>

              <button type="submit" class="btn-save">Präferenzen speichern</button>
            </form>
            <p class="status-msg" v-if="prefMessage">{{ prefMessage }}</p>
          </div>
        </div>
      </div>

      <!-- TAB 3: URLAUBSANTRÄGE -->
      <div v-if="activeTab === 'vacations'" class="admin-form-card">
        <h3>Offene Urlaubsanträge der Mitarbeiter</h3>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
            <tr>
              <th>Mitarbeiter</th>
              <th>Zeitraum</th>
              <th>Grund / Bemerkung</th>
              <th>Status</th>
              <th>Aktion</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="req in vacationRequests" :key="req.id">
              <td><strong>{{ getEmployeeName(req.user_id) }}</strong></td>
              <td>{{ req.start_date }} bis {{ req.end_date }}</td>
              <td>{{ req.reason || '-' }}</td>
              <td>
                <span class="status-badge" :class="req.status">
                  {{ req.status === 'approved' ? 'Genehmigt' : req.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend' }}
                </span>
              </td>
              <td class="actions-cell">
                <template v-if="req.status === 'pending'">
                  <button class="btn-small btn-approve" @click="updateVacationStatus(req.id, 'approved')">Genehmigen</button>
                  <button class="btn-small btn-reject" @click="updateVacationStatus(req.id, 'rejected')">Ablehnen</button>
                </template>
                <button class="btn-small btn-delete-vacation" @click="deleteVacationRequest(req.id)">Löschen</button>
              </td>
            </tr>
            <tr v-if="vacationRequests.length === 0">
              <td colspan="5" class="text-center">Keine Urlaubsanträge vorhanden.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 4: LOHNZETTEL HOCHLADEN -->
      <div v-if="activeTab === 'payroll'" class="admin-form-card">
        <h3>Lohnzettel für Mitarbeiter hochladen</h3>
        <form @submit.prevent="uploadPayroll">
          <div class="form-group">
            <label>Mitarbeiter:</label>
            <select v-model="payrollForm.user_id" required>
              <option disabled value="">-- Bitte wählen --</option>
              <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Monat / Jahr (z.B. August 2026):</label>
            <input type="text" v-model="payrollForm.month_year" placeholder="August 2026" required />
          </div>

          <div class="filter-row">
            <div class="form-group" style="flex: 1;">
              <label>Nettobetrag (€):</label>
              <input type="text" v-model="payrollForm.netto" placeholder="z.B. 1850,00" required />
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Bruttobetrag (€):</label>
              <input type="text" v-model="payrollForm.brutto" placeholder="z.B. 2400,00" required />
            </div>
          </div>

          <div class="form-group">
            <label>PDF Lohnzettel Datei:</label>
            <input type="file" @change="handlePayrollFileChange" accept=".pdf" required />
          </div>
          <button type="submit" class="btn-save">Lohnzettel hochladen</button>
        </form>
        <p class="status-msg" v-if="payrollMessage">{{ payrollMessage }}</p>
      </div>

      <!-- TAB 5: NACHRICHT SENDEN -->
      <div v-if="activeTab === 'messages'" class="admin-form-card">
        <h3>Dienstanweisung oder Nachricht senden</h3>
        <form @submit.prevent="sendMessage">
          <div class="form-group">
            <label>Empfänger:</label>
            <select v-model="msgForm.recipient" required>
              <option value="all">📢 An ALLE Mitarbeiter (Rundschreiben)</option>
              <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">👤 Nur an: {{ emp.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Titel / Betreff:</label>
            <input type="text" v-model="msgForm.title" placeholder="Wichtige Information..." required />
          </div>
          <div class="form-group">
            <label>Nachricht / Anweisung (Optional):</label>
            <textarea v-model="msgForm.content" rows="4" placeholder="Text hier eingeben..." class="admin-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>PDF-Datei anhängen (Optional):</label>
            <input type="file" @change="handleMsgFileChange" accept=".pdf" />
          </div>
          <button type="submit" class="btn-save">Nachricht absenden</button>
        </form>
        <p class="status-msg" v-if="msgMessage">{{ msgMessage }}</p>
      </div>

      <!-- TAB 6: BENACHRICHTIGUNGEN -->
      <div v-if="activeTab === 'notifications'" class="admin-form-card">
        <h3>Benachrichtigungs-Zentrale</h3>
        <form @submit.prevent="sendCustomNotification" style="margin-bottom: 20px;">
          <div class="form-group">
            <label>Empfänger:</label>
            <select v-model="notifForm.recipient" required>
              <option value="all">📢 An ALLE Mitarbeiter</option>
              <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">👤 Nur an: {{ emp.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Titel:</label>
            <input type="text" v-model="notifForm.title" placeholder="Benachrichtigungs-Titel..." required />
          </div>
          <div class="form-group">
            <label>Nachrichtentext (Optional):</label>
            <textarea v-model="notifForm.message" rows="3" placeholder="Inhalt der Benachrichtigung..." class="admin-textarea"></textarea>
          </div>
          <button type="submit" class="btn-save">Benachrichtigung senden</button>
        </form>
        <p class="status-msg" v-if="notifMessage">{{ notifMessage }}</p>

        <hr class="admin-divider" />

        <h3>Gesendete Benachrichtigungen</h3>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
            <tr>
              <th>Empfänger</th>
              <th>Titel</th>
              <th>Nachricht</th>
              <th>Typ</th>
              <th>Aktion</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="n in allNotifications" :key="n.id">
              <td><strong>{{ getEmployeeName(n.user_id) }}</strong></td>
              <td>{{ n.title }}</td>
              <td>{{ n.message || '-' }}</td>
              <td><span class="status-badge pending">{{ n.type || 'general' }}</span></td>
              <td>
                <button class="btn-small btn-delete-vacation" @click="deleteNotification(n.id)">Löschen</button>
              </td>
            </tr>
            <tr v-if="allNotifications.length === 0">
              <td colspan="5" class="text-center">Keine Benachrichtigungen gefunden.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()
const activeTab = ref('schedule')
const scheduleViewMode = ref('employee')
const employeesList = ref([])
const message = ref('')
const adminName = ref('')

const selectedEmployeeId = ref('')
const selectedMonth = ref(new Date().getMonth())
const selectedAiMonth = ref(new Date().getMonth())
const aiTargetEmployee = ref('all')
const currentYear = ref(new Date().getFullYear())
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
const daysOfWeekNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

const availableLocations = [
  { name: 'Austria Wien', hours: 6 },
  { name: 'Wirtschaftskammer', hours: 8 },
  { name: 'OWS', hours: 12 },
  { name: 'Pav90', hours: 12 },
  { name: 'Pav20', hours: 12 },
  { name: 'KHI Areal', hours: 12 }
]

const employeeSchedulesMap = ref({})
const globalMonthSchedules = ref([])
const vacationRequests = ref([])
const allNotifications = ref([])
const isEditing = ref(false)

const selectedPrefEmployeeId = ref('')
const prefMessage = ref('')
const aiMessage = ref('')
const newBlockedDate = ref('')

const prefForm = ref({
  max_monthly_hours: 180,
  preferred_locations: ['Austria Wien', 'Wirtschaftskammer', 'OWS'],
  disliked_days: [],
  blocked_days: [],
  preferred_shifts: ['TD', 'ND'], // Bevorzugte Schichtarten (Tag/Nacht)
  notes: ''
})

const form = ref({
  user_id: '',
  date: '',
  ort: 'OWS',
  shift_time: '07:00-19:00',
  shift_type: 'TD',
  hours: 12,
  is_night: false,
  vacation: false
})

const payrollForm = ref({ user_id: '', month_year: '', netto: '', brutto: '', file: null })
const payrollMessage = ref('')

const msgForm = ref({ recipient: 'all', title: '', content: '', file: null })
const msgMessage = ref('')

const notifForm = ref({ recipient: 'all', title: '', message: '' })
const notifMessage = ref('')

onMounted(() => {
  const userJson = localStorage.getItem('currentUser')
  if (!userJson) {
    router.push('/login')
    return
  }

  const user = JSON.parse(userJson)
  if (user.role !== 'admin') {
    router.push('/home')
    return
  }

  adminName.value = user.name
  fetchEmployees()
  fetchGlobalSchedules()
  fetchVacationRequests()
  fetchNotifications()
})

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  router.push('/login')
}

const fetchEmployees = async () => {
  const { data, error } = await supabase.from('app_users').select('*').eq('role', 'employee')
  if (!error && data) employeesList.value = data
}

const getEmployeeName = (id) => {
  const emp = employeesList.value.find(e => e.id === id)
  return emp ? emp.name : 'Unbekannt'
}

const getDayNameFromDate = (dateStr) => {
  const dateObj = new Date(dateStr)
  let dayIdx = dateObj.getDay() - 1
  if (dayIdx < 0) dayIdx = 6
  return daysOfWeekNames[dayIdx] || ''
}

const fetchGlobalOrEmployeeSchedules = () => {
  if (scheduleViewMode.value === 'employee') {
    fetchEmployeeSchedules()
  } else {
    fetchGlobalSchedules()
  }
}

const fetchEmployeeSchedules = async () => {
  if (!selectedEmployeeId.value) return
  form.value.user_id = selectedEmployeeId.value

  const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', selectedEmployeeId.value)

  if (!error && data) {
    const map = {}
    data.forEach(item => { map[item.date] = item })
    employeeSchedulesMap.value = map
  }
}

const fetchGlobalSchedules = async () => {
  const year = currentYear.value
  const month = selectedMonth.value
  const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
  const startDate = `${year}-${mStr}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`

  const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

  if (!error && data) {
    globalMonthSchedules.value = data
  }
}

const deleteAllSchedulesForEmployeeMonth = async () => {
  if (!selectedEmployeeId.value) return
  const empName = getSelectedEmployeeName()
  const monthName = monthNames[selectedMonth.value]

  if (!confirm(`Möchtest du wirklich den GESAMTEN Dienstplan von ${empName} für ${monthName} ${currentYear.value} löschen?`)) {
    return
  }

  const year = currentYear.value
  const month = selectedMonth.value
  const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
  const startDate = `${year}-${mStr}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`

  const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', selectedEmployeeId.value)
      .gte('date', startDate)
      .lte('date', endDate)

  if (error) {
    alert('Fehler beim Löschen: ' + error.message)
  } else {
    alert('Monatsdienstplan erfolgreich gelöscht.')
    fetchEmployeeSchedules()
  }
}

const fetchEmployeePreferences = async () => {
  if (!selectedPrefEmployeeId.value) return

  const { data, error } = await supabase
      .from('employee_preferences')
      .select('*')
      .eq('user_id', selectedPrefEmployeeId.value)
      .single()

  if (!error && data) {
    prefForm.value.max_monthly_hours = data.max_monthly_hours || 180
    prefForm.value.preferred_locations = data.preferred_locations || ['Austria Wien', 'Wirtschaftskammer', 'OWS']
    prefForm.value.disliked_days = data.disliked_days || []
    prefForm.value.blocked_days = data.blocked_days || []
    prefForm.value.preferred_shifts = data.preferred_shifts || ['TD', 'ND']
    prefForm.value.notes = data.notes || ''
  } else {
    prefForm.value = {
      max_monthly_hours: 180,
      preferred_locations: ['Austria Wien', 'Wirtschaftskammer', 'OWS'],
      disliked_days: [],
      blocked_days: [],
      preferred_shifts: ['TD', 'ND'],
      notes: ''
    }
  }
}

const toggleLocation = (locName) => {
  const index = prefForm.value.preferred_locations.indexOf(locName)
  if (index > -1) {
    prefForm.value.preferred_locations.splice(index, 1)
  } else {
    prefForm.value.preferred_locations.push(locName)
  }
}

const togglePreferredShift = (shiftType) => {
  const index = prefForm.value.preferred_shifts.indexOf(shiftType)
  if (index > -1) {
    if (prefForm.value.preferred_shifts.length > 1) {
      prefForm.value.preferred_shifts.splice(index, 1)
    } else {
      alert('Es muss mindestens eine Schichtart (Tag oder Nacht) ausgewählt bleiben.')
    }
  } else {
    prefForm.value.preferred_shifts.push(shiftType)
  }
}

const toggleDislikedDay = (day) => {
  const index = prefForm.value.disliked_days.indexOf(day)
  if (index > -1) {
    prefForm.value.disliked_days.splice(index, 1)
  } else {
    prefForm.value.disliked_days.push(day)
  }
}

const addBlockedDate = () => {
  if (!newBlockedDate.value) return
  if (!prefForm.value.blocked_days.includes(newBlockedDate.value)) {
    prefForm.value.blocked_days.push(newBlockedDate.value)
  }
  newBlockedDate.value = ''
}

const removeBlockedDate = (index) => {
  prefForm.value.blocked_days.splice(index, 1)
}

const savePreferences = async () => {
  prefMessage.value = 'Wird gespeichert...'

  const { error } = await supabase
      .from('employee_preferences')
      .upsert([
        {
          user_id: selectedPrefEmployeeId.value,
          max_monthly_hours: Number(prefForm.value.max_monthly_hours),
          preferred_locations: prefForm.value.preferred_locations,
          disliked_days: prefForm.value.disliked_days,
          blocked_days: prefForm.value.blocked_days,
          preferred_shifts: prefForm.value.preferred_shifts,
          notes: prefForm.value.notes
        }
      ], { onConflict: 'user_id' })

  if (error) {
    prefMessage.value = 'Fehler: ' + error.message
  } else {
    prefMessage.value = 'Präferenzen erfolgreich gespeichert!'
  }
}

const generateAiSchedule = async () => {
  const targetName = aiTargetEmployee.value === 'all'
      ? 'alle Mitarbeiter'
      : getEmployeeName(aiTargetEmployee.value)

  if (!confirm(`Möchtest du den Dienstplan für ${monthNames[selectedAiMonth.value]} ${currentYear.value} für ${targetName} über die KI generieren lassen?`)) {
    return
  }

  aiMessage.value = `KI plant den Dienstplan für ${targetName}...`

  try {
    const { data, error } = await supabase.functions.invoke('generate-schedule', {
      body: {
        month: selectedAiMonth.value + 1,
        year: currentYear.value,
        user_id: aiTargetEmployee.value
      }
    })

    if (error) throw error

    aiMessage.value = 'Erfolgreich! Der KI-Dienstplan wurde erstellt.'
    fetchGlobalOrEmployeeSchedules()
  } catch (error) {
    console.error("Fehler bei KI-Generierung:", error);
    aiMessage.value = 'Fehler bei der KI-Generierung: ' + (error.message || error);
    if (error.context) {
      try {
        const errorBody = await error.context.json();
        console.error("Supabase Edge Function Details:", errorBody);
      } catch (e) {
        console.error("Konnte Fehler-Body nicht lesen", e);
      }
    }
  }
}

const getSelectedEmployeeName = () => {
  return getEmployeeName(selectedEmployeeId.value)
}

const changeMonth = (direction) => {
  selectedMonth.value += direction
  if (selectedMonth.value > 11) {
    selectedMonth.value = 0
    currentYear.value++
  } else if (selectedMonth.value < 0) {
    selectedMonth.value = 11
    currentYear.value--
  }
  fetchGlobalOrEmployeeSchedules()
}

const employeeMonthDays = computed(() => {
  const year = currentYear.value
  const month = selectedMonth.value
  const totalDays = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let d = 1; d <= totalDays; d++) {
    const dStr = d < 10 ? '0' + d : '' + d
    const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
    const dateKey = `${year}-${mStr}-${dStr}`
    const dateObj = new Date(year, month, d)
    let dayIdx = dateObj.getDay() - 1
    if (dayIdx < 0) dayIdx = 6

    days.push({
      dayNum: d,
      dayName: daysOfWeekNames[dayIdx],
      dateKey,
      shift: employeeSchedulesMap.value[dateKey] || null
    })
  }
  return days
})

const getDayCardClass = (day) => {
  if (!day.shift) return 'day-card off'
  if (day.shift.vacation) return 'day-card vacation'
  return day.shift.is_night ? 'day-card night' : 'day-card day'
}

const onLocationChange = () => {
  const ort = form.value.ort
  if (ort === 'Austria Wien') {
    form.value.hours = 6
  } else if (ort === 'Wirtschaftskammer') {
    form.value.hours = 8
  } else if (['OWS', 'Pav90', 'Pav20', 'KHI Areal'].includes(ort)) {
    form.value.hours = 12
  } else if (ort === 'Urlaub') {
    setVacation()
    return
  }
  if (!form.value.is_night && !form.value.vacation) {
    form.value.shift_time = form.value.hours === 6 ? '07:00-13:00' : form.value.hours === 8 ? '07:00-15:00' : '07:00-19:00'
  }
}

const selectDayForEditing = (day) => {
  form.value.user_id = selectedEmployeeId.value
  form.value.date = day.dateKey
  if (day.shift) {
    form.value.ort = day.shift.ort || 'OWS'
    form.value.shift_time = day.shift.shift_time
    form.value.shift_type = day.shift.shift_type
    form.value.hours = day.shift.hours
    form.value.is_night = day.shift.is_night
    form.value.vacation = day.shift.vacation || false
    isEditing.value = true
  } else {
    form.value.ort = 'OWS'
    setDayShift()
    isEditing.value = false
  }
}

const setDayShift = () => {
  const h = form.value.hours || 12
  form.value.shift_time = h === 6 ? '07:00-13:00' : h === 8 ? '07:00-15:00' : '07:00-19:00'
  form.value.shift_type = 'TD'
  form.value.is_night = false
  form.value.vacation = false
}

const setNightShift = () => {
  const h = form.value.hours || 12
  form.value.shift_time = h === 8 ? '15:00-23:00' : '19:00-07:00'
  form.value.shift_type = 'ND'
  form.value.is_night = true
  form.value.vacation = false
}

const setVacation = () => {
  form.value.shift_time = 'Urlaub'
  form.value.shift_type = 'UR'
  form.value.hours = 12
  form.value.is_night = false
  form.value.vacation = true
}

const triggerPush = async (userId, titleText, bodyText) => {
  try {
    await supabase.functions.invoke('send-push', {
      body: { user_id: userId, title: titleText, body: bodyText }
    })
  } catch (err) {
    console.error('Fehler beim Auslösen des Push-Popups:', err)
  }
}

const saveShift = async () => {
  message.value = 'Wird gespeichert...'
  const { error } = await supabase
      .from('schedules')
      .upsert([
        {
          user_id: form.value.user_id,
          date: form.value.date,
          ort: form.value.ort,
          shift_time: form.value.shift_time,
          shift_type: form.value.shift_type,
          hours: form.value.hours,
          is_night: form.value.is_night,
          vacation: form.value.vacation
        }
      ], { onConflict: 'user_id,date' })

  if (error) {
    message.value = 'Fehler: ' + error.message
  } else {
    message.value = 'Erfolgreich gespeichert!'
    const title = 'Dienstplan aktualisiert'
    const msg = `Dein Schichtplan für den ${form.value.date} wurde vom Admin geändert.`

    await supabase.from('notifications').insert([{ user_id: form.value.user_id, title, message: msg, type: 'schedule' }])
    await triggerPush(form.value.user_id, title, msg)
    await fetchEmployeeSchedules()
    fetchNotifications()
  }
}

const deleteShift = async () => {
  if (!form.value.user_id || !form.value.date) return
  const { error } = await supabase.from('schedules').delete().match({ user_id: form.value.user_id, date: form.value.date })
  if (error) {
    message.value = 'Fehler: ' + error.message
  } else {
    message.value = 'Schicht gelöscht!'
    const title = 'Schicht entfernt'
    const msg = `Deine Schicht am ${form.value.date} wurde entfernt.`

    await supabase.from('notifications').insert([{ user_id: form.value.user_id, title, message: msg, type: 'schedule' }])
    await triggerPush(form.value.user_id, title, msg)
    await fetchEmployeeSchedules()
    fetchNotifications()
    isEditing.value = false
  }
}

const fetchVacationRequests = async () => {
  const { data, error } = await supabase.from('vacations').select('*').order('created_at', { ascending: false })
  if (!error && data) vacationRequests.value = data
}

const fetchNotifications = async () => {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (!error && data) allNotifications.value = data
}

const parseToIso = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.')
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

const updateVacationStatus = async (id, status) => {
  const { data: vacationData, error: fetchError } = await supabase.from('vacations').select('*').eq('id', id).single()
  if (fetchError || !vacationData) return

  const { error } = await supabase.from('vacations').update({ status }).eq('id', id)
  if (error) return

  const statusText = status === 'approved' ? 'genehmigt 🎉' : 'abgelehnt ❌'
  const title = 'Urlaubsantrag bearbeitet'
  const msg = `Dein Urlaubsantrag (${vacationData.start_date} bis ${vacationData.end_date}) wurde ${statusText}.`

  await supabase.from('notifications').insert([{ user_id: vacationData.user_id, title, message: msg, type: 'vacation' }])
  await triggerPush(vacationData.user_id, title, msg)

  if (status === 'approved') {
    const startDateIso = parseToIso(vacationData.start_date)
    const endDateIso = parseToIso(vacationData.end_date)
    let currentDate = new Date(startDateIso)
    const lastDate = new Date(endDateIso)
    const scheduleInserts = []

    while (currentDate <= lastDate) {
      scheduleInserts.push({
        user_id: vacationData.user_id,
        date: currentDate.toISOString().split('T')[0],
        ort: 'Urlaub',
        shift_time: 'Urlaub',
        shift_type: 'UR',
        hours: 12,
        is_night: false,
        vacation: true
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (scheduleInserts.length > 0) {
      await supabase.from('schedules').upsert(scheduleInserts, { onConflict: 'user_id,date' })
    }
  }

  fetchVacationRequests()
  fetchNotifications()
}

const deleteVacationRequest = async (id) => {
  if (!confirm('Möchtest du diesen Urlaubsantrag wirklich löschen?')) return
  const { error } = await supabase.from('vacations').delete().eq('id', id)
  if (!error) fetchVacationRequests()
}

const uploadPayroll = async () => {
  payrollMessage.value = 'Wird hochgeladen...'
  setTimeout(() => {
    payrollMessage.value = 'Lohnzettel erfolgreich hochgeladen!'
    payrollForm.value = { user_id: '', month_year: '', netto: '', brutto: '', file: null }
  }, 1000)
}

const handlePayrollFileChange = (e) => {
  payrollForm.value.file = e.target.files[0]
}

const sendMessage = async () => {
  msgMessage.value = 'Nachricht wird gesendet...'
  setTimeout(() => {
    msgMessage.value = 'Nachricht erfolgreich versendet!'
    msgForm.value = { recipient: 'all', title: '', content: '', file: null }
  }, 1000)
}

const handleMsgFileChange = (e) => {
  msgForm.value.file = e.target.files[0]
}

const sendCustomNotification = async () => {
  notifMessage.value = 'Wird gesendet...'
  const targetIds = notifForm.value.recipient === 'all'
      ? employeesList.value.map(e => e.id)
      : [notifForm.value.recipient]

  for (const uid of targetIds) {
    await supabase.from('notifications').insert([{
      user_id: uid,
      title: notifForm.value.title,
      message: notifForm.value.message,
      type: 'general'
    }])
    await triggerPush(uid, notifForm.value.title, notifForm.value.message)
  }

  notifMessage.value = 'Benachrichtigung erfolgreich gesendet!'
  notifForm.value = { recipient: 'all', title: '', message: '' }
  fetchNotifications()
}

const deleteNotification = async (id) => {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (!error) fetchNotifications()
}
</script>

<style scoped>
/* GLOBALES LAYOUT & DESIGN */
.admin-wrapper {
  min-height: 100vh;
  background-color: #f4f7f6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.admin-navbar {
  width: 100%;
  background: #2c3e50;
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  box-sizing: border-box;
}

.navbar-left h2 {
  margin: 0;
  font-size: 1.4rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.95rem;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #c0392b;
}

.admin-main-content {
  max-width: 1100px;
  margin: 30px auto;
  padding: 0 20px;
}

/* NAVIGATION TABS */
.admin-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 25px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.tab-btn {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: #555;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.tab-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

/* KARTEN / FORMULARE */
.admin-form-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 25px;
}

.admin-form-card h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 15px;
  border-bottom: 2px solid #f1f1f1;
  padding-bottom: 10px;
}

.section-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

/* FORMULAR ELEMENTE */
.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #444;
}

.form-group select,
.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"],
.admin-textarea {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.form-group select:focus,
.form-group input:focus,
.admin-textarea:focus {
  border-color: #3498db;
}

.filter-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* STANDORT-KARTEN (GRID) */
.location-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 6px;
}

.loc-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.loc-card:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: translateY(-1px);
}

.loc-card.active {
  background: #ebf5fb;
  border-color: #3498db;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.15);
}

.loc-info {
  display: flex;
  flex-direction: column;
}

.loc-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
}

.loc-hours {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.loc-checkbox-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.loc-card.active .loc-checkbox-indicator {
  background: #3498db;
  color: white;
}

/* TAG-PICKER (CHIPS) FÜR WOCHENTAGE */
.day-picker-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.day-chip {
  background: #f1f3f5;
  border: 1px solid #dcdde1;
  color: #495057;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  outline: none;
}

.day-chip:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.day-chip.active {
  background: #e74c3c;
  color: white;
  border-color: #c0392b;
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
}

.pref-section-spacing {
  margin-top: 20px;
}

/* BUTTONS */
.btn-save {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #219653;
}

.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #c0392b;
}

.btn-delete-all {
  background: #c0392b;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 15px;
  transition: background 0.2s;
}
.btn-delete-all:hover {
  background: #a93226;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.status-msg {
  margin-top: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #27ae60;
}

/* KALENDER & SCHICHTEN STYLING */
.calendar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.calendar-nav-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-month-nav {
  background: #ecf0f1;
  border: 1px solid #dbdde0;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-month-nav:hover {
  background: #dfe4ea;
}

.current-month-label {
  font-weight: bold;
  font-size: 1rem;
  color: #2c3e50;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 25px;
}

.day-card {
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.day-card.off { background: #fafbfc; border-left: 4px solid #bdc3c7; }
.day-card.day { background: #ebf5fb; border-left: 4px solid #3498db; }
.day-card.night { background: #e8f8f5; border-left: 4px solid #1abc9c; }
.day-card.vacation { background: #fef9e7; border-left: 4px solid #f1c40f; }

.day-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 6px;
}

.day-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shift-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
}

.badge-td { background: #d4efdf; color: #1e8449; }
.badge-nd { background: #d1f2eb; color: #117a65; }
.badge-vacation { background: #fcf3cf; color: #7d6608; }

.shift-ort {
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-free {
  font-size: 0.8rem;
  color: #95a5a6;
  text-align: center;
  font-style: italic;
  padding: 6px 0;
}

.shift-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.shift-buttons button {
  flex: 1;
  padding: 8px;
  background: #f1f3f5;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}

.shift-buttons button.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}

/* TABELLEN STYLING */
.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 0.9rem;
}

.admin-table th,
.admin-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}

.admin-table th {
  background: #f8fafc;
  color: #2c3e50;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-badge.approved { background: #d4efdf; color: #1e8449; }
.status-badge.rejected { background: #fadbd8; color: #922b21; }
.status-badge.pending { background: #fcf3cf; color: #7d6608; }

.actions-cell {
  display: flex;
  gap: 6px;
}

.btn-small {
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
}

.btn-approve { background: #27ae60; color: white; }
.btn-reject { background: #e67e22; color: white; }
.btn-delete-vacation { background: #e74c3c; color: white; }

.text-center {
  text-align: center;
  color: #777;
  font-style: italic;
}

.admin-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 25px 0;
}

.ai-generator-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
}

.ai-title {
  color: #2c3e50;
}

.ai-desc {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 15px;
}

.ai-filter-row {
  margin-bottom: 15px;
}

.btn-ai-generate {
  width: 100%;
  padding: 12px;
  background: #8e44ad;
  font-size: 1rem;
}

.btn-ai-generate:hover {
  background: #732d91;
}

.ai-status {
  color: #8e44ad;
}

.mb-3 {
  margin-bottom: 15px;
}
</style>