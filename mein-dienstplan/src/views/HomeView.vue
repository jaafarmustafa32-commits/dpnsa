<template>
  <AppShell
      :user-name="userName"
      :notifications="notifications"
      :unread-count="unreadNotifications.length"
      page-title="Mein Dienstplan"
      @mark-read="markAsRead"
      @mark-all-read="markAllAsRead"
  >
    <main class="home-page">
      <!-- HEADER -->
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">MEINE ÜBERSICHT</span>
          <h1>Hallo, {{ userName }} <span aria-hidden="true">👋</span></h1>
        </div>


      </section>

      <!-- STATS -->
      <section class="stats-grid" aria-label="Arbeitsübersicht">
        <article class="stat-card stat-hours">
          <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
          <div class="stat-content">
            <span>IST-STUNDEN</span>
            <strong>{{ currentMonthHours }} <small>Std.</small></strong>
            <p>Im aktuellen Monat</p>
          </div>
        </article>

        <article class="stat-card stat-target">
          <div class="stat-icon"><i class="fa-solid fa-bullseye"></i></div>
          <div class="stat-content">
            <span>SOLL-STUNDEN</span>
            <strong>160 <small>Std.</small></strong>
            <p>Monatliches Ziel</p>
          </div>
          <div class="progress">
            <span :style="{ width: targetProgress + '%' }"></span>
          </div>
        </article>

        <article class="stat-card stat-vacation">
          <div class="stat-icon"><i class="fa-solid fa-umbrella-beach"></i></div>
          <div class="stat-content">
            <span>URLAUB</span>
            <strong>14 <small>Tage</small></strong>
            <p>Verfügbarer Überblick</p>
          </div>
        </article>
      </section>

      <!-- CALENDAR -->
      <section class="schedule-panel">
        <header class="panel-header">
          <div class="panel-title">
            <span class="eyebrow">DIENSTPLAN</span>
            <h2>{{ monthNames[currentMonth] }} <em>{{ currentYear }}</em></h2>
          </div>

          <div class="panel-toolbar">
            <div class="month-navigation">
              <button type="button" @click="changeMonth(-1)" aria-label="Vorheriger Monat">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button type="button" @click="goToCurrentMonth" aria-label="Aktuellen Monat anzeigen">
                <i class="fa-solid fa-calendar-day"></i>
              </button>
              <button type="button" @click="changeMonth(1)" aria-label="Nächster Monat">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <div class="view-switch" role="tablist" aria-label="Kalenderansicht">
              <button
                  type="button"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
              >
                <i class="fa-solid fa-calendar-days"></i>
                <span>Kalender</span>
              </button>

              <button
                  type="button"
                  class="desktop-view"
                  :class="{ active: viewMode === 'landscape' }"
                  @click="viewMode = 'landscape'"
              >
                <i class="fa-solid fa-table-cells-large"></i>
                <span>Übersicht</span>
              </button>

              <button
                  type="button"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
              >
                <i class="fa-solid fa-list"></i>
                <span>Liste</span>
              </button>
            </div>
          </div>
        </header>

        <div class="calendar-info-row">
          <div class="legend">
            <span class="legend-title">DIENST-INFO</span>
            <span><i class="legend-dot day"></i> Tagdienst</span>
            <span><i class="legend-dot night"></i> Nachtdienst</span>
            <span><i class="legend-dot vacation"></i> Urlaub</span>
            <span><i class="legend-dot sick"></i> Krank</span>
            <span><i class="legend-dot off"></i> Frei</span>
          </div>


        </div>

        <!-- GRID / LIST -->
        <div v-if="viewMode === 'grid' || viewMode === 'list'" class="calendar-wrapper">
          <div class="calendar-grid" :class="{ 'list-view': viewMode === 'list' }">
            <button
                v-for="day in calendarDays"
                :key="day.dateKey"
                type="button"
                class="day-card"
                :class="[day.cardClass, { weekend: day.isWeekend, 'today-highlight': day.isToday }]"
                @click="openDetails(day.dateKey)"
            >
              <div class="day-header">
                <span class="day-number">{{ day.dayNum }}</span>
                <span class="day-name">{{ day.dayName }}</span>
                <span v-if="day.isToday" class="today-badge">HEUTE</span>
              </div>

              <div class="day-content">
                <template v-if="day.shift?.vacation">
                  <span class="status-badge vacation">URLAUB</span>
                </template>

                <template v-else-if="day.shift?.sick">
                  <span class="status-badge sick">KRANK</span>
                </template>

                <template v-else-if="day.shift">
                  <div class="shift-main">
                    <div class="shift-badges">
                      <span class="status-badge" :class="day.shift.isNight ? 'night' : 'day'">
                        {{ day.shift.badge }}
                      </span>
                      <span v-if="day.shift.ort && day.shift.ort !== '-'" class="location-badge">
                        {{ day.shift.ort }}
                      </span>
                    </div>
                    <strong>{{ day.shift.time }}</strong>
                    <small>{{ day.shift.hours }} Std.</small>
                  </div>
                </template>

                <template v-else>
                  <span class="status-badge off">FREI</span>
                </template>
              </div>


            </button>
          </div>
        </div>

        <!-- LANDSCAPE / MONTH STRIP -->
        <div v-else class="landscape-wrapper">
          <table class="landscape-table">
            <thead>
            <tr>
              <th
                  v-for="day in calendarDays"
                  :key="'day-' + day.dateKey"
                  :class="{ weekend: day.isWeekend }"
              >
                <strong>{{ day.dayNum }}</strong>
                <span>{{ day.dayName }}</span>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td
                  v-for="day in calendarDays"
                  :key="'shift-' + day.dateKey"
                  :class="[
                    day.isWeekend ? 'weekend' : '',
                    day.shift
                      ? (day.shift.vacation
                        ? 'cell-vacation'
                        : (day.shift.sick
                          ? 'cell-sick'
                          : (day.shift.isNight ? 'cell-night' : 'cell-day')))
                      : 'cell-off',
                    day.dateKey === todayDateKey ? 'cell-today' : ''
                  ]"
                  @click="openDetails(day.dateKey)"
              >
                <span v-if="day.shift?.vacation" class="matrix-badge vacation">URL</span>
                <span v-else-if="day.shift?.sick" class="matrix-badge sick">KRK</span>
                <span v-else-if="day.shift" class="matrix-badge" :class="day.shift.isNight ? 'night' : 'day'">
                    {{ day.shift.badge }}
                  </span>
                <span v-else class="matrix-off">—</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- DAY DETAILS -->
    <div v-if="selectedDay" class="modal-overlay" @click.self="closeDetails">
      <section class="shift-modal" role="dialog" aria-modal="true">
        <div
            class="modal-accent"
            :class="
            selectedDay.shift?.vacation
              ? 'vacation'
              : selectedDay.shift?.sick
                ? 'sick'
                : selectedDay.shift
                  ? (selectedDay.shift.isNight ? 'night' : 'day')
                  : 'off'
          "
        ></div>

        <header class="modal-header">
          <div>
            <span class="eyebrow">{{ selectedDay.dayName }}tag</span>
            <h3>{{ selectedDay.dayNum }}. {{ monthNames[currentMonth] }} {{ currentYear }}</h3>
          </div>
          <button type="button" class="modal-close" @click="closeDetails" aria-label="Schließen">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="modal-body">
          <template v-if="selectedDay.shift?.vacation">
            <div class="modal-status vacation">
              <i class="fa-solid fa-umbrella-beach"></i>
              <div>
                <strong>Erholungsurlaub</strong>
                <span>Für diesen Tag ist Urlaub eingetragen.</span>
              </div>
            </div>
          </template>

          <template v-else-if="selectedDay.shift?.sick">
            <div class="modal-status sick">
              <i class="fa-solid fa-user-injured"></i>
              <div>
                <strong>Krank / Abwesend</strong>
                <span>Für diesen Tag ist eine Abwesenheit hinterlegt.</span>
              </div>
            </div>
          </template>

          <template v-else-if="selectedDay.shift">
            <div class="detail-grid">
              <div class="detail-item">
                <span>Kürzel</span>
                <strong>{{ selectedDay.shift.badge }}</strong>
              </div>
              <div class="detail-item">
                <span>Arbeitszeit</span>
                <strong>{{ selectedDay.shift.time }}</strong>
              </div>
              <div class="detail-item">
                <span>Einsatzort</span>
                <strong>{{ selectedDay.shift.title }}</strong>
              </div>
              <div class="detail-item">
                <span>Stunden</span>
                <strong>{{ selectedDay.shift.hours }} Std.</strong>
              </div>
            </div>

            <div v-if="selectedDay.shift.ort && selectedDay.shift.ort !== '-'" class="location-detail">
              <i class="fa-solid fa-location-dot"></i>
              <span>{{ selectedDay.shift.ort }}</span>
            </div>

            <div class="instruction-box">
              <div class="instruction-icon"><i class="fa-solid fa-circle-info"></i></div>
              <div>
                <span>Dienstanweisung</span>
                <p>{{ selectedDay.shift.instruction || 'Keine speziellen Anweisungen hinterlegt.' }}</p>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="modal-status off">
              <i class="fa-solid fa-mug-hot"></i>
              <div>
                <strong>Dienstfreier Tag</strong>
                <span>Für diesen Tag ist keine Schicht eingeteilt.</span>
              </div>
            </div>
          </template>
        </div>

        <footer class="modal-footer">
          <button type="button" @click="closeDetails">Schließen</button>
        </footer>
      </section>
    </div>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'
