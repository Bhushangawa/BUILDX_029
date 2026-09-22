"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Radio,
  Users,
  Eye,
  Compass,
  ArrowRight,
  AlertTriangle,
  Lock,
  Activity,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Cpu,
  Server,
  AlertOctagon,
  FileCheck,
} from "lucide-react";
import QuickReportModal from "@/components/incident/QuickReportModal";
import SosModal from "@/components/incident/SosModal";

export default function LandingPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-[#0c1322]">
      {/* Subtle circuit background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Track Identifier Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16233b] border border-[#243656] text-xs text-slate-300 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>
            <span className="font-semibold text-slate-200">BUILD-X 2026</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[#38bdf8] font-mono font-medium">Security Management Track</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            SENTINEL
            <span className="block text-xl sm:text-2xl lg:text-3xl font-bold text-[#38bdf8] mt-2 font-sans tracking-normal">
              Smart Security & Emergency Coordination Platform
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            One platform connecting citizens, security personnel, volunteers, and central control rooms for rapid incident coordination, crowd monitoring, and privacy-protected missing person assistance.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/command-center"
              className="px-5 py-2.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-5 py-2.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-200 border border-[#243656] font-semibold text-xs flex items-center gap-2 transition-all hover:border-slate-500"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Report Incident</span>
            </button>

            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2.5 rounded-md bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* Realistic Dashboard / Product Preview Component */}
        <div className="mt-12 max-w-5xl mx-auto bg-[#111b2f] border border-[#243656] rounded-xl shadow-2xl overflow-hidden text-left">
          {/* Tactical Top Ribbon */}
          <div className="bg-[#0a0f1d] px-4 py-2 border-b border-[#243656] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-semibold">SOC OPERATIONAL CONSOLE &bull; ACTIVE SECTOR 4</span>
            </div>
            <div className="text-slate-500 text-[11px] hidden sm:block">
              INTEGRATION: GPS &bull; OPTICAL DENSITY &bull; AI DEDUPLICATION
            </div>
          </div>

          {/* Mini SOC Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#243656] bg-[#16233b]/70 text-xs">
            <div className="p-3">
              <span className="text-slate-400 text-[11px] block">Active Tactical Incidents</span>
              <div className="text-lg font-bold text-white mt-0.5">3 Under Investigation</div>
            </div>
            <div className="p-3">
              <span className="text-slate-400 text-[11px] block">Perimeter Crowd Status</span>
              <div className="text-lg font-bold text-amber-400 mt-0.5">Exit Gate B (88% Load)</div>
            </div>
            <div className="p-3">
              <span className="text-slate-400 text-[11px] block">Protected Missing Cases</span>
              <div className="text-lg font-bold text-[#ea580c] mt-0.5">1 Search Grid Active</div>
            </div>
            <div className="p-3">
              <span className="text-slate-400 text-[11px] block">Response Unit Coverage</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">5 Units Deployed</div>
            </div>
          </div>

          {/* Live Preview Sample Feed */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0f172a] text-xs">
            <div className="p-3 rounded-lg bg-[#16233b] border border-[#243656]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-mono text-[#38bdf8] font-semibold">INC-2026-001</span>
                <span className="text-red-400 font-bold">CRITICAL</span>
              </div>
              <div className="font-semibold text-slate-200">South Exit Gate B Crowd Surge</div>
              <div className="text-[11px] text-slate-400 mt-1">Bravo Crowd Dispersion Squad on scene</div>
            </div>

            <div className="p-3 rounded-lg bg-[#16233b] border border-[#243656]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-mono text-[#ea580c] font-semibold">MP-2026-042</span>
                <span className="text-amber-400 font-bold">ACTIVE SEARCH</span>
              </div>
              <div className="font-semibold text-slate-200">Aarav Patel (6yo) - North Lawn</div>
              <div className="text-[11px] text-slate-400 mt-1">850m radius assigned to K9 Delta Unit</div>
            </div>

            <div className="p-3 rounded-lg bg-[#16233b] border border-[#243656]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-mono text-emerald-400 font-semibold">SAFE JOURNEY</span>
                <span className="text-emerald-400 font-bold">MONITORED</span>
              </div>
              <div className="font-semibold text-slate-200">Commuter Escort: Priya Sharma</div>
              <div className="text-[11px] text-slate-400 mt-1">Telemetry active &bull; Deviation sensor primed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE OPERATIONAL MODULES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1e2d48]">
        <div className="text-left mb-10 max-w-3xl">
          <div className="text-[#38bdf8] font-mono text-xs font-bold uppercase tracking-wider mb-1">
            Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Complete Security Operations Management
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Every module addresses a distinct vulnerability in public safety and event operations, backed by real database models and verified APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module 1: Missing Child & Elderly */}
          <div className="p-5 rounded-lg bg-[#111b2f] border border-[#243656] text-left flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#ea580c]/10 text-[#ea580c] border border-[#ea580c]/30 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Missing Person Case Management
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic search perimeters on Leaflet map, verified volunteer tasking, and privacy-governed child profiles that prevent public photo exploitation and false sighting panics.
              </p>
            </div>
            <Link
              href="/missing-persons"
              className="text-xs font-semibold text-[#ea580c] hover:underline flex items-center gap-1 mt-4"
            >
              <span>Explore Case Management</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Module 2: Crowd Management */}
          <div className="p-5 rounded-lg bg-[#111b2f] border border-[#243656] text-left flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Perimeter Crowd Density Monitoring
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optical and sensor capacity monitoring across gate entrances, exits, and main stages. Automatically triggers bottleneck warnings when density exceeds 85%.
              </p>
            </div>
            <Link
              href="/crowd-monitoring"
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 mt-4"
            >
              <span>View Crowd Zones</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Module 3: Safe Journey */}
          <div className="p-5 rounded-lg bg-[#111b2f] border border-[#243656] text-left flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/30 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Safe Journey & Route Deviation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Protects women and commuters in transit. Automatically prompts &ldquo;Route deviation detected. Are you safe?&rdquo; and triggers immediate police intercept coordinates.
              </p>
            </div>
            <Link
              href="/safe-journey"
              className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1 mt-4"
            >
              <span>Launch Safe Journey</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Secondary Row: AI Intelligence & Central SOC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="p-5 rounded-lg bg-[#111b2f] border border-[#243656] text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                AI Incident Classification & Deduplication
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Triage natural language reporting in English, Hindi, and Marathi. Groups duplicate witness reports of the same incident into 1 Master Incident with spatial-temporal correlation.
              </p>
            </div>
            <Link
              href="/incidents"
              className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1 mt-4"
            >
              <span>Incident Intelligence Queue</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-lg bg-[#111b2f] border border-[#243656] text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Central Security Command Center (SOC)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unified situational awareness with interactive Leaflet tactical maps, unit dispatch suggestions, SLA escalation timers, and case lifecycle records.
              </p>
            </div>
            <Link
              href="/command-center"
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1 mt-4"
            >
              <span>Enter Security Command Center</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* OPERATIONAL WORKFLOW STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1e2d48] bg-[#0a0f1d]/60">
        <div className="text-left mb-8 max-w-2xl">
          <div className="text-[#38bdf8] font-mono text-xs font-bold uppercase tracking-wider mb-1">
            Operational Protocol
          </div>
          <h2 className="text-2xl font-bold text-white">
            End-to-End Incident Lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-lg bg-[#111b2f] border border-[#243656]">
            <div className="text-[#38bdf8] font-mono text-xs font-bold mb-1">STAGE 01 &bull; REPORT</div>
            <div className="font-bold text-white text-sm">Citizen / Witness Intake</div>
            <p className="text-xs text-slate-400 mt-1">
              Sub-30s reporting with optional anonymity to encourage witnesses.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#111b2f] border border-[#243656]">
            <div className="text-[#38bdf8] font-mono text-xs font-bold mb-1">STAGE 02 &bull; TRIAGE</div>
            <div className="font-bold text-white text-sm">AI Assisted Intelligence</div>
            <p className="text-xs text-slate-400 mt-1">
              Urgency scoring, entity extraction, and duplicate cluster detection.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#111b2f] border border-[#243656]">
            <div className="text-[#38bdf8] font-mono text-xs font-bold mb-1">STAGE 03 &bull; DISPATCH</div>
            <div className="font-bold text-white text-sm">SOC Unit Deployment</div>
            <p className="text-xs text-slate-400 mt-1">
              Command room confirms triage and tasks nearest suitable unit.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#111b2f] border border-[#243656]">
            <div className="text-[#38bdf8] font-mono text-xs font-bold mb-1">STAGE 04 &bull; RESOLVE</div>
            <div className="font-bold text-white text-sm">Verified Resolution</div>
            <p className="text-xs text-slate-400 mt-1">
              Field personnel arrive, update status, and log chronological audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* PRIVACY & DATA GOVERNANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#1e2d48]">
        <div className="p-6 rounded-xl bg-[#111b2f] border border-[#243656] text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#38bdf8] font-mono font-semibold mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>STRICT DATA PRIVACY PROTOCOL</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Child Protection & Sensitive Data Governance
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              SENTINEL never exposes sensitive child photos, identifying marks, or guardian phone numbers publicly. Only authorized police and verified volunteers receive controlled dossiers. All sighting submissions require administrative validation before field dispatch.
            </p>
          </div>

          <Link
            href="/command-center"
            className="px-5 py-2.5 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs shadow-sm whitespace-nowrap"
          >
            Launch Command Center
          </Link>
        </div>
      </section>

      {/* Modals */}
      <QuickReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />
    </div>
  );
}