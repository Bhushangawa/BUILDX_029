"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Plus,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Search,
  UserX,
  Layers,
  ChevronRight,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Incident Management & AI Triage
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time reporting, natural-language entity extraction, duplicate deduplication, and SLA tracking.
          </p>
        </div>

        <button
          onClick={() => setIsReportOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
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
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Categories</option>
          <option value="THEFT">Theft</option>
          <option value="CHAIN_SNATCHING">Chain Snatching</option>
          <option value="CROWD_ISSUE">Crowd Management</option>
          <option value="PERSONAL_SAFETY">Personal Safety</option>
          <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
          <option value="EMERGENCY">Emergency / Medical</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="REPORTED">Reported (In Triage)</option>
          <option value="VERIFIED">Verified</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress / On Scene</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Main Grid: Incident List (Left) & Active Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Incident List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No incidents found matching criteria.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = activeDossier?.id === inc.id;
              const isCritical = inc.priority === "CRITICAL";

              return (
                <div
                  key={inc.id}
                  onClick={() => setActiveDossier(inc)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-800/90 border-sky-500 ring-1 ring-sky-500 shadow-xl"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {inc.incidentNumber}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {inc.category.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : inc.priority === "HIGH"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1">{inc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inc.locationName}</span>
                    </span>

                    {inc.assignedTeam ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>{inc.assignedTeam.name}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[11px] font-medium">Pending Assignment</span>
                    )}
                  </div>

                  {inc.reports?.length > 0 && (
                    <div className="mt-2.5 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center justify-between">
                      <span>{inc.reports.length} duplicate witness reports consolidated</span>
                      <span className="font-semibold text-indigo-200">Merged</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Incident Dossier */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 sticky top-24">
          {activeDossier ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {activeDossier.incidentNumber}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                      {activeDossier.category}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeDossier.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-2">
                    {activeDossier.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Incident Narrative
                </span>
                <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {activeDossier.description}
                </p>
              </div>

              {/* AI Intelligence Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Incident Intelligence Breakdown</span>
                </div>
                <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  &ldquo;{activeDossier.aiSummary || "Telemetry analyzed."}&rdquo;
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-500 block">AI Category Suggestion:</span>
                    <span className="font-semibold text-slate-200">{activeDossier.aiCategorySuggestion || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AI Priority Assessment:</span>
                    <span className="font-semibold text-slate-200">{activeDossier.aiPrioritySuggestion || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Witness & Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Reporter Identity:</span>
                  <span className="font-semibold text-slate-200">
                    {activeDossier.isAnonymous ? "Anonymous Witness (Identity Protected)" : activeDossier.reporterName || "Citizen"}
                  </span>
                  {activeDossier.reporterPhone && !activeDossier.isAnonymous && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">{activeDossier.reporterPhone}</span>
                  )}
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Assigned Unit:</span>
                  <span className="font-semibold text-emerald-400">
                    {activeDossier.assignedTeam?.name || "Unassigned"}
                  </span>
                  {activeDossier.assignedTeam && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">{activeDossier.assignedTeam.contactRadio}</span>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Case Lifecycle Timeline
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeDossier.timelineEvents?.map((evt: any) => (
                    <div key={evt.id} className="relative pl-3.5 border-l-2 border-slate-800 text-xs">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-sky-400"></div>
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
            <div className="p-12 text-center text-slate-500 text-xs">
              Select an incident to view full dossier
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