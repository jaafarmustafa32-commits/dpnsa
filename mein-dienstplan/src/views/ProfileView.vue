<template>
  <AppShell
      :user-name="userName"
      :notifications="notifications"
      :unread-count="unreadNotifications.length"
      page-title="Mein Profil"
      @mark-read="markAsRead"
      @mark-all-read="markAllAsRead"
  >

    <div class="profile-page">

      <!-- =====================================================
           PAGE HEADER
      ===================================================== -->

      <header class="profile-page-header">

        <div class="header-left">

          <button
              type="button"
              class="back-button"
              @click="goHome"
          >
            <i class="fa-solid fa-arrow-left"></i>
            <span>Zurück zu Home</span>
          </button>

          <div class="page-title">





          </div>

        </div>

      </header>


      <!-- =====================================================
           PROFILE HERO
      ===================================================== -->

      <section class="profile-hero">

        <div class="profile-avatar">
          <i class="fa-solid fa-user"></i>
        </div>

        <div class="profile-identity">

          <span class="identity-label">
            MITARBEITER
          </span>

          <h2>
            {{ profileData.fullName || userName || 'Mitarbeiter' }}
          </h2>

          <p>
            <i class="fa-solid fa-at"></i>

            {{ profileData.username || 'Kein Benutzername' }}
          </p>

        </div>

        <div class="profile-status">
          <span class="status-dot"></span>
          Aktives Konto
        </div>

      </section>


      <!-- =====================================================
           MESSAGES
      ===================================================== -->

      <transition name="alert">

        <div
            v-if="successMessage"
            class="alert alert-success"
        >

          <div class="alert-icon">
            <i class="fa-solid fa-check"></i>
          </div>

          <div>
            <strong>Erfolgreich gespeichert</strong>
            <span>{{ successMessage }}</span>
          </div>

        </div>

      </transition>


      <transition name="alert">

        <div
            v-if="errorMessage"
            class="alert alert-error"
        >

          <div class="alert-icon">
            <i class="fa-solid fa-circle-exclamation"></i>
          </div>

          <div>
            <strong>Es ist ein Fehler aufgetreten</strong>
            <span>{{ errorMessage }}</span>
          </div>

        </div>

      </transition>


      <!-- =====================================================
           FORM
      ===================================================== -->

      <form
          class="profile-content"
          @submit.prevent="saveProfile"
      >

        <!-- ===================================================
             LEFT COLUMN
        =================================================== -->

        <div class="profile-column">


          <!-- =================================================
               ACCOUNT
          ================================================= -->

          <section class="profile-card">

            <div class="card-header">

              <div class="card-icon blue">
                <i class="fa-solid fa-user"></i>
              </div>

              <div>
                <h3>Persönliche Daten</h3>
                <p>
                  Deine grundlegenden Mitarbeiterdaten
                </p>
              </div>

            </div>


            <div class="form-grid">


              <div class="form-group full">

                <label>
                  Vollständiger Name
                </label>

                <div class="input-wrapper readonly">

                  <i class="fa-solid fa-user"></i>

                  <input
                      type="text"
                      v-model="profileData.fullName"
                      placeholder="Vor- und Nachname"
                  />

                </div>

              </div>


              <div class="form-group full">

                <label>
                  Benutzername
                </label>

                <div class="input-wrapper readonly">

                  <i class="fa-solid fa-at"></i>

                  <input
                      type="text"
                      v-model="profileData.username"
                      readonly
                  />

                  <span class="input-lock">
                    <i class="fa-solid fa-lock"></i>
                  </span>

                </div>

                <small>
                  Der Benutzername kann nicht geändert werden.
                </small>

              </div>


              <div class="form-group">

                <label>
                  Telefonnummer
                </label>

                <div class="input-wrapper">

                  <i class="fa-solid fa-phone"></i>

                  <input
                      type="tel"
                      v-model="profileData.phone"
                      placeholder="+43 ..."
                  />

                </div>

              </div>


              <div class="form-group">

                <label>
                  Personalnummer
                </label>

                <div class="input-wrapper readonly">

                  <i class="fa-solid fa-id-card"></i>

                  <input
                      type="text"
                      v-model="profileData.personalNumber"
                      readonly
                  />

                  <span class="input-lock">
                    <i class="fa-solid fa-lock"></i>
                  </span>

                </div>

              </div>


            </div>

          </section>


          <!-- =================================================
               ADDRESS
          ================================================= -->

          <section class="profile-card">

            <div class="card-header">

              <div class="card-icon green">
                <i class="fa-solid fa-location-dot"></i>
              </div>

              <div>
                <h3>Adresse</h3>
                <p>
                  Deine aktuelle Wohnadresse
                </p>
              </div>

            </div>


            <div class="form-grid">


              <div class="form-group full">

                <label>
                  Straße & Hausnummer
                </label>

                <div class="input-wrapper">

                  <i class="fa-solid fa-house"></i>

                  <input
                      type="text"
                      v-model="profileData.street"
                      placeholder="z. B. Hauptstraße 12"
                  />

                </div>

              </div>


              <div class="form-group">

                <label>
                  Postleitzahl
                </label>

                <div class="input-wrapper">

                  <i class="fa-solid fa-location-crosshairs"></i>

                  <input
                      type="text"
                      v-model="profileData.zip"
                      placeholder="1100"
                  />

                </div>

              </div>


              <div class="form-group">

                <label>
                  Ort
                </label>

                <div class="input-wrapper">

                  <i class="fa-solid fa-city"></i>

                  <input
                      type="text"
                      v-model="profileData.city"
                      placeholder="Wien"
                  />

                </div>

              </div>


            </div>

          </section>

        </div>


        <!-- ===================================================
             RIGHT COLUMN
        =================================================== -->

        <div class="profile-column">


          <!-- =================================================
               MELDEZETTEL
          ================================================= -->

          <section class="profile-card">

            <div class="card-header">

              <div class="card-icon purple">
                <i class="fa-solid fa-file-lines"></i>
              </div>

              <div>
                <h3>Meldezettel</h3>
                <p>
                  Aktuelles Dokument hinterlegen
                </p>
              </div>

            </div>


            <div class="document-box">

              <div class="document-preview">

                <i class="fa-solid fa-file-pdf"></i>

              </div>

              <div class="document-content">

                <strong>
                  Meldezettel
                </strong>

                <span>
                  PDF, JPG oder PNG
                </span>

              </div>

              <label class="upload-button">

                <i class="fa-solid fa-upload"></i>

                <span>
                  Datei auswählen
                </span>

                <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".pdf,.jpg,.jpeg,.png"
                />

              </label>

            </div>


            <div
                v-if="fileName"
                class="selected-file"
            >

              <div class="selected-file-icon">
                <i class="fa-solid fa-file"></i>
              </div>

              <div>

                <strong>
                  {{ fileName }}
                </strong>

                <span>
                  Ausgewählte Datei
                </span>

              </div>

              <i class="fa-solid fa-check"></i>

            </div>

          </section>


          <!-- =================================================
               SECURITY
          ================================================= -->

          <section class="profile-card">

            <div class="card-header">

              <div class="card-icon orange">
                <i class="fa-solid fa-shield-halved"></i>
              </div>

              <div>
                <h3>Sicherheit</h3>
                <p>
                  Passwort und Zugang schützen
                </p>
              </div>

            </div>


            <div class="security-info">

              <div class="security-icon">
                <i class="fa-solid fa-lock"></i>
              </div>

              <div>

                <strong>
                  Passwort ändern
                </strong>

                <span>
                  Lass alle Felder leer, wenn du dein
                  Passwort nicht ändern möchtest.
                </span>

              </div>

            </div>


            <div class="form-group">

              <label>
                Aktuelles Passwort
              </label>

              <div class="input-wrapper">

                <i class="fa-solid fa-lock"></i>

                <input
                    type="password"
                    v-model="profileData.oldPassword"
                    placeholder="••••••••"
                    autocomplete="current-password"
                />

              </div>

            </div>


            <div class="form-group">

              <label>
                Neues Passwort
              </label>

              <div class="input-wrapper">

                <i class="fa-solid fa-key"></i>

                <input
                    type="password"
                    v-model="profileData.newPassword"
                    placeholder="••••••••"
                    autocomplete="new-password"
                />

              </div>

            </div>


            <div class="form-group">

              <label>
                Neues Passwort bestätigen
              </label>

              <div class="input-wrapper">

                <i class="fa-solid fa-check-double"></i>

                <input
                    type="password"
                    v-model="profileData.confirmNewPassword"
                    placeholder="••••••••"
                    autocomplete="new-password"
                />

              </div>

            </div>

          </section>

        </div>


        <!-- ===================================================
             SAVE BAR
        =================================================== -->

        <div class="save-bar">

          <div class="save-info">

            <div class="save-info-icon">
              <i class="fa-solid fa-circle-info"></i>
            </div>

            <div>
              <strong>
                Änderungen speichern
              </strong>

              <span>
                Deine Änderungen werden direkt übernommen.
              </span>
            </div>

          </div>


          <div class="save-actions">

            <button
                type="button"
                class="cancel-button"
                @click="goHome"
            >
              Abbrechen
            </button>

            <button
                type="submit"
                class="save-button"
                :disabled="isLoading"
            >

              <i
                  class="fa-solid"
                  :class="
                  isLoading
                    ? 'fa-spinner fa-spin'
                    : 'fa-floppy-disk'
                "
              ></i>

              <span>
                {{
                  isLoading
                      ? 'Wird gespeichert...'
                      : 'Änderungen speichern'
                }}
              </span>

            </button>

          </div>

        </div>

      </form>

    </div>

  </AppShell>
