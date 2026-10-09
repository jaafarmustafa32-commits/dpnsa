<template>
  <div class="admin-app">
    <aside class="sidebar" :class="{ 'sidebar-open': false }">
      <div class="brand">
        <div class="brand-mark">D</div>
        <div>
          <strong>Dienstplan</strong>
          <span>ADMIN CONSOLE</span>
        </div>
      </div>

      <div class="sidebar-label">Arbeitsbereich</div>

      <nav class="side-nav">
        <button class="nav-item" :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">
          <span class="nav-icon">◫</span><span>Schichtplan</span>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'matrix' }" @click="activeTab = 'matrix'">
          <span class="nav-icon">▦</span><span>Planungsmatrix</span>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'preferences' }" @click="activeTab = 'preferences'">
          <span class="nav-icon">✦</span><span>Präferenzen & KI</span>
        </button>

        <div class="nav-divider"></div>
        <div class="sidebar-label">Verwaltung</div>

        <button class="nav-item" :class="{ active: activeTab === 'vacations' }" @click="activeTab = 'vacations'">
          <span class="nav-icon">◷</span><span>Urlaubsanträge</span>
          <b v-if="vacationRequests.filter(r => r.status === 'pending').length" class="nav-count">
            {{ vacationRequests.filter(r => r.status === 'pending').length }}
          </b>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'payroll' }" @click="activeTab = 'payroll'">
          <span class="nav-icon">€</span><span>Lohnzettel</span>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'messages' }" @click="activeTab = 'messages'">
          <span class="nav-icon">↗</span><span>Nachrichten</span>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
          <span class="nav-icon">◉</span><span>Benachrichtigungen</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="admin-mini" v-if="adminName">
          <div class="avatar">{{ adminName.charAt(0).toUpperCase() }}</div>
          <div class="admin-mini-text">
            <strong>{{ adminName }}</strong>
            <span>Administrator</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">Abmelden <span>↗</span></button>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <div class="breadcrumb">ADMIN / {{ activeTab.toUpperCase() }}</div>
          <h1>
            {{
              activeTab === 'schedule' ? 'Schichtplan' :
                  activeTab === 'matrix' ? 'Planungsmatrix' :
                      activeTab === 'preferences' ? 'Präferenzen & KI' :
                          activeTab === 'vacations' ? 'Urlaubsanträge' :
                              activeTab === 'payroll' ? 'Lohnzettel' :
                                  activeTab === 'messages' ? 'Nachrichten' : 'Benachrichtigungen'
            }}
          </h1>
        </div>
        <div class="top-actions">
          <div class="status-pill"><i></i> System aktiv</div>
          <div class="top-date">{{ monthNames[selectedMonth] }} {{ currentYear }}</div>
        </div>
      </header>

      <div class="content">

        <!-- SCHICHTPLAN -->
        <section v-if="activeTab === 'schedule'">
          <div class="hero-row">
            <div>
              <span class="eyebrow">DIENSTPLANUNG</span>
              <h2>Dein Monatsplan auf einen Blick.</h2>
              <p>Schichten bearbeiten, Mitarbeiter wechseln und Dienste direkt im Kalender verwalten.</p>
            </div>
            <div class="hero-stat">
              <span>Mitarbeiter</span>
              <strong>{{ employeesList.length }}</strong>
            </div>
          </div>

          <div class="control-card">
            <div class="control-title">Ansicht konfigurieren</div>
            <div class="controls-grid">
              <label>
                <span>Modus</span>
                <select v-model="scheduleViewMode" @change="fetchGlobalOrEmployeeSchedules">
                  <option value="employee">Einzelner Mitarbeiter</option>
                  <option value="global">Gesamtübersicht</option>
                </select>
              </label>
              <label v-if="scheduleViewMode === 'employee'">
                <span>Mitarbeiter</span>
                <select v-model="selectedEmployeeId" @change="fetchEmployeeSchedules">
                  <option disabled value="">Mitarbeiter wählen</option>
                  <option v-for="emp in employeesList" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
                </select>
              </label>
              <label>
                <span>Monat</span>
                <select v-model="selectedMonth" @change="fetchGlobalOrEmployeeSchedules">
                  <option v-for="(m, idx) in monthNames" :key="idx" :value="idx">{{ m }} {{ currentYear }}</option>
                </select>
              </label>
            </div>
          </div>

          <div v-if="scheduleViewMode === 'employee' && selectedEmployeeId" class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">KALENDER</span>
                <h3>{{ getSelectedEmployeeName() }}</h3>
              </div>
              <div class="month-switch">
                <button @click="changeMonth(-1)">←</button>
                <strong>{{ monthNames[selectedMonth] }} {{ currentYear }}</strong>
                <button @click="changeMonth(1)">→</button>
              </div>
            </div>

            <div class="calendar-tools">
              <div class="legend">
                <span><i class="dot day"></i> Tag</span>
                <span><i class="dot night"></i> Nacht</span>
                <span><i class="dot vacation"></i> Urlaub</span>
                <span><i class="dot sick"></i> Krank</span>
              </div>
              <button class="danger-ghost" @click="deleteAllSchedulesForEmployeeMonth">Monat löschen</button>
            </div>

            <div class="calendar-grid">
              <button
                  v-for="day in employeeMonthDays"
                  :key="day.dateKey"
                  class="calendar-day"
                  :class="getDayCardClass(day)"
                  @click="selectDayForEditing(day)"
              >
                <div class="calendar-day-head">
                  <span>{{ day.dayName }}</span>
                  <b>{{ day.dayNum }}</b>
                </div>
                <template v-if="day.shift">
                  <span v-if="day.shift.vacation" class="shift-chip vacation">URLAUB</span>
                  <span v-else-if="day.shift.shift_type === 'KR'" class="shift-chip sick">KRANK</span>
                  <span v-else class="shift-chip" :class="day.shift.is_night ? 'night' : 'day'">
                    {{ day.shift.shift_type }}
                  </span>
                  <strong class="day-location">{{ day.shift.ort }}</strong>
                  <small>{{ day.shift.shift_time }} · {{ day.shift.hours }}h</small>
                </template>
                <span v-else class="free-label">Frei</span>
              </button>
            </div>
          </div>

          <div v-if="scheduleViewMode === 'global'" class="panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">GESAMTÜBERSICHT</span>
                <h3>{{ monthNames[selectedMonth] }} {{ currentYear }}</h3>
              </div>
              <button class="danger-ghost" @click="deleteAllMonthSchedules">Gesamten Monat löschen</button>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <thead>
                <tr><th>Mitarbeiter</th><th>Stunden</th><th>Schichten</th><th>Standorte</th></tr>
                </thead>
                <tbody>
                <tr v-for="emp in employeesList" :key="emp.id">
                  <td><strong>{{ emp.name }}</strong></td>
                  <td><span class="hours-badge" :class="getEmployeeHoursClass(emp.id)">{{ getEmployeeMonthHours(emp.id) }} h</span></td>
                  <td>{{ globalMonthSchedules.filter(s => s.user_id === emp.id).length }}</td>
                  <td>{{ [...new Set(globalMonthSchedules.filter(s => s.user_id === emp.id).map(s => s.ort))].join(', ') || '—' }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="form.date" class="editor-panel">
            <div class="editor-head">
              <div><span class="eyebrow">SCHICHT BEARBEITEN</span><h3>{{ form.date }}</h3></div>
              <span v-if="isEditing" class="edit-tag">BEARBEITEN</span>
            </div>
            <div class="editor-grid">
              <label><span>Mitarbeiter</span><select v-model="form.user_id"><option v-for="e in employeesList" :key="e.id" :value="e.id">{{ e.name }}</option></select></label>
              <label><span>Standort</span><select v-model="form.ort" @change="onLocationChange"><option v-for="loc in availableLocations" :key="loc.name" :value="loc.name">{{ loc.name }}</option><option value="Urlaub">Urlaub</option><option value="Krank">Krank</option></select></label>
              <label><span>Schicht</span><select v-model="form.shift_type"><option value="TD">Tag</option><option value="ND">Nacht</option><option value="UR">Urlaub</option><option value="KR">Krank</option></select></label>
              <label><span>Stunden</span><input v-model.number="form.hours" type="number" min="1" max="24"></label>
              <label><span>Uhrzeit</span><input v-model="form.shift_time" type="text"></label>
            </div>
            <div class="quick-actions">
              <button @click="setDayShift">☀ Tag</button>
              <button @click="setNightShift">☾ Nacht</button>
              <button @click="setVacation">Urlaub</button>
              <button @click="setSick">Krank</button>
            </div>
            <div class="editor-actions">
              <span class="message">{{ message }}</span>
              <div>
                <button v-if="isEditing" class="danger-btn" @click="deleteShift">Löschen</button>
                <button class="primary-btn" @click="saveShift">Schicht speichern</button>
              </div>
            </div>
          </div>
        </section>

        <!-- MATRIX -->
        <section v-if="activeTab === 'matrix'">
          <div class="hero-row compact">
            <div><span class="eyebrow">PLANNING BOARD</span><h2>Monatsmatrix</h2><p>Alle Mitarbeiter, Tage und Standorte in einer einzigen übersichtlichen Planung.</p></div>
            <div class="matrix-month">
              <button @click="changeMonth(-1)">←</button>
              <strong>{{ monthNames[selectedMonth] }} {{ currentYear }}</strong>
              <button @click="changeMonth(1)">→</button>
            </div>
          </div>

          <div class="matrix-toolbar">
            <label><span>Standortfilter</span><select v-model="matrixLocationFilter"><option value="all">Alle Standorte</option><option v-for="loc in availableLocations" :key="loc.name" :value="loc.name">{{ loc.name }}</option></select></label>
            <div class="matrix-actions">
              <button class="danger-ghost" @click="deleteLocationMonthSchedule">Standort löschen</button>
              <button class="danger-ghost" @click="deleteAllMonthSchedules">Gesamten Monat löschen</button>
            </div>
          </div>

          <div class="coverage-grid">
            <div v-for="status in locationMonthlyStatus" :key="status.name" class="coverage-card">
              <div><span>{{ status.name }}</span><b :class="{ bad: status.missing }">{{ status.missing ? status.missing + ' offen' : 'Vollständig' }}</b></div>
              <div class="coverage-track"><i :style="{ width: Math.min(100, status.required ? (status.covered / status.required) * 100 : 100) + '%' }"></i></div>
              <small>{{ status.covered }} / {{ status.required }} Schichten</small>
            </div>
          </div>

          <div class="matrix-panel">
            <div class="matrix-scroll">
              <table class="matrix-table">
                <thead>
                <tr>
                  <th class="sticky-col employee-col">Mitarbeiter</th>
                  <th class="sticky-hours">Std.</th>
                  <th v-for="day in matrixDaysCount" :key="day" :class="{ weekend: ['Sa','So'].includes(getMatrixDayName(day)) }">
                    <span>{{ getMatrixDayName(day) }}</span><b>{{ day }}</b>
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="emp in employeesList" :key="emp.id">
                  <td class="sticky-col employee-cell"><div class="employee-avatar">{{ emp.name.charAt(0).toUpperCase() }}</div><strong>{{ emp.name }}</strong></td>
                  <td class="sticky-hours"><span class="hours-badge" :class="getEmployeeHoursClass(emp.id)">{{ getEmployeeMonthHours(emp.id) }}</span></td>
                  <td
                      v-for="day in matrixDaysCount"
                      :key="day"
                      class="matrix-cell"
                      :class="getMatrixCellClass(emp.id, day)"
                      @click="quickEditCell(emp.id, day)"
                  >
                    <template v-if="getMatrixShift(emp.id, day)">
                      <b>{{ getMatrixShift(emp.id, day).vacation ? 'URL' : getMatrixShift(emp.id, day).shift_type }}</b>
                      <small>{{ getMatrixShift(emp.id, day).ort }}</small>
                    </template>
                    <span v-else>·</span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="matrix-note">Tipp: Klicke auf eine Zelle, um den jeweiligen Mitarbeiter und Tag direkt zu bearbeiten.</div>
        </section>

        <!-- PRÄFERENZEN / KI -->
        <section v-if="activeTab === 'preferences'">
          <div class="hero-row compact"><div><span class="eyebrow">AUTOMATION</span><h2>Präferenzen & KI</h2><p>Regeln speichern und den Monatsplan automatisiert erzeugen.</p></div></div>

          <div class="two-col">
            <div class="panel">
              <div class="panel-head"><div><span class="eyebrow">MITARBEITER</span><h3>Präferenzen</h3></div></div>
              <label><span>Mitarbeiter</span><select v-model="selectedPrefEmployeeId" @change="fetchEmployeePreferences"><option disabled value="">Mitarbeiter wählen</option><option v-for="e in employeesList" :key="e.id" :value="e.id">{{ e.name }}</option></select></label>
              <label><span>Max. Monatsstunden</span><input v-model.number="prefForm.max_monthly_hours" type="number"></label>
              <div class="field-block"><span>Bevorzugte Standorte</span><div class="chip-grid"><button v-for="loc in availableLocations" :key="loc.name" class="select-chip" :class="{ selected: prefForm.preferred_locations.includes(loc.name) }" @click="toggleLocation(loc.name)">{{ loc.name }}</button></div></div>
              <div class="field-block"><span>Schichten</span><div class="chip-grid"><button class="select-chip" :class="{ selected: prefForm.preferred_shifts.includes('TD') }" @click="togglePreferredShift('TD')">☀ Tag</button><button class="select-chip" :class="{ selected: prefForm.preferred_shifts.includes('ND') }" @click="togglePreferredShift('ND')">☾ Nacht</button></div></div>
              <div class="field-block"><span>Unerwünschte Wochentage</span><div class="chip-grid"><button v-for="day in daysOfWeekNames" :key="day" class="select-chip" :class="{ selected: prefForm.disliked_days.includes(day) }" @click="toggleDislikedDay(day)">{{ day }}</button></div></div>
              <label><span>Notizen</span><textarea v-model="prefForm.notes" rows="4"></textarea></label>
              <div class="blocked-row"><input v-model="newBlockedDate" type="date"><button class="secondary-btn" @click="addBlockedDate">Datum sperren</button></div>
              <div class="blocked-list"><button v-for="(date, index) in prefForm.blocked_days" :key="date" @click="removeBlockedDate(index)">{{ date }} ×</button></div>
              <div class="editor-actions"><span class="message">{{ prefMessage }}</span><button class="primary-btn" @click="savePreferences">Präferenzen speichern</button></div>
            </div>

            <div class="ai-panel">
              <div class="ai-orb">✦</div><span class="eyebrow">AI SCHEDULER</span><h3>Plan automatisch erzeugen</h3><p>Nutze deine Mitarbeiterregeln und Standortvorgaben als Grundlage für die automatische Planung.</p>
              <label><span>Monat</span><select v-model="selectedAiMonth"><option v-for="(m, idx) in monthNames" :key="idx" :value="idx">{{ m }} {{ currentYear }}</option></select></label>
              <div class="ai-target-switch">
                <button
                    type="button"
                    class="ai-target-option"
                    :class="{ active: aiTargetType === 'all' }"
                    @click="aiTargetType = 'all'"
                >
                  <span class="ai-target-icon">🌍</span>
                  <span>
                    <strong>Gesamter Dienstplan</strong>
                    <small>Alle aktivierten Projekte planen</small>
                  </span>
                  <span v-if="aiTargetType === 'all'" class="ai-target-check">✓</span>
                </button>

                <button
                    type="button"
                    class="ai-target-option"
                    :class="{ active: aiTargetType === 'selected' }"
                    @click="aiTargetType = 'selected'"
                >
                  <span class="ai-target-icon">👤</span>
                  <span>
                    <strong>Mitarbeiter auswählen</strong>
                    <small>Nur ausgewählte Mitarbeiter berücksichtigen</small>
                  </span>
                  <span v-if="aiTargetType === 'selected'" class="ai-target-check">✓</span>
                </button>
              </div>

              <div class="project-picker">
                <div class="project-picker-head">
                  <div>
                    <span class="eyebrow">MITARBEITER-PICKER</span>
                    <strong>Mitarbeiter pro Projekt festlegen</strong>
                    <small>
                      Ein Mitarbeiter kann mehreren Projekten zugeordnet werden.
                      Die Auswahl wird als harte Projektgrenze an den Scheduler übergeben.
                    </small>
                  </div>
                  <div class="project-total">
                    <strong>{{ totalProjectAssignments }}</strong>
                    <small>Zuordnungen</small>
                  </div>
                </div>

                <div class="project-picker-toolbar">
                  <label>
                    <span>Projekt / Standort</span>
                    <select v-model="projectPickerLocation">
                      <option
                          v-for="location in availableLocations"
                          :key="location.name"
                          :value="location.name"
                      >
                        {{ location.name }}
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Mitarbeiter suchen</span>
                    <input
                        v-model="projectEmployeeSearch"
                        type="search"
                        placeholder="Name suchen..."
                    />
                  </label>

                  <div class="project-picker-actions">
                    <button
                        type="button"
                        @click="selectAllProjectEmployees(projectPickerLocation)"
                    >
                      Alle
                    </button>
                    <button
                        type="button"
                        @click="clearProjectEmployees(projectPickerLocation)"
                    >
                      Keine
                    </button>
                  </div>
                </div>

                <div class="project-selected-summary">
                  <strong>{{ projectPickerLocation }}</strong>
                  <span>
                    {{ getProjectEmployeeCount(projectPickerLocation) }}
                    Mitarbeiter ausgewählt
                  </span>
                </div>

                <div class="project-employee-list">
                  <button
                      v-for="employee in filteredProjectEmployees"
                      :key="`project-${projectPickerLocation}-${employee.id}`"
                      type="button"
                      class="project-employee-row"
                      :class="{
                      selected:
                        (projectTeams[projectPickerLocation] || []).includes(employee.id)
                    }"
                      @click="toggleProjectEmployee(projectPickerLocation, employee.id)"
                  >
                    <span class="employee-avatar">
                      {{ getEmployeeInitials(employee.name) }}
                    </span>

                    <span class="employee-picker-info">
                      <strong>{{ employee.name }}</strong>
                      <small>
                        {{ employee.username || employee.email || 'Mitarbeiter' }}
                      </small>
                    </span>

                    <span class="project-employee-check">
                      {{
                        (projectTeams[projectPickerLocation] || []).includes(employee.id)
                            ? '✓'
                            : ''
                      }}
                    </span>
                  </button>

                  <div
                      v-if="filteredProjectEmployees.length === 0"
                      class="employee-picker-empty"
                  >
                    Keine Mitarbeiter gefunden.
                  </div>
                </div>

                <div class="project-pool-overview">
                  <div
                      v-for="location in availableLocations"
                      :key="`pool-${location.name}`"
                      class="project-pool-card"
                      :class="{ active: projectPickerLocation === location.name }"
                      @click="projectPickerLocation = location.name"
                  >
                    <strong>{{ location.name }}</strong>
                    <span>{{ getProjectEmployeeCount(location) }} MA</span>
                  </div>
                </div>
              </div>

              <div v-if="aiTargetType === 'selected'" class="employee-picker">
                <div class="employee-picker-head">
                  <div>
                    <strong>Zusätzliche globale Mitarbeiterauswahl</strong>
                    <small>{{ selectedAiEmployeeIds.length }} von {{ employeesList.length }} ausgewählt</small>
                  </div>
                  <div class="employee-picker-actions">
                    <button type="button" @click="selectAllAiEmployees">Alle</button>
                    <button type="button" @click="clearAiEmployees">Keine</button>
                  </div>
                </div>

                <input
                    v-model="aiEmployeeSearch"
                    class="employee-picker-search"
                    type="search"
                    placeholder="Mitarbeiter suchen..."
                />

                <div class="selected-employee-chips" v-if="selectedAiEmployeeIds.length">
                  <button
                      v-for="id in selectedAiEmployeeIds"
                      :key="`selected-${id}`"
                      type="button"
                      class="selected-employee-chip"
                      @click="toggleAiEmployee(id)"
                  >
                    {{ getEmployeeName(id) }}
                    <span>×</span>
                  </button>
                </div>

                <div class="employee-picker-list">
                  <button
                      v-for="employee in filteredAiEmployees"
                      :key="employee.id"
                      type="button"
                      class="employee-picker-row"
                      :class="{ selected: selectedAiEmployeeIds.includes(employee.id) }"
                      @click="toggleAiEmployee(employee.id)"
                  >
                    <span class="employee-avatar">{{ getEmployeeInitials(employee.name) }}</span>
                    <span class="employee-picker-info">
                      <strong>{{ employee.name }}</strong>
                      <small>{{ employee.username || employee.email || 'Mitarbeiter' }}</small>
                    </span>
                    <span class="employee-picker-check">
                      {{ selectedAiEmployeeIds.includes(employee.id) ? '✓' : '' }}
                    </span>
                  </button>
                </div>
              </div>

              <div class="ai-all-info">
                <span>✓</span>
                <div>
                  <strong>Regelbasierte Planung</strong>
                  <small>
                    Projekt-Pool, Standortpräferenz, Schichtpräferenz, Sperrtage,
                    Ruhezeit und freie Tage werden von der Edge Function geprüft.
                  </small>
                </div>
              </div>

              <button class="ai-btn" @click="generateAiSchedule">
                ✦ KI-Dienstplan generieren
              </button>
              <p class="ai-message">{{ aiMessage }}</p>
            </div>
          </div>
        </section>

        <!-- URLAUB -->
        <section v-if="activeTab === 'vacations'">
          <div class="hero-row compact"><div><span class="eyebrow">ANTRÄGE</span><h2>Urlaubsanträge</h2><p>Anträge prüfen und direkt freigeben oder ablehnen.</p></div></div>
          <div class="panel">
            <div class="table-scroll">
              <table class="data-table">
                <thead><tr><th>Mitarbeiter</th><th>Zeitraum</th><th>Grund</th><th>Status</th><th>Aktion</th></tr></thead>
                <tbody>
                <tr v-for="r in vacationRequests" :key="r.id">
                  <td><strong>{{ getEmployeeName(r.user_id) }}</strong></td><td>{{ r.start_date }} – {{ r.end_date }}</td><td>{{ r.reason || '—' }}</td>
                  <td><span class="status" :class="r.status">{{ r.status }}</span></td>
                  <td class="actions"><button v-if="r.status === 'pending'" class="icon-btn good" @click="updateVacationStatus(r.id,'approved')">✓</button><button v-if="r.status === 'pending'" class="icon-btn warn" @click="updateVacationStatus(r.id,'rejected')">×</button><button class="icon-btn bad" @click="deleteVacationRequest(r.id)">Löschen</button></td>
                </tr>
                <tr v-if="!vacationRequests.length"><td colspan="5" class="empty">Keine Anträge vorhanden.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- LOHN -->
        <section v-if="activeTab === 'payroll'">
          <div class="hero-row compact"><div><span class="eyebrow">PAYROLL</span><h2>Lohnzettel</h2><p>Lohninformationen und Dokumente für Mitarbeiter verwalten.</p></div></div>
          <div class="form-panel">
            <form @submit.prevent="uploadPayroll">
              <div class="form-grid">
                <label><span>Mitarbeiter</span><select v-model="payrollForm.user_id"><option v-for="e in employeesList" :key="e.id" :value="e.id">{{ e.name }}</option></select></label>
                <label><span>Monat</span><input v-model="payrollForm.month_year" placeholder="09/2026"></label>
                <label><span>Netto</span><input v-model="payrollForm.netto" type="number" step="0.01"></label>
                <label><span>Brutto</span><input v-model="payrollForm.brutto" type="number" step="0.01"></label>
              </div>
              <label><span>PDF</span><input type="file" accept=".pdf" @change="handlePayrollFileChange"></label>
              <div class="editor-actions"><span class="message">{{ payrollMessage }}</span><button class="primary-btn">Lohnzettel speichern</button></div>
            </form>
          </div>
        </section>

        <!-- NACHRICHTEN -->
        <section v-if="activeTab === 'messages'">
          <div class="hero-row compact"><div><span class="eyebrow">KOMMUNIKATION</span><h2>Nachricht senden</h2><p>Direkte Kommunikation mit einem oder allen Mitarbeitern.</p></div></div>
          <div class="form-panel narrow">
            <form @submit.prevent="sendMessage">
              <label><span>Empfänger</span><select v-model="msgForm.recipient"><option value="all">Alle Mitarbeiter</option><option v-for="e in employeesList" :key="e.id" :value="e.id">{{ e.name }}</option></select></label>
              <label><span>Titel</span><input v-model="msgForm.title" placeholder="Betreff"></label>
              <label><span>Nachricht</span><textarea v-model="msgForm.content" rows="7" placeholder="Nachricht eingeben..."></textarea></label>
              <label><span>Anhang</span><input type="file" @change="handleMsgFileChange"></label>
              <div class="editor-actions"><span class="message">{{ msgMessage }}</span><button class="primary-btn">Nachricht senden</button></div>
            </form>
          </div>
        </section>

        <!-- BENACHRICHTIGUNGEN -->
        <section v-if="activeTab === 'notifications'">
          <div class="hero-row compact"><div><span class="eyebrow">PUSH CENTER</span><h2>Benachrichtigungen</h2><p>Wichtige Informationen direkt an Mitarbeiter senden.</p></div></div>
          <div class="two-col">
            <div class="form-panel">
              <form @submit.prevent="sendCustomNotification">
                <label><span>Empfänger</span><select v-model="notifForm.recipient"><option value="all">Alle Mitarbeiter</option><option v-for="e in employeesList" :key="e.id" :value="e.id">{{ e.name }}</option></select></label>
                <label><span>Titel</span><input v-model="notifForm.title" placeholder="Titel"></label>
                <label><span>Nachricht</span><textarea v-model="notifForm.message" rows="6" placeholder="Nachricht..."></textarea></label>
                <div class="editor-actions"><span class="message">{{ notifMessage }}</span><button class="primary-btn">Senden</button></div>
              </form>
            </div>
            <div class="panel">
              <div class="panel-head"><div><span class="eyebrow">VERLAUF</span><h3>Letzte Benachrichtigungen</h3></div></div>
              <div class="notification-list">
                <div v-for="n in allNotifications.slice(0, 12)" :key="n.id" class="notification-row">
                  <div class="notification-icon">•</div><div><strong>{{ n.title }}</strong><p>{{ n.message }}</p></div><button @click="deleteNotification(n.id)">×</button>
                </div>
                <div v-if="!allNotifications.length" class="empty">Noch keine Benachrichtigungen.</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase.js'

