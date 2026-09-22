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

  // Fetch operational telemetry
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

  // Build unified tactical map markers
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
    // Missing Persons (Orange with dynamic search perimeter)
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
    // Crowd Zones (Amber)
    ...crowdZones.map((z) => ({
      id: z.id,
      type: "CROWD_ZONE" as any,
      title: `${z.name} (${Math.round(z.densityRatio * 100)}% Load)`,
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
        title: `Unit: ${t.name}`,
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
    <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 bg-[#0c1322] min-h-screen text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111b2f] p-4 rounded-xl border border-[#243656] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              Security Operations Command Center (SOC)
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#16233b] text-[#38bdf8] border border-[#243656]">
              REAL-TIME DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Central incident triage, spatial intelligence mapping, unit telemetry, and escalation watchdog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-300 hover:text-white border border-[#243656] text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS - Strict Status Color Discipline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Cyan = Active/Information */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-[#243656] text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Incidents</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#38bdf8]" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.activeIncidents}</div>
          <div className="text-[10px] text-[#38bdf8] font-mono mt-0.5">Open in Queue</div>
        </div>

        {/* Red = Critical Alerts Only */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-red-900/60 text-left relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="text-red-300 font-semibold">Critical Alerts</span>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          <div className="text-2xl font-black text-red-400">{kpis.criticalAlerts}</div>
          <div className="text-[10px] text-red-300 font-mono mt-0.5">Priority 1 Priority</div>
        </div>

        {/* Orange = Missing Persons */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-[#ea580c]/40 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Missing Persons</span>
            <Eye className="w-3.5 h-3.5 text-[#ea580c]" />
          </div>
          <div className="text-2xl font-black text-[#ea580c]">{kpis.missingPersons}</div>
          <div className="text-[10px] text-[#ea580c] font-mono mt-0.5">Perimeter Grid Active</div>
        </div>

        {/* Amber = Warning (Crowd Alert) */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-amber-500/40 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Crowd Surges</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{kpis.crowdAlerts}</div>
          <div className="text-[10px] text-amber-300 font-mono mt-0.5">&gt; 85% Bottlenecks</div>
        </div>

        {/* Green = Normal / Active Available Teams */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-[#243656] text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Field Units</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpis.activeTeams}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Patrol & K9 Units</div>
        </div>

        {/* Green = Resolved Today */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-[#243656] text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Resolved Today</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.resolvedCases}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cases Closed</div>
        </div>

        {/* Cyan = Metrics Average Response */}
        <div className="p-3 rounded-lg bg-[#111b2f] border border-[#243656] text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Response</span>
            <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
          </div>
          <div className="text-2xl font-black text-[#38bdf8]">{kpis.avgResponseTimeMinutes}m</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">SLA Target &lt; 5m</div>
        </div>
      </div>

      {/* MAIN SOC WORKSPACE: TACTICAL MAP (LEFT) & LIVE OPS QUEUE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: TACTICAL SPATIAL MAP (7 Cols) */}
        <div className="lg:col-span-7 bg-[#111b2f] border border-[#243656] rounded-xl p-3.5 shadow-md flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#243656]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Tactical Spatial Vector Map (OpenStreetMap & Leaflet)
              </span>
            </div>

            {/* Layer Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#0c1322] p-0.5 rounded border border-[#243656] text-[11px]">
              {[
                { id: "ALL", label: "All Layers" },
                { id: "INCIDENTS", label: "Incidents" },
                { id: "MISSING", label: "Missing" },
                { id: "CROWD", label: "Crowd Zones" },
                { id: "TEAMS", label: "Field Units" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMapFilter(f.id)}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    mapFilter === f.id
                      ? "bg-[#0ea5e9] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map Viewport */}
          <div className="h-[490px] w-full rounded-lg overflow-hidden border border-[#243656]">
            <MapWrapper
              markers={markers}
              selectedId={selectedIncident?.id}
              onSelectMarker={handleSelectMarker}
              activeFilter={mapFilter}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>SECTOR: 19.0760° N, 72.8777° E &bull; REAL-TIME RADIUS RENDERING</span>
            <span>CLICK MARKER TO INSPECT OPERATIONAL DOSSIER</span>
          </div>
        </div>

        {/* RIGHT: LIVE OPERATIONS & ESCALATION WATCHDOG (5 Cols) */}
        <div className="lg:col-span-5 bg-[#111b2f] border border-[#243656] rounded-xl p-3.5 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#243656]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Live Incident Queue ({incidents.filter((i) => i.status !== "RESOLVED").length})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SLA Escalation Engine Active</span>
          </div>

          {/* Incident Queue List */}
          <div className="space-y-2 max-h-[490px] overflow-y-auto pr-1">
            {incidents.filter((i) => i.status !== "RESOLVED").length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No open incidents. All operational sectors reporting normal status.
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
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#1b2b48] border-[#0ea5e9] ring-1 ring-[#0ea5e9]"
                          : isEscalated
                          ? "bg-red-950/20 border-red-500/70"
                          : isWarning
                          ? "bg-amber-950/20 border-amber-500/60"
                          : "bg-[#16233b] border-[#243656] hover:border-[#38bdf8]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#38bdf8]">
                            {inc.incidentNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isCritical
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : inc.priority === "HIGH"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-[#0c1322] text-slate-300 border border-[#243656]"
                            }`}
                          >
                            {inc.priority}
                          </span>
                          {isEscalated && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">
                              ESCALATED
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                          {inc.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-200 line-clamp-1 mb-1">
                        {inc.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                        {inc.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#243656]/60 text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[150px]">{inc.locationName}</span>
                        </span>
                        <span>
                          {inc.assignedTeam ? (
                            <strong className="text-emerald-400 font-semibold">{inc.assignedTeam.name}</strong>
                          ) : (
                            <span className="text-amber-400 text-[10px] font-medium">Unassigned</span>
                          )}
                        </span>
                      </div>

                      {/* Duplicate correlation notification */}
                      {inc.duplicateScore && (
                        <div className="mt-1.5 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 p-1.5 rounded flex items-center justify-between">
                          <span>AI Clustered Duplicate ({Math.round(inc.duplicateScore * 100)}% match)</span>
                          <span className="font-semibold underline">Review Merge</span>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* SELECTED INCIDENT DOSSIER / OPERATIONAL ACTIONS */}
      {selectedIncident && (
        <div className="bg-[#111b2f] border border-[#243656] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-[#243656]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#38bdf8]">
                  {selectedIncident.incidentNumber}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#16233b] text-slate-300 border border-[#243656] uppercase">
                  {selectedIncident.category}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                    selectedIncident.priority === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {selectedIncident.priority} Priority
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Status: {selectedIncident.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {selectedIncident.title}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{selectedIncident.locationName} &bull; Coordinates: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</span>
              </p>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white bg-[#16233b] border border-[#243656]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1: AI Incident Triage Intelligence */}
            <div className="p-3.5 rounded-lg bg-[#16233b] border border-[#243656] space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#243656]">
                <div className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI Operational Assistant</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Advisory</span>
              </div>

              <div className="text-slate-300 text-[11px] leading-relaxed p-2.5 rounded bg-[#0c1322] border border-[#243656]">
                {selectedIncident.aiSummary || "Telemetry parsed."}
              </div>

              <div className="space-y-1 text-slate-400 text-[11px]">
                <div>
                  <span className="text-slate-500">Recommended Unit: </span>
                  <span className="font-semibold text-slate-200">
                    {selectedIncident.aiTeamSuggestion?.replace(/_/g, " ") || "SECURITY"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Witness Record: </span>
                  <span className="font-semibold text-slate-200">
                    {selectedIncident.reporterName || "Anonymous Witness"} {selectedIncident.reporterPhone ? `(${selectedIncident.reporterPhone})` : ""}
                  </span>
                </div>
              </div>

              {/* Duplicate Merge Options */}
              {selectedIncident.duplicateScore && selectedIncident.masterIncidentId && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
                  <div className="font-bold text-[10px]">Possible Duplicate Incident Detected</div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleMergeDuplicate(selectedIncident.masterIncidentId, selectedIncident.id, "MERGE")}
                      disabled={isUpdating}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px]"
                    >
                      Merge into Master
                    </button>
                    <button
                      onClick={() => handleMergeDuplicate(selectedIncident.masterIncidentId, selectedIncident.id, "KEEP_SEPARATE")}
                      disabled={isUpdating}
                      className="px-2 py-1 bg-[#111b2f] hover:bg-[#0c1322] text-slate-300 font-semibold rounded text-[10px] border border-[#243656]"
                    >
                      Keep Separate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Col 2: Tactical Unit Assignment */}
            <div className="p-3.5 rounded-lg bg-[#16233b] border border-[#243656] space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 pb-1 border-b border-[#243656]">
                <Shield className="w-3.5 h-3.5" />
                <span>Unit Dispatch & Progression</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Assigned Tactical Unit:</label>
                <select
                  value={selectedIncident.assignedTeamId || ""}
                  onChange={(e) => handleAssignTeam(selectedIncident.id, e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-2.5 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100 focus:outline-none focus:border-[#0ea5e9]"
                >
                  <option value="">-- Unassigned (Select Unit) --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.type} &bull; {t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-slate-400 block mb-1 text-[11px]">Update Operational Status:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "VERIFIED")}
                    disabled={isUpdating || selectedIncident.status !== "REPORTED"}
                    className="p-1.5 rounded bg-[#111b2f] hover:bg-[#0c1322] border border-[#243656] font-semibold text-[10px] disabled:opacity-40"
                  >
                    1. Admin Verify
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "ACKNOWLEDGED")}
                    disabled={isUpdating || ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].includes(selectedIncident.status)}
                    className="p-1.5 rounded bg-[#111b2f] hover:bg-[#0c1322] border border-[#243656] font-semibold text-[10px] disabled:opacity-40"
                  >
                    2. Acknowledge
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "IN_PROGRESS")}
                    disabled={isUpdating || ["IN_PROGRESS", "RESOLVED"].includes(selectedIncident.status)}
                    className="p-1.5 rounded bg-[#0ea5e9]/20 hover:bg-[#0ea5e9]/30 border border-[#0ea5e9]/50 text-[#38bdf8] font-semibold text-[10px] disabled:opacity-40"
                  >
                    3. On Scene
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedIncident.id, "RESOLVED")}
                    disabled={isUpdating || selectedIncident.status === "RESOLVED"}
                    className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] disabled:opacity-40"
                  >
                    4. Resolve Case
                  </button>
                </div>
              </div>
            </div>

            {/* Col 3: Chronological Case Timeline */}
            <div className="p-3.5 rounded-lg bg-[#16233b] border border-[#243656] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 pb-1 border-b border-[#243656]">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Case Chronology</span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedIncident.timelineEvents?.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No events logged yet.</p>
                ) : (
                  selectedIncident.timelineEvents?.map((evt: any) => (
                    <div key={evt.id} className="relative pl-3 border-l-2 border-[#243656] text-[11px]">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#0ea5e9]"></div>
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