"use client";

import React, { useState, useEffect } from "react";
import {
  Shield, CheckCircle, AlertTriangle, Radio,
  MapPin, Clock, RefreshCw, FileCheck, UserCheck,
} from "lucide-react";

const STATUS_STEPS = ["REPORTED", "VERIFIED", "ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"];

export default function ResponderPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [incRes, tmRes] = await Promise.all([fetch("/api/incidents"), fetch("/api/response-teams")]);
      const [incData, tmData] = await Promise.all([incRes.json(), tmRes.json()]);
      if (tmData.teams?.length > 0) setTeam(tmData.teams[0]);
      if (incData.incidents) setIncidents(incData.incidents);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (incidentId: string, status: string, note?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actorName: "Inspector Rajesh Rathore", actorRole: "SECURITY_STAFF", note }),
      });
      const data = await res.json();
      if (data.success) await fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setIsUpdating(false); }
  };

  const assignedIncidents = incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 min-h-screen">

      {/* Header */}
      <div className="bg-[#111d30] border border-[#1e3151] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-white">Field Responder Operations Terminal</h1>
              <p className="text-[12px] text-[#64748b] mt-0.5">
                Insp. Rajesh Rathore (SEC-091) &bull; Unit:{" "}
                <span className="text-emerald-400 font-medium">{team?.name || "Alpha Rapid Patrol"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              CH-04 (154.2 MHz)
            </span>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] border border-[#1e3151] text-[#64748b] hover:text-white transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Team Status Strip */}
        {team && (
          <div className="mt-4 pt-4 border-t border-[#1e3151] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Unit Type",     value: team.type,            valueClass: "text-white"        },
              { label: "Current Status", value: team.status,          valueClass: "text-emerald-400"  },
              { label: "Active Tasks",  value: `${assignedIncidents.length} incidents`, valueClass: "text-amber-400" },
              { label: "Radio Channel", value: team.contactRadio || "CH-04", valueClass: "text-sky-400" },
            ].map(({ label, value, valueClass }) => (
              <div key={label} className="bg-[#0a1120] border border-[#1e3151] rounded-lg p-2.5">
                <span className="section-label block mb-0.5">{label}</span>
                <span className={`text-[12px] font-semibold ${valueClass}`}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-label">Assigned Tasks ({assignedIncidents.length})</h2>
          {assignedIncidents.length > 0 && (
            <span className="text-[11px] text-[#64748b]">Tap action buttons to update field status</span>
          )}
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 rounded-xl skeleton" />)
        ) : assignedIncidents.length === 0 ? (
          <div className="py-16 text-center bg-[#111d30] border border-[#1e3151] rounded-xl">
            <CheckCircle className="w-10 h-10 text-emerald-400/30 mx-auto mb-2" />
            <p className="text-[13px] font-medium text-white">No active incidents assigned</p>
            <p className="text-[12px] text-[#475569] mt-1">Your sector is reporting clear status</p>
          </div>
        ) : (
          assignedIncidents.map((inc) => {
            const isCritical = inc.priority === "CRITICAL";
            const currentStepIdx = STATUS_STEPS.indexOf(inc.status);

            return (
              <div
                key={inc.id}
                className={`bg-[#111d30] rounded-xl border text-left space-y-3 overflow-hidden ${
                  isCritical ? "border-red-500/35" : "border-[#1e3151]"
                }`}
              >
                {/* Card Header */}
                <div className="px-5 pt-4 pb-3 border-b border-[#1e3151]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-sky-400">{inc.incidentNumber}</span>
                      <span className={`badge ${isCritical ? "badge-critical" : "badge-high"}`}>{inc.priority}</span>
                      <span className="badge badge-medium">{inc.category.replace(/_/g, " ")}</span>
                    </div>
                    <span className={`badge ${inc.status === "IN_PROGRESS" ? "badge-active" : "badge-pending"}`}>
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-white">{inc.title}</h3>
                </div>

                <div className="px-5 space-y-3">
                  {/* Description */}
                  <p className="text-[12px] text-[#94a3b8] bg-[#0a1120] p-3 rounded-lg border border-[#1e3151] leading-relaxed">
                    {inc.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span><strong className="text-[#94a3b8]">{inc.locationName}</strong> &bull; {inc.latitude?.toFixed(4)}, {inc.longitude?.toFixed(4)}</span>
                  </div>

                  {/* Progress Steps */}
                  <div>
                    <span className="section-label block mb-1.5">Status Progression</span>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {STATUS_STEPS.map((st, idx) => {
                        const isPast    = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <span
                            key={st}
                            className={`text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap font-semibold ${
                              isCurrent ? "bg-sky-500 text-white" :
                              isPast    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                              "bg-[#0a1120] text-[#334155] border border-[#1e3151]"
                            }`}
                          >
                            {st}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-[#0a1120] border-t border-[#1e3151]">
                  <span className="text-[11px] text-[#475569] font-mono uppercase tracking-wider mr-1">Field Actions:</span>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "ACKNOWLEDGED", "Officer acknowledged dispatch via terminal.")}
                    disabled={isUpdating || ["ACKNOWLEDGED","IN_PROGRESS","RESOLVED"].includes(inc.status)}
                    className="px-3 py-1.5 rounded-lg bg-[#172338] hover:bg-[#1c2e4a] border border-[#1e3151] text-[#94a3b8] hover:text-white text-[11px] font-semibold disabled:opacity-35 transition-all"
                  >
                    1. Acknowledge
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "IN_PROGRESS", "Patrol team has arrived on scene.")}
                    disabled={isUpdating || inc.status === "IN_PROGRESS" || inc.status === "RESOLVED"}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 hover:text-white text-[11px] font-semibold disabled:opacity-35 transition-all"
                  >
                    2. Arrived On Scene
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(inc.id, "RESOLVED", "Incident safely resolved by patrol team.")}
                    disabled={isUpdating || inc.status === "RESOLVED"}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold disabled:opacity-35 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    3. Mark Resolved
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