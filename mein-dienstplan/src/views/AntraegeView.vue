<template>
  <AppShell
      :user-name="currentUserName"
      :notifications="notifications"
      :unread-count="unreadNotifications.length"
      :is-light-mode="isLightMode"
      page-title="Anträge"
      @mark-read="markAsRead"
      @mark-all-read="markAllAsRead"
      @toggle-theme="toggleTheme"
  >
    <div class="requests-page">
      <!-- Header -->
      <section class="page-hero">
        <div>
          <span class="eyebrow">MITARBEITER PORTAL</span>
          <h1>Anträge</h1>
          <p>Urlaub, Zeitausgleich und weitere Anträge einfach und übersichtlich verwalten.</p>
        </div>

        <div class="hero-status">
          <span class="status-dot"></span>
          <div>
            <strong>Urlaubsplanung</strong>
            <small>Smart-Check aktiv</small>
          </div>
        </div>
      </section>

      <div v-if="successMessage" class="alert success-alert">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <strong>Antrag übermittelt</strong>
          <span>{{ successMessage }}</span>
        </div>
        <button type="button" @click="successMessage = ''" aria-label="Meldung schließen">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div v-if="errorMessage" class="alert error-alert">
        <i class="fa-solid fa-circle-exclamation"></i>
        <div>
          <strong>Hinweis</strong>
          <span>{{ errorMessage }}</span>
        </div>
        <button type="button" @click="errorMessage = ''" aria-label="Meldung schließen">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="content-grid">
        <!-- Antrag -->
        <section class="panel request-panel">
          <div class="panel-heading">
            <div class="heading-icon blue">
              <i class="fa-solid fa-file-circle-plus"></i>
            </div>
            <div>
              <span class="section-kicker">NEUER ANTRAG</span>
              <h2>Antrag erstellen</h2>
              <p>Wähle Zeitraum und Antragsart.</p>
            </div>
          </div>

          <form @submit.prevent="submitRequest" class="request-form">
            <div class="form-group">
              <label for="typeSelect">Antragsart</label>
              <div class="select-wrap">
                <i class="fa-solid fa-layer-group"></i>
                <select id="typeSelect" v-model="newRequest.type" required>
                  <option value="" disabled>Bitte wählen...</option>
                  <option value="Erholungsurlaub">Erholungsurlaub</option>
                  <option value="Zeitausgleich">Zeitausgleich (ZA)</option>
                  <option value="Diensttausch">Diensttausch</option>
                  <option value="Sonderurlaub">Sonderurlaub</option>
                </select>
              </div>
            </div>

            <div class="date-fields">
              <div class="form-group">
                <label for="startDate">Von</label>
                <div class="input-wrap">
                  <i class="fa-regular fa-calendar"></i>
                  <input
                      id="startDate"
                      v-model="newRequest.startDate"
                      type="date"
                      required
                      @change="onStartDateChange"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="endDate">Bis</label>
                <div class="input-wrap">
                  <i class="fa-regular fa-calendar-check"></i>
                  <input
                      id="endDate"
                      v-model="newRequest.endDate"
                      type="date"
                      :min="newRequest.startDate || undefined"
                      required
                  />
                </div>
              </div>
            </div>

            <!-- Smart result -->
            <div
                v-if="newRequest.type === 'Erholungsurlaub' && newRequest.startDate"
                class="selection-result"
                :class="rangeResult.className"
            >
              <div class="result-icon">
                <i :class="rangeResult.icon"></i>
              </div>
              <div class="result-copy">
                <strong>{{ rangeResult.title }}</strong>
                <span>{{ rangeResult.message }}</span>
              </div>
              <span class="result-label">{{ rangeResult.label }}</span>
            </div>

            <div class="form-group">
              <label for="reasonInput">
                Begründung <span>optional</span>
              </label>
              <textarea
                  id="reasonInput"
                  v-model="newRequest.reason"
                  rows="4"
                  placeholder="Grund oder zusätzliche Information..."
              ></textarea>
            </div>

            <button
                type="submit"
                class="submit-btn"
                :disabled="isSubmitting || !canSubmit"
            >
              <i v-if="!isSubmitting" class="fa-solid fa-paper-plane"></i>
              <i v-else class="fa-solid fa-circle-notch fa-spin"></i>
              <span>{{ isSubmitting ? 'Wird gesendet...' : 'Antrag einreichen' }}</span>
            </button>
          </form>
        </section>

        <!-- Smart Kalender -->
        <section class="panel smart-panel">
          <div class="panel-heading smart-heading">
            <div class="heading-icon purple">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <span class="section-kicker">SMART CHECK</span>
              <h2>Urlaubsplaner</h2>
              <p>Eine Orientierung anhand deines aktuellen Dienstplans.</p>
            </div>
          </div>

          <div class="smart-note">
            <i class="fa-solid fa-circle-info"></i>
            <span>
              Die Farben sind eine Planungshilfe. Die endgültige Genehmigung erfolgt durch die Verwaltung.
            </span>
          </div>

          <div class="availability-legend">
            <div class="legend-item red">
              <span class="legend-dot"></span>
              <div><strong>Rot</strong><small>Nicht möglich</small></div>
            </div>
            <div class="legend-item orange">
              <span class="legend-dot"></span>
              <div><strong>Orange</strong><small>Wahrscheinlich schwierig</small></div>
            </div>
            <div class="legend-item yellow">
              <span class="legend-dot"></span>
              <div><strong>Gelb</strong><small>Möglich</small></div>
            </div>
            <div class="legend-item green">
              <span class="legend-dot"></span>
              <div><strong>Grün</strong><small>Gute Möglichkeit</small></div>
            </div>
          </div>

          <div class="calendar-toolbar">
            <button type="button" @click="changeCalendarMonth(-1)" aria-label="Vorheriger Monat">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div>
              <strong>{{ calendarMonthName }}</strong>
              <span>{{ calendarYear }}</span>
            </div>
            <button type="button" @click="changeCalendarMonth(1)" aria-label="Nächster Monat">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div class="smart-calendar">
            <div class="weekday-row">
              <span v-for="day in weekdays" :key="day">{{ day }}</span>
            </div>

            <div class="calendar-grid">
              <button
                  v-for="day in smartCalendarDays"
                  :key="day.key"
                  type="button"
                  class="smart-day"
                  :class="[
                  day.availabilityClass,
                  {
                    muted: !day.inCurrentMonth,
                    today: day.isToday,
                    selectedStart: newRequest.startDate === day.key,
                    selectedEnd: newRequest.endDate === day.key,
                    inRange: isDateInSelectedRange(day.key)
                  }
                ]"
                  :disabled="!day.inCurrentMonth"
                  @click="selectCalendarDate(day)"
                  :title="day.tooltip"
              >
                <span class="day-number">{{ day.day }}</span>
                <span v-if="day.inCurrentMonth" class="availability-dot"></span>
                <span v-if="day.isToday" class="today-text">Heute</span>
              </button>
            </div>
          </div>

          <div v-if="selectedCalendarDay" class="day-insight" :class="selectedCalendarDay.availabilityClass">
            <div class="insight-icon">
              <i :class="selectedCalendarDay.icon"></i>
            </div>
            <div>
              <strong>{{ selectedCalendarDay.label }}</strong>
              <span>{{ selectedCalendarDay.tooltip }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Anträge -->
      <section class="panel history-panel">
        <div class="history-header">
          <div class="panel-heading compact">
            <div class="heading-icon green">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <span class="section-kicker">VERLAUF</span>
              <h2>Meine Anträge</h2>
              <p>{{ requests.length }} gespeicherte Anträge</p>
            </div>
          </div>

          <div class="request-count">
            <strong>{{ requests.length }}</strong>
            <span>Anträge</span>
          </div>
        </div>

        <div v-if="requests.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fa-regular fa-folder-open"></i>
          </div>
          <strong>Noch keine Anträge</strong>
          <span>Deine eingereichten Anträge erscheinen hier.</span>
        </div>

        <div v-else class="requests-list">
          <article
              v-for="req in requests"
              :key="req.id"
              class="request-item"
          >
            <div class="request-type-icon" :class="requestTypeClass(req.type)">
              <i :class="requestTypeIcon(req.type)"></i>
            </div>

            <div class="request-main">
              <div class="request-title-row">
                <strong>{{ req.type }}</strong>
                <span class="status-badge" :class="getStatusClass(req.status)">
                  <i :class="getStatusIcon(req.status)"></i>
                  {{ req.status }}
                </span>
              </div>

              <div class="request-meta">
                <span>
                  <i class="fa-regular fa-calendar"></i>
                  {{ req.startDate }}
                  <template v-if="req.endDate !== req.startDate">
                    – {{ req.endDate }}
                  </template>
                </span>
                <span v-if="req.reason">
                  <i class="fa-regular fa-comment"></i>
                  {{ req.reason }}
                </span>
              </div>
            </div>

            <button
                v-if="req.rawStatus === 'pending' || req.status === 'In Bearbeitung'"
                type="button"
                class="delete-btn"
                title="Antrag zurückziehen"
                @click="deleteRequest(req.id)"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </article>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'
import AppShell from '@/components/AppShell.vue'
import { useAppStore } from '@/stores/app.js'

const router = useRouter()

const { isLightMode, toggleTheme, initTheme } = useAppStore()

const currentUserName = ref('Mitarbeiter')
const currentUserId = ref(null)

const notifications = ref([])
const unreadNotifications = ref([])

const successMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const requests = ref([])

const scheduleMap = ref({})
const approvedVacationDates = ref(new Set())
const pendingVacationDates = ref(new Set())

const now = new Date()
const calendarMonth = ref(now.getMonth())
const calendarYear = ref(now.getFullYear())

const selectedCalendarDay = ref(null)

const newRequest = ref({
  type: '',
  startDate: '',
  endDate: '',
  reason: ''
})

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const pad = (value) => String(value).padStart(2, '0')

const toDateKey = (year, monthIndex, day) => {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

const parseDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const todayKey = computed(() => {
  const date = new Date()
  return toDateKey(date.getFullYear(), date.getMonth(), date.getDate())
})

const calendarMonthName = computed(() => monthNames[calendarMonth.value])

const loadCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser')

  if (!userJson) {
    router.push('/login')
    return false
  }

  try {
    const user = JSON.parse(userJson)
    currentUserName.value = user.name || user.username || 'Mitarbeiter'
    currentUserId.value = user.id || null
    return Boolean(currentUserId.value)
  } catch (error) {
    console.error('Fehler beim Lesen des Benutzers:', error)
    router.push('/login')
    return false
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
    unreadNotifications.value = data.filter(item => !item.is_read)
  }
}

const markAsRead = async (id) => {
  const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

  if (!error) {
    notifications.value = notifications.value.map(item =>
        item.id === id ? { ...item, is_read: true } : item
    )

    unreadNotifications.value = unreadNotifications.value.filter(item => item.id !== id)
  }
}

const markAllAsRead = async () => {
  const ids = unreadNotifications.value.map(item => item.id)

  if (!ids.length) return

  const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids)

  if (!error) {
    notifications.value = notifications.value.map(item => ({
      ...item,
      is_read: true
    }))
    unreadNotifications.value = []
  }
}

