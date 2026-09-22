"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  BarChart2,
  PieChart,
  Users,
  Shield,
  Clock,
  MapPin,
  RefreshCw,
  Flame,
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-400">Loading Sentinel Operations Intelligence...</p>
      </div>
    );
  }

  const { kpis, categoryBreakdown, priorityCounts, hourlyData, zoneLoads, teamWorkloads, heatmapPoints } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Operations Analytics & Situational Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated decision-support metrics, category distributions, team workloads, and density heatmaps. (Seeded Demo Telemetry)
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Active Incidents</div>
          <div className="text-2xl font-black text-white">{kpis.activeIncidents}</div>
        </div>
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50">
          <div className="text-red-300 text-xs mb-1">Critical Alerts</div>
          <div className="text-2xl font-black text-red-400">{kpis.criticalAlerts}</div>
        </div>
        <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-900/50">
          <div className="text-orange-300 text-xs mb-1">Missing Persons</div>
          <div className="text-2xl font-black text-orange-400">{kpis.missingPersons}</div>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50">
          <div className="text-amber-300 text-xs mb-1">Crowd Surges</div>
          <div className="text-2xl font-black text-amber-400">{kpis.crowdAlerts}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Active Teams</div>
          <div className="text-2xl font-black text-emerald-400">{kpis.activeTeams}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Resolved Today</div>
          <div className="text-2xl font-black text-indigo-400">{kpis.resolvedCases}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Avg Response</div>
          <div className="text-2xl font-black text-sky-400">{kpis.avgResponseTimeMinutes}m</div>
        </div>
      </div>

      {/* Row 1: Categories Breakdown & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              <span>Incidents by Category</span>
            </h3>
            <span className="text-[11px] text-slate-400">Total Classified</span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown?.map((item: any) => {
              const maxCount = Math.max(...categoryBreakdown.map((c: any) => c.count), 1);
              const percent = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.category}</span>
                    <span className="text-slate-400">{item.count} reports</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Trend Simulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Hourly Operational Activity Trend (24h)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Peak at 16:00</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-44 pt-6">
            {hourlyData?.map((item: any) => (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="text-[10px] text-sky-300 font-bold">{item.incidents}</div>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-900 via-sky-600 to-sky-400 transition-all"
                  style={{ height: `${Math.max(item.incidents * 12, 10)}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono">{item.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Crowd Zone Capacity Loads & Response Team Workloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Zones Loads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Zone Capacity Load Distribution</span>
            </h3>
            <span className="text-[11px] text-slate-400">Sensor Optical Grid</span>
          </div>

          <div className="space-y-3">
            {zoneLoads?.map((z: any) => (
              <div key={z.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{z.name}</span>
                  <span
                    className={`font-bold ${
                      z.density >= 85 ? "text-red-400" : z.density >= 70 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {z.density}% ({z.current} / {z.capacity})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      z.density >= 85
                        ? "bg-red-500"
                        : z.density >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${z.density}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Tactical Unit Readiness & Assignments</span>
            </h3>
            <span className="text-[11px] text-slate-400">Available / Dispatched</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2 text-left font-semibold">Unit Name</th>
                  <th className="pb-2 text-left font-semibold">Type</th>
                  <th className="pb-2 text-left font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teamWorkloads?.map((t: any) => (
                  <tr key={t.name}>
                    <td className="py-2.5 font-bold text-slate-200">{t.name}</td>
                    <td className="py-2.5 text-slate-400">{t.type}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === "AVAILABLE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : t.status === "ON_SCENE"
                            ? "bg-sky-500/20 text-sky-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                      {t.assignedIncidentsCount} cases
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Security Heatmap Points Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-left space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">
              Tactical Density Heatmap Coordinates (Decision-Support Matrix)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">
            Note: Dynamic event density only. Does not classify areas as inherently dangerous.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {heatmapPoints?.slice(0, 12).map((pt: any, idx: number) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">NODE #{idx + 1}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    pt.weight >= 0.8
                      ? "bg-red-500/20 text-red-400"
                      : pt.weight >= 0.5
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-sky-500/20 text-sky-400"
                  }`}
                >
                  {(pt.weight * 100).toFixed(0)}% WT
                </span>
              </div>
              <div className="font-mono text-[10px] text-slate-300">
                {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}