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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Safe Journey Mode (Women & Commuter Safety)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transit monitoring in auto-rickshaws, cabs, or walking. Automatically detects route deviations and alerts trusted contacts & dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
          <Shield className="w-4 h-4" />
          <span>Active Escort Protocol</span>
        </div>
      </div>

      {/* Panic Activated Alert Banner if Panic was triggered */}
      {journey?.status === "PANIC_TRIGGERED" && (
        <div className="p-5 rounded-2xl bg-red-950/50 border-2 border-red-600 text-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-red-600 text-white">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-base text-white uppercase tracking-wider">
                EMERGENCY INTERCEPT IN PROGRESS
              </div>
              <p className="text-xs text-red-200 mt-0.5">
                Central Command Center has locked coordinates (19.0885, 72.8685). Alpha Rapid Security Patrol unit en route.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompleteJourney}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold"
          >
            End Emergency / Stand Down
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Journey Controller (7 Cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {journey ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live Journey Active
                  </span>
                  <h3 className="font-black text-lg text-white mt-1">
                    Commuter: {journey.userName}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Car className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold">{journey.transportMode}</span>
                </div>
              </div>

              {/* Waypoints Visualizer */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Start Location:</span>
                    <span className="font-semibold text-slate-200">{journey.startLocation}</span>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-slate-800 ml-1.5"></div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-500/20 animate-ping"></div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Telemetry:</span>
                    <span className="font-mono text-sky-300">
                      Lat {journey.lastKnownLat?.toFixed(4)}, Lng {journey.lastKnownLng?.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Near Eastern Link Corridor</span>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-slate-800 ml-1.5"></div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20"></div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Destination:</span>
                    <span className="font-semibold text-slate-200">{journey.destinationLocation}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Interactive Commuter Tests:
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSimulateDeviation}
                    disabled={journey.status === "PANIC_TRIGGERED"}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Simulate Route Deviation</span>
                  </button>

                  <button
                    onClick={handleCompleteJourney}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs"
                  >
                    Complete Journey Safely
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Start a Safe Journey</h3>
              <p className="text-xs text-slate-400">
                Register your commute to activate continuous GPS route deviation sensing and safety check-ins.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Destination:</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transport Vehicle:</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                >
                  <option value="AUTO">Auto Rickshaw</option>
                  <option value="CAB">Ride-Share Cab</option>
                  <option value="WALKING">Walking / On Foot</option>
                  <option value="BUS">Public Transit Bus</option>
                </select>
              </div>

              <button
                onClick={handleStartJourney}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Commence Safe Journey Monitoring</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Trusted Contacts & Safety Check-in (5 Cols) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Notified Trusted Contacts</span>
            </h3>
            <span className="text-[10px] text-slate-500">Auto-SMS Protocol</span>
          </div>

          <div className="space-y-2.5">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">{c.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {c.relationship} &bull; {c.phone}
                  </div>
                </div>
                {c.isPrimary && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Safety Check-in countdown simulation */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Recurring Safety Check-in</span>
              </span>
              <span className="text-sky-400 font-mono">08:45 remaining</span>
            </div>
            <p className="text-[11px] text-slate-400">
              If check-in prompt is unacknowledged, system automatically escalates coordinates to Central Command.
            </p>
          </div>
        </div>
      </div>

      {/* ROUTE DEVIATION PROMPT MODAL (Exact scenario requirement) */}
      {showDeviationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 mx-auto flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Route Deviation Detected!
              </h2>
              <p className="text-sm font-semibold text-amber-300 mt-1">
                &ldquo;Route deviation detected. Are you safe?&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Vehicle has turned 650m off the registered route into an isolated lane. Please confirm your safety status immediately.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleConfirmSafe}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
              >
                I AM SAFE
                <span className="block text-[10px] font-normal opacity-80">Continue Journey</span>
              </button>

              <button
                onClick={handleTriggerPanic}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all uppercase animate-pulse"
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