const fetchSchedules = async () => {
  if (!currentUserId.value) return

  const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', currentUserId.value)

  if (error) {
    console.error('Fehler beim Laden des Dienstplans:', error)
    return
  }

  const map = {}

  ;(data || []).forEach(item => {
    map[item.date] = {
      date: item.date,
      shiftTime: item.shift_time || '',
      shiftType: item.shift_type || '',
      isNight: Boolean(item.is_night),
      vacation: Boolean(item.vacation),
      sick: item.status === 'sick' || Boolean(item.sick),
      location: item.ort || '',
      hours: Number(item.hours) || 0
    }
  })

  scheduleMap.value = map
}

const fetchVacationDates = async () => {
  if (!currentUserId.value) return

  const { data, error } = await supabase
      .from('vacations')
      .select('*')
      .eq('user_id', currentUserId.value)

  if (error) {
    console.error('Fehler beim Laden der Urlaubstage:', error)
    return
  }

  const approved = new Set()
  const pending = new Set()

  ;(data || []).forEach(item => {
    if (!item.start_date || !item.end_date) return

    const start = parseDateKey(item.start_date)
    const end = parseDateKey(item.end_date)

    for (
        const cursor = new Date(start);
        cursor <= end;
        cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = toDateKey(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate()
      )

      if (item.status === 'approved') approved.add(key)
      if (item.status === 'pending') pending.add(key)
    }
  })

  approvedVacationDates.value = approved
  pendingVacationDates.value = pending
}