import AppShell from '@/components/AppShell.vue'
import { ensurePushSubscription } from '@/services/pushNotifications.js'

const router = useRouter()

const viewMode = ref('grid')
const selectedDay = ref(null)
const userName = ref('Mitarbeiter')
const currentUserId = ref(null)

const notifications = ref([])
const unreadNotifications = ref([])

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

const daysOfWeekNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const shiftData = ref({})

const todayDateKey = computed(() => {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const todayDisplay = computed(() => {
  return new Date().toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

const currentMonthHours = computed(() => {
  return calendarDays.value.reduce((total, day) => {
    if (!day.shift || day.shift.vacation || day.shift.sick) return total
    return total + (Number(day.shift.hours) || 0)
  }, 0)
})

const targetProgress = computed(() => {
  return Math.min(100, Math.round((currentMonthHours.value / 160) * 100))
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
      scheduleData.forEach((item) => {
        const isNight = Boolean(item.is_night)
        const isSick = item.status === 'sick' || Boolean(item.sick)

        map[item.date] = {
          time: item.shift_time || (isNight ? '19:00–07:00' : '07:00–19:00'),
          title: item.ort || 'Dienst',
          ort: item.ort || '-',
          badge: isSick ? 'KRK' : (item.shift_type || (isNight ? 'ND' : 'TD')),
          isNight,
          sick: isSick,
          hours: Number(item.hours) || 0,
          vacation: Boolean(item.vacation),
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
      vacationData.forEach((vacation) => {
        const start = new Date(vacation.start_date)
        const end = new Date(vacation.end_date)

        for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          const dateKey = `${y}-${m}-${d}`

          map[dateKey] = {
            time: 'Ganztägig',
            title: 'Erholungsurlaub',
            ort: 'Urlaub',
            badge: 'URL',
            isNight: false,
            sick: false,
            hours: 0,
            vacation: true,
            instruction: vacation.reason
                ? `Grund: ${vacation.reason}`
                : 'Erholungsurlaub genehmigt.'
          }
        }
      })
    }

    shiftData.value = map
  } catch (error) {
    console.error('Fehler beim Laden des Dienstplans:', error)
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
    unreadNotifications.value = data.filter((notification) => !notification.is_read)
  }
}

const markAsRead = async (id) => {
  const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

  if (!error) {
    notifications.value = notifications.value.map((notification) =>
        notification.id === id
            ? { ...notification, is_read: true }
            : notification
    )

    unreadNotifications.value = unreadNotifications.value.filter(
        (notification) => notification.id !== id
    )
  }
}

const markAllAsRead = async () => {
  const unreadIds = unreadNotifications.value.map((notification) => notification.id)

  if (!unreadIds.length) return

  const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

  if (!error) {
    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      is_read: true
    }))
    unreadNotifications.value = []
  }
}

const changeMonth = async (delta) => {
  currentMonth.value += delta

  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value += 1
  }

  if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  }

  await fetchSchedulesFromSupabase()
}

