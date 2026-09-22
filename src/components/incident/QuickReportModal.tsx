"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Cpu, MapPin, Camera, UserX, CheckCircle, ArrowRight } from "lucide-react";
import { PRESET_LOCATIONS } from "@/lib/geo-utils";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111d30] border border-[#1e3151] rounded-2xl max-w-lg w-full p-5 shadow-modal text-slate-100 relative animate-slide-up">
        <button
          onClick={handleResetForm}
          className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#172338] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {result ? (
          <div className="text-left py-2 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#243656]">
              <div className="w-9 h-9 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Incident Logged & Queued</h3>
                <p className="text-xs text-slate-400">
                  Tracking ID: <span className="text-[#38bdf8] font-mono font-bold">{result.incident.incidentNumber}</span>
                </p>
              </div>
            </div>

            {/* AI Incident Intelligence Review */}
              <div className="p-4 rounded-xl bg-[#0a1120] border border-[#1e3151] space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#243656]/60">
                <div className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI Incident Triage Analysis</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Assistance Only &bull; Staff Confirmed</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[11px] block">Suggested Category:</span>
                  <span className="font-semibold text-slate-200">{result.incident.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Assessed Priority:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    result.incident.priority === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}>
                    {result.incident.priority}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0c1322] border border-[#243656] text-[11px] text-slate-300">
                {result.aiTriage?.summary}
              </div>

              {result.duplicateCheck?.isDuplicate && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2 rounded text-[11px]">
                  <strong>Possible Duplicate Clustered:</strong> {result.duplicateCheck.reason}
                </div>
              )}

              {result.teamRecommendation && (
                <div className="text-emerald-400 text-[11px]">
                  Nearest Recommended Unit: <strong>{result.teamRecommendation.team.name}</strong> ({result.teamRecommendation.distanceMeters}m away)
                </div>
              )}
            </div>

            <button
              onClick={handleResetForm}
              className="w-full py-2.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-sm transition-all"
            >
              Close & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm pb-2 border-b border-[#243656]">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Quick Incident Intake Form</span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Description (English, Hindi, or Marathi) *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="E.g. 'Gate 3 ke paas bohot bheed ho rahi hai' or 'Two men on bike snatched a necklace near Food Court'..."
                className="soc-input text-[12px]"
              />
            </div>

            {/* Location selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                Event Zone / Landmark *
              </label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="soc-input text-[12px]"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Override & Photo */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Override
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100 focus:outline-none focus:border-[#0ea5e9]"
                >
                  <option value="AUTO">AI Auto-Detect (Recommended)</option>
                  <option value="THEFT">Theft</option>
                  <option value="CHAIN_SNATCHING">Chain Snatching</option>
                  <option value="CROWD_ISSUE">Crowd Issue</option>
                  <option value="PERSONAL_SAFETY">Personal Safety</option>
                  <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                  <option value="EMERGENCY">Emergency / Medical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Media
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1.5 rounded-md bg-[#16233b] text-[11px] text-slate-400 border border-[#243656] flex items-center gap-1 cursor-pointer hover:text-white">
                    <Camera className="w-3.5 h-3.5" />
                    Attach Image
                  </span>
                  <span className="text-[10px] text-slate-500">Camera Active</span>
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#0a1120] rounded-lg border border-[#1e3151]">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-[#38bdf8]" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Submit Anonymously</div>
                  <div className="text-[10px] text-slate-500">Protects witness identity in public records</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-[#0ea5e9] bg-[#16233b] border-[#243656]"
              />
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Reporter Name"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
              <span>Submit & Run AI Incident Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}