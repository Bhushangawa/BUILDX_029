"use client";

import dynamic from "next/dynamic";
import React from "react";

const DynamicSecurityMap = dynamic(() => import("./SecurityMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium">Initializing Sentinel Tactical Security Map...</p>
    </div>
  ),
});

export default function MapWrapper(props: any) {
  return <DynamicSecurityMap {...props} />;
}