const fetchRequests = async () => {
  if (!currentUserId.value) return

  const { data, error } = await supabase
      .from('vacations')
      .select('*')
      .eq('user_id', currentUserId.value)
      .order('id', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Anträge:', error)
    return
  }

  requests.value = (data || []).map(req => ({
    id: req.id,
    type: req.type || 'Erholungsurlaub',
    startDate: formatDateForDisplay(req.start_date),
    endDate: formatDateForDisplay(req.end_date),
    rawStart: req.start_date,
    rawEnd: req.end_date,
    reason: req.reason || '',
    rawStatus: req.status,
    status: translateStatus(req.status)
  }))
}

const translateStatus = (status) => {
  if (status === 'approved') return 'Genehmigt'
  if (status === 'rejected') return 'Abgelehnt'
  return 'In Bearbeitung'
}

const formatDateForDisplay = (dateString) => {
  if (!dateString) return ''

  const parts = dateString.split('-')
  if (parts.length !== 3) return dateString

  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

/*
 * SMART-REGEL:
 *
 * Rot:
 * - an diesem Tag ist bereits eine Schicht eingetragen
 * - oder der Tag ist als krank hinterlegt
 *
 * Orange:
 * - bereits ein offener Urlaubsantrag für den Tag
 *
 * Gelb:
 * - frei, aber direkt an einen Arbeitstag angrenzend
 * - deshalb möglich, aber vorher prüfen
 *
 * Grün:
 * - aktuell kein Dienst und keine bekannte Überschneidung
 *
 * Das ist bewusst eine Orientierung. Ob Urlaub tatsächlich genehmigt
 * werden kann, entscheidet die Verwaltung anhand der vollständigen
 * Personal- und Einsatzplanung.
 */
const getAvailability = (dateKey) => {
  const schedule = scheduleMap.value[dateKey]

  if (schedule?.sick) {
    return {
      key: 'red',
      className: 'availability-red',
      label: 'Nicht möglich',
      title: 'Krank / abwesend',
      message: 'Für diesen Tag ist eine Abwesenheit hinterlegt.',
      tooltip: 'Krank / Abwesend – Urlaub kann für diesen Tag nicht sinnvoll geplant werden.',
      icon: 'fa-solid fa-user-injured'
    }
  }

  if (schedule && !schedule.vacation) {
    return {
      key: 'red',
      className: 'availability-red',
      label: 'Nicht möglich',
      title: 'Dienst eingetragen',
      message: `Du bist an diesem Tag bereits eingeteilt${schedule.location ? ` bei ${schedule.location}` : ''}.`,
      tooltip: `Dienst eingetragen${schedule.shiftTime ? `: ${schedule.shiftTime}` : ''} – Urlaub für diesen Tag ist nach aktuellem Plan nicht möglich.`,
      icon: 'fa-solid fa-ban'
    }
  }

  if (approvedVacationDates.value.has(dateKey)) {
    return {
      key: 'green',
      className: 'availability-green',
      label: 'Bereits genehmigt',
      title: 'Urlaub genehmigt',
      message: 'Für diesen Tag ist bereits genehmigter Urlaub hinterlegt.',
      tooltip: 'Bereits genehmigter Urlaub.',
      icon: 'fa-solid fa-circle-check'
    }
  }

  if (pendingVacationDates.value.has(dateKey)) {
    return {
      key: 'orange',
      className: 'availability-orange',
      label: 'In Prüfung',
      title: 'Antrag vorhanden',
      message: 'Für diesen Tag gibt es bereits einen offenen Urlaubsantrag.',
      tooltip: 'Für diesen Tag liegt bereits ein offener Antrag vor.',
      icon: 'fa-solid fa-hourglass-half'
    }
  }

  const date = parseDateKey(dateKey)
  const previousKey = toDateKey(
      new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1).getFullYear(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1).getMonth(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1).getDate()
  )
  const nextKey = toDateKey(
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getFullYear(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getMonth(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getDate()
  )

  const previousHasShift = Boolean(scheduleMap.value[previousKey]?.shiftTime)
  const nextHasShift = Boolean(scheduleMap.value[nextKey]?.shiftTime)

  if (previousHasShift && nextHasShift) {
    return {
      key: 'yellow',
      className: 'availability-yellow',
      label: 'Möglich',
      title: 'Möglich',
      message: 'Der Tag ist frei, liegt aber zwischen zwei geplanten Diensten.',
      tooltip: 'Frei, aber zwischen zwei Diensten – vor der Einreichung kurz prüfen.',
      icon: 'fa-solid fa-circle-exclamation'
    }
  }

  if (previousHasShift || nextHasShift) {
    return {
      key: 'yellow',
      className: 'availability-yellow',
      label: 'Möglich',
      title: 'Möglich',
      message: 'Der Tag ist aktuell frei. Ein angrenzender Dienst ist eingeplant.',
      tooltip: 'Aktuell frei – ein angrenzender Arbeitstag ist eingeplant.',
      icon: 'fa-solid fa-circle-check'
    }
  }

  return {
    key: 'green',
    className: 'availability-green',
    label: 'Gute Möglichkeit',
    title: 'Gute Möglichkeit',
    message: 'Aktuell ist kein Dienst und keine Überschneidung bekannt.',
    tooltip: 'Aktuell frei – nach dem derzeit geladenen Dienstplan eine gute Möglichkeit.',
    icon: 'fa-solid fa-circle-check'
  }
}

const smartCalendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days = []

  // Vorherige Monatstage
  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate())

    days.push({
      key,
      day: date.getDate(),
      inCurrentMonth: false,
      isToday: key === todayKey.value,
      availabilityClass: 'availability-muted',
      label: '',
      title: '',
      message: '',
      tooltip: '',
      icon: 'fa-solid fa-circle'
    })
  }

  // Aktueller Monat
  for (let day = 1; day <= daysInMonth; day++) {
    const key = toDateKey(year, month, day)
    const availability = getAvailability(key)

    days.push({
      key,
      day,
      inCurrentMonth: true,
      isToday: key === todayKey.value,
      availabilityClass: availability.className,
      label: availability.label,
      title: availability.title,
      message: availability.message,
      tooltip: availability.tooltip,
      icon: availability.icon
    })
  }

  // Rest bis vollständige Kalenderwoche
  while (days.length % 7 !== 0) {
    const nextIndex = days.length - startOffset + 1
    const date = new Date(year, month, daysInMonth + nextIndex)
    const key = toDateKey(date.getFullYear(), date.getMonth(), date.getDate())

    days.push({
      key,
      day: date.getDate(),
      inCurrentMonth: false,
      isToday: key === todayKey.value,
      availabilityClass: 'availability-muted',
      label: '',
      title: '',
      message: '',
      tooltip: '',
      icon: 'fa-solid fa-circle'
    })
  }

  return days
})

