"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  Radio,
  Users,
  Eye,
  Activity,
  Compass,
  Bell,
  Globe,
  CheckCircle2,
  X,
  AlertOctagon,
  Menu,
  ChevronRight,
  LayoutDashboard,
  UserCheck,
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

const ROLE_META: Record<UserRole, { label: string; color: string; dot: string }> = {
  CITIZEN:        { label: "Citizen",        color: "text-sky-400",    dot: "bg-sky-400"    },
  VOLUNTEER:      { label: "Volunteer",      color: "text-emerald-400", dot: "bg-emerald-400" },
  SECURITY_STAFF: { label: "Security Staff", color: "text-amber-400",  dot: "bg-amber-400"  },
  ADMIN:          { label: "Admin / SOC",    color: "text-indigo-400", dot: "bg-indigo-400" },
};

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const t = translations[lang] || translations.en;

  useEffect(() => { setLang(currentLang); }, [currentLang]);
  useEffect(() => { setRole(activeRole); }, [activeRole]);

  // Close notification popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (_) {}
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
    { href: "/command-center",   label: t.nav.commandCenter,  icon: Radio         },
    { href: "/incidents",        label: t.nav.incidents,       icon: AlertTriangle },
    { href: "/missing-persons",  label: t.nav.missingPersons,  icon: Eye           },
    { href: "/crowd-monitoring", label: t.nav.crowd,           icon: Users         },
    { href: "/safe-journey",     label: t.nav.safeJourney,     icon: Compass       },
    { href: "/responder",        label: t.nav.responder,       icon: Shield        },
    { href: "/volunteer",        label: t.nav.volunteer,       icon: UserCheck     },
    { href: "/analytics",        label: t.nav.analytics,       icon: Activity      },
  ];

  const currentRoleMeta = ROLE_META[role];

  return (
    <>
      <header className="sticky top-0 z-50 text-slate-100">
        {/* ── Tactical Status Bar ─────────────────────────────── */}
        <div className="bg-[#090f1e] border-b border-[#1e3151] px-4 lg:px-8 py-1.5">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">

            {/* Role Switcher */}
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#475569] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                Perspective:
              </span>
              <div className="flex items-center bg-[#0d1526] border border-[#1e3151] rounded-md p-0.5 gap-0.5">
                {(["CITIZEN", "VOLUNTEER", "SECURITY_STAFF", "ADMIN"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all whitespace-nowrap ${
                      role === r
                        ? "bg-[#172338] text-[#38bdf8] font-semibold border border-[#2a4166]"
                        : "text-[#64748b] hover:text-[#94a3b8]"
                    }`}
                  >
                    {ROLE_META[r].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status indicators + Lang switcher */}
            <div className="flex items-center gap-3">
              {/* Live status */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-sm shadow-emerald-500/50" />
                <span className="uppercase tracking-wider">Secure Gateway Active</span>
              </div>

              {/* Language switcher */}
              <div className="flex items-center gap-0.5 bg-[#0d1526] border border-[#1e3151] rounded-md p-0.5">
                <Globe className="w-3 h-3 text-[#475569] mx-1" />
                {(["en", "hi", "mr"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangSelect(l)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      lang === l
                        ? "bg-[#172338] text-[#38bdf8] font-semibold border border-[#2a4166]"
                        : "text-[#64748b] hover:text-[#94a3b8]"
                    }`}
                  >
                    {l === "en" ? "EN" : l === "hi" ? "हिंदी" : "मराठी"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Bar ──────────────────────────────── */}
        <div className="bg-[#0d1526]/96 backdrop-blur-md border-b border-[#1e3151] shadow-lg shadow-black/30">
          <div className="max-w-[1700px] mx-auto px-4 lg:px-8 h-14 flex items-center gap-4">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 mr-2">
              <div className="relative w-8 h-8 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3151] to-[#172338] border border-[#2a4166] flex items-center justify-center group-hover:border-[#0ea5e9] transition-all duration-200">
                  <Shield className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#0d1526] border border-[#0d1526] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-[15px] tracking-wider text-white group-hover:text-[#38bdf8] transition-colors">
                    SENTINEL
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/25 tracking-wider">
                    SOC v2.4
                  </span>
                </div>
                <p className="text-[10px] text-[#475569] font-medium hidden lg:block leading-none">
                  Smart Security Operations &amp; Coordination
                </p>
              </div>
            </Link>

            {/* Navigation Links (desktop) */}
            <nav className="hidden xl:flex items-center flex-1 gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? "text-[#38bdf8] bg-[#0ea5e9]/10"
                        : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#172338]/60"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#38bdf8]" : "text-[#475569] group-hover:text-[#64748b]"}`} />
                    <span>{item.label}</span>
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#0ea5e9] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Strip */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Quick Report */}
              <button
                onClick={onOpenReport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#172338] hover:bg-[#1c2e4a] text-[#94a3b8] hover:text-white border border-[#1e3151] hover:border-[#2a4166] text-[12px] font-medium transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Quick Report</span>
              </button>

              {/* Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-md bg-[#172338] hover:bg-[#1c2e4a] border border-[#1e3151] hover:border-[#2a4166] text-[#64748b] hover:text-white transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111d30] border border-[#1e3151] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-[2000] animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3151] bg-[#0d1526]">
                      <span className="text-[13px] font-semibold text-white">
                        System Notifications
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#64748b]">{alerts.length} total</span>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded text-[#64748b] hover:text-white hover:bg-[#172338] transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#1e3151]/50">
                      {alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <CheckCircle2 className="w-8 h-8 text-[#1e3151] mx-auto mb-2" />
                          <p className="text-[12px] text-[#475569]">No active notifications</p>
                        </div>
                      ) : (
                        alerts.slice(0, 6).map((a) => (
                          <div
                            key={a.id}
                            className={`px-4 py-3 hover:bg-[#172338]/50 transition-colors ${
                              a.priority === "CRITICAL"
                                ? "border-l-2 border-red-500"
                                : a.priority === "HIGH"
                                ? "border-l-2 border-amber-500"
                                : "border-l-2 border-transparent"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[12px] font-semibold leading-tight ${
                                a.priority === "CRITICAL" ? "text-red-300" :
                                a.priority === "HIGH" ? "text-amber-300" : "text-white"
                              }`}>
                                {a.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#475569] flex-shrink-0 mt-0.5">
                                {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748b] mt-0.5 line-clamp-2 leading-relaxed">
                              {a.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency SOS */}
              <button
                onClick={onOpenSos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm border border-red-500 whitespace-nowrap"
              >
                <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">SOS</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="xl:hidden p-1.5 rounded-md bg-[#172338] border border-[#1e3151] text-[#64748b] hover:text-white transition-all"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-Over Drawer ──────────────────────────── */}
      {showMobileMenu && (
        <div className="xl:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-[#0d1526] border-r border-[#1e3151] shadow-2xl animate-slide-left h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3151] bg-[#090f1e]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#38bdf8]" />
                <span className="font-bold text-[15px] text-white tracking-wide">SENTINEL</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1.5 rounded-md text-[#64748b] hover:text-white hover:bg-[#172338] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/20"
                        : "text-[#64748b] hover:text-white hover:bg-[#172338]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#38bdf8]" : "text-[#475569]"}`} />
                      {item.label}
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#38bdf8]" />}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-t border-[#1e3151] space-y-2">
              <button
                onClick={() => { onOpenReport?.(); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#172338] border border-[#1e3151] text-[#94a3b8] text-[13px] font-medium hover:text-white hover:border-[#2a4166] transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Report Incident
              </button>
              <button
                onClick={() => { onOpenSos?.(); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[13px] transition-all"
              >
                <AlertOctagon className="w-4 h-4" />
                Emergency SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}