"use client";

import React, { useState } from "react";
import { AlertOctagon, X, PhoneCall, Radio, CheckCircle, ShieldAlert, Heart, Flame, Shield } from "lucide-react";

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencyTriggered?: () => void;
}

export default function SosModal({ isOpen, onClose, onEmergencyTriggered }: SosModalProps) {
  const [emergencyType, setEmergencyType] = useState<string>("IMMEDIATE_THREAT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggered, setTriggered] = useState(false);

  if (!isOpen) return null;

  const emergencyOptions = [
    { id: "IMMEDIATE_THREAT", label: "Physical Threat / Assault", icon: ShieldAlert, color: "text-red-400 border-red-800/80 bg-red-950/40" },
    { id: "MEDICAL", label: "Medical Emergency / Collapse", icon: Heart, color: "text-rose-400 border-rose-800/80 bg-rose-950/40" },
    { id: "HARASSMENT", label: "Harassment / Stalking / Unsafe", icon: Shield, color: "text-amber-400 border-amber-800/80 bg-amber-950/40" },
    { id: "FIRE", label: "Fire / Explosive Hazard", icon: Flame, color: "text-orange-400 border-orange-800/80 bg-orange-950/40" },
  ];

  const handleConfirmSos = async () => {
    setIsSubmitting(true);
    try {
      // Create high-priority CRITICAL incident
      const loc = { lat: 19.0765, lng: 72.8775, name: "Citizen Emergency GPS Lock (Main Promenade)" };

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `EMERGENCY SOS: ${emergencyType.replace(/_/g, " ")}`,
          description: `HIGH-PRIORITY 1-TOUCH CITIZEN SOS TRIGGERED. Immediate threat level: CRITICAL. User requested instant ground intervention. Trusted contacts alerted.`,
          category: emergencyType === "MEDICAL" ? "MEDICAL" : emergencyType === "FIRE" ? "FIRE" : "PERSONAL_SAFETY",
          priority: "CRITICAL",
          latitude: loc.lat,
          longitude: loc.lng,
          locationName: loc.name,
          reporterName: "Priya Sharma (SOS Verified Citizen)",
          reporterPhone: "+91 98765 43210",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTriggered(true);
        if (onEmergencyTriggered) onEmergencyTriggered();
      }
    } catch (e: any) {
      alert("SOS Transmission Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTriggered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-red-600 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-red-900/60 text-slate-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {triggered ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center animate-bounce">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-red-400 tracking-wide uppercase">
              Emergency SOS Active!
            </h2>
            <div className="bg-slate-950/80 p-4 rounded-xl border border-red-900/60 text-left text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Command Center Dispatched Rapid Response</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>GPS Location Locked (19.0765, 72.8775)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>SMS Alert Transmitted to Rahul Sharma (+91 98765 00000)</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Stay in place if safe. Security personnel are en route to your coordinates.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider"
            >
              Close Emergency Modal
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-600/20 border-2 border-red-500 text-red-500 mx-auto flex items-center justify-center mb-2 animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                Emergency Assistance (SOS)
              </h2>
              <p className="text-xs text-red-300 mt-1">
                One tap alerts the Central Security Command Room and notifies your primary trusted contacts with live coordinates.
              </p>
            </div>

            {/* Emergency Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Emergency Nature:</label>
              <div className="grid grid-cols-1 gap-2">
                {emergencyOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = emergencyType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEmergencyType(opt.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        isSelected
                          ? "ring-2 ring-red-500 border-red-500 bg-red-950/60 text-white"
                          : `${opt.color} hover:bg-slate-800`
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* One-Click Confirmation */}
            <button
              onClick={handleConfirmSos}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-600/50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Radio className="w-5 h-5 fill-current animate-pulse" />
              )}
              <span>CONFIRM & TRANSMIT EMERGENCY NOW</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}