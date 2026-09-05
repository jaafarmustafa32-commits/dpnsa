<template>
  <!-- Header -->
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/profile" class="user-info user-info-link">
        <div class="avatar-icon">
          <i class="fa-solid fa-user-gear"></i>
        </div>
        <div class="user-details">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">Mitarbeiter Portal</span>
        </div>
      </router-link>

      <div class="header-actions">
        <!-- BENACHRICHTIGUNGS-GLOCKE (Unverändert im Light Mode) -->
        <div class="notifications-wrapper" ref="notifDropdownRef">
          <button @click="toggleNotifications" class="btn-notification-bell" :class="{ 'has-unread': unreadNotifications.length > 0 }" aria-label="Benachrichtigungen">
            <i class="fa-solid fa-bell"></i>
            <span v-if="unreadNotifications.length > 0" class="badge-count">
              {{ unreadNotifications.length }}
            </span>
          </button>

          <!-- DROPDOWN FÜR BENACHRICHTIGUNGEN -->
          <div v-if="showNotificationsDropdown" class="notifications-dropdown">
            <div class="dropdown-header">
              <h4>Benachrichtigungen</h4>
              <button v-if="unreadNotifications.length > 0" @click="markAllAsRead" class="btn-text-action">
                Alle gelesen
              </button>
            </div>

            <div class="dropdown-body">
              <div v-if="notifications.length === 0" class="no-notifications">
                Keine Benachrichtigungen vorhanden.
              </div>
              <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="notification-item"
                  :class="{ unread: !notif.is_read }"
                  @click="markAsRead(notif.id)"
              >
                <div class="notif-title">{{ notif.title }}</div>
                <div class="notif-msg">{{ notif.message }}</div>
                <div class="notif-time">{{ formatDate(notif.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <button class="menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Menü öffnen">
          <i class="fa-solid" :class="isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
        </button>
      </div>

      <nav class="nav-buttons" :class="{ show: isMobileMenuOpen }">
        <router-link to="/home" class="btn-nav active" @click="closeMobileMenu">
          <i class="fa-solid fa-calendar-days"></i> Home
        </router-link>
        <router-link to="/antraege" class="btn-nav" @click="closeMobileMenu">
          <i class="fa-solid fa-file-pen"></i> Anträge
        </router-link>
        <router-link to="/anweisungen" class="btn-nav" @click="closeMobileMenu">
          <i class="fa-solid fa-file-pdf"></i> Anweisungen
        </router-link>
        <router-link to="/gehalt" class="btn-nav" @click="closeMobileMenu">
          <i class="fa-solid fa-file-invoice-dollar"></i> Gehalt
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

  <!-- Main Content -->
  <main class="app-main">
    <!-- Übersichtskarten -->
    <section class="hours-overview">
      <div class="hours-card">
        <div class="card-icon blue"><i class="fa-solid fa-clock"></i></div>
        <div class="hours-info">
          <span>Ist-Std.</span>
          <strong>{{ currentMonthHours }}</strong>
        </div>
      </div>
      <div class="hours-card">
        <div class="card-icon green"><i class="fa-solid fa-business-time"></i></div>
        <div class="hours-info">
          <span>Soll-Std.</span>
          <strong>160</strong>
        </div>
      </div>
      <div class="hours-card">
        <div class="card-icon orange"><i class="fa-solid fa-umbrella-beach"></i></div>
        <div class="hours-info">
          <span>Urlaub</span>
          <strong>14 <small>T.</small></strong>
        </div>
      </div>
    </section>

    <!-- Steuerung -->
    <section class="calendar-controls">
      <div class="month-nav">
        <i class="fa-solid fa-circle-chevron-left nav-arrow" @click="changeMonth(-1)"></i>
        <div class="month-title">
          {{ monthNames[currentMonth] }} <span>{{ currentYear }}</span>
        </div>
        <i class="fa-solid fa-circle-chevron-right nav-arrow" @click="changeMonth(1)"></i>
      </div>

      <div class="view-switch">
        <button class="btn-switch" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
          <i class="fa-solid fa-border-all"></i> Detail
        </button>
        <button class="btn-switch desktop-only" :class="{ active: viewMode === 'landscape' }" @click="viewMode = 'landscape'">
          <i class="fa-solid fa-table-cells-large"></i> Querformat (PC)
        </button>
        <button class="btn-switch" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
          <i class="fa-solid fa-list"></i> Liste
        </button>
        <button class="btn-switch" @click="toggleLightMode" title="Helligkeit umschalten">
          <i class="fa-solid" :class="isLightMode ? 'fa-moon' : 'fa-sun'"></i>
        </button>
      </div>
    </section>

    <!-- GRID / LISTE ANSICHT -->
    <template v-if="viewMode === 'grid' || viewMode === 'list'">
      <div :class="viewMode === 'list' ? 'calendar-container-list-narrow' : 'calendar-container-narrow'">
        <div class="calendar-grid" :class="{ 'list-view': viewMode === 'list' }">
          <div
              v-for="day in calendarDays"
              :key="day.dateKey"
              class="day-card"
              :class="day.cardClass"
              @click="openDetails(day.dateKey)"
          >
            <div class="day-header">
              <span class="day-number">{{ day.dayNum }}</span>
              <span class="day-name">{{ day.dayName }}</span>
            </div>

            <div class="day-body">
              <template v-if="day.shift && day.shift.vacation">
                <span class="shift-badge badge-vacation">Urlaub</span>
              </template>

              <template v-else-if="day.shift && day.shift.sick">
                <span class="shift-badge badge-sick">Krank</span>
              </template>

              <template v-else-if="day.shift && !day.shift.vacation && !day.shift.sick">
                <div class="shift-top-row">
                  <span class="shift-badge" :class="day.shift.class">{{ day.shift.badge }}</span>
                  <span v-if="day.shift.ort && day.shift.ort !== '-'" class="shift-ort-badge">
                    {{ day.shift.ort }}
                  </span>
                </div>
                <div class="shift-details">
                  <span class="shift-time-badge" :class="day.shift.isNight ? 'time-night' : 'time-day'">
                    <i class="fa-regular fa-clock"></i> {{ day.shift.time }}
                  </span>
                </div>
              </template>

              <template v-else>
                <span class="shift-badge badge-off">Frei</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- QUERFORMAT TABELLEN-ANSICHT (KOMPAKT - NUR PC) -->
    <template v-else-if="viewMode === 'landscape'">
      <div class="landscape-fullscreen-container desktop-only-block">
        <table class="landscape-table">
          <thead>
          <tr class="row-dates">
            <th v-for="day in calendarDays" :key="'num-' + day.dateKey" :class="{ weekend: day.isWeekend }">
              {{ day.dayNum }}
            </th>
          </tr>
          <tr class="row-weekdays">
            <th v-for="day in calendarDays" :key="'name-' + day.dateKey" :class="{ weekend: day.isWeekend }">
              {{ day.dayName }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr class="row-shifts">
            <td
                v-for="day in calendarDays"
                :key="'shift-' + day.dateKey"
                :class="[
                  day.isWeekend ? 'weekend' : '',
                  day.shift ? (day.shift.vacation ? 'cell-vacation' : (day.shift.sick ? 'cell-sick' : (day.shift.isNight ? 'cell-night' : 'cell-day'))) : 'is-off',
                  day.dateKey === todayDateKey ? 'cell-today-highlight' : ''
                ]"
                @click="openDetails(day.dateKey)"
            >
              <template v-if="day.shift && day.shift.vacation">
                <span class="shift-badge badge-vacation landscape-badge">URL</span>
              </template>
              <template v-else-if="day.shift && day.shift.sick">
                <span class="shift-badge badge-sick landscape-badge">KRK</span>
              </template>
              <template v-else-if="day.shift && !day.shift.vacation && !day.shift.sick">
                <span class="shift-badge landscape-badge" :class="day.shift.class">{{ day.shift.badge }}</span>
              </template>
              <template v-else>
                <span class="off-text-landscape">Frei</span>
              </template>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>
  </main>

  <!-- Modal Pop-up -->
  <div v-if="selectedDay" class="modal-overlay" @click.self="closeDetails">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>{{ selectedDay.dayNum }}. {{ monthNames[currentMonth] }} {{ currentYear }}</h3>
          <span class="modal-subtitle">{{ selectedDay.dayName }}tag</span>
        </div>
        <button class="btn-close" @click="closeDetails" aria-label="Schließen"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="modal-body">
        <template v-if="selectedDay.shift && selectedDay.shift.vacation">
          <div class="status-info orange">
            <i class="fa-solid fa-umbrella-beach"></i>
            <span>Erholungsurlaub eingetragen.</span>
          </div>
        </template>

        <template v-else-if="selectedDay.shift && selectedDay.shift.sick">
          <div class="status-info red">
            <i class="fa-solid fa-user-injured"></i>
            <span>Krank / Abwesend gemeldet.</span>
          </div>
        </template>

        <template v-else-if="selectedDay.shift && !selectedDay.shift.vacation && !selectedDay.shift.sick">
          <div class="detail-row">
            <span class="label">Kürzel:</span>
            <span class="shift-badge" :class="selectedDay.shift.class">{{ selectedDay.shift.badge }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Einsatzort:</span>
            <strong>{{ selectedDay.shift.title }}</strong>
          </div>
          <div class="detail-row" v-if="selectedDay.shift.ort && selectedDay.shift.ort !== '-'">
            <span class="label">Ort / Pavillon:</span>
            <span style="color: #2196F3; font-weight: 600;">{{ selectedDay.shift.ort }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Dienstzeit:</span>
            <span><i class="fa-regular fa-clock"></i> {{ selectedDay.shift.time }} ({{ selectedDay.shift.hours }} Std.)</span>
          </div>

          <div class="instruction-box">
            <h4><i class="fa-solid fa-circle-info"></i> Dienstanweisung</h4>
            <p>{{ selectedDay.shift.instruction || 'Keine speziellen Anweisungen hinterlegt.' }}</p>
          </div>
        </template>

        <template v-else>
          <div class="status-info green">
            <i class="fa-solid fa-bed"></i>
            <span>Dienstfreier Tag. Keine Schicht eingeteilt.</span>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" @click="closeDetails">Schließen</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()
const isMobileMenuOpen = ref(false)
const viewMode = ref('grid')
const selectedDay = ref(null)
const isMobile = ref(false)
const isLightMode = ref(false)

const userName = ref('Mitarbeiter')
const currentUserId = ref(null)

const notifications = ref([])
const unreadNotifications = ref([])
const showNotificationsDropdown = ref(false)
const notifDropdownRef = ref(null)

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
const daysOfWeekNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

const shiftData = ref({})

const todayDateKey = computed(() => {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const fetchSchedulesFromSupabase = async () => {
  if (!currentUserId.value) return

  try {
    const map = {}
    const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', currentUserId.value)

    if (!scheduleError && scheduleData) {
      scheduleData.forEach(item => {
        const isNight = item.is_night || false
        const isSick = item.status === 'sick' || item.sick || false
        map[item.date] = {
          time: item.shift_time || (isNight ? '19:00-07:00' : '07:00-19:00'),
          title: item.ort ? item.ort : 'Dienst',
          ort: item.ort || '-',
          badge: isSick ? 'KRK' : (item.shift_type || (isNight ? 'ND' : 'TD')),
          class: isSick ? 'badge-sick' : (isNight ? 'badge-nd' : 'badge-td'),
          isNight: isNight,
          sick: isSick,
          hours: Number(item.hours) || 0,
          vacation: item.vacation || false,
          instruction: item.instruction || ''
        }
      })
    }

    const { data: vacationData, error: vacationError } = await supabase
        .from('vacations')
        .select('*')
        .eq('user_id', currentUserId.value)
        .eq('status', 'approved')

    if (!vacationError && vacationData) {
      vacationData.forEach(vac => {
        const start = new Date(vac.start_date)
        const end = new Date(vac.end_date)

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const dayStr = String(d.getDate()).padStart(2, '0')
          const dateKey = `${y}-${m}-${dayStr}`

          map[dateKey] = {
            time: 'Ganztägig',
            title: 'Erholungsurlaub',
            ort: 'Urlaub',
            badge: 'Urlaub',
            class: 'badge-vacation',
            isNight: false,
            sick: false,
            hours: 0,
            vacation: true,
            instruction: vac.reason ? `Grund: ${vac.reason}` : 'Erholungsurlaub genehmigt.'
          }
        }
      })
    }

    shiftData.value = map
  } catch (err) {
    console.error('Unerwarteter Fehler:', err)
  }
}

const fetchNotifications = async () => {
  if (!currentUserId.value) return

  const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUserId.value)
      .order('created_at', { ascending: false })

  if (!error && data) {
    notifications.value = data
    unreadNotifications.value = data.filter(n => !n.is_read)
  }
}

const toggleNotifications = () => {
  showNotificationsDropdown.value = !showNotificationsDropdown.value
}

const markAsRead = async (id) => {
  const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

  if (!error) {
    notifications.value = notifications.value.map(n => n.id === id ? { ...n, is_read: true } : n)
    unreadNotifications.value = unreadNotifications.value.filter(n => n.id !== id)
  }
}

const markAllAsRead = async () => {
  const unreadIds = unreadNotifications.value.map(n => n.id)
  if (unreadIds.length === 0) return

  const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

  if (!error) {
    notifications.value = notifications.value.map(n => ({ ...n, is_read: true }))
    unreadNotifications.value = []
  }
}

const handleClickOutside = (event) => {
  if (notifDropdownRef.value && !notifDropdownRef.value.contains(event.target)) {
    showNotificationsDropdown.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const toggleLightMode = () => {
  isLightMode.value = !isLightMode.value
  if (isLightMode.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value && viewMode.value === 'landscape') {
    viewMode.value = 'grid'
  }
}

onMounted(async () => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  document.addEventListener('click', handleClickOutside)

  const userJson = localStorage.getItem('currentUser')
  if (userJson) {
    const user = JSON.parse(userJson)
    userName.value = user.name || user.username || 'Mitarbeiter'
    currentUserId.value = user.id
  } else {
    router.push('/')
    return
  }

  await fetchSchedulesFromSupabase()
  await fetchNotifications()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  document.removeEventListener('click', handleClickOutside)
})

const changeMonth = async (delta) => {
  currentMonth.value += delta
  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  } else if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  }
  await fetchSchedulesFromSupabase()
}

const openDetails = (dateKey) => {
  selectedDay.value = calendarDays.value.find(d => d.dateKey === dateKey)
}

const closeDetails = () => {
  selectedDay.value = null
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayStr = day < 10 ? '0' + day : '' + day
    const monthStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
    const dateKey = `${year}-${monthStr}-${dayStr}`
    const dateObj = new Date(year, month, day)

    let dayIndex = dateObj.getDay() - 1
    if (dayIndex < 0) dayIndex = 6
    const dayName = daysOfWeekNames[dayIndex]
    const isWeekend = dayIndex === 5 || dayIndex === 6

    const shift = shiftData.value[dateKey]

    let cardClass = "day-card"
    if (shift) {
      if (shift.vacation) cardClass += " vacation-card"
      else if (shift.sick) cardClass += " sick-card"
      else if (shift.isNight) cardClass += " night-shift-card"
      else cardClass += " day-shift-card"
    } else {
      cardClass += " off-day"
    }

    if (dateKey === todayDateKey.value) {
      cardClass += " today-highlight"
    }

    days.push({ dayNum: day, dayName, dateKey, shift, cardClass, isWeekend })
  }
  return days
})

const currentMonthHours = computed(() => {
  return calendarDays.value.reduce((total, day) => {
    return total + (day.shift && !day.shift.vacation && !day.shift.sick ? (Number(day.shift.hours) || 0) : 0)
  }, 0)
})

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  router.push('/')
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

:global(body) {
  margin: 0;
  padding: 0;
  background: #0b0f19;
  color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* ==========================================
   LIGHT THEME (Modern Enterprise Stil)
   ========================================== */
:global(body.light-theme) {
  background: #F5F7FA !important;
  color: #0F172A !important;
}

:global(body.light-theme) .app-main {
  color: #0F172A !important;
}

/* Kalenderkarten im Light Mode */
:global(body.light-theme) .day-card {
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06) !important;
}

/* Schicht-spezifische Kartenhintergründe & Borders im Light Mode */
:global(body.light-theme) .day-card.day-shift-card {
  background: #E0F2FE !important;
  border-color: #2196F3 !important;
}

:global(body.light-theme) .day-card.night-shift-card {
  background: #F3E8FF !important;
  border-color: #8B5CF6 !important;
}

:global(body.light-theme) .day-card.vacation-card {
  background: #FEF3C7 !important;
  border-color: #F59E0B !important;
}

:global(body.light-theme) .day-card.sick-card {
  background: #FEE2E2 !important;
  border-color: #EF4444 !important;
}

:global(body.light-theme) .day-card.off-day {
  background: #DCFCE7 !important;
  border-color: #10B981 !important;
}

/* Texte & Lesbarkeit im Light Mode - Datum fix auf dunkel gesetzt */
:global(body.light-theme) .day-number {
  color: #0c0c0c !important;
  font-weight: 700 !important;
}

:global(body.light-theme) .day-name {
  color: #475569 !important;
  font-weight: 600 !important;
}

:global(body.light-theme) .shift-ort-badge {
  background: rgba(33, 150, 243, 0.15) !important;
  color: #075985 !important;
  border-color: #2196F3 !important;
}

:global(body.light-theme) .badge-td {
  background: #E0F2FE !important;
  color: #075985 !important;
  border: 1px solid #2196F3 !important;
}

:global(body.light-theme) .badge-nd {
  background: #F3E8FF !important;
  color: #6B21A8 !important;
  border: 1px solid #8B5CF6 !important;
}

:global(body.light-theme) .badge-vacation {
  background: #FEF3C7 !important;
  color: #92400E !important;
  border: 1px solid #F59E0B !important;
}

:global(body.light-theme) .badge-sick {
  background: #FEE2E2 !important;
  color: #991B1B !important;
  border: 1px solid #EF4444 !important;
}

:global(body.light-theme) .badge-off {
  background: #DCFCE7 !important;
  color: #166534 !important;
  border: 1px solid #10B981 !important;
}

:global(body.light-theme) .time-day {
  background: #E0F2FE !important;
  color: #075985 !important;
  border: 1px solid #2196F3 !important;
}

:global(body.light-theme) .time-night {
  background: #F3E8FF !important;
  color: #6B21A8 !important;
  border: 1px solid #8B5CF6 !important;
}

/* Übersichtskarten im Light Mode */
:global(body.light-theme) .hours-card {
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06) !important;
}

:global(body.light-theme) .hours-info span {
  color: #64748B !important;
}

:global(body.light-theme) .hours-info strong {
  color: #0F172A !important;
}

:global(body.light-theme) .view-switch {
  background: #E2E8F0 !important;
  border-color: #CBD5E1 !important;
}

:global(body.light-theme) .btn-switch {
  color: #475569 !important;
}

:global(body.light-theme) .btn-switch.active {
  background: #2196F3 !important;
  color: #fff !important;
}

:global(body.light-theme) .month-title {
  color: #0F172A !important;
}

:global(body.light-theme) .month-title span {
  color: #475569 !important;
}

:global(body.light-theme) .modal-card {
  background: #FFFFFF !important;
  color: #0F172A !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1) !important;
}

:global(body.light-theme) .modal-header {
  background: #F8FAFC !important;
  border-bottom: 1px solid #E2E8F0 !important;
}

:global(body.light-theme) .modal-header h3 {
  color: #0F172A !important;
}

:global(body.light-theme) .modal-subtitle {
  color: #64748B !important;
}

:global(body.light-theme) .btn-close {
  color: #475569 !important;
}

:global(body.light-theme) .detail-row {
  border-bottom: 1px solid #F1F5F9 !important;
}

:global(body.light-theme) .detail-row .label {
  color: #475569 !important;
}

:global(body.light-theme) .detail-row strong {
  color: #0F172A !important;
}

:global(body.light-theme) .instruction-box {
  background: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
}

:global(body.light-theme) .instruction-box h4 {
  color: #0284C7 !important;
}

:global(body.light-theme) .instruction-box p {
  color: #334155 !important;
}

:global(body.light-theme) .modal-footer {
  background: #F8FAFC !important;
  border-top: 1px solid #E2E8F0 !important;
}

/* ==========================================
   ORIGINAL BASE STYLES (Dark / Standard)
   ========================================== */
.app-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  margin: 0;
}

