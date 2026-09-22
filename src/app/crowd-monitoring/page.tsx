"use client";

import React, { useState, useEffect } from "react";
import { Users, AlertTriangle, Shield, Flame, CheckCircle, RefreshCw } from "lucide-react";

export default function CrowdMonitoringPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchZones = async () => {
    try {
      const [czRes, rtRes] = await Promise.all([fetch("/api/crowd-zones"), fetch("/api/response-teams")]);
      const [czData, rtData] = await Promise.all([czRes.json(), rtRes.json()]);
      if (czData.zones) setZones(czData.zones);
      if (rtData.teams) setTeams(rtData.teams);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchZones();
    const interval = setInterval(fetchZones, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSurge = async (zoneId: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/crowd-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId, surgeSimulation: true }),
      });
      const data = await res.json();
      if (data.success) await fetchZones();
    } catch (e: any) { alert("Surge error: " + e.message); }
    finally { setIsSimulating(false); }
  };

  const handleAdjustCount = async (zoneId: string, newCount: number) => {
    try {
      await fetch("/api/crowd-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId, newCount }),
      });
      await fetchZones();
    } catch (e) { console.error(e); }
  };

  const handleAssignCrowdTeam = async (zoneId: string, teamId: string) => {
    try {
      await fetch("/api/crowd-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId, assignedTeamId: teamId }),
      });
      await fetchZones();
    } catch (e) { console.error(e); }
  };

  const alertZone = zones.find((z) => z.alertActive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 min-h-screen">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111d30] border border-[#1e3151] rounded-xl px-5 py-3.5">
        <div>
          <h1 className="text-[15px] font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Perimeter Crowd Density &amp; Surge Management
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Real-time optical/turnstile tracking. Threshold alert at &gt;85% capacity.
          </p>
        </div>
        <button
          onClick={fetchZones}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] hover:text-white border border-[#1e3151] text-[12px] font-medium transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          Sync Sensors
        </button>
      </div>

      {/* Alert Banner */}
      {alertZone && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-amber-300">Capacity Threshold Alert Triggered</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">{alertZone.alertMessage}</p>
            </div>
          </div>
          <span className="badge badge-high border">Active Warning</span>
        </div>
      )}

      {/* Zone Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const densityPercent = Math.round(zone.densityRatio * 100);
            const isCritical = zone.riskLevel === "CRITICAL";
            const isHigh = zone.riskLevel === "HIGH";

            return (
              <div
                key={zone.id}
                className={`bg-[#111d30] rounded-xl border text-left flex flex-col transition-all ${
                  isCritical ? "border-red-500/40" : isHigh ? "border-amber-500/35" : "border-[#1e3151]"
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1e3151]">
                  <div>
                    <span className="font-mono text-[10px] text-[#475569]">{zone.zoneCode}</span>
                    <h3 className="text-[13px] font-semibold text-white mt-0.5">{zone.name}</h3>
                    <span className="text-[11px] text-[#64748b]">{zone.category}</span>
                  </div>
                  <span className={`badge border ${isCritical ? "badge-critical" : isHigh ? "badge-high" : "badge-resolved"}`}>
                    {zone.riskLevel}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1">
                  {/* Density Meter */}
                  <div>
                    <div className="flex items-center justify-between text-[12px] mb-1.5">
                      <span className="text-[#64748b]">Occupancy</span>
                      <span className={`font-mono font-bold ${isCritical ? "text-red-400" : isHigh ? "text-amber-400" : "text-emerald-400"}`}>
                        {densityPercent}% &bull; {zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="density-track">
                      <div
                        className={`density-fill ${isCritical ? "bg-red-500" : isHigh ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(densityPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Team */}
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-[#0a1120] rounded-lg border border-[#1e3151]">
                    <div>
                      <span className="section-label block mb-0.5">Assigned Unit</span>
                      <span className={`text-[12px] font-medium ${zone.assignedTeam ? "text-emerald-400" : "text-[#475569]"}`}>
                        {zone.assignedTeam ? zone.assignedTeam.name : "None assigned"}
                      </span>
                    </div>
                    <select
                      value={zone.assignedTeamId || ""}
                      onChange={(e) => handleAssignCrowdTeam(zone.id, e.target.value)}
                      className="soc-input text-[11px] w-32 py-1"
                    >
                      <option value="">Reassign</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1e3151]">
                  <button
                    onClick={() => handleTriggerSurge(zone.id)}
                    disabled={isSimulating}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 font-semibold text-[11px] transition-all disabled:opacity-50"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Simulate Surge
                  </button>
                  <button
                    onClick={() => handleAdjustCount(zone.id, Math.round(zone.capacity * 0.35))}
                    className="px-3 py-1.5 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] text-[#64748b] hover:text-[#94a3b8] border border-[#1e3151] text-[11px] transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}