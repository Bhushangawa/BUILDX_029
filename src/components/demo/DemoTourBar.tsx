"use client";

import React, { useState } from "react";
import { Play, RotateCcw, CheckCircle2, ArrowRight, Activity, ChevronUp, ChevronDown } from "lucide-react";

const DEMO_STEPS = [
  { id: "STEP_1_CHILD_MISSING", label: "1. Missing Child Report", desc: "Aarav (6yo) reported lost; 850m radius generated." },
  { id: "STEP_2_DISPATCH_SEARCH", label: "2. Dispatch Search Unit", desc: "Delta K9 unit tasked to North Lawn sector." },
  { id: "STEP_3_CROWD_SURGE", label: "3. Exit Gate Surge", desc: "Exit Gate B jumps to 93% capacity alarm." },
  { id: "STEP_4_DISPATCH_CROWD", label: "4. Deploy Crowd Squad", desc: "Bravo Squad opens secondary exit lanes." },
  { id: "STEP_5_SAFE_JOURNEY_DEVIATION", label: "5. Safe Journey Deviation", desc: "Vehicle deviates; 'Are you safe?' prompt pops up." },
  { id: "STEP_6_DUPLICATE_REPORT", label: "6. AI Duplicate Clustering", desc: "Witness 2 report clustered with 94% confidence." },
  { id: "STEP_7_CHILD_SIGHTING_FOUND", label: "7. Sighting Verified & Reunited", desc: "Volunteer sighting verified; child reunited safe." },
  { id: "STEP_8_RESOLVE_ALL", label: "8. Normalize & Analytics", desc: "Bottlenecks cleared, incidents marked resolved." },
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
      setLastMessage("Event database reset to baseline scenario.");
      if (onStepCompleted) onStepCompleted();
    } catch (e: any) {
      setLastMessage("Reset error: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-3 pointer-events-none">
      <div className="bg-[#111b2f]/95 backdrop-blur-md border border-[#243656] rounded-xl p-3 shadow-xl pointer-events-auto text-slate-100">
        <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-[#1e2d48]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#0ea5e9]"></span>
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#0ea5e9]" />
              Guided Hackathon Scenario Tour
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">&bull; 8 Real-Time Operational Stages</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#16233b] border border-[#243656] flex items-center gap-1"
            >
              {isExpanded ? (
                <><span>Collapse</span><ChevronDown className="w-3 h-3" /></>
              ) : (
                <><span>Expand Steps</span><ChevronUp className="w-3 h-3" /></>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-0.5 rounded bg-[#16233b] hover:bg-[#1e2d48] border border-[#243656] transition-all"
              title="Reset scenario data to baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Step buttons */}
        {isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => runStep(s.id, idx)}
                disabled={isRunning}
                className={`text-left p-1.5 rounded-md border text-[11px] transition-all ${
                  idx === currentStepIndex
                    ? "bg-[#0ea5e9]/15 border-[#0ea5e9] text-white font-semibold"
                    : idx < currentStepIndex
                    ? "bg-[#16233b]/60 border-[#243656] text-slate-400"
                    : "bg-[#0c1322]/50 border-[#1e2d48] text-slate-500 hover:text-slate-300 hover:border-[#243656]"
                }`}
              >
                <div className="font-semibold line-clamp-1">{s.label}</div>
                <div className="text-[10px] opacity-75 line-clamp-1">{s.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Action Controller */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex-1 min-w-[200px] text-xs">
            {lastMessage ? (
              <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{lastMessage}</span>
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">
                Stage: <strong className="text-slate-200">{DEMO_STEPS[currentStepIndex].label}</strong>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>Execute: {DEMO_STEPS[currentStepIndex].label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}