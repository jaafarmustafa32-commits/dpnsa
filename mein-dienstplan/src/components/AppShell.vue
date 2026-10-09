<template>
  <div
      class="app-shell"
      :class="{ 'is-light': isLightMode }"
  >




    <!-- =====================================================
         SIDEBAR
    ====================================================== -->
    <aside
        class="sidebar"
        :class="{ open: mobileOpen }"
    >

      <!-- BRAND -->
      <div class="brand">

        <div class="brand-mark">
          <i class="fa-solid fa-calendar-days"></i>
        </div>

        <div class="brand-text">
          <strong>Dienstplan</strong>
          <span>Mitarbeiter Portal</span>
        </div>

        <!-- MOBILE CLOSE -->
        <button
            class="mobile-close"
            type="button"
            aria-label="Menü schließen"
            @click="closeMobile"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

      </div>


      <!-- =====================================================
           NAVIGATION
      ====================================================== -->
      <nav class="sidebar-navigation">

        <!-- ÜBERSICHT -->
        <div class="nav-group">

          <div class="nav-label">
            ÜBERSICHT
          </div>

          <router-link
              to="/home"
              class="side-link"
              @click="closeMobile"
          >
            <span class="side-icon">
              <i class="fa-solid fa-house"></i>
            </span>

            <span class="side-text">
              Dashboard
            </span>

            <i class="fa-solid fa-chevron-right side-arrow"></i>
          </router-link>


          <router-link
              to="/antraege"
              class="side-link"
              @click="closeMobile"
          >
            <span class="side-icon">
              <i class="fa-solid fa-file-pen"></i>
            </span>

            <span class="side-text">
              Anträge
            </span>

            <i class="fa-solid fa-chevron-right side-arrow"></i>
          </router-link>


          <router-link
              to="/anweisungen"
              class="side-link"
              @click="closeMobile"
          >
            <span class="side-icon">
              <i class="fa-solid fa-file-lines"></i>
            </span>

            <span class="side-text">
              Anweisungen
            </span>

            <i class="fa-solid fa-chevron-right side-arrow"></i>
          </router-link>

        </div>


        <!-- MEIN BEREICH -->
        <div class="nav-group">

          <div class="nav-label">
            MEIN BEREICH
          </div>

          <router-link
              to="/gehalt"
              class="side-link"
              @click="closeMobile"
          >
            <span class="side-icon">
              <i class="fa-solid fa-wallet"></i>
            </span>

            <span class="side-text">
              Gehalt
            </span>

            <i class="fa-solid fa-chevron-right side-arrow"></i>
          </router-link>


          <router-link
              to="/kontakt"
              class="side-link"
              @click="closeMobile"
          >
            <span class="side-icon">
              <i class="fa-solid fa-headset"></i>
            </span>

            <span class="side-text">
              Büro Kontakt
            </span>

            <i class="fa-solid fa-chevron-right side-arrow"></i>
          </router-link>

        </div>

      </nav>


      <!-- FLEX SPACE -->
      <div class="sidebar-spacer"></div>


      <!-- =====================================================
           SIDEBAR TOOLS
      ====================================================== -->
      <div class="sidebar-tools">

        <!-- NOTIFICATIONS -->
        <div
            ref="notificationRef"
            class="tool-wrapper"
        >

          <button
              type="button"
              class="tool-button"
              :class="{
              active: showNotifications || unreadCount > 0
            }"
              @click="toggleNotifications"
          >

            <span class="tool-icon notification-icon">

              <i class="fa-regular fa-bell"></i>

              <span
                  v-if="unreadCount > 0"
                  class="notification-count"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>

            </span>

            <span class="tool-text">
              Benachrichtigungen
            </span>

            <i
                class="fa-solid fa-chevron-right tool-arrow"
                :class="{ rotated: showNotifications }"
            ></i>

          </button>


          <!-- NOTIFICATION PANEL -->
          <div
              v-if="showNotifications"
              class="notification-popover"
          >

            <div class="popover-head">

              <div class="popover-title">

                <span>AKTIVITÄT</span>

                <strong>
                  Benachrichtigungen
                </strong>

              </div>

              <button
                  v-if="unreadCount > 0"
                  type="button"
                  @click="markAllAsRead"
              >
                Alle gelesen
              </button>

            </div>


            <div class="notification-list">

              <!-- EMPTY -->
              <div
                  v-if="!notifications.length"
                  class="empty-notification"
              >
                <div class="empty-icon">
                  <i class="fa-regular fa-bell-slash"></i>
                </div>

                <strong>
                  Keine Benachrichtigungen
                </strong>

                <span>
                  Du hast momentan keine neuen Nachrichten.
                </span>
              </div>


              <!-- NOTIFICATIONS -->
              <button
                  v-for="notification in notifications"
                  :key="notification.id"
                  type="button"
                  class="notification-row"
                  :class="{
                  unread: !notification.is_read
                }"
                  @click="markAsRead(notification.id)"
              >

                <span class="notification-status"></span>

                <span class="notification-copy">

                  <strong>
                    {{ notification.title }}
                  </strong>

                  <span>
                    {{ notification.message }}
                  </span>

                  <small>
                    {{ formatDate(notification.created_at) }}
                  </small>

                </span>

              </button>

            </div>

          </div>

        </div>


        <!-- =================================================
             THEME BUTTON
        ================================================== -->
        <button
            type="button"
            class="tool-button theme-button"
            @click="toggleTheme"
        >

          <span
              class="tool-icon theme-icon"
              :class="{
              light: isLightMode,
              dark: !isLightMode
            }"
          >

            <i
                class="fa-solid"
                :class="
                isLightMode
                  ? 'fa-moon'
                  : 'fa-sun'
              "
            ></i>

          </span>

          <span class="tool-text">
            {{ isLightMode ? 'Dark Mode' : 'Light Mode' }}
          </span>

          <span
              class="theme-toggle"
              :class="{ active: isLightMode }"
          >
            <span></span>
          </span>

        </button>

      </div>


      <!-- =====================================================
           USER
      ====================================================== -->
      <div class="sidebar-user">

        <router-link
            to="/profile"
            class="user-card"
            @click="closeMobile"
        >

          <div class="avatar">
            {{ initials }}
          </div>

          <div class="user-copy">

            <strong>
              {{ userName }}
            </strong>

            <span>
              Mitarbeiter
            </span>

          </div>

          <span class="user-arrow">
            <i class="fa-solid fa-chevron-right"></i>
          </span>

        </router-link>


        <!-- LOGOUT -->
        <button
            type="button"
            class="logout-link"
            @click="logout"
        >

          <span class="logout-icon">
            <i class="fa-solid fa-right-from-bracket"></i>
          </span>

          <span>
            Abmelden
          </span>

        </button>

      </div>

    </aside>


    <!-- =====================================================
         MAIN
    ====================================================== -->
    <section class="shell-main">

      <!-- MOBILE HEADER -->
      <header class="mobile-header">

        <button
            type="button"
            class="mobile-menu"
            aria-label="Menü öffnen"
            @click="mobileOpen = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>


        <div class="mobile-title">

          <span>
            MITARBEITER PORTAL
          </span>

          <strong>
            {{ pageTitle }}
          </strong>

        </div>


        <!-- MOBILE THEME -->
        <button
            type="button"
            class="mobile-theme"
            :aria-label="
            isLightMode
              ? 'Dark Mode aktivieren'
              : 'Light Mode aktivieren'
          "
            @click="toggleTheme"
        >

          <i
              class="fa-solid"
              :class="
              isLightMode
                ? 'fa-moon'
                : 'fa-sun'
            "
          ></i>

        </button>

      </header>


      <!-- PAGE -->
      <main class="shell-content">
        <slot></slot>
      </main>

    </section>

  </div>