</template>


<script setup>

import {
  ref,
  onMounted
} from 'vue'

import {
  useRouter
} from 'vue-router'

import AppShell from '@/components/AppShell.vue'

import {
  supabase
} from '@/config/supabase.js'


/* =========================================================
   ROUTER
========================================================= */

const router = useRouter()


/* =========================================================
   USER
========================================================= */

const userName = ref('Mitarbeiter')

const isAdmin = ref(false)


/* =========================================================
   NOTIFICATIONS
========================================================= */

const notifications = ref([])

const unreadNotifications = ref([])


const markAsRead = (notificationId) => {

  const notification =
      notifications.value.find(
          item => item.id === notificationId
      )

  if (notification) {
    notification.read = true
  }

  unreadNotifications.value =
      notifications.value.filter(
          item => !item.read
      )

}


const markAllAsRead = () => {

  notifications.value.forEach(
      notification => {
        notification.read = true
      }
  )

  unreadNotifications.value = []

}


/* =========================================================
   PROFILE DATA
========================================================= */

const profileData = ref({

  fullName: '',

  username: '',

  phone: '',

  personalNumber: '',

  street: '',

  zip: '',

  city: '',

  oldPassword: '',

  newPassword: '',

  confirmNewPassword: ''

})


/* =========================================================
   FILE
========================================================= */

