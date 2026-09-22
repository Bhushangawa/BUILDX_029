// SENTINEL — Core Application Controller & State Engine

let currentUser = {
  id: "USR-ADMIN-01",
  name: "Inspector Rajesh Shinde",
  role: "ADMIN",
  phone: "+91-712-2561100"
};

let activeView = "home";
let currentIncidentDetail = null;
let currentMissingPersonDetail = null;
let currentSafeJourneyId = null;

// Theme Controller: Day / Night Vision
let currentTheme = localStorage.getItem("sentinel_theme") || "light";

function initTheme() {
  applyTheme(currentTheme);
}

function toggleTheme() {
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("sentinel_theme", theme);
  const isNight = theme === "dark";
  if (isNight) {
    document.body.classList.add("night-vision");
  } else {
    document.body.classList.remove("night-vision");
  }
  updateThemeUI();
  if (typeof window.setMapTheme === "function") {
    window.setMapTheme(isNight);
  }
}

function updateThemeUI() {
  const isNight = currentTheme === "dark";
  const icon = isNight ? "☀️" : "🌙";
  const labelText = isNight
    ? (typeof t === "function" ? t("theme_day") : "Day Vision")
    : (typeof t === "function" ? t("theme_night") : "Night Vision");

  const btnText = document.getElementById("themeText");
  const btnIcon = document.getElementById("themeIcon");
  if (btnText) btnText.innerText = labelText;
  if (btnIcon) btnIcon.innerText = icon;

  const navText = document.getElementById("themeNavText");
  const navIcon = document.getElementById("themeNavIcon");
  if (navText) navText.innerText = labelText;
  if (navIcon) navIcon.innerText = icon;

  const toggleBtn = document.getElementById("themeToggleBtn");
  if (toggleBtn) {
    toggleBtn.setAttribute("title", typeof t === "function" ? t("theme_toggle_title") : "Switch Day / Night Vision Mode");
  }
}

window.toggleTheme = toggleTheme;
window.updateThemeUI = updateThemeUI;

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  setupRoleSwitcher();
  setupNavigation();
  setupForms();
  await loadUserData();
  switchView("home");
  loadNotifications();
  setInterval(loadNotifications, 15000); // 15s refresh
});

// Navigation & View Routing
function setupNavigation() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav");
      switchView(target);
    });
  });
}

function switchView(viewName) {
  activeView = viewName;
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) {
    targetSec.classList.add("active");
  }

  // Update nav buttons active state
  document.querySelectorAll("[data-nav]").forEach(btn => {
    if (btn.getAttribute("data-nav") === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  // View specific loaders
  if (viewName === "command") {
    loadCommandCenter();
    setTimeout(() => { window.initNagpurMap("nagpurMapContainer"); }, 150);
  } else if (viewName === "citizen") {
    loadCitizenPortal();
  } else if (viewName === "volunteer") {
    loadVolunteerPortal();
  } else if (viewName === "security") {
    loadSecurityPortal();
  } else if (viewName === "crowd") {
    loadCrowdZonesView();
  } else if (viewName === "analytics") {
    loadAnalyticsView();
  }
}

// Role Switching (1-Click for Hackathon Judging)
function setupRoleSwitcher() {
  document.querySelectorAll(".role-pill").forEach(pill => {
    pill.addEventListener("click", async () => {
      const targetRole = pill.getAttribute("data-role");
      try {
        const res = await fetch("/api/auth/quick-switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: targetRole })
        });
        const data = await res.json();
        if (data.user) {
          currentUser = data.user;
          updateRoleUI();
          showToast(`Switched active profile to: ${currentUser.name} (${currentUser.role})`, "info");
          // Refresh active view
          switchView(activeView);
        }
      } catch (err) {
        console.error("Role switch error:", err);
      }
    });
  });
}

function updateRoleUI() {
  document.querySelectorAll(".role-pill").forEach(pill => {
    if (pill.getAttribute("data-role") === currentUser.role) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  const userNameDisplay = document.getElementById("currentUserNameDisplay");
  if (userNameDisplay) {
    userNameDisplay.innerText = `${currentUser.name} [${currentUser.role}]`;
  }
}

async function loadUserData() {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { "X-User-Id": currentUser.id }
    });
    const data = await res.json();
    if (data.user) {
      currentUser = data.user;
      updateRoleUI();
    }
  } catch (err) {
    console.warn("User data fallback:", err);
  }
}

