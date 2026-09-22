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
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-mono text-slate-300">Loading Sentinel Operations Intelligence Matrix...</p>
        <p className="text-xs text-slate-500 mt-1">Aggregating incident telemetry, sensor feeds & team workloads</p>
      </div>
    );
  }

  const { kpis, categoryBreakdown, priorityCounts, hourlyData, zoneLoads, teamWorkloads, heatmapPoints } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111d30] border border-[#1e3151] p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                Live Operations Intelligence
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                TELEMETRY_REFRESH: 5000ms
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Activity className="w-7 h-7 text-sky-400" />
              <span>Operations Analytics & Situational Intelligence</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl">
              Aggregated decision-support metrics, incident category distributions, optical crowd loads, and tactical unit response workloads across all operational sectors.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#172338] hover:bg-[#1c2e4a] text-slate-200 hover:text-white border border-[#1e3151] text-xs font-semibold shadow transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (7 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
        <div className="p-4 rounded-xl bg-[#111b2f] border border-[#243656] relative overflow-hidden">
          <div className="text-slate-400 text-[11px] font-mono uppercase mb-1">Active Incidents</div>
          <div className="text-2xl font-black text-white font-mono">{kpis.activeIncidents}</div>
          <div className="text-[10px] text-slate-500 mt-1">In Triage & Response</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111b2f] border border-rose-500/30 relative overflow-hidden">
          <div className="text-rose-400 text-[11px] font-mono uppercase mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Critical Alerts
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{kpis.criticalAlerts}</div>
          <div className="text-[10px] text-rose-300/70 mt-1">SLA Escalated</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111b2f] border border-amber-500/30 relative overflow-hidden">
          <div className="text-amber-400 text-[11px] font-mono uppercase mb-1">Missing Persons</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{kpis.missingPersons}</div>
          <div className="text-[10px] text-amber-300/70 mt-1">Ground Searches Active</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111b2f] border border-amber-500/30 relative overflow-hidden">
          <div className="text-amber-400 text-[11px] font-mono uppercase mb-1">Crowd Surges</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{kpis.crowdAlerts}</div>
          <div className="text-[10px] text-amber-300/70 mt-1">High Density Zones</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111b2f] border border-emerald-500/30 relative overflow-hidden">
          <div className="text-emerald-400 text-[11px] font-mono uppercase mb-1">Active Teams</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{kpis.activeTeams}</div>
          <div className="text-[10px] text-emerald-300/70 mt-1">On-Scene & Standby</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111b2f] border border-indigo-500/30 relative overflow-hidden">
          <div className="text-indigo-400 text-[11px] font-mono uppercase mb-1">Resolved Today</div>
          <div className="text-2xl font-black text-indigo-400 font-mono">{kpis.resolvedCases}</div>
          <div className="text-[10px] text-indigo-300/70 mt-1">Verified Closed</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111b2f] border border-sky-500/30 relative overflow-hidden">
          <div className="text-sky-400 text-[11px] font-mono uppercase mb-1">Avg Response</div>
          <div className="text-2xl font-black text-sky-400 font-mono">{kpis.avgResponseTimeMinutes}m</div>
          <div className="text-[10px] text-sky-300/70 mt-1">Target &lt; 5.0m</div>
        </div>
      </div>

      {/* Row 1: Categories Breakdown & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Panel */}
        <div className="bg-[#111d30] border border-[#1e3151] rounded-2xl p-5 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#243656]">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              <span>Incident Classification Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-[#0c1322] px-2 py-0.5 rounded border border-[#243656]">
              Real-time Classifier
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryBreakdown?.map((item: any) => {
              const maxCount = Math.max(...categoryBreakdown.map((c: any) => c.count), 1);
              const percent = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.category}</span>
                    <span className="font-mono text-slate-400">
                      <strong className="text-white font-bold">{item.count}</strong> reports ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#0c1322] border border-[#243656] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Trend Simulation */}
        <div className="bg-[#111b2f] border border-[#243656] rounded-2xl p-6 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#243656]">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Hourly Incident Frequency (24-Hour Cycle)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-[#0c1322] px-2 py-0.5 rounded border border-[#243656]">
              Peak: 16:00 (Evening Surge)
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 h-44 pt-4 pb-2 px-2 bg-[#0a1120]/60 rounded-xl border border-[#1e3151]/60">
            {hourlyData?.map((item: any) => {
              const barHeight = Math.max(item.incidents * 12, 12);
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-sky-400 font-mono font-bold group-hover:text-white transition-colors">
                    {item.incidents}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-indigo-900 via-sky-600 to-sky-400 group-hover:from-indigo-800 group-hover:to-sky-300 transition-all shadow-sm shadow-sky-500/10"
                    style={{ height: `${barHeight}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{item.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Crowd Zone Capacity Loads & Response Team Workloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Zones Loads */}
        <div className="bg-[#111b2f] border border-[#243656] rounded-2xl p-6 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#243656]">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Zone Capacity Load Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-[#0c1322] px-2 py-0.5 rounded border border-[#243656]">
              Optical Density Ingest
            </span>
          </div>

          <div className="space-y-3.5">
            {zoneLoads?.map((z: any) => {
              const isCritical = z.density >= 85;
              const isWarning = z.density >= 70 && z.density < 85;

              return (
                <div key={z.name} className="space-y-1.5 bg-[#0c1322]/50 p-3 rounded-xl border border-[#243656]/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{z.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {z.density}% ({z.current.toLocaleString()} / {z.capacity.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0c1322] border border-[#243656] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? "bg-rose-500"
                          : isWarning
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${z.density}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload Table */}
        <div className="bg-[#111b2f] border border-[#243656] rounded-2xl p-6 shadow-xl text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#243656]">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Tactical Unit Readiness & Assignments</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-[#0c1322] px-2 py-0.5 rounded border border-[#243656]">
              Units Synchronized
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-[#243656] text-slate-400 font-mono text-[10px] uppercase">
                  <th className="pb-2.5 text-left font-semibold">Unit Name</th>
                  <th className="pb-2.5 text-left font-semibold">Specialization</th>
                  <th className="pb-2.5 text-left font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Active Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243656]/50">
                {teamWorkloads?.map((t: any) => (
                  <tr key={t.name} className="hover:bg-[#16233b]/40 transition-colors">
                    <td className="py-3 font-bold text-white">{t.name}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{t.type}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          t.status === "AVAILABLE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : t.status === "ON_SCENE"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-200">
                      {t.assignedIncidentsCount} {t.assignedIncidentsCount === 1 ? "case" : "cases"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Security Heatmap Points Matrix */}
      <div className="bg-[#111b2f] border border-[#243656] rounded-2xl p-6 shadow-xl text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#243656]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Tactical Density Heatmap Coordinates (Decision-Support Matrix)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
            Operational event density only &bull; Neutral infrastructure classification
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {heatmapPoints?.slice(0, 12).map((pt: any, idx: number) => {
            const isHigh = pt.weight >= 0.8;
            const isMed = pt.weight >= 0.5 && pt.weight < 0.8;

            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0c1322] border border-[#243656] text-xs space-y-1.5 hover:border-sky-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">NODE #{idx + 1}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isHigh
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : isMed
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                    }`}
                  >
                    {(pt.weight * 100).toFixed(0)}% WT
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300">
                  {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}