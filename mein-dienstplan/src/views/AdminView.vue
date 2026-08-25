<template>
  <div class="admin-container">
    <h2>Admin-Zentrale</h2>

    <!-- Haupt-Navigation Tabs -->
    <div class="admin-tabs">
      <button :class="{ active: currentTab === 'schedule' }" @click="currentTab = 'schedule'">📅 Dienstplan</button>
      <button :class="{ active: currentTab === 'payroll' }" @click="currentTab = 'payroll'">💶 Lohnzettel</button>
      <button :class="{ active: currentTab === 'instructions' }" @click="currentTab = 'instructions'">📢 Anweisungen</button>
      <button :class="{ active: currentTab === 'rules' }" @click="currentTab = 'rules'">📋 Dienstregeln</button>
      <button :class="{ active: currentTab === 'approvals' }" @click="currentTab = 'approvals'">✍️ Profil-Änderungen</button>
      <button :class="{ active: currentTab === 'requests' }" @click="currentTab = 'requests'">🏖️ Urlaub & Krank</button>
    </div>

    <!-- GLOBALE MITARBEITER-AUSWAHL -->
    <div class="admin-controls" v-if="['schedule', 'payroll'].includes(currentTab) || (currentTab === 'instructions' && instructionTarget === 'single')">
      <div class="control-group full-width">
        <label>Mitarbeiter wählen:</label>
        <select v-model="selectedEmployee" @change="onEmployeeChange" class="admin-input">
          <option v-for="emp in employees" :key="emp.id" :value="emp">{{ emp.full_name }}</option>
        </select>
      </div>
    </div>

    <!-- TAB 1: DIENSTPLAN & ORTE -->
    <div v-if="currentTab === 'schedule'" class="tab-content">
      <div class="sub-controls">
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
        <button class="btn-save" @click="saveSchedule">Plan speichern</button>
      </div>

      <div class="days-editor-grid">
        <div v-for="(day, index) in editableShifts" :key="index" class="day-edit-card">
          <span class="day-label">Tag {{ index + 1 }}</span>
          <select v-model="editableShifts[index].schicht" class="admin-input small">
            <option value="Frei">Frei</option>
            <option value="Urlaub">Urlaub</option>
            <option value="08:00 - 16:00">08:00 - 16:00</option>
            <option value="12:00 - 20:00">12:00 - 20:00</option>
            <option value="19:00 - 07:00">19:00 - 07:00</option>
          </select>
          <select v-model="editableShifts[index].ort" class="admin-input small">
            <option value="-">Kein Ort</option>
            <option value="pav20">pav20</option>
            <option value="pav90">pav90</option>
            <option value="ows">ows</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TAB 2: LOHNZETTEL -->
    <div v-if="currentTab === 'payroll'" class="tab-content">
      <div class="card-box">
        <h3>Lohnzettel für {{ selectedEmployee?.full_name }} hochladen</h3>

        <div class="form-grid">
          <div class="control-group">
            <label>Bezeichnung (z.B. August 2026):</label>
            <input type="text" v-model="payrollTitle" placeholder="Monat / Titel" class="admin-input" />
          </div>
          <div class="control-group">
            <label>Brutto (€):</label>
            <input type="number" step="0.01" v-model="payrollBrutto" placeholder="0.00" class="admin-input" />
          </div>
          <div class="control-group">
            <label>Netto (€):</label>
            <input type="number" step="0.01" v-model="payrollNetto" placeholder="0.00" class="admin-input" />
          </div>
          <div class="control-group full-width">
            <label>Lohnzettel PDF:</label>
            <input type="file" @change="handlePayrollFile" accept=".pdf" class="admin-input file-input" />
          </div>
        </div>

        <button class="btn-save" @click="uploadPayroll">Lohnzettel abschicken</button>
      </div>
    </div>

    <!-- TAB 3: DIENSTANWEISUNGEN -->
    <div v-if="currentTab === 'instructions'" class="tab-content">
      <div class="card-box">
        <h3>Neue Dienstanweisung erstellen</h3>

        <div class="control-group">
          <label>Empfängerkreis:</label>
          <select v-model="instructionTarget" class="admin-input">
            <option value="all">👥 Alle Mitarbeiter (Global)</option>
            <option value="single">👤 Bestimmter Mitarbeiter</option>
          </select>
        </div>

        <div class="control-group" v-if="instructionTarget === 'single'">
          <label>Mitarbeiter auswählen:</label>
          <select v-model="selectedEmployee" class="admin-input">
            <option v-for="emp in employees" :key="emp.id" :value="emp">{{ emp.full_name }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Anweisungstext:</label>
          <textarea v-model="newInstructionText" placeholder="Schreibe hier die Anweisung..." class="admin-textarea"></textarea>
        </div>

        <div class="control-group">
          <label>PDF-Dokument anhängen (Optional):</label>
          <input type="file" @change="handleInstructionFile" accept=".pdf" class="admin-input file-input" />
        </div>

        <button class="btn-save" @click="saveInstruction">Anweisung senden</button>
      </div>
    </div>

    <!-- TAB 4: DIENSTREGELN (NEU) -->
    <div v-if="currentTab === 'rules'" class="tab-content">
      <div class="card-box">
        <h3>Dienstregelung & Arbeitsrichtlinien verwalten</h3>
        <p class="section-desc">Hier festgelegte Regeln gelten als verbindliche Betriebsvereinbarung für das Team.</p>

        <div class="control-group">
          <label>Titel der Regelung:</label>
          <input type="text" v-model="newRuleTitle" placeholder="z.B. Kernarbeitszeiten & Pausenregelung" class="admin-input" />
        </div>

        <div class="control-group">
          <label>Inhalt / Beschreibung:</label>
          <textarea v-model="newRuleText" placeholder="Detaillierte Bedingungen der Dienstregelung..." class="admin-textarea"></textarea>
        </div>

        <button class="btn-save" @click="saveRule">Dienstregelung veröffentlichen</button>
      </div>
    </div>

    <!-- TAB 5: PROFIL-ÄNDERUNGSANTRÄGE -->
    <div v-if="currentTab === 'approvals'" class="tab-content">
      <h3>Ausstehende Profil-Änderungen</h3>
      <div v-for="req in pendingProfileRequests" :key="req.id" class="request-card">
        <p><strong>Mitarbeiter:</strong> {{ req.employee_name }}</p>
        <p><strong>Änderungswunsch:</strong> {{ req.field_name }} ➔ <code>{{ req.new_value }}</code></p>
        <div class="action-buttons">
          <button class="btn-approve" @click="handleProfileRequest(req, true)">Genehmigen</button>
          <button class="btn-reject" @click="handleProfileRequest(req, false)">Ablehnen</button>
        </div>
      </div>
      <p v-if="pendingProfileRequests.length === 0" class="empty-text">Keine ausstehenden Änderungen.</p>
    </div>

    <!-- TAB 6: URLAUB & KRANKMELDUNGEN (Mit Beispiel-Daten) -->
    <div v-if="currentTab === 'requests'" class="tab-content">
      <h3>Urlaubs- & Krankmeldungs-Anträge</h3>

      <div v-for="item in leaveRequests" :key="item.id" class="request-card">
        <div class="request-header">
          <p><strong>Mitarbeiter:</strong> {{ item.employee_name }}</p>
          <span :class="['badge', item.type]">{{ item.type.toUpperCase() }}</span>
        </div>
        <p><strong>Zeitraum:</strong> {{ item.start_date }} bis {{ item.end_date }}</p>
        <p><strong>Grund / Notiz:</strong> {{ item.reason || 'Keine Angabe' }}</p>
        <p><strong>Status:</strong> <span :class="item.status">{{ item.status.toUpperCase() }}</span></p>

        <div class="action-buttons" v-if="item.status === 'pending'">
          <button class="btn-approve" @click="updateLeaveStatus(item.id, 'approved')">Genehmigen</button>
          <button class="btn-reject" @click="updateLeaveStatus(item.id, 'rejected')">Ablehnen</button>
        </div>
      </div>

      <p v-if="leaveRequests.length === 0" class="empty-text">Keine offenen Anträge vorhanden.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../config/supabase.js'

const currentTab = ref('schedule')
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]