const router = useRouter()
const activeTab = ref('schedule')
const scheduleViewMode = ref('employee')
const employeesList = ref([])
const message = ref('')
const adminName = ref('')

const selectedEmployeeId = ref('')
const selectedMonth = ref(new Date().getMonth())
const selectedAiMonth = ref(new Date().getMonth())

const aiTargetType = ref('all')
const selectedAiEmployeeIds = ref([])
const aiEmployeeSearch = ref('')

/*
 * MITARBEITER-PICKER PRO PROJEKT
 * Ein Mitarbeiter darf in mehreren Projekten vorkommen.
 * Die Auswahl wird als project_teams an die Edge Function gesendet.
 */
const projectTeams = ref(
    Object.fromEntries([
      'Austria Wien',
      'Wirtschaftskammer',
      'OWS',
      'Pav90',
      'Pav20',
      'KHI Areal'
    ].map(location => [location, []]))
)

const projectPickerLocation = ref('Pav20')
const projectEmployeeSearch = ref('')

const filteredProjectEmployees = computed(() => {
  const query = projectEmployeeSearch.value.trim().toLowerCase()
  if (!query) return employeesList.value

  return employeesList.value.filter(employee => {
    const name = String(employee.name || '').toLowerCase()
    const username = String(employee.username || '').toLowerCase()
    const email = String(employee.email || '').toLowerCase()
    return name.includes(query) || username.includes(query) || email.includes(query)
  })
})

