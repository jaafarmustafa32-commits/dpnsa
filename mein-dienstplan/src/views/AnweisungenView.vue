<template>
  <AppShell
      :user-name="userName"
      :notifications="notifications"
      :unread-count="unreadNotifications.length"
      :is-light-mode="isLightMode"
      page-title="Anweisungen"
      @mark-read="markAsRead"
      @mark-all-read="markAllAsRead"
      @toggle-theme="toggleLightMode"
  >

    <main class="instructions-page">

      <!-- PAGE HEADER -->
      <section class="page-header">
        <div class="page-header-icon">
          <i class="fa-solid fa-file-lines"></i>
        </div>

        <div class="page-header-text">
          <span class="page-kicker">MITARBEITER PORTAL</span>
          <h1>Dienstanweisungen</h1>
          <p>
            Offizielle Richtlinien, Informationen und Dokumente vom Büro.
          </p>
        </div>
      </section>


      <!-- DOCUMENT CARD -->
      <section class="documents-card">

        <div class="documents-header">

          <div class="documents-title">
            <div class="documents-icon">
              <i class="fa-solid fa-folder-open"></i>
            </div>

            <div>
              <h2>Dokumente & Informationen</h2>
              <p>
                Hier findest du alle aktuellen Dienstanweisungen.
              </p>
            </div>
          </div>

          <div class="document-count" v-if="!loading">
            <i class="fa-solid fa-file"></i>
            {{ pdfDocuments.length }}
            {{ pdfDocuments.length === 1 ? 'Dokument' : 'Dokumente' }}
          </div>

        </div>


        <!-- LOADING -->
        <div
            v-if="loading"
            class="state-box"
        >
          <div class="loading-spinner">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
          </div>

          <strong>Dokumente werden geladen</strong>

          <span>
            Bitte einen Moment warten...
          </span>
        </div>


        <!-- DOCUMENT LIST -->
        <div
            v-else-if="pdfDocuments.length"
            class="documents-list"
        >

          <article
              v-for="doc in pdfDocuments"
              :key="doc.id"
              class="document-item"
          >

            <div class="document-main">

              <div class="document-file-icon">
                <i
                    class="fa-solid"
                    :class="doc.file_url
                    ? 'fa-file-pdf'
                    : 'fa-file-lines'"
                ></i>
              </div>

              <div class="document-info">

                <div class="document-title-row">
                  <h3>
                    {{ doc.title || 'Dienstanweisung' }}
                  </h3>

                  <span
                      v-if="doc.file_url"
                      class="file-type"
                  >
                    PDF
                  </span>

                  <span
                      v-else
                      class="message-type"
                  >
                    INFO
                  </span>
                </div>


                <p
                    v-if="doc.content"
                    class="document-content"
                >
                  {{ doc.content }}
                </p>


                <div class="document-meta">

                  <span>
                    <i class="fa-solid fa-user"></i>
                    {{ doc.sender || 'Admin' }}
                  </span>

                  <span class="meta-separator">
                    •
                  </span>

                  <span>
                    <i class="fa-regular fa-calendar"></i>
                    {{ formatDate(doc.created_at) }}
                  </span>

                </div>

              </div>

            </div>


            <!-- ACTION -->
            <div class="document-action">

              <a
                  v-if="doc.file_url"
                  :href="doc.file_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="document-button"
              >
                <i class="fa-solid fa-arrow-up-right-from-square"></i>

                <span>PDF öffnen</span>
              </a>

              <span
                  v-else
                  class="no-file"
              >
                <i class="fa-solid fa-circle-info"></i>
                Nur Information
              </span>

            </div>

          </article>

        </div>


        <!-- EMPTY -->
        <div
            v-else
            class="state-box empty-state"
        >
          <div class="empty-icon">
            <i class="fa-regular fa-folder-open"></i>
          </div>

          <strong>Keine Anweisungen vorhanden</strong>

          <span>
            Aktuell wurden keine Dienstanweisungen veröffentlicht.
          </span>
        </div>

      </section>

    </main>

  </AppShell>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted
} from 'vue'

import AppShell from '@/components/AppShell.vue'

import { supabase } from '@/config/supabase.js'


/* =========================================================
   USER
========================================================= */

const userName = ref('Mitarbeiter')


/* =========================================================
   THEME
   AppShell bleibt zentrale Stelle.
========================================================= */

const isLightMode = ref(false)

const toggleLightMode = () => {

  isLightMode.value = !isLightMode.value

  localStorage.setItem(
      'theme',
      isLightMode.value
          ? 'light'
          : 'dark'
  )

}


/* =========================================================
   DOCUMENTS
========================================================= */

const pdfDocuments = ref([])

const loading = ref(true)


/* =========================================================
   NOTIFICATIONS
========================================================= */

const notifications = ref([])


const unreadNotifications = computed(() => {

  return notifications.value.filter(
      notification =>
          !notification.read
  )

})


const markAsRead = (id) => {

  notifications.value =
      notifications.value.map(
          notification =>
              notification.id === id
                  ? {
                    ...notification,
                    read: true
                  }
                  : notification
      )

}