const selectedRangeDates = computed(() => {
  if (!newRequest.value.startDate || !newRequest.value.endDate) return []

  const start = parseDateKey(newRequest.value.startDate)
  const end = parseDateKey(newRequest.value.endDate)

  if (end < start) return []

  const dates = []

  for (
      const cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
  ) {
    dates.push(
        toDateKey(
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate()
        )
    )
  }

  return dates
})

const isDateInSelectedRange = (dateKey) => {
  return selectedRangeDates.value.includes(dateKey)
}

const selectedRangeDays = computed(() => {
  if (!newRequest.value.startDate) return []

  const start = parseDateKey(newRequest.value.startDate)
  const end = newRequest.value.endDate
      ? parseDateKey(newRequest.value.endDate)
      : start

  if (end < start) return []

  const result = []

  for (
      const cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
  ) {
    result.push(toDateKey(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate()
    ))
  }

  return result
})

const rangeResult = computed(() => {
  const dates = selectedRangeDays.value

  if (!dates.length) {
    return {
      className: 'availability-yellow',
      title: 'Zeitraum auswählen',
      message: 'Wähle noch das Enddatum aus.',
      label: 'PRÜFEN',
      icon: 'fa-solid fa-calendar'
    }
  }

  if (newRequest.value.type !== 'Erholungsurlaub') {
    return {
      className: 'availability-yellow',
      title: 'Zeitraum ausgewählt',
      message: 'Die Urlaubsampel gilt nur als Orientierung für Erholungsurlaub.',
      label: 'INFO',
      icon: 'fa-solid fa-circle-info'
    }
  }

  const states = dates.map(date => getAvailability(date).key)

  if (states.includes('red')) {
    return {
      className: 'availability-red',
      title: 'Zeitraum enthält einen roten Tag',
      message: 'Mindestens ein Tag ist nach dem aktuellen Dienstplan bereits belegt.',
      label: 'NICHT MÖGLICH',
      icon: 'fa-solid fa-ban'
    }
  }

  if (states.includes('orange')) {
    return {
      className: 'availability-orange',
      title: 'Zeitraum ist teilweise in Prüfung',
      message: 'Mindestens ein Tag hat bereits einen offenen Antrag.',
      label: 'PRÜFEN',
      icon: 'fa-solid fa-hourglass-half'
    }
  }

  if (states.includes('yellow')) {
    return {
      className: 'availability-yellow',
      title: 'Zeitraum grundsätzlich möglich',
      message: 'Der Zeitraum ist frei, enthält aber Tage, die vorher geprüft werden sollten.',
      label: 'MÖGLICH',
      icon: 'fa-solid fa-circle-exclamation'
    }
  }

  return {
    className: 'availability-green',
    title: 'Sehr gute Möglichkeit',
    message: 'Nach dem aktuell geladenen Dienstplan gibt es keine bekannte Überschneidung.',
    label: 'GUT',
    icon: 'fa-solid fa-circle-check'
  }
})

const canSubmit = computed(() => {
  if (!newRequest.value.type || !newRequest.value.startDate || !newRequest.value.endDate) {
    return false
  }

  if (newRequest.value.endDate < newRequest.value.startDate) {
    return false
  }

  // Nur Erholungsurlaub wird automatisch gegen die Smart-Ampel geprüft.
  // Andere Antragstypen können weiterhin eingereicht werden.
  if (newRequest.value.type === 'Erholungsurlaub') {
    return !selectedRangeDays.value.some(date => getAvailability(date).key === 'red')
  }

  return true
})

