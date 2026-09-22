"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Plus,
  Filter,
  Cpu,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Search,
  UserX,
  Layers,
  ChevronRight,
  RefreshCw,
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || inc.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "ALL" || inc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-[#0c1322] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111b2f] p-4 rounded-xl border border-[#243656] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              Operational Incident Records & Triage
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log, track, and correlate public safety events across festival grounds with automated AI deduplication.
          </p>
        </div>

        <button
          onClick={() => setIsReportOpen(true)}
          className="px-3.5 py-1.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by keywords, ID, landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#111b2f] border border-[#243656] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 bg-[#111b2f] border border-[#243656] rounded-md text-xs text-slate-100 focus:outline-none focus:border-[#0ea5e9]"
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
          className="px-3 py-1.5 bg-[#111b2f] border border-[#243656] rounded-md text-xs text-slate-100 focus:outline-none focus:border-[#0ea5e9]"
        >
          <option value="ALL">All Statuses</option>
          <option value="REPORTED">Reported (In Queue)</option>
          <option value="VERIFIED">Verified</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress / On Scene</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Main Grid: Incident List (Left) & Active Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Incident List */}
        <div className="lg:col-span-6 space-y-2.5">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center bg-[#111b2f] rounded-xl border border-[#243656] text-slate-500 text-xs">
              No incidents found matching specified criteria.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = activeDossier?.id === inc.id;
              const isCritical = inc.priority === "CRITICAL";

              return (
                <div
                  key={inc.id}
                  onClick={() => setActiveDossier(inc)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1b2b48] border-[#0ea5e9] ring-1 ring-[#0ea5e9]"
                      : "bg-[#111b2f] border-[#243656] hover:border-[#38bdf8]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#38bdf8]">
                        {inc.incidentNumber}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#16233b] text-slate-300 border border-[#243656]">
                        {inc.category.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          isCritical
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : inc.priority === "HIGH"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : "bg-[#0c1322] text-slate-300 border border-[#243656]"
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-100 mb-1">{inc.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#243656]/60 gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{inc.locationName}</span>
                    </span>

                    {inc.assignedTeam ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>{inc.assignedTeam.name}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[10px]">Pending Assignment</span>
                    )}
                  </div>

                  {inc.reports?.length > 0 && (
                    <div className="mt-2 px-2 py-1 rounded bg-[#16233b] border border-[#243656] text-[10px] text-slate-300 flex items-center justify-between">
                      <span>{inc.reports.length} duplicate witness reports clustered</span>
                      <span className="font-semibold text-[#38bdf8]">Merged</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Incident Dossier */}
        <div className="lg:col-span-6 bg-[#111b2f] border border-[#243656] rounded-xl p-5 shadow-xl space-y-4 sticky top-20">
          {activeDossier ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#243656]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">
                      {activeDossier.incidentNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#16233b] text-slate-300 border border-[#243656] uppercase">
                      {activeDossier.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeDossier.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {activeDossier.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Incident Narrative & Witness Log
                </span>
                <p className="text-xs text-slate-200 bg-[#0c1322] p-3 rounded-md border border-[#243656] leading-relaxed">
                  {activeDossier.description}
                </p>
              </div>

              {/* AI Assistant Card */}
              <div className="p-3.5 rounded-lg bg-[#16233b] border border-[#243656] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-[#243656]">
                  <div className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI Incident Triage Analysis</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Advisory</span>
                </div>
                <p className="text-slate-300 text-[11px] italic bg-[#0c1322] p-2 rounded border border-[#243656]">
                  &ldquo;{activeDossier.aiSummary || "Telemetry analyzed."}&rdquo;
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Category Assessed:</span>
                    <span className="font-semibold text-slate-200">{activeDossier.aiCategorySuggestion || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Priority Urgency:</span>
                    <span className="font-semibold text-slate-200">{activeDossier.aiPrioritySuggestion || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#0c1322] rounded-md border border-[#243656]">
                  <span className="text-slate-500 block text-[10px]">Reporter Identity:</span>
                  <span className="font-semibold text-slate-200">
                    {activeDossier.isAnonymous ? "Anonymous Witness" : activeDossier.reporterName || "Citizen"}
                  </span>
                  {activeDossier.reporterPhone && !activeDossier.isAnonymous && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">{activeDossier.reporterPhone}</span>
                  )}
                </div>

                <div className="p-2.5 bg-[#0c1322] rounded-md border border-[#243656]">
                  <span className="text-slate-500 block text-[10px]">Assigned Tactical Unit:</span>
                  <span className="font-semibold text-emerald-400">
                    {activeDossier.assignedTeam?.name || "Unassigned"}
                  </span>
                  {activeDossier.assignedTeam && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">{activeDossier.assignedTeam.contactRadio}</span>
                  )}
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Incident Lifecycle Status
                </span>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 overflow-x-auto pb-1">
                  {["REPORTED", "VERIFIED", "ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].map((st, idx) => {
                    const isCurrent = activeDossier.status === st;
                    return (
                      <span
                        key={st}
                        className={`px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? "bg-[#0ea5e9] text-white font-bold"
                            : "bg-[#0c1322] text-slate-500 border border-[#243656]"
                        }`}
                      >
                        {st}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Chronological Event Log
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeDossier.timelineEvents?.map((evt: any) => (
                    <div key={evt.id} className="relative pl-3 border-l-2 border-[#243656] text-[11px]">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#0ea5e9]"></div>
                      <div className="text-slate-300 font-medium">{evt.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {evt.actorName} ({evt.actorRole}) &bull;{" "}
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-slate-500 text-xs">
              Select an incident record to inspect dossier
            </div>
          )}
        </div>
      </div>

      <QuickReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={fetchIncidents}
      />
    </div>
  );
}