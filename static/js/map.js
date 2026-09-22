// SENTINEL Interactive Nagpur Security Map Controller

let leafletMap = null;
let activeTileLayer = null;
let markerLayerGroup = null;
let zoneLayerGroup = null;
let nagpurMapInitialized = false;

const NAGPUR_CENTER = [21.1458, 79.0882]; // Zero Mile Stone, Nagpur

const TILE_URLS = {
  DAY: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  NIGHT: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
};

function getMapTileUrl() {
  const isNight = document.body.classList.contains("night-vision") || localStorage.getItem("sentinel_theme") === "dark";
  return isNight ? TILE_URLS.NIGHT : TILE_URLS.DAY;
}

function setMapTheme(isNight) {
  if (!leafletMap) return;
  const targetUrl = isNight ? TILE_URLS.NIGHT : TILE_URLS.DAY;
  if (activeTileLayer) {
    leafletMap.removeLayer(activeTileLayer);
  }
  activeTileLayer = L.tileLayer(targetUrl, {
    maxZoom: 19,
    subdomains: "abcd",
    errorTileUrl: ""
  }).addTo(leafletMap);
  if (activeTileLayer.bringToBack) {
    activeTileLayer.bringToBack();
  }
}

const MARKER_COLORS = {
  CRITICAL: "#f43f5e",     // RED: Critical Emergency / SOS
  MISSING: "#f97316",      // ORANGE: Missing Person Case
  CROWD: "#eab308",        // YELLOW: Crowd Alert
  HELPDESK: "#3b82f6",     // BLUE: Help Desk
  TEAM: "#10b981",         // GREEN: Available Response Team
  RESTRICTED: "#a855f7"    // PURPLE: Restricted / High Risk Zone
};

