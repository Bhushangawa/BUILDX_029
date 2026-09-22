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
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  Send,
  Layers,
  Phone,
  ShieldAlert,
  ArrowUpRight,
  FileText,
} from "lucide-react";

export default function CommandCenterPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [missingPersons, setMissingPersons] = useState<any[]>([]);
  const [crowdZones, setCrowdZones] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    activeIncidents: 0,
    criticalAlerts: 0,
    missingPersons: 0,
    crowdAlerts: 0,
    activeTeams: 0,
    resolvedCases: 0,
    avgResponseTimeMinutes: 4.2,
  });

  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [mapFilter, setMapFilter] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all live operational data
  const fetchData = async () => {
    try {
      const [incRes, mpRes, czRes, rtRes, anRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/missing-persons"),
        fetch("/api/crowd-zones"),
        fetch("/api/response-teams"),
        fetch("/api/analytics"),
      ]);

      const [incData, mpData, czData, rtData, anData] = await Promise.all([
        incRes.json(),
        mpRes.json(),
        czRes.json(),
        rtRes.json(),
        anRes.json(),
      ]);

      if (incData.incidents) setIncidents(incData.incidents);
      if (mpData.cases) setMissingPersons(mpData.cases);
      if (czData.zones) setCrowdZones(czData.zones);
      if (rtData.teams) setTeams(rtData.teams);
      if (anData.kpis) setKpis(anData.kpis);

      // If an incident is currently selected, refresh its details
      if (selectedIncident) {
        const found = incData.incidents?.find((i: any) => i.id === selectedIncident.id);
        if (found) setSelectedIncident(found);
      }
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Prepare unified map markers
  const markers = [
    // Incidents
    ...incidents
      .filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED")
      .map((i) => ({
        id: i.id,
        type: (i.priority === "CRITICAL" ? "INCIDENT_CRITICAL" : "INCIDENT") as any,
        title: `${i.incidentNumber}: ${i.title}`,
        lat: i.latitude,
        lng: i.longitude,
        priority: i.priority,
        category: i.category,
        status: i.status,
        assignedTeam: i.assignedTeam?.name,
        data: i,
      })),
    // Missing Persons (Orange with search radius)
    ...missingPersons
      .filter((m) => m.status !== "FOUND_SAFE" && m.status !== "CLOSED")
      .map((m) => ({
        id: m.id,
        type: "MISSING_PERSON" as any,
        title: `${m.caseNumber}: Missing ${m.fullName} (${m.age}yo)`,
        lat: m.latitude,
        lng: m.longitude,
        priority: "CRITICAL",
        status: m.status,
        radiusMeters: m.searchRadiusMeters,
        assignedTeam: m.assignedTeam?.name,
        data: m,
      })),
    // Crowd Zones (Yellow)
    ...crowdZones.map((z) => ({
      id: z.id,
      type: "CROWD_ZONE" as any,
      title: `${z.name} (${Math.round(z.densityRatio * 100)}% Occupancy)`,
      lat: z.latitude,
      lng: z.longitude,
      radiusMeters: z.radiusMeters,
      priority: z.riskLevel,
      status: z.riskLevel,
      assignedTeam: z.assignedTeam?.name,
      data: z,
    })),
    // Response Teams (Green)
    ...teams
      .filter((t) => t.status === "AVAILABLE" || t.status === "ON_SCENE")
      .map((t) => ({
        id: t.id,
        type: "RESPONSE_TEAM" as any,
        title: `Team: ${t.name}`,
        lat: t.currentLatitude,
        lng: t.currentLongitude,
        status: t.status,
        data: t,
      })),
  ];

  const handleSelectMarker = (marker: any) => {
    setSelectedMarker(marker);
    if (marker.type.startsWith("INCIDENT")) {
      setSelectedIncident(marker.data);
    }
  };

  const handleUpdateStatus = async (incidentId: string, status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          actorName: "Commander Anita Deshmukh",
          actorRole: "ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (e: any) {
      alert("Status update error: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignTeam = async (incidentId: string, teamId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTeamId: teamId,
          status: "ASSIGNED",
          actorName: "Commander Anita Deshmukh",
          actorRole: "ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (e: any) {
      alert("Assignment error: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMergeDuplicate = async (masterId: string, dupId: string, action: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/incidents/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterIncidentId: masterId,
          duplicateIncidentId: dupId,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (e: any) {
      alert("Merge error: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Central Security Command Center
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              TACTICAL OPS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time unified situational awareness, Leaflet incident mapping, AI triage, and response dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Incidents</span>
            <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.activeIncidents}</div>
          <div className="text-[10px] text-sky-400 mt-0.5 font-medium">In Queue / Field</div>
        </div>

        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 text-left relative overflow-hidden">
          <div className="flex items-center justify-between text-red-300 text-xs mb-1">
            <span>Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-red-400">{kpis.criticalAlerts}</div>
          <div className="text-[10px] text-red-300 mt-0.5 font-medium">Immediate Action</div>
        </div>

        <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-900/50 text-left">
          <div className="flex items-center justify-between text-orange-300 text-xs mb-1">
            <span>Missing Persons</span>
            <Eye className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">{kpis.missingPersons}</div>
          <div className="text-[10px] text-orange-300 mt-0.5 font-medium">Active Search Grid</div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-left">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
            <span>Crowd Alerts</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{kpis.crowdAlerts}</div>
          <div className="text-[10px] text-amber-300 mt-0.5 font-medium">&gt; 85% Bottlenecks</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Teams</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpis.activeTeams}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">Patrol / K9 / Medical</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Resolved Cases</span>
            <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.resolvedCases}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Today&apos;s Operations</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Response</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{kpis.avgResponseTimeMinutes}m</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Target: &lt; 5 mins</div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: MAP (LEFT) & LIVE OPS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: INTERACTIVE TACTICAL MAP (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              <span className="font-bold text-sm text-slate-100">Live Spatial Map (Leaflet)</span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {[
                { id: "ALL", label: "All Layers" },
                { id: "INCIDENTS", label: "Incidents" },
                { id: "MISSING", label: "Missing" },
                { id: "CROWD", label: "Crowd Zones" },
                { id: "TEAMS", label: "Field Teams" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMapFilter(f.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    mapFilter === f.id
                      ? "bg-sky-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="h-[520px] w-full rounded-xl overflow-hidden">
            <MapWrapper
              markers={markers}
              selectedId={selectedIncident?.id}
              onSelectMarker={handleSelectMarker}
              activeFilter={mapFilter}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Venue: Metropolitan Central Security Zone (19.0760, 72.8777)</span>
            <span>Interactive Marker Click &bull; Real-time Radius Visualization</span>
          </div>
        </div>

        {/* RIGHT: LIVE OPERATIONS & INCIDENT QUEUE (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-slate-100">
                Live Incident Queue ({incidents.filter((i) => i.status !== "RESOLVED").length})
              </span>
            </div>
            <span className="text-[11px] text-slate-400">SLA Escalation Engine Active</span>
          </div>

          {/* Incident List */}
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {incidents.filter((i) => i.status !== "RESOLVED").length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active incidents. Venue operational status green.
              </div>
            ) : (
              incidents
                .filter((i) => i.status !== "RESOLVED")
                .map((inc) => {
                  const isCritical = inc.priority === "CRITICAL";
                  const isEscalated = inc.escalationLevel === "ESCALATED";
                  const isWarning = inc.escalationLevel === "WARNING";
                  const isSelected = selectedIncident?.id === inc.id;

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-slate-800 border-sky-500 ring-1 ring-sky-500"
                          : isEscalated
                          ? "bg-red-950/40 border-red-500/80 animate-pulse"
                          : isWarning
                          ? "bg-amber-950/30 border-amber-600/70"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-sky-400">
                            {inc.incidentNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isCritical
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : inc.priority === "HIGH"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {inc.priority}
                          </span>
                          {isEscalated && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-600 text-white animate-bounce">
                              SLA ESCALATED
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {inc.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-200 line-clamp-1 mb-1">
                        {inc.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {inc.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[140px]">{inc.locationName}</span>
                        </span>
                        <span>
                          {inc.assignedTeam ? (
                            <strong className="text-emerald-400">{inc.assignedTeam.name}</strong>
                          ) : (
                            <span className="text-amber-400 font-semibold">Unassigned</span>
                          )}
                        </span>
                      </div>

                      {/* Duplicate banner if present */}
                      {inc.duplicateScore && (
                        <div className="mt-2 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 p-1.5 rounded flex items-center justify-between">
                          <span>AI flagged duplicate ({Math.round(inc.duplicateScore * 100)}% confidence)</span>
                          <span className="font-semibold underline">Review</span>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* SELECTED INCIDENT DOSSIER / ACTION DRAWER */}
      {selectedIncident && (
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-sky-400">
                  {selectedIncident.incidentNumber}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                  {selectedIncident.category}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                    selectedIncident.priority === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {selectedIncident.priority} Priority
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Status: {selectedIncident.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1.5">
                {selectedIncident.title}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{selectedIncident.locationName} &bull; Coordinates: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</span>
              </p>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Col 1: AI Incident Intelligence */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Incident Intelligence Review</span>
              </div>
              <p className="text-slate-300 leading-relaxed italic bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                &ldquo;{selectedIncident.aiSummary || "AI Classified event based on natural language telemetry."}&rdquo;
              </p>
              <div className="space-y-1.5 text-slate-400">
                <div>
                  <span className="text-slate-500">Suggested Team: </span>
                  <span className="font-semibold text-slate-200">
                    {selectedIncident.aiTeamSuggestion?.replace(/_/g, " ") || "SECURITY"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Reporter: </span>
                  <span className="font-semibold text-slate-200">
                    {selectedIncident.reporterName || "Anonymous"} {selectedIncident.reporterPhone ? `(${selectedIncident.reporterPhone})` : ""}
                  </span>
                </div>
              </div>

              {/* Duplicate check merge actions */}
              {selectedIncident.duplicateScore && selectedIncident.masterIncidentId && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                  <div className="font-bold text-[11px]">Possible Duplicate Incident Detected</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMergeDuplicate(selectedIncident.masterIncidentId, selectedIncident.id, "MERGE")}
                      disabled={isUpdating}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px]"
                    >
                      Merge into Master
                    </button>
                    <button
                      onClick={() => handleMergeDuplicate(selectedIncident.masterIncidentId, selectedIncident.id, "KEEP_SEPARATE")}
                      disabled={isUpdating}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded text-[11px]"
                    >
                      Keep Separate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Col 2: Team Dispatcher */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>Response Team Dispatch & Status</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Unit:</label>
                <select
                  value={selectedIncident.assignedTeamId || ""}
                  onChange={(e) => handleAssignTeam(selectedIncident.id, e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Unassigned (Select Unit) --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.type} &bull; {t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status progression buttons */}
              <div className="space-y-1.5 pt-2">
                <label className="text-slate-400 block mb-1">Advance Operational Lifecycle:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "VERIFIED")}
                    disabled={isUpdating || selectedIncident.status !== "REPORTED"}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-[11px] disabled:opacity-40"
                  >
                    1. Admin Verify
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "ACKNOWLEDGED")}
                    disabled={isUpdating || ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].includes(selectedIncident.status)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-[11px] disabled:opacity-40"
                  >
                    2. Acknowledge
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "IN_PROGRESS")}
                    disabled={isUpdating || ["IN_PROGRESS", "RESOLVED"].includes(selectedIncident.status)}
                    className="p-1.5 rounded bg-sky-950/60 border border-sky-600/60 text-sky-300 font-semibold text-[11px] disabled:opacity-40"
                  >
                    3. On Scene
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "RESOLVED")}
                    disabled={isUpdating || selectedIncident.status === "RESOLVED"}
                    className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] disabled:opacity-40"
                  >
                    4. Resolve Case
                  </button>
                </div>
              </div>
            </div>

            {/* Col 3: Chronological Case Timeline */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                <Clock className="w-4 h-4" />
                <span>Case Timeline & Audit Trail</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedIncident.timelineEvents?.length === 0 ? (
                  <p className="text-slate-500">No events logged yet.</p>
                ) : (
                  selectedIncident.timelineEvents?.map((evt: any) => (
                    <div key={evt.id} className="relative pl-3.5 border-l-2 border-slate-800 text-[11px]">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-sky-400"></div>
                      <div className="text-slate-300 font-medium">{evt.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {evt.actorName} ({evt.actorRole}) &bull;{" "}
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
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