.header-inner {
  width: 100%;
  max-width: 100%;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info-link { text-decoration: none; }
.user-info { display: flex; align-items: center; gap: 10px; }
.avatar-icon {
  width: 38px; height: 38px; background: linear-gradient(135deg, #2196F3, #1d4ed8);
  border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; flex-shrink: 0;
}
.user-details { display: flex; flex-direction: column; text-align: left; }
.user-name { font-size: 0.85rem; font-weight: 600; color: #f8fafc; white-space: nowrap; }
.user-role { font-size: 0.7rem; color: #94a3b8; }

.menu-toggle { display: none; background: none; border: none; font-size: 1.4rem; color: inherit; cursor: pointer; padding: 6px; }

/* Glocke & Benachrichtigungs-Dropdown Styles (Exakt wie Original im Dark/Light Mode) */
.notifications-wrapper { position: relative; }
.btn-notification-bell { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; width: 38px; height: 38px; border-radius: 10px; cursor: pointer; font-size: 1rem; position: relative; display: flex; align-items: center; justify-content: center; }
.btn-notification-bell:hover { background: rgba(255, 255, 255, 0.1); }
.btn-notification-bell.has-unread { border-color: #38bdf8; background: rgba(56, 189, 248, 0.1); }

.badge-count { position: absolute; top: -5px; right: -5px; background: #EF4444; color: white; font-size: 0.65rem; font-weight: bold; padding: 2px 5px; border-radius: 50%; min-width: 16px; text-align: center; }

.notifications-dropdown { position: absolute; right: 0; top: 48px; width: 300px; background: #131c2e; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 1200; overflow: hidden; text-align: left; }
.dropdown-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1); background: #0b0f19; }
.dropdown-header h4 { margin: 0; font-size: 0.85rem; color: #fff; }
.btn-text-action { background: none; border: none; color: #38bdf8; font-size: 0.75rem; cursor: pointer; padding: 0; }
.btn-text-action:hover { text-decoration: underline; }

.dropdown-body { max-height: 280px; overflow-y: auto; }
.no-notifications { padding: 20px; text-align: center; color: #94a3b8; font-size: 0.8rem; }

.notification-item { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; }
.notification-item:hover { background: rgba(255,255,255,0.03); }
.notification-item.unread { background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; }

.notif-title { font-weight: bold; font-size: 0.82rem; color: #fff; margin-bottom: 2px; }
.notif-msg { font-size: 0.78rem; color: #cbd5e1; margin-bottom: 3px; }
.notif-time { font-size: 0.68rem; color: #64748b; }

.nav-buttons {
  display: flex !important;
  gap: 10px;
  align-items: center;
}

.btn-nav {
  padding: 8px 14px; background: rgba(255, 255, 255, 0.05); color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; text-decoration: none;
  font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;
}
.btn-nav.active { background: #2196F3; border-color: #3b82f6; color: #fff; }
.btn-logout { background: rgba(239, 68, 68, 0.12); color: #fca5a5; border-color: rgba(239, 68, 68, 0.2); cursor: pointer; }

.app-main {
  width: 100%;
  max-width: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Handy-Menü */
@media (max-width: 768px) {
  .app-main { padding: 12px 12px; }
  .header-inner { padding: 12px 16px; }
  .menu-toggle { display: block; }

  .nav-buttons {
    display: none !important;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    flex-direction: column;
    padding: 20px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 15px 30px rgba(0,0,0,0.5);
    z-index: 1100;
    gap: 8px;
  }

  .nav-buttons.show { display: flex !important; }

  .nav-buttons .btn-nav {
    width: 100%;
    padding: 12px 16px;
    font-size: 0.95rem;
    justify-content: flex-start;
    border-radius: 10px;
  }

  .desktop-only { display: none !important; }
}

.hours-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
.hours-card {
  background: transparent; padding: 10px 12px; border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12); display: flex; align-items: center; gap: 8px; text-align: left;
}
.card-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
.card-icon.blue { background: rgba(33, 150, 243, 0.2); color: #2196F3; }
.card-icon.green { background: rgba(16, 185, 129, 0.2); color: #10B981; }
.card-icon.orange { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
.hours-info span { display: block; font-size: 0.62rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
.hours-info strong { font-size: 1.05rem; font-weight: 700; color: inherit; }

.calendar-controls {
  display: flex; justify-content: space-between; align-items: center;
  background: transparent; padding: 4px 0; border: none; gap: 10px; width: 100%;
}
.month-nav { display: flex; align-items: center; gap: 10px; }
.month-title { font-size: 1.05rem; font-weight: 700; }
.nav-arrow { color: #2196F3; font-size: 1.2rem; cursor: pointer; padding: 4px; }

.view-switch { display: flex; gap: 4px; background: rgba(255, 255, 255, 0.05); padding: 4px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); align-items: center; }
.btn-switch { padding: 6px 10px; font-size: 0.78rem; border: none; background: transparent; color: #94a3b8; border-radius: 6px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-switch.active { background: #2196F3; color: #fff; }

.calendar-container-narrow {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
}

.calendar-container-list-narrow {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  width: 100%;
}

@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

.day-card {
  background: #131c2e;
  border-radius: 12px;
  padding: 10px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  text-align: left;
}

.day-card:active { transform: scale(0.98); }

.day-card.day-shift-card { border-color: rgba(33, 150, 243, 0.6); background: rgba(33, 150, 243, 0.08); }
.day-card.night-shift-card { border-color: rgba(139, 92, 246, 0.6); background: rgba(139, 92, 246, 0.08); }
.day-card.vacation-card { border-color: rgba(245, 158, 11, 0.6); background: rgba(245, 158, 11, 0.08); }
.day-card.sick-card { border-color: rgba(239, 68, 68, 0.6); background: rgba(239, 68, 68, 0.08); }

.day-card.off-day {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.6);
}

.day-card.today-highlight {
  box-shadow: 0 0 0 2.5px #F59E0B !important;
}

.day-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; }
.day-number { font-weight: 700; color: #a8acb1; font-size: 0.95rem; }
.day-name { font-size: 0.7rem; text-transform: uppercase; font-weight: 600; }

.day-body { display: flex; flex-direction: column; gap: 5px; }
.shift-top-row { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }

.shift-badge { padding: 3px 6px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.shift-ort-badge { padding: 3px 6px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; background: rgba(33, 150, 243, 0.25); color: #2196F3; border: 1px solid rgba(33, 150, 243, 0.5); }

.badge-td { background: rgba(33, 150, 243, 0.35); color: #2196F3; border: 1px solid rgba(33, 150, 243, 0.6); }
.badge-nd { background: rgba(139, 92, 246, 0.35); color: #8B5CF6; border: 1px solid rgba(139, 92, 246, 0.6); }
.badge-vacation { background: rgba(245, 158, 11, 0.35); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.6); width: 100%; text-align: center; padding: 5px; }
.badge-sick { background: rgba(239, 68, 68, 0.35); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.6); width: 100%; text-align: center; padding: 5px; }

.badge-off {
  background: rgba(16, 185, 129, 0.35);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.6);
  font-weight: 700;
  width: 100%;
  text-align: center;
  padding: 5px;
}

.shift-time-badge { font-size: 0.68rem; padding: 2px 5px; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
.time-day { background: rgba(33, 150, 243, 0.25); color: #2196F3; border: 1px solid rgba(33, 150, 243, 0.5); }
.time-night { background: rgba(139, 92, 246, 0.25); color: #8B5CF6; border: 1px solid rgba(139, 92, 246, 0.5); }

.calendar-grid.list-view { grid-template-columns: 1fr !important; gap: 6px; }
.list-view .day-card { min-height: 50px; flex-direction: row; align-items: center; justify-content: space-between; padding: 8px 14px; }
.list-view .day-header { gap: 10px; margin-bottom: 0; width: 25%; justify-content: flex-start; }
.list-view .day-body { flex-direction: row; align-items: center; gap: 12px; width: 75%; justify-content: flex-end; }
.list-view .shift-top-row { align-items: center; }

.landscape-fullscreen-container {
  width: 100%;
  overflow-x: auto;
}
.landscape-table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
  text-align: center;
}
.landscape-table th, .landscape-table td {
  width: calc(100% / 31);
  padding: 4px 1px;
}
.landscape-table th {
  font-size: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-dates th { background: #2196F3; color: #ffffff; font-weight: 700; font-size: 0.75rem; padding: 6px 1px; }
.row-dates th.weekend { background: #1d4ed8; }
.row-weekdays th { background: #1e293b; color: #94a3b8; font-weight: 600; font-size: 0.65rem; padding: 4px 1px; }

.row-shifts td {
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  vertical-align: middle;
  cursor: pointer;
  overflow: hidden;
  padding: 2px 1px;
}
.row-shifts td.cell-day { background: rgba(33, 150, 243, 0.15); }
.row-shifts td.cell-night { background: rgba(139, 92, 246, 0.15); }
.row-shifts td.cell-vacation { background: rgba(245, 158, 11, 0.15); }
.row-shifts td.cell-sick { background: rgba(239, 68, 68, 0.15); }
.row-shifts td.is-off { background: rgba(16, 185, 129, 0.15); }
.row-shifts td.cell-today-highlight { outline: 2px solid #F59E0B; outline-offset: -2px; }

.landscape-badge {
  display: block;
  margin: 0 auto;
  font-size: 0.62rem;
  padding: 3px 2px;
  width: 92%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}
.off-text-landscape {
  font-size: 0.7rem;
  color: #10B981;
  font-weight: 700;
}

.modal-overlay {
  position: fixed; inset: 0; width: 100vw; height: 100vh; height: 100dvh;
  background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px;
}
.modal-card {
  background: #161e2e; border-radius: 16px; width: 100%; max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.15); overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
}

.modal-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
}

.btn-close:hover {
  color: #fff;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 60vh;
  overflow-y: auto;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}

.detail-row .label {
  color: #94a3b8;
  font-weight: 500;
}

.instruction-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  margin-top: 6px;
}

.instruction-box h4 {
  margin: 0 0 6px 0;
  font-size: 0.85rem;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.instruction-box p {
  margin: 0;
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-info.green {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-info.orange {
  background: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-info.red {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.modal-footer {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>