// Command Center Loader & KPIs
async function loadCommandCenter() {
  try {
    const [analyticsRes, incRes] = await Promise.all([
      fetch("/api/analytics", { headers: { "X-User-Id": currentUser.id } }),
      fetch("/api/incidents", { headers: { "X-User-Id": currentUser.id } })
    ]);

    const aData = await analyticsRes.json();
    const incData = await incRes.json();

    // Render KPIs
    if (aData.kpis) {
      document.getElementById("kpiActiveIncidents").innerText = aData.kpis.active_incidents;
      document.getElementById("kpiCriticalAlerts").innerText = aData.kpis.critical_alerts;
      document.getElementById("kpiMissingPersons").innerText = aData.kpis.missing_persons;
      document.getElementById("kpiCrowdAlerts").innerText = aData.kpis.crowd_alerts;
      document.getElementById("kpiActiveTeams").innerText = aData.kpis.available_teams;
      document.getElementById("kpiResolvedCases").innerText = aData.kpis.resolved_cases;
      document.getElementById("kpiAvgResponse").innerText = `${aData.kpis.avg_response_minutes}m`;
    }

    // Render Incidents Table
    renderIncidentsTable(incData.incidents || []);
  } catch (err) {
    console.error("Failed loading Command Center data:", err);
  }
}

