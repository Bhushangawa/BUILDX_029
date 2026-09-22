"use client";

import React, { useState, useEffect } from "react";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import DemoTourBar from "@/components/demo/DemoTourBar";
import QuickReportModal from "@/components/incident/QuickReportModal";
import SosModal from "@/components/incident/SosModal";
import { Language, UserRole } from "@/lib/types";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Language>("en");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("sentinel_lang") as Language;
    if (savedLang) setLang(savedLang);

    // Fetch active session role
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeRole) setRole(data.activeRole);
      })
      .catch(() => {});
  }, []);

  return (
    <html lang={lang} className="dark">
      <head>
        <title>SENTINEL — Smart Security &amp; Emergency Coordination Platform</title>
        <meta
          name="description"
          content="AI-assisted smart security, crowd control, missing-person coordination, and emergency response platform for events and modern cities."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0d1526] text-soc-textPrimary flex flex-col antialiased selection:bg-sky-500/30 selection:text-white">
        <Navbar
          currentLang={lang}
          onLanguageChange={setLang}
          activeRole={role}
          onRoleChange={setRole}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenSos={() => setIsSosOpen(true)}
        />

        <main className="flex-1 pb-24">{children}</main>

        <DemoTourBar onStepCompleted={() => {}} />

        <QuickReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />

        <SosModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
        />
      </body>
    </html>
  );
}