const markAllAsRead = () => {

  notifications.value =
      notifications.value.map(
          notification => ({
            ...notification,
            read: true
          })
      )

}


/* =========================================================
   LOAD USER
========================================================= */

const loadUser = () => {

  const userJson =
      localStorage.getItem('currentUser')

  if (!userJson) {
    return
  }

  try {

    const user =
        JSON.parse(userJson)

    if (
        user &&
        user.name
    ) {

      userName.value =
          user.name

    }

  } catch (error) {

    console.error(
        'Fehler beim Laden des Benutzers:',
        error
    )

  }

}


/* =========================================================
   LOAD THEME
========================================================= */

const loadTheme = () => {

  const savedTheme =
      localStorage.getItem('theme')

  isLightMode.value =
      savedTheme === 'light'

}


/* =========================================================
   LOAD DOCUMENTS
========================================================= */

const fetchAnnouncements =
    async () => {

      loading.value = true

      try {

        const {
          data,
          error
        } = await supabase
            .from('messages')
            .select('*')
            .order(
                'created_at',
                {
                  ascending: false
                }
            )


        if (error) {

          console.error(
              'Fehler beim Laden der Anweisungen:',
              error
          )

          pdfDocuments.value = []

          return

        }


        if (data) {

          pdfDocuments.value =
              data

        }

      } catch (error) {

        console.error(
            'Unerwarteter Fehler:',
            error
        )

        pdfDocuments.value = []

      } finally {

        loading.value = false

      }

    }


/* =========================================================
   DATE
========================================================= */

const formatDate = (
    dateString
) => {

  if (!dateString) {
    return '-'
  }

  const date =
      new Date(dateString)

  if (
      Number.isNaN(
          date.getTime()
      )
  ) {

    return '-'

  }

  return date.toLocaleDateString(
      'de-DE',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
  )

}


/* =========================================================
   INIT
========================================================= */

onMounted(
    async () => {

      loadUser()

      loadTheme()

      await fetchAnnouncements()

    }
)

</script>


<style scoped>

/* =========================================================
   PAGE
   Farben kommen zentral aus style.css
========================================================= */

.instructions-page {

  width: 100%;
  max-width: 1180px;

  margin: 0 auto;

  padding:
      28px
      24px
      40px;

  color: var(--text-main);

}


/* =========================================================
   PAGE HEADER
========================================================= */

.page-header {

  display: flex;

  align-items: center;

  gap: 16px;

  margin-bottom: 24px;

}


.page-header-icon {

  width: 54px;
  height: 54px;

  flex: 0 0 54px;

  display: grid;

  place-items: center;

  border-radius: 16px;

  background:
      color-mix(
          in srgb,
          var(--danger) 12%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--danger) 24%,
          var(--border-color)
      );

  color: var(--danger);

  font-size: 21px;

}


.page-header-text {

  min-width: 0;

}


.page-kicker {

  display: block;

  margin-bottom: 4px;

  color: var(--accent);

  font-size: 10px;

  font-weight: 800;

  letter-spacing: .14em;

}


.page-header h1 {

  margin: 0;

  color: var(--text-main);

  font-size: 26px;

  font-weight: 800;

  letter-spacing: -.035em;

}


.page-header p {

  margin: 5px 0 0;

  color: var(--text-secondary);

  font-size: 13px;

}


/* =========================================================
   MAIN CARD
========================================================= */

.documents-card {

  width: 100%;

  overflow: hidden;

  background: var(--bg-card);

  border:
      1px solid
      var(--border-color);

  border-radius: 22px;

  box-shadow: var(--shadow);

}


/* =========================================================
   CARD HEADER
========================================================= */

.documents-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 20px 22px;

  border-bottom:
      1px solid
      var(--border-color);

}


.documents-title {

  display: flex;

  align-items: center;

  gap: 13px;

  min-width: 0;

}


.documents-icon {

  width: 42px;
  height: 42px;

  flex: 0 0 42px;

  display: grid;

  place-items: center;

  border-radius: 12px;

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--accent) 20%,
          var(--border-color)
      );

  color: var(--accent);

}


.documents-title h2 {

  margin: 0;

  color: var(--text-main);

  font-size: 15px;

  font-weight: 750;

}


.documents-title p {

  margin: 3px 0 0;

  color: var(--text-secondary);

  font-size: 12px;

}


.document-count {

  display: inline-flex;

  align-items: center;

  gap: 7px;

  flex-shrink: 0;

  padding:
      7px
      10px;

  border-radius: 9px;

  background: var(--surface-soft);

  border:
      1px solid
      var(--border-color);

  color: var(--text-secondary);

  font-size: 11px;

  font-weight: 700;

}


/* =========================================================
   LIST
========================================================= */

.documents-list {

  display: flex;

  flex-direction: column;

}


/* =========================================================
   DOCUMENT
========================================================= */

.document-item {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding:
      18px
      22px;

  border-bottom:
      1px solid
      var(--border-color);

  transition:
      background-color .2s ease,
      border-color .2s ease;

}


.document-item:last-child {

  border-bottom: 0;

}


.document-item:hover {

  background:
      var(--bg-card-hover);

}