const employees = ref([])
const selectedEmployee = ref(null)
const selectedMonth = ref(8)
const selectedYear = ref(2026)
const editableShifts = ref([])

// Tab 2 States (Lohnzettel)
const payrollTitle = ref('')
const payrollBrutto = ref('')
const payrollNetto = ref('')
const payrollFile = ref(null)

// Tab 3 States (Anweisungen)
const instructionTarget = ref('all')
const newInstructionText = ref('')
const instructionFile = ref(null)

// Tab 4 States (Dienstregeln)
const newRuleTitle = ref('')
const newRuleText = ref('')

// Tab 5 States (Profil-Änderungen)
const pendingProfileRequests = ref([
  { id: 1, employee_name: 'Max Mustermann', field_name: 'Telefonnummer', new_value: '+43 660 1234567' }
])

// Tab 6 States (Urlaub & Krank mit Beispielen)
const leaveRequests = ref([
  {
    id: 101,
    employee_name: 'Max Mustermann',
    type: 'urlaub',
    start_date: '2026-09-01',
    end_date: '2026-09-07',
    reason: 'Sommerurlaub mit Familie',
    status: 'pending'
  },
  {
    id: 102,
    employee_name: 'Anna Schmidt',
    type: 'krank',
    start_date: '2026-08-24',
    end_date: '2026-08-26',
    reason: 'Grippaler Infekt (Bestätigung folgt)',
    status: 'pending'
  }
])

