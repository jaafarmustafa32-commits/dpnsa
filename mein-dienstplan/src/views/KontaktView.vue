<template>
  <AppShell
      :user-name="userName"
      :notifications="notifications"
      :unread-count="unreadNotifications.length"
      :is-light-mode="isLightMode"
      page-title="Büro Kontakt"
      @mark-read="markAsRead"
      @mark-all-read="markAllAsRead"
      @toggle-theme="toggleLightMode"
  >
    <main class="contact-page">




      <!-- CONTACT CARD -->
      <section class="contact-card">

        <!-- CARD HEADER -->
        <div class="contact-card-header">

          <div class="contact-icon">
            <i class="fa-solid fa-envelope-open-text"></i>
          </div>

          <div>
            <h2>Nachricht senden</h2>

            <p>
              Wähle ein Thema und sende deine Nachricht direkt an das Büro.
            </p>
          </div>

        </div>


        <!-- SUCCESS / INFO -->
        <div
            v-if="successMessage"
            class="message-status status-success"
        >
          <div class="status-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>

          <div>
            <strong>{{ successMessage }}</strong>

            <span>
              Die E-Mail-App wurde zum Erstellen der Nachricht geöffnet.
            </span>
          </div>
        </div>


        <!-- ERROR -->
        <div
            v-if="errorMessage"
            class="message-status status-error"
        >
          <div class="status-icon">
            <i class="fa-solid fa-circle-exclamation"></i>
          </div>

          <div>
            <strong>Nachricht konnte nicht vorbereitet werden</strong>

            <span>
              {{ errorMessage }}
            </span>
          </div>
        </div>


        <!-- FORM -->
        <form
            class="contact-form"
            @submit.prevent="sendMessage"
        >

          <!-- SUBJECT -->
          <div class="form-group">

            <label for="subject">
              <i class="fa-solid fa-tag"></i>
              Betreff / Thema
            </label>

            <div class="input-wrapper">

              <i class="fa-solid fa-list input-icon"></i>

              <select
                  id="subject"
                  v-model="formData.subject"
                  required
              >
                <option
                    value=""
                    disabled
                >
                  Bitte wählen...
                </option>

                <option value="Frage zum Dienstplan">
                  Frage zum Dienstplan
                </option>

                <option value="Krankmeldung">
                  Krankmeldung nachreichen
                </option>

                <option value="Diensttausch / Urlaub">
                  Diensttausch / Urlaub Rückfrage
                </option>

                <option value="Gehalt / Lohnzettel">
                  Gehalt / Lohnzettel
                </option>

                <option value="Sonstiges">
                  Sonstiges
                </option>
              </select>

            </div>

          </div>


          <!-- MESSAGE -->
          <div class="form-group">

            <label for="message">
              <i class="fa-solid fa-message"></i>
              Ihre Nachricht
            </label>

            <div class="textarea-wrapper">

              <textarea
                  id="message"
                  v-model="formData.message"
                  placeholder="Nachricht hier eingeben..."
                  rows="7"
                  maxlength="2000"
                  required
              ></textarea>

              <span class="character-count">
                {{ formData.message.length }} / 2000
              </span>

            </div>

          </div>


          <!-- SEND -->
          <button
              type="submit"
              class="submit-button"
              :disabled="isSending || !canSend"
          >

            <i
                class="fa-solid"
                :class="
                isSending
                  ? 'fa-spinner fa-spin'
                  : 'fa-paper-plane'
              "
            ></i>

            <span>
              {{
                isSending
                    ? 'Wird vorbereitet...'
                    : 'Nachricht absenden'
              }}
            </span>

          </button>

        </form>


        <!-- BOTTOM DELIVERY STATUS -->
        <div class="delivery-status">

          <div class="delivery-status-icon">

            <i
                class="fa-solid"
                :class="
                mailStatus === 'confirmed'
                  ? 'fa-circle-check'
                  : mailStatus === 'pending'
                    ? 'fa-clock'
                    : 'fa-circle-info'
              "
            ></i>

          </div>

          <div class="delivery-status-content">

            <span class="delivery-label">
              Nachrichtenstatus
            </span>

            <strong
                :class="{
                confirmed: mailStatus === 'confirmed',
                pending: mailStatus === 'pending'
              }"
            >
              {{ mailStatusText }}
            </strong>

          </div>

        </div>


        <!-- INFO -->
        <div class="contact-info">

          <div class="info-item">

            <div class="info-icon">
              <i class="fa-solid fa-envelope"></i>
            </div>

            <div>
              <span>E-Mail</span>
              <strong>Jr.allami66@gmail.com</strong>
            </div>

          </div>




        </div>

      </section>

    </main>
  </AppShell>
</template>


<script setup>

