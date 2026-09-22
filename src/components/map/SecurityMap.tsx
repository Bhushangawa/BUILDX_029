"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MarkerItem {
  id: string;
  type: "INCIDENT_CRITICAL" | "INCIDENT" | "MISSING_PERSON" | "CROWD_ZONE" | "HELP_DESK" | "RESPONSE_TEAM" | "RESTRICTED";
  title: string;
  lat: number;
  lng: number;
  priority?: string;
  category?: string;
  status?: string;
  assignedTeam?: string;
  radiusMeters?: number;
  data: any;
}

interface SecurityMapProps {
  markers: MarkerItem[];
  selectedId?: string | null;
  onSelectMarker: (marker: MarkerItem) => void;
  center?: [number, number];
  zoom?: number;
  activeFilter?: string;
}

export default function SecurityMap({
  markers,
  selectedId,
  onSelectMarker,
  center = [19.0760, 72.8777],
  zoom = 15,
  activeFilter = "ALL",
}: SecurityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // High-contrast clean dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const filteredMarkers = markers.filter((m) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "INCIDENTS") return m.type.startsWith("INCIDENT");
      if (activeFilter === "MISSING") return m.type === "MISSING_PERSON";
      if (activeFilter === "CROWD") return m.type === "CROWD_ZONE";
      if (activeFilter === "TEAMS") return m.type === "RESPONSE_TEAM";
      if (activeFilter === "HELP_DESK") return m.type === "HELP_DESK";
      return true;
    });

    filteredMarkers.forEach((item) => {
      let pinColor = "#0284c7"; // default blue
      let badgeLabel: string = item.type;
      let isCriticalPulse = false;

      switch (item.type) {
        case "INCIDENT_CRITICAL":
          pinColor = "#ef4444"; // RED
          badgeLabel = "CRITICAL";
          isCriticalPulse = true;
          break;
        case "INCIDENT":
          pinColor = item.priority === "HIGH" ? "#f59e0b" : "#0ea5e9";
          badgeLabel = item.priority === "HIGH" ? "HIGH" : "INCIDENT";
          break;
        case "MISSING_PERSON":
          pinColor = "#ea580c"; // ORANGE
          badgeLabel = "MISSING";
          break;
        case "CROWD_ZONE":
          pinColor = "#d97706"; // AMBER
          badgeLabel = "CROWD ZONE";
          break;
        case "HELP_DESK":
          pinColor = "#0284c7"; // BLUE
          badgeLabel = "HELP DESK";
          break;
        case "RESPONSE_TEAM":
          pinColor = "#10b981"; // GREEN
          badgeLabel = "UNIT";
          break;
        case "RESTRICTED":
          pinColor = "#9333ea"; // PURPLE
          badgeLabel = "RESTRICTED";
          break;
      }

      const isSelected = selectedId === item.id;

      // Professional Tactical SVG Marker
      const customIcon = L.divIcon({
        className: "tactical-map-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; cursor: pointer;">
            ${isCriticalPulse ? `<div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.25); border: 1px solid #ef4444; animation: beacon-subtle 2s infinite;"></div>` : ""}
            <div style="
              width: 26px; 
              height: 26px; 
              border-radius: 6px; 
              background-color: ${pinColor}; 
              border: 2px solid ${isSelected ? "#38bdf8" : "#ffffff"}; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.5); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
              font-weight: 700; 
              font-size: 11px;
              transform: ${isSelected ? "scale(1.2)" : "scale(1.0)"};
              transition: transform 0.15s ease;
            ">
              ${item.type === "RESPONSE_TEAM" ? "U" : item.type === "MISSING_PERSON" ? "M" : item.type === "CROWD_ZONE" ? "C" : "!"}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      // Search perimeter or crowd zone boundary
      if (item.radiusMeters && item.radiusMeters > 0) {
        const circle = L.circle([item.lat, item.lng], {
          radius: item.radiusMeters,
          color: pinColor,
          fillColor: pinColor,
          fillOpacity: 0.10,
          weight: 1.5,
          dashArray: item.type === "MISSING_PERSON" ? "4, 4" : undefined,
        });
        circle.addTo(layerGroupRef.current!);
      }

      // High-density operational popup
      const popupHtml = `
        <div style="font-family: inherit; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #243656;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: ${pinColor}; color: white;">
              ${badgeLabel}
            </span>
            ${item.status ? `<span style="font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">${item.status}</span>` : ""}
          </div>
          <div style="font-weight: 600; font-size: 12px; color: #f8fafc; margin-bottom: 4px; line-height: 1.3;">
            ${item.title}
          </div>
          ${item.assignedTeam ? `<div style="font-size: 11px; color: #38bdf8; margin-bottom: 3px;">Unit: <strong>${item.assignedTeam}</strong></div>` : ""}
          ${item.radiusMeters ? `<div style="font-size: 11px; color: #cbd5e1; margin-bottom: 5px;">Perimeter: ${item.radiusMeters}m radius</div>` : ""}
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px dashed #243656; padding-top: 4px;">
            Click pin to inspect operational dossier
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelectMarker(item);
      });

      marker.addTo(layerGroupRef.current!);
    });
  }, [markers, selectedId, activeFilter, onSelectMarker]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-lg overflow-hidden border border-[#243656] bg-[#0c1322] shadow-lg">
      {/* Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top HUD Coordinates Badge */}
      <div className="absolute top-2.5 left-2.5 z-[1000] bg-[#0f172a]/95 backdrop-blur-sm px-2.5 py-1 rounded border border-[#243656] text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></span>
        <span>GRID: 19.0760° N, 72.8777° E &bull; SECTOR METRO-HUB</span>
      </div>

      {/* Disciplined Legend Overlay */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-[#0f172a]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#243656] text-[11px] space-y-1 pointer-events-auto shadow-md">
        <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider mb-1 pb-1 border-b border-[#243656]">
          Tactical Layer Key
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 flex-shrink-0"></span>
          <span>Critical Emergency / SOS</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ea580c] flex-shrink-0"></span>
          <span>Missing Person (Search Radius)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#d97706] flex-shrink-0"></span>
          <span>Crowd Surge Alert Zone</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7] flex-shrink-0"></span>
          <span>Police / Help Desk Hub</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0"></span>
          <span>Response Unit Patrol</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#9333ea] flex-shrink-0"></span>
          <span>Restricted Perimeter</span>
        </div>
      </div>
    </div>
  );
}