const toggleProjectEmployee = (location, employeeId) => {
  const current = projectTeams.value[location] || []

  if (current.includes(employeeId)) {
    projectTeams.value[location] = current.filter(id => id !== employeeId)
  } else {
    projectTeams.value[location] = [...current, employeeId]
  }
}

const selectAllProjectEmployees = (location) => {
  projectTeams.value[location] = employeesList.value.map(employee => employee.id)
}

const clearProjectEmployees = (location) => {
  projectTeams.value[location] = []
}

const getProjectEmployeeCount = (location) => {
  return (projectTeams.value[location] || []).length
}

const totalProjectAssignments = computed(() => {
  return Object.values(projectTeams.value)
      .reduce((sum, ids) => sum + ids.length, 0)
})

const activeProjectTeams = computed(() => {
  return Object.fromEntries(
      Object.entries(projectTeams.value)
          .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
          .map(([location, ids]) => [location, [...ids]])
  )
})

const matrixLocationFilter = ref('all')

const currentYear = ref(new Date().getFullYear())
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
const daysOfWeekNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

const availableLocations = [
  { name: 'Austria Wien', hours: 6 },
  { name: 'Wirtschaftskammer', hours: 8 },
  { name: 'OWS', hours: 12 },
  { name: 'Pav90', hours: 12 },
  { name: 'Pav20', hours: 12 },
  { name: 'KHI Areal', hours: 12 }
]

const employeeSchedulesMap = ref({})
const globalMonthSchedules = ref([])
const matrixMonthSchedulesMap = ref({})
const vacationRequests = ref([])
const allNotifications = ref([])
const isEditing = ref(false)

const selectedPrefEmployeeId = ref('')
const prefMessage = ref('')
const aiMessage = ref('')
const newBlockedDate = ref('')

const prefForm = ref({
  max_monthly_hours: 180,
  preferred_locations: ['Austria Wien', 'Wirtschaftskammer', 'OWS'],
  disliked_days: [],
  blocked_days: [],
  preferred_shifts: ['TD', 'ND'],
  notes: ''
})

const form = ref({
  user_id: '',
  date: '',
  ort: 'OWS',
  shift_time: '07:00-19:00',
  shift_type: 'TD',
  hours: 12,
  is_night: false,
  vacation: false
})

const payrollForm = ref({ user_id: '', month_year: '', netto: '', brutto: '', file: null })
const payrollMessage = ref('')

const msgForm = ref({ recipient: 'all', title: '', content: '', file: null })
const msgMessage = ref('')

const notifForm = ref({ recipient: 'all', title: '', message: '' })
const notifMessage = ref('')

onMounted(() => {
  const userJson = localStorage.getItem('currentUser')
  if (!userJson) {
    router.push('/login')
    return
  }

  const user = JSON.parse(userJson)
  if (user.role !== 'admin') {
    router.push('/home')
    return
  }

  adminName.value = user.name
  fetchEmployees().then(() => {
    fetchGlobalSchedules()
  })
  fetchVacationRequests()
  fetchNotifications()
})

watch([activeTab, selectedMonth], () => {
  if (activeTab.value === 'matrix') {
    fetchGlobalSchedules()
  }
})

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  router.push('/login')
}

const fetchEmployees = async () => {
  const { data, error } = await supabase.from('app_users').select('*').eq('role', 'employee')
  if (!error && data) {
    employeesList.value = data
    if (data.length > 0 && !selectedEmployeeId.value) {
      selectedEmployeeId.value = data[0].id
      fetchEmployeeSchedules()
    }
  }
}