const selectCalendarDate = (day) => {
  if (!day.inCurrentMonth) return

  selectedCalendarDay.value = day

  if (!newRequest.value.startDate || newRequest.value.endDate) {
    newRequest.value.startDate = day.key
    newRequest.value.endDate = ''
    return
  }

  if (day.key < newRequest.value.startDate) {
    newRequest.value.endDate = newRequest.value.startDate
    newRequest.value.startDate = day.key
    return
  }

  newRequest.value.endDate = day.key
}

const onStartDateChange = () => {
  if (
      newRequest.value.endDate &&
      newRequest.value.endDate < newRequest.value.startDate
  ) {
    newRequest.value.endDate = ''
  }
}

const changeCalendarMonth = (delta) => {
  calendarMonth.value += delta

  if (calendarMonth.value > 11) {
    calendarMonth.value = 0
    calendarYear.value++
  }

  if (calendarMonth.value < 0) {
    calendarMonth.value = 11
    calendarYear.value--
  }

  selectedCalendarDay.value = null
}

const submitRequest = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!currentUserId.value) {
    errorMessage.value = 'Benutzer konnte nicht erkannt werden.'
    return
  }

  if (!newRequest.value.type || !newRequest.value.startDate || !newRequest.value.endDate) {
    errorMessage.value = 'Bitte alle Pflichtfelder ausfüllen.'
    return
  }

  if (newRequest.value.endDate < newRequest.value.startDate) {
    errorMessage.value = 'Das Enddatum darf nicht vor dem Startdatum liegen.'
    return
  }

  if (newRequest.value.type === 'Erholungsurlaub') {
    const blockedDate = selectedRangeDays.value.find(
        date => getAvailability(date).key === 'red'
    )

    if (blockedDate) {
      errorMessage.value = `Der ${formatDateForDisplay(blockedDate)} ist nach dem aktuellen Dienstplan rot markiert. Bitte wähle einen anderen Zeitraum.`
      return
    }
  }

  isSubmitting.value = true

  try {
    const { error } = await supabase
        .from('vacations')
        .insert([
          {
            user_id: currentUserId.value,
            type: newRequest.value.type,
            start_date: newRequest.value.startDate,
            end_date: newRequest.value.endDate,
            reason: newRequest.value.reason || '',
            status: 'pending'
          }
        ])
        .select()

    if (error) throw error

    successMessage.value = 'Dein Antrag wurde erfolgreich an die Verwaltung übermittelt.'

    newRequest.value = {
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    }

    selectedCalendarDay.value = null

    await Promise.all([
      fetchRequests(),
      fetchVacationDates()
    ])
  } catch (error) {
    console.error('Fehler beim Absenden:', error)
    errorMessage.value = 'Der Antrag konnte nicht gespeichert werden: ' + error.message
  } finally {
    isSubmitting.value = false
  }
}

const deleteRequest = async (id) => {
  const confirmed = window.confirm(
      'Möchtest du diesen Antrag wirklich zurückziehen/löschen?'
  )

  if (!confirmed) return

  errorMessage.value = ''

  try {
    const { error } = await supabase
        .from('vacations')
        .delete()
        .eq('id', id)

    if (error) throw error

    requests.value = requests.value.filter(req => req.id !== id)

    await fetchVacationDates()
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
    errorMessage.value = 'Der Antrag konnte nicht gelöscht werden.'
  }
}

const getStatusClass = (status) => {
  if (status === 'Genehmigt') return 'status-approved'
  if (status === 'Abgelehnt') return 'status-rejected'
  return 'status-pending'
}

const getStatusIcon = (status) => {
  if (status === 'Genehmigt') return 'fa-solid fa-check'
  if (status === 'Abgelehnt') return 'fa-solid fa-xmark'
  return 'fa-solid fa-hourglass-half'
}

const requestTypeClass = (type) => {
  if (type === 'Erholungsurlaub') return 'type-vacation'
  if (type === 'Zeitausgleich') return 'type-time'
  if (type === 'Diensttausch') return 'type-swap'
  return 'type-special'
}

const requestTypeIcon = (type) => {
  if (type === 'Erholungsurlaub') return 'fa-solid fa-umbrella-beach'
  if (type === 'Zeitausgleich') return 'fa-solid fa-clock'
  if (type === 'Diensttausch') return 'fa-solid fa-right-left'
  return 'fa-solid fa-file-circle-plus'
}

onMounted(async () => {
  initTheme()

  if (!loadCurrentUser()) return

  await Promise.all([
    fetchSchedules(),
    fetchVacationDates(),
    fetchRequests(),
    fetchNotifications()
  ])
})
</script>

<style scoped>
.requests-page {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  color: var(--text-main);
  font-family: "Manrope", "Inter", system-ui, sans-serif;
  padding-bottom: 36px;
}

.page-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.eyebrow,
.section-kicker {
  display: block;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.page-hero h1 {
  margin: 6px 0;
  color: var(--text-main);
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 850;
  letter-spacing: -.045em;
}

.page-hero p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.hero-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  border: 1px solid rgba(52, 211, 153, .14);
  border-radius: 13px;
  background: rgba(52, 211, 153, .045);
}

.hero-status strong,
.hero-status small {
  display: block;
}

.hero-status strong {
  color: var(--text-main);
  font-size: 10px;
}

.hero-status small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.status-dot {
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  border-radius: 8px;
  background: #34d399;
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.15);
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  margin-bottom: 14px;
  border-radius: 13px;
}

.alert > i {
  font-size: 16px;
}

.alert > div {
  min-width: 0;
  flex: 1;
}

.alert strong,
.alert span {
  display: block;
}

.alert strong {
  font-size: 11px;
}

.alert span {
  margin-top: 2px;
  font-size: 10px;
}

.alert button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.success-alert {
  border: 1px solid rgba(52, 211, 153, .18);
  color: #6ee7b7;
  background: rgba(52, 211, 153, .07);
}

