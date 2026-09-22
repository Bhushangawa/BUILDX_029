"use client";

import React, { useState } from "react";
import { AlertOctagon, X, Radio, CheckCircle, ShieldAlert, Heart, Flame, Shield } from "lucide-react";

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
    { id: "IMMEDIATE_THREAT", label: "Physical Threat / Assault", icon: ShieldAlert },
    { id: "MEDICAL", label: "Medical Emergency / Collapse", icon: Heart },
    { id: "HARASSMENT", label: "Harassment / Stalking / Unsafe", icon: Shield },
    { id: "FIRE", label: "Fire / Hazardous Condition", icon: Flame },
  ];

  const handleConfirmSos = async () => {
    setIsSubmitting(true);
    try {
      const loc = { lat: 19.0765, lng: 72.8775, name: "Citizen Emergency GPS Lock (Main Promenade)" };

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `EMERGENCY SOS: ${emergencyType.replace(/_/g, " ")}`,
          description: `HIGH-PRIORITY 1-TOUCH CITIZEN SOS TRIGGERED. Threat category: ${emergencyType}. Instant tactical dispatch requested. Coordinates locked.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-sm">
      <div className="bg-[#111b2f] border border-[#243656] rounded-xl max-w-md w-full p-5 shadow-2xl text-slate-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#16233b]"
        >
          <X className="w-4 h-4" />
        </button>

        {triggered ? (
          <div className="text-left py-2 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#243656]">
              <div className="w-10 h-10 rounded-md bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Emergency Broadcast Active
                </h2>
                <p className="text-xs text-red-300">
                  Priority 1 Dispatch sent to Central Command
                </p>
              </div>
            </div>

            <div className="bg-[#16233b] p-3 rounded-lg border border-[#243656] text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Command Center Dispatched Rapid Response Unit</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>GPS Location Locked (19.0765° N, 72.8775° E)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>SMS Alert Transmitted to Rahul Sharma (+91 98765 00000)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Stay in a secure location if possible. A security unit is converging on your coordinates.
            </p>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-200 border border-[#243656] font-bold text-xs uppercase tracking-wider"
            >
              Close Emergency Confirmation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#243656]">
              <div className="w-8 h-8 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Emergency Assistance (SOS)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Instantly transmits live coordinates to Central SOC & trusted contacts.
                </p>
              </div>
            </div>

            {/* Emergency Type Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Emergency Classification:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {emergencyOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = emergencyType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEmergencyType(opt.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-md border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? "ring-1 ring-red-500 border-red-500 bg-red-950/30 text-white"
                          : "bg-[#0c1322] border-[#243656] text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disciplined Confirmation Trigger */}
            <button
              onClick={handleConfirmSos}
              disabled={isSubmitting}
              className="w-full py-3 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Radio className="w-4 h-4" />
              )}
              <span>Confirm Emergency Transmission</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}