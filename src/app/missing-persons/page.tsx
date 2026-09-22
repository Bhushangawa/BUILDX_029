"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Plus,
  Lock,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertOctagon,
  Camera,
  ChevronRight,
  UserCheck,
  X,
  Share2,
} from "lucide-react";
import { PRESET_LOCATIONS } from "@/lib/geo-utils";

export default function MissingPersonsPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isAuthorizedViewer, setIsAuthorizedViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | CHILD | ELDERLY
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"CHILD" | "ELDERLY">("CHILD");
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [sightingModalCase, setSightingModalCase] = useState<any | null>(null);

  // New report form state
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [lastSeenLocation, setLastSeenLocation] = useState(PRESET_LOCATIONS[0].name);
  const [clothingDescription, setClothingDescription] = useState("");
  const [identifyingFeatures, setIdentifyingFeatures] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sighting form state
  const [sightingLocation, setSightingLocation] = useState(PRESET_LOCATIONS[0].name);
  const [sightingDesc, setSightingDesc] = useState("");
  const [sightingReporter, setSightingReporter] = useState("");

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/missing-persons");
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
        setIsAuthorizedViewer(data.isAuthorizedViewer);
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

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loc = PRESET_LOCATIONS.find((l) => l.name === lastSeenLocation) || PRESET_LOCATIONS[0];
      const res = await fetch("/api/missing-persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          fullName,
          age: Number(age) || (reportType === "CHILD" ? 6 : 72),
          gender,
          lastSeenLocation,
          latitude: loc.lat,
          longitude: loc.lng,
          clothingDescription,
          identifyingFeatures,
          medicalConditions,
          contactPersonName,
          contactPhone,
          contactRelation: reportType === "CHILD" ? "Parent" : "Son/Daughter",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsReportModalOpen(false);
        setFullName("");
        setAge("");
        setClothingDescription("");
        await fetchCases();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sightingModalCase) return;
    setIsSubmitting(true);
    try {
      const loc = PRESET_LOCATIONS.find((l) => l.name === sightingLocation) || PRESET_LOCATIONS[0];
      const res = await fetch(`/api/missing-persons/${sightingModalCase.id}/sightings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: sightingReporter || "Vetted Volunteer",
          locationName: sightingLocation,
          latitude: loc.lat,
          longitude: loc.lng,
          description: sightingDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSightingModalCase(null);
        setSightingDesc("");
        await fetchCases();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySighting = async (caseId: string, sightingId: string, status: string) => {
    try {
      const res = await fetch(`/api/missing-persons/${caseId}/sightings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sightingId,
          verificationStatus: status,
          verifiedBy: "Inspector Rajesh Rathore",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCases();
      }
    } catch (e: any) {
      alert("Verification error: " + e.message);
    }
  };

  const handleMarkFoundSafe = async (caseId: string) => {
    try {
      const res = await fetch(`/api/missing-persons/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "FOUND_SAFE",
          actorName: "Help Desk Central Lead",
          actorRole: "ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCases();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (activeTab === "ALL") return true;
    return c.type === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-orange-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Missing Person Assistance & Search Grid
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-governed coordination for separated children and vulnerable elderly. Eliminates false sightings & paper delays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReportType("CHILD");
              setIsReportModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report Missing Child</span>
          </button>
          <button
            onClick={() => {
              setReportType("ELDERLY");
              setIsReportModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report Elderly Person</span>
          </button>
        </div>
      </div>

      {/* Tabs & Privacy Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "ALL", label: "All Active Cases" },
            { id: "CHILD", label: "Separated Children (Protected)" },
            { id: "ELDERLY", label: "Missing Elderly" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-orange-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {isAuthorizedViewer
              ? "Authorized Officer Access Active &bull; Sensitive Dossiers Unlocked"
              : "Citizen Privacy Filter Active &bull; Sensitive Child Marks Masked"}
          </span>
        </div>
      </div>

      {/* Main Grid: Cases List (Left) & Case Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Case Cards */}
        <div className="lg:col-span-6 space-y-4">
          {filteredCases.map((c) => {
            const isChild = c.type === "CHILD";
            const isFound = c.status === "FOUND_SAFE";
            const isSelected = selectedCase?.id === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-slate-800/90 border-orange-500 ring-1 ring-orange-500 shadow-xl"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.photoUrl}
                      alt={c.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-orange-400">
                          {c.caseNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c.type} &bull; {c.age} yrs
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-100 mt-0.5">
                        {c.fullName}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Last Seen: {c.lastSeenLocation}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      isFound
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    }`}
                  >
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Clothing details */}
                <div className="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-slate-300">
                  <span className="text-slate-500 font-semibold block mb-0.5">Clothing:</span>
                  {c.clothingDescription}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Search Radius: <strong className="text-orange-400">{c.searchRadiusMeters}m</strong></span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSightingModalCase(c);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs"
                  >
                    + Submit Sighting
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Dossier & Sightings Verification */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 sticky top-24">
          {selectedCase ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                      {selectedCase.type} CASE
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1.5">
                    {selectedCase.fullName} ({selectedCase.age} years old)
                  </h2>
                </div>

                {selectedCase.status !== "FOUND_SAFE" && (
                  <button
                    onClick={() => handleMarkFoundSafe(selectedCase.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Safe & Reunited</span>
                  </button>
                )}
              </div>

              {/* Photos & Identifying Characteristics */}
              <div className="grid grid-cols-3 gap-3">
                <img
                  src={selectedCase.photoUrl}
                  alt={selectedCase.fullName}
                  className="w-full h-32 rounded-xl object-cover border border-slate-700 shadow-md"
                />
                <div className="col-span-2 space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Search Grid Radius:</span>
                    <span className="font-bold text-orange-400 text-sm">
                      {selectedCase.searchRadiusMeters} meters
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Calculated from last seen point ({selectedCase.lastSeenLocation})
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Emergency Contact:</span>
                    <span className="font-semibold text-slate-200">
                      {selectedCase.contactPersonName} &bull; {selectedCase.contactPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Protected Identifying Notes */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-500 font-semibold block">Identifying Marks / Medical Notes:</span>
                <p className="text-slate-300">
                  {selectedCase.identifyingFeatures || "No identifying marks reported."}
                </p>
                {selectedCase.medicalConditions && (
                  <p className="text-amber-400 font-medium">
                    Medical Condition: {selectedCase.medicalConditions}
                  </p>
                )}
              </div>

              {/* Vetted Sightings Section */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Vetted Field Sightings ({selectedCase.sightings?.length || 0})
                  </h4>
                  <button
                    onClick={() => setSightingModalCase(selectedCase)}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                  >
                    + Submit New Sighting
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCase.sightings?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No sightings logged yet for this search grid.</p>
                  ) : (
                    selectedCase.sightings?.map((s: any) => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          s.verificationStatus === "VERIFIED"
                            ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                            : s.verificationStatus === "FALSE_ALARM"
                            ? "bg-slate-950/60 border-slate-800 text-slate-500 line-through"
                            : "bg-amber-950/30 border-amber-800/60 text-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>Near {s.locationName}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-900 border">
                            {s.verificationStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{s.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>By: {s.reporterName}</span>
                          {s.verificationStatus === "PENDING" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerifySighting(selectedCase.id, s.id, "VERIFIED")}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                              >
                                Verify Sighting
                              </button>
                              <button
                                onClick={() => handleVerifySighting(selectedCase.id, s.id, "FALSE_ALARM")}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              >
                                False Alarm
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a missing person case to inspect dossier and search perimeter
            </div>
          )}
        </div>
      </div>

      {/* SIGHTING SUBMISSION MODAL */}
      {sightingModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                Submit Sighting for {sightingModalCase.fullName}
              </h3>
              <button onClick={() => setSightingModalCase(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSighting} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Location of Sighting:</label>
                <select
                  value={sightingLocation}
                  onChange={(e) => setSightingLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                >
                  {PRESET_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">What did you observe? *</label>
                <textarea
                  value={sightingDesc}
                  onChange={(e) => setSightingDesc(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe clothing, companions, direction of movement, child condition..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name / Badge:</label>
                <input
                  type="text"
                  placeholder="Volunteer Vikram / Citizen"
                  value={sightingReporter}
                  onChange={(e) => setSightingReporter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25"
              >
                Submit Sighting for Admin Verification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MISSING MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Report Missing {reportType === "CHILD" ? "Child" : "Elderly Person"}
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="E.g. Aarav Patel"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={reportType === "CHILD" ? "6" : "74"}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Last Seen Location *</label>
                <select
                  value={lastSeenLocation}
                  onChange={(e) => setLastSeenLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                >
                  {PRESET_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Clothing Description *</label>
                <textarea
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="Red cartoon t-shirt, blue denim shorts, white shoes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Identifying Features / Medical Notes</label>
                <input
                  type="text"
                  value={identifyingFeatures}
                  onChange={(e) => setIdentifyingFeatures(e.target.value)}
                  placeholder="Birthmark, glasses, responsive to nickname 'Aaru'..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Guardian</label>
                  <input
                    type="text"
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Sunita Patel (Mother)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98201 55443"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25 mt-2"
              >
                Create Missing Case & Calculate Search Radius
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}