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

    // Dark sleek OpenStreetMap tiles (CartoDB Dark Matter)
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
      let pinColor = "#38bdf8"; // default blue
      let badgeLabel: string = item.type;
      let isPulsing = false;

      switch (item.type) {
        case "INCIDENT_CRITICAL":
          pinColor = "#ef4444"; // RED
          badgeLabel = "CRITICAL";
          isPulsing = true;
          break;
        case "INCIDENT":
          pinColor = item.priority === "HIGH" ? "#f97316" : "#eab308";
          badgeLabel = "INCIDENT";
          break;
        case "MISSING_PERSON":
          pinColor = "#f97316"; // ORANGE
          badgeLabel = "MISSING";
          isPulsing = true;
          break;
        case "CROWD_ZONE":
          pinColor = "#eab308"; // YELLOW
          badgeLabel = "CROWD";
          break;
        case "HELP_DESK":
          pinColor = "#3b82f6"; // BLUE
          badgeLabel = "HELP DESK";
          break;
        case "RESPONSE_TEAM":
          pinColor = "#10b981"; // GREEN
          badgeLabel = "TEAM";
          break;
        case "RESTRICTED":
          pinColor = "#a855f7"; // PURPLE
          badgeLabel = "RESTRICTED";
          break;
      }

      // Custom HTML Marker with SVG icon and beacon
      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer;">
            ${isPulsing ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: ${pinColor}; opacity: 0.35; animation: pulse-ring 2s infinite;"></div>` : ""}
            <div style="
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              background-color: ${pinColor}; 
              border: 2.5px solid #ffffff; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.4); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: 700; 
              font-size: 13px;
              transform: ${selectedId === item.id ? "scale(1.25)" : "scale(1.0)"};
              transition: transform 0.2s;
            ">
              ${item.type === "RESPONSE_TEAM" ? "T" : item.type === "MISSING_PERSON" ? "M" : item.type === "CROWD_ZONE" ? "C" : "!"}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      // Search radius or crowd radius circle overlay
      if (item.radiusMeters && item.radiusMeters > 0) {
        const circle = L.circle([item.lat, item.lng], {
          radius: item.radiusMeters,
          color: pinColor,
          fillColor: pinColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: item.type === "MISSING_PERSON" ? "4, 6" : undefined,
        });
        circle.addTo(layerGroupRef.current!);
      }

      // Leaflet Popup
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: ${pinColor}; color: white;">
              ${badgeLabel}
            </span>
            ${item.status ? `<span style="font-size: 11px; color: #94a3b8; font-weight: 600;">${item.status}</span>` : ""}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #f8fafc; margin-bottom: 4px;">
            ${item.title}
          </div>
          ${item.assignedTeam ? `<div style="font-size: 11px; color: #38bdf8; margin-bottom: 4px;">Assigned: ${item.assignedTeam}</div>` : ""}
          ${item.radiusMeters ? `<div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">Radius: ${item.radiusMeters}m</div>` : ""}
          <div style="font-size: 10px; color: #94a3b8;">Click marker to inspect full dossier</div>
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
    <div className="relative w-full h-full min-h-[450px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2.5 rounded-lg border border-slate-700/60 shadow-xl text-xs space-y-1.5 pointer-events-auto">
        <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider mb-1">Live Map Legend</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
          <span>Red: Critical / Emergency SOS</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
          <span>Orange: Missing Person (Radius)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
          <span>Yellow: Crowd Alert Zone</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
          <span>Blue: Help Desk & Police Hub</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span>Green: Response Patrol Team</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
          <span>Purple: Restricted Perimeter</span>
        </div>
      </div>
    </div>
  );
}