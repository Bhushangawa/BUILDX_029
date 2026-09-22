"use client";

import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  Eye,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  Plus,
  X,
  Camera,
  Search,
  AlertTriangle,
  Send,
  UserCheck,
  Radio,
  Sparkles,
} from "lucide-react";
import { PRESET_LOCATIONS } from "@/lib/geo-utils";

export default function VolunteerPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
  const [locationName, setLocationName] = useState(PRESET_LOCATIONS[0].name);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "CHILD" | "ELDERLY">("ALL");

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/missing-persons");
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
        if (data.cases.length > 0 && !selectedCase) {
          setSelectedCase(data.cases[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSubmitSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const loc = PRESET_LOCATIONS.find((l) => l.name === locationName) || PRESET_LOCATIONS[0];
      const res = await fetch(`/api/missing-persons/${selectedCase.id}/sightings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: "Volunteer Vikram Jadhav (VOL-204)",
          locationName,
          latitude: loc.lat,
          longitude: loc.lng,
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSightingModalOpen(false);
        setDescription("");
        await fetchCases();
      }
    } catch (e: any) {
      alert("Error submitting sighting: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCases = cases.filter((c) => c.status !== "FOUND_SAFE");
  const filteredCases = activeCases.filter((c) => {
    if (filterType === "ALL") return true;
    return c.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111d30] border border-[#1e3151] p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Civic Field Network Active
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                AUTH_LEVEL: FIELD_REPORTER_V2
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <HeartHandshake className="w-7 h-7 text-sky-400" />
              <span>Volunteer Coordination Portal</span>
            </h1>
            
            <p className="text-sm text-slate-300 max-w-2xl">
              Coordinated ground search missions, verified citizen sightings, and safe perimeter scouting synchronized with Sentinel Control Room.
            </p>
          </div>

          {/* Volunteer Credential Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#172338] border border-[#1e3151] p-3.5 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-sm">
              VJ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Vikram Jadhav</span>
                <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  VOL-204
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Youth Civic Volunteer Unit &bull; North Gate</p>
            </div>
            <div className="hidden sm:block pl-3 border-l border-[#243656]">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                Vetted Badge
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#1e3151]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="bg-[#0a1120] border border-[#1e3151] rounded-xl p-3">
            <span className="section-label block mb-0.5">Active Search Missions</span>
            <span className="text-xl font-bold text-white font-mono">{activeCases.length}</span>
          </div>
          <div className="bg-[#0a1120] border border-[#1e3151] rounded-xl p-3">
            <span className="section-label block mb-0.5">Priority Children</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {activeCases.filter((c) => c.type === "CHILD").length}
            </span>
          </div>
          <div className="bg-[#0a1120] border border-[#1e3151] rounded-xl p-3">
            <span className="section-label block mb-0.5">Elderly / Vulnerable</span>
            <span className="text-xl font-bold text-sky-400 font-mono">
              {activeCases.filter((c) => c.type === "ELDERLY").length}
            </span>
          </div>
          <div className="bg-[#0a1120] border border-[#1e3151] rounded-xl p-3">
            <span className="section-label block mb-0.5">Field Team Status</span>
            <span className="text-[13px] font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Synchronized Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Ground Search Tasks (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              <h2 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Authorized Ground Search Targets ({filteredCases.length})
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#0a1120] p-1 rounded-xl border border-[#1e3151]">
              {(["ALL", "CHILD", "ELDERLY"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === t
                      ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t === "ALL" ? "All Targets" : t === "CHILD" ? "Children" : "Elderly"}
                </button>
              ))}
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111b2f] border border-[#243656] text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-white">No pending search targets in this category</p>
              <p className="text-xs text-slate-500 mt-1">All missing persons registered under this filter have been reunited safely.</p>
            </div>
          ) : (
            filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer p-5 ${
                    isSelected
                      ? "bg-[#16233b] border-sky-500/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50"
                      : "bg-[#111b2f] border-[#243656] hover:bg-[#16233b]/70 hover:border-[#38bdf8]/40"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-16 h-16 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={c.photoUrl}
                        alt={c.fullName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#243656]"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow ${
                          c.type === "CHILD"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-sky-500 text-slate-950"
                        }`}
                      >
                        {c.type}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-400">
                            {c.caseNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-[#0c1322] px-1.5 py-0.5 rounded border border-[#243656]">
                            {c.age} yrs &bull; {c.gender}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            c.status === "SEARCHING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white truncate">{c.fullName}</h3>

                      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#0c1322]/70 p-2.5 rounded-xl border border-[#243656]/60">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 truncate">
                            <span className="text-slate-500">Last: </span>
                            {c.lastSeenLocation}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="text-slate-300 font-mono">
                            Radius: <strong className="text-amber-400">{c.searchRadiusMeters}m</strong>
                          </span>
                        </div>
                        <div className="sm:col-span-2 text-slate-300 text-[11px] line-clamp-1">
                          <span className="text-slate-500 font-medium">Clothing: </span>
                          {c.clothingDescription}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-[#243656]/40">
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Eye className="w-3 h-3 text-sky-400" />
                          {c.sightings?.length || 0} Reported Sightings
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(c);
                            setIsSightingModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-white border border-sky-500/30 font-semibold text-xs transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Submit Sighting</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Target Tactical Dossier (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-[#111b2f] border border-[#243656] rounded-2xl p-6 shadow-xl space-y-5 sticky top-24">
          {selectedCase ? (
            <>
              {/* Dossier Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#243656]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Ground Dossier
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1.5">
                    {selectedCase.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedCase.type} &bull; {selectedCase.age} Years &bull; Gender: {selectedCase.gender}
                  </p>
                </div>
                
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  {selectedCase.status}
                </span>
              </div>

              {/* Photo Frame */}
              <div className="relative rounded-xl overflow-hidden border border-[#243656] bg-[#0c1322] group">
                <img
                  src={selectedCase.photoUrl}
                  alt={selectedCase.fullName}
                  className="w-full h-52 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-[11px] bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10 flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-sky-400" />
                    Verified Photo
                  </span>
                  <span className="font-mono text-[11px] bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10 text-amber-300">
                    Radius: {selectedCase.searchRadiusMeters}m
                  </span>
                </div>
              </div>

              {/* Verified Details Sheet */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-[#243656] text-xs space-y-3">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block mb-0.5">
                    Last Known Location & Time
                  </span>
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    {selectedCase.lastSeenLocation}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#243656]/50">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block mb-0.5">
                    Clothing & Visual Description
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedCase.clothingDescription}
                  </p>
                </div>

                {selectedCase.identifyingFeatures && (
                  <div className="pt-2 border-t border-[#243656]/50">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block mb-0.5">
                      Identifying Marks / Features
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedCase.identifyingFeatures}
                    </p>
                  </div>
                )}

                {/* Privacy Badge */}
                <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] flex items-start gap-2">
                  <Shield className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="text-white">Privacy Guard:</strong> Personal family phone numbers and sensitive child records are securely withheld. All volunteer sightings route to Police Control.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsSightingModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log Person Sighting For Police Confirmation</span>
              </button>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              Select a target from the list to review search parameters
            </div>
          )}
        </div>
      </div>

      {/* Sighting Submission Dialog */}
      {isSightingModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111b2f] border border-[#243656] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#243656]">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                  Field Intelligence Intake
                </span>
                <h3 className="font-bold text-white text-base">
                  Log Sighting: {selectedCase.fullName}
                </h3>
              </div>
              <button
                onClick={() => setIsSightingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16233b] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSighting} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Observed Landmark / Area
                </label>
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0c1322] border border-[#243656] rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {PRESET_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Sighting Details (Condition, companions, clothing, heading)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="E.g. Observed near Booth 2 drinking water with security volunteer. Wearing the yellow kurti, looks calm and unhurt..."
                  className="w-full px-3.5 py-2.5 bg-[#0c1322] border border-[#243656] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0c1322] border border-[#243656] text-[11px] text-slate-400 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Submitted as <strong className="text-slate-200">Vikram Jadhav (VOL-204)</strong>. Timestamp and geo-coordinates will be attached automatically.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSightingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#16233b] hover:bg-[#1c2d4a] text-slate-300 font-semibold text-xs border border-[#243656] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Verified Sighting</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}