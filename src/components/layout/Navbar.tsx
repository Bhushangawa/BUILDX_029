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

  // Sync state
  useEffect(() => {
    setLang(currentLang);
  }, [currentLang]);

  useEffect(() => {
    setRole(activeRole);
  }, [activeRole]);

  // Fetch notifications
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
    { href: "/command-center", label: t.nav.commandCenter, icon: Radio, roleAccess: ["ADMIN", "SECURITY_STAFF"] },
    { href: "/incidents", label: t.nav.incidents, icon: AlertTriangle, roleAccess: ["ALL"] },
    { href: "/missing-persons", label: t.nav.missingPersons, icon: Eye, roleAccess: ["ALL"] },
    { href: "/crowd-monitoring", label: t.nav.crowd, icon: Users, roleAccess: ["ALL"] },
    { href: "/safe-journey", label: t.nav.safeJourney, icon: Compass, roleAccess: ["ALL"] },
    { href: "/responder", label: t.nav.responder, icon: Shield, roleAccess: ["SECURITY_STAFF", "ADMIN"] },
    { href: "/volunteer", label: t.nav.volunteer, icon: Activity, roleAccess: ["VOLUNTEER", "ADMIN"] },
    { href: "/analytics", label: t.nav.analytics, icon: Activity, roleAccess: ["ADMIN"] },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Demo Bar for Judges */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-1.5 border-b border-indigo-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            BUILD-X Hackathon Preview
          </span>
          <span className="text-slate-400 hidden sm:inline">Active Testing Role:</span>
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded border border-slate-700/80">
            {(["CITIZEN", "VOLUNTEER", "SECURITY_STAFF", "ADMIN"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={`px-2 py-0.5 rounded font-medium transition-all text-[11px] ${
                  role === r
                    ? "bg-sky-500 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r === "CITIZEN" ? "Citizen" : r === "VOLUNTEER" ? "Volunteer" : r === "SECURITY_STAFF" ? "Security Staff" : "Admin / Control"}
              </button>
            ))}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded border border-slate-700/80">
            {(["en", "hi", "mr"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLangSelect(l)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  lang === l
                    ? "bg-emerald-500 text-white font-semibold"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-800 text-sky-400 border border-slate-700 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Incident Report */}
          <button
            onClick={onOpenReport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.hero.reportBtn}</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSos}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/30 hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>SOS</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[2000] p-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="font-bold text-slate-200">Alert Center ({alerts.length})</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {alerts.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No active notifications</p>
                  ) : (
                    alerts.slice(0, 6).map((a) => (
                      <div
                        key={a.id}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          a.priority === "CRITICAL"
                            ? "bg-red-950/40 border-red-800/60 text-red-200"
                            : a.priority === "HIGH"
                            ? "bg-amber-950/40 border-amber-800/60 text-amber-200"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{a.title}</span>
                          <span className="text-[10px] opacity-75 font-mono">
                            {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] mt-1 line-clamp-2 text-slate-300">{a.message}</p>
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