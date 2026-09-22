"use client";

import React, { useState, useEffect } from "react";
import {
  Compass, MapPin, Shield, AlertTriangle, CheckCircle,
  Phone, Clock, Car, Navigation, AlertOctagon, X,
} from "lucide-react";

export default function SafeJourneyPage() {
  const [journey, setJourney] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState("Grand Metro Interchange Station");
  const [transportMode, setTransportMode] = useState("AUTO");
  const [showDeviationModal, setShowDeviationModal] = useState(false);
  const [panicResult, setPanicResult] = useState<any | null>(null);

  const fetchJourney = async () => {
    try {
      const res = await fetch("/api/safe-journey");
      const data = await res.json();
      if (data.journey) {
        setJourney(data.journey);
        if (data.journey.status === "DEVIATION_DETECTED") setShowDeviationModal(true);
      } else { setJourney(null); }
      if (data.contacts) setContacts(data.contacts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchJourney();
    const interval = setInterval(fetchJourney, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START", destinationLocation: destination, transportMode }),
      });
      const data = await res.json();
      if (data.success) { setJourney(data.journey); setPanicResult(null); }
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleSimulateDeviation = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SIMULATE_DEVIATION", journeyId: journey?.id }),
      });
      const data = await res.json();
      if (data.success) { setJourney(data.journey); setShowDeviationModal(true); }
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleConfirmSafe = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_SAFE", journeyId: journey?.id }),
      });
      const data = await res.json();
      if (data.success) { setJourney(data.journey); setShowDeviationModal(false); }
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleTriggerPanic = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TRIGGER_PANIC", journeyId: journey?.id }),
      });
      const data = await res.json();
      if (data.success) { setJourney(data.journey); setPanicResult(data); setShowDeviationModal(false); }
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleCompleteJourney = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPLETE", journeyId: journey?.id }),
      });
      const data = await res.json();
      if (data.success) { setJourney(null); setPanicResult(null); }
    } catch (e: any) { alert("Error: " + e.message); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111d30] border border-[#1e3151] rounded-xl px-5 py-3.5">
        <div>
          <h1 className="text-[15px] font-semibold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            Safe Journey Commuter Protection
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            GPS telemetry &amp; route deviation detection for women and vulnerable commuters.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
          <Shield className="w-3.5 h-3.5" /> Escort Telemetry Active
        </span>
      </div>

      {/* Emergency Intercept Banner */}
      {journey?.status === "PANIC_TRIGGERED" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/50 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 border border-red-500/40">
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-red-300">Emergency Intercept Dispatched</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">
                Telemetry locked at 19.0885° N, 72.8685° E. Alpha Rapid Patrol unit en route.
              </p>
            </div>
          </div>
          <button
            onClick={handleCompleteJourney}
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] hover:text-white border border-[#1e3151] text-[12px] font-medium transition-all"
          >
            Stand Down / End Journey
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

        {/* Journey Controller (Left, 7 cols) */}
        <div className="md:col-span-7 bg-[#111d30] border border-[#1e3151] rounded-xl p-5 space-y-4">
          {journey ? (
            <>
              {/* Active Journey Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1e3151]">
                <div>
                  <span className="badge badge-active border mb-1">Live Escort Active</span>
                  <h3 className="text-[14px] font-semibold text-white mt-1">
                    Commuter: <span className="text-sky-400">{journey.userName}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#64748b] font-mono">
                  <Car className="w-3.5 h-3.5 text-sky-400" />
                  <span>{journey.transportMode}</span>
                </div>
              </div>

              {/* Route Waypoints */}
              <div className="p-4 bg-[#0a1120] border border-[#1e3151] rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="section-label block mb-0.5">Origin</span>
                    <span className="text-[13px] font-medium text-white">{journey.startLocation}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 pl-[5px]">
                  <div className="w-px h-8 bg-[#1e3151] ml-[0px]" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse mt-1 flex-shrink-0" />
                  <div>
                    <span className="section-label block mb-0.5">Current Telemetry</span>
                    <span className="font-mono text-[13px] text-sky-400">
                      {journey.lastKnownLat?.toFixed(4)}, {journey.lastKnownLng?.toFixed(4)}
                    </span>
                    <span className="text-[11px] text-[#64748b] block">Near Eastern Link Corridor</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 pl-[5px]">
                  <div className="w-px h-8 bg-[#1e3151]" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="section-label block mb-0.5">Destination</span>
                    <span className="text-[13px] font-medium text-white">{journey.destinationLocation}</span>
                  </div>
                </div>
              </div>

              {/* Demo Actions */}
              <div>
                <p className="section-label mb-2">Demo Simulation Controls</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSimulateDeviation}
                    disabled={journey.status === "PANIC_TRIGGERED"}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 font-semibold text-[12px] transition-all disabled:opacity-40"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Simulate Route Deviation
                  </button>
                  <button
                    onClick={handleCompleteJourney}
                    className="px-4 py-2.5 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] hover:text-white border border-[#1e3151] font-medium text-[12px] transition-all"
                  >
                    Complete Journey
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Start Journey Form */
            <div className="space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white mb-1">Start a Safe Journey</h3>
                <p className="text-[12px] text-[#64748b]">
                  Register your commute to activate continuous GPS monitoring and deviation detection.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="section-label block mb-1.5">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="soc-input"
                  />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Transport Mode</label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="soc-input"
                  >
                    <option value="AUTO">Auto Rickshaw</option>
                    <option value="CAB">Ride-Share Cab</option>
                    <option value="WALKING">Walking / On Foot</option>
                    <option value="BUS">Public Transit Bus</option>
                  </select>
                </div>
                <button
                  onClick={handleStartJourney}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-[13px] shadow-md transition-all active:scale-99"
                >
                  <Navigation className="w-4 h-4" />
                  Start Safe Journey Monitoring
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trusted Contacts (Right, 5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#111d30] border border-[#1e3151] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e3151]">
              <h3 className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Notified Contacts
              </h3>
              <span className="text-[10px] font-mono text-[#475569]">SMS Integration</span>
            </div>
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-[#0a1120] border border-[#1e3151] flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-white">{c.name}</p>
                    <p className="text-[11px] text-[#64748b]">{c.relationship} &bull; {c.phone}</p>
                  </div>
                  {c.isPrimary && <span className="badge badge-resolved border flex-shrink-0">Primary</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Check-in timer */}
          <div className="bg-[#111d30] border border-[#1e3151] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Safety Check-in
              </span>
              <span className="font-mono text-sky-400 text-[14px] font-bold">08:45</span>
            </div>
            <p className="text-[12px] text-[#64748b] leading-relaxed">
              If check-in prompt is unanswered, telemetry automatically escalates to Central Command.
            </p>
          </div>
        </div>
      </div>

      {/* Route Deviation Modal */}
      {showDeviationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111d30] border-2 border-amber-500/60 rounded-2xl max-w-md w-full p-6 shadow-modal space-y-4 animate-slide-up">
            <div className="flex items-start gap-3 pb-3 border-b border-[#1e3151]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white">Route Deviation Detected</h2>
                <p className="text-[12px] text-amber-400 mt-0.5 italic">
                  &ldquo;Route deviation detected. Are you safe?&rdquo;
                </p>
              </div>
            </div>

            <p className="text-[13px] text-[#94a3b8] leading-relaxed">
              Vehicle has turned 650m away from the expected route into an isolated service lane. Please confirm your status immediately.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleConfirmSafe}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px] transition-all text-center"
              >
                <span className="block">I AM SAFE</span>
                <span className="block text-[11px] font-normal opacity-80 mt-0.5">Continue Journey</span>
              </button>
              <button
                onClick={handleTriggerPanic}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[13px] transition-all text-center"
              >
                <span className="block">NEED HELP!</span>
                <span className="block text-[11px] font-normal opacity-90 mt-0.5">Alert Dispatch &amp; Family</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}