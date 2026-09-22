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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Crowd Management & Perimeter Surge Monitoring
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical/sensor capacity tracking across entry gates, exit bottlenecks, and arena zones.
            Automated alerts when density exceeds 85%. (Simulated Hackathon Telemetry)
          </p>
        </div>

        <button
          onClick={fetchZones}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Sensors</span>
        </button>
      </div>

      {/* Surge Alert Banner if any zone is critical */}
      {zones.some((z) => z.alertActive) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-sm text-white">Critical Density Breach Detected</div>
              <p className="text-xs text-amber-300">
                {zones.find((z) => z.alertActive)?.alertMessage}
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
            Active Hazard Warning
          </span>
        </div>
      )}

      {/* Grid of Crowd Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const densityPercent = Math.round(zone.densityRatio * 100);
          const isCritical = zone.riskLevel === "CRITICAL";
          const isHigh = zone.riskLevel === "HIGH";

          return (
            <div
              key={zone.id}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isCritical
                  ? "bg-red-950/20 border-red-500/60 shadow-xl shadow-red-950/40"
                  : isHigh
                  ? "bg-amber-950/20 border-amber-500/50"
                  : "bg-slate-900/70 border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {zone.zoneCode}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCritical
                        ? "bg-red-600 text-white animate-pulse"
                        : isHigh
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {zone.riskLevel} DENSITY
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-1">{zone.name}</h3>
                <div className="text-xs text-slate-400 mb-4">
                  Category: <strong className="text-slate-300">{zone.category}</strong>
                </div>

                {/* Progress Density Meter */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Occupancy Load</span>
                    <span className={`font-bold ${isCritical ? "text-red-400" : isHigh ? "text-amber-400" : "text-emerald-400"}`}>
                      {densityPercent}% ({zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? "bg-gradient-to-r from-red-600 to-rose-500"
                          : isHigh
                          ? "bg-gradient-to-r from-amber-500 to-orange-500"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500"
                      }`}
                      style={{ width: `${Math.min(densityPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Team */}
                <div className="text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 mb-4">
                  <span className="text-slate-500 block text-[11px]">Assigned Crowd Team:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold text-emerald-400">
                      {zone.assignedTeam ? zone.assignedTeam.name : "None assigned"}
                    </span>
                    <select
                      value={zone.assignedTeamId || ""}
                      onChange={(e) => handleAssignCrowdTeam(zone.id, e.target.value)}
                      className="text-[11px] bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200"
                    >
                      <option value="">Reassign Unit</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Controls: Simulate Surge / Reset Count */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTriggerSurge(zone.id)}
                  disabled={isSimulating}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Surge (90%+)</span>
                </button>

                <button
                  onClick={() => handleAdjustCount(zone.id, Math.round(zone.capacity * 0.35))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Reset Count
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}