const selectedFile = ref(null)

const fileName = ref('')


const handleFileUpload = (event) => {

  const file =
      event.target.files?.[0] || null

  selectedFile.value = file

  fileName.value =
      file?.name || ''

}


/* =========================================================
   STATUS
========================================================= */

const isLoading = ref(false)

const successMessage = ref('')

const errorMessage = ref('')


/* =========================================================
   LOAD USER
========================================================= */

const loadCurrentUser = async () => {

  const userJson =
      localStorage.getItem('currentUser')


  if (!userJson) {

    router.push('/login')

    return

  }


  try {

    const user =
        JSON.parse(userJson)


    userName.value =
        user?.name ||
        'Mitarbeiter'


    isAdmin.value =
        user?.role === 'admin'


    profileData.value = {

      ...profileData.value,

      fullName:
          user?.name || '',

      username:
          user?.username || '',

      phone:
          user?.phone || '',

      personalNumber:
          user?.personal_number ||
          user?.personalNumber ||
          '',

      street:
          user?.street || '',

      zip:
          user?.zip ||
          user?.plz ||
          '',

      city:
          user?.city || ''

    }


  } catch (error) {

    console.error(
        'Fehler beim Laden des Users:',
        error
    )

    localStorage.removeItem(
        'currentUser'
    )

    router.push('/login')

  }

}