const goToCurrentMonth = async () => {
  const date = new Date()
  currentYear.value = date.getFullYear()
  currentMonth.value = date.getMonth()
  await fetchSchedulesFromSupabase()
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    const dateObj = new Date(year, month, day)
    let dayIndex = dateObj.getDay() - 1

    if (dayIndex < 0) dayIndex = 6

    const dayName = daysOfWeekNames[dayIndex]
    const isWeekend = dayIndex === 5 || dayIndex === 6
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const shift = shiftData.value[dateKey]

    let cardClass = 'day-card'

    if (!shift) {
      cardClass += ' off-day'
    } else if (shift.vacation) {
      cardClass += ' vacation-card'
    } else if (shift.sick) {
      cardClass += ' sick-card'
    } else if (shift.isNight) {
      cardClass += ' night-shift-card'
    } else {
      cardClass += ' day-shift-card'
    }

    if (dateKey === todayDateKey.value) {
      cardClass += ' today-highlight'
    }

    days.push({
      dayNum: day,
      dayName,
      dateKey,
      shift,
      cardClass,
      isWeekend,
      isToday: dateKey === todayDateKey.value
    })
  }

  return days
})

const openDetails = (dateKey) => {
  selectedDay.value = calendarDays.value.find((day) => day.dateKey === dateKey) || null
}