.error-alert {
  border: 1px solid rgba(248, 113, 113, .18);
  color: #fca5a5;
  background: rgba(239, 68, 68, .07);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 14px;
  align-items: start;
}

.panel {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: 0 18px 50px rgba(0, 0, 0, .11);
}

.request-panel,
.smart-panel {
  padding: 20px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-heading.compact {
  margin-bottom: 0;
}

.heading-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.heading-icon.blue {
  color: #67e8f9;
  background: rgba(56, 189, 248, .08);
  border-color: rgba(56, 189, 248, .14);
}

.heading-icon.purple {
  color: #c4b5fd;
  background: rgba(167, 139, 250, .08);
  border-color: rgba(167, 139, 250, .14);
}

.heading-icon.green {
  color: #6ee7b7;
  background: rgba(52, 211, 153, .08);
  border-color: rgba(52, 211, 153, .14);
}

.panel-heading h2 {
  margin: 4px 0 2px;
  color: var(--text-main);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.035em;
}

.panel-heading p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.request-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 800;
}

.form-group label span {
  color: var(--text-muted);
  font-weight: 600;
}

.date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.select-wrap,
.input-wrap {
  position: relative;
}

.select-wrap > i,
.input-wrap > i {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 12px;
  pointer-events: none;
  z-index: 1;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  outline: none;
  color: var(--text-main);
  background: var(--bg-main);
  font-family: inherit;
  font-size: 14px;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.form-group input,
.form-group select {
  min-height: 46px;
  padding: 0 13px 0 38px;
}

.form-group textarea {
  min-height: 92px;
  padding: 12px 13px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: rgba(56, 189, 248, .45);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, .08);
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(.75);
  cursor: pointer;
}

.select-wrap select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #65758b 50%), linear-gradient(135deg, #65758b 50%, transparent 50%);
  background-position: calc(100% - 17px) 20px, calc(100% - 12px) 20px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 34px;
}

.selection-result,
.day-insight {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border-radius: 12px;
  border: 1px solid transparent;
}

.result-icon,
.insight-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 9px;
}

.result-copy,
.day-insight > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.result-copy strong,
.result-copy span,
.day-insight strong,
.day-insight span {
  display: block;
}

.result-copy strong,
.day-insight strong {
  font-size: 10px;
}

.result-copy span,
.day-insight span {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 9px;
  line-height: 1.45;
}

.result-label {
  flex: 0 0 auto;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .08em;
}

.availability-red {
  color: #f87171;
  background: rgba(239, 68, 68, .07);
  border-color: rgba(239, 68, 68, .16);
}

.availability-red .result-icon,
.availability-red .insight-icon {
  background: rgba(239, 68, 68, .1);
}

.availability-orange {
  color: #fb923c;
  background: rgba(249, 115, 22, .07);
  border-color: rgba(249, 115, 22, .16);
}

.availability-orange .result-icon,
.availability-orange .insight-icon {
  background: rgba(249, 115, 22, .1);
}

.availability-yellow {
  color: #facc15;
  background: rgba(250, 204, 21, .06);
  border-color: rgba(250, 204, 21, .15);
}

.availability-yellow .result-icon,
.availability-yellow .insight-icon {
  background: rgba(250, 204, 21, .08);
}

.availability-green {
  color: #34d399;
  background: rgba(52, 211, 153, .06);
  border-color: rgba(52, 211, 153, .15);
}

.availability-green .result-icon,
.availability-green .insight-icon {
  background: rgba(52, 211, 153, .08);
}

.submit-btn {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 11px;
  color: #06131b;
  background: linear-gradient(135deg, #67e8f9, #38bdf8);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  transition: transform .15s ease, filter .15s ease, opacity .15s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.submit-btn:disabled {
  opacity: .38;
  cursor: not-allowed;
}

.smart-heading {
  margin-bottom: 13px;
}

.smart-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 11px;
  margin-bottom: 12px;
  border: 1px solid rgba(167, 139, 250, .12);
  border-radius: 11px;
  background: rgba(167, 139, 250, .045);
  color: #77859a;
  font-size: 9px;
  line-height: 1.45;
}

.smart-note i {
  color: #a78bfa;
  margin-top: 1px;
}

.availability-legend {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 13px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 8px;
  border: 1px solid rgba(255,255,255,.055);
  border-radius: 10px;
  background: rgba(255,255,255,.018);
}

.legend-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.legend-item strong,
.legend-item small {
  display: block;
}

.legend-item strong {
  font-size: 8px;
}