function createSvgPin(color, label = "") {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="30" height="38">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" 
            fill="${color}" filter="url(#shadow)" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="5" fill="#ffffff" opacity="0.9"/>
      <circle cx="12" cy="11" r="2.5" fill="${color}"/>
    </svg>
  `;
}

function initNagpurMap(containerId = "nagpurMapContainer") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (typeof L !== "undefined") {
    // Leaflet is available!
    if (leafletMap) {
      leafletMap.invalidateSize();
      return;
    }

    try {
      leafletMap = L.map(containerId, {
        center: NAGPUR_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB tiles with Day/Night Vision support
      activeTileLayer = L.tileLayer(getMapTileUrl(), {
        maxZoom: 19,
        subdomains: "abcd",
        errorTileUrl: ""
      }).addTo(leafletMap);

      markerLayerGroup = L.layerGroup().addTo(leafletMap);
      zoneLayerGroup = L.layerGroup().addTo(leafletMap);
      nagpurMapInitialized = true;
      refreshMapData();
    } catch (err) {
      console.warn("Leaflet map initialization fallback triggered:", err);
      initCanvasFallbackMap(containerId);
    }
  } else {
    // Graceful offline fallback with custom Canvas rendering
    initCanvasFallbackMap(containerId);
  }
}

async function refreshMapData() {
  if (!leafletMap || !nagpurMapInitialized) return;

  markerLayerGroup.clearLayers();
  zoneLayerGroup.clearLayers();

  try {
    // 1. Fetch Incidents
    const incRes = await fetch("/api/incidents");
    const incData = await incRes.json();
    if (incData.incidents) {
      incData.incidents.forEach(inc => {
        let color = MARKER_COLORS.HELPDESK;
        if (inc.priority === "CRITICAL") color = MARKER_COLORS.CRITICAL;
        else if (inc.category === "Crowd Management") color = MARKER_COLORS.CROWD;
        else if (inc.priority === "HIGH") color = "#f97316";

        const icon = L.divIcon({
          html: createSvgPin(color),
          className: "custom-map-pin",
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          popupAnchor: [0, -38]
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon });
        const popupContent = `
          <div style="min-width: 220px; font-family: sans-serif;">
            <div style="font-size: 11px; font-weight: bold; color: ${color}; text-transform: uppercase;">${inc.category}</div>
            <h4 style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${inc.title}</h4>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">📍 ${inc.location_name}</div>
            <div style="display: flex; gap: 6px; font-size: 11px; margin-bottom: 8px;">
              <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Priority: ${inc.priority}</span>
              <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Status: ${inc.status}</span>
            </div>
            <button onclick="window.viewIncidentDetail('${inc.id}')" 
                    style="width: 100%; background: #0284c7; color: white; border: none; border-radius: 4px; padding: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
              Inspect Incident Details
            </button>
          </div>
        `;
        marker.bindPopup(popupContent);
        markerLayerGroup.addLayer(marker);
      });
    }

    // 2. Fetch Missing Persons
    const mpRes = await fetch("/api/missing-persons");
    const mpData = await mpRes.json();
    if (mpData.missing_persons) {
      mpData.missing_persons.forEach(mp => {
        const icon = L.divIcon({
          html: createSvgPin(MARKER_COLORS.MISSING),
          className: "custom-map-pin",
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          popupAnchor: [0, -38]
        });

        const marker = L.marker([mp.latitude, mp.longitude], { icon });
        // Search circle
        const circle = L.circle([mp.latitude, mp.longitude], {
          color: MARKER_COLORS.MISSING,
          fillColor: MARKER_COLORS.MISSING,
          fillOpacity: 0.15,
          radius: mp.search_radius_meters || 400
        });
        zoneLayerGroup.addLayer(circle);

        const popupContent = `
          <div style="min-width: 210px; font-family: sans-serif;">
            <div style="font-size: 11px; font-weight: bold; color: ${MARKER_COLORS.MISSING};">MISSING ${mp.person_type}</div>
            <h4 style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${mp.full_name}, Age ${mp.age}</h4>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">Last seen: ${mp.last_seen_location}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Clothing: ${mp.clothing_description}</div>
            <button onclick="window.viewMissingPersonDetail('${mp.id}')" 
                    style="width: 100%; background: #f97316; color: white; border: none; border-radius: 4px; padding: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
              Open Case File
            </button>
          </div>
        `;
        marker.bindPopup(popupContent);
        markerLayerGroup.addLayer(marker);
      });
    }

    // 3. Fetch Response Teams
    const teamRes = await fetch("/api/teams");
    const teamData = await teamRes.json();
    if (teamData.teams) {
      teamData.teams.forEach(t => {
        const color = t.status === "AVAILABLE" ? MARKER_COLORS.TEAM : "#64748b";
        const icon = L.divIcon({
          html: createSvgPin(color),
          className: "custom-map-pin",
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          popupAnchor: [0, -38]
        });

        const marker = L.marker([t.current_lat, t.current_lng], { icon });
        const popupContent = `
          <div style="min-width: 200px; font-family: sans-serif;">
            <div style="font-size: 11px; font-weight: bold; color: ${color};">RESPONSE TEAM (${t.status})</div>
            <h4 style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${t.name}</h4>
            <div style="font-size: 12px; color: #475569;">Leader: ${t.leader_name}</div>
            <div style="font-size: 12px; color: #475569;">📞 ${t.contact_phone}</div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markerLayerGroup.addLayer(marker);
      });
    }

    // 4. Fetch Crowd Zones
    const czRes = await fetch("/api/crowd-zones");
    const czData = await czRes.json();
    if (czData.crowd_zones) {
      czData.crowd_zones.forEach(z => {
        let zColor = MARKER_COLORS.CROWD;
        if (z.crowd_level === "CRITICAL") zColor = MARKER_COLORS.CRITICAL;
        else if (z.crowd_level === "LOW") zColor = MARKER_COLORS.TEAM;

        const circle = L.circle([z.latitude, z.longitude], {
          color: zColor,
          fillColor: zColor,
          fillOpacity: 0.22,
          radius: z.radius_meters || 200
        });

        const popupContent = `
          <div style="min-width: 200px; font-family: sans-serif;">
            <div style="font-size: 11px; font-weight: bold; color: ${zColor};">CROWD ZONE: ${z.crowd_level}</div>
            <h4 style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${z.zone_name}</h4>
            <div style="font-size: 12px; color: #475569;">Density: ${z.current_count} / ${z.capacity}</div>
            <div style="font-size: 12px; color: ${z.alert_status ? '#e11d48' : '#10b981'}; font-weight: bold; margin-top: 4px;">
              ${z.alert_status ? '⚠️ THRESHOLD EXCEEDED' : 'Normal Flow'}
            </div>
          </div>
        `;
        circle.bindPopup(popupContent);
        zoneLayerGroup.addLayer(circle);
      });
    }
  } catch (e) {
    console.error("Failed loading Nagpur map data:", e);
  }
}

// Fallback Canvas Map (Zero Network Dependency Guarantee)
function initCanvasFallbackMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div style="width: 100%; height: 100%; background: #0b1120; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <canvas id="nagpurCanvasMap" width="800" height="450" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; background: rgba(15,23,42,0.85); padding: 6px 12px; border-radius: 6px; font-size: 12px; color: #38bdf8; font-weight: bold; border: 1px solid rgba(56,189,248,0.3);">
        📍 Nagpur Security Vector Map (Zero-Latency Local Engine)
      </div>
    </div>
  `;

  const canvas = document.getElementById("nagpurCanvasMap");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function drawCanvas() {
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw simulated Nagpur road network (Wardha Rd, Central Ave, Amravati Rd)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Landmarks
    const landmarks = [
      { name: "Zero Mile Stone (Center)", x: 400, y: 225, color: "#38bdf8" },
      { name: "Sitabuldi Interchange", x: 420, y: 215, color: "#10b981" },
      { name: "Deekshabhoomi Stupa", x: 340, y: 310, color: "#f59e0b" },
      { name: "Futala Lake Promenade", x: 230, y: 190, color: "#06b6d4" },
      { name: "Nagpur Rly Station", x: 460, y: 180, color: "#6366f1" },
      { name: "Sadar Residency Rd", x: 425, y: 140, color: "#a855f7" }
    ];

    landmarks.forEach(lm => {
      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Ripple
      ctx.strokeStyle = lm.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(lm.name, lm.x + 12, lm.y + 4);
    });
  }

  drawCanvas();
}

window.initNagpurMap = initNagpurMap;
window.refreshMapData = refreshMapData;
window.setMapTheme = setMapTheme;