/* =========================================================
   SAVE PROFILE
========================================================= */

const saveProfile = async () => {

  successMessage.value = ''

  errorMessage.value = ''

  isLoading.value = true


  try {

    if (
        profileData.value.newPassword &&
        profileData.value.newPassword !==
        profileData.value.confirmNewPassword
    ) {

      throw new Error(
          'Die neuen Passwörter stimmen nicht überein.'
      )

    }


    const userJson =
        localStorage.getItem('currentUser')


    if (!userJson) {

      router.push('/login')

      return

    }


    const currentUser =
        JSON.parse(userJson)


    /*
     * Die vorhandene Benutzerstruktur
     * wird aktualisiert.
     */

    const updatedUser = {

      ...currentUser,

      name:
      profileData.value.fullName,

      phone:
      profileData.value.phone,

      street:
      profileData.value.street,

      zip:
      profileData.value.zip,

      city:
      profileData.value.city

    }


    /*
     * Nur Passwort aktualisieren,
     * wenn eines eingegeben wurde.
     */

    if (
        profileData.value.newPassword
    ) {

      updatedUser.password =
          profileData.value.newPassword

    }


    /*
     * Bestehende lokale Session aktualisieren.
     */

    localStorage.setItem(
        'currentUser',
        JSON.stringify(updatedUser)
    )


    /*
     * Versuche auch die app_users
     * Tabelle zu aktualisieren.
     */

    if (currentUser.id) {

      const updateData = {

        name:
        profileData.value.fullName,

        phone:
        profileData.value.phone,

        street:
        profileData.value.street,

        zip:
        profileData.value.zip,

        city:
        profileData.value.city

      }


      if (
          profileData.value.newPassword
      ) {

        updateData.password =
            profileData.value.newPassword

      }


      const {
        error
      } = await supabase
          .from('app_users')
          .update(updateData)
          .eq(
              'id',
              currentUser.id
          )


      if (error) {

        console.warn(
            'Profil lokal gespeichert, Datenbank-Update:',
            error.message
        )

      }

    }


    /*
     * Felder zurücksetzen.
     */

    profileData.value.oldPassword = ''

    profileData.value.newPassword = ''

    profileData.value.confirmNewPassword = ''


    successMessage.value =
        'Deine Profiländerungen wurden gespeichert.'


  } catch (error) {

    console.error(
        'Fehler beim Speichern:',
        error
    )

    errorMessage.value =
        error?.message ||
        'Die Änderungen konnten nicht gespeichert werden.'


  } finally {

    isLoading.value = false

  }

}


/* =========================================================
   HOME
========================================================= */

const goHome = () => {

  router.push('/home')

}


/* =========================================================
   INIT
========================================================= */

onMounted(() => {

  loadCurrentUser()

})

</script>


<style scoped>

/* =========================================================
   PROFILE PAGE
   Farben ausschließlich aus style.css
========================================================= */

.profile-page {

  width: 100%;

  max-width: 1280px;

  margin: 0 auto;

  padding:
      28px 28px
      50px;

  color: var(--text-main);

  font-family:
      "Manrope",
      "Plus Jakarta Sans",
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

}


/* =========================================================
   HEADER
========================================================= */

.profile-page-header {

  margin-bottom: 22px;

}


.header-left {

  display: flex;

  flex-direction: column;

  gap: 22px;

}


.back-button {

  width: fit-content;

  display: inline-flex;

  align-items: center;

  gap: 8px;

  padding:
      9px 13px;

  border:
      1px solid
      var(--border-color);

  border-radius: 10px;

  background:
      var(--bg-card);

  color:
      var(--text-secondary);

  font-family: inherit;

  font-size: 0.8rem;

  font-weight: 700;

  cursor: pointer;

  transition:
      background-color .2s ease,
      color .2s ease,
      border-color .2s ease,
      transform .2s ease;

}


