"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Send,
  UserCheck,
  RefreshCw,
  FileCheck,
} from "lucide-react";

export default function ResponderPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [incRes, tmRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/response-teams"),
      ]);
      const [incData, tmData] = await Promise.all([incRes.json(), tmRes.json()]);

      if (tmData.teams?.length > 0) {
        setTeam(tmData.teams[0]);
      }
      if (incData.incidents) {
        setIncidents(incData.incidents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (incidentId: string, status: string, note?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          actorName: "Inspector Rajesh Rathore",
          actorRole: "SECURITY_STAFF",
          note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const assignedIncidents = incidents.filter(
    (i) => i.status !== "RESOLVED" && i.status !== "CLOSED"
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 bg-[#0c1322] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111b2f] p-4 rounded-xl border border-[#243656] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              Field Responder & Tactical Operations Terminal
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Officer: <strong className="text-slate-200">Insp. Rajesh Rathore (SEC-091)</strong> &bull; Assigned Unit: <strong className="text-emerald-400">{team?.name || "Alpha Rapid Patrol"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs px-2.5 py-1 rounded bg-[#16233b] border border-[#243656] text-emerald-400 font-mono font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>CH-04 (154.2 MHz)</span>
          </span>
          <button
            onClick={fetchData}
            className="p-1.5 rounded-md bg-[#16233b] hover:bg-[#1e2d48] text-slate-300 hover:text-white border border-[#243656]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Queue */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Assigned Tasks ({assignedIncidents.length})
        </h2>

        {assignedIncidents.length === 0 ? (
          <div className="p-8 text-center bg-[#111b2f] rounded-xl border border-[#243656] text-slate-500 text-xs">
            No active incidents assigned to your patrol unit. Sector clear.
          </div>
        ) : (
          assignedIncidents.map((inc) => {
            const isCritical = inc.priority === "CRITICAL";

            return (
              <div
                key={inc.id}
                className="bg-[#111b2f] border border-[#243656] rounded-xl p-4 shadow-sm space-y-3 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">
                      {inc.incidentNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isCritical
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      {inc.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#16233b] text-slate-300 border border-[#243656]">
                      {inc.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                    Status: {inc.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                <p className="text-xs text-slate-300 bg-[#0c1322] p-2.5 rounded-md border border-[#243656] leading-relaxed">
                  {inc.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Location: <strong className="text-slate-200">{inc.locationName}</strong> ({inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)})</span>
                </div>

                {/* Workflow Buttons */}
                <div className="pt-2 border-t border-[#243656] flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 mr-2 font-semibold">Field Actions:</span>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "ACKNOWLEDGED", "Officer acknowledged dispatch via terminal.")}
                    disabled={isUpdating || ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].includes(inc.status)}
                    className="px-2.5 py-1 rounded bg-[#16233b] hover:bg-[#1e2d48] border border-[#243656] text-slate-200 text-xs font-semibold disabled:opacity-40"
                  >
                    1. Acknowledge Dispatch
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "IN_PROGRESS", "Patrol team has arrived on scene.")}
                    disabled={isUpdating || inc.status === "IN_PROGRESS" || inc.status === "RESOLVED"}
                    className="px-2.5 py-1 rounded bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold disabled:opacity-40 shadow-sm"
                  >
                    2. Arrived On Scene
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "RESOLVED", "Incident safely resolved by patrol team.")}
                    disabled={isUpdating || inc.status === "RESOLVED"}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 shadow-sm flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>3. Mark Resolved</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}