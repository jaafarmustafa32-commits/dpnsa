<template>
  <div class="login-page">

    <!-- Hintergrund -->
    <div class="login-glow glow-one"></div>
    <div class="login-glow glow-two"></div>

    <main class="login-wrapper">

      <!-- BRAND -->
      <div class="login-brand">
        <div class="brand-mark">
          <i class="fa-solid fa-shield-halved"></i>
        </div>

        <div>
          <strong>MITARBEITER PORTAL</strong>
          <span>Dienstplan Management</span>
        </div>
      </div>


      <!-- LOGIN CARD -->
      <section class="login-card">

        <div class="login-header">

          <div class="welcome-icon">
            <i class="fa-solid fa-user-lock"></i>
          </div>

          <div>
            <span class="eyebrow">
              SICHERER ZUGANG
            </span>

            <h1>
              Willkommen zurück
            </h1>

            <p>
              Melde dich an, um deinen Dienstplan zu verwalten.
            </p>
          </div>

        </div>


        <!-- LOGIN FORM -->
        <form
            class="login-form"
            @submit.prevent="handleLogin"
        >

          <!-- USERNAME -->
          <div class="form-group">

            <label for="username">
              Benutzername / E-Mail
            </label>

            <div class="input-wrapper">

              <div class="input-icon">
                <i class="fa-regular fa-user"></i>
              </div>

              <input
                  id="username"
                  v-model="username"
                  type="text"
                  placeholder="Benutzername eingeben"
                  autocomplete="username"
                  required
              />

            </div>

          </div>


          <!-- PASSWORD -->
          <div class="form-group">

            <div class="label-row">

              <label for="password">
                Passwort
              </label>

            </div>

            <div class="input-wrapper">

              <div class="input-icon">
                <i class="fa-solid fa-lock"></i>
              </div>

              <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Passwort eingeben"
                  autocomplete="current-password"
                  required
              />

              <button
                  type="button"
                  class="password-toggle"
                  :aria-label="
                  showPassword
                    ? 'Passwort ausblenden'
                    : 'Passwort anzeigen'
                "
                  @click="showPassword = !showPassword"
              >
                <i
                    class="fa-solid"
                    :class="
                    showPassword
                      ? 'fa-eye-slash'
                      : 'fa-eye'
                  "
                ></i>
              </button>

            </div>

          </div>


          <!-- ERROR -->
          <transition name="error">

            <div
                v-if="errorMessage"
                class="error-message"
            >

              <div class="error-icon">
                <i class="fa-solid fa-circle-exclamation"></i>
              </div>

              <div>
                <strong>Anmeldung fehlgeschlagen</strong>
                <span>{{ errorMessage }}</span>
              </div>

            </div>

          </transition>


          <!-- LOGIN BUTTON -->
          <button
              type="submit"
              class="login-button"
              :disabled="isLoading"
          >

            <span v-if="!isLoading">
              Anmelden
              <i class="fa-solid fa-arrow-right"></i>
            </span>

            <span
                v-else
                class="loading-state"
            >
              <i class="fa-solid fa-circle-notch fa-spin"></i>
              Anmeldung läuft...
            </span>

          </button>

        </form>


        <!-- FOOTER -->
        <footer class="login-footer">

          <router-link
              to="/kontakt"
              class="help-link"
          >

            <span class="help-icon">
              <i class="fa-solid fa-circle-question"></i>
            </span>

            Zugangsdaten vergessen?

          </router-link>

        </footer>

      </section>


      <!-- SECURITY -->
      <div class="security-note">

        <i class="fa-solid fa-shield-halved"></i>

        <span>
          Sicherer Zugang zum Mitarbeiterportal
        </span>

      </div>

    </main>


    <!-- THEME -->
    <button
        type="button"
        class="theme-button"
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

  </div>
</template>


<script setup>

import {
  ref,
  onMounted
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  supabase
} from '@/config/supabase.js'

import {
  useAppStore
} from '@/stores/app.js'


/* =========================================================
   ROUTER
========================================================= */

const router = useRouter()


/* =========================================================
   ZENTRALER THEME STORE
========================================================= */

