"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle,
  Phone,
  Clock,
  Car,
  Navigation,
  Radio,
  X,
  AlertOctagon,
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
        if (data.journey.status === "DEVIATION_DETECTED") {
          setShowDeviationModal(true);
        }
      } else {
        setJourney(null);
      }
      if (data.contacts) setContacts(data.contacts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney();
    const interval = setInterval(fetchJourney, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          destinationLocation: destination,
          transportMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJourney(data.journey);
        setPanicResult(null);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleSimulateDeviation = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIMULATE_DEVIATION",
          journeyId: journey?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJourney(data.journey);
        setShowDeviationModal(true);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleConfirmSafe = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_SAFE",
          journeyId: journey?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJourney(data.journey);
        setShowDeviationModal(false);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleTriggerPanic = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRIGGER_PANIC",
          journeyId: journey?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJourney(data.journey);
        setPanicResult(data);
        setShowDeviationModal(false);
      }
    } catch (e: any) {
      alert("Panic Error: " + e.message);
    }
  };

  const handleCompleteJourney = async () => {
    try {
      const res = await fetch("/api/safe-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          journeyId: journey?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJourney(null);
        setPanicResult(null);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-[#0c1322] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111b2f] p-4 rounded-xl border border-[#243656] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#38bdf8]" />
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              Safe Journey Commuter Protection
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active GPS telemetry & route deviation detection for women and vulnerable commuters in auto-rickshaws, cabs, or walking.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-[#16233b] border border-[#243656] text-slate-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Escort Telemetry Active</span>
        </div>
      </div>

      {/* Emergency Intercept Banner if Panic was triggered */}
      {journey?.status === "PANIC_TRIGGERED" && (
        <div className="p-4 rounded-xl bg-[#16233b] border-2 border-red-500 text-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-600 text-white flex-shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider">
                Emergency Intercept Dispatched
              </div>
              <p className="text-xs text-red-200 mt-0.5">
                Central Command has locked telemetry coordinates (19.0885° N, 72.8685° E). Alpha Rapid Patrol unit dispatched.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompleteJourney}
            className="px-3 py-1.5 rounded bg-[#111b2f] hover:bg-[#0c1322] text-slate-200 border border-[#243656] text-xs font-semibold whitespace-nowrap"
          >
            End Emergency / Stand Down
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Journey Controller (7 Cols) */}
        <div className="md:col-span-7 bg-[#111b2f] border border-[#243656] rounded-xl p-5 shadow-sm space-y-4">
          {journey ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#243656]">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30">
                    Live Escort Active
                  </span>
                  <h3 className="font-bold text-base text-white mt-1">
                    Commuter: {journey.userName}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Car className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{journey.transportMode}</span>
                </div>
              </div>

              {/* Waypoints Visualizer */}
              <div className="p-3.5 rounded-lg bg-[#0c1322] border border-[#243656] space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Origin:</span>
                    <span className="font-semibold text-slate-200">{journey.startLocation}</span>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-[#243656] ml-1"></div>

                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] animate-pulse"></div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Telemetry:</span>
                    <span className="font-mono text-[#38bdf8]">
                      Lat {journey.lastKnownLat?.toFixed(4)}, Lng {journey.lastKnownLng?.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Near Eastern Link Corridor</span>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-[#243656] ml-1"></div>

                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Destination:</span>
                    <span className="font-semibold text-slate-200">{journey.destinationLocation}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Interactive Route Tests:
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleSimulateDeviation}
                    disabled={journey.status === "PANIC_TRIGGERED"}
                    className="flex-1 py-2 px-3 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Route Deviation</span>
                  </button>

                  <button
                    onClick={handleCompleteJourney}
                    className="py-2 px-3 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-300 border border-[#243656] font-semibold text-xs"
                  >
                    Complete Journey Safely
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Start a Safe Journey</h3>
              <p className="text-xs text-slate-400">
                Register commute to activate continuous GPS route deviation sensing and automated check-in pings.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Destination:</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transport Mode:</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1322] border border-[#243656] rounded-md text-xs text-slate-100"
                >
                  <option value="AUTO">Auto Rickshaw</option>
                  <option value="CAB">Ride-Share Cab</option>
                  <option value="WALKING">Walking / On Foot</option>
                  <option value="BUS">Public Transit Bus</option>
                </select>
              </div>

              <button
                onClick={handleStartJourney}
                className="w-full py-2.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Commence Safe Journey Monitoring</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Trusted Contacts (5 Cols) */}
        <div className="md:col-span-5 bg-[#111b2f] border border-[#243656] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#243656]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notified Contacts</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">SMS Integration</span>
          </div>

          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-md bg-[#0c1322] border border-[#243656] text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">{c.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {c.relationship} &bull; {c.phone}
                  </div>
                </div>
                {c.isPrimary && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Safety Check-in countdown */}
          <div className="p-3 rounded-md bg-[#0c1322] border border-[#243656] text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Recurring Safety Check-in</span>
              </span>
              <span className="text-[#38bdf8] font-mono text-xs">08:45</span>
            </div>
            <p className="text-[11px] text-slate-400">
              If check-in prompt is unanswered, telemetry escalates to Central Command.
            </p>
          </div>
        </div>
      </div>

      {/* ROUTE DEVIATION PROMPT MODAL (Exact scenario requirement) */}
      {showDeviationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-sm">
          <div className="bg-[#111b2f] border-2 border-amber-500/80 rounded-xl max-w-md w-full p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#243656]">
              <div className="w-10 h-10 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Route Deviation Detected!
                </h2>
                <p className="text-xs font-semibold text-amber-300">
                  &ldquo;Route deviation detected. Are you safe?&rdquo;
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vehicle has turned 650m away from the expected route into an isolated service lane. Please confirm your status immediately.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleConfirmSafe}
                className="py-2.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all text-center"
              >
                I AM SAFE
                <span className="block text-[10px] font-normal opacity-80">Continue Journey</span>
              </button>

              <button
                onClick={handleTriggerPanic}
                className="py-2.5 px-3 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all uppercase text-center"
              >
                NEED HELP!
                <span className="block text-[10px] font-normal opacity-90">Alert Dispatch & Family</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}