</template>


<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.js'

/* =========================================================
   PROPS
========================================================= */

const props = defineProps({
  userName: {
    type: String,
    default: 'Mitarbeiter'
  },

  notifications: {
    type: Array,
    default: () => []
  },

  unreadCount: {
    type: Number,
    default: 0
  },

  pageTitle: {
    type: String,
    default: 'Mein Dienstplan'
  }
})

/* =========================================================
   EVENTS
========================================================= */

const emit = defineEmits([
  'mark-read',
  'mark-all-read'
])

/* =========================================================
   ROUTER
========================================================= */

const router = useRouter()

/* =========================================================
   ZENTRALER APP-STORE / THEME
========================================================= */

const {
  isLightMode,
  toggleTheme,
  initTheme
} = useAppStore()

/* =========================================================
   STATE
========================================================= */

const mobileOpen = ref(false)
const showNotifications = ref(false)
const notificationRef = ref(null)

/* =========================================================
   INITIALS
========================================================= */

const initials = computed(() => {
  const name = props.userName?.trim()

  if (!name) {
    return 'M'
  }

  return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('')
})

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

const closeMobile = () => {
  mobileOpen.value = false
}

const openMobile = () => {
  mobileOpen.value = true
}

const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const closeNotifications = () => {
  showNotifications.value = false
}

