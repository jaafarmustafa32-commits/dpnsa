
<template>
  <AppShell
      :user-name="userName"
      :notifications="notifications"
      :unread-count="unreadNotifications.length"
      page-title="Gehaltsabrechnungen"
      @mark-read="markAsRead"
      @mark-all-read="markAllAsRead"
  >

    <div class="salary-page">

      <!-- HEADER -->
      <section class="page-heading">

        <div class="heading-left">

          <div class="page-icon">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>

          <div>
            <span class="eyebrow">
              MITARBEITERPORTAL
            </span>

            <h1>
              Gehaltsabrechnungen
            </h1>

            <p>
              Ihre monatlichen Lohnzettel und Auszahlungen.
            </p>
          </div>

        </div>

        <div class="heading-actions">

          <button
              class="refresh-button"
              :class="{ spinning: loading }"
              @click="fetchSalaries"
              :disabled="loading"
          >
            <i class="fa-solid fa-rotate-right"></i>
            <span>Aktualisieren</span>
          </button>

        </div>

      </section>


      <!-- ADMIN UPLOAD -->
      <section
          v-if="isAdmin"
          class="upload-card"
      >

        <div class="card-header">

          <div class="card-title">

            <div class="card-icon blue">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>

            <div>
              <h2>
                Lohnzettel hochladen
              </h2>

              <p>
                Neue Gehaltsabrechnung für Mitarbeiter hinterlegen.
              </p>
            </div>

          </div>

          <span class="admin-badge">
            <i class="fa-solid fa-shield-halved"></i>
            ADMIN
          </span>

        </div>


        <form
            class="upload-form"
            @submit.prevent="uploadSalaryPdf"
        >

          <div class="form-grid">

            <!-- Monat -->
            <div class="form-group">

              <label>
                Monat
              </label>

              <div class="input-container">

                <i class="fa-regular fa-calendar"></i>

                <select
                    v-model="newSalary.month"
                    required
                >

                  <option
                      value=""
                      disabled
                  >
                    Monat wählen
                  </option>

                  <option
                      v-for="month in months"
                      :key="month"
                      :value="month"
                  >
                    {{ month }}
                  </option>

                </select>

              </div>

            </div>


            <!-- Jahr -->
            <div class="form-group">

              <label>
                Jahr
              </label>

              <div class="input-container">

                <i class="fa-regular fa-calendar-days"></i>

                <input
                    v-model="newSalary.year"
                    type="number"
                    required
                />

              </div>

            </div>


            <!-- Netto -->
            <div class="form-group">

              <label>
                Netto
              </label>

              <div class="input-container">

                <i class="fa-solid fa-euro-sign"></i>

                <input
                    v-model="newSalary.netto"
                    type="text"
                    placeholder="2.140,50"
                    required
                />

              </div>

            </div>


            <!-- Brutto -->
            <div class="form-group">

              <label>
                Brutto
              </label>

              <div class="input-container">

                <i class="fa-solid fa-euro-sign"></i>

                <input
                    v-model="newSalary.brutto"
                    type="text"
                    placeholder="3.050,00"
                    required
                />

              </div>

            </div>

          </div>


          <!-- PDF -->
          <div class="file-section">

            <label>
              Lohnzettel PDF
            </label>

            <label class="file-dropzone">

              <input
                  type="file"
                  accept="application/pdf"
                  @change="handleFileChange"
                  required
              />

              <div class="file-icon">
                <i class="fa-solid fa-file-pdf"></i>
              </div>

              <div class="file-info">

                <strong v-if="selectedFile">
                  {{ selectedFile.name }}
                </strong>

                <strong v-else>
                  PDF-Datei auswählen
                </strong>

                <span v-if="selectedFile">
                  {{ formatFileSize(selectedFile.size) }}
                </span>

                <span v-else>
                  Klicken oder Datei hier auswählen
                </span>

              </div>

              <i class="fa-solid fa-arrow-up-from-bracket upload-arrow"></i>

            </label>

          </div>


          <!-- SUBMIT -->
          <button
              type="submit"
              class="upload-button"
              :disabled="uploading"
          >

            <i
                v-if="!uploading"
                class="fa-solid fa-cloud-arrow-up"
            ></i>

            <i
                v-else
                class="fa-solid fa-circle-notch fa-spin"
            ></i>

            {{
              uploading
                  ? 'Wird hochgeladen...'
                  : 'Lohnzettel hochladen'
            }}

          </button>

        </form>

      </section>


      <!-- OVERVIEW -->
      <section class="overview-grid">

        <div class="overview-card">

          <div class="overview-icon blue">
            <i class="fa-solid fa-file-lines"></i>
          </div>

          <div>
            <span>Abrechnungen</span>
            <strong>{{ salaryData.length }}</strong>
          </div>

        </div>


        <div class="overview-card">

          <div class="overview-icon green">
            <i class="fa-solid fa-circle-check"></i>
          </div>

          <div>
            <span>Status</span>
            <strong>Ausbezahlt</strong>
          </div>

        </div>


        <div class="overview-card">

          <div class="overview-icon purple">
            <i class="fa-solid fa-calendar-check"></i>
          </div>

          <div>
            <span>Letzte Abrechnung</span>

            <strong>
              {{
                salaryData.length
                    ? `${salaryData[0].month} ${salaryData[0].year}`
                    : '—'
              }}
            </strong>

          </div>

        </div>

      </section>


      <!-- LIST HEADER -->
      <section class="list-section">

        <div class="list-header">

          <div>

            <span class="eyebrow">
              DOKUMENTE
            </span>

            <h2>
              Meine Gehaltsabrechnungen
            </h2>

          </div>

          <span class="document-count">
            {{ salaryData.length }}
            {{ salaryData.length === 1 ? 'Dokument' : 'Dokumente' }}
          </span>

        </div>


        <!-- LOADING -->
        <div
            v-if="loading"
            class="loading-card"
        >

          <div class="loading-spinner">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
          </div>

          <strong>
            Gehaltsabrechnungen werden geladen
          </strong>

          <span>
            Bitte einen Moment warten...
          </span>

        </div>


        <!-- LIST -->
        <div
            v-else-if="salaryData.length"
            class="salary-list"
        >

          <article
              v-for="item in salaryData"
              :key="item.id"
              class="salary-card"
          >

            <div class="salary-main">

              <div class="pdf-icon">
                <i class="fa-solid fa-file-pdf"></i>
              </div>

              <div class="salary-details">

                <div class="salary-title-row">

                  <h3>
                    {{ item.month }} {{ item.year }}
                  </h3>

                  <span class="paid-badge">
                    <i class="fa-solid fa-check"></i>
                    Ausbezahlt
                  </span>

                </div>

                <div class="salary-values">

                  <div class="salary-value">

                    <span>
                      Netto
                    </span>

                    <strong>
                      {{ item.netto }} €
                    </strong>

                  </div>

                  <div class="salary-divider"></div>

                  <div class="salary-value">

                    <span>
                      Brutto
                    </span>

                    <strong class="gross">
                      {{ item.brutto }} €
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            <div class="salary-action">

              <a
                  v-if="item.file_url"
                  :href="item.file_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="download-button"
              >

                <i class="fa-solid fa-arrow-up-right-from-square"></i>

                <span>
                  Lohnzettel öffnen
                </span>

              </a>

            </div>

          </article>

        </div>


        <!-- EMPTY -->
        <div
            v-else
            class="empty-card"
        >

          <div class="empty-icon">
            <i class="fa-regular fa-folder-open"></i>
          </div>

          <h3>
            Noch keine Gehaltsabrechnungen
          </h3>

          <p>
            Sobald ein Lohnzettel verfügbar ist,
            wird er hier angezeigt.
          </p>

        </div>

      </section>

    </div>

  </AppShell>