.back-button:hover {

  background:
      var(--bg-card-hover);

  color:
      var(--text-main);

  border-color:
      var(--accent);

  transform:
      translateX(-2px);

}


.back-button i {

  color:
      var(--accent);

}


/* =========================================================
   TITLE
========================================================= */

.page-title {

  display: flex;

  align-items: center;

  gap: 15px;

}


.title-icon {

  width: 54px;

  height: 54px;

  flex: 0 0 54px;

  display: grid;

  place-items: center;

  border-radius: 15px;

  background:
      color-mix(
          in srgb,
          var(--accent) 12%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--accent) 28%,
          var(--border-color)
      );

  color:
      var(--accent);

  font-size: 20px;

}


.eyebrow {

  display: block;

  margin-bottom: 4px;

  color:
      var(--accent);

  font-size: 9px;

  font-weight: 850;

  letter-spacing:
      .15em;

}


.page-title h1 {

  margin: 0;

  color:
      var(--text-main);

  font-size: 27px;

  line-height: 1.1;

  font-weight: 850;

  letter-spacing:
      -.04em;

}


.page-title p {

  margin:
      5px 0 0;

  color:
      var(--text-muted);

  font-size: 11px;

}


/* =========================================================
   PROFILE HERO
========================================================= */

.profile-hero {

  display: flex;

  align-items: center;

  gap: 15px;

  margin-bottom: 18px;

  padding:
      18px;

  background:
      linear-gradient(
          145deg,
          var(--bg-card),
          var(--surface-soft)
      );

  border:
      1px solid
      var(--border-color);

  border-radius: 17px;

  box-shadow:
      var(--shadow);

}


.profile-avatar {

  width: 62px;

  height: 62px;

  flex: 0 0 62px;

  display: grid;

  place-items: center;

  border-radius: 17px;

  background:
      var(--accent);

  color:
      #ffffff;

  font-size: 23px;

  box-shadow:
      0 10px 25px
      color-mix(
          in srgb,
          var(--accent) 22%,
          transparent
      );

}


.profile-identity {

  min-width: 0;

  flex: 1;

}


.identity-label {

  display: block;

  color:
      var(--text-muted);

  font-size: 8px;

  font-weight: 850;

  letter-spacing:
      .14em;

}


.profile-identity h2 {

  margin:
      4px 0 5px;

  color:
      var(--text-main);

  font-size: 19px;

  font-weight: 850;

}


.profile-identity p {

  margin: 0;

  display: flex;

  align-items: center;

  gap: 6px;

  color:
      var(--text-muted);

  font-size: 10px;

}


.profile-identity p i {

  color:
      var(--accent);

}


.profile-status {

  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding:
      7px 10px;

  border-radius: 999px;

  background:
      color-mix(
          in srgb,
          var(--success) 9%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--success) 25%,
          var(--border-color)
      );

  color:
      var(--success);

  font-size: 9px;

  font-weight: 750;

}


.status-dot {

  width: 6px;

  height: 6px;

  border-radius: 50%;

  background:
      var(--success);

}


/* =========================================================
   ALERT
========================================================= */

.alert {

  display: flex;

  align-items: center;

  gap: 11px;

  margin-bottom: 16px;

  padding:
      12px 14px;

  border-radius: 12px;

  border:
      1px solid
      var(--border-color);

}


.alert-icon {

  width: 30px;

  height: 30px;

  flex: 0 0 30px;

  display: grid;

  place-items: center;

  border-radius: 9px;

}


.alert strong,
.alert span {

  display: block;

}


.alert strong {

  margin-bottom: 2px;

  color:
      var(--text-main);

  font-size: 10px;

  font-weight: 800;

}


.alert span {

  color:
      var(--text-secondary);

  font-size: 9px;

}


.alert-success {

  background:
      color-mix(
          in srgb,
          var(--success) 8%,
          var(--bg-card)
      );

  border-color:
      color-mix(
          in srgb,
          var(--success) 25%,
          var(--border-color)
      );

}


.alert-success .alert-icon {

  background:
      color-mix(
          in srgb,
          var(--success) 14%,
          transparent
      );

  color:
      var(--success);

}


