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
  Zap,
  UserCheck,
} from "lucide-react";
import QuickReportModal from "@/components/incident/QuickReportModal";
import SosModal from "@/components/incident/SosModal";

const PLATFORM_MODULES = [
  {
    icon: Radio,
    title: "Security Command Center",
    desc: "Unified situational awareness with interactive tactical maps, unit dispatch, SLA escalation timers, and case dossiers.",
    href: "/command-center",
    accentClass: "text-sky-400",
    bgClass: "bg-sky-500/10 border-sky-500/20",
    linkLabel: "Enter SOC →",
    linkClass: "text-sky-400",
  },
  {
    icon: AlertTriangle,
    title: "Incident Intelligence",
    desc: "AI triage, duplicate cluster detection, and full lifecycle tracking from citizen report to verified resolution.",
    href: "/incidents",
    accentClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    linkLabel: "View Incidents →",
    linkClass: "text-amber-400",
  },
  {
    icon: Eye,
    title: "Missing Person Case Mgmt.",
    desc: "Privacy-governed case management with dynamic search perimeters, vetted volunteer tasking, and protected child profiles.",
    href: "/missing-persons",
    accentClass: "text-orange-400",
    bgClass: "bg-orange-500/10 border-orange-500/20",
    linkLabel: "Case Management →",
    linkClass: "text-orange-400",
  },
  {
    icon: Users,
    title: "Crowd Density Monitoring",
    desc: "Optical capacity monitoring across gates and stages. Auto-triggers warnings at 85% density threshold.",
    href: "/crowd-monitoring",
    accentClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    linkLabel: "Monitor Zones →",
    linkClass: "text-amber-400",
  },
  {
    icon: Compass,
    title: "Safe Journey Companion",
    desc: "Route deviation detection for women and commuters. \"Are you safe?\" prompt with instant police intercept.",
    href: "/safe-journey",
    accentClass: "text-sky-400",
    bgClass: "bg-sky-500/10 border-sky-500/20",
    linkLabel: "Safe Journey →",
    linkClass: "text-sky-400",
  },
  {
    icon: Cpu,
    title: "AI Incident Classification",
    desc: "Triage reports in English, Hindi, and Marathi. Urgency scoring, entity extraction, and spatial correlation.",
    href: "/analytics",
    accentClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10 border-indigo-500/20",
    linkLabel: "Analytics →",
    linkClass: "text-indigo-400",
  },
];

const WORKFLOW_STEPS = [
  { num: "01", stage: "Report",   title: "Citizen Intake",        desc: "30-second reporting with optional anonymity across 3 languages." },
  { num: "02", stage: "Triage",   title: "AI Intelligence",       desc: "Urgency scoring, entity extraction, duplicate cluster detection." },
  { num: "03", stage: "Dispatch", title: "SOC Unit Deployment",   desc: "Command room confirms triage and tasks the nearest suitable unit." },
  { num: "04", stage: "Resolve",  title: "Verified Resolution",   desc: "Field personnel update status and log a full chronological audit trail." },
];

