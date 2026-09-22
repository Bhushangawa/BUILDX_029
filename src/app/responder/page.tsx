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

      // Assume active responder belongs to Team Alpha or first assigned unit
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Field Responder & Tactical Staff Portal
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong className="text-slate-200">Inspector Rajesh Rathore (SEC-091)</strong> &bull; Unit: <strong className="text-emerald-400">{team?.name || "Alpha Rapid Patrol"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Radio: CH-04 (154.2 MHz)</span>
          </span>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responder Action Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Assigned Tactical Incidents ({assignedIncidents.length})
        </h2>

        {assignedIncidents.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No active incidents assigned to your patrol unit. Patrol status normal.
          </div>
        ) : (
          assignedIncidents.map((inc) => {
            const isCritical = inc.priority === "CRITICAL";

            return (
              <div
                key={inc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-sky-400">
                      {inc.incidentNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {inc.priority} Priority
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {inc.category}
                    </span>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    Status: {inc.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{inc.title}</h3>
                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {inc.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Target Location: <strong className="text-slate-200">{inc.locationName}</strong> (Coordinates: {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)})</span>
                </div>

                {/* Workflow Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-slate-400 mr-2 font-semibold">Update Field Status:</span>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "ACKNOWLEDGED", "Officer acknowledged tasking via mobile terminal.")}
                    disabled={isUpdating || ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].includes(inc.status)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40"
                  >
                    1. Acknowledge Dispatch
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "IN_PROGRESS", "Patrol team has arrived on scene and secured perimeter.")}
                    disabled={isUpdating || inc.status === "IN_PROGRESS" || inc.status === "RESOLVED"}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold disabled:opacity-40 shadow-sm"
                  >
                    2. Arrived On Scene
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "RESOLVED", "Threat neutralized / case safely resolved by security team.")}
                    disabled={isUpdating || inc.status === "RESOLVED"}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 shadow-sm flex items-center gap-1.5"
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