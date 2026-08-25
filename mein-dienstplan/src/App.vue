<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// Die Routen-Steuerung erfolgt automatisch über den Vue Router
</script>

<style>
/* Globale Einstellungen */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

html, body {
  background-color: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  width: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
@media (max-width: 768px) {
  body, html, #app {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>