</template>


<script setup>

import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import {
  useRouter
} from 'vue-router'

import AppShell from '@/components/AppShell.vue'
import { useAppStore } from '@/stores/app.js'

import {
  supabase
} from '@/config/supabase.js'


const router = useRouter()

const { initTheme } = useAppStore()


/* =====================================================
   USER
===================================================== */

const userName = ref('Mitarbeiter')

const isAdmin = ref(false)


/* =====================================================
   NOTIFICATIONS
===================================================== */

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


/* =====================================================
   SALARY
===================================================== */

const salaryData = ref([])

const loading = ref(true)

const uploading = ref(false)

const selectedFile = ref(null)


const newSalary = ref({

  month: '',

  year: new Date().getFullYear(),

  netto: '',

  brutto: ''

})


const months = [

  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'

]


/* =====================================================
   USER LADEN
===================================================== */

const loadCurrentUser = () => {

  const userJson =
      localStorage.getItem('currentUser')


  if (!userJson) {

    router.push('/login')

    return

  }


  try {

    const user =
        JSON.parse(userJson)


    if (user?.name) {

      userName.value =
          user.name

    }


    isAdmin.value =
        user?.role === 'admin'


  } catch (error) {

    console.error(
        'Fehler beim Parsen des Users:',
        error
    )

    localStorage.removeItem(
        'currentUser'
    )

    router.push('/login')

  }

}