import {
  computed,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import AppShell from '@/components/AppShell.vue'


/* =========================================================
   ROUTER
========================================================= */

const router = useRouter()


/* =========================================================
   USER
========================================================= */

const storedUser = localStorage.getItem('currentUser')

let parsedUser = null

try {
  parsedUser = storedUser
      ? JSON.parse(storedUser)
      : null
} catch {
  parsedUser = null
}


const userName = ref(
    parsedUser?.name ||
    parsedUser?.full_name ||
    'Mitarbeiter'
)


/* =========================================================
   THEME
   AppShell / zentrale App-Logik
========================================================= */

const isLightMode = ref(
    localStorage.getItem('theme') === 'light'
)


const toggleLightMode = () => {

  isLightMode.value = !isLightMode.value

  localStorage.setItem(
      'theme',
      isLightMode.value
          ? 'light'
          : 'dark'
  )

  document.documentElement.classList.toggle(
      'light-theme',
      isLightMode.value
  )

  document.body.classList.toggle(
      'light-theme',
      isLightMode.value
  )

}


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

  const notification =
      notifications.value.find(
          item => item.id === id
      )

  if (notification) {
    notification.read = true
  }

}


const markAllAsRead = () => {

  notifications.value.forEach(
      notification => {
        notification.read = true
      }
  )

}


/* =========================================================
   FORM
========================================================= */

const formData = ref({

  subject: '',

  message: ''

})


/* =========================================================
   STATE
========================================================= */

const isSending = ref(false)

const successMessage = ref('')

const errorMessage = ref('')

/*
 * idle
 * pending
 * confirmed
 */
const mailStatus = ref('idle')


/* =========================================================
   COMPUTED
========================================================= */

const canSend = computed(() => {

  return (
      formData.value.subject.trim() !== '' &&
      formData.value.message.trim() !== ''
  )

})


const mailStatusText = computed(() => {

  if (mailStatus.value === 'confirmed') {
    return 'E-Mail-App geöffnet'
  }

  if (mailStatus.value === 'pending') {
    return 'Nachricht wird vorbereitet'
  }

  return 'Noch keine Nachricht gesendet'

})


/* =========================================================
   SEND MESSAGE
========================================================= */

const sendMessage = () => {

  if (!canSend.value) {
    return
  }

  successMessage.value = ''

  errorMessage.value = ''

  mailStatus.value = 'pending'

  isSending.value = true


  try {

    const targetEmail =
        'Jr.allami66@gmail.com'


    const senderName =
        userName.value || 'Mitarbeiter'


    const subject =
        `[Dienstplan] ${formData.value.subject.trim()}`


    const body = [
      `Absender: ${senderName}`,
      '',
      `Thema: ${formData.value.subject.trim()}`,
      '',
      'Nachricht:',
      formData.value.message.trim()
    ].join('\n')


    const mailtoUrl =
        `mailto:${targetEmail}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`


    /*
     * E-Mail-App öffnen
     */
    window.location.href = mailtoUrl


    /*
     * Wir können nicht feststellen,
     * ob die E-Mail wirklich abgeschickt wurde.
     * Wir können nur bestätigen,
     * dass der Mailto-Aufruf erfolgt ist.
     */
    mailStatus.value = 'confirmed'

    successMessage.value =
        'E-Mail-App wurde geöffnet.'


    /*
     * Formular zurücksetzen
     */
    formData.value = {
      subject: '',
      message: ''
    }


  } catch (error) {

    console.error(
        'Fehler beim Öffnen der E-Mail-App:',
        error
    )

    mailStatus.value = 'idle'

    errorMessage.value =
        'Die E-Mail-App konnte nicht geöffnet werden.'

  } finally {

    isSending.value = false

  }

}


/* =========================================================
   HOME
========================================================= */

const goHome = () => {

  router.push('/home')

}

</script>


<style scoped>

/* =========================================================
   PAGE
========================================================= */

.contact-page {

  min-height: 100%;

  width: 100%;

  max-width: 1100px;

  margin: 0 auto;

  padding: 28px 24px 40px;

  color: var(--text-main);

}


/* =========================================================
   PAGE HEADING
========================================================= */

.page-heading {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 20px;

  margin-bottom: 22px;

}


.page-kicker {

  display: block;

  margin-bottom: 6px;

  color: var(--accent);

  font-size: 0.7rem;

  font-weight: 800;

  letter-spacing: 0.16em;

}


.page-heading h1 {

  margin: 0;

  color: var(--text-main);

  font-size: clamp(
      1.5rem,
      3vw,
      2rem
  );

  font-weight: 800;

  letter-spacing: -0.035em;

}


.page-heading p {

  margin: 7px 0 0;

  color: var(--text-secondary);

  font-size: 0.9rem;

}


/* =========================================================
   BACK BUTTON
========================================================= */