const getEmployeeName = (id) => {
  const emp = employeesList.value.find(e => e.id === id)
  return emp ? emp.name : 'Unbekannt'
}

const getDayNameFromDate = (dateStr) => {
  const dateObj = new Date(dateStr)
  let dayIdx = dateObj.getDay() - 1
  if (dayIdx < 0) dayIdx = 6
  return daysOfWeekNames[dayIdx] || ''
}

const fetchGlobalOrEmployeeSchedules = () => {
  if (scheduleViewMode.value === 'employee') {
    fetchEmployeeSchedules()
  } else {
    fetchGlobalSchedules()
  }
}

const fetchEmployeeSchedules = async () => {
  if (!selectedEmployeeId.value) return
  form.value.user_id = selectedEmployeeId.value

  const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', selectedEmployeeId.value)

  if (!error && data) {
    const map = {}
    data.forEach(item => { map[item.date] = item })
    employeeSchedulesMap.value = map
  }
}

const fetchGlobalSchedules = async () => {
  const year = currentYear.value
  const month = selectedMonth.value
  const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
  const startDate = `${year}-${mStr}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`

  const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

  if (!error && data) {
    globalMonthSchedules.value = data
    const mtxMap = {}
    data.forEach(item => {
      mtxMap[`${item.user_id}_${item.date}`] = item
    })
    matrixMonthSchedulesMap.value = mtxMap
  }
}

const deleteAllSchedulesForEmployeeMonth = async () => {
  if (!selectedEmployeeId.value) return
  const empName = getSelectedEmployeeName()
  const monthName = monthNames[selectedMonth.value]

  if (!confirm(`Möchtest du wirklich den GESAMTEN Dienstplan von ${empName} für ${monthName} ${currentYear.value} löschen?`)) {
    return
  }

  const year = currentYear.value
  const month = selectedMonth.value
  const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
  const startDate = `${year}-${mStr}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`

  const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', selectedEmployeeId.value)
      .gte('date', startDate)
      .lte('date', endDate)

  if (error) {
    alert('Fehler beim Löschen: ' + error.message)
  } else {
    alert('Monatsdienstplan erfolgreich gelöscht.')
    fetchEmployeeSchedules()
    fetchGlobalSchedules()
  }
}

const fetchEmployeePreferences = async () => {
  if (!selectedPrefEmployeeId.value) return

  const { data, error } = await supabase
      .from('employee_preferences')
      .select('*')
      .eq('user_id', selectedPrefEmployeeId.value)
      .maybeSingle()

  if (!error && data) {
    prefForm.value.max_monthly_hours = data.max_monthly_hours || 180
    prefForm.value.preferred_locations = data.preferred_locations || ['Austria Wien', 'Wirtschaftskammer', 'OWS']
    prefForm.value.disliked_days = data.disliked_days || []
    prefForm.value.blocked_days = data.blocked_days || []
    prefForm.value.preferred_shifts = data.preferred_shifts || ['TD', 'ND']
    prefForm.value.notes = data.notes || ''
  } else {
    prefForm.value = {
      max_monthly_hours: 180,
      preferred_locations: ['Austria Wien', 'Wirtschaftskammer', 'OWS'],
      disliked_days: [],
      blocked_days: [],
      preferred_shifts: ['TD', 'ND'],
      notes: ''
    }
  }
}

const toggleLocation = (locName) => {
  const index = prefForm.value.preferred_locations.indexOf(locName)
  if (index > -1) {
    prefForm.value.preferred_locations.splice(index, 1)
  } else {
    prefForm.value.preferred_locations.push(locName)
  }
}

const togglePreferredShift = (shiftType) => {
  const index = prefForm.value.preferred_shifts.indexOf(shiftType)
  if (index > -1) {
    if (prefForm.value.preferred_shifts.length > 1) {
      prefForm.value.preferred_shifts.splice(index, 1)
    } else {
      alert('Es muss mindestens eine Schichtart (Tag oder Nacht) ausgewählt bleiben.')
    }
  } else {
    prefForm.value.preferred_shifts.push(shiftType)
  }
}

const toggleDislikedDay = (day) => {
  const index = prefForm.value.disliked_days.indexOf(day)
  if (index > -1) {
    prefForm.value.disliked_days.splice(index, 1)
  } else {
    prefForm.value.disliked_days.push(day)
  }
}

const addBlockedDate = () => {
  if (!newBlockedDate.value) return
  if (!prefForm.value.blocked_days.includes(newBlockedDate.value)) {
    prefForm.value.blocked_days.push(newBlockedDate.value)
  }
  newBlockedDate.value = ''
}

const removeBlockedDate = (index) => {
  prefForm.value.blocked_days.splice(index, 1)
}

const savePreferences = async () => {
  prefMessage.value = 'Wird gespeichert...'

  const { error } = await supabase
      .from('employee_preferences')
      .upsert([
        {
          user_id: selectedPrefEmployeeId.value,
          max_monthly_hours: Number(prefForm.value.max_monthly_hours),
          preferred_locations: prefForm.value.preferred_locations,
          disliked_days: prefForm.value.disliked_days,
          blocked_days: prefForm.value.blocked_days,
          preferred_shifts: prefForm.value.preferred_shifts,
          notes: prefForm.value.notes
        }
      ], { onConflict: 'user_id' })

  if (error) {
    prefMessage.value = 'Fehler: ' + error.message
  } else {
    prefMessage.value = 'Präferenzen erfolgreich gespeichert!'
  }
}

const getEmployeeInitials = (name) => {
  if (!name) return 'M'
  return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('')
}

const filteredAiEmployees = computed(() => {
  const query = aiEmployeeSearch.value.trim().toLowerCase()

  if (!query) {
    return employeesList.value
  }

  return employeesList.value.filter(employee => {
    const name = String(employee.name || '').toLowerCase()
    const username = String(employee.username || '').toLowerCase()
    const email = String(employee.email || '').toLowerCase()

    return (
        name.includes(query) ||
        username.includes(query) ||
        email.includes(query)
    )
  })
})

const toggleAiEmployee = (employeeId) => {
  const current = selectedAiEmployeeIds.value

  if (current.includes(employeeId)) {
    selectedAiEmployeeIds.value = current.filter(id => id !== employeeId)
  } else {
    selectedAiEmployeeIds.value = [...current, employeeId]
  }
}

const selectAllAiEmployees = () => {
  selectedAiEmployeeIds.value = employeesList.value.map(employee => employee.id)
}

const clearAiEmployees = () => {
  selectedAiEmployeeIds.value = []
}

const generateAiSchedule = async () => {
  const teams = activeProjectTeams.value

  if (Object.keys(teams).length === 0) {
    alert('Bitte wähle zuerst mindestens einen Mitarbeiter für mindestens ein Projekt aus.')
    return
  }

  if (aiTargetType.value === 'selected' && !selectedAiEmployeeIds.value.length) {
    alert('Bitte wähle zusätzlich mindestens einen Mitarbeiter aus.')
    return
  }

  const targetDescription =
      aiTargetType.value === 'all'
          ? 'den gesamten Dienstplan'
          : `${selectedAiEmployeeIds.value.length} ausgewählte Mitarbeiter`

  const bodyPayload = {
    month: selectedAiMonth.value + 1,
    year: currentYear.value,

    // Neuer projektbezogener Mitarbeiter-Pool
    project_teams: teams,

    // Die Edge Function kennt diese Felder direkt.
    // use_ai aktiviert die OpenAI-Optimierung.
    use_ai: true,
    selected_employee_ids: aiTargetType.value === 'selected'
        ? [...selectedAiEmployeeIds.value]
        : [...new Set(Object.values(teams).flat())]
  }

  const projectSummary = Object.entries(teams)
      .map(([location, ids]) => `${location}: ${ids.length} MA`)
      .join('\n')

  if (!confirm(
      `Dienstplan für ${monthNames[selectedAiMonth.value]} ${currentYear.value} erstellen?\n\n` +
      `${targetDescription}.\n\n` +
      `Projekt-Pools:\n${projectSummary}\n\n` +
      `Die Edge Function berücksichtigt harte Regeln, Präferenzen, Ruhezeiten, ` +
      `Nacht-Erholung und freie Tage.`
  )) {
    return
  }

  aiMessage.value = 'Dienstplan wird anhand der Projekt-Pools und Mitarbeiterregeln berechnet...'

  try {
    const { data, error } = await supabase.functions.invoke('generate-schedule', {
      body: bodyPayload
    })

    if (error) throw error

    const stats = data?.statistics

    if (stats?.unassigned > 0 || stats?.validation_errors > 0) {
      aiMessage.value =
          `Plan nicht gespeichert: ${stats.unassigned || 0} offen, ` +
          `${stats.validation_errors || 0} Validierungsfehler.`
      return
    }

    aiMessage.value = 'Erfolgreich! Der Dienstplan wurde erstellt und validiert.'

    await fetchGlobalOrEmployeeSchedules()
    await fetchGlobalSchedules()
  } catch (error) {
    console.error('Fehler bei Dienstplan-Generierung:', error)

    if (error?.context?.response) {
      try {
        const responseBody = await error.context.response.json()

        console.error(
            'GENERATOR RESPONSE:',
            JSON.stringify(responseBody, null, 2)
        )

        const statistics = responseBody.statistics || {}

        alert(
            `Dienstplan konnte nicht vollständig erstellt werden.\n\n` +
            `Zugewiesen: ${statistics.generated ?? '?'}\n` +
            `Nicht zugewiesen: ${statistics.unassigned ?? '?'}\n` +
            `Validierungsfehler: ${statistics.validation_errors ?? '?'}\n\n` +
            `Details siehe Browser-Konsole.`
        )
      } catch (readError) {
        console.error('Konnte Response-Body nicht lesen:', readError)
        aiMessage.value = 'Die Planung konnte nicht erstellt werden.'
      }
    } else {
      aiMessage.value =
          error?.message ||
          'Fehler bei der Dienstplan-Generierung. Bitte erneut versuchen.'
    }
  }
}

const getSelectedEmployeeName = () => {
  return getEmployeeName(selectedEmployeeId.value)
}

const changeMonth = (direction) => {
  selectedMonth.value += direction
  if (selectedMonth.value > 11) {
    selectedMonth.value = 0
    currentYear.value++
  } else if (selectedMonth.value < 0) {
    selectedMonth.value = 11
    currentYear.value--
  }
  fetchGlobalOrEmployeeSchedules()
  fetchGlobalSchedules()
}