/* =====================================================
   GEHALT LADEN
===================================================== */

const fetchSalaries = async () => {

  loading.value = true


  try {

    const {
      data,
      error
    } = await supabase

        .from('salaries')

        .select('*')

        .order(
            'created_at',
            {
              ascending: false
            }
        )


    if (error) {

      console.error(
          'Fehler beim Laden der Lohnzettel:',
          error.message
      )

      return

    }


    salaryData.value =
        data || []


  } finally {

    loading.value = false

  }

}


/* =====================================================
   FILE
===================================================== */

const handleFileChange = (event) => {

  selectedFile.value =
      event.target.files?.[0] || null

}


const formatFileSize = (bytes) => {

  if (!bytes) {
    return '0 KB'
  }


  const kb =
      bytes / 1024


  if (kb < 1024) {

    return `${Math.round(kb)} KB`

  }


  return `${(kb / 1024).toFixed(1)} MB`

}


/* =====================================================
   UPLOAD
===================================================== */

const uploadSalaryPdf = async () => {

  if (!selectedFile.value) {

    alert(
        'Bitte wähle eine PDF-Datei aus.'
    )

    return

  }


  if (
      selectedFile.value.type !==
      'application/pdf'
  ) {

    alert(
        'Bitte nur PDF-Dateien hochladen.'
    )

    return

  }


  uploading.value = true


  try {

    const fileExt =
        selectedFile.value.name
            .split('.')
            .pop()


    const fileName =
        `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}.${fileExt}`


    const filePath =
        `salaries/${fileName}`


    /* -----------------------------
       STORAGE
    ----------------------------- */

    const {
      error: uploadError
    } = await supabase.storage

        .from('documents')

        .upload(
            filePath,
            selectedFile.value
        )


    if (uploadError) {
      throw uploadError
    }


    /* -----------------------------
       PUBLIC URL
    ----------------------------- */

    const {
      data: publicUrlData
    } = supabase.storage

        .from('documents')

        .getPublicUrl(filePath)


    const fileUrl =
        publicUrlData.publicUrl


    /* -----------------------------
       DATABASE
    ----------------------------- */

    const {
      error: dbError
    } = await supabase

        .from('salaries')

        .insert([{

          month:
          newSalary.value.month,

          year:
              Number(
                  newSalary.value.year
              ),

          netto:
          newSalary.value.netto,

          brutto:
          newSalary.value.brutto,

          file_url:
          fileUrl

        }])


    if (dbError) {
      throw dbError
    }


    alert(
        'Lohnzettel erfolgreich hochgeladen!'
    )


    /* -----------------------------
       RESET
    ----------------------------- */

    newSalary.value = {

      month: '',

      year:
          new Date().getFullYear(),

      netto: '',

      brutto: ''

    }


    selectedFile.value = null


    await fetchSalaries()


  } catch (error) {

    console.error(
        'Fehler beim Upload:',
        error
    )


    alert(
        'Fehler beim Hochladen: ' +
        (error.message || error)
    )


  } finally {

    uploading.value = false

  }

}


/* =====================================================
   RESIZE
===================================================== */

const checkScreenSize = () => {

  // AppShell verwaltet das Menü.
  // Diese Funktion bleibt bewusst leer,
  // damit keine zweite Navigation entsteht.

}


/* =====================================================
   LOGOUT
===================================================== */

const handleLogout = async () => {

  localStorage.removeItem(
      'currentUser'
  )

  try {

    await supabase.auth.signOut()

  } catch (error) {

    console.warn(
        'Supabase Logout:',
        error
    )

  }


  router.push('/login')

}


/* =====================================================
   INIT
===================================================== */

onMounted(async () => {
  initTheme()
  loadCurrentUser()

  window.addEventListener(
      'resize',
      checkScreenSize
  )

  await fetchSalaries()

})


onUnmounted(() => {

  window.removeEventListener(
      'resize',
      checkScreenSize
  )

})

</script>


<style scoped>