const markAsRead = (id) => {
  emit('mark-read', id)
}

const markAllAsRead = () => {
  emit('mark-all-read')
}

/* =========================================================
   OUTSIDE CLICK
========================================================= */

const handleOutsideClick = (event) => {
  if (
      notificationRef.value &&
      !notificationRef.value.contains(event.target)
  ) {
    showNotifications.value = false
  }
}

/* =========================================================
   DATE
========================================================= */

const formatDate = (dateString) => {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/* =========================================================
   LOGOUT
========================================================= */

const logout = () => {
  localStorage.removeItem('currentUser')

  /*
   * Das Theme bleibt absichtlich erhalten.
   * Es gehört zur gesamten App und nicht zum Benutzerkonto.
   */

  router.push('/')
}

/* =========================================================
   NAVIGATION
========================================================= */

const goTo = (path) => {
  mobileOpen.value = false
  showNotifications.value = false

  router.push(path)
}

/* =========================================================
   LIFECYCLE
========================================================= */

onMounted(() => {
  /*
   * Theme zentral initialisieren.
   * AppShell ist nur der sichtbare Controller.
   * Der eigentliche State liegt in stores/app.js.
   */
  initTheme()

  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>


<style scoped>

/* =========================================================
   BASE
========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}


.app-shell {

  --bg: #080d17;
  --sidebar: #0d1421;
  --surface: #111a29;
  --surface-hover: #172235;

  --text: #f4f7fb;
  --text-soft: #9aa8bb;
  --text-muted: #617086;

  --border: rgba(255,255,255,.075);

  --accent: #38bdf8;
  --accent-soft: rgba(56,189,248,.12);

  --danger: #f43f5e;

  min-height: 100vh;
  min-height: 100dvh;

  display: flex;

  background:
      radial-gradient(
          circle at 20% 0%,
          rgba(56,189,248,.055),
          transparent 28%
      ),
      var(--bg);

  color: var(--text);

  font-family:
      "Manrope",
      "Inter",
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

  transition:
      background .25s ease,
      color .25s ease;

}


/* =========================================================
   LIGHT THEME
========================================================= */

.app-shell.is-light {

  --bg: #f4f7fb;
  --sidebar: #ffffff;
  --surface: #ffffff;
  --surface-hover: #f4f7fb;

  --text: #152033;
  --text-soft: #66758a;
  --text-muted: #91a0b3;

  --border: #e4eaf1;

  --accent: #0284c7;
  --accent-soft: #e0f2fe;

}


/* =========================================================
   SIDEBAR
========================================================= */

.sidebar {

  position: fixed;

  inset:
      0 auto 0 0;

  z-index: 1400;

  width: 270px;

  display: flex;
  flex-direction: column;

  padding:
      18px 14px 14px;

  background:
      radial-gradient(
          circle at 20% 0%,
          rgba(56,189,248,.08),
          transparent 28%
      ),
      var(--sidebar);

  border-right:
      1px solid var(--border);

  transition:
      background .25s ease,
      border-color .25s ease,
      transform .25s ease;

}


/* =========================================================
   BRAND
========================================================= */

.brand {

  display: flex;
  align-items: center;

  gap: 11px;

  padding:
      5px 8px 25px;

}


.brand-mark {

  width: 43px;
  height: 43px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 13px;

  color: white;

  background:
      linear-gradient(
          135deg,
          #0ea5e9,
          #2563eb
      );

  box-shadow:
      0 8px 25px
      rgba(14,165,233,.22);

}


.brand-mark i {

  font-size: 17px;

}


.brand-text {

  min-width: 0;

}


.brand-text strong,
.brand-text span {

  display: block;

}


.brand-text strong {

  color: var(--text);

  font-size: 15px;
  font-weight: 800;

  letter-spacing: -.03em;

}


.brand-text span {

  margin-top: 3px;

  color: var(--text-muted);

  font-size: 10px;

}


.mobile-close {

  display: none;

}


/* =========================================================
   NAVIGATION
========================================================= */

.sidebar-navigation {

  display: flex;
  flex-direction: column;

  gap: 22px;

}


.nav-group {

  display: flex;
  flex-direction: column;

}


.nav-label {

  padding:
      7px 10px 9px;

  color: var(--text-muted);

  font-size: 9px;
  font-weight: 800;

  letter-spacing: .16em;

}


.side-link {

  min-height: 48px;

  display: flex;
  align-items: center;

  gap: 11px;

  margin: 2px 0;

  padding:
      0 10px;

  border:
      1px solid transparent;

  border-radius: 13px;

  color: var(--text-soft);

  font-size: 12px;
  font-weight: 700;

  text-decoration: none;

  transition:
      background .18s ease,
      color .18s ease,
      border-color .18s ease,
      transform .18s ease;

}


.side-link:hover {

  color: var(--text);

  background:
      var(--surface-hover);

  transform:
      translateX(2px);

}


.side-link.router-link-active {

  color: var(--text);

  background:
      linear-gradient(
          90deg,
          var(--accent-soft),
          transparent
      );

  border-color:
      color-mix(
          in srgb,
          var(--accent) 20%,
          transparent
      );

}


.side-icon {

  width: 32px;
  height: 32px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 9px;

  color: var(--text-muted);

  background:
      color-mix(
          in srgb,
          var(--text) 4%,
          transparent
      );

}


.side-link.router-link-active
.side-icon {

  color: var(--accent);

  background:
      var(--accent-soft);

}


.side-icon i {

  font-size: 13px;

}


.side-text {

  flex: 1;

}


.side-arrow {

  color: var(--text-muted);

  font-size: 8px;

  opacity: .6;

}


/* =========================================================
   SPACER
========================================================= */

.sidebar-spacer {

  flex: 1;

}


/* =========================================================
   TOOLS
========================================================= */

.sidebar-tools {

  display: flex;
  flex-direction: column;

  gap: 5px;

  margin-bottom: 10px;

  padding-top: 13px;

  border-top:
      1px solid var(--border);

}


.tool-wrapper {

  position: relative;

}


.tool-button {

  width: 100%;
  min-height: 46px;

  display: flex;
  align-items: center;

  gap: 10px;

  padding:
      0 10px;

  border:
      1px solid transparent;

  border-radius: 12px;

  color: var(--text-soft);

  background: transparent;

  font-family: inherit;

  font-size: 11px;
  font-weight: 700;

  text-align: left;

  cursor: pointer;

  transition:
      background .18s ease,
      color .18s ease,
      border-color .18s ease;

}


.tool-button:hover,
.tool-button.active {

  color: var(--text);

  background:
      var(--surface-hover);

  border-color:
      var(--border);

}


.tool-icon {

  position: relative;

  width: 32px;
  height: 32px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 9px;

  color: var(--text-soft);

  background:
      color-mix(
          in srgb,
          var(--text) 5%,
          transparent
      );

}


.tool-icon i {

  font-size: 13px;

}


.tool-button.active
.tool-icon {

  color: var(--accent);

  background:
      var(--accent-soft);

}


.tool-text {

  flex: 1;

}


.tool-arrow {

  color: var(--text-muted);

  font-size: 8px;

  transition:
      transform .2s ease;

}


.tool-arrow.rotated {

  transform:
      rotate(90deg);

}


/* =========================================================
   NOTIFICATION BADGE
========================================================= */

.notification-count {

  position: absolute;

  top: -5px;
  right: -5px;

  min-width: 17px;
  height: 17px;

  padding:
      0 4px;

  display: grid;
  place-items: center;

  border:
      2px solid var(--sidebar);

  border-radius: 999px;

  color: white;

  background:
      var(--danger);

  font-size: 8px;
  font-weight: 900;

}


/* =========================================================
   THEME ICON
========================================================= */

.theme-icon {

  transition:
      transform .25s ease;

}


.theme-icon.dark {

  color: #fbbf24;

  background:
      rgba(251,191,36,.10);

}


.theme-icon.light {

  color: #6366f1;

  background:
      rgba(99,102,241,.10);

}


/* =========================================================
   THEME SWITCH
========================================================= */

.theme-toggle {

  width: 34px;
  height: 19px;

  flex: 0 0 auto;

  padding: 2px;

  display: flex;
  align-items: center;

  border-radius: 999px;

  background:
      var(--text-muted);

  opacity: .45;

  transition:
      background .2s ease,
      opacity .2s ease;

}


.theme-toggle span {

  width: 15px;
  height: 15px;

  display: block;

  border-radius: 50%;

  background:
      white;

  box-shadow:
      0 1px 3px rgba(0,0,0,.25);

  transition:
      transform .2s ease;

}


.theme-toggle.active {

  background:
      var(--accent);

  opacity: 1;

}


.theme-toggle.active span {

  transform:
      translateX(15px);

}


/* =========================================================
   NOTIFICATION PANEL
========================================================= */

.notification-popover {

  position: absolute;

  left:
      calc(100% + 12px);

  bottom: 0;

  width: 370px;

  overflow: hidden;

  border:
      1px solid var(--border);

  border-radius: 17px;

  background:
      var(--surface);

  color:
      var(--text);

  box-shadow:
      0 25px 80px
      rgba(0,0,0,.35);

  animation:
      popoverIn .18s ease;

}


@keyframes popoverIn {

  from {
    opacity: 0;
    transform:
        translateY(6px);
  }

  to {
    opacity: 1;
    transform:
        translateY(0);
  }

}


.popover-head {

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding:
      16px;

  border-bottom:
      1px solid var(--border);

}


.popover-title span {

  display: block;

  color: var(--text-muted);

  font-size: 8px;
  font-weight: 800;

  letter-spacing: .15em;

}


.popover-title strong {

  display: block;

  margin-top: 4px;

  color: var(--text);

  font-size: 13px;

}


.popover-head button {

  border: 0;

  color: var(--accent);

  background: transparent;

  font-family: inherit;

  font-size: 10px;
  font-weight: 800;

  cursor: pointer;

}


.notification-list {

  max-height: 360px;

  overflow-y: auto;

}


.notification-row {

  width: 100%;

  display: flex;

  gap: 11px;

  padding:
      14px 16px;

  border: 0;

  border-bottom:
      1px solid var(--border);

  color: var(--text);

  background: transparent;

  text-align: left;

  cursor: pointer;

  transition:
      background .15s ease;

}


.notification-row:hover,
.notification-row.unread {

  background:
      var(--accent-soft);

}


.notification-status {

  width: 7px;
  height: 7px;

  flex: 0 0 auto;

  margin-top: 5px;

  border-radius: 50%;

  background:
      var(--text-muted);

}


.notification-row.unread
.notification-status {

  background:
      var(--accent);

  box-shadow:
      0 0 0 4px
      color-mix(
          in srgb,
          var(--accent) 12%,
          transparent
      );

}


.notification-copy {

  min-width: 0;

}


.notification-copy strong,
.notification-copy span,
.notification-copy small {

  display: block;

}


.notification-copy strong {

  color: var(--text);

  font-size: 11px;

}


.notification-copy span {

  margin-top: 4px;

  color: var(--text-soft);

  font-size: 10px;

  line-height: 1.45;

}


.notification-copy small {

  margin-top: 5px;

  color: var(--text-muted);

  font-size: 8px;

}


/* EMPTY */

.empty-notification {

  display: flex;
  flex-direction: column;

  align-items: center;

  gap: 6px;

  padding:
      38px 20px;

  text-align: center;

}


.empty-icon {

  width: 42px;
  height: 42px;

  margin-bottom: 5px;

  display: grid;
  place-items: center;

  border-radius: 12px;

  color: var(--text-muted);

  background:
      var(--surface-hover);

}


.empty-notification strong {

  color: var(--text);

  font-size: 11px;

}


.empty-notification span {

  color: var(--text-muted);

  font-size: 9px;

}


/* =========================================================
   USER
========================================================= */

.sidebar-user {

  padding-top: 12px;

  border-top:
      1px solid var(--border);

}


.user-card {

  display: flex;
  align-items: center;

  gap: 9px;

  padding:
      9px;

  border-radius: 12px;

  color: inherit;

  text-decoration: none;

  transition:
      background .18s ease;

}


.user-card:hover {

  background:
      var(--surface-hover);

}


.avatar {

  width: 37px;
  height: 37px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 11px;

  color: white;

  background:
      linear-gradient(
          135deg,
          #0ea5e9,
          #2563eb
      );

  font-size: 11px;
  font-weight: 800;

}


.user-copy {

  min-width: 0;

  flex: 1;

}


.user-copy strong,
.user-copy span {

  display: block;

}


.user-copy strong {

  overflow: hidden;

  color: var(--text);

  font-size: 11px;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.user-copy span {

  margin-top: 2px;

  color: var(--text-muted);

  font-size: 9px;

}


.user-arrow {

  color: var(--text-muted);

  font-size: 9px;

}


/* =========================================================
   LOGOUT
========================================================= */

.logout-link {

  width: 100%;
  min-height: 40px;

  display: flex;
  align-items: center;

  gap: 10px;

  margin-top: 3px;

  padding:
      0 10px;

  border: 0;

  border-radius: 10px;

  color: var(--text-soft);

  background: transparent;

  font-family: inherit;

  font-size: 11px;
  font-weight: 700;

  text-align: left;

  cursor: pointer;

  transition:
      color .18s ease,
      background .18s ease;

}


.logout-link:hover {

  color: #f43f5e;

  background:
      rgba(244,63,94,.08);

}


.logout-icon {

  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border-radius: 9px;

  background:
      color-mix(
          in srgb,
          var(--text) 4%,
          transparent
      );

}


/* =========================================================
   MAIN
========================================================= */

.shell-main {

  width:
      calc(100% - 270px);

  min-height: 100vh;
  min-height: 100dvh;

  margin-left: 270px;

}


.shell-content {

  width: 100%;

  min-height: 100vh;
  min-height: 100dvh;

  padding:
      28px 30px 45px;

}


/* =========================================================
   MOBILE HEADER
========================================================= */

.mobile-header {

  display: none;

}




/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {

  .sidebar {

    width: 245px;

  }

  .shell-main {

    width:
        calc(100% - 245px);

    margin-left: 245px;

  }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 760px) {

  .sidebar {

    width:
        min(292px, 88vw);

    transform:
        translateX(-105%);

    box-shadow:
        25px 0 70px
        rgba(0,0,0,.35);

  }


  .sidebar.open {

    transform:
        translateX(0);

  }


  .sidebar-backdrop {

    position: fixed;

    inset: 0;

    z-index: 1300;

    display: block;

    background:
        rgba(2,6,23,.62);

    backdrop-filter:
        blur(5px);

  }


  .shell-main {

    width: 100%;

    margin-left: 0;

  }


  /* MOBILE HEADER */

  .mobile-header {

    position: sticky;

    top: 0;

    z-index: 1200;

    min-height: 66px;

    display: flex;
    align-items: center;

    gap: 11px;

    padding:
        0 14px;

    background:
        color-mix(
            in srgb,
            var(--sidebar) 92%,
            transparent
        );

    border-bottom:
        1px solid var(--border);

    backdrop-filter:
        blur(18px);

  }


  .mobile-menu,
  .mobile-theme {

    width: 40px;
    height: 40px;

    flex: 0 0 auto;

    display: grid;
    place-items: center;

    border:
        1px solid var(--border);

    border-radius: 11px;

    color: var(--text);

    background:
        var(--surface);

    cursor: pointer;

    transition:
        background .18s ease,
        transform .18s ease;

  }


  .mobile-menu:hover,
  .mobile-theme:hover {

    background:
        var(--surface-hover);

  }


  .mobile-menu:active,
  .mobile-theme:active {

    transform:
        scale(.94);

  }


  .mobile-title {

    min-width: 0;

    flex: 1;

  }


  .mobile-title span,
  .mobile-title strong {

    display: block;

  }


  .mobile-title span {

    margin-bottom: 3px;

    color: var(--text-muted);

    font-size: 8px;

    font-weight: 800;

    letter-spacing: .15em;

  }


  .mobile-title strong {

    overflow: hidden;

    color: var(--text);

    font-size: 14px;

    text-overflow: ellipsis;

    white-space: nowrap;

  }


  .mobile-theme {

    color:
        var(--accent);

  }


  .mobile-close {

    width: 34px;
    height: 34px;

    flex: 0 0 auto;

    display: grid;
    place-items: center;

    margin-left: auto;

    border:
        1px solid var(--border);

    border-radius: 10px;

    color: var(--text-soft);

    background:
        var(--surface);

    cursor: pointer;

  }


  .shell-content {

    min-height:
        calc(100vh - 66px);

    padding:
        15px 12px 30px;

  }


  /* NOTIFICATION */

  .notification-popover {

    position: fixed;

    left: 12px;
    right: 12px;

    top: 72px;
    bottom: auto;

    width: auto;

    max-width: none;

  }

}


/* =========================================================
   SMALL PHONES
========================================================= */

@media (max-width: 390px) {

  .sidebar {

    width: 88vw;

  }


  .shell-content {

    padding-left: 9px;
    padding-right: 9px;

  }

}

</style>