const {
  isLightMode,
  toggleTheme,
  initTheme
} = useAppStore()


/* =========================================================
   FORM
========================================================= */

const username = ref('')

const password = ref('')

const showPassword = ref(false)

const isLoading = ref(false)

const errorMessage = ref('')


/* =========================================================
   LOGIN
========================================================= */

const handleLogin = async () => {

  errorMessage.value = ''

  isLoading.value = true

  try {

    const cleanUsername =
        username.value.trim()

    const cleanPassword =
        password.value.trim()


    if (
        !cleanUsername ||
        !cleanPassword
    ) {

      errorMessage.value =
          'Bitte Benutzername und Passwort eingeben.'

      return
    }


    /* =====================================================
       SUPABASE
    ===================================================== */

    const {
      data,
      error
    } = await supabase

        .from('app_users')

        .select('*')

        .eq(
            'username',
            cleanUsername
        )

        .eq(
            'password',
            cleanPassword
        )

        .maybeSingle()


    /* =====================================================
       DATABASE ERROR
    ===================================================== */

    if (error) {

      console.error(
          'Supabase Fehlerdetails:',
          error
      )

      errorMessage.value =
          'Datenbank-Fehler: ' +
          error.message

      return
    }


    /* =====================================================
       LOGIN ERROR
    ===================================================== */

    if (!data) {

      errorMessage.value =
          'Falscher Benutzername oder Passwort!'

      return
    }


    /* =====================================================
       USER SPEICHERN
    ===================================================== */

    localStorage.setItem(
        'currentUser',
        JSON.stringify(data)
    )


    /* =====================================================
       ROLE REDIRECT
    ===================================================== */

    if (data.role === 'admin') {

      await router.push('/admin')

    } else {

      await router.push('/home')

    }

  } catch (error) {

    console.error(
        'Unerwarteter Fehler:',
        error
    )

    errorMessage.value =
        'Verbindungsfehler zur Datenbank.'

  } finally {

    isLoading.value = false

  }

}


/* =========================================================
   THEME INITIALISIEREN
========================================================= */

onMounted(() => {

  initTheme()

})

</script>


<style scoped>

/* =========================================================
   PAGE
========================================================= */

.login-page {

  --login-bg:
      #080d17;

  --login-surface:
      #111a29;

  --login-surface-soft:
      #0d1523;

  --login-border:
      rgba(255,255,255,.08);

  --login-text:
      #f4f7fb;

  --login-text-soft:
      #9aa8bb;

  --login-text-muted:
      #64748b;

  --login-accent:
      #38bdf8;

  --login-accent-dark:
      #0284c7;

  --login-danger:
      #f43f5e;

  min-height: 100vh;
  min-height: 100dvh;

  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;

  overflow: hidden;

  padding: 32px 18px;

  background:
      radial-gradient(
          circle at 15% 10%,
          rgba(56,189,248,.09),
          transparent 28%
      ),
      radial-gradient(
          circle at 90% 90%,
          rgba(99,102,241,.08),
          transparent 30%
      ),
      var(--login-bg);

  color: var(--login-text);

  transition:
      background .3s ease,
      color .3s ease;

}


/* =========================================================
   LIGHT MODE
========================================================= */

:global(html.light-theme) .login-page {

  --login-bg:
      #f4f7fb;

  --login-surface:
      #ffffff;

  --login-surface-soft:
      #f8fafc;

  --login-border:
      #e4eaf1;

  --login-text:
      #152033;

  --login-text-soft:
      #66758a;

  --login-text-muted:
      #91a0b3;

  --login-accent:
      #0284c7;

  --login-accent-dark:
      #0369a1;

  --login-danger:
      #dc3545;

  background:
      radial-gradient(
          circle at 15% 10%,
          rgba(14,165,233,.08),
          transparent 28%
      ),
      #f4f7fb;

}


/* =========================================================
   GLOW
========================================================= */

.login-glow {

  position: absolute;

  width: 420px;
  height: 420px;

  border-radius: 50%;

  filter: blur(80px);

  pointer-events: none;

  opacity: .35;

}

