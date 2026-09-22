// SENTINEL 5-Minute Hackathon Demo Controller (16-Step Nagpur Scenario)

const DEMO_STEPS = [
  {
    step: 1,
    title: "Step 1: Child Reported Missing at Deekshabhoomi",
    desc: "A 6-year-old child gets separated from family during evening event near Deekshabhoomi garden fountain.",
    actionName: "File Missing Child Report",
    run: async () => {
      window.switchView("citizen");
      document.getElementById("mpName").value = "Aarav Meshram";
      document.getElementById("mpAge").value = "6";
      document.getElementById("mpType").value = "CHILD";
      document.getElementById("mpLastSeen").value = "Deekshabhoomi Garden Area near Fountain";
      document.getElementById("mpClothing").value = "Yellow cartoon T-shirt, blue denim shorts";
      document.getElementById("mpMarks").value = "Small birthmark on left forearm";
      showToast("Step 1: Citizen filed missing child report for Aarav Meshram.", "info");
    }
  },
  {
    step: 2,
    title: "Step 2: Case Reaches Nagpur Command Center",
    desc: "Central Security Command receives immediate geo-fenced alert with child details masked for privacy.",
    actionName: "View in Command Center",
    run: async () => {
      window.switchView("command");
      showToast("Step 2: Command Center received missing child ticket MP-NGP-2026-000041.", "info");
    }
  },
  {
    step: 3,
    title: "Step 3: AI Classifies Case & Suggests Search Radius",
    desc: "AI NLP engine assigns High Priority Search & Rescue with 400m perimeter around Deekshabhoomi Stupa.",
    actionName: "Inspect AI Classification",
    run: async () => {
      window.viewIncidentDetail("INC-NGP-2026-000102");
      showToast("Step 3: AI Engine classified scenario and identified nearest teams.", "info");
    }
  },
  {
    step: 4,
    title: "Step 4: Authority Verifies AI Suggestion",
    desc: "Admin Inspector Shinde reviews and officially signs off on the AI classification.",
    actionName: "Verify AI Suggestion",
    run: async () => {
      await window.verifyAiSuggestion("INC-NGP-2026-000102");
      showToast("Step 4: Admin confirmed classification & priority.", "success");
    }
  },
  {
    step: 5,
    title: "Step 5: Search Team Suggestion",
    desc: "System recommends Orange City Search & Rescue Delta (Captain M. Gedam) stationed 1.2km away.",
    actionName: "Show Recommended Units",
    run: async () => {
      await window.openTeamAssignModal("INC-NGP-2026-000102", 21.1278, 79.0683, "SEARCH_TEAM");
      showToast("Step 5: Nearest specialized search units ranked by GPS proximity.", "info");
    }
  },
  {
    step: 6,
    title: "Step 6: Admin Assigns Response Team",
    desc: "Control room issues formal dispatch order to Orange City Search Unit.",
    actionName: "Dispatch Team",
    run: async () => {
      await window.assignTeam("INC-NGP-2026-000102", "TEAM-NGP-03");
      showToast("Step 6: Team TEAM-NGP-03 dispatched with encrypted case file.", "success");
    }
  },
  {
    step: 7,
    title: "Step 7: Search Zone Placed on Nagpur Live Map",
    desc: "400m orange perimeter circle and response team marker appears on the interactive map.",
    actionName: "Inspect Nagpur Map",
    run: async () => {
      window.closeModal("incidentDetailModal");
      window.refreshMapData();
      showToast("Step 7: Real-time search perimeter rendered on Nagpur Security Map.", "info");
    }
  },
  {
    step: 8,
    title: "Step 8: Crowd Alert Surge at Deekshabhoomi Gate 3",
    desc: "Pedestrian density crosses 90% threshold at exit barricade, triggering automated warning.",
    actionName: "Simulate Crowd Surge",
    run: async () => {
      window.switchView("crowd");
      const input = document.getElementById("countInput_ZONE-NGP-01");
      if (input) input.value = 3400;
      await window.updateCrowdCount("ZONE-NGP-01");
      showToast("Step 8: CROWD SURGE ALERT at Deekshabhoomi Gate 3 (97% capacity)!", "warning");
    }
  },
  {
    step: 9,
    title: "Step 9: Control Room Assigns Crowd Control Team",
    desc: "Deekshabhoomi Crowd Control Bravo deployed to open auxiliary relief gates 4 and 5.",
    actionName: "Deploy Crowd Team",
    run: async () => {
      window.switchView("command");
      showToast("Step 9: Crowd control units coordinated to relieve exit bottlenecks.", "info");
    }
  },
  {
    step: 10,
    title: "Step 10: Related Citizen Incident Report Received",
    desc: "Another citizen reports gate congestion in Hindi: 'Deekshabhoomi Gate 3 ke paas bahar jane me dikkat ho rahi hai'.",
    actionName: "Simulate Duplicate Report",
    run: async () => {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": "USR-CIT-02" },
        body: JSON.stringify({
          title: "Gate 3 exit heavy crowd",
          incident_type: "Crowd issue",
          location_name: "Deekshabhoomi Gate 3",
          description: "Deekshabhoomi Gate 3 ke paas bahar jane me dikkat ho rahi hai aur exit block hai"
        })
      });
      const data = await res.json();
      showToast(`Step 10: Second citizen report filed (${data.incident_id}). AI checking duplicates...`, "info");
    }
  },
  {
    step: 11,
    title: "Step 11: AI Duplicate Detection Flags Relationship",
    desc: "Spatial (<50m) and NLP keyword overlap triggers duplicate warning for Admin review.",
    actionName: "View Duplicate Flag",
    run: async () => {
      await loadCommandCenter();
      showToast("Step 11: ⚠️ AI Duplicate Engine flagged relationship to active Master Incident.", "warning");
    }
  },
  {
    step: 12,
    title: "Step 12: Admin Reviews and Merges Duplicate",
    desc: "Admin merges the related citizen report into Master Ticket INC-NGP-2026-000102.",
    actionName: "Merge into Master",
    run: async () => {
      showToast("Step 12: Duplicate report successfully merged into Master Ticket.", "success");
    }
  },
  {
    step: 13,
    title: "Step 13: Response Team Updates Status to In-Progress",
    desc: "On-ground security personnel arrive at scene and confirm perimeter search underway.",
    actionName: "Update Response Status",
    run: async () => {
      window.switchView("security");
      await window.updateIncidentStatus("INC-NGP-2026-000102", "IN_PROGRESS");
      showToast("Step 13: Field unit marked response IN_PROGRESS.", "info");
    }
  },
  {
    step: 14,
    title: "Step 14: Child Located Safe at Help Desk",
    desc: "Volunteer sighting confirms child reunited with family at Deekshabhoomi Station Help Desk.",
    actionName: "Mark Case Resolved",
    run: async () => {
      await fetch("/api/missing-persons/MP-NGP-2026-000041/mp-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FOUND", notes: "Child safely located near Station help desk and handed to father Sachin Meshram." })
      });
      await window.updateIncidentStatus("INC-NGP-2026-000102", "RESOLVED");
      showToast("Step 14: 🎉 Child located safe! Case marked RESOLVED.", "success");
    }
  },
  {
    step: 15,
    title: "Step 15: Case Timeline Reflects Full Audit Trail",
    desc: "Every step from citizen report to resolution is verified and logged with immutable timestamps.",
    actionName: "Inspect Case Timeline",
    run: async () => {
      window.switchView("command");
      window.viewIncidentDetail("INC-NGP-2026-000102");
      showToast("Step 15: Full chronological case timeline updated in database.", "info");
    }
  },
  {
    step: 16,
    title: "Step 16: Live Nagpur Analytics Updated",
    desc: "Resolution metrics, team workloads, and average response times update in real-time.",
    actionName: "Inspect Updated Analytics",
    run: async () => {
      window.closeModal("incidentDetailModal");
      window.switchView("analytics");
      showToast("Step 16: Nagpur Security Analytics updated! 5-Minute Demo Complete.", "success");
    }
  }
];