.alert-error {

  background:
      color-mix(
          in srgb,
          var(--danger) 8%,
          var(--bg-card)
      );

  border-color:
      color-mix(
          in srgb,
          var(--danger) 25%,
          var(--border-color)
      );

}


.alert-error .alert-icon {

  background:
      color-mix(
          in srgb,
          var(--danger) 14%,
          transparent
      );

  color:
      var(--danger);

}


/* =========================================================
   CONTENT GRID
========================================================= */

.profile-content {

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);

  gap: 16px;

}


.profile-column {

  display: flex;

  flex-direction: column;

  gap: 16px;

}


/* =========================================================
   CARD
========================================================= */

.profile-card {

  padding: 19px;

  background:
      var(--bg-card);

  border:
      1px solid
      var(--border-color);

  border-radius: 16px;

  box-shadow:
      var(--shadow);

  transition:
      background-color .25s ease,
      border-color .25s ease;

}


.profile-card:hover {

  border-color:
      color-mix(
          in srgb,
          var(--accent) 18%,
          var(--border-color)
      );

}


/* =========================================================
   CARD HEADER
========================================================= */

.card-header {

  display: flex;

  align-items: center;

  gap: 11px;

  margin-bottom: 18px;

}


.card-icon {

  width: 38px;

  height: 38px;

  flex: 0 0 38px;

  display: grid;

  place-items: center;

  border-radius: 11px;

  font-size: 14px;

}


.card-icon.blue {

  color:
      var(--accent);

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          var(--bg-card)
      );

}


.card-icon.green {

  color:
      var(--success);

  background:
      color-mix(
          in srgb,
          var(--success) 10%,
          var(--bg-card)
      );

}


.card-icon.purple {

  color:
      #a78bfa;

  background:
      color-mix(
          in srgb,
          #a78bfa 10%,
          var(--bg-card)
      );

}


.card-icon.orange {

  color:
      var(--warning);

  background:
      color-mix(
          in srgb,
          var(--warning) 10%,
          var(--bg-card)
      );

}


.card-header h3 {

  margin: 0;

  color:
      var(--text-main);

  font-size: 12px;

  font-weight: 800;

}


.card-header p {

  margin:
      3px 0 0;

  color:
      var(--text-muted);

  font-size: 9px;

}


/* =========================================================
   FORM
========================================================= */

.form-grid {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 13px;

}


.form-group {

  display: flex;

  flex-direction: column;

  min-width: 0;

}


.form-group.full {

  grid-column:
      1 / -1;

}


.form-group label {

  margin-bottom: 6px;

  color:
      var(--text-secondary);

  font-size: 9px;

  font-weight: 700;

}


.form-group small {

  margin-top: 5px;

  color:
      var(--text-muted);

  font-size: 8px;

}


/* =========================================================
   INPUT
========================================================= */

.input-wrapper {

  position: relative;

  display: flex;

  align-items: center;

}


.input-wrapper > i {

  position: absolute;

  left: 12px;

  z-index: 2;

  color:
      var(--text-muted);

  font-size: 11px;

  pointer-events: none;

}


.input-wrapper input {

  width: 100%;

  height: 43px;

  padding:
      0 38px 0 35px;

  background:
      var(--input-bg);

  color:
      var(--text-main);

  border:
      1px solid
      var(--border-color);

  border-radius: 10px;

  outline: none;

  font-family: inherit;

  font-size: 12px;

  transition:
      background-color .2s ease,
      border-color .2s ease,
      color .2s ease,
      box-shadow .2s ease;

}


.input-wrapper input::placeholder {

  color:
      var(--text-muted);

}


.input-wrapper input:focus {

  border-color:
      var(--accent);

  box-shadow:
      0 0 0 3px
      color-mix(
          in srgb,
          var(--accent) 12%,
          transparent
      );

}


.input-wrapper.readonly input {

  background:
      var(--surface-soft);

  color:
      var(--text-muted);

  cursor:
      not-allowed;

}