.back-button {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  min-height: 42px;

  padding: 0 15px;

  border: 1px solid var(--border-color);

  border-radius: 11px;

  background: var(--bg-card);

  color: var(--text-main);

  font: inherit;

  font-size: 0.84rem;

  font-weight: 700;

  cursor: pointer;

  transition:
      background-color .2s ease,
      border-color .2s ease,
      transform .2s ease;

}


.back-button:hover {

  background: var(--bg-card-hover);

  border-color: var(--accent);

}


.back-button:active {

  transform: scale(.98);

}


/* =========================================================
   CONTACT CARD
========================================================= */

.contact-card {

  width: 100%;

  padding: 25px;

  border: 1px solid var(--border-color);

  border-radius: 20px;

  background:
      linear-gradient(
          145deg,
          var(--bg-card),
          var(--surface-soft)
      );

  box-shadow: var(--shadow);

}


/* =========================================================
   CARD HEADER
========================================================= */

.contact-card-header {

  display: flex;

  align-items: center;

  gap: 14px;

  margin-bottom: 24px;

}


.contact-icon {

  width: 50px;

  height: 50px;

  flex: 0 0 50px;

  display: grid;

  place-items: center;

  border: 1px solid
  color-mix(
      in srgb,
      var(--accent) 25%,
      var(--border-color)
  );

  border-radius: 14px;

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          var(--bg-card)
      );

  color: var(--accent);

  font-size: 1.15rem;

}


.contact-card-header h2 {

  margin: 0;

  color: var(--text-main);

  font-size: 1.15rem;

  font-weight: 800;

}


.contact-card-header p {

  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: .82rem;

}


/* =========================================================
   STATUS
========================================================= */

.message-status {

  display: flex;

  align-items: center;

  gap: 12px;

  padding: 13px 15px;

  margin-bottom: 20px;

  border-radius: 13px;

}


.status-success {

  border: 1px solid
  color-mix(
      in srgb,
      var(--success) 30%,
      var(--border-color)
  );

  background:
      color-mix(
          in srgb,
          var(--success) 9%,
          var(--bg-card)
      );

}


.status-error {

  border: 1px solid
  color-mix(
      in srgb,
      var(--danger) 30%,
      var(--border-color)
  );

  background:
      color-mix(
          in srgb,
          var(--danger) 9%,
          var(--bg-card)
      );

}


.status-icon {

  width: 34px;

  height: 34px;

  flex: 0 0 34px;

  display: grid;

  place-items: center;

  border-radius: 10px;

  color: var(--success);

  background:
      color-mix(
          in srgb,
          var(--success) 12%,
          transparent
      );

}


.status-error .status-icon {

  color: var(--danger);

  background:
      color-mix(
          in srgb,
          var(--danger) 12%,
          transparent
      );

}


.message-status strong {

  display: block;

  color: var(--text-main);

  font-size: .84rem;

}


.message-status span {

  display: block;

  margin-top: 2px;

  color: var(--text-secondary);

  font-size: .74rem;

}


/* =========================================================
   FORM
========================================================= */

.contact-form {

  display: flex;

  flex-direction: column;

  gap: 18px;

}


.form-group {

  display: flex;

  flex-direction: column;

  gap: 7px;

}


.form-group label {

  display: flex;

  align-items: center;

  gap: 7px;

  color: var(--text-main);

  font-size: .8rem;

  font-weight: 700;

}


.form-group label i {

  color: var(--accent);

}


/* =========================================================
   INPUT WRAPPER
========================================================= */

.input-wrapper {

  position: relative;

}


.input-icon {

  position: absolute;

  left: 14px;

  top: 50%;

  transform: translateY(-50%);

  color: var(--text-muted);

  pointer-events: none;

}


.form-group select {

  width: 100%;

  min-height: 48px;

  padding: 0 42px;

  border: 1px solid var(--border-color);

  border-radius: 11px;

  background: var(--input-bg);

  color: var(--text-main);

  font: inherit;

  font-size: 16px;

  outline: none;

  cursor: pointer;

  transition:
      border-color .2s ease,
      box-shadow .2s ease,
      background-color .2s ease;

}


.form-group select:focus {

  border-color: var(--accent);

  box-shadow:
      0 0 0 3px
      color-mix(
          in srgb,
          var(--accent) 14%,
          transparent
      );

}


/* =========================================================
   TEXTAREA
========================================================= */

.textarea-wrapper {

  position: relative;

}


.form-group textarea {

  width: 100%;

  min-height: 170px;

  padding: 14px;

  padding-bottom: 34px;

  resize: vertical;

  border: 1px solid var(--border-color);

  border-radius: 11px;

  background: var(--input-bg);

  color: var(--text-main);

  font: inherit;

  font-size: 16px;

  line-height: 1.55;

  outline: none;

  transition:
      border-color .2s ease,
      box-shadow .2s ease,
      background-color .2s ease;

}