.glow-one {

  top: -220px;
  left: -160px;

  background:
      rgba(56,189,248,.16);

}

.glow-two {

  bottom: -240px;
  right: -180px;

  background:
      rgba(99,102,241,.14);

}


/* =========================================================
   WRAPPER
========================================================= */

.login-wrapper {

  width: 100%;

  max-width: 440px;

  position: relative;

  z-index: 2;

}


/* =========================================================
   BRAND
========================================================= */

.login-brand {

  display: flex;

  align-items: center;

  gap: 12px;

  margin-bottom: 22px;

  padding-left: 4px;

}

.brand-mark {

  width: 44px;
  height: 44px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background:
      linear-gradient(
          135deg,
          var(--login-accent),
          var(--login-accent-dark)
      );

  color: white;

  box-shadow:
      0 10px 28px
      rgba(14,165,233,.22);

}

.login-brand strong {

  display: block;

  font-size: 12px;

  letter-spacing: .11em;

  font-weight: 800;

}

.login-brand span {

  display: block;

  margin-top: 2px;

  color:
      var(--login-text-muted);

  font-size: 11px;

}


/* =========================================================
   CARD
========================================================= */

.login-card {

  width: 100%;

  padding: 32px;

  border-radius: 22px;

  background:
      var(--login-surface);

  border:
      1px solid var(--login-border);

  box-shadow:
      0 28px 70px
      rgba(0,0,0,.22);

  transition:
      background .3s ease,
      border-color .3s ease,
      box-shadow .3s ease;

}

:global(html.light-theme) .login-card {

  box-shadow:
      0 24px 60px
      rgba(15,23,42,.08);

}


/* =========================================================
   HEADER
========================================================= */

.login-header {

  display: flex;

  align-items: flex-start;

  gap: 15px;

  margin-bottom: 30px;

}

.welcome-icon {

  width: 46px;
  height: 46px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background:
      rgba(56,189,248,.11);

  color:
      var(--login-accent);

  border:
      1px solid
      rgba(56,189,248,.16);

}

.eyebrow {

  display: block;

  margin-bottom: 5px;

  color:
      var(--login-accent);

  font-size: 10px;

  font-weight: 800;

  letter-spacing: .12em;

}

.login-header h1 {

  margin: 0;

  font-size: 25px;

  line-height: 1.2;

  letter-spacing: -.025em;

}

.login-header p {

  margin: 7px 0 0;

  color:
      var(--login-text-soft);

  font-size: 13px;

  line-height: 1.55;

}


/* =========================================================
   FORM
========================================================= */

.login-form {

  display: flex;

  flex-direction: column;

  gap: 19px;

}

.form-group {

  display: flex;

  flex-direction: column;

  gap: 7px;

}

.form-group label {

  color:
      var(--login-text);

  font-size: 12px;

  font-weight: 700;

}


/* =========================================================
   INPUT
========================================================= */

.input-wrapper {

  position: relative;

  display: flex;

  align-items: center;

}

.input-icon {

  position: absolute;

  left: 15px;

  z-index: 2;

  color:
      var(--login-text-muted);

  pointer-events: none;

}

.input-wrapper input {

  width: 100%;

  height: 52px;

  padding:
      0 45px 0 44px;

  border-radius: 12px;

  border:
      1px solid
      var(--login-border);

  outline: none;

  background:
      var(--login-surface-soft);

  color:
      var(--login-text);

  font-family: inherit;

  font-size: 14px;

  transition:
      border-color .2s ease,
      box-shadow .2s ease,
      background .2s ease;

}

.input-wrapper input::placeholder {

  color:
      var(--login-text-muted);

}

.input-wrapper input:focus {

  border-color:
      var(--login-accent);

  box-shadow:
      0 0 0 4px
      rgba(56,189,248,.10);

}

:global(html.light-theme)
.input-wrapper input:focus {

  box-shadow:
      0 0 0 4px
      rgba(2,132,199,.10);

}


/* =========================================================
   PASSWORD
========================================================= */

