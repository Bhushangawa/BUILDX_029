"use client";

import React, { useState, useEffect } from "react";
import MapWrapper from "@/components/map/MapWrapper";
import {
  Radio,
  AlertTriangle,
  Users,
  Eye,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  Cpu,
  MapPin,
  RefreshCw,
  X,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  FileText,
  Send,
  Phone,
} from "lucide-react";

export default function CommandCenterPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [missingPersons, setMissingPersons] = useState<any[]>([]);
  const [crowdZones, setCrowdZones] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    activeIncidents: 0, criticalAlerts: 0, missingPersons: 0,
    crowdAlerts: 0, activeTeams: 0, resolvedCases: 0, avgResponseTimeMinutes: 4.2,
  });
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [mapFilter, setMapFilter] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [incRes, mpRes, czRes, rtRes, anRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/missing-persons"),
        fetch("/api/crowd-zones"),
        fetch("/api/response-teams"),
        fetch("/api/analytics"),
      ]);
      const [incData, mpData, czData, rtData, anData] = await Promise.all([
        incRes.json(), mpRes.json(), czRes.json(), rtRes.json(), anRes.json(),
      ]);
      if (incData.incidents) setIncidents(incData.incidents);
      if (mpData.cases) setMissingPersons(mpData.cases);
      if (czData.zones) setCrowdZones(czData.zones);
      if (rtData.teams) setTeams(rtData.teams);
      if (anData.kpis) setKpis(anData.kpis);
      if (selectedIncident) {
        const found = incData.incidents?.find((i: any) => i.id === selectedIncident.id);
        if (found) setSelectedIncident(found);
      }
    } catch (e) { console.error("Fetch error", e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const markers = [
    ...incidents
      .filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED")
      .map((i) => ({
        id: i.id,
        type: (i.priority === "CRITICAL" ? "INCIDENT_CRITICAL" : "INCIDENT") as any,
        title: `${i.incidentNumber}: ${i.title}`,
        lat: i.latitude, lng: i.longitude,
        priority: i.priority, category: i.category, status: i.status,
        assignedTeam: i.assignedTeam?.name, data: i,
      })),
    ...missingPersons
      .filter((m) => m.status !== "FOUND_SAFE" && m.status !== "CLOSED")
      .map((m) => ({
        id: m.id, type: "MISSING_PERSON" as any,
        title: `${m.caseNumber}: Missing ${m.fullName} (${m.age}yo)`,
        lat: m.latitude, lng: m.longitude,
        priority: "CRITICAL", status: m.status, radiusMeters: m.searchRadiusMeters,
        assignedTeam: m.assignedTeam?.name, data: m,
      })),
    ...crowdZones.map((z) => ({
      id: z.id, type: "CROWD_ZONE" as any,
      title: `${z.name} (${Math.round(z.densityRatio * 100)}% Load)`,
      lat: z.latitude, lng: z.longitude, radiusMeters: z.radiusMeters,
      priority: z.riskLevel, status: z.riskLevel, assignedTeam: z.assignedTeam?.name, data: z,
    })),
    ...teams
      .filter((t) => t.status === "AVAILABLE" || t.status === "ON_SCENE")
      .map((t) => ({
        id: t.id, type: "RESPONSE_TEAM" as any,
        title: `Unit: ${t.name}`,
        lat: t.currentLatitude, lng: t.currentLongitude, status: t.status, data: t,
      })),
  ];

  const handleSelectMarker = (marker: any) => {
    setSelectedMarker(marker);
    if (marker.type.startsWith("INCIDENT")) setSelectedIncident(marker.data);
  };

  const handleUpdateStatus = async (incidentId: string, status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actorName: "Commander Anita Deshmukh", actorRole: "ADMIN" }),
      });
      const data = await res.json();
      if (data.success) await fetchData();
    } catch (e: any) { alert("Status update error: " + e.message); }
    finally { setIsUpdating(false); }
  };

  const handleAssignTeam = async (incidentId: string, teamId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTeamId: teamId, status: "ASSIGNED", actorName: "Commander Anita Deshmukh", actorRole: "ADMIN" }),
      });
      const data = await res.json();
      if (data.success) await fetchData();
    } catch (e: any) { alert("Assignment error: " + e.message); }
    finally { setIsUpdating(false); }
  };

  const handleMergeDuplicate = async (masterId: string, dupId: string, action: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/incidents/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterIncidentId: masterId, duplicateIncidentId: dupId, action }),
      });
      const data = await res.json();
      if (data.success) await fetchData();
    } catch (e: any) { alert("Merge error: " + e.message); }
    finally { setIsUpdating(false); }
  };

  const openIncidents = incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED");

  const KPI_CONFIG = [
    { key: "activeIncidents",       label: "Active Incidents", sub: "Open in triage",      icon: AlertTriangle, valClass: "text-white",       borderClass: "border-[#1e3151]"       },
    { key: "criticalAlerts",        label: "Critical Alerts",  sub: "Priority 1",          icon: ShieldAlert,   valClass: "text-red-400",     borderClass: "border-red-500/30"      },
    { key: "missingPersons",        label: "Missing Persons",  sub: "Grid active",         icon: Eye,           valClass: "text-orange-400",  borderClass: "border-orange-500/30"   },
    { key: "crowdAlerts",           label: "Crowd Surges",     sub: "> 85% bottleneck",    icon: Users,         valClass: "text-amber-400",   borderClass: "border-amber-500/30"    },
    { key: "activeTeams",           label: "Field Units",      sub: "Active & standby",    icon: Shield,        valClass: "text-emerald-400", borderClass: "border-emerald-500/30"  },
    { key: "resolvedCases",         label: "Resolved Today",   sub: "Cases closed",        icon: CheckCircle,   valClass: "text-indigo-400",  borderClass: "border-indigo-500/30"   },
    { key: "avgResponseTimeMinutes",label: "Avg Response",     sub: "SLA target < 5m",     icon: Clock,         valClass: "text-sky-400",     borderClass: "border-sky-500/30",  suffix: "m" },
  ];

  if (loading) {
    return (
      <div className="max-w-[1700px] mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-[#64748b]">Loading SENTINEL operational data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 min-h-screen">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111d30] border border-[#1e3151] rounded-xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
            </span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white tracking-tight flex items-center gap-2">
              Security Operations Command Center
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 tracking-wider">
                REAL-TIME
              </span>
            </h1>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Incident triage, spatial intelligence, unit telemetry, and SLA escalation watchdog
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] hover:text-white border border-[#1e3151] hover:border-[#2a4166] text-[12px] font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Syncing..." : "Sync Telemetry"}</span>
        </button>
      </div>

      {/* ── KPI Metric Strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {KPI_CONFIG.map(({ key, label, sub, icon: Icon, valClass, borderClass, suffix }) => (
          <div key={key} className={`p-3.5 rounded-xl bg-[#111d30] border ${borderClass} text-left`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">{label}</span>
              <Icon className={`w-3.5 h-3.5 ${valClass} opacity-70`} />
            </div>
            <div className={`text-xl font-bold font-mono ${valClass}`}>
              {kpis[key]}{suffix || ""}
            </div>
            <div className="text-[10px] text-[#475569] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main SOC Workspace ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ── Tactical Map (Left, 7 cols) ── */}
        <div className="lg:col-span-7 bg-[#111d30] border border-[#1e3151] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span className="text-[13px] font-semibold text-white">Tactical Spatial Map</span>
              <span className="text-[10px] font-mono text-[#64748b]">OpenStreetMap + Leaflet</span>
            </div>
            {/* Layer Filters */}
            <div className="flex items-center bg-[#0a1120] border border-[#1e3151] rounded-lg p-0.5 gap-0.5 text-[11px]">
              {["ALL", "INCIDENTS", "MISSING", "CROWD", "TEAMS"].map((f) => (
                <button
                  key={f}
                  onClick={() => setMapFilter(f)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    mapFilter === f
                      ? "bg-sky-500 text-white font-semibold"
                      : "text-[#64748b] hover:text-[#94a3b8]"
                  }`}
                >
                  {f === "ALL" ? "All" : f === "INCIDENTS" ? "Incidents" : f === "MISSING" ? "Missing" : f === "CROWD" ? "Crowd" : "Teams"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[480px] w-full rounded-xl overflow-hidden border border-[#1e3151]">
            <MapWrapper
              markers={markers}
              selectedId={selectedIncident?.id}
              onSelectMarker={handleSelectMarker}
              activeFilter={mapFilter}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#475569]">
            <span>19.0760° N, 72.8777° E &bull; Radius rendering active</span>
            <span>Click any marker to open incident dossier</span>
          </div>
        </div>

        {/* ── Live Incident Queue (Right, 5 cols) ── */}
        <div className="lg:col-span-5 bg-[#111d30] border border-[#1e3151] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-[13px] font-semibold text-white">
                Live Incident Queue
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#172338] border border-[#1e3151] text-[#64748b]">
                {openIncidents.length} open
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#475569]">SLA Watchdog Active</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
            {openIncidents.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-8 h-8 text-[#1e3151] mx-auto mb-2" />
                <p className="text-[12px] text-[#475569]">All sectors reporting normal status</p>
              </div>
            ) : (
              openIncidents.map((inc) => {
                const isCritical = inc.priority === "CRITICAL";
                const isEscalated = inc.escalationLevel === "ESCALATED";
                const isSelected = selectedIncident?.id === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-sky-500/8 border-sky-500/60 ring-1 ring-sky-500/30"
                        : isEscalated
                        ? "bg-red-500/5 border-red-500/40 hover:border-red-500/60"
                        : "bg-[#172338] border-[#1e3151] hover:border-[#2a4166]"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-sky-400">
                          {inc.incidentNumber}
                        </span>
                        <span className={`badge ${
                          isCritical ? "badge-critical" : inc.priority === "HIGH" ? "badge-high" : "badge-medium"
                        }`}>
                          {inc.priority}
                        </span>
                        {isEscalated && (
                          <span className="badge badge-critical">ESC</span>
                        )}
                      </div>
                      <span className={`badge ${
                        inc.status === "RESOLVED" ? "badge-resolved" : inc.status === "IN_PROGRESS" ? "badge-active" : "badge-pending"
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-[13px] font-semibold text-white line-clamp-1">{inc.title}</h4>

                    {/* Description */}
                    <p className="text-[11px] text-[#64748b] mt-1 line-clamp-2 leading-relaxed">
                      {inc.description}
                    </p>

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e3151]/60 text-[11px]">
                      <span className="flex items-center gap-1 text-[#64748b]">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[130px]">{inc.locationName}</span>
                      </span>
                      {inc.assignedTeam ? (
                        <span className="text-emerald-400 font-medium">{inc.assignedTeam.name}</span>
                      ) : (
                        <span className="text-amber-400">Unassigned</span>
                      )}
                    </div>

                    {/* Duplicate badge */}
                    {inc.duplicateScore && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] bg-amber-500/8 border border-amber-500/25 text-amber-400 px-2 py-1 rounded-md">
                        <Cpu className="w-3 h-3" />
                        <span>AI Clustered Duplicate — {Math.round(inc.duplicateScore * 100)}% match</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Selected Incident Dossier ─────────────────────────── */}
      {selectedIncident && (
        <div className="bg-[#111d30] border border-[#1e3151] rounded-xl p-5 space-y-4 animate-slide-up">
          {/* Dossier Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#1e3151]">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-[12px] font-bold text-sky-400">{selectedIncident.incidentNumber}</span>
                <span className="badge badge-active">{selectedIncident.category}</span>
                <span className={`badge ${selectedIncident.priority === "CRITICAL" ? "badge-critical" : selectedIncident.priority === "HIGH" ? "badge-high" : "badge-medium"}`}>
                  {selectedIncident.priority} Priority
                </span>
                <span className={`badge ${selectedIncident.status === "RESOLVED" ? "badge-resolved" : "badge-pending"}`}>
                  {selectedIncident.status}
                </span>
              </div>
              <h2 className="text-[16px] font-semibold text-white">{selectedIncident.title}</h2>
              <p className="text-[12px] text-[#64748b] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {selectedIncident.locationName} &bull; {selectedIncident.latitude?.toFixed(4)}, {selectedIncident.longitude?.toFixed(4)}
              </p>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1.5 rounded-lg text-[#64748b] hover:text-white hover:bg-[#172338] border border-transparent hover:border-[#1e3151] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1: AI Advisory */}
            <div className="p-4 rounded-xl bg-[#0a1120] border border-[#1e3151] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e3151]">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[12px] font-semibold text-white">AI Advisory</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  Human confirmation required
                </span>
              </div>

              <div className="text-[12px] text-[#94a3b8] leading-relaxed">
                {selectedIncident.aiSummary || "Telemetry parsed. Awaiting operator review."}
              </div>

              <div className="space-y-1.5 text-[12px]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#475569]">Recommended unit:</span>
                  <span className="font-semibold text-white text-right">
                    {selectedIncident.aiTeamSuggestion?.replace(/_/g, " ") || "SECURITY"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#475569]">Reporter:</span>
                  <span className="font-medium text-[#94a3b8] text-right">
                    {selectedIncident.reporterName || "Anonymous"} {selectedIncident.reporterPhone ? `· ${selectedIncident.reporterPhone}` : ""}
                  </span>
                </div>
              </div>

              {selectedIncident.duplicateScore && selectedIncident.masterIncidentId && (
                <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/25 space-y-2">
                  <p className="text-[11px] font-semibold text-amber-400">Possible Duplicate Detected</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMergeDuplicate(selectedIncident.masterIncidentId, selectedIncident.id, "MERGE")}
                      disabled={isUpdating}
                      className="flex-1 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all"
                    >
                      Merge to Master
                    </button>
                    <button
                      onClick={() => handleMergeDuplicate(selectedIncident.masterIncidentId, selectedIncident.id, "KEEP_SEPARATE")}
                      disabled={isUpdating}
                      className="flex-1 py-1.5 rounded-md bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] font-semibold text-[11px] border border-[#1e3151] transition-all"
                    >
                      Keep Separate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Col 2: Unit Dispatch */}
            <div className="p-4 rounded-xl bg-[#0a1120] border border-[#1e3151] space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#1e3151]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[12px] font-semibold text-white">Unit Dispatch</span>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider block mb-1.5">
                  Assign Tactical Unit
                </label>
                <select
                  value={selectedIncident.assignedTeamId || ""}
                  onChange={(e) => handleAssignTeam(selectedIncident.id, e.target.value)}
                  disabled={isUpdating}
                  className="soc-input text-[12px]"
                >
                  <option value="">— Unassigned —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.type} · {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider block mb-1.5">
                  Status Progression
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Verify",    status: "VERIFIED",    disabled: selectedIncident.status !== "REPORTED" },
                    { label: "Acknowledge", status: "ACKNOWLEDGED", disabled: ["ACKNOWLEDGED","IN_PROGRESS","RESOLVED"].includes(selectedIncident.status) },
                    { label: "On Scene",  status: "IN_PROGRESS", disabled: ["IN_PROGRESS","RESOLVED"].includes(selectedIncident.status), highlight: true },
                    { label: "Resolve",   status: "RESOLVED",    disabled: selectedIncident.status === "RESOLVED", danger: true },
                  ].map(({ label, status, disabled, highlight, danger }) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedIncident.id, status)}
                      disabled={isUpdating || disabled}
                      className={`py-2 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-35 ${
                        danger    ? "bg-emerald-600 hover:bg-emerald-500 text-white" :
                        highlight ? "bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30" :
                        "bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] border border-[#1e3151]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 3: Case Timeline */}
            <div className="p-4 rounded-xl bg-[#0a1120] border border-[#1e3151] space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#1e3151]">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[12px] font-semibold text-white">Case Chronology</span>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {(!selectedIncident.timelineEvents || selectedIncident.timelineEvents.length === 0) ? (
                  <p className="text-[12px] text-[#475569]">No events logged yet.</p>
                ) : (
                  selectedIncident.timelineEvents.map((evt: any) => (
                    <div key={evt.id} className="relative pl-4">
                      <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
                      <div className="absolute left-[3px] top-3 bottom-0 w-px bg-[#1e3151]" />
                      <p className="text-[12px] text-[#94a3b8] font-medium">{evt.description}</p>
                      <p className="text-[10px] font-mono text-[#475569] mt-0.5">
                        {evt.actorName} ({evt.actorRole}) &bull; {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}