.form-group textarea::placeholder {

  color: var(--text-muted);

}


.form-group textarea:focus {

  border-color: var(--accent);

  box-shadow:
      0 0 0 3px
      color-mix(
          in srgb,
          var(--accent) 14%,
          transparent
      );

}


.character-count {

  position: absolute;

  right: 12px;

  bottom: 10px;

  color: var(--text-muted);

  font-size: .68rem;

}


/* =========================================================
   SUBMIT
========================================================= */

.submit-button {

  width: 100%;

  min-height: 49px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 9px;

  border: 0;

  border-radius: 12px;

  background: var(--accent);

  color: #fff;

  font: inherit;

  font-size: .9rem;

  font-weight: 800;

  cursor: pointer;

  box-shadow:
      0 8px 20px
      color-mix(
          in srgb,
          var(--accent) 20%,
          transparent
      );

  transition:
      transform .2s ease,
      background-color .2s ease,
      opacity .2s ease;

}


.submit-button:hover:not(:disabled) {

  background: var(--accent-hover);

  transform: translateY(-1px);

}


.submit-button:active:not(:disabled) {

  transform: scale(.99);

}


.submit-button:disabled {

  opacity: .55;

  cursor: not-allowed;

}


/* =========================================================
   DELIVERY STATUS
========================================================= */

.delivery-status {

  display: flex;

  align-items: center;

  gap: 12px;

  margin-top: 22px;

  padding: 14px;

  border: 1px solid var(--border-color);

  border-radius: 13px;

  background: var(--surface-soft);

}


.delivery-status-icon {

  width: 36px;

  height: 36px;

  flex: 0 0 36px;

  display: grid;

  place-items: center;

  border-radius: 10px;

  background:
      color-mix(
          in srgb,
          var(--accent) 10%,
          transparent
      );

  color: var(--accent);

}


.delivery-status-content {

  display: flex;

  flex-direction: column;

  min-width: 0;

}


.delivery-label {

  color: var(--text-muted);

  font-size: .68rem;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .08em;

}


.delivery-status-content strong {

  margin-top: 2px;

  color: var(--text-secondary);

  font-size: .8rem;

}


.delivery-status-content strong.confirmed {

  color: var(--success);

}


.delivery-status-content strong.pending {

  color: var(--warning);

}


/* =========================================================
   CONTACT INFO
========================================================= */

.contact-info {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 10px;

  margin-top: 12px;

}


.info-item {

  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 0;

  padding: 12px;

  border: 1px solid var(--border-color);

  border-radius: 12px;

  background: var(--bg-card);

}


.info-icon {

  width: 32px;

  height: 32px;

  flex: 0 0 32px;

  display: grid;

  place-items: center;

  border-radius: 9px;

  background:
      color-mix(
          in srgb,
          var(--accent) 9%,
          transparent
      );

  color: var(--accent);

  font-size: .78rem;

}


.info-item span {

  display: block;

  color: var(--text-muted);

  font-size: .65rem;

  font-weight: 700;

}


.info-item strong {

  display: block;

  margin-top: 2px;

  overflow: hidden;

  color: var(--text-secondary);

  font-size: .72rem;

  font-weight: 600;

  text-overflow: ellipsis;

  white-space: nowrap;

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 768px) {

  .contact-page {

    padding:
        18px 12px 28px;

  }


  .page-heading {

    align-items: flex-start;

    flex-direction: column;

    gap: 13px;

    margin-bottom: 15px;

  }


  .page-heading h1 {

    font-size: 1.4rem;

  }


  .page-heading p {

    font-size: .78rem;

  }


  .back-button {

    width: 100%;

  }


  .contact-card {

    padding: 17px 14px;

    border-radius: 16px;

  }


  .contact-card-header {

    align-items: flex-start;

    margin-bottom: 19px;

  }


  .contact-icon {

    width: 43px;

    height: 43px;

    flex-basis: 43px;

    border-radius: 11px;

  }


  .contact-card-header h2 {

    font-size: 1rem;

  }


  .contact-card-header p {

    font-size: .74rem;

    line-height: 1.4;

  }


  .form-group textarea {

    min-height: 145px;

  }


  .contact-info {

    grid-template-columns: 1fr;

  }


  .info-item {

    padding: 10px;

  }

}


/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 380px) {

  .contact-page {

    padding-left: 9px;

    padding-right: 9px;

  }


  .contact-card {

    padding: 14px 11px;

  }


  .contact-card-header {

    gap: 10px;

  }


  .contact-icon {

    width: 39px;

    height: 39px;

    flex-basis: 39px;

  }


  .delivery-status {

    padding: 11px;

  }

}

</style>