.password-toggle {

  position: absolute;

  right: 7px;

  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  border: none;

  background: transparent;

  color:
      var(--login-text-muted);

  border-radius: 9px;

  cursor: pointer;

  transition:
      background .2s ease,
      color .2s ease;

}

.password-toggle:hover {

  background:
      rgba(148,163,184,.10);

  color:
      var(--login-text);

}


/* =========================================================
   ERROR
========================================================= */

.error-message {

  display: flex;

  align-items: flex-start;

  gap: 10px;

  padding: 12px;

  border-radius: 11px;

  border:
      1px solid
      rgba(244,63,94,.18);

  background:
      rgba(244,63,94,.08);

  color:
      var(--login-text);

}

.error-icon {

  color:
      var(--login-danger);

  padding-top: 1px;

}

.error-message strong {

  display: block;

  font-size: 11px;

}

.error-message span {

  display: block;

  margin-top: 3px;

  color:
      var(--login-text-soft);

  font-size: 11px;

  line-height: 1.4;

}


/* =========================================================
   LOGIN BUTTON
========================================================= */

.login-button {

  width: 100%;

  height: 52px;

  border: none;

  border-radius: 12px;

  background:
      linear-gradient(
          135deg,
          var(--login-accent),
          var(--login-accent-dark)
      );

  color: white;

  font-family: inherit;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  box-shadow:
      0 10px 24px
      rgba(14,165,233,.18);

  transition:
      transform .18s ease,
      box-shadow .18s ease,
      opacity .18s ease;

}

.login-button span {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 9px;

}

.login-button:hover:not(:disabled) {

  transform: translateY(-1px);

  box-shadow:
      0 14px 30px
      rgba(14,165,233,.24);

}

.login-button:active:not(:disabled) {

  transform: translateY(0);

}

.login-button:disabled {

  opacity: .7;

  cursor: wait;

}


/* =========================================================
   FOOTER
========================================================= */

.login-footer {

  margin-top: 23px;

  padding-top: 20px;

  border-top:
      1px solid
      var(--login-border);

  text-align: center;

}

.help-link {

  display: inline-flex;

  align-items: center;

  gap: 8px;

  color:
      var(--login-text-soft);

  text-decoration: none;

  font-size: 12px;

  transition:
      color .2s ease;

}

.help-link:hover {

  color:
      var(--login-accent);

}

.help-icon {

  display: grid;

  place-items: center;

}


/* =========================================================
   SECURITY
========================================================= */

.security-note {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  margin-top: 18px;

  color:
      var(--login-text-muted);

  font-size: 10px;

}

.security-note i {

  color:
      var(--login-accent);

}


/* =========================================================
   THEME BUTTON
========================================================= */

.theme-button {

  position: fixed;

  right: 20px;
  top: 20px;

  z-index: 20;

  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 12px;

  border:
      1px solid
      var(--login-border);

  background:
      var(--login-surface);

  color:
      var(--login-text-soft);

  cursor: pointer;

  box-shadow:
      0 8px 25px
      rgba(0,0,0,.10);

  transition:
      background .25s ease,
      color .2s ease,
      transform .2s ease;

}

.theme-button:hover {

  color:
      var(--login-accent);

  transform:
      translateY(-1px);

}


/* =========================================================
   ERROR ANIMATION
========================================================= */

.error-enter-active,
.error-leave-active {

  transition:
      opacity .2s ease,
      transform .2s ease;

}

.error-enter-from,
.error-leave-to {

  opacity: 0;

  transform:
      translateY(-5px);

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 520px) {

  .login-page {

    padding:
        24px 14px;

  }

  .login-card {

    padding:
        25px 20px;

    border-radius:
        18px;

  }

  .login-brand {

    margin-bottom:
        17px;

  }

  .login-header {

    gap: 12px;

    margin-bottom:
        24px;

  }

  .welcome-icon {

    width: 42px;
    height: 42px;

  }

  .login-header h1 {

    font-size:
        22px;

  }

  .login-header p {

    font-size:
        12px;

  }

  .theme-button {

    top: 14px;
    right: 14px;

    width: 40px;
    height: 40px;

  }

}

</style>