.legend-item small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-item.red .legend-dot { background: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,.08); }
.legend-item.orange .legend-dot { background: #f97316; box-shadow: 0 0 0 4px rgba(249,115,22,.08); }
.legend-item.yellow .legend-dot { background: #facc15; box-shadow: 0 0 0 4px rgba(250,204,21,.08); }
.legend-item.green .legend-dot { background: #34d399; box-shadow: 0 0 0 4px rgba(52,211,153,.08); }

.legend-item.red strong { color: #f87171; }
.legend-item.orange strong { color: #fb923c; }
.legend-item.yellow strong { color: #facc15; }
.legend-item.green strong { color: #34d399; }

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.calendar-toolbar button {
  width: 31px;
  height: 31px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 9px;
  background: rgba(255,255,255,.025);
  color: #8290a4;
  cursor: pointer;
}

.calendar-toolbar button:hover {
  color: #67e8f9;
  border-color: rgba(56,189,248,.18);
}

.calendar-toolbar > div {
  text-align: center;
}

.calendar-toolbar strong,
.calendar-toolbar span {
  display: inline-block;
}

.calendar-toolbar strong {
  color: var(--text-main);
  font-size: 13px;
}

.calendar-toolbar span {
  margin-left: 5px;
  color: var(--text-muted);
  font-size: 11px;
}

.smart-calendar {
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 13px;
  overflow: hidden;
  background: rgba(6, 12, 21, .45);
}

.weekday-row,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.weekday-row {
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.weekday-row span {
  padding: 7px 2px;
  color: var(--text-muted);
  font-size: 7px;
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
}

.calendar-grid {
  gap: 1px;
  background: rgba(255,255,255,.04);
}

.smart-day {
  position: relative;
  min-height: 54px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 7px;
  border: 0;
  border-radius: 0;
  color: var(--text-main);
  background: var(--bg-card);
  cursor: pointer;
  transition: filter .15s ease, transform .15s ease;
}

.smart-day:hover:not(:disabled) {
  filter: brightness(1.15);
  z-index: 2;
}

.smart-day.muted {
  color: var(--text-muted);
  background: var(--bg-main);
  cursor: default;
}

.smart-day.today {
  box-shadow: inset 0 0 0 1px #67e8f9;
}

.smart-day.selectedStart,
.smart-day.selectedEnd {
  box-shadow: inset 0 0 0 2px #f8fafc;
  z-index: 3;
}

.smart-day.inRange:not(.selectedStart):not(.selectedEnd) {
  filter: brightness(1.13);
}

.smart-day .day-number {
  font-size: 10px;
  font-weight: 900;
}

.smart-day .availability-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  align-self: center;
}

.smart-day .today-text {
  align-self: flex-end;
  color: #67e8f9;
  font-size: 6px;
  font-weight: 900;
  text-transform: uppercase;
}

.smart-day.availability-red {
  color: #fca5a5;
  background: rgba(127, 29, 29, .46);
}

.smart-day.availability-orange {
  color: #fdba74;
  background: rgba(124, 45, 18, .40);
}

.smart-day.availability-yellow {
  color: #fde68a;
  background: rgba(113, 63, 18, .36);
}

.smart-day.availability-green {
  color: #86efac;
  background: rgba(6, 78, 59, .30);
}

.smart-day.availability-red .availability-dot { background: #ef4444; }
.smart-day.availability-orange .availability-dot { background: #f97316; }
.smart-day.availability-yellow .availability-dot { background: #facc15; }
.smart-day.availability-green .availability-dot { background: #34d399; }

.day-insight {
  margin-top: 10px;
}

.day-insight .insight-icon {
  color: currentColor;
}

.history-panel {
  margin-top: 14px;
  padding: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 15px;
}

.request-count {
  min-width: 65px;
  padding: 7px 10px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px;
  text-align: center;
  background: rgba(255,255,255,.02);
}

.request-count strong,
.request-count span {
  display: block;
}

.request-count strong {
  color: var(--text-main);
  font-size: 17px;
}

.request-count span {
  color: var(--text-muted);
  font-size: 7px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .1em;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px;
  border: 1px solid rgba(255,255,255,.055);
  border-radius: 12px;
  background: rgba(255,255,255,.018);
}

.request-type-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.type-vacation {
  color: #fbbf24;
  background: rgba(245,158,11,.08);
}

.type-time {
  color: #67e8f9;
  background: rgba(56,189,248,.08);
}

.type-swap {
  color: #c4b5fd;
  background: rgba(167,139,250,.08);
}

.type-special {
  color: #fda4af;
  background: rgba(244,63,94,.08);
}

.request-main {
  min-width: 0;
  flex: 1;
}

.request-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.request-title-row > strong {
  color: var(--text-main);
  font-size: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 7px;
  font-weight: 900;
  text-transform: uppercase;
}

.status-approved {
  color: #6ee7b7;
  background: rgba(34,197,94,.08);
  border: 1px solid rgba(34,197,94,.13);
}

.status-pending {
  color: #fbbf24;
  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.13);
}

.status-rejected {
  color: #fca5a5;
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.13);
}

.request-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.request-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 8px;
}

.request-meta i {
  color: var(--text-muted);
}

.delete-btn {
  width: 31px;
  height: 31px;
  flex: 0 0 auto;
  border: 1px solid rgba(239,68,68,.10);
  border-radius: 8px;
  color: var(--text-secondary);
  background: rgba(239,68,68,.035);
  cursor: pointer;
}

.delete-btn:hover {
  color: #f87171;
  border-color: rgba(239,68,68,.22);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  border: 1px dashed rgba(255,255,255,.08);
  border-radius: 13px;
  text-align: center;
}

.empty-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  margin-bottom: 9px;
  border-radius: 12px;
  color: var(--text-muted);
  background: rgba(255,255,255,.03);
}

.empty-state strong {
  color: var(--text-main);
  font-size: 11px;
}

.empty-state span {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .smart-panel {
    order: -1;
  }
}

@media (max-width: 700px) {
  .requests-page {
    padding-bottom: 22px;
  }

  .page-hero {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .hero-status {
    width: fit-content;
  }

  .request-panel,
  .smart-panel,
  .history-panel {
    padding: 15px;
    border-radius: 15px;
  }

  .date-fields {
    grid-template-columns: 1fr;
  }

  .availability-legend {
    grid-template-columns: repeat(2, 1fr);
  }

  .smart-day {
    min-height: 48px;
    padding: 6px;
  }

  .request-item {
    align-items: flex-start;
  }

  .request-meta {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 440px) {
  .page-hero h1 {
    font-size: 28px;
  }

  .panel-heading h2 {
    font-size: 16px;
  }

  .heading-icon {
    width: 38px;
    height: 38px;
  }

  .availability-legend {
    gap: 5px;
  }

  .legend-item {
    padding: 7px 6px;
  }

  .legend-item small {
    font-size: 6px;
  }

  .smart-day {
    min-height: 44px;
  }

  .smart-day .day-number {
    font-size: 9px;
  }

  .history-header {
    align-items: flex-start;
  }

  .request-count {
    min-width: 54px;
  }
}

/* -------------------------------------------------------
   LIGHT MODE
------------------------------------------------------- */

:global(html.light-theme) .requests-page {
  color: #172033;
}

:global(html.light-theme) .page-hero h1 {
  color: #0f172a;
}

:global(html.light-theme) .page-hero p {
  color: #667085;
}

:global(html.light-theme) .eyebrow,
:global(html.light-theme) .section-kicker {
  color: #64748b;
}

:global(html.light-theme) .hero-status {
  border-color: #d1fae5;
  background: #f0fdf7;
}

:global(html.light-theme) .hero-status strong {
  color: #166534;
}

:global(html.light-theme) .hero-status small {
  color: #64748b;
}

:global(html.light-theme) .panel {
  border-color: #e2e8f0;
  background: #ffffff;
  box-shadow: 0 14px 35px rgba(15,23,42,.06);
}

:global(html.light-theme) .panel-heading h2 {
  color: #0f172a;
}

:global(html.light-theme) .panel-heading p {
  color: #64748b;
}

:global(html.light-theme) .form-group label {
  color: #475569;
}

:global(html.light-theme) .form-group input,
:global(html.light-theme) .form-group select,
:global(html.light-theme) .form-group textarea {
  color: #172033;
  background: #f8fafc;
  border-color: #dbe2ea;
}

:global(html.light-theme) .form-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: none;
}

:global(html.light-theme) .smart-note {
  color: #64748b;
  background: #faf7ff;
  border-color: #e9d5ff;
}

:global(html.light-theme) .smart-calendar {
  background: #f8fafc;
  border-color: #e2e8f0;
}

:global(html.light-theme) .weekday-row {
  border-bottom-color: #e2e8f0;
}

:global(html.light-theme) .weekday-row span {
  color: #64748b;
}

:global(html.light-theme) .calendar-grid {
  background: #e2e8f0;
}

:global(html.light-theme) .smart-day {
  color: #334155;
  background: #ffffff;
}

:global(html.light-theme) .smart-day.muted {
  color: #cbd5e1;
  background: #f1f5f9;
}

:global(html.light-theme) .smart-day.availability-red {
  color: #b91c1c;
  background: #fef2f2;
}

:global(html.light-theme) .smart-day.availability-orange {
  color: #c2410c;
  background: #fff7ed;
}

:global(html.light-theme) .smart-day.availability-yellow {
  color: #a16207;
  background: #fefce8;
}

:global(html.light-theme) .smart-day.availability-green {
  color: #047857;
  background: #ecfdf5;
}

:global(html.light-theme) .calendar-toolbar button {
  color: #64748b;
  background: #f8fafc;
  border-color: #e2e8f0;
}

:global(html.light-theme) .calendar-toolbar strong {
  color: #0f172a;
}

:global(html.light-theme) .history-panel .request-item {
  border-color: #e2e8f0;
  background: #f8fafc;
}

:global(html.light-theme) .request-title-row > strong {
  color: #1e293b;
}

:global(html.light-theme) .request-meta span {
  color: #64748b;
}

:global(html.light-theme) .request-count {
  border-color: #e2e8f0;
  background: #f8fafc;
}

:global(html.light-theme) .request-count strong {
  color: #0f172a;
}

:global(html.light-theme) .empty-state {
  border-color: #dbe2ea;
}

:global(html.light-theme) .empty-state strong {
  color: #334155;
}

:global(html.light-theme) .empty-state span {
  color: #64748b;
}


/* =========================================================
   ZENTRALES THEME – App Store / src/style.css
   Diese View besitzt KEINE eigene Theme-Logik.
========================================================= */
.requests-page {
  color: var(--text-main);
}

.requests-page .panel,
.requests-page .request-item,
.requests-page .request-count,
.requests-page .empty-state,
.requests-page .smart-calendar,
.requests-page .calendar-toolbar button,
.requests-page .legend-item {
  border-color: var(--border-color);
}

.requests-page .panel {
  background: var(--bg-card);
}

.requests-page .request-item,
.requests-page .request-count,
.requests-page .legend-item {
  background: var(--bg-card-hover);
}

.requests-page .form-group input,
.requests-page .form-group select,
.requests-page .form-group textarea,
.requests-page .smart-calendar {
  background: var(--bg-main);
  color: var(--text-main);
}

.requests-page .page-hero h1,
.requests-page .panel-heading h2,
.requests-page .calendar-toolbar strong,
.requests-page .request-title-row > strong,
.requests-page .request-count strong,
.requests-page .empty-state strong {
  color: var(--text-main);
}

.requests-page .page-hero p,
.requests-page .panel-heading p,
.requests-page .form-group label,
.requests-page .request-meta span,
.requests-page .empty-state span,
.requests-page .legend-item small,
.requests-page .calendar-toolbar span,
.requests-page .weekday-row span {
  color: var(--text-secondary);
}

.requests-page .smart-day {
  color: var(--text-main);
  background: var(--bg-card);
}

.requests-page .smart-day.muted {
  color: var(--text-muted);
  background: var(--bg-card-hover);
}

.requests-page .calendar-grid {
  background: var(--border-color);
}

.requests-page .weekday-row,
.requests-page .smart-calendar {
  border-color: var(--border-color);
}

/* Light mode: Kalender bleibt hell und lesbar. Ampelfarben bleiben semantisch. */
:global(html.light-theme) .requests-page .smart-day.availability-red {
  color: #b91c1c;
  background: #fef2f2;
}
:global(html.light-theme) .requests-page .smart-day.availability-orange {
  color: #c2410c;
  background: #fff7ed;
}
:global(html.light-theme) .requests-page .smart-day.availability-yellow {
  color: #a16207;
  background: #fefce8;
}
:global(html.light-theme) .requests-page .smart-day.availability-green {
  color: #047857;
  background: #ecfdf5;
}

</style>