function renderIncidentsTable(incidents) {
  const tbody = document.getElementById("incidentsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (incidents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching incidents recorded in Nagpur database.</td></tr>`;
    return;
  }

  incidents.forEach(inc => {
    const tr = document.createElement("tr");
    tr.onclick = () => viewIncidentDetail(inc.id);

    const priorityBadge = `<span class="badge badge-${inc.priority.toLowerCase()}">${inc.priority}</span>`;
    const statusBadge = `<span class="badge badge-status">${inc.status}</span>`;
    const dupBadge = inc.is_duplicate_of ? `<span style="color: #f59e0b; font-size: 11px; margin-left: 4px;">[Duplicate]</span>` : '';

    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: bold; color: #38bdf8;">${inc.id}</td>
      <td>
        <div style="font-weight: 700; color: #f8fafc;">${inc.title} ${dupBadge}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${inc.category}</div>
      </td>
      <td>📍 ${inc.location_name}</td>
      <td>${priorityBadge}</td>
      <td>${statusBadge}</td>
      <td>${inc.assigned_team_name ? `<span style="color: #34d399;">🛡️ ${inc.assigned_team_name}</span>` : '<span style="color: var(--text-muted);">Unassigned</span>'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); viewIncidentDetail('${inc.id}')">
          Inspect
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Live Operations Filter
function filterIncidents() {
  const cat = document.getElementById("filterCategory").value;
  const pri = document.getElementById("filterPriority").value;
  const sta = document.getElementById("filterStatus").value;
  const search = document.getElementById("filterSearch").value.trim();

  let url = `/api/incidents?category=${cat}&priority=${pri}&status=${sta}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  fetch(url, { headers: { "X-User-Id": currentUser.id } })
    .then(r => r.json())
    .then(data => {
      renderIncidentsTable(data.incidents || []);
    });
}

// View Incident Detail Modal
async function viewIncidentDetail(incId) {
  try {
    const res = await fetch(`/api/incidents/${incId}`, {
      headers: { "X-User-Id": currentUser.id }
    });
    const data = await res.json();
    if (!data.incident) return;

    currentIncidentDetail = data.incident;
    const inc = data.incident;

    document.getElementById("modalIncId").innerText = inc.id;
    document.getElementById("modalIncTitle").innerText = inc.title;
    document.getElementById("modalIncLocation").innerText = `📍 Location: ${inc.location_name} (${inc.latitude}, ${inc.longitude})`;
    document.getElementById("modalIncDesc").innerText = inc.description;
    document.getElementById("modalIncReporter").innerText = `Reporter: ${inc.reporter_name} (${inc.reporter_contact || 'Private / Confidential'})`;

    // Priority & Category Badges
    document.getElementById("modalIncBadges").innerHTML = `
      <span class="badge badge-${inc.priority.toLowerCase()}">${inc.priority}</span>
      <span class="badge badge-status">${inc.status}</span>
      <span class="badge" style="background: rgba(6,182,212,0.15); color: #38bdf8;">${inc.category}</span>
    `;

    // AI Recommendation Box
    const aiBox = document.getElementById("modalIncAiBox");
    aiBox.innerHTML = `
      <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 12px; margin-top: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
            🤖 AI Incident Intelligence Recommendation
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">Confidence: ${Math.round((inc.ai_confidence || 0.92) * 100)}%</span>
        </div>
        <div style="font-size: 13px; margin-top: 6px; color: #e2e8f0;">${inc.ai_summary || 'Standard assessment completed.'}</div>
        <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
          Suggested Team: <strong style="color: #38bdf8;">${inc.ai_suggested_team_type || 'SECURITY_TEAM'}</strong> | 
          Suggested Priority: <strong style="color: #fbbf24;">${inc.ai_priority || inc.priority}</strong>
        </div>
        ${!inc.is_verified_by_admin && currentUser.role === 'ADMIN' ? `
          <div style="margin-top: 10px;">
            <button class="btn btn-primary btn-sm" onclick="verifyAiSuggestion('${inc.id}')">
              ✓ Confirm & Verify AI Suggestion
            </button>
          </div>
        ` : '<div style="font-size: 11px; color: #10b981; margin-top: 6px;">✓ Verified by Authority</div>'}
      </div>
    `;

    // Assigned Team Section
    const teamSection = document.getElementById("modalIncTeamSection");
    if (inc.assigned_team_id) {
      teamSection.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px; margin-top: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #34d399; text-transform: uppercase;">Assigned Nagpur Unit</div>
          <div style="font-size: 14px; font-weight: bold; color: #f8fafc; margin-top: 4px;">🛡️ ${inc.assigned_team_name}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Leader: ${inc.assigned_team_leader || 'N/A'} | Contact: ${inc.assigned_team_phone || '+91-712-2561100'}</div>
        </div>
      `;
    } else {
      teamSection.innerHTML = `
        <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 13px;">No response team currently assigned.</span>
          ${currentUser.role === 'ADMIN' ? `
            <button class="btn btn-warning btn-sm" onclick="openTeamAssignModal('${inc.id}', ${inc.latitude}, ${inc.longitude}, '${inc.ai_suggested_team_type || 'SECURITY_TEAM'}')">
              Assign Response Team
            </button>
          ` : ''}
        </div>
      `;
    }

    // Duplicate Banner if present
    const dupSection = document.getElementById("modalIncDuplicateSection");
    if (inc.is_duplicate_of) {
      dupSection.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 10px; margin-top: 12px;">
          <div style="color: #fbbf24; font-weight: bold; font-size: 12px;">⚠️ POSSIBLE DUPLICATE DETECTED</div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
            This incident has been flagged as related to Master Ticket: <strong>${inc.is_duplicate_of}</strong>.
          </div>
          ${currentUser.role === 'ADMIN' ? `
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" onclick="handleDuplicateAction('${inc.id}', 'MERGE', '${inc.is_duplicate_of}')">Merge into Master</button>
              <button class="btn btn-secondary btn-sm" onclick="handleDuplicateAction('${inc.id}', 'KEEP_SEPARATE')">Keep Separate</button>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      dupSection.innerHTML = "";
    }

    // Timeline
    renderTimeline(inc.timeline || []);

    // Actions depending on Role
    renderIncidentActions(inc);

    openModal("incidentDetailModal");
  } catch (err) {
    console.error("Failed loading incident detail:", err);
  }
}

function renderTimeline(timelineEvents) {
  const container = document.getElementById("modalIncTimeline");
  container.innerHTML = "";
  if (timelineEvents.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 12px;">No timeline events recorded yet.</div>`;
    return;
  }

  timelineEvents.forEach(evt => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-title">${evt.event_title}</div>
      <div class="timeline-meta">${evt.performed_by_name} (${evt.role}) • ${evt.created_at}</div>
      <div class="timeline-desc">${evt.event_description}</div>
    `;
    container.appendChild(item);
  });
}

function renderIncidentActions(inc) {
  const container = document.getElementById("modalIncActions");
  container.innerHTML = "";

  if (currentUser.role === "SECURITY_STAFF") {
    if (inc.status === "ASSIGNED") {
      container.innerHTML += `<button class="btn btn-warning btn-sm" onclick="updateIncidentStatus('${inc.id}', 'ACKNOWLEDGED')">Acknowledge Assignment</button>`;
    } else if (inc.status === "ACKNOWLEDGED") {
      container.innerHTML += `<button class="btn btn-primary btn-sm" onclick="updateIncidentStatus('${inc.id}', 'IN_PROGRESS')">Mark Response In-Progress</button>`;
    } else if (inc.status === "IN_PROGRESS") {
      container.innerHTML += `<button class="btn btn-primary btn-sm" style="background: #10b981;" onclick="updateIncidentStatus('${inc.id}', 'RESOLVED')">Mark Resolved</button>`;
    }
  } else if (currentUser.role === "ADMIN") {
    if (inc.status === "RESOLVED") {
      container.innerHTML += `<button class="btn btn-secondary btn-sm" onclick="updateIncidentStatus('${inc.id}', 'CLOSED')">Close Case File</button>`;
    }
  }
}

async function verifyAiSuggestion(incId) {
  try {
    const res = await fetch(`/api/incidents/${incId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({})
    });
    const data = await res.json();
    showToast(data.message || "AI recommendation verified by Admin.", "success");
    viewIncidentDetail(incId);
    loadCommandCenter();
  } catch (err) {
    showToast("Failed verifying AI suggestion", "error");
  }
}

async function updateIncidentStatus(incId, newStatus) {
  try {
    const res = await fetch(`/api/incidents/${incId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    showToast(data.message || `Status updated to ${newStatus}`, "success");
    viewIncidentDetail(incId);
    loadCommandCenter();
    if (activeView === "security") loadSecurityPortal();
  } catch (err) {
    showToast("Failed updating status", "error");
  }
}

// Assign Response Team Dialog
async function openTeamAssignModal(incId, lat, lng, reqType) {
  try {
    const res = await fetch(`/api/teams/recommend?lat=${lat}&lng=${lng}&team_type=${reqType}`);
    const data = await res.json();
    const list = document.getElementById("teamRecommendList");
    list.innerHTML = "";

    if (data.recommendations) {
      data.recommendations.forEach(r => {
        const t = r.team;
        const div = document.createElement("div");
        div.style = "background: #111827; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;";
        div.innerHTML = `
          <div>
            <div style="font-weight: bold; color: #f8fafc;">${t.name}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${t.team_type} | Leader: ${t.leader_name}</div>
            <div style="font-size: 12px; color: #38bdf8;">📍 Approx ${r.distance_km} km away | Status: ${t.status}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="assignTeam('${incId}', '${t.id}')">
            Assign Unit
          </button>
        `;
        list.appendChild(div);
      });
    }

    openModal("teamAssignModal");
  } catch (err) {
    showToast("Failed loading team recommendations", "error");
  }
}

async function assignTeam(incId, teamId) {
  try {
    const res = await fetch(`/api/incidents/${incId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({ team_id: teamId })
    });
    const data = await res.json();
    showToast(data.message || "Team dispatched successfully!", "success");
    closeModal("teamAssignModal");
    viewIncidentDetail(incId);
    loadCommandCenter();
  } catch (err) {
    showToast("Failed assigning team", "error");
  }
}

// Duplicate Action (Merge vs Keep Separate)
async function handleDuplicateAction(incId, action, masterId = null) {
  try {
    const res = await fetch(`/api/incidents/${incId}/duplicate-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({ action, master_id: masterId })
    });
    const data = await res.json();
    showToast(data.message, "info");
    viewIncidentDetail(incId);
    loadCommandCenter();
  } catch (err) {
    showToast("Failed processing duplicate action", "error");
  }
}

// Forms & Citizen Reporting
function setupForms() {
  // Quick Report Form
  const reportForm = document.getElementById("quickIncidentForm");
  if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("reportTitle").value.trim();
      const incType = document.getElementById("reportType").value;
      const location = document.getElementById("reportLocation").value.trim();
      const description = document.getElementById("reportDescription").value.trim();
      const isAnon = document.getElementById("reportAnonymous").checked;

      try {
        const res = await fetch("/api/incidents", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
          body: JSON.stringify({
            title: title || `${incType} near ${location}`,
            incident_type: incType,
            location_name: location,
            description,
            is_anonymous: isAnon
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Report filed: ${data.incident_id}. AI Priority: ${data.priority}`, "success");
          reportForm.reset();
          loadCitizenPortal();
          if (data.duplicate_alert && data.duplicate_alert.has_duplicate) {
            showToast(`⚠️ AI flagged possible duplicate of ${data.duplicate_alert.master_incident_id}`, "warning");
          }
        } else {
          showToast(data.error || "Failed submitting report", "error");
        }
      } catch (err) {
        showToast("Error connecting to Nagpur command database", "error");
      }
    });
  }

  // Missing Person Form
  const mpForm = document.getElementById("missingPersonForm");
  if (mpForm) {
    mpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = document.getElementById("mpName").value.trim();
      const personType = document.getElementById("mpType").value;
      const age = parseInt(document.getElementById("mpAge").value) || 6;
      const gender = document.getElementById("mpGender").value;
      const lastSeen = document.getElementById("mpLastSeen").value.trim();
      const clothing = document.getElementById("mpClothing").value.trim();
      const marks = document.getElementById("mpMarks").value.trim();

      try {
        const res = await fetch("/api/missing-persons", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
          body: JSON.stringify({
            full_name: fullName,
            person_type: personType,
            age,
            gender,
            last_seen_location: lastSeen,
            clothing_description: clothing,
            identifying_marks: marks
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Missing person case ${data.missing_person_id} activated! Help desks alerted.`, "success");
          mpForm.reset();
          loadCitizenPortal();
        } else {
          showToast(data.error || "Failed filing case", "error");
        }
      } catch (err) {
        showToast("Error creating missing person record", "error");
      }
    });
  }
}

// 1-Click SOS Trigger
async function triggerEmergencySos() {
  const loc = prompt("Confirm your Nagpur location for instant SOS:", "Sitabuldi Interchange, Nagpur");
  if (!loc) return;

  try {
    const res = await fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({
        location_name: loc,
        sos_type: "Urgent Citizen Emergency"
      })
    });
    const data = await res.json();
    showToast(data.message, "error");
    if (activeView === "command") loadCommandCenter();
  } catch (err) {
    showToast("Failed broadcasting emergency SOS", "error");
  }
}

// Safe Journey Mode
async function startSafeJourney() {
  const start = document.getElementById("sjStart").value.trim() || "Sitabuldi Interchange";
  const dest = document.getElementById("sjDest").value.trim() || "Coffee House Square, Dharampeth";
  const contactName = document.getElementById("sjContactName").value.trim() || "Family Contact";
  const contactPhone = document.getElementById("sjContactPhone").value.trim() || "+91-9890123456";

  try {
    const res = await fetch("/api/safe-journey/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({
        start_location: start,
        destination: dest,
        trusted_contact_name: contactName,
        trusted_contact_phone: contactPhone
      })
    });
    const data = await res.json();
    if (data.success) {
      currentSafeJourneyId = data.journey_id;
      document.getElementById("sjStatusDisplay").innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 12px; margin-top: 12px;">
          <div style="font-weight: bold; color: #34d399;">🛡️ SAFE JOURNEY ACTIVE (${data.journey_id})</div>
          <div style="font-size: 13px; color: #f8fafc; margin-top: 4px;">Route: ${start} ➔ ${dest}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Trusted Contact: ${contactName} (${contactPhone})</div>
          <div style="margin-top: 10px;">
            <button class="btn btn-warning btn-sm" onclick="simulateRouteDeviation('${data.journey_id}')">
              Simulate Route Deviation Alert
            </button>
          </div>
        </div>
      `;
      showToast(data.message, "success");
    }
  } catch (err) {
    showToast("Failed activating Safe Journey", "error");
  }
}

async function simulateRouteDeviation(journeyId) {
  try {
    const res = await fetch(`/api/safe-journey/${journeyId}/deviation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id }
    });
    const data = await res.json();
    if (data.alert) {
      // Prompt safety check-in modal
      document.getElementById("deviationPromptText").innerText = data.prompt;
      openModal("deviationCheckinModal");
    }
  } catch (err) {
    showToast("Error triggering deviation check", "error");
  }
}

async function respondSafeCheckin(response) {
  if (!currentSafeJourneyId) return;
  try {
    const res = await fetch(`/api/safe-journey/${currentSafeJourneyId}/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({ response })
    });
    const data = await res.json();
    closeModal("deviationCheckinModal");
    showToast(data.message, response === "SAFE" ? "success" : "error");
  } catch (err) {
    showToast("Error submitting safety response", "error");
  }
}

// Volunteer Portal Loader
async function loadVolunteerPortal() {
  try {
    const res = await fetch("/api/missing-persons", {
      headers: { "X-User-Id": currentUser.id }
    });
    const data = await res.json();
    const container = document.getElementById("volunteerTaskList");
    container.innerHTML = "";

    if (data.missing_persons) {
      data.missing_persons.forEach(mp => {
        const div = document.createElement("div");
        div.className = "panel";
        div.style = "margin-bottom: 1rem;";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <span class="badge badge-high">SEARCH TASK: MISSING ${mp.person_type}</span>
              <h3 style="margin: 6px 0; color: #f8fafc;">${mp.full_name} (${mp.age} yrs, ${mp.gender})</h3>
              <p style="font-size: 13px; color: var(--text-secondary);">Last seen: <strong>${mp.last_seen_location}</strong> (${mp.last_seen_time})</p>
              <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Description: ${mp.clothing_description}</p>
              <p style="font-size: 12px; color: #38bdf8;">Search Radius: ${mp.search_radius_meters}m geo-fence active</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openSightingModal('${mp.id}', '${mp.full_name}')">
              Submit Sighting
            </button>
          </div>
        `;
        container.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Volunteer loader error:", err);
  }
}

function openSightingModal(mpId, name) {
  document.getElementById("sightingMpId").value = mpId;
  document.getElementById("sightingTargetName").innerText = name;
  openModal("sightingModal");
}

async function submitSighting() {
  const mpId = document.getElementById("sightingMpId").value;
  const loc = document.getElementById("sightingLoc").value.trim();
  const notes = document.getElementById("sightingNotes").value.trim();

  if (!loc || !notes) {
    showToast("Please provide location and notes", "warning");
    return;
  }

  try {
    const res = await fetch(`/api/missing-persons/${mpId}/sighting`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": currentUser.id },
      body: JSON.stringify({ sighting_location: loc, notes })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, "success");
      closeModal("sightingModal");
      loadVolunteerPortal();
    }
  } catch (err) {
    showToast("Error submitting sighting", "error");
  }
}

// Security Staff Portal Loader
async function loadSecurityPortal() {
  try {
    const res = await fetch("/api/incidents", {
      headers: { "X-User-Id": currentUser.id }
    });
    const data = await res.json();
    const container = document.getElementById("securityStaffQueue");
    container.innerHTML = "";

    const activeIncidents = (data.incidents || []).filter(i => i.status !== "CLOSED");

    if (activeIncidents.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted); padding: 2rem;">No active assigned incidents in your Nagpur sector.</div>`;
      return;
    }

    activeIncidents.forEach(inc => {
      const card = document.createElement("div");
      card.className = "panel";
      card.style = "margin-bottom: 1rem;";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="display: flex; gap: 6px; margin-bottom: 4px;">
              <span class="badge badge-${inc.priority.toLowerCase()}">${inc.priority}</span>
              <span class="badge badge-status">${inc.status}</span>
              <span style="font-family: monospace; font-size: 12px; color: #38bdf8;">${inc.id}</span>
            </div>
            <h3 style="margin: 4px 0; color: #f8fafc;">${inc.title}</h3>
            <p style="font-size: 13px; color: #94a3b8;">📍 ${inc.location_name}</p>
            <p style="font-size: 12px; color: #cbd5e1; margin-top: 6px;">${inc.description}</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${inc.status === 'ASSIGNED' ? `<button class="btn btn-warning btn-sm" onclick="updateIncidentStatus('${inc.id}', 'ACKNOWLEDGED')">Acknowledge</button>` : ''}
            ${inc.status === 'ACKNOWLEDGED' ? `<button class="btn btn-primary btn-sm" onclick="updateIncidentStatus('${inc.id}', 'IN_PROGRESS')">Start Response</button>` : ''}
            ${inc.status === 'IN_PROGRESS' ? `<button class="btn btn-primary btn-sm" style="background:#10b981;" onclick="updateIncidentStatus('${inc.id}', 'RESOLVED')">Mark Resolved</button>` : ''}
            <button class="btn btn-secondary btn-sm" onclick="viewIncidentDetail('${inc.id}')">Inspect Timeline</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Security portal error:", err);
  }
}

// Crowd Zones View Loader
async function loadCrowdZonesView() {
  try {
    const res = await fetch("/api/crowd-zones");
    const data = await res.json();
    const container = document.getElementById("crowdZonesGrid");
    container.innerHTML = "";

    if (data.crowd_zones) {
      data.crowd_zones.forEach(z => {
        const card = document.createElement("div");
        card.className = "panel";
        const pct = Math.round((z.current_count / z.capacity) * 100);
        let colorClass = "badge-low";
        if (z.crowd_level === "CRITICAL") colorClass = "badge-critical";
        else if (z.crowd_level === "HIGH") colorClass = "badge-high";
        else if (z.crowd_level === "MEDIUM") colorClass = "badge-medium";

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <span class="badge ${colorClass}">${z.crowd_level} DENSITY</span>
            ${z.alert_status ? '<span style="color: #ef4444; font-weight: bold; font-size: 11px;">⚠️ ALERT TRIGGERED</span>' : ''}
          </div>
          <h3 style="color: #f8fafc; font-size: 1.1rem; margin-bottom: 4px;">${z.zone_name}</h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">📍 ${z.location_landmark}</p>
          
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>Current Crowd: <strong>${z.current_count}</strong></span>
              <span>Capacity: ${z.capacity}</span>
            </div>
            <div style="height: 8px; background: #1f2937; border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(100, pct)}%; height: 100%; background: ${pct >= 90 ? '#f43f5e' : (pct >= 75 ? '#f59e0b' : '#10b981')};"></div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--text-muted);">
            <span>Simulate Count:</span>
            <input type="number" id="countInput_${z.id}" value="${z.current_count}" style="width: 80px; padding: 4px; background: #111827; border: 1px solid var(--border-subtle); color: white; border-radius: 4px;">
            <button class="btn btn-secondary btn-sm" onclick="updateCrowdCount('${z.id}')">Update</button>
          </div>
        `;
        container.appendChild(card);
      });
    }
  } catch (err) {
    console.error("Crowd zones loader error:", err);
  }
}

async function updateCrowdCount(zoneId) {
  const input = document.getElementById(`countInput_${zoneId}`);
  const count = parseInt(input.value) || 0;
  try {
    const res = await fetch(`/api/crowd-zones/${zoneId}/crowd-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_count: count })
    });
    const data = await res.json();
    showToast(`Zone density updated (${data.percentage}%). Risk: ${data.risk_level}`, "info");
    loadCrowdZonesView();
  } catch (err) {
    showToast("Error updating crowd count", "error");
  }
}

// Analytics View Loader
async function loadAnalyticsView() {
  try {
    const res = await fetch("/api/analytics");
    const data = await res.json();

    // Render Area breakdown list
    const areaList = document.getElementById("analyticsAreaBreakdown");
    if (areaList && data.area_breakdown) {
      areaList.innerHTML = "";
      data.area_breakdown.forEach(item => {
        const div = document.createElement("div");
        div.style = "display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;";
        div.innerHTML = `<span>📍 ${item.location_name}</span><span style="font-weight: bold; color: #38bdf8;">${item.count} incidents</span>`;
        areaList.appendChild(div);
      });
    }

    // Render Team Workload
    const teamList = document.getElementById("analyticsTeamWorkload");
    if (teamList && data.team_workload) {
      teamList.innerHTML = "";
      data.team_workload.forEach(t => {
        const div = document.createElement("div");
        div.style = "display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;";
        div.innerHTML = `
          <span>🛡️ ${t.name} <small style="color: var(--text-muted);">(${t.status})</small></span>
          <span style="font-weight: bold; color: ${t.active_cases > 0 ? '#f59e0b' : '#10b981'};">${t.active_cases} active cases</span>
        `;
        teamList.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Analytics error:", err);
  }
}

// Notifications
async function loadNotifications() {
  try {
    const res = await fetch("/api/notifications", {
      headers: { "X-User-Id": currentUser.id }
    });
    const data = await res.json();
    const countBadge = document.getElementById("notifCountBadge");
    const list = document.getElementById("notifList");
    if (!list) return;

    list.innerHTML = "";
    const unread = (data.notifications || []).filter(n => !n.is_read).length;
    if (countBadge) {
      countBadge.innerText = unread;
      countBadge.style.display = unread > 0 ? "inline-block" : "none";
    }

    (data.notifications || []).forEach(n => {
      const item = document.createElement("div");
      item.className = "notif-item";
      item.innerHTML = `
        <div class="notif-title">${n.title}</div>
        <div style="color: var(--text-secondary); margin: 2px 0;">${n.message}</div>
        <div class="notif-time">${n.created_at}</div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.warn("Notification loader error:", err);
  }
}

function toggleNotifDrawer() {
  const drawer = document.getElementById("notifDrawer");
  if (drawer) drawer.classList.toggle("open");
}

// Toast System
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.style = `
    background: ${type === 'error' ? '#e11d48' : (type === 'success' ? '#10b981' : (type === 'warning' ? '#f59e0b' : '#0284c7'))};
    color: white; padding: 10px 16px; border-radius: 6px; margin-bottom: 8px; font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: fadeIn 0.2s ease;
  `;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal Helpers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("show");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("show");
}

window.switchView = switchView;
window.viewIncidentDetail = viewIncidentDetail;
window.triggerEmergencySos = triggerEmergencySos;
window.startSafeJourney = startSafeJourney;
window.simulateRouteDeviation = simulateRouteDeviation;
window.respondSafeCheckin = respondSafeCheckin;
window.openSightingModal = openSightingModal;
window.submitSighting = submitSighting;
window.updateIncidentStatus = updateIncidentStatus;
window.verifyAiSuggestion = verifyAiSuggestion;
window.openTeamAssignModal = openTeamAssignModal;
window.assignTeam = assignTeam;
window.handleDuplicateAction = handleDuplicateAction;
window.updateCrowdCount = updateCrowdCount;
window.filterIncidents = filterIncidents;
window.toggleNotifDrawer = toggleNotifDrawer;
window.openModal = openModal;
window.closeModal = closeModal;