const employeeMonthDays = computed(() => {
  const year = currentYear.value
  const month = selectedMonth.value
  const totalDays = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let d = 1; d <= totalDays; d++) {
    const dStr = d < 10 ? '0' + d : '' + d
    const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1)
    const dateKey = `${year}-${mStr}-${dStr}`
    const dateObj = new Date(year, month, d)
    let dayIdx = dateObj.getDay() - 1
    if (dayIdx < 0) dayIdx = 6

    days.push({
      dayNum: d,
      dayName: daysOfWeekNames[dayIdx],
      dateKey,
      shift: employeeSchedulesMap.value[dateKey] || null
    })
  }
  return days
})

const matrixDaysCount = computed(() => {
  return new Date(currentYear.value, selectedMonth.value + 1, 0).getDate()
})

const locationCoverageRules = {
  'Austria Wien': { td: 1, nd: 0 },
  'Wirtschaftskammer': { td: 1, nd: 1 },
  'OWS': { td: 2, nd: 2 },
  'Pav90': { td: 2, nd: 2 },
  'Pav20': { td: 4, nd: 2 },
  'KHI Areal': { td: 2, nd: 2 }
}

const getEmployeeMonthHours = (userId) => {
  return globalMonthSchedules.value
      .filter(s => s.user_id === userId && !s.vacation && s.shift_type !== 'UR')
      .reduce((sum, s) => sum + (Number(s.hours) || 0), 0)
}

const getEmployeeHoursClass = (userId) => {
  const hours = getEmployeeMonthHours(userId)
  if (hours < 180) return 'hours-green'
  if (hours >= 206) return 'hours-red'
  if (hours >= 192) return 'hours-yellow'
  return 'hours-neutral'
}

const getLocationRequiredShifts = (locationName) => {
  const rule = locationCoverageRules[locationName] || { td: 0, nd: 0 }
  return matrixDaysCount.value * (rule.td + rule.nd)
}

const getLocationMissingShifts = (locationName) => {
  let missing = 0
  for (let day = 1; day <= matrixDaysCount.value; day++) {
    missing += getLocationDayStatus(locationName, day).missing
  }
  return missing
}

const getLocationCoveredShifts = (locationName) => {
  const required = getLocationRequiredShifts(locationName)
  return Math.max(0, required - getLocationMissingShifts(locationName))
}

const locationMonthlyStatus = computed(() => {
  return availableLocations.map(loc => {
    const required = getLocationRequiredShifts(loc.name)
    const missingDays = []
    let missing = 0

    for (let day = 1; day <= matrixDaysCount.value; day++) {
      const dayStatus = getLocationDayStatus(loc.name, day)
      if (!dayStatus.complete) {
        missing += dayStatus.missing
        missingDays.push(day)
      }
    }

    return {
      name: loc.name,
      required,
      covered: Math.max(0, required - missing),
      missing,
      missingDays,
      status: missing === 0 ? 'complete' : 'missing'
    }
  })
})

const getLocationDayStatus = (locationName, dayNum) => {
  const rule = locationCoverageRules[locationName] || { td: 0, nd: 0 }
  const dStr = dayNum < 10 ? '0' + dayNum : '' + dayNum
  const mStr = (selectedMonth.value + 1) < 10 ? '0' + (selectedMonth.value + 1) : '' + (selectedMonth.value + 1)
  const dateKey = `${currentYear.value}-${mStr}-${dStr}`
  const daySchedules = globalMonthSchedules.value.filter(s => s.date === dateKey && s.ort === locationName && !s.vacation && s.shift_type !== 'UR')
  const td = daySchedules.filter(s => s.shift_type === 'TD').length
  const nd = daySchedules.filter(s => s.shift_type === 'ND').length
  return {
    complete: td >= rule.td && nd >= rule.nd,
    missing: Math.max(0, rule.td - td) + Math.max(0, rule.nd - nd)
  }
}

const getMatrixDayName = (dayNum) => {
  const dateObj = new Date(currentYear.value, selectedMonth.value, dayNum)
  let dayIdx = dateObj.getDay() - 1
  if (dayIdx < 0) dayIdx = 6
  return daysOfWeekNames[dayIdx] || ''
}

const getMatrixShift = (userId, dayNum) => {
  const dStr = dayNum < 10 ? '0' + dayNum : '' + dayNum
  const mStr = (selectedMonth.value + 1) < 10 ? '0' + (selectedMonth.value + 1) : '' + (selectedMonth.value + 1)
  const dateKey = `${currentYear.value}-${mStr}-${dStr}`
  const shift = matrixMonthSchedulesMap.value[`${userId}_${dateKey}`] || null

  if (!shift) return null

  if (matrixLocationFilter.value !== 'all' && shift.ort !== matrixLocationFilter.value) {
    return null
  }

  return shift
}

const getMatrixCellClass = (userId, dayNum) => {
  const shift = getMatrixShift(userId, dayNum)
  if (!shift) return 'matrix-free-cell'
  if (shift.vacation) return 'matrix-vacation-cell'
  if (shift.shift_type === 'KR') return 'matrix-sick-cell'
  return shift.is_night ? 'matrix-night-cell' : 'matrix-day-cell'
}

const quickEditCell = (userId, dayNum) => {
  selectedEmployeeId.value = userId
  fetchEmployeeSchedules().then(() => {
    activeTab.value = 'schedule'
    scheduleViewMode.value = 'employee'
    const dStr = dayNum < 10 ? '0' + dayNum : '' + dayNum
    const mStr = (selectedMonth.value + 1) < 10 ? '0' + (selectedMonth.value + 1) : '' + (selectedMonth.value + 1)
    const dateKey = `${currentYear.value}-${mStr}-${dStr}`
    const foundDay = employeeMonthDays.value.find(d => d.dateKey === dateKey)
    if (foundDay) {
      selectDayForEditing(foundDay)
    }
  })
}

const getDayCardClass = (day) => {
  if (!day.shift) return 'day-card off'
  if (day.shift.vacation) return 'day-card vacation'
  if (day.shift.shift_type === 'KR') return 'day-card krank'
  return day.shift.is_night ? 'day-card night' : 'day-card day'
}

const onLocationChange = () => {
  const ort = form.value.ort
  if (ort === 'Austria Wien') {
    form.value.hours = 6
  } else if (ort === 'Wirtschaftskammer') {
    form.value.hours = 8
  } else if (['OWS', 'Pav90', 'Pav20', 'KHI Areal'].includes(ort)) {
    form.value.hours = 12
  } else if (ort === 'Urlaub') {
    setVacation()
    return
  } else if (ort === 'Krank') {
    setSick()
    return
  }
  if (!form.value.is_night && !form.value.vacation && form.value.shift_type !== 'KR') {
    form.value.shift_time = form.value.hours === 6 ? '07:00-13:00' : form.value.hours === 8 ? '07:00-15:00' : '07:00-19:00'
  }
}

const selectDayForEditing = (day) => {
  form.value.user_id = selectedEmployeeId.value
  form.value.date = day.dateKey
  if (day.shift) {
    form.value.ort = day.shift.ort || 'OWS'
    form.value.shift_time = day.shift.shift_time
    form.value.shift_type = day.shift.shift_type
    form.value.hours = day.shift.hours
    form.value.is_night = day.shift.is_night
    form.value.vacation = day.shift.vacation || false
    isEditing.value = true
  } else {
    form.value.ort = 'OWS'
    setDayShift()
    isEditing.value = false
  }
}

const setDayShift = () => {
  const h = form.value.hours || 12
  form.value.shift_time = h === 6 ? '07:00-13:00' : h === 8 ? '07:00-15:00' : '07:00-19:00'
  form.value.shift_type = 'TD'
  form.value.is_night = false
  form.value.vacation = false
}

const setNightShift = () => {
  const h = form.value.hours || 12
  form.value.shift_time = h === 8 ? '15:00-23:00' : '19:00-07:00'
  form.value.shift_type = 'ND'
  form.value.is_night = true
  form.value.vacation = false
}

const setVacation = () => {
  form.value.ort = 'Urlaub'
  form.value.shift_time = 'Urlaub'
  form.value.shift_type = 'UR'
  form.value.hours = 12
  form.value.is_night = false
  form.value.vacation = true
}

const setSick = () => {
  form.value.ort = 'Krank'
  form.value.shift_time = 'Krank'
  form.value.shift_type = 'KR'
  form.value.hours = 12
  form.value.is_night = false
  form.value.vacation = false
}

const triggerPush = async (userId, titleText, bodyText, type = 'general') => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: {
        user_id: userId,
        title: titleText,
        body: bodyText,
        type
      }
    })

    if (error) {
      console.error('❌ send-push Fehler:', error)
      return { success: false, error }
    }

    if (data?.success === false) {
      console.error('❌ send-push Antwort:', data)
      return { success: false, data }
    }

    console.info('✅ Push ausgelöst:', {
      user_id: userId,
      title: titleText,
      body: bodyText,
      response: data
    })

    return { success: true, data }
  } catch (err) {
    console.error('❌ Fehler beim Auslösen des Push-Popups:', err)
    return { success: false, error: err }
  }
}

const saveShift = async () => {
  message.value = 'Wird gespeichert...'
  const { error } = await supabase
      .from('schedules')
      .upsert([
        {
          user_id: form.value.user_id,
          date: form.value.date,
          ort: form.value.ort,
          shift_time: form.value.shift_time,
          shift_type: form.value.shift_type,
          hours: form.value.hours,
          is_night: form.value.is_night,
          vacation: form.value.vacation
        }
      ], { onConflict: 'user_id,date' })

  if (error) {
    message.value = 'Fehler: ' + error.message
  } else {
    message.value = 'Erfolgreich gespeichert!'
    const title = 'Dienstplan aktualisiert'
    const msg = `Dein Schichtplan für den ${form.value.date} wurde vom Admin geändert.`

    await supabase.from('notifications').insert([{ user_id: form.value.user_id, title, message: msg, type: 'schedule' }])
    await triggerPush(form.value.user_id, title, msg)
    await fetchEmployeeSchedules()
    await fetchGlobalSchedules()
    fetchNotifications()
  }
}

const deleteShift = async () => {
  if (!form.value.user_id || !form.value.date) return
  const { error } = await supabase.from('schedules').delete().match({ user_id: form.value.user_id, date: form.value.date })
  if (error) {
    message.value = 'Fehler: ' + error.message
  } else {
    message.value = 'Schicht gelöscht!'
    const title = 'Schicht entfernt'
    const msg = `Deine Schicht am ${form.value.date} wurde entfernt.`

    await supabase.from('notifications').insert([{ user_id: form.value.user_id, title, message: msg, type: 'schedule' }])
    await triggerPush(form.value.user_id, title, msg)
    await fetchEmployeeSchedules()
    await fetchGlobalSchedules()
    fetchNotifications()
    isEditing.value = false
  }
}

