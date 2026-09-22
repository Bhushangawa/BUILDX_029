"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  Radio,
  Users,
  Eye,
  Activity,
  MapPin,
  Bell,
  Globe,
  Sliders,
  CheckCircle2,
  X,
  Compass,
  AlertOctagon,
  ChevronDown,
} from "lucide-react";
import { translations } from "@/lib/translations";
import { Language, UserRole } from "@/lib/types";

interface NavbarProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  activeRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenSos?: () => void;
  onOpenReport?: () => void;
}

export default function Navbar({
  currentLang = "en",
  onLanguageChange,
  activeRole = "ADMIN",
  onRoleChange,
  onOpenSos,
  onOpenReport,
}: NavbarProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>(currentLang);
  const [role, setRole] = useState<UserRole>(activeRole);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    setLang(currentLang);
  }, [currentLang]);

  useEffect(() => {
    setRole(activeRole);
  }, [activeRole]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLangSelect = (newLang: Language) => {
    setLang(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
    localStorage.setItem("sentinel_lang", newLang);
  };

  const handleRoleSelect = async (newRole: UserRole) => {
    setRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    window.location.reload();
  };

  const navItems = [
    { href: "/command-center", label: t.nav.commandCenter, icon: Radio },
    { href: "/incidents", label: t.nav.incidents, icon: AlertTriangle },
    { href: "/missing-persons", label: t.nav.missingPersons, icon: Eye },
    { href: "/crowd-monitoring", label: t.nav.crowd, icon: Users },
    { href: "/safe-journey", label: t.nav.safeJourney, icon: Compass },
    { href: "/responder", label: t.nav.responder, icon: Shield },
    { href: "/volunteer", label: t.nav.volunteer, icon: Activity },
    { href: "/analytics", label: t.nav.analytics, icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-[#243656] text-slate-100 shadow-lg shadow-black/20">
      {/* Top Tactical Status Bar */}
      <div className="bg-[#0a0f1d] border-b border-[#1e2d48] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Switcher with clear badge styling */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#38bdf8] font-mono text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
            <span>SIMULATION PERSPECTIVE:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#16233b] p-0.5 rounded border border-[#243656]">
            {(["CITIZEN", "VOLUNTEER", "SECURITY_STAFF", "ADMIN"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  role === r
                    ? "bg-[#0ea5e9] text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r === "CITIZEN" ? "Citizen" : r === "VOLUNTEER" ? "Volunteer" : r === "SECURITY_STAFF" ? "Security Staff" : "Admin / SOC"}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Language Selector & Live Link Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>SECURE GATEWAY &bull; 24/7 ACTIVE</span>
          </div>

          <div className="flex items-center gap-1 bg-[#16233b] p-0.5 rounded border border-[#243656]">
            <Globe className="w-3 h-3 text-slate-400 ml-1" />
            {(["en", "hi", "mr"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLangSelect(l)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  lang === l
                    ? "bg-[#243656] text-[#38bdf8] font-bold border border-[#38bdf8]/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#16233b] border border-[#243656] flex items-center justify-center text-[#38bdf8] group-hover:border-[#0ea5e9] transition-all">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">
                SENTINEL
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.2 rounded bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/30">
                SOC v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Smart Security Operations & Coordination
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#1e2d48] text-[#38bdf8] font-semibold border-b-2 border-[#0ea5e9]"
                    : "text-slate-300 hover:text-white hover:bg-[#16233b]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Strip */}
        <div className="flex items-center gap-2.5">
          {/* Quick Report Button */}
          <button
            onClick={onOpenReport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-200 border border-[#243656] text-xs font-medium transition-all hover:border-slate-500"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Report</span>
          </button>

          {/* Emergency SOS Button (Disciplined, authoritative) */}
          <button
            onClick={onOpenSos}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm border border-red-500 hover:scale-[1.02] active:scale-95"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>SOS EMERGENCY</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md bg-[#16233b] hover:bg-[#1e2d48] border border-[#243656] text-slate-300 hover:text-white transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111b2f] border border-[#243656] rounded-lg shadow-2xl z-[2000] p-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e2d48] mb-2">
                  <span className="font-bold text-slate-200">System Notifications ({alerts.length})</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {alerts.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No active notifications</p>
                  ) : (
                    alerts.slice(0, 6).map((a) => (
                      <div
                        key={a.id}
                        className={`p-2.5 rounded border text-left transition-all ${
                          a.priority === "CRITICAL"
                            ? "bg-red-950/30 border-red-800/60 text-red-200"
                            : a.priority === "HIGH"
                            ? "bg-amber-950/30 border-amber-800/60 text-amber-200"
                            : "bg-[#16233b] border-[#243656] text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{a.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 line-clamp-2 text-slate-300">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}