export default function LandingPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0d1526] overflow-hidden">
      {/* Page-level circuit grid overlay */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,49,81,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,49,81,0.20)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-sky-500/5 via-transparent to-transparent rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/4 via-transparent to-transparent rounded-full" />
      </div>

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#172338] border border-[#2a4166] text-[11px] font-mono mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[#94a3b8] font-semibold tracking-wider">BUILD-X 2026</span>
            <span className="text-[#1e3151]">|</span>
            <span className="text-sky-400 font-bold tracking-widest uppercase">Security Management Track</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
            SENTINEL
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#38bdf8] mt-2 leading-tight">
            Smart Security &amp; Emergency<br className="hidden sm:block" /> Coordination Platform
          </p>

          <p className="mt-6 text-[15px] text-[#94a3b8] max-w-2xl leading-relaxed">
            One unified platform connecting citizens, security personnel, volunteers, and control rooms for rapid incident coordination, crowd monitoring, and privacy-protected missing person assistance.
          </p>

          {/* CTA Row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/command-center"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              <Radio className="w-4 h-4" />
              Launch Command Center
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] hover:text-white border border-[#1e3151] hover:border-[#2a4166] font-medium text-sm transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Report Incident
            </button>

            <button
              onClick={() => setIsSosOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider border border-red-500 transition-all shadow-sm active:scale-95"
            >
              <AlertOctagon className="w-4 h-4" />
              SOS Emergency
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { icon: CheckCircle2, text: "16 verified API endpoints", color: "text-emerald-400" },
              { icon: Shield,       text: "Privacy-first design",       color: "text-sky-400"    },
              { icon: Cpu,          text: "AI incident triage",          color: "text-indigo-400" },
              { icon: Server,       text: "SQLite + Prisma ORM",         color: "text-[#94a3b8]"  },
            ].map(({ icon: Icon, text, color }) => (
              <span key={text} className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Live SOC Console Preview ── */}
        <div className="mt-14 rounded-2xl bg-[#111d30] border border-[#1e3151] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center justify-between bg-[#090f1e] px-5 py-2.5 border-b border-[#1e3151]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1e3151]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1e3151]" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="font-mono text-[11px] text-[#475569] font-semibold tracking-wider">
                SENTINEL SOC CONSOLE &bull; SECTOR 4 ACTIVE
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#475569]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              GPS &bull; OPTICAL &bull; AI DEDUP &bull; SECURE LINK
            </div>
          </div>

          {/* Top metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#1e3151] text-left">
            {[
              { label: "Active Incidents",       value: "3 Under Investigation",  valueClass: "text-white"     },
              { label: "Crowd Surge Alert",      value: "Exit Gate B — 88%",      valueClass: "text-amber-400" },
              { label: "Missing Persons Search", value: "1 Grid Active (850m)",   valueClass: "text-orange-400"},
              { label: "Response Unit Coverage", value: "5 Units Deployed",       valueClass: "text-emerald-400"},
            ].map(({ label, value, valueClass }) => (
              <div key={label} className="px-5 py-3.5 bg-[#172338]/40">
                <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">{label}</p>
                <p className={`text-[14px] font-bold mt-0.5 ${valueClass}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Live feed rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1e3151] text-left">
            {[
              {
                id: "INC-2026-001", idClass: "text-red-400",
                badge: "CRITICAL", badgeClass: "bg-red-500/10 text-red-400 border-red-500/25",
                title: "South Exit Gate B — Crowd Surge",
                meta: "Bravo Crowd Dispersion Squad — On Scene",
                leftBorder: "border-l-2 border-red-500",
              },
              {
                id: "MP-2026-042", idClass: "text-orange-400",
                badge: "ACTIVE SEARCH", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
                title: "Aarav Patel (6yo) — North Lawn",
                meta: "850m radius grid assigned to K9 Delta Unit",
                leftBorder: "border-l-2 border-amber-500",
              },
              {
                id: "SJ-ACTIVE", idClass: "text-emerald-400",
                badge: "MONITORED", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
                title: "Safe Journey — Priya Sharma",
                meta: "Telemetry active • Deviation sensor primed",
                leftBorder: "border-l-2 border-emerald-500",
              },
            ].map((item) => (
              <div key={item.id} className={`bg-[#111d30] p-4 ${item.leftBorder}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-[11px] font-bold ${item.idClass}`}>{item.id}</span>
                  <span className={`badge ${item.badgeClass} border`}>{item.badge}</span>
                </div>
                <p className="text-[13px] font-semibold text-white">{item.title}</p>
                <p className="text-[11px] text-[#64748b] mt-1">{item.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ CAPABILITIES GRID ═══════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1e3151]">
        <div className="mb-10">
          <p className="section-label mb-2">Platform Capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Complete Security Operations
          </h2>
          <p className="text-[14px] text-[#64748b] mt-2 max-w-2xl">
            Every module addresses a distinct vulnerability in public safety, backed by real API endpoints, a live SQLite database, and verified business logic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.href}
                className="group relative flex flex-col bg-[#111d30] border border-[#1e3151] rounded-xl p-5 hover:border-[#2a4166] transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-4 ${mod.bgClass}`}>
                  <Icon className={`w-5 h-5 ${mod.accentClass}`} />
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-1.5">{mod.title}</h3>
                <p className="text-[12px] text-[#64748b] leading-relaxed flex-1">{mod.desc}</p>
                <Link
                  href={mod.href}
                  className={`inline-flex items-center gap-1 text-[12px] font-semibold mt-4 ${mod.linkClass} opacity-70 group-hover:opacity-100 transition-opacity`}
                >
                  {mod.linkLabel}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════ WORKFLOW STRIP ═══════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1e3151]">
        <div className="mb-10">
          <p className="section-label mb-2">Operational Protocol</p>
          <h2 className="text-2xl font-bold text-white">End-to-End Incident Lifecycle</h2>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a4166] to-transparent pointer-events-none" />

          {WORKFLOW_STEPS.map((step) => (
            <div key={step.num} className="relative bg-[#111d30] border border-[#1e3151] rounded-xl p-5 text-left">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/25 flex items-center justify-center font-mono text-[11px] font-bold text-[#38bdf8]">
                  {step.num}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#475569] uppercase tracking-widest">
                  {step.stage}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-[12px] text-[#64748b] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════ PRIVACY FOOTER STRIP ═══════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#1e3151]">
        <div className="bg-[#111d30] border border-[#1e3151] rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-semibold text-white">Strict Data Privacy Protocol</h3>
                <span className="badge badge-active">Child-Safe</span>
              </div>
              <p className="text-[12px] text-[#64748b] leading-relaxed max-w-2xl">
                SENTINEL never exposes child photos, identifying marks, or guardian contacts publicly. Only authorized officers and vetted volunteers receive controlled dossiers. All sightings require validation before field dispatch.
              </p>
            </div>
          </div>
          <Link
            href="/command-center"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-sm shadow-md transition-all whitespace-nowrap"
          >
            <Radio className="w-4 h-4" />
            Launch Command Center
          </Link>
        </div>
      </section>

      {/* Modals */}
      <QuickReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}