const fetchVacationRequests = async () => {
  const { data, error } = await supabase.from('vacations').select('*').order('created_at', { ascending: false })
  if (!error && data) vacationRequests.value = data
}

const fetchNotifications = async () => {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (!error && data) allNotifications.value = data
}

const parseToIso = (dateStr) => {
  if (!dateStr) return ''
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.')
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

const deleteLocationMonthSchedule = async () => {
  if (matrixLocationFilter.value === 'all') {
    alert('Bitte wähle zuerst im Dropdown einen spezifischen Standort aus, den du löschen möchtest.');
    return;
  }

  const locationName = matrixLocationFilter.value;
  const monthName = monthNames[selectedMonth.value];

  if (!confirm(`Möchtest du wirklich alle Schichten für den Standort "${locationName}" im Monat ${monthName} ${currentYear.value} unwiderruflich löschen?`)) {
    return;
  }

  const year = currentYear.value;
  const month = selectedMonth.value;
  const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1);
  const startDate = `${year}-${mStr}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`;

  const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('ort', locationName)
      .gte('date', startDate)
      .lte('date', endDate);

  if (error) {
    alert('Fehler beim Löschen des Standort-Dienstplans: ' + error.message);
  } else {
    alert(`Alle Schichten für "${locationName}" im ${monthName} wurden erfolgreich gelöscht.`);
    fetchGlobalSchedules();
  }
};

const deleteAllMonthSchedules = async () => {
  const monthName = monthNames[selectedMonth.value];

  if (!confirm(`ACHTUNG: Möchtest du den GESAMTEN Dienstplan (alle Mitarbeiter, alle Standorte) für ${monthName} ${currentYear.value} komplett löschen? Dieser Vorgang kann nicht rückgängig gemacht werden!`)) {
    return;
  }

  const year = currentYear.value;
  const month = selectedMonth.value;
  const mStr = (month + 1) < 10 ? '0' + (month + 1) : '' + (month + 1);
  const startDate = `${year}-${mStr}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`;

  const { error } = await supabase
      .from('schedules')
      .delete()
      .gte('date', startDate)
      .lte('date', endDate);

  if (error) {
    alert('Fehler beim Löschen des Monatsdienstplans: ' + error.message);
  } else {
    alert(`Der gesamte Monatsdienstplan für ${monthName} ${currentYear.value} wurde erfolgreich gelöscht.`);
    fetchGlobalSchedules();
    if (selectedEmployeeId.value) {
      fetchEmployeeSchedules();
    }
  }
};