const closeDetails = () => {
  selectedDay.value = null
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeDetails()
}

const setupBrowserPush = async () => {
  try {
    if (
        'Notification' in window &&
        Notification.permission === 'granted'
    ) {
      await ensurePushSubscription({ requestPermission: false })
    }
  } catch (error) {
    console.error('❌ Push-Registrierung fehlgeschlagen:', error)
  }
}

onMounted(async () => {
  const userJson = localStorage.getItem('currentUser')

  if (!userJson) {
    router.push('/')
    return
  }

  try {
    const user = JSON.parse(userJson)
    userName.value = user.name || user.username || 'Mitarbeiter'
    currentUserId.value = user.id
  } catch (error) {
    console.error('Ungültige currentUser-Daten:', error)
    localStorage.removeItem('currentUser')
    router.push('/')
    return
  }

  window.addEventListener('keydown', handleKeydown)

  await Promise.all([
    fetchSchedulesFromSupabase(),
    fetchNotifications(),
    setupBrowserPush()
  ])
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.home-page {

  --shadow: 0 24px 70px rgba(0, 0, 0, 0.22);

  width: 100%;
  max-width: 1540px;
  margin: 0 auto;
  color: var(--text);
  font-family: "Manrope", "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.eyebrow {
  display: block;
  color: var(--accent);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.19em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 7px 0 7px;
  color: var(--text);
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.05;
  font-weight: 850;
  letter-spacing: -0.055em;
}

.hero h1 span {
  font-size: 0.72em;
}

.hero p {
  max-width: 650px;
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.today-card {
  min-width: 170px;
  padding: 13px 15px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: linear-gradient(145deg, var(--surface), rgba(255, 255, 255, 0.02));
  box-shadow: var(--shadow);
  text-align: right;
}

.today-card span,
.today-card strong {
  display: block;
}

.today-card span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.15em;
}

.today-card strong {
  margin-top: 4px;
  color: var(--text-soft);
  font-size: 11px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 16px;
}

.stat-card {
  position: relative;
  min-height: 116px;
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: linear-gradient(145deg, var(--surface), var(--surface-2));
  box-shadow: var(--shadow);
}

.stat-hours {
  border-color: rgba(69, 183, 244, 0.22);
}

.stat-target {
  border-color: rgba(53, 211, 154, 0.16);
}

.stat-vacation {
  border-color: rgba(244, 183, 64, 0.18);
}

.stat-icon {
  width: 45px;
  height: 45px;
  flex: 0 0 45px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(69, 183, 244, 0.2);
  border-radius: 13px;
  color: #65c9f7;
  background: rgba(69, 183, 244, 0.09);
}

.stat-target .stat-icon {
  color: var(--green);
  border-color: rgba(53, 211, 154, 0.18);
  background: rgba(53, 211, 154, 0.08);
}

.stat-vacation .stat-icon {
  color: var(--yellow);
  border-color: rgba(244, 183, 64, 0.18);
  background: rgba(244, 183, 64, 0.08);
}

.stat-content {
  min-width: 0;
}
/* =========================================================
   STATS GRID
========================================================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}


/* =========================================================
   MOBILE – 3 KARTEN NEBENEINANDER
========================================================= */

@media (max-width: 768px) {

  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .stat-card {
    min-width: 0;
    padding: 12px 8px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

  }

  .stat-icon {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 9px;
    font-size: 13px;
  }

  .stat-content {
    min-width: 0;
  }

  .stat-content > span {
    display: block;

    font-size: 8px;
    line-height: 1.2;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stat-content strong {
    display: block;

    margin-top: 5px;

    font-size: 18px;
    line-height: 1.1;

    white-space: nowrap;
  }

  .stat-content strong small {
    font-size: 8px;
    font-weight: 600;
  }

  .stat-content p {
    display: none;
  }

  .progress {
    height: 3px;
    margin-top: 8px;
  }

}

.stat-content > span {
  display: block;
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.15em;
}

.stat-content strong {
  display: block;
  margin-top: 5px;
  color: var(--text);
  font-size: 25px;
  font-weight: 850;
  letter-spacing: -0.045em;
}

.stat-content strong small {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
}

.stat-content p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.progress {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 11px;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
}

.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--green);
}

.schedule-panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 19px 20px 16px;
  border-bottom: 1px solid var(--border);
}