/* =====================================================
   PAGE
===================================================== */

.salary-page {

  width: 100%;

  max-width: 1180px;

  margin: 0 auto;

  padding: 30px;

  color: var(--app-text, #f8fafc);

}


/* =====================================================
   HEADER
===================================================== */

.page-heading {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 24px;

  margin-bottom: 28px;

}


.heading-left {

  display: flex;

  align-items: center;

  gap: 16px;

}


.page-icon {

  width: 54px;

  height: 54px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 16px;

  color: #60a5fa;

  background:
      rgba(59,130,246,.12);

  border:
      1px solid
      rgba(59,130,246,.20);

  font-size: 21px;

}


.eyebrow {

  display: block;

  margin-bottom: 5px;

  color: #60a5fa;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1.5px;

}


.page-heading h1 {

  margin: 0;

  color: var(--app-heading, #f8fafc);

  font-size: 27px;

  letter-spacing: -.6px;

}


.page-heading p {

  margin: 5px 0 0;

  color: var(--app-muted, #7f8da3);

  font-size: 13px;

}


.refresh-button {

  height: 40px;

  display: inline-flex;

  align-items: center;

  gap: 8px;

  padding: 0 14px;

  border:
      1px solid
      var(--app-border, rgba(255,255,255,.08));

  border-radius: 10px;

  color: var(--app-text, #cbd5e1);

  background:
      var(--app-surface, #111c2c);

  cursor: pointer;

}


.refresh-button:hover {

  border-color:
      rgba(59,130,246,.4);

  color: #60a5fa;

}


.refresh-button.spinning i {

  animation:
      spin .8s linear infinite;

}


@keyframes spin {

  to {
    transform: rotate(360deg);
  }

}


/* =====================================================
   UPLOAD CARD
===================================================== */

.upload-card {

  padding: 24px;

  margin-bottom: 22px;

  border:
      1px solid
      var(--app-border, rgba(255,255,255,.08));

  border-radius: 18px;

  background:
      var(--app-surface, #101b2b);

  box-shadow:
      0 14px 40px
      rgba(0,0,0,.12);

}


.card-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  margin-bottom: 24px;

}


.card-title {

  display: flex;

  align-items: center;

  gap: 13px;

}


.card-icon {

  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 12px;

}


.card-icon.blue {

  color: #60a5fa;

  background:
      rgba(59,130,246,.12);

}


.card-title h2 {

  margin: 0;

  color: var(--app-heading, #f8fafc);

  font-size: 15px;

}


.card-title p {

  margin: 4px 0 0;

  color: var(--app-muted, #7f8da3);

  font-size: 12px;

}


.admin-badge {

  display: inline-flex;

  align-items: center;

  gap: 6px;

  padding: 6px 9px;

  border-radius: 8px;

  color: #a5b4fc;

  background:
      rgba(99,102,241,.10);

  border:
      1px solid
      rgba(99,102,241,.18);

  font-size: 9px;

  font-weight: 800;

  letter-spacing: .8px;

}


/* =====================================================
   FORM
===================================================== */

.upload-form {

  display: flex;

  flex-direction: column;

  gap: 18px;

}


.form-grid {

  display: grid;

  grid-template-columns:
    repeat(4, minmax(0,1fr));

  gap: 13px;

}


.form-group {

  display: flex;

  flex-direction: column;

  gap: 7px;

}


.form-group label,
.file-section > label {

  color: var(--app-muted, #8b98ab);

  font-size: 11px;

  font-weight: 650;

}


.input-container {

  position: relative;

}


.input-container > i {

  position: absolute;

  left: 13px;

  top: 50%;

  transform: translateY(-50%);

  color: #526176;

  font-size: 12px;

  pointer-events: none;

}


.input-container input,
.input-container select {

  width: 100%;

  height: 45px;

  padding:
      0 12px 0 37px;

  border:
      1px solid
      var(--app-border, rgba(255,255,255,.08));

  border-radius: 10px;

  outline: none;

  color: var(--app-text, #f8fafc);

  background:
      var(--app-input, #0b1524);

  font-size: 13px;

}


.input-container input:focus,
.input-container select:focus {

  border-color: #3b82f6;

  box-shadow:
      0 0 0 3px
      rgba(59,130,246,.10);

}


/* =====================================================
   FILE
===================================================== */

.file-section {

  display: flex;

  flex-direction: column;

  gap: 7px;

}


.file-dropzone {

  min-height: 70px;

  display: flex;

  align-items: center;

  gap: 13px;

  padding: 12px 14px;

  border:
      1px dashed
      var(--app-border, rgba(255,255,255,.12));

  border-radius: 12px;

  background:
      var(--app-input, #0b1524);

  cursor: pointer;

  transition:
      border-color .2s,
      background .2s;

}


.file-dropzone:hover {

  border-color: #3b82f6;

  background:
      rgba(59,130,246,.04);

}


.file-dropzone input {

  display: none;

}


.file-icon {

  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  color: #f87171;

  background:
      rgba(239,68,68,.10);

  font-size: 17px;

}


.file-info {

  flex: 1;

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.file-info strong {

  overflow: hidden;

  color: var(--app-heading, #f8fafc);

  font-size: 12px;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.file-info span {

  color: var(--app-muted, #6f7e93);

  font-size: 10px;

}


.upload-arrow {

  color: #64748b;

}


/* =====================================================
   BUTTON
===================================================== */

.upload-button {

  height: 45px;

  align-self: flex-start;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding: 0 18px;

  border: 0;

  border-radius: 10px;

  color: white;

  background:
      linear-gradient(
          135deg,
          #3b82f6,
          #2563eb
      );

  font-size: 12px;

  font-weight: 700;

  cursor: pointer;

}


.upload-button:hover:not(:disabled) {

  filter: brightness(1.08);

}


.upload-button:disabled {

  opacity: .6;

  cursor: not-allowed;

}


/* =====================================================
   OVERVIEW
===================================================== */

.overview-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 13px;

  margin-bottom: 30px;

}


.overview-card {

  display: flex;

  align-items: center;

  gap: 13px;

  padding: 16px;

  border:
      1px solid
      var(--app-border, rgba(255,255,255,.07));

  border-radius: 15px;

  background:
      var(--app-surface, #101b2b);

}


.overview-icon {

  width: 40px;

  height: 40px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;

}


.overview-icon.blue {

  color: #60a5fa;

  background:
      rgba(59,130,246,.11);

}


.overview-icon.green {

  color: #34d399;

  background:
      rgba(16,185,129,.11);

}


.overview-icon.purple {

  color: #a78bfa;

  background:
      rgba(139,92,246,.11);

}


.overview-card div:last-child {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.overview-card span {

  color: var(--app-muted, #718096);

  font-size: 10px;

}


.overview-card strong {

  color: var(--app-heading, #f8fafc);

  font-size: 14px;

}


/* =====================================================
   LIST
===================================================== */

.list-section {

  width: 100%;

}


.list-header {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 14px;

}


.list-header h2 {

  margin: 0;

  color: var(--app-heading, #f8fafc);

  font-size: 19px;

  letter-spacing: -.3px;

}


.document-count {

  padding: 5px 9px;

  border-radius: 7px;

  color: var(--app-muted, #94a3b8);

  background:
      var(--app-surface, #101b2b);

  font-size: 10px;

}


/* =====================================================
   SALARY CARD
===================================================== */

.salary-list {

  display: flex;

  flex-direction: column;

  gap: 10px;

}


.salary-card {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 17px;

  border:
      1px solid
      var(--app-border, rgba(255,255,255,.07));

  border-radius: 15px;

  background:
      var(--app-surface, #101b2b);

  transition:
      transform .2s,
      border-color .2s;

}


.salary-card:hover {

  transform: translateY(-1px);

  border-color:
      rgba(59,130,246,.22);

}


.salary-main {

  display: flex;

  align-items: center;

  gap: 13px;

  min-width: 0;

}


.pdf-icon {

  width: 45px;

  height: 45px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;

  color: #f87171;

  background:
      rgba(239,68,68,.10);

  font-size: 18px;

}


.salary-details {

  min-width: 0;

}


.salary-title-row {

  display: flex;

  align-items: center;

  gap: 10px;

  flex-wrap: wrap;

}


.salary-title-row h3 {

  margin: 0;

  color: var(--app-heading, #f8fafc);

  font-size: 14px;

}


.paid-badge {

  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding: 4px 7px;

  border-radius: 6px;

  color: #34d399;

  background:
      rgba(16,185,129,.09);

  font-size: 9px;

  font-weight: 750;

}


.salary-values {

  display: flex;

  align-items: center;

  gap: 13px;

  margin-top: 6px;

}


.salary-value {

  display: flex;

  align-items: center;

  gap: 5px;

}


.salary-value span {

  color: var(--app-muted, #718096);

  font-size: 10px;

}


.salary-value strong {

  color: #34d399;

  font-size: 12px;

}


.salary-value strong.gross {

  color: var(--app-heading, #cbd5e1);

}


.salary-divider {

  width: 1px;

  height: 15px;

  background:
      var(--app-border, rgba(255,255,255,.1));

}


.salary-action {

  flex-shrink: 0;

}


.download-button {

  height: 38px;

  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding: 0 12px;

  border:
      1px solid
      rgba(59,130,246,.22);

  border-radius: 9px;

  color: #60a5fa;

  background:
      rgba(59,130,246,.08);

  font-size: 10px;

  font-weight: 700;

  text-decoration: none;

  transition: all .2s;

}


.download-button:hover {

  color: white;

  background: #2563eb;

  border-color: #2563eb;

}


/* =====================================================
   LOADING
===================================================== */

.loading-card {

  min-height: 180px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 7px;

  border:
      1px solid
      var(--app-border, rgba(255,255,255,.07));

  border-radius: 15px;

  background:
      var(--app-surface, #101b2b);

}


.loading-spinner {

  margin-bottom: 5px;

  color: #60a5fa;

  font-size: 22px;

}


.loading-card strong {

  color: var(--app-heading, #e2e8f0);

  font-size: 12px;

}


.loading-card span {

  color: var(--app-muted, #718096);

  font-size: 10px;

}


/* =====================================================
   EMPTY
===================================================== */

.empty-card {

  min-height: 230px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: 30px;

  border:
      1px dashed
      var(--app-border, rgba(255,255,255,.09));

  border-radius: 15px;

  background:
      var(--app-surface, #101b2b);

  text-align: center;

}


.empty-icon {

  width: 55px;

  height: 55px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 12px;

  border-radius: 15px;

  color: #64748b;

  background:
      rgba(100,116,139,.09);

  font-size: 22px;

}


.empty-card h3 {

  margin: 0;

  color: var(--app-heading, #e2e8f0);

  font-size: 14px;

}


.empty-card p {

  max-width: 330px;

  margin: 6px 0 0;

  color: var(--app-muted, #718096);

  font-size: 11px;

  line-height: 1.5;

}


/* =====================================================
   LIGHT THEME
===================================================== */

:global(body.light-theme) {

  --app-text: #1e293b;

  --app-heading: #0f172a;

  --app-muted: #64748b;

  --app-border: #e2e8f0;

  --app-surface: #ffffff;

  --app-input: #f8fafc;

}


/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 850px) {

  .salary-page {

    padding: 22px 16px 30px;

  }


  .form-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

}


@media (max-width: 600px) {

  .salary-page {

    padding:
        17px 12px 28px;

  }


  .page-heading {

    align-items: flex-start;

    margin-bottom: 20px;

  }


  .heading-left {

    gap: 11px;

  }


  .page-icon {

    width: 45px;

    height: 45px;

    border-radius: 13px;

    font-size: 17px;

  }


  .page-heading h1 {

    font-size: 21px;

  }


  .page-heading p {

    font-size: 11px;

  }


  .refresh-button {

    width: 40px;

    height: 40px;

    padding: 0;

    justify-content: center;

  }


  .refresh-button span {

    display: none;

  }


  .upload-card {

    padding: 16px;

    border-radius: 15px;

  }


  .card-header {

    align-items: flex-start;

  }


  .card-title h2 {

    font-size: 13px;

  }


  .card-title p {

    font-size: 10px;

  }


  .admin-badge {

    display: none;

  }


  .form-grid {

    grid-template-columns: 1fr;

  }


  .upload-button {

    width: 100%;

  }


  .overview-grid {

    grid-template-columns: 1fr;

    gap: 8px;

    margin-bottom: 22px;

  }


  .overview-card {

    padding: 13px;

  }


  .salary-card {

    flex-direction: column;

    align-items: stretch;

    gap: 13px;

    padding: 14px;

  }


  .salary-main {

    align-items: flex-start;

  }


  .salary-title-row {

    gap: 7px;

  }


  .salary-values {

    flex-wrap: wrap;

  }


  .salary-action {

    width: 100%;

  }


  .download-button {

    width: 100%;

    justify-content: center;

  }


  .list-header h2 {

    font-size: 17px;

  }

}

</style>