const fetchEmployees = async () => {
  const { data } = await supabase.from('employees').select('*')
  if (data && data.length > 0) {
    employees.value = data
    selectedEmployee.value = data[0]
    loadSchedule()
  }
}

const onEmployeeChange = () => {
  loadSchedule()
}

const loadSchedule = async () => {
  if (!selectedEmployee.value) return
  const totalDays = new Date(selectedYear.value, selectedMonth.value, 0).getDate()

  const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', selectedEmployee.value.id)
      .eq('month', selectedMonth.value)
      .eq('year', selectedYear.value)
      .maybeSingle()

  if (data && Array.isArray(data.shifts)) {
    editableShifts.value = data.shifts.map(item => (typeof item === 'string' ? { schicht: item, ort: '-' } : item))
  } else {
    editableShifts.value = Array.from({ length: totalDays }, () => ({ schicht: 'Frei', ort: '-' }))
  }
}

const saveSchedule = async () => {
  if (!selectedEmployee.value) return
  const payload = {
    user_id: selectedEmployee.value.id,
    month: selectedMonth.value,
    year: selectedYear.value,
    shifts: editableShifts.value
  }

  const { error } = await supabase.from('schedules').upsert(payload, { onConflict: 'user_id,month,year' })
  if (error) alert('Fehler: ' + error.message)
  else alert('Dienstplan erfolgreich gespeichert!')
}

const handlePayrollFile = (e) => { payrollFile.value = e.target.files[0] }
const handleInstructionFile = (e) => { instructionFile.value = e.target.files[0] }

const uploadPayroll = async () => {
  if (!selectedEmployee.value) return
  alert(`Lohnzettel für ${selectedEmployee.value.full_name} hochgeladen.`)
}

const saveInstruction = async () => {
  alert('Dienstanweisung erfolgreich gespeichert!')
}

const saveRule = async () => {
  alert(`Dienstregelung "${newRuleTitle.value}" erfolgreich veröffentlicht!`)
  newRuleTitle.value = ''
  newRuleText.value = ''
}

const handleProfileRequest = async (req, approved) => {
  pendingProfileRequests.value = pendingProfileRequests.value.filter(item => item.id !== req.id)
  alert(approved ? 'Profil-Änderung genehmigt.' : 'Abgelehnt.')
}

const updateLeaveStatus = async (id, status) => {
  const req = leaveRequests.value.find(item => item.id === id)
  if (req) req.status = status
  alert(`Antrag Status aktualisiert zu: ${status.toUpperCase()}`)
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.admin-container {
  padding: 15px;
  color: #fff;
  max-width: 1200px;
  margin: 0 auto;
  font-family: inherit;
  box-sizing: border-box;
}

h2 { font-size: 1.5rem; margin-bottom: 15px; }
h3 { font-size: 1.1rem; margin-bottom: 10px; }

.section-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 10px;
}

/* Navbar / Tabs */
.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.admin-tabs button {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.admin-tabs button.active {
  background: #2563eb;
  color: #fff;
  border-color: #3b82f6;
}

/* Controls & Formulare */
.admin-controls, .sub-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  background: #111827;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.85rem;
  color: #94a3b8;
  flex: 1;
  min-width: 140px;
}

.control-group.full-width { flex: 100%; }

.admin-input, .admin-textarea {
  padding: 10px 12px;
  border-radius: 6px;
  background: #1e293b;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}

.file-input { padding: 7px; font-size: 0.85rem; }
.admin-textarea { height: 120px; resize: vertical; }
.small { font-size: 0.8rem; padding: 6px; }

/* Buttons */
.btn-save {
  padding: 10px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.btn-save:hover { background: #1d4ed8; }

/* Grid für Dienstplan Tage */
.days-editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.day-edit-card {
  background: #131c2e;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgba(255,255,255,0.05);
}

.day-label { font-size: 0.75rem; color: #94a3b8; font-weight: bold; }

/* Boxen & Karten */
.card-box {
  background: #111827;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-grid { display: flex; flex-direction: column; gap: 12px; }

.request-card {
  background: #111827;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge.urlaub { background: #3b82f6; color: white; }
.badge.krank { background: #eab308; color: black; }

.pending { color: #f59e0b; font-weight: bold; }
.approved { color: #10b981; font-weight: bold; }
.rejected { color: #ef4444; font-weight: bold; }

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.btn-approve, .btn-reject {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-approve { background: #10b981; color: white; }
.btn-reject { background: #ef4444; color: white; }

.empty-text {
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
}

@media (min-width: 768px) {
  .admin-container { padding: 25px; }
  .admin-tabs button { flex: initial; }
  .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
  .control-group.full-width { grid-column: span 2; }
  .btn-save { width: auto; align-self: flex-start; }
}
</style>