"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Radio,
  Users,
  Eye,
  Compass,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Lock,
  Activity,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  FileText,
  AlertOctagon,
} from "lucide-react";
import QuickReportModal from "@/components/incident/QuickReportModal";
import SosModal from "@/components/incident/SosModal";

export default function LandingPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 mb-6 shadow-xl shadow-slate-950/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>BUILD-X Hackathon — Security Management Track</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-bold">Production Prototype</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
          One platform. One command center.{" "}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Faster coordination.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          <strong>SENTINEL</strong> unifies citizens, security teams, help desks, and volunteers into a real-time, AI-assisted emergency response network. Eliminating paper delays, false sightings, and communication blackouts.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/command-center"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Radio className="w-4 h-4 text-slate-950 fill-current" />
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsReportOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all hover:border-slate-600 shadow-lg shadow-slate-950"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Report Incident (Citizen)</span>
          </button>

          <button
            onClick={() => setIsSosOpen(true)}
            className="px-5 py-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-950"
          >
            <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
            <span>1-Touch SOS</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-white">4.2 min</div>
            <div className="text-xs text-slate-400 mt-0.5">Avg Response Dispatch</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-sky-400">94%</div>
            <div className="text-xs text-slate-400 mt-0.5">AI Duplicate Deduplication</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-amber-400">&lt; 30s</div>
            <div className="text-xs text-slate-400 mt-0.5">Quick Witness Reporting</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Child Privacy Controlled</div>
          </div>
        </div>
      </section>

      {/* SECTION: CORE SECURITY SCENARIOS SOLVED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-sky-400">
            Complete Problem Coverage
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Solving the 5 Critical Fragilities in Modern Public Security
          </p>
          <p className="text-slate-400 text-sm mt-3">
            Traditional security fails during large public events due to paper-based logging, walkie-talkie chatter, delayed crowd alerts, and uncontrolled social media panics. Sentinel connects every tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scenario 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Missing Child & Elderly Assistance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Replaces delayed paper help-desk notes with instantaneous digital child profiles, dynamic search perimeter radiuses on Leaflet map, vetted volunteer tasking, and strict privacy protection against public child photo misuse.
              </p>
            </div>
            <Link
              href="/missing-persons"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 mt-2"
            >
              <span>Explore Missing Persons Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Scenario 2 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Crowd Density & Surge Alerts
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Automated zone monitoring across Entry Gates, Exit Gates, and Arenas. Detects critical bottlenecks when capacity exceeds 85%, generates immediate command room alarms, and dispatches crowd control squads before stampedes occur.
              </p>
            </div>
            <Link
              href="/crowd-monitoring"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-2"
            >
              <span>View Live Crowd Zones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Scenario 3 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Safe Journey & Route Deviation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Guards women and vulnerable commuters in auto-rickshaws and cabs. Detects route diversions in real-time, prompts &ldquo;Are you safe?&rdquo;, and triggers immediate emergency intercept patrols with live GPS telemetry.
              </p>
            </div>
            <Link
              href="/safe-journey"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2"
            >
              <span>Launch Safe Journey Mode</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                AI Incident Intelligence & Duplicate Clustering
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Understands natural language reporting across English, Hindi, and Marathi (e.g. &ldquo;Gate 3 ke paas bheed ho gayi hai&rdquo;). Correlates 20 witness reports of the same event into 1 Master Incident with spatial-temporal clustering, eliminating map clutter.
              </p>
            </div>
            <Link
              href="/incidents"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View Incident Directory & AI Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Central Security Command Center & Tactical Map
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Interactive Leaflet map with color-coded situational pins (Red: Emergency, Orange: Missing, Yellow: Crowd, Blue: Help Desk, Green: Response Patrols, Purple: Restricted). SLA escalation engine warns when cases sit unacknowledged.
              </p>
            </div>
            <Link
              href="/command-center"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Open Tactical Command Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: 4-STEP WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
            Unified Workflow
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            From Incident Report to Verified Resolution
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
            <div className="text-sky-400 font-mono font-bold text-sm mb-2">STEP 01</div>
            <h4 className="font-bold text-slate-100 text-sm mb-1">Citizen / Witness Logs</h4>
            <p className="text-xs text-slate-400">
              Quick 30-second report or 1-tap SOS. Optional anonymity ensures witnesses report fearlessly.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
            <div className="text-indigo-400 font-mono font-bold text-sm mb-2">STEP 02</div>
            <h4 className="font-bold text-slate-100 text-sm mb-1">AI Triage & Deduplication</h4>
            <p className="text-xs text-slate-400">
              Natural language intelligence extracts priority, entity hotspots, and clusters duplicate witness reports.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
            <div className="text-amber-400 font-mono font-bold text-sm mb-2">STEP 03</div>
            <h4 className="font-bold text-slate-100 text-sm mb-1">Smart Team Dispatch</h4>
            <p className="text-xs text-slate-400">
              Command room verifies AI triage, and assigns the closest specialized team (K9, Crowd, Patrol, Paramedic).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
            <div className="text-emerald-400 font-mono font-bold text-sm mb-2">STEP 04</div>
            <h4 className="font-bold text-slate-100 text-sm mb-1">Coordinated Resolution</h4>
            <p className="text-xs text-slate-400">
              Responders acknowledge, arrive on scene, update status, and log chronological audit timeline.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: PRIVACY & GOVERNANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl p-8 border border-slate-800 text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Lock className="w-3.5 h-3.5" />
                <span>Privacy-First Architecture</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Sensitive Information Protection by Design
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Sentinel safeguards vulnerable individuals. Sensitive child dossiers are masked from the public internet. Only vetted police officers, authorized volunteers, and help-desk personnel access identification data. Sighting submissions require admin verification before ground action, eliminating hoaxes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/command-center"
                className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 text-center"
              >
                Access Command Center
              </Link>
            </div>
          </div>
        </div>
      </section>

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