.document-main {

  display: flex;

  align-items: center;

  gap: 14px;

  min-width: 0;

  flex: 1;

}


/* =========================================================
   FILE ICON
========================================================= */

.document-file-icon {

  width: 46px;
  height: 46px;

  flex: 0 0 46px;

  display: grid;

  place-items: center;

  border-radius: 13px;

  background:
      color-mix(
          in srgb,
          var(--danger) 10%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--danger) 20%,
          var(--border-color)
      );

  color: var(--danger);

  font-size: 18px;

}


/* =========================================================
   INFO
========================================================= */

.document-info {

  min-width: 0;

  flex: 1;

}


.document-title-row {

  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 8px;

}


.document-title-row h3 {

  margin: 0;

  color: var(--text-main);

  font-size: 14px;

  font-weight: 750;

  line-height: 1.35;

}


.file-type,
.message-type {

  display: inline-flex;

  align-items: center;

  padding:
      3px
      7px;

  border-radius: 6px;

  font-size: 8px;

  font-weight: 850;

  letter-spacing: .06em;

}


.file-type {

  background:
      color-mix(
          in srgb,
          var(--danger) 10%,
          var(--bg-card)
      );

  color: var(--danger);

}


.message-type {

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          var(--bg-card)
      );

  color: var(--accent);

}


.document-content {

  margin:
      5px
      0
      4px;

  color: var(--text-secondary);

  font-size: 12px;

  line-height: 1.5;

  white-space: pre-line;

  word-break: break-word;

}


.document-meta {

  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 7px;

  color: var(--text-muted);

  font-size: 10px;

}


.document-meta span {

  display: inline-flex;

  align-items: center;

  gap: 5px;

}


.meta-separator {

  opacity: .5;

}


/* =========================================================
   BUTTON
========================================================= */

.document-action {

  flex-shrink: 0;

}


.document-button {

  min-height: 38px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding:
      0
      13px;

  border-radius: 10px;

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--accent) 24%,
          var(--border-color)
      );

  color: var(--accent);

  text-decoration: none;

  font-size: 11px;

  font-weight: 750;

  transition:
      background-color .2s ease,
      color .2s ease,
      border-color .2s ease,
      transform .15s ease;

}


.document-button:hover {

  background: var(--accent);

  border-color: var(--accent);

  color: #fff;

  transform: translateY(-1px);

}


.no-file {

  display: inline-flex;

  align-items: center;

  gap: 6px;

  padding:
      8px
      10px;

  border-radius: 8px;

  background: var(--surface-soft);

  border:
      1px solid
      var(--border-color);

  color: var(--text-muted);

  font-size: 10px;

  white-space: nowrap;

}


/* =========================================================
   STATES
========================================================= */

.state-box {

  min-height: 260px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding: 30px;

  text-align: center;

}


.state-box strong {

  color: var(--text-main);

  font-size: 14px;

}


.state-box span {

  color: var(--text-muted);

  font-size: 11px;

}


.loading-spinner {

  width: 44px;
  height: 44px;

  display: grid;

  place-items: center;

  margin-bottom: 5px;

  border-radius: 13px;

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          var(--bg-card)
      );

  color: var(--accent);

  font-size: 18px;

}


.empty-icon {

  width: 48px;
  height: 48px;

  display: grid;

  place-items: center;

  margin-bottom: 5px;

  border-radius: 14px;

  background: var(--surface-soft);

  border:
      1px solid
      var(--border-color);

  color: var(--text-muted);

  font-size: 19px;

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {

  .instructions-page {

    padding:
        18px
        12px
        30px;

  }


  .page-header {

    gap: 12px;

    margin-bottom: 17px;

  }


  .page-header-icon {

    width: 45px;
    height: 45px;

    flex-basis: 45px;

    border-radius: 13px;

    font-size: 17px;

  }


  .page-kicker {

    font-size: 8px;

  }


  .page-header h1 {

    font-size: 21px;

  }


  .page-header p {

    font-size: 11px;

  }


  .documents-card {

    border-radius: 17px;

  }


  .documents-header {

    align-items: flex-start;

    padding: 15px;

  }


  .documents-icon {

    width: 37px;
    height: 37px;

    flex-basis: 37px;

    border-radius: 10px;

  }


  .documents-title h2 {

    font-size: 13px;

  }


  .documents-title p {

    font-size: 10px;

  }


  .document-count {

    font-size: 9px;

    padding:
        6px
        8px;

  }


  .document-item {

    flex-direction: column;

    align-items: stretch;

    gap: 12px;

    padding: 14px;

  }


  .document-main {

    align-items: flex-start;

    gap: 11px;

  }


  .document-file-icon {

    width: 40px;
    height: 40px;

    flex-basis: 40px;

    border-radius: 11px;

    font-size: 16px;

  }


  .document-title-row h3 {

    font-size: 13px;

  }


  .document-content {

    font-size: 11px;

  }


  .document-meta {

    font-size: 9px;

  }


  .document-action {

    width: 100%;

  }


  .document-button,
  .no-file {

    width: 100%;

    min-height: 39px;

  }


  .state-box {

    min-height: 220px;

  }

}

</style>