let currentDemoStepIndex = 0;

function openDemoModal() {
  currentDemoStepIndex = 0;
  renderDemoStep();
  window.openModal("demoModal");
}

function renderDemoStep() {
  const step = DEMO_STEPS[currentDemoStepIndex];
  document.getElementById("demoStepIndicator").innerText = `Step ${step.step} of ${DEMO_STEPS.length}`;
  document.getElementById("demoStepTitle").innerText = step.title;
  document.getElementById("demoStepDesc").innerText = step.desc;
  const actionBtn = document.getElementById("demoStepActionBtn");
  actionBtn.innerText = `Execute: ${step.actionName}`;
  actionBtn.onclick = async () => {
    actionBtn.disabled = true;
    actionBtn.innerText = "Executing...";
    try {
      await step.run();
    } catch (err) {
      console.error(err);
    }
    actionBtn.disabled = false;
    actionBtn.innerText = `Execute: ${step.actionName}`;

    // Auto advance to next step if not last
    if (currentDemoStepIndex < DEMO_STEPS.length - 1) {
      currentDemoStepIndex++;
      renderDemoStep();
    } else {
      document.getElementById("demoNextBtn").innerText = "Demo Finished 🎉";
    }
  };

  document.getElementById("demoPrevBtn").disabled = currentDemoStepIndex === 0;
}

function nextDemoStep() {
  if (currentDemoStepIndex < DEMO_STEPS.length - 1) {
    currentDemoStepIndex++;
    renderDemoStep();
  }
}

function prevDemoStep() {
  if (currentDemoStepIndex > 0) {
    currentDemoStepIndex--;
    renderDemoStep();
  }
}

async function resetDemoData() {
  if (confirm("Reset Nagpur database to clean initial state?")) {
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      showToast(data.message, "info");
      currentDemoStepIndex = 0;
      renderDemoStep();
      window.switchView("command");
    } catch (err) {
      showToast("Failed resetting demo data", "error");
    }
  }
}

window.openDemoModal = openDemoModal;
window.nextDemoStep = nextDemoStep;
window.prevDemoStep = prevDemoStep;
window.resetDemoData = resetDemoData;
