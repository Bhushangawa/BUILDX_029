"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  Shield,
  Activity,
  Flame,
  CheckCircle,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Radio,
  RefreshCw,
} from "lucide-react";

export default function CrowdMonitoringPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchZones = async () => {
    try {
      const [czRes, rtRes] = await Promise.all([
        fetch("/api/crowd-zones"),
        fetch("/api/response-teams"),
      ]);
      const [czData, rtData] = await Promise.all([czRes.json(), rtRes.json()]);

      if (czData.zones) setZones(czData.zones);
      if (rtData.teams) setTeams(rtData.teams);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify({
          zoneId,
          surgeSimulation: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchZones();
      }
    } catch (e: any) {
      alert("Surge error: " + e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAdjustCount = async (zoneId: string, newCount: number) => {
    try {
      await fetch("/api/crowd-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId, newCount }),
      });
      await fetchZones();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignCrowdTeam = async (zoneId: string, teamId: string) => {
    try {
      await fetch("/api/crowd-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId, assignedTeamId: teamId }),
      });
      await fetchZones();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-[#0c1322] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111b2f] p-4 rounded-xl border border-[#243656] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              Perimeter Crowd Density & Surge Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time optical/turnstile capacity tracking across entrances, exits, and main stages. Critical alert generated when threshold &gt; 85%.
          </p>
        </div>

        <button
          onClick={fetchZones}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-300 hover:text-white border border-[#243656] text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Sensors</span>
        </button>
      </div>

      {/* Critical Surge Warning Banner */}
      {zones.some((z) => z.alertActive) && (
        <div className="p-3.5 rounded-lg bg-amber-950/25 border border-amber-500/50 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <div className="font-bold text-xs text-white">Capacity Threshold Alert Triggered</div>
              <p className="text-[11px] text-amber-300">
                {zones.find((z) => z.alertActive)?.alertMessage}
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 uppercase">
            Active Warning
          </span>
        </div>
      )}

      {/* Grid of Crowd Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const densityPercent = Math.round(zone.densityRatio * 100);
          const isCritical = zone.riskLevel === "CRITICAL";
          const isHigh = zone.riskLevel === "HIGH";

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isCritical
                  ? "bg-[#16233b] border-red-500/60"
                  : isHigh
                  ? "bg-[#16233b] border-amber-500/50"
                  : "bg-[#111b2f] border-[#243656]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {zone.zoneCode}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCritical
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : isHigh
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-[#0c1322] text-slate-300 border border-[#243656]"
                    }`}
                  >
                    {zone.riskLevel} DENSITY
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-0.5">{zone.name}</h3>
                <div className="text-[11px] text-slate-400 mb-3">
                  Zone Class: <strong className="text-slate-300">{zone.category}</strong>
                </div>

                {/* Progress Density Meter */}
                <div className="space-y-1 mb-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Occupancy</span>
                    <span className={`font-mono font-bold text-xs ${isCritical ? "text-red-400" : isHigh ? "text-amber-400" : "text-emerald-400"}`}>
                      {densityPercent}% ({zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0c1322] border border-[#243656] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical
                          ? "bg-red-500"
                          : isHigh
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(densityPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Team */}
                <div className="text-xs p-2 rounded bg-[#0c1322] border border-[#243656] mb-3">
                  <span className="text-slate-500 block text-[10px]">Assigned Unit:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold text-emerald-400 text-[11px]">
                      {zone.assignedTeam ? zone.assignedTeam.name : "None assigned"}
                    </span>
                    <select
                      value={zone.assignedTeamId || ""}
                      onChange={(e) => handleAssignCrowdTeam(zone.id, e.target.value)}
                      className="text-[10px] bg-[#16233b] border border-[#243656] rounded px-1.5 py-0.5 text-slate-200"
                    >
                      <option value="">Reassign</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-2.5 border-t border-[#243656] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTriggerSurge(zone.id)}
                  disabled={isSimulating}
                  className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition-all"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Simulate Surge (90%+)</span>
                </button>

                <button
                  onClick={() => handleAdjustCount(zone.id, Math.round(zone.capacity * 0.35))}
                  className="px-2 py-1 rounded bg-[#16233b] hover:bg-[#1e2d48] text-slate-400 hover:text-slate-200 border border-[#243656] text-[11px]"
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}