.panel-title h2 {
  margin: 5px 0 0;
  color: var(--text);
  font-size: 21px;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.panel-title h2 em {
  color: var(--text-muted);
  font-style: normal;
  font-weight: 600;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  gap: 9px;
}

.month-navigation {
  display: flex;
  gap: 5px;
}

.month-navigation button,
.view-switch button {
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: var(--surface-2);
  cursor: pointer;
  transition: 0.18s ease;
}

.month-navigation button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.month-navigation button:hover {
  color: var(--accent);
  border-color: rgba(69, 183, 244, 0.3);
  transform: translateY(-1px);
}

.view-switch {
  display: flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-2);
}

.view-switch button {
  min-height: 29px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 850;
}

.view-switch button i {
  margin-right: 5px;
}

.view-switch button.active {
  color: #07131d;
  background: var(--accent);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 750;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.legend-dot.day { background: #45b7f4; }
.legend-dot.night { background: #a78bfa; }
.legend-dot.vacation { background: #f4b740; }
.legend-dot.sick { background: #fb657d; }
.legend-dot.off { background: #35d39a; }

.calendar-info-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 48%);
  align-items: end;
  gap: 18px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
}

.calendar-info-row .legend {
  padding: 12px 0;
  border-bottom: 0;
}

.legend-title {
  color: var(--text);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.calendar-weekdays-top {
  margin: 0 0 8px;
}

.calendar-wrapper {
  padding: 16px;
  overflow-x: auto;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-weekdays {
  margin-bottom: 8px;
}

.calendar-weekdays span {
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
}

.day-card {
  position: relative;
  min-height: 122px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text);
  background: var(--surface-2);
  text-align: left;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.day-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.day-card.weekend {
  background: var(--surface-3);
}

.day-card.day-shift-card {
  border-color: rgba(69, 183, 244, 0.25);
  background: linear-gradient(145deg, rgba(69, 183, 244, 0.1), var(--surface-2));
}

.day-card.night-shift-card {
  border-color: rgba(167, 139, 250, 0.25);
  background: linear-gradient(145deg, rgba(167, 139, 250, 0.1), var(--surface-2));
}

.day-card.vacation-card {
  border-color: rgba(244, 183, 64, 0.3);
  background: linear-gradient(145deg, rgba(244, 183, 64, 0.1), var(--surface-2));
}

.day-card.sick-card {
  border-color: rgba(251, 101, 125, 0.42);
  background: linear-gradient(145deg, rgba(251, 101, 125, 0.13), var(--surface-2));
  box-shadow: inset 0 0 0 1px rgba(251, 101, 125, 0.04);
}

.day-card.off-day {
  border-color: rgba(53, 211, 154, 0.16);
}

.day-card.today-highlight {
  border: 3px solid #f4b740 !important;
  outline: 2px solid rgba(244, 183, 64, 0.28) !important;
  outline-offset: -2px;
  box-shadow:
      0 0 0 2px rgba(244, 183, 64, 0.18),
      0 0 18px rgba(244, 183, 64, 0.22) !important;
  background-image: linear-gradient(
      145deg,
      rgba(244, 183, 64, 0.16),
      var(--surface-2)
  ) !important;
}

.day-card.today-highlight .day-number,
.day-card.today-highlight .day-name {
  color: #f4b740 !important;
}

.today-badge {
  margin-left: auto;
  padding: 3px 5px;
  border: 1px solid #f4b740;
  border-radius: 5px;
  color: #f4b740;
  background: rgba(244, 183, 64, 0.12);
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1;
}

.day-card.today-highlight .day-number,
.day-card.today-highlight .day-name {
  color: #f4b740;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.day-number {
  color: var(--text);
  font-size: 15px;
  font-weight: 900;
}

.day-name {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shift-main {
  min-width: 0;
}

.shift-main strong,
.shift-main small {
  display: block;
}

.shift-main strong {
  margin-top: 6px;
  color: var(--text);
  font-size: 14px;
  letter-spacing: -0.02em;
}

.shift-main small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.shift-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.status-badge,
.location-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.status-badge.day {
  color: #72cef8;
  border-color: rgba(69, 183, 244, 0.22);
  background: rgba(69, 183, 244, 0.1);
}

.status-badge.night {
  color: #c4b5fd;
  border-color: rgba(167, 139, 250, 0.22);
  background: rgba(167, 139, 250, 0.1);
}

.status-badge.vacation,
.status-badge.sick,
.status-badge.off {
  width: 100%;
  justify-content: center;
}

.status-badge.vacation {
  color: #f7c65c;
  border-color: rgba(244, 183, 64, 0.22);
  background: rgba(244, 183, 64, 0.1);
}

.status-badge.sick {
  color: #ff8296;
  border-color: rgba(251, 101, 125, 0.28);
  background: rgba(251, 101, 125, 0.12);
}

.status-badge.off {
  color: #58dfaa;
  border-color: rgba(53, 211, 154, 0.18);
  background: rgba(53, 211, 154, 0.08);
}

.location-badge {
  max-width: 100%;
  overflow: hidden;
  color: #72cef8;
  border-color: rgba(69, 183, 244, 0.12);
  background: rgba(69, 183, 244, 0.05);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-marker {
  position: absolute;
  top: 7px;
  right: 8px;
  color: var(--yellow);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.calendar-grid.list-view {
  grid-template-columns: 1fr;
  gap: 6px;
}

.list-view .day-card {
  min-height: 64px;
  flex-direction: row;
  align-items: center;
  gap: 15px;
}

.list-view .day-header {
  width: 100px;
  flex: 0 0 100px;
}

.list-view .day-content {
  flex: 1;
}

.list-view .status-badge {
  width: fit-content;
}

.list-view .status-badge.off {
  width: fit-content;
}

.landscape-wrapper {
  overflow-x: auto;
  padding: 16px;
}

.landscape-table {
  width: 100%;
  min-width: 820px;
  border-collapse: separate;
  border-spacing: 3px;
  table-layout: fixed;
}

.landscape-table th,
.landscape-table td {
  padding: 7px 2px;
  text-align: center;
}

.landscape-table th {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 800;
  background: var(--surface-2);
  border-radius: 7px;
}

.landscape-table th strong,
.landscape-table th span {
  display: block;
}

.landscape-table th strong {
  color: var(--text);
  font-size: 11px;
}

.landscape-table td {
  height: 52px;
  border-radius: 7px;
  background: var(--surface-2);
  cursor: pointer;
}

.landscape-table td.cell-day { background: rgba(69, 183, 244, 0.1); }
.landscape-table td.cell-night { background: rgba(167, 139, 250, 0.1); }
.landscape-table td.cell-vacation { background: rgba(244, 183, 64, 0.1); }
.landscape-table td.cell-sick { background: rgba(251, 101, 125, 0.15); }
.landscape-table td.cell-off { background: rgba(53, 211, 154, 0.06); }
.landscape-table td.cell-today {
  outline: 2px solid #f4b740;
  outline-offset: -1px;
  box-shadow: 0 0 0 2px rgba(244, 183, 64, 0.14);
}

.matrix-badge {
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  padding: 5px 3px;
  border-radius: 5px;
  font-size: 7px;
  font-weight: 900;
}



.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 18px;
  backdrop-filter: blur(10px);
}

.shift-modal {
  position: relative;
  width: min(500px, 100%);
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: 21px;
  box-shadow: 0 35px 110px rgba(0, 0, 0, 0.5);
}

.modal-accent {
  height: 3px;
  background: var(--green);
}

.modal-accent.day { background: var(--accent); }
.modal-accent.night { background: var(--purple); }
.modal-accent.vacation { background: var(--yellow); }
.modal-accent.sick { background: var(--red); }

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 20px 14px;
}

.modal-header h3 {
  margin: 5px 0 0;
  color: var(--text);
  font-size: 20px;
  letter-spacing: -0.035em;
}

.modal-close {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  background: var(--surface-2);
  cursor: pointer;
}

.modal-body {
  padding: 5px 20px 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-item {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface-2);
}

.detail-item span,
.detail-item strong {
  display: block;
}

.detail-item span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
}

.detail-item strong {
  margin-top: 4px;
  color: var(--text);
  font-size: 11px;
}

.location-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
  padding: 10px 12px;
  color: #72cef8;
  border-radius: 10px;
  background: rgba(69, 183, 244, 0.07);
  font-size: 10px;
  font-weight: 800;
}

.instruction-box {
  display: flex;
  gap: 10px;
  margin-top: 9px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
}

.instruction-icon {
  width: 29px;
  height: 29px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  color: #72cef8;
  border-radius: 8px;
  background: rgba(69, 183, 244, 0.09);
}

.instruction-box span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.instruction-box p {
  margin: 4px 0 0;
  color: var(--text-soft);
  font-size: 10px;
  line-height: 1.55;
}

.modal-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 13px;
}

.modal-status > i {
  font-size: 22px;
}

.modal-status strong,
.modal-status span {
  display: block;
}

.modal-status strong {
  color: var(--text);
  font-size: 15px;
}

.modal-status span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.modal-status.vacation {
  color: var(--yellow);
  background: rgba(244, 183, 64, 0.07);
}

.modal-status.sick {
  color: var(--red);
  background: rgba(251, 101, 125, 0.08);
}

.modal-status.off {
  color: var(--green);
  background: rgba(53, 211, 154, 0.07);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 18px;
}

.modal-footer button {
  padding: 9px 15px;
  border: 0;
  border-radius: 9px;
  color: #07111e;
  background: var(--accent);
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
}

/* LIGHT MODE
   AppShell toggles body.light-theme.
   HomeView reads that class through :global so both components stay synchronized.
*/
:global(html.light-theme) .home-page {
  --bg: #f4f7fb;
  --surface: #ffffff;
  --surface-2: #f7f9fc;
  --surface-3: #f1f5f9;
  --border: #e3e8ef;
  --border-strong: #d3dbe6;
  --text: #122033;
  --text-soft: #526176;
  --text-muted: #7b8798;
  --accent: #168ac4;
  --accent-soft: rgba(22, 138, 196, 0.09);
  --purple: #7656d8;
  --green: #15966b;
  --yellow: #c98608;
  --red: #d83f5c;
  --shadow: 0 18px 50px rgba(15, 23, 42, 0.07);
}

:global(html.light-theme) .today-card,
:global(html.light-theme) .stat-card,
:global(html.light-theme) .schedule-panel {
  box-shadow: var(--shadow);
}

:global(html.light-theme) .day-card.day-shift-card {
  background: linear-gradient(145deg, #eef9ff, #ffffff);
  border-color: #b8e3f8;
}

:global(html.light-theme) .day-card.night-shift-card {
  background: linear-gradient(145deg, #f5f1ff, #ffffff);
  border-color: #d9ccfa;
}

:global(html.light-theme) .day-card.vacation-card {
  background: linear-gradient(145deg, #fff8e6, #ffffff);
  border-color: #f4d88c;
}

:global(html.light-theme) .day-card.sick-card {
  background: linear-gradient(145deg, #fff0f3, #ffffff);
  border-color: #f1b9c4;
}

:global(html.light-theme) .day-card.off-day {
  background: #f5fcf8;
  border-color: #bce9d4;
}

:global(html.light-theme) .landscape-table td.cell-day { background: #eef9ff; }
:global(html.light-theme) .landscape-table td.cell-night { background: #f5f1ff; }
:global(html.light-theme) .landscape-table td.cell-vacation { background: #fff8e6; }
:global(html.light-theme) .landscape-table td.cell-sick { background: #fff0f3; }
:global(html.light-theme) .landscape-table td.cell-off { background: #f1fbf6; }

:global(html.light-theme) .shift-modal {
  background: #ffffff;
  border-color: #dfe5ed;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.18);
}

:global(html.light-theme) .modal-overlay {
  background: rgba(15, 23, 42, 0.42);
}

/* TABLET */
@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .calendar-grid {
    gap: 6px;
  }

  .day-card {
    min-height: 108px;
    padding: 9px;
  }
}

/* MOBILE */
@media (max-width: 760px) {

  .hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  }

  .hero h1 {
    font-size: 28px;
  }

  .today-card {
    width: 100%;
    padding: 10px 12px;
    text-align: left;
  }

  /* =========================================================
     STATISTIK – 3 KARTEN NEBENEINANDER
     ========================================================= */

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    width: 100%;
    margin-bottom: 10px;
  }

  .stat-card,
  .stat-target {
    grid-column: auto !important;
    position: relative;
    min-width: 0;
    min-height: 72px;
    height: 72px;
    display: grid;
    grid-template-columns: 27px minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    padding: 8px 7px;
    border-radius: 10px;
    overflow: visible;
  }

  .stat-icon {
    width: 27px;
    height: 27px;
    min-width: 27px;
    border-radius: 7px;
    font-size: 10px;
  }

  .stat-content {
    min-width: 0;
    width: 100%;
  }

  .stat-content > span {
    display: block;
    width: 100%;
    margin: 0;
    color: var(--text-muted);
    font-size: 7.5px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: visible;
    text-overflow: clip;
  }

  .stat-content strong {
    display: block;
    margin-top: 3px;
    color: var(--text);
    font-size: 15px;
    line-height: 1;
    font-weight: 850;
    letter-spacing: -0.03em;
    white-space: nowrap;
  }

  .stat-content strong small {
    color: var(--text-muted);
    font-size: 7px;
    font-weight: 700;
  }

  .stat-content p {
    display: none;
  }

  .stat-target .stat-content {
    padding-bottom: 3px;
  }

  .progress {
    position: absolute;
    left: 7px;
    right: 7px;
    bottom: 5px;
    height: 3px;
    margin: 0;
  }

  /* =========================================================
     DIENSTPLAN
     ========================================================= */

  .panel-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 13px;
  }

  .panel-title h2 {
    font-size: 20px;
  }

  .panel-toolbar {
    width: 100%;
    justify-content: space-between;
  }

  .view-switch {
    flex: 1;
  }

  .view-switch button {
    flex: 1;
    min-height: 32px;
    font-size: 10px;
  }

  .view-switch .desktop-view {
    display: none;
  }

  /* Dienst-Info links, Wochentage rechts */
  .calendar-info-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(125px, 45%);
    align-items: center;
    gap: 8px;
    padding: 8px 9px;
    min-width: 0;
  }

  .calendar-info-row .legend {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 7px;
    padding: 0;
    border-bottom: 0;
    overflow: visible;
  }

  .legend-title {
    width: 100%;
    font-size: 9px !important;
  }

  .legend span {
    font-size: 8px;
    white-space: nowrap;
  }

  .calendar-weekdays-top {
    display: grid !important;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    width: 100%;
    min-width: 0;
    gap: 1px;
    padding: 0;
    margin: 0;
    align-self: center;
  }

  .calendar-weekdays-top span {
    font-size: 8px;
    text-align: center;
  }

  .calendar-wrapper {
    padding: 7px;
  }

  .calendar-grid {
    gap: 5px;
  }

  .day-card {
    min-height: 108px;
    padding: 9px;
    border-radius: 10px;
  }

  .day-number {
    font-size: 16px;
  }

  .day-name {
    font-size: 9px;
  }

  .shift-main strong {
    font-size: 14px;
  }

  .shift-main small {
    font-size: 9px;
  }

  .location-badge {
    display: none;
  }

  .status-badge {
    font-size: 10px;
    padding: 5px 6px;
  }

  .today-marker {
    font-size: 8px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* SMALL PHONE */
@media (max-width: 470px) {

  .hero h1 {
    font-size: 25px;
  }

  .panel-title h2 {
    font-size: 18px;
  }

  /* Die 3 Statistik-Karten bleiben nebeneinander */
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }

  .stat-card,
  .stat-target {
    grid-template-columns: 23px minmax(0, 1fr);
    min-height: 68px;
    height: 68px;
    gap: 4px;
    padding: 7px 5px;
    border-radius: 9px;
  }

  .stat-icon {
    width: 23px;
    height: 23px;
    min-width: 23px;
    border-radius: 6px;
    font-size: 9px;
  }

  .stat-content > span {
    font-size: 6.8px;
    letter-spacing: 0;
  }

  .stat-content strong {
    font-size: 14px;
  }

  .stat-content strong small {
    font-size: 6.5px;
  }

  .progress {
    left: 5px;
    right: 5px;
    bottom: 4px;
    height: 3px;
  }

  .calendar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calendar-info-row {
    grid-template-columns: minmax(0, 1fr) minmax(118px, 44%);
    gap: 5px;
    padding: 7px;
  }

  .calendar-info-row .legend {
    gap: 3px 5px;
  }

  .legend-title {
    font-size: 8px !important;
  }

  .legend span {
    font-size: 7px;
  }

  .calendar-weekdays-top {
    display: grid !important;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    width: 100% !important;
    min-width: 0 !important;
    gap: 0;
  }

  .calendar-weekdays-top span {
    font-size: 7px;
  }

  .day-card {
    min-height: 106px;
  }

  .day-number {
    font-size: 15px;
  }

  .day-name {
    font-size: 8px;
  }

  .status-badge {
    font-size: 10px;
  }

  .list-view .day-card {
    min-height: 60px;
  }

  .list-view .day-header {
    width: 70px;
    flex-basis: 70px;
  }

  .list-view .day-content {
    align-items: flex-end;
  }

  .list-view .status-badge {
    font-size: 7px;
  }

  .month-navigation button {
    width: 32px;
    height: 32px;
  }
}
</style>