.input-lock {

  position: absolute;

  right: 11px;

  color:
      var(--text-muted);

  font-size: 9px;

}


/* =========================================================
   DOCUMENT
========================================================= */

.document-box {

  display: flex;

  align-items: center;

  gap: 11px;

  padding: 12px;

  background:
      var(--surface-soft);

  border:
      1px solid
      var(--border-color);

  border-radius: 12px;

}


.document-preview {

  width: 38px;

  height: 43px;

  flex: 0 0 38px;

  display: grid;

  place-items: center;

  border-radius: 9px;

  color:
      var(--danger);

  background:
      color-mix(
          in srgb,
          var(--danger) 10%,
          var(--bg-card)
      );

  font-size: 16px;

}


.document-content {

  min-width: 0;

  flex: 1;

}


.document-content strong,
.document-content span {

  display: block;

}


.document-content strong {

  color:
      var(--text-main);

  font-size: 10px;

}


.document-content span {

  margin-top: 3px;

  color:
      var(--text-muted);

  font-size: 8px;

}


.upload-button {

  display: inline-flex;

  align-items: center;

  gap: 6px;

  padding:
      8px 10px;

  border:
      1px solid
      var(--border-color);

  border-radius: 8px;

  background:
      var(--bg-card);

  color:
      var(--accent);

  font-size: 8px;

  font-weight: 750;

  cursor: pointer;

  transition:
      background-color .2s ease,
      border-color .2s ease;

}


.upload-button:hover {

  background:
      var(--bg-card-hover);

  border-color:
      var(--accent);

}


.upload-button input {

  display: none;

}


.selected-file {

  display: flex;

  align-items: center;

  gap: 9px;

  margin-top: 10px;

  padding: 9px 10px;

  background:
      color-mix(
          in srgb,
          var(--success) 7%,
          var(--bg-card)
      );

  border:
      1px solid
      color-mix(
          in srgb,
          var(--success) 20%,
          var(--border-color)
      );

  border-radius: 9px;

}


.selected-file-icon {

  color:
      var(--success);

}


.selected-file > div {

  min-width: 0;

  flex: 1;

}


.selected-file strong,
.selected-file span {

  display: block;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}


.selected-file strong {

  color:
      var(--text-main);

  font-size: 9px;

}


.selected-file span {

  margin-top: 2px;

  color:
      var(--text-muted);

  font-size: 8px;

}


.selected-file > i {

  color:
      var(--success);

  font-size: 10px;

}


/* =========================================================
   SECURITY
========================================================= */

.security-info {

  display: flex;

  align-items: flex-start;

  gap: 9px;

  margin-bottom: 15px;

  padding: 10px;

  border:
      1px solid
      var(--border-color);

  border-radius: 10px;

  background:
      var(--surface-soft);

}


.security-icon {

  width: 29px;

  height: 29px;

  flex: 0 0 29px;

  display: grid;

  place-items: center;

  border-radius: 8px;

  color:
      var(--warning);

  background:
      color-mix(
          in srgb,
          var(--warning) 10%,
          var(--bg-card)
      );

}


.security-info strong,
.security-info span {

  display: block;

}


.security-info strong {

  color:
      var(--text-main);

  font-size: 9px;

}


.security-info span {

  margin-top: 3px;

  color:
      var(--text-muted);

  font-size: 8px;

  line-height: 1.45;

}


/* =========================================================
   SAVE BAR
========================================================= */

.save-bar {

  grid-column:
      1 / -1;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  padding:
      14px 16px;

  background:
      var(--bg-card);

  border:
      1px solid
      var(--border-color);

  border-radius: 14px;

  box-shadow:
      var(--shadow);

}


.save-info {

  display: flex;

  align-items: center;

  gap: 9px;

}


.save-info-icon {

  color:
      var(--accent);

}


.save-info strong,
.save-info span {

  display: block;

}


.save-info strong {

  color:
      var(--text-main);

  font-size: 9px;

}


.save-info span {

  margin-top: 2px;

  color:
      var(--text-muted);

  font-size: 8px;

}


.save-actions {

  display: flex;

  align-items: center;

  gap: 8px;

}


