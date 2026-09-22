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

  // Form state
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

  // Sighting state
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
          actorName: "Central Help Desk Lead",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-[#0c1322] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111b2f] p-4 rounded-xl border border-[#243656] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#ea580c]" />
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              Missing Person Case Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Privacy-governed coordination for separated children and vulnerable elderly individuals with search grid mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReportType("CHILD");
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Report Missing Child</span>
          </button>
          <button
            onClick={() => {
              setReportType("ELDERLY");
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-200 border border-[#243656] font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Report Missing Elderly</span>
          </button>
        </div>
      </div>

      {/* Tabs & Privacy Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#111b2f] p-1 rounded-md border border-[#243656] text-xs">
          {[
            { id: "ALL", label: "All Active Cases" },
            { id: "CHILD", label: "Separated Children (Privacy Masked)" },
            { id: "ELDERLY", label: "Missing Elderly" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-[#ea580c] text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#111b2f] px-3 py-1.5 rounded-md border border-[#243656]">
          <Lock className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>
            {isAuthorizedViewer
              ? "Authorized Police/Staff Role &bull; Unlocked Coordinates"
              : "Citizen Privacy Filter Active &bull; Child Contact Data Masked"}
          </span>
        </div>
      </div>

      {/* Main Grid: Cases List (Left) & Case Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cases List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredCases.map((c) => {
            const isFound = c.status === "FOUND_SAFE";
            const isSelected = selectedCase?.id === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#1b2b48] border-[#ea580c] ring-1 ring-[#ea580c]"
                    : "bg-[#111b2f] border-[#243656] hover:border-[#ea580c]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.photoUrl}
                      alt={c.fullName}
                      className="w-12 h-12 rounded-md object-cover border border-[#243656] flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#ea580c]">
                          {c.caseNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#16233b] text-slate-300 border border-[#243656]">
                          {c.type} &bull; {c.age} yrs
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-100 mt-0.5">
                        {c.fullName}
                      </h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Last Seen: {c.lastSeenLocation}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isFound
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#ea580c]/20 text-[#ea580c] border border-[#ea580c]/30"
                    }`}
                  >
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs bg-[#0c1322] p-2.5 rounded-md border border-[#243656] mb-2.5 text-slate-300 leading-relaxed">
                  <span className="text-slate-500 font-semibold block text-[10px] mb-0.5">Clothing Description:</span>
                  {c.clothingDescription}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#243656]/60 gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Search Radius: <strong className="text-[#ea580c]">{c.searchRadiusMeters}m</strong></span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSightingModalCase(c);
                    }}
                    className="px-2.5 py-1 rounded bg-[#16233b] hover:bg-[#1e2d48] text-slate-200 border border-[#243656] font-semibold text-xs"
                  >
                    + Submit Sighting
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Dossier & Sightings Verification */}
        <div className="lg:col-span-6 bg-[#111b2f] border border-[#243656] rounded-xl p-5 shadow-xl space-y-4 sticky top-20">
          {selectedCase ? (
            <>
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#243656]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#ea580c]">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ea580c]/20 text-[#ea580c] border border-[#ea580c]/30 uppercase">
                      {selectedCase.type} CASE
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedCase.fullName} ({selectedCase.age} years old)
                  </h2>
                </div>

                {selectedCase.status !== "FOUND_SAFE" && (
                  <button
                    onClick={() => handleMarkFoundSafe(selectedCase.id)}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Reunited & Safe</span>
                  </button>
                )}
              </div>

              {/* Photo & Search Perimeter Specs */}
              <div className="grid grid-cols-3 gap-3">
                <img
                  src={selectedCase.photoUrl}
                  alt={selectedCase.fullName}
                  className="w-full h-28 rounded-md object-cover border border-[#243656]"
                />
                <div className="col-span-2 space-y-2 text-xs">
                  <div className="p-2.5 bg-[#0c1322] rounded-md border border-[#243656]">
                    <span className="text-slate-500 block text-[10px]">Calculated Search Perimeter:</span>
                    <span className="font-mono font-bold text-[#ea580c] text-sm">
                      {selectedCase.searchRadiusMeters} meters
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Centered on {selectedCase.lastSeenLocation}
                    </span>
                  </div>

                  <div className="p-2 bg-[#0c1322] rounded-md border border-[#243656]">
                    <span className="text-slate-500 block text-[10px]">Family / Guardian Contact:</span>
                    <span className="font-semibold text-slate-200">
                      {selectedCase.contactPersonName} &bull; {selectedCase.contactPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Identifying Details */}
              <div className="p-2.5 bg-[#0c1322] rounded-md border border-[#243656] text-xs space-y-1">
                <span className="text-slate-500 font-semibold block text-[10px]">Identifying Features:</span>
                <p className="text-slate-300">
                  {selectedCase.identifyingFeatures || "No distinguishing marks recorded."}
                </p>
                {selectedCase.medicalConditions && (
                  <p className="text-amber-400 text-[11px] font-medium">
                    Medical Condition: {selectedCase.medicalConditions}
                  </p>
                )}
              </div>

              {/* Vetted Sightings */}
              <div className="space-y-2.5 pt-2 border-t border-[#243656]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    Vetted Field Sightings ({selectedCase.sightings?.length || 0})
                  </h4>
                  <button
                    onClick={() => setSightingModalCase(selectedCase)}
                    className="text-xs text-[#ea580c] hover:underline font-semibold"
                  >
                    + Submit Sighting
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedCase.sightings?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No sightings logged for this perimeter grid yet.</p>
                  ) : (
                    selectedCase.sightings?.map((s: any) => (
                      <div
                        key={s.id}
                        className={`p-2.5 rounded-md border text-xs space-y-1 ${
                          s.verificationStatus === "VERIFIED"
                            ? "bg-emerald-950/20 border-emerald-800/60 text-emerald-200"
                            : s.verificationStatus === "FALSE_ALARM"
                            ? "bg-[#0c1322] border-[#243656] text-slate-500 line-through"
                            : "bg-[#16233b] border-[#243656] text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>Near {s.locationName}</span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#0c1322] border border-[#243656]">
                            {s.verificationStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{s.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Reporter: {s.reporterName}</span>
                          {s.verificationStatus === "PENDING" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleVerifySighting(selectedCase.id, s.id, "VERIFIED")}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleVerifySighting(selectedCase.id, s.id, "FALSE_ALARM")}
                                className="px-2 py-0.5 rounded bg-[#16233b] hover:bg-[#1e2d48] text-slate-300 border border-[#243656]"
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
            <div className="p-10 text-center text-slate-500 text-xs">
              Select a missing person case to inspect dossier and search perimeter
            </div>
          )}
        </div>
      </div>

      {/* SIGHTING SUBMISSION MODAL */}
      {sightingModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-sm">
          <div className="bg-[#111b2f] border border-[#243656] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#243656]">
              <h3 className="font-bold text-white text-sm">
                Submit Sighting for {sightingModalCase.fullName}
              </h3>
              <button onClick={() => setSightingModalCase(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSighting} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Observed Location:</label>
                <select
                  value={sightingLocation}
                  onChange={(e) => setSightingLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                >
                  {PRESET_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Sighting Description *</label>
                <textarea
                  value={sightingDesc}
                  onChange={(e) => setSightingDesc(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe clothing, companions, direction of movement, child condition..."
                  className="w-full px-3 py-2 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name / Volunteer ID:</label>
                <input
                  type="text"
                  placeholder="Volunteer Vikram / Citizen"
                  value={sightingReporter}
                  onChange={(e) => setSightingReporter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-sm"
              >
                Submit Sighting for Staff Verification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MISSING CASE MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-sm">
          <div className="bg-[#111b2f] border border-[#243656] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#243656]">
              <h3 className="font-bold text-white text-sm">
                Register Missing {reportType === "CHILD" ? "Child" : "Elderly Person"} Dossier
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
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
                    className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
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
                    className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Last Seen Landmark *</label>
                <select
                  value={lastSeenLocation}
                  onChange={(e) => setLastSeenLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                >
                  {PRESET_LOCATIONS.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Clothing Details *</label>
                <textarea
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="Red cartoon t-shirt, blue denim shorts, white shoes..."
                  className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Distinguishing Marks / Medical Notes</label>
                <input
                  type="text"
                  value={identifyingFeatures}
                  onChange={(e) => setIdentifyingFeatures(e.target.value)}
                  placeholder="Birthmark on cheek, glasses, responsive to nickname 'Aaru'..."
                  className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Sunita Patel (Mother)"
                    className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98201 55443"
                    className="w-full px-3 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-sm mt-1"
              >
                Log Case & Initialize Search Perimeter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}