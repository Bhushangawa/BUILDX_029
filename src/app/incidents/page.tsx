"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle, Plus, Cpu, MapPin, Clock,
  Shield, CheckCircle, Search, ChevronRight, RefreshCw,
} from "lucide-react";
import QuickReportModal from "@/components/incident/QuickReportModal";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState<any | null>(null);

  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      const data = await res.json();
      if (data.incidents) {
        setIncidents(data.incidents);
        if (data.incidents.length > 0 && !activeDossier) {
          setActiveDossier(data.incidents[0]);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || inc.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || inc.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const priorityBadge = (p: string) =>
    p === "CRITICAL" ? "badge badge-critical" : p === "HIGH" ? "badge badge-high" : "badge badge-medium";

  const statusBadge = (s: string) =>
    s === "RESOLVED" ? "badge badge-resolved" : s === "IN_PROGRESS" ? "badge badge-active" : "badge badge-pending";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 min-h-screen">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111d30] border border-[#1e3151] rounded-xl px-5 py-3.5">
        <div>
          <h1 className="text-[15px] font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Operational Incident Records &amp; Triage
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Log, track, and correlate public safety events with AI deduplication and lifecycle management.
          </p>
        </div>
        <button
          onClick={() => setIsReportOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-[12px] shadow-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            placeholder="Search by ID, title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="soc-input pl-9"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="soc-input sm:w-48"
        >
          <option value="ALL">All Categories</option>
          <option value="THEFT">Theft</option>
          <option value="CHAIN_SNATCHING">Chain Snatching</option>
          <option value="CROWD_ISSUE">Crowd Issue</option>
          <option value="PERSONAL_SAFETY">Personal Safety</option>
          <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
          <option value="EMERGENCY">Emergency / Medical</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="soc-input sm:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="REPORTED">Reported</option>
          <option value="VERIFIED">Verified</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Incident List */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="section-label">{filteredIncidents.length} Records</span>
            <button onClick={fetchIncidents} className="flex items-center gap-1 text-[11px] text-[#64748b] hover:text-white transition-colors">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl skeleton" />
            ))
          ) : filteredIncidents.length === 0 ? (
            <div className="py-16 text-center bg-[#111d30] border border-[#1e3151] rounded-xl">
              <Search className="w-8 h-8 text-[#1e3151] mx-auto mb-2" />
              <p className="text-[13px] font-medium text-[#475569]">No incidents match your filters</p>
              <p className="text-[12px] text-[#334155] mt-1">Try adjusting the search or category filter</p>
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = activeDossier?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setActiveDossier(inc)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-sky-500/8 border-sky-500/60 ring-1 ring-sky-500/20"
                      : "bg-[#111d30] border-[#1e3151] hover:border-[#2a4166] hover:bg-[#172338]/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-sky-400">{inc.incidentNumber}</span>
                      <span className="badge badge-medium">{inc.category.replace(/_/g, " ")}</span>
                      <span className={priorityBadge(inc.priority)}>{inc.priority}</span>
                    </div>
                    <span className={statusBadge(inc.status)}>{inc.status}</span>
                  </div>

                  <h3 className="text-[13px] font-semibold text-white mb-1">{inc.title}</h3>
                  <p className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">{inc.description}</p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e3151]/60 text-[11px]">
                    <span className="flex items-center gap-1 text-[#64748b]">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[160px]">{inc.locationName}</span>
                    </span>
                    {inc.assignedTeam ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Shield className="w-3 h-3" /> {inc.assignedTeam.name}
                      </span>
                    ) : (
                      <span className="text-amber-400">Unassigned</span>
                    )}
                  </div>

                  {inc.reports?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] bg-[#172338] border border-[#1e3151] text-[#94a3b8] px-2 py-1 rounded-md">
                      <Cpu className="w-3 h-3 text-indigo-400" />
                      {inc.reports.length} duplicate witness reports clustered by AI
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Incident Dossier */}
        <div className="lg:col-span-6 bg-[#111d30] border border-[#1e3151] rounded-xl p-5 shadow-xl space-y-4 sticky top-20">
          {activeDossier ? (
            <>
              {/* Header */}
              <div className="pb-3 border-b border-[#1e3151]">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="font-mono text-[11px] font-bold text-sky-400">{activeDossier.incidentNumber}</span>
                  <span className="badge badge-medium">{activeDossier.category}</span>
                  <span className={priorityBadge(activeDossier.priority)}>{activeDossier.priority}</span>
                  <span className={statusBadge(activeDossier.status)}>{activeDossier.status}</span>
                </div>
                <h2 className="text-[15px] font-semibold text-white">{activeDossier.title}</h2>
                <p className="text-[12px] text-[#64748b] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {activeDossier.locationName}
                </p>
              </div>

              {/* Narrative */}
              <div>
                <p className="section-label mb-1.5">Incident Narrative</p>
                <p className="text-[12px] text-[#94a3b8] bg-[#0a1120] p-3 rounded-lg border border-[#1e3151] leading-relaxed">
                  {activeDossier.description}
                </p>
              </div>

              {/* AI Triage */}
              <div className="p-4 rounded-xl bg-[#0a1120] border border-[#1e3151] space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e3151]">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[12px] font-semibold text-white">AI Triage Analysis</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    Operator review required
                  </span>
                </div>
                <p className="text-[12px] text-[#94a3b8] italic leading-relaxed">
                  &ldquo;{activeDossier.aiSummary || "Telemetry analyzed. Awaiting operator review."}&rdquo;
                </p>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-[#475569] block text-[10px] uppercase tracking-wider">Suggested Category</span>
                    <span className="font-semibold text-white">{activeDossier.aiCategorySuggestion || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] block text-[10px] uppercase tracking-wider">Suggested Priority</span>
                    <span className="font-semibold text-white">{activeDossier.aiPrioritySuggestion || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-3 bg-[#0a1120] rounded-lg border border-[#1e3151]">
                  <span className="section-label block mb-1">Reporter</span>
                  <span className="font-medium text-white">
                    {activeDossier.isAnonymous ? "Anonymous Witness" : activeDossier.reporterName || "Citizen"}
                  </span>
                  {activeDossier.reporterPhone && !activeDossier.isAnonymous && (
                    <span className="text-[11px] text-[#64748b] block mt-0.5">{activeDossier.reporterPhone}</span>
                  )}
                </div>
                <div className="p-3 bg-[#0a1120] rounded-lg border border-[#1e3151]">
                  <span className="section-label block mb-1">Assigned Unit</span>
                  <span className={`font-medium ${activeDossier.assignedTeam ? "text-emerald-400" : "text-amber-400"}`}>
                    {activeDossier.assignedTeam?.name || "Unassigned"}
                  </span>
                  {activeDossier.assignedTeam && (
                    <span className="text-[11px] text-[#64748b] block mt-0.5">{activeDossier.assignedTeam.contactRadio}</span>
                  )}
                </div>
              </div>

              {/* Status Trail */}
              <div>
                <p className="section-label mb-2">Lifecycle Status</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {["REPORTED","VERIFIED","ASSIGNED","ACKNOWLEDGED","IN_PROGRESS","RESOLVED"].map((st) => {
                    const isCurrent = activeDossier.status === st;
                    return (
                      <span
                        key={st}
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md ${
                          isCurrent
                            ? "bg-sky-500 text-white"
                            : "bg-[#0a1120] text-[#475569] border border-[#1e3151]"
                        }`}
                      >
                        {st}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              {activeDossier.timelineEvents?.length > 0 && (
                <div>
                  <p className="section-label mb-2">Event Log</p>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {activeDossier.timelineEvents.map((evt: any) => (
                      <div key={evt.id} className="relative pl-4">
                        <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-sky-500" />
                        <div className="absolute left-[3px] top-3 bottom-0 w-px bg-[#1e3151]" />
                        <p className="text-[12px] text-[#94a3b8]">{evt.description}</p>
                        <p className="text-[10px] font-mono text-[#475569] mt-0.5">
                          {evt.actorName} &bull; {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <ChevronRight className="w-8 h-8 text-[#1e3151] mx-auto mb-2" />
              <p className="text-[12px] text-[#475569]">Select an incident to view its full dossier</p>
            </div>
          )}
        </div>
      </div>

      <QuickReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} onSuccess={fetchIncidents} />
    </div>
  );
}