.cancel-button,
.save-button {

  min-height: 38px;

  padding:
      0 14px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  border-radius: 9px;

  font-family: inherit;

  font-size: 9px;

  font-weight: 750;

  cursor: pointer;

  transition:
      background-color .2s ease,
      border-color .2s ease,
      color .2s ease,
      transform .2s ease;

}


.cancel-button {

  background:
      var(--surface-soft);

  color:
      var(--text-secondary);

  border:
      1px solid
      var(--border-color);

}


.cancel-button:hover {

  background:
      var(--bg-card-hover);

  color:
      var(--text-main);

}


.save-button {

  background:
      var(--accent);

  color:
      #ffffff;

  border:
      1px solid
      var(--accent);

  box-shadow:
      0 8px 20px
      color-mix(
          in srgb,
          var(--accent) 20%,
          transparent
      );

}


.save-button:hover:not(:disabled) {

  background:
      var(--accent-hover);

  border-color:
      var(--accent-hover);

  transform:
      translateY(-1px);

}


.save-button:disabled {

  opacity: .6;

  cursor:
      not-allowed;

}


/* =========================================================
   ALERT ANIMATION
========================================================= */

.alert-enter-active,
.alert-leave-active {

  transition:
      opacity .2s ease,
      transform .2s ease;

}


.alert-enter-from,
.alert-leave-to {

  opacity: 0;

  transform:
      translateY(-5px);

}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {

  .profile-content {

    grid-template-columns:
      1fr;

  }

  .save-bar {

    grid-column:
        auto;

  }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {

  .profile-page {

    padding:
        17px 11px
        35px;

  }


  .profile-page-header {

    margin-bottom: 15px;

  }


  .header-left {

    gap: 15px;

  }


  .back-button {

    padding:
        8px 10px;

    font-size: 9px;

  }


  .page-title {

    gap: 10px;

  }


  .title-icon {

    width: 43px;

    height: 43px;

    flex-basis: 43px;

    border-radius: 12px;

    font-size: 16px;

  }


  .page-title h1 {

    font-size: 21px;

  }


  .page-title p {

    font-size: 9px;

  }


  .profile-hero {

    padding: 13px;

    border-radius: 14px;

  }


  .profile-avatar {

    width: 50px;

    height: 50px;

    flex-basis: 50px;

    border-radius: 14px;

    font-size: 18px;

  }


  .profile-identity h2 {

    font-size: 15px;

  }


  .profile-status {

    padding:
        5px 7px;

    font-size: 7px;

  }


  .profile-content {

    gap: 11px;

  }


  .profile-column {

    gap: 11px;

  }


  .profile-card {

    padding: 14px;

    border-radius: 13px;

  }


  .card-header {

    margin-bottom: 14px;

  }


  .form-grid {

    grid-template-columns:
      1fr;

    gap: 11px;

  }


  .form-group.full {

    grid-column:
        auto;

  }


  .document-box {

    flex-wrap: wrap;

  }


  .document-content {

    min-width:
        calc(100% - 60px);

  }


  .upload-button {

    width: 100%;

    justify-content: center;

  }


  .save-bar {

    flex-direction: column;

    align-items: stretch;

    padding: 12px;

  }


  .save-info {

    align-items: flex-start;

  }


  .save-actions {

    width: 100%;

  }


  .cancel-button,
  .save-button {

    flex: 1;

  }

}


/* =========================================================
   SMALL PHONE
========================================================= */

@media (max-width: 420px) {

  .profile-page {

    padding-left: 9px;

    padding-right: 9px;

  }


  .profile-hero {

    align-items: flex-start;

  }


  .profile-status {

    display: none;

  }


  .page-title p {

    display: none;

  }


  .profile-card {

    padding: 13px;

  }


  .input-wrapper input {

    height: 42px;

    font-size: 16px;

  }


  .save-actions {

    gap: 6px;

  }


  .cancel-button,
  .save-button {

    padding:
        0 9px;

    font-size: 8px;

  }

}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  * {

    transition: none !important;

    animation: none !important;

  }

}

</style>