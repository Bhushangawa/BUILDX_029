"use client";

import React, { useState } from "react";
import { Play, RotateCcw, CheckCircle, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

const DEMO_STEPS = [
  { id: "STEP_1_CHILD_MISSING", label: "1. Missing Child Report", desc: "Aarav (6yo) lost at North Lawn. AI calculates 850m search radius." },
  { id: "STEP_2_DISPATCH_SEARCH", label: "2. Dispatch Search K9", desc: "Admin dispatches Delta K9 unit with coordinated search grid." },
  { id: "STEP_3_CROWD_SURGE", label: "3. Exit Gate Crowd Surge", desc: "Exit Gate B capacity jumps to 93%. Critical alert triggered." },
  { id: "STEP_4_DISPATCH_CROWD", label: "4. Deploy Crowd Squad", desc: "Bravo Squad deployed to open secondary exit lane." },
  { id: "STEP_5_SAFE_JOURNEY_DEVIATION", label: "5. Safe Journey Deviation", desc: "Priya's auto diverts into dark lane. 'Are you safe?' prompt pops up." },
  { id: "STEP_6_DUPLICATE_REPORT", label: "6. AI Duplicate Detection", desc: "Second witness reports bike snatching. AI clusters with 94% confidence." },
  { id: "STEP_7_CHILD_SIGHTING_FOUND", label: "7. Sighting Verified & Reunited", desc: "Volunteer sighting verified by police. Child reunited safe!" },
  { id: "STEP_8_RESOLVE_ALL", label: "8. Normalize & Live Analytics", desc: "Bottlenecks cleared, incidents marked resolved, analytics updated." },
];

export default function DemoTourBar({ onStepCompleted }: { onStepCompleted?: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const runStep = async (stepId: string, index: number) => {
    setIsRunning(true);
    setLastMessage(null);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepId }),
      });
      const data = await res.json();
      if (data.success) {
        setLastMessage(data.message || data.title);
        setCurrentStepIndex(Math.min(index + 1, DEMO_STEPS.length - 1));
        if (onStepCompleted) onStepCompleted();
      }
    } catch (e: any) {
      setLastMessage("Error triggering step: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = () => {
    const step = DEMO_STEPS[currentStepIndex];
    runStep(step.id, currentStepIndex);
  };

  const handleReset = async () => {
    setIsRunning(true);
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "RESET" }),
      });
      setCurrentStepIndex(0);
      setLastMessage("Database reseeded to initial event state.");
      if (onStepCompleted) onStepCompleted();
    } catch (e: any) {
      setLastMessage("Reset error: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none">
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl shadow-indigo-950/80 pointer-events-auto text-slate-100">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-extrabold text-xs uppercase tracking-wider bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              5-Minute Guided Hackathon Demonstration Tour
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              {isExpanded ? "Minimize" : "Expand Steps"}
            </button>
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              title="Reseed database back to baseline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Steps buttons */}
        {isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => runStep(s.id, idx)}
                disabled={isRunning}
                className={`text-left p-1.5 rounded-lg border text-[11px] transition-all ${
                  idx === currentStepIndex
                    ? "bg-indigo-600/30 border-indigo-400 text-white font-semibold ring-1 ring-indigo-400"
                    : idx < currentStepIndex
                    ? "bg-slate-800/40 border-slate-700/60 text-slate-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold line-clamp-1">{s.label}</div>
                <div className="text-[10px] opacity-75 line-clamp-1">{s.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Active step controller & status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex-1 min-w-[200px] text-xs">
            {lastMessage ? (
              <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{lastMessage}</span>
              </div>
            ) : (
              <div className="text-slate-400">
                Current: <span className="text-slate-200 font-semibold">{DEMO_STEPS[currentStepIndex].label}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Execute: {DEMO_STEPS[currentStepIndex].label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}