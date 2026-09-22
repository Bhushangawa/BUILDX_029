"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Sparkles, MapPin, Camera, UserX, CheckCircle, ArrowRight } from "lucide-react";
import { PRESET_LOCATIONS } from "@/lib/geo-utils";
import { IncidentCategory } from "@/lib/types";

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickReportModal({ isOpen, onClose, onSuccess }: QuickReportModalProps) {
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState(PRESET_LOCATIONS[0].name);
  const [category, setCategory] = useState<string>("AUTO");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedLoc = PRESET_LOCATIONS.find((l) => l.name === locationName) || PRESET_LOCATIONS[0];

      const payload: any = {
        description,
        locationName,
        latitude: selectedLoc.lat,
        longitude: selectedLoc.lng,
        isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName || "Concerned Citizen",
        reporterPhone: isAnonymous ? undefined : reporterPhone || "+91 98765 43210",
      };

      if (category !== "AUTO") {
        payload.category = category;
      }

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      alert("Error reporting incident: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setResult(null);
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={handleResetForm}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {result ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Incident Reported & AI Triaged</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Assigned ID: <span className="text-sky-400 font-mono font-bold">{result.incident.incidentNumber}</span>
            </p>

            {/* AI Intelligence Summary Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-left mb-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Incident Intelligence Triage</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-semibold text-slate-200">{result.incident.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assessed Priority:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    result.incident.priority === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {result.incident.priority}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                &ldquo;{result.aiTriage?.summary}&rdquo;
              </p>

              {result.duplicateCheck?.isDuplicate && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2 rounded text-[11px]">
                  <strong>Possible Duplicate Flagged:</strong> {result.duplicateCheck.reason}
                </div>
              )}

              {result.teamRecommendation && (
                <div className="text-emerald-400 font-medium">
                  Nearest Recommended Unit: <strong>{result.teamRecommendation.team.name}</strong> ({result.teamRecommendation.distanceMeters}m away)
                </div>
              )}
            </div>

            <button
              onClick={handleResetForm}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20"
            >
              Done / Return to Platform
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Quick Incident Report (Witness / Citizen)</span>
            </div>
            <p className="text-xs text-slate-400">
              Submit reports in under 30 seconds. Multilingual English, Hindi, and Marathi natural language descriptions are automatically triaged by Sentinel AI.
            </p>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What is happening? (Natural Language / विवरण) *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="E.g. 'Gate 3 ke paas bahut bheed ho rahi hai aur log dhakka de rahe hain' or 'Two men on bike snatched a gold necklace near Food Court'..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Location selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                Event Zone / Landmark *
              </label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Override */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="AUTO">AI Auto-Detect (Recommended)</option>
                  <option value="THEFT">Theft</option>
                  <option value="CHAIN_SNATCHING">Chain Snatching</option>
                  <option value="CROWD_ISSUE">Crowd Management</option>
                  <option value="PERSONAL_SAFETY">Personal Safety</option>
                  <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                  <option value="EMERGENCY">Emergency / Medical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Photo / Evidence
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-[11px] text-slate-400 border border-slate-700 flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <Camera className="w-3.5 h-3.5" />
                    Attach Image
                  </span>
                  <span className="text-[10px] text-slate-500">Demo active</span>
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Submit Anonymously</div>
                  <div className="text-[10px] text-slate-500">Protects witness identity from public exposure</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700"
              />
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
              <span>Submit & Run AI Incident Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}