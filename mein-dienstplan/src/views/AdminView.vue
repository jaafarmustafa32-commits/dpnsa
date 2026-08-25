<template>
  <div class="admin-container">
    <h2>Dienstplan & Orte verwalten</h2>

    <!-- Steuerung: Mitarbeiter, Monat, Jahr -->
    <div class="admin-controls">
      <div class="control-group">
        <label>Mitarbeiter:</label>
        <select v-model="selectedEmployee" @change="loadSchedule" class="admin-input">
          <option v-for="emp in employees" :key="emp.id" :value="emp">
            {{ emp.full_name }}
          </option>
          <option v-if="employees.length === 0" :value="null" disabled>Keine Mitarbeiter gefunden</option>
        </select>
      </div>

      <div class="control-group">
        <label>Monat:</label>
        <select v-model.number="selectedMonth" @change="loadSchedule" class="admin-input">
          <option v-for="(m, i) in monthNames" :key="i" :value="i + 1">{{ m }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>Jahr:</label>
        <input type="number" v-model.number="selectedYear" @change="loadSchedule" class="admin-input" />
      </div>

      <button class="btn-save" @click="saveSchedule">Plan & Orte speichern</button>
    </div>

    <!-- Tägliche Schicht- und Ort-Verwaltung -->
    <div class="days-editor-grid">
      <div v-for="(day, index) in editableShifts" :key="index" class="day-edit-card">
        <span class="day-label">Tag {{ index + 1 }}</span>

        <!-- Schicht-Auswahl -->
        <select v-model="editableShifts[index].schicht" class="admin-input small">
          <option value="Frei">Frei</option>
          <option value="Urlaub">Urlaub</option>
          <option value="08:00 - 16:00">08:00 - 16:00</option>
          <option value="12:00 - 20:00">12:00 - 20:00</option>
          <option value="19:00 - 07:00">19:00 - 07:00</option>
        </select>

        <!-- Ort-Auswahl -->
        <select v-model="editableShifts[index].ort" class="admin-input small">
          <option value="-">Kein Ort</option>
          <option value="pav20">pav20</option>
          <option value="pav90">pav90</option>
          <option value="ows">ows</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase.js'

const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]

const employees = ref([])
const selectedEmployee = ref(null)
const selectedMonth = ref(8) // August
const selectedYear = ref(2026)
const editableShifts = ref([])

// 1. Mitarbeiter aus der 'employees' Tabelle abrufen
const fetchEmployees = async () => {
  const { data, error } = await supabase.from('employees').select('*')

  if (error) {
    console.error("Fehler beim Laden der Mitarbeiter:", error.message)
    return
  }

  if (data && data.length > 0) {
    employees.value = data
    selectedEmployee.value = data[0] // Ersten Mitarbeiter direkt auswählen
    loadSchedule() // Sofort den Dienstplan dazu laden
  }
}

// 2. Bestehenden Dienstplan aus der 'schedules' Tabelle abrufen
const loadSchedule = async () => {
  if (!selectedEmployee.value) return

  const totalDays = new Date(selectedYear.value, selectedMonth.value, 0).getDate()

  const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', selectedEmployee.value.id)
      .eq('month', selectedMonth.value)
      .eq('year', selectedYear.value)
      .maybeSingle()

  if (!error && data && Array.isArray(data.shifts)) {
    editableShifts.value = data.shifts.map(item => {
      if (typeof item === 'string') {
        return { schicht: item, ort: '-' }
      }
      return item || { schicht: 'Frei', ort: '-' }
    })
  } else {
    editableShifts.value = Array.from({ length: totalDays }, () => ({
      schicht: 'Frei',
      ort: '-'
    }))
  }
}

// 3. Dienstplan und Orte sauber per Upsert in der 'schedules' Tabelle speichern
const saveSchedule = async () => {
  if (!selectedEmployee.value) {
    alert('Bitte wähle zuerst einen Mitarbeiter aus!')
    return
  }

  const payload = {
    user_id: selectedEmployee.value.id,
    employee_name: selectedEmployee.value.full_name,
    month: selectedMonth.value,
    year: selectedYear.value,
    shifts: editableShifts.value
  }

  const { error } = await supabase
      .from('schedules')
      .upsert(payload, {
        onConflict: 'user_id,month,year'
      })

  if (error) {
    alert('Fehler beim Speichern: ' + error.message)
  } else {
    alert('Dienstplan und Orte für ' + selectedEmployee.value.full_name + ' erfolgreich gespeichert!')
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.admin-container {
  padding: 20px;
  color: #fff;
  max-width: 1200px;
  margin: 0 auto;
  font-family: inherit;
}
.admin-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  align-items: flex-end;
  flex-wrap: wrap;
  background: #111827;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85rem;
  color: #94a3b8;
}
.admin-input {
  padding: 8px 12px;
  border-radius: 6px;
  background: #1e293b;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 0.9rem;
}
.small {
  font-size: 0.8rem;
  padding: 6px;
}
.btn-save {
  padding: 9px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-save:hover {
  background: #1d4ed8;
}
.days-editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.day-edit-card {
  background: #131c2e;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(255,255,255,0.05);
}
.day-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: bold;
}
</style>