const updateVacationStatus = async (id, status) => {
  const { data: vacationData, error: fetchError } = await supabase.from('vacations').select('*').eq('id', id).single()
  if (fetchError || !vacationData) return

  const { error } = await supabase.from('vacations').update({ status }).eq('id', id)
  if (error) return

  const statusText = status === 'approved' ? 'genehmigt 🎉' : 'abgelehnt ❌'
  const title = 'Urlaubsantrag bearbeitet'
  const msg = `Dein Urlaubsantrag (${vacationData.start_date} bis ${vacationData.end_date}) wurde ${statusText}.`

  await supabase.from('notifications').insert([{ user_id: vacationData.user_id, title, message: msg, type: 'vacation' }])
  await triggerPush(vacationData.user_id, title, msg)

  if (status === 'approved') {
    const startDateIso = parseToIso(vacationData.start_date)
    const endDateIso = parseToIso(vacationData.end_date)
    let currentDate = new Date(startDateIso)
    const lastDate = new Date(endDateIso)
    const scheduleInserts = []

    while (currentDate <= lastDate) {
      scheduleInserts.push({
        user_id: vacationData.user_id,
        date: currentDate.toISOString().split('T')[0],
        ort: 'Urlaub',
        shift_time: 'Urlaub',
        shift_type: 'UR',
        hours: 12,
        is_night: false,
        vacation: true
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (scheduleInserts.length > 0) {
      await supabase.from('schedules').upsert(scheduleInserts, { onConflict: 'user_id,date' })
    }
  }

  fetchVacationRequests()
  fetchGlobalSchedules()
  fetchNotifications()
}

const deleteVacationRequest = async (id) => {
  if (!confirm('Möchtest du diesen Urlaubsantrag wirklich löschen?')) return
  const { error } = await supabase.from('vacations').delete().eq('id', id)
  if (!error) fetchVacationRequests()
}

const uploadPayroll = async () => {
  payrollMessage.value = 'Wird hochgeladen...'
  setTimeout(() => {
    payrollMessage.value = 'Lohnzettel erfolgreich hochgeladen!'
    payrollForm.value = { user_id: '', month_year: '', netto: '', brutto: '', file: null }
  }, 1000)
}

const handlePayrollFileChange = (e) => {
  payrollForm.value.file = e.target.files[0]
}

const sendMessage = async () => {
  msgMessage.value = 'Nachricht wird gesendet...'
  setTimeout(() => {
    msgMessage.value = 'Nachricht erfolgreich versendet!'
    msgForm.value = { recipient: 'all', title: '', content: '', file: null }
  }, 1000)
}

const handleMsgFileChange = (e) => {
  msgForm.value.file = e.target.files[0]
}

const sendCustomNotification = async () => {
  notifMessage.value = 'Wird gesendet...'
  const targetIds = notifForm.value.recipient === 'all'
      ? employeesList.value.map(e => e.id)
      : [notifForm.value.recipient]

  for (const uid of targetIds) {
    await supabase.from('notifications').insert([{
      user_id: uid,
      title: notifForm.value.title,
      message: notifForm.value.message,
      type: 'general'
    }])
    await triggerPush(uid, notifForm.value.title, notifForm.value.message)
  }

  notifMessage.value = 'Benachrichtigung erfolgreich gesendet!'
  notifForm.value = { recipient: 'all', title: '', message: '' }
  fetchNotifications()
}

const deleteNotification = async (id) => {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (!error) fetchNotifications()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; background: #090d12; color: #e7edf4; font-family: 'DM Sans', sans-serif; }
:global(button), :global(input), :global(select), :global(textarea) { font: inherit; }
:global(button) { cursor: pointer; }
:global(::selection) { background: rgba(69,211,177,.25); }

.admin-app {
  min-height: 100vh;
  background:
      radial-gradient(circle at 80% -10%, rgba(47, 202, 169, .08), transparent 30%),
      #090d12;
  display: flex;
  color: #e7edf4;
}

.sidebar {
  width: 248px;
  flex: 0 0 248px;
  min-height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 16px 18px;
  background: #0d1218;
  border-right: 1px solid #1d2730;
}

.brand { display:flex; align-items:center; gap:11px; padding: 4px 8px 30px; }
.brand-mark {
  width:38px; height:38px; border-radius:12px; display:grid; place-items:center;
  background:#48d2b0; color:#07110f; font-family:'Space Grotesk'; font-weight:700;
}
.brand strong { display:block; font:700 17px 'Space Grotesk'; letter-spacing:-.3px; }
.brand span { display:block; color:#687785; font-size:9px; letter-spacing:1.7px; margin-top:3px; }

.sidebar-label { color:#566571; font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; padding:0 10px 8px; }
.side-nav { display:flex; flex-direction:column; gap:4px; }
.nav-item {
  width:100%; min-height:44px; border:0; border-radius:10px; background:transparent; color:#8795a1;
  display:flex; align-items:center; gap:11px; padding:0 11px; text-align:left; transition:.18s;
}
.nav-item:hover { background:#151d25; color:#e8eff5; }
.nav-item.active { background:linear-gradient(90deg,#162b2b,#142229); color:#f4fbfa; box-shadow:inset 2px 0 #48d2b0; }
.nav-icon { width:22px; text-align:center; font-size:16px; color:#687984; }
.nav-item.active .nav-icon { color:#48d2b0; }
.nav-count { margin-left:auto; min-width:20px; height:20px; border-radius:10px; display:grid; place-items:center; background:#25342f; color:#72e2c6; font-size:10px; }
.nav-divider { height:1px; background:#1d2730; margin:17px 8px; }
.sidebar-bottom { margin-top:auto; }
.admin-mini { border-top:1px solid #1d2730; padding:15px 8px; display:flex; gap:10px; align-items:center; }
.avatar { width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:#17252b; color:#61d7ba; font-weight:700; }
.admin-mini-text strong { display:block; font-size:12px; color:#dce5ec; }
.admin-mini-text span { display:block; font-size:10px; color:#687783; margin-top:2px; }
.logout-btn { width:100%; border:1px solid #25313a; background:#111820; color:#91a0ab; border-radius:9px; padding:9px 11px; display:flex; justify-content:space-between; }
.logout-btn:hover { color:#f08d8d; border-color:#503036; }

.main { min-width:0; flex:1; }
.topbar {
  min-height:86px; border-bottom:1px solid #1d2730; padding:17px 34px; display:flex;
  align-items:center; justify-content:space-between; background:rgba(9,13,18,.84); backdrop-filter:blur(14px);
  position:sticky; top:0; z-index:20;
}
.breadcrumb { color:#52616d; font-size:9px; font-weight:700; letter-spacing:1.6px; margin-bottom:4px; }
.topbar h1 { margin:0; font:600 22px 'Space Grotesk'; letter-spacing:-.5px; }
.top-actions { display:flex; align-items:center; gap:12px; }
.status-pill,.top-date { border:1px solid #22303a; background:#10171e; border-radius:20px; padding:8px 11px; color:#80909c; font-size:11px; }
.status-pill i { width:6px; height:6px; display:inline-block; background:#45d3b1; border-radius:50%; margin-right:6px; box-shadow:0 0 8px #45d3b1; }

.content { max-width:1600px; margin:0 auto; padding:32px 34px 70px; }
.hero-row { display:flex; align-items:flex-end; justify-content:space-between; gap:25px; margin-bottom:25px; }
.hero-row.compact { margin-bottom:22px; }
.eyebrow { display:block; color:#4bcdb0; font-size:9px; font-weight:700; letter-spacing:1.8px; margin-bottom:8px; }
.hero-row h2 { margin:0; font:600 30px 'Space Grotesk'; letter-spacing:-1px; }
.hero-row p { margin:8px 0 0; color:#71808d; max-width:650px; font-size:13px; line-height:1.6; }
.hero-stat { min-width:130px; padding:16px 20px; background:#10171e; border:1px solid #202d36; border-radius:14px; }
.hero-stat span { color:#64727e; font-size:10px; text-transform:uppercase; letter-spacing:1px; }
.hero-stat strong { display:block; margin-top:4px; font:600 27px 'Space Grotesk'; color:#dce8ee; }

.control-card,.panel,.form-panel,.matrix-panel,.editor-panel,.ai-panel {
  background:#0e151c; border:1px solid #1d2932; border-radius:16px; box-shadow:0 18px 45px rgba(0,0,0,.16);
}
.control-card { padding:18px; margin-bottom:20px; }
.control-title { color:#a8b5bf; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:14px; }
.controls-grid,.form-grid,.editor-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }

label { display:block; }
label > span, .field-block > span { display:block; color:#74838f; font-size:10px; font-weight:700; letter-spacing:.9px; text-transform:uppercase; margin-bottom:7px; }
select,input,textarea {
  width:100%; color:#dce5eb; background:#0a1016; border:1px solid #26343e; border-radius:9px;
  padding:10px 11px; outline:none; transition:.18s;
}
select:focus,input:focus,textarea:focus { border-color:#3cae98; box-shadow:0 0 0 3px rgba(69,211,177,.08); }
textarea { resize:vertical; }

.panel { padding:20px; margin-bottom:20px; }
.panel-head,.editor-head,.calendar-tools { display:flex; align-items:center; justify-content:space-between; gap:15px; }
.panel-head h3,.editor-head h3,.ai-panel h3 { margin:0; font:600 19px 'Space Grotesk'; }
.month-switch,.matrix-month { display:flex; align-items:center; gap:9px; }
.month-switch button,.matrix-month button { width:34px;height:34px;border:1px solid #27343d;background:#121a21;color:#a7b4bd;border-radius:8px; }
.month-switch button:hover,.matrix-month button:hover { color:#4bd4b4; border-color:#31554e; }
.month-switch strong,.matrix-month strong { font-size:12px; min-width:130px; text-align:center; }

.calendar-tools { margin:18px 0; padding-top:15px; border-top:1px solid #1d2730; }
.legend { display:flex; gap:14px; flex-wrap:wrap; color:#6e7c87; font-size:10px; }
.dot { display:inline-block; width:7px;height:7px;border-radius:50%;margin-right:5px; }
.dot.day { background:#5aa8e8; }.dot.night{background:#8c75e8}.dot.vacation{background:#d6aa54}.dot.sick{background:#df6974}
.danger-ghost { border:1px solid #402b30; color:#db7c86; background:#171014; border-radius:8px; padding:9px 12px; font-size:11px; }
.danger-ghost:hover { background:#211519; }
.calendar-grid { display:grid; grid-template-columns:repeat(7,minmax(100px,1fr)); gap:8px; }
.calendar-day { min-height:122px; text-align:left; border:1px solid #202d36; border-radius:11px; background:#0b1117; color:#dce5eb; padding:10px; transition:.16s; }
.calendar-day:hover { transform:translateY(-2px); border-color:#3a5b5b; }
.calendar-day-head { display:flex; justify-content:space-between; color:#62727e; font-size:10px; margin-bottom:13px; }
.calendar-day-head b { color:#aebbc4; font-size:13px; }
.calendar-day.day { border-top:2px solid #4d9ed8; }.calendar-day.night{border-top:2px solid #8a72e5}.calendar-day.vacation{border-top:2px solid #d4a84f}.calendar-day.krank{border-top:2px solid #d76672}.calendar-day.off{opacity:.68}
.shift-chip { display:inline-flex; border-radius:6px; padding:4px 7px; font-size:9px; font-weight:800; background:#153044; color:#77bcea; }
.shift-chip.night { background:#29223e;color:#aa9bf1 }.shift-chip.vacation{background:#332b18;color:#d8b45e}.shift-chip.sick{background:#321d22;color:#e47e88}
.day-location { display:block; font-size:11px; margin-top:9px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.calendar-day small { display:block; margin-top:4px; color:#63727d; font-size:9px; }
.free-label { display:block; margin-top:28px; color:#44515b; font-size:11px; }

.table-scroll { overflow:auto; }
.data-table { width:100%; border-collapse:collapse; min-width:700px; }
.data-table th { color:#5e6e79; font-size:9px; text-transform:uppercase; letter-spacing:1px; text-align:left; padding:12px; border-bottom:1px solid #25313a; }
.data-table td { padding:13px 12px; border-bottom:1px solid #1a242d; color:#9aa8b2; font-size:12px; }
.data-table tr:hover td { background:#101820; }
.hours-badge { display:inline-flex; min-width:46px; justify-content:center; padding:4px 7px; border-radius:6px; font-size:10px; font-weight:800; background:#19232a;color:#8c9aa5; }
.hours-green{background:#123029;color:#64d5b8}.hours-yellow{background:#302918;color:#d5b56a}.hours-red{background:#351f24;color:#df7d88}
.status { display:inline-block;padding:5px 8px;border-radius:6px;font-size:9px;text-transform:uppercase;font-weight:800; }
.status.approved{background:#123029;color:#62d1b5}.status.pending{background:#302918;color:#d8b768}.status.rejected{background:#351f24;color:#e07d87}
.actions { white-space:nowrap }.icon-btn { border:1px solid #26343d;background:#121a21;color:#a8b5be;border-radius:6px;padding:6px 8px;margin-right:5px;font-size:10px }.icon-btn.good{color:#5fd1b3}.icon-btn.warn{color:#d4b05d}.icon-btn.bad{color:#df7882}
.empty { text-align:center; color:#53616c; padding:30px!important; }

.editor-panel { padding:20px; margin-bottom:20px; border-color:#29433f; }
.edit-tag { color:#50d2b2;background:#12332d;border-radius:20px;padding:6px 9px;font-size:9px;font-weight:800; }
.editor-grid { margin:20px 0 12px; grid-template-columns:repeat(5,minmax(0,1fr)); }
.quick-actions { display:flex; gap:8px; flex-wrap:wrap; }
.quick-actions button,.secondary-btn { border:1px solid #27343d;background:#121a21;color:#9caab4;border-radius:8px;padding:8px 11px;font-size:11px; }
.quick-actions button:hover,.secondary-btn:hover { border-color:#3c625b;color:#63d8ba; }
.editor-actions { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:18px; padding-top:15px; border-top:1px solid #1e2a33; }
.editor-actions > div { display:flex; gap:8px; }
.message { color:#58caae;font-size:11px; }
.primary-btn,.ai-btn { border:0;background:#45cdb0;color:#071310;border-radius:9px;padding:10px 14px;font-weight:800;font-size:11px; }
.primary-btn:hover,.ai-btn:hover { background:#62ddc1; }
.danger-btn { border:1px solid #4a2b31;background:#1b1115;color:#e1808a;border-radius:9px;padding:10px 14px;font-size:11px; }
.two-col { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(300px,.8fr); gap:20px; }
.form-panel { padding:22px; margin-bottom:20px; }
.form-panel.narrow { max-width:820px; }
.form-panel form { display:flex; flex-direction:column; gap:16px; }
.field-block { margin:17px 0; }
.chip-grid { display:flex; flex-wrap:wrap; gap:7px; }
.select-chip { border:1px solid #28353e;background:#10171e;color:#7d8b96;border-radius:8px;padding:8px 10px;font-size:10px; }
.select-chip.selected { border-color:#337c6d;background:#12322d;color:#65d7ba; }
.blocked-row { display:flex; gap:8px; }.blocked-list{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.blocked-list button{border:1px solid #403037;background:#191217;color:#c27d85;border-radius:6px;padding:5px 8px;font-size:9px}
.ai-panel { padding:25px; background:radial-gradient(circle at 90% 5%,rgba(73,210,178,.12),transparent 36%),#0e151c; }
.ai-orb { width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:#15332e;color:#63d9bc;font-size:23px;margin-bottom:18px; }
.ai-panel p { color:#70808c;font-size:12px;line-height:1.6; }
.ai-panel label { margin-top:15px; }.ai-btn{width:100%;margin-top:18px;padding:13px}.ai-message{min-height:20px;color:#5bd2b5!important;font-size:10px!important}

.ai-target-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 15px;
}

.ai-target-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 13px;
  text-align: left;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 12px;
  background: var(--surface, #10171e);
  color: var(--text-main, #f5f7fb);
  cursor: pointer;
  transition: .2s ease;
}

.ai-target-option:hover,
.ai-target-option.active {
  border-color: var(--accent, #45cdb0);
  background: color-mix(in srgb, var(--accent, #45cdb0) 10%, var(--surface, #10171e));
}

.ai-target-option span:nth-child(2) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ai-target-option strong {
  font-size: 11px;
  font-weight: 800;
}

.ai-target-option small {
  margin-top: 3px;
  color: var(--text-muted, #70808c);
  font-size: 9px;
}

.ai-target-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: color-mix(in srgb, var(--accent, #45cdb0) 10%, transparent);
  font-size: 15px;
}

.ai-target-check {
  margin-left: auto;
  color: var(--accent, #45cdb0);
  font-weight: 900;
}

.employee-picker {
  margin-top: 12px;
  padding: 13px;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 13px;
  background: var(--surface-soft, #11192b);
}

.employee-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.employee-picker-head > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.employee-picker-head strong {
  color: var(--text-main, #f5f7fb);
  font-size: 11px;
}

.employee-picker-head small {
  color: var(--text-muted, #70808c);
  font-size: 9px;
}

.employee-picker-actions {
  display: flex;
  gap: 5px;
}

.employee-picker-actions button {
  border: 1px solid var(--border-color, #26333d);
  border-radius: 7px;
  padding: 6px 8px;
  background: var(--surface, #10171e);
  color: var(--text-secondary, #9ca8b4);
  font-size: 9px;
  cursor: pointer;
}

.employee-picker-actions button:hover {
  border-color: var(--accent, #45cdb0);
  color: var(--accent, #45cdb0);
}

.employee-picker-search {
  width: 100%;
  margin-top: 10px;
  padding: 10px 11px;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 9px;
  background: var(--input-bg, var(--surface, #10171e));
  color: var(--text-main, #f5f7fb);
  outline: none;
}

.employee-picker-search:focus {
  border-color: var(--accent, #45cdb0);
}

.selected-employee-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 9px;
}

.selected-employee-chip {
  border: 1px solid color-mix(in srgb, var(--accent, #45cdb0) 45%, transparent);
  border-radius: 999px;
  padding: 5px 8px;
  background: color-mix(in srgb, var(--accent, #45cdb0) 10%, transparent);
  color: var(--accent, #45cdb0);
  font-size: 9px;
  cursor: pointer;
}

.selected-employee-chip span {
  margin-left: 4px;
}

.employee-picker-list {
  max-height: 230px;
  overflow-y: auto;
  margin-top: 9px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-picker-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--text-main, #f5f7fb);
  text-align: left;
  cursor: pointer;
}

.employee-picker-row:hover {
  background: color-mix(in srgb, var(--text-main, #fff) 5%, transparent);
}

.employee-picker-row.selected {
  border-color: color-mix(in srgb, var(--accent, #45cdb0) 35%, transparent);
  background: color-mix(in srgb, var(--accent, #45cdb0) 8%, transparent);
}

.employee-avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent, #45cdb0) 15%, transparent);
  color: var(--accent, #45cdb0);
  font-size: 9px;
  font-weight: 900;
}

.employee-picker-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.employee-picker-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.employee-picker-info small {
  margin-top: 2px;
  color: var(--text-muted, #70808c);
  font-size: 8px;
}

.employee-picker-check {
  width: 20px;
  text-align: center;
  color: var(--accent, #45cdb0);
  font-weight: 900;
}

.employee-picker-empty {
  padding: 18px;
  text-align: center;
  color: var(--text-muted, #70808c);
  font-size: 10px;
}

.ai-all-info {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 10px;
  background: var(--surface-soft, #11192b);
}

.ai-all-info > span {
  color: var(--success, #35d39a);
  font-weight: 900;
}

.ai-all-info div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-all-info strong {
  color: var(--text-main, #f5f7fb);
  font-size: 10px;
}

.ai-all-info small {
  color: var(--text-muted, #70808c);
  font-size: 8px;
}


.project-picker {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 14px;
  background: var(--surface-soft, #11192b);
}

.project-picker-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.project-picker-head > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-picker-head strong {
  color: var(--text-main, #f5f7fb);
  font-size: 13px;
}

.project-picker-head small {
  color: var(--text-muted, #70808c);
  font-size: 9px;
  line-height: 1.5;
  max-width: 650px;
}

.project-total {
  min-width: 76px;
  padding: 9px 11px;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 10px;
  text-align: center;
  background: var(--surface, #10171e);
}

.project-total strong {
  display: block;
  color: var(--accent, #45cdb0);
  font-size: 20px;
}

.project-total small {
  color: var(--text-muted, #70808c);
  font-size: 8px;
}

.project-picker-toolbar {
  display: grid;
  grid-template-columns: 1fr 1.4fr auto;
  align-items: end;
  gap: 10px;
  margin-top: 15px;
}

.project-picker-actions {
  display: flex;
  gap: 6px;
}

.project-picker-actions button {
  border: 1px solid var(--border-color, #26333d);
  border-radius: 8px;
  padding: 10px 11px;
  background: var(--surface, #10171e);
  color: var(--text-secondary, #9ca8b4);
  font-size: 10px;
}

.project-picker-actions button:hover {
  border-color: var(--accent, #45cdb0);
  color: var(--accent, #45cdb0);
}

.project-selected-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 9px 11px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--accent, #45cdb0) 7%, transparent);
}

.project-selected-summary strong {
  color: var(--text-main, #f5f7fb);
  font-size: 11px;
}

.project-selected-summary span {
  color: var(--accent, #45cdb0);
  font-size: 9px;
  font-weight: 700;
}

.project-employee-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 8px;
}

.project-employee-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--text-main, #f5f7fb);
  text-align: left;
  cursor: pointer;
}

.project-employee-row:hover {
  background: color-mix(in srgb, var(--text-main, #fff) 5%, transparent);
}

.project-employee-row.selected {
  border-color: color-mix(in srgb, var(--accent, #45cdb0) 35%, transparent);
  background: color-mix(in srgb, var(--accent, #45cdb0) 8%, transparent);
}

.project-employee-check {
  width: 20px;
  margin-left: auto;
  text-align: center;
  color: var(--accent, #45cdb0);
  font-weight: 900;
}

.project-pool-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.project-pool-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  padding: 8px 9px;
  border: 1px solid var(--border-color, #26333d);
  border-radius: 8px;
  background: var(--surface, #10171e);
  cursor: pointer;
}

.project-pool-card.active {
  border-color: var(--accent, #45cdb0);
}

.project-pool-card strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-main, #f5f7fb);
  font-size: 8px;
}

.project-pool-card span {
  flex: 0 0 auto;
  color: var(--accent, #45cdb0);
  font-size: 8px;
  font-weight: 800;
}

.matrix-toolbar { display:flex;justify-content:space-between;align-items:flex-end;gap:15px;padding:16px;background:#0e151c;border:1px solid #1d2932;border-radius:14px;margin-bottom:14px; }
.matrix-toolbar label { width:280px; }.matrix-actions{display:flex;gap:7px}
.coverage-grid { display:grid;grid-template-columns:repeat(6,minmax(140px,1fr));gap:8px;margin-bottom:14px; }
.coverage-card { background:#0e151c;border:1px solid #1d2932;border-radius:11px;padding:12px; }.coverage-card > div:first-child{display:flex;justify-content:space-between;gap:8px}.coverage-card span{font-size:10px;color:#9aa7b0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.coverage-card b{font-size:8px;color:#5bd0b3}.coverage-card b.bad{color:#dc7b85}.coverage-track{height:4px;background:#1a252d;border-radius:5px;margin:11px 0 7px;overflow:hidden}.coverage-track i{display:block;height:100%;background:#45cdb0;border-radius:5px}.coverage-card small{font-size:8px;color:#52616b}
.matrix-panel { padding:0; overflow:hidden; }
.matrix-scroll { overflow:auto; max-height:68vh; }
.matrix-table { border-collapse:separate;border-spacing:0;min-width:1100px;width:max-content; }
.matrix-table th { position:sticky;top:0;z-index:4;background:#111a21;border-bottom:1px solid #2a3841;color:#63727d;font-size:8px;text-transform:uppercase;letter-spacing:.7px;padding:8px 5px;text-align:center;min-width:52px}.matrix-table th b{display:block;color:#b7c2c9;font-size:11px;margin-top:3px}.matrix-table th.weekend{background:#15181c}
.sticky-col{position:sticky;left:0;z-index:3;background:#10171e}.employee-col{width:180px;min-width:180px;text-align:left!important;padding-left:14px!important}.sticky-hours{position:sticky;left:180px;z-index:3;background:#10171e;min-width:55px!important;width:55px}
.matrix-table tbody td { border-bottom:1px solid #1b252d;border-right:1px solid #19232b;height:48px; }
.employee-cell { padding:6px 10px;display:flex;align-items:center;gap:8px;font-size:10px;color:#c3cdd4; }
.employee-avatar{width:25px;height:25px;border-radius:7px;background:#18252c;color:#5ed3b6;display:grid;place-items:center;font-size:9px;font-weight:800;flex:0 0 25px}
.matrix-table tbody .sticky-hours{text-align:center}.matrix-cell{min-width:52px;width:52px;text-align:center;cursor:pointer;transition:.12s;background:#0d141a}.matrix-cell:hover{outline:2px solid #3d806f;outline-offset:-2px;z-index:2}.matrix-cell b{display:block;font-size:9px}.matrix-cell small{display:block;font-size:7px;color:#687782;max-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:auto}.matrix-free-cell{color:#2d3942}.matrix-day-cell{background:#102530!important;color:#68b9e5}.matrix-night-cell{background:#1c1830!important;color:#a99bed}.matrix-vacation-cell{background:#2b2414!important;color:#d6b35f}.matrix-sick-cell{background:#2b181d!important;color:#dc7a84}
.matrix-note{padding:10px 2px;color:#50606c;font-size:10px}

.notification-list { display:flex;flex-direction:column;max-height:480px;overflow:auto }.notification-row{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #1b252d}.notification-icon{width:25px;height:25px;border-radius:8px;background:#13322d;color:#5fd2b5;display:grid;place-items:center}.notification-row div:nth-child(2){flex:1}.notification-row strong{font-size:11px}.notification-row p{margin:4px 0 0;color:#687782;font-size:10px;line-height:1.4}.notification-row button{background:none;border:0;color:#6d7b85}

@media (max-width: 1050px) {
  .sidebar{width:205px;flex-basis:205px}.coverage-grid{grid-template-columns:repeat(3,1fr)}.editor-grid{grid-template-columns:repeat(3,1fr)}
}
@media (max-width: 800px) {
  .admin-app{display:block}.sidebar{position:relative;width:100%;min-height:auto;height:auto;padding:12px;border-right:0;border-bottom:1px solid #1d2730}.brand{padding:3px 5px 12px}.side-nav{display:grid;grid-template-columns:repeat(2,1fr)}.sidebar-label,.nav-divider{display:none}.sidebar-bottom{display:none}.nav-item{min-height:38px}.topbar{position:relative;padding:15px 17px}.top-actions{display:none}.content{padding:22px 14px 50px}.hero-row{align-items:flex-start;flex-direction:column}.hero-row h2{font-size:25px}.controls-grid,.form-grid,.editor-grid,.two-col{grid-template-columns:1fr}.calendar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.calendar-day{min-height:110px}.matrix-toolbar{align-items:stretch;flex-direction:column}.matrix-toolbar label{width:100%}.matrix-actions{flex-wrap:wrap}.coverage-grid{grid-template-columns:1fr 1fr}.panel{padding:14px}.editor-actions{align-items:flex-start;flex-direction:column}.editor-actions>div{width:100%}.editor-actions button{flex:1}
}
@media (max-width: 460px) {
  .side-nav{grid-template-columns:1fr}.calendar-grid{grid-template-columns:1fr 1fr}.coverage-grid{grid-template-columns:1fr}.calendar-day{min-height:100px;padding:8px}.calendar-day small{font-size:8px}.month-switch strong{min-width:105px}
}


@media (max-width: 700px) {
  .project-picker-toolbar {
    grid-template-columns: 1fr;
  }

  .project-picker-actions {
    width: 100%;
  }

  .project-picker-actions button {
    flex: 1;
  }

  .project-employee-list {
    grid-template-columns: 1fr;
  }

  .project-pool-overview {
    grid-template-columns: 1fr 1fr;
  }

  .project-picker-head {
    flex-direction: column;
  }

  .project-total {
    width: 100%;
  }

  .ai-target-switch {
    grid-template-columns: 1fr;
  }

  .employee-picker-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .employee-picker-actions {
    width: 100%;
  }

  .employee-picker-actions button {
    flex: 1;
  }
}
</style>
