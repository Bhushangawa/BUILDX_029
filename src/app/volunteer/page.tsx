"use client";

import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  Eye,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Plus,
  X,
  Camera,
  Search,
} from "lucide-react";
import { PRESET_LOCATIONS } from "@/lib/geo-utils";

export default function VolunteerPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
  const [locationName, setLocationName] = useState(PRESET_LOCATIONS[0].name);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Authorized Volunteer Coordination Portal
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong className="text-slate-200">Vikram Jadhav (VOL-204)</strong> &bull; Youth Civic Volunteer Unit
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Vetted Civic Volunteer Badge Verified</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Active Missions (Left 6 Cols) */}
        <div className="md:col-span-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Ground Search Tasks ({cases.filter((c) => c.status !== "FOUND_SAFE").length})
          </h2>

          {cases
            .filter((c) => c.status !== "FOUND_SAFE")
            .map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-800/90 border-sky-500 ring-1 ring-sky-500 shadow-xl"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={c.photoUrl}
                      alt={c.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400">
                          {c.caseNumber}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {c.type} &bull; {c.age} yrs
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{c.fullName}</h3>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1 mb-3">
                    <div>
                      <span className="text-slate-500">Clothing: </span>
                      <span>{c.clothingDescription}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Search Radius: </span>
                      <strong className="text-orange-400">{c.searchRadiusMeters} meters</strong>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCase(c);
                      setIsSightingModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20"
                  >
                    + Submit Vetted Sighting
                  </button>
                </div>
              );
            })}
        </div>

        {/* Selected Task Details (Right 6 Cols) */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 sticky top-24">
          {selectedCase ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {selectedCase.caseNumber}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {selectedCase.fullName} ({selectedCase.age}yo)
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                  {selectedCase.status}
                </span>
              </div>

              <img
                src={selectedCase.photoUrl}
                alt={selectedCase.fullName}
                className="w-full h-44 rounded-xl object-cover border border-slate-700"
              />

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block">Last Seen Location:</span>
                  <span className="font-semibold text-slate-200">{selectedCase.lastSeenLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Clothing & Markings:</span>
                  <span className="text-slate-300">{selectedCase.clothingDescription}</span>
                </div>
                {selectedCase.identifyingFeatures && (
                  <div>
                    <span className="text-slate-500 block">Identifying Details:</span>
                    <span className="text-slate-300">{selectedCase.identifyingFeatures}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsSightingModalOpen(true)}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25"
              >
                Log Person Sighting For Police Confirmation
              </button>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a task to review safe description
            </div>
          )}
        </div>
      </div>

      {/* Sighting Modal */}
      {isSightingModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                Log Sighting for {selectedCase.fullName}
              </h3>
              <button onClick={() => setIsSightingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSighting} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Observed Landmark / Area:
                </label>
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Sighting Details (Condition, companions, direction):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="E.g. Child sitting calmly near Information Booth 2 with booth lead..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25"
              >
                Submit Verified Sighting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}