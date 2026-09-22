# SENTINEL — Nagpur City Smart Security & Emergency Coordination Platform

> **"Built for Nagpur. Designed for faster and safer security coordination."**
> 
> *BUILD-X Hackathon — Security Management Track*

---

## Overview

**SENTINEL** is a connected, production-style full-stack Smart Security Command & Emergency Coordination Platform built exclusively for **Nagpur City, Maharashtra, India**. 

The platform bridges communication fragmentation across:
1. **Citizens** (Quick incident reporting, Safe Journey mode, 1-click SOS, missing person filing)
2. **Volunteers** (Search perimeter assignments, sighting submissions, community alerts)
3. **Security Staff** (Dispatched unit queues, on-scene actions, lifecycle status updates)
4. **Central Control Room / Admin** (Interactive Nagpur security map, live operations table, AI verification, team dispatching, duplicate detection, crowd zone management, real-time analytics)

---

## Critical Scope: Nagpur Focus & Realistic Operational Data

All operational entities, coordinates, event zones, and demo incidents are strictly anchored to real landmarks across Nagpur City:
- **Deekshabhoomi Complex & Stupa** (Crowd management zone & missing child scenario)
- **Sitabuldi Interchange & Metro Station** (Transit hub security, Safe Journey origin)
- **Nagpur Junction Railway Station** (West entry gate crowd zone & Help Desk)
- **Wardha Road Corridor & Sai Mandir** (Street safety & arterial patrol)
- **Futala Lake Promenade** (Waterfront recreation safety & medical emergency response)
- **Dharampeth / Coffee House Square** (Commercial district & Safe Journey destination)
- **Sadar Residency Road Bazar** (Commercial crowd monitoring)
- **Zero Mile Stone** (Geographical center of India & reference marker)
- **GMCH Medical Square** (Trauma & medical ambulance dispatch base)
- **Mankapur Sports Complex Arena** (High-capacity event venue)

*Ethical Disclaimer: Clearly labeled SIMULATED DEMO DATA. Does not make unauthorized claims of live government or police feeds.*

---

## Key Modules & Capabilities

### 1. Complete Incident Lifecycle
- **Workflow**: `REPORTED` ➔ `VERIFIED` ➔ `ASSIGNED` ➔ `ACKNOWLEDGED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`.
- **Database-Driven Timeline**: Every state transition generates an immutable event log with user name, role, and timestamp.
- **Unique Nagpur Identifiers**: Generated with format `INC-NGP-2026-000124`.

### 2. Privacy-Guarded Missing Child & Elderly System
- Protects vulnerable individuals: **sensitive child photos, family phone numbers, and private addresses are strictly masked** from unauthorized public view.
- Search radius geo-fencing on Nagpur map with automated volunteer notifications.
- Verified volunteer sighting reporting workflow.

### 3. Central Security Command Center
- **Top KPIs**: Real-time database aggregations (Active Incidents, Critical Alerts, Missing Persons, Crowd Alerts, Available Units, Resolved Cases, Average Response Time).
- **Live Operations Grid**: Multi-attribute filtering by category, priority, status, and search terms.
- **Interactive Inspector**: Deep ticket view, AI recommendation confirmation, nearest response unit suggestions, and duplicate handling.

### 4. Interactive Nagpur Security Map (Leaflet + OpenStreetMap)
- Centered at Nagpur coordinates: `[21.1458, 79.0882]`.
- Dynamic color-coded SVG marker system:
  - 🔴 **Red**: Critical Emergency / SOS
  - 🟠 **Orange**: Missing Person Search Zone
  - 🟡 **Yellow**: Crowd Alert
  - 🔵 **Blue**: Help Desk
  - 🟢 **Green**: Available Response Team
  - 🟣 **Purple**: Restricted / High Risk Zone
- Vector canvas fallback ensures smooth offline operation.

### 5. AI Incident Intelligence & Duplicate Detection
- Multilingual natural language classification supporting **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
- Human-in-the-loop: AI recommendations require Authority Verification before dispatch.
- Spatial (<500m) and NLP keyword overlap detection to identify and merge duplicate reports into master tickets.

### 6. Personal & Women Safety (Safe Journey Mode)
- Real-time route tracking between Nagpur locations (e.g. Sitabuldi to Dharampeth).
- Automated route deviation detection and safety check-in prompt: *"Route deviation detected. Are you safe?"*.
- 1-Click urgent SOS broadcast triggering critical dashboard alerts.

### 7. Multilingual Support
- Real, active language toggle for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** covering navigation, form inputs, buttons, and alert feeds.

---

## 5-Minute Hackathon Demo Walkthrough

Click the **⚡ 5-Min Demo** button in the navigation header to run through the 16-step guided scenario:
1. **Step 1**: 6-year-old child reported missing near Deekshabhoomi Garden Fountain.
2. **Step 2**: Report arrives at Command Center with sensitive information masked.
3. **Step 3**: AI classifies case and suggests a 400m search perimeter.
4. **Step 4**: Admin verifies and signs off on AI recommendation.
5. **Step 5**: System ranks nearest specialized search units.
6. **Step 6**: Admin dispatches Orange City Search & Rescue Delta.
7. **Step 7**: Search radius renders live on the Nagpur Map.
8. **Step 8**: Simulated crowd surge at Deekshabhoomi Gate 3 (97% capacity).
9. **Step 9**: Control room deploys Crowd Control Bravo.
10. **Step 10**: Second citizen reports exit congestion in Hindi.
11. **Step 11**: AI Duplicate Engine flags spatial and semantic relationship.
12. **Step 12**: Admin reviews and merges duplicate into Master Ticket.
13. **Step 13**: Field unit marks status `IN_PROGRESS`.
14. **Step 14**: Child safely located at station help desk; case marked `RESOLVED`.
15. **Step 15**: Full chronological case timeline displays complete audit trail.
16. **Step 16**: Live analytics update in real time.

---

## How to Run Locally

1. **Prerequisites**: Python 3.10+ installed.
2. **Launch Server**:
   ```bash
   python server.py
   ```
3. **Open in Browser**:
   ```
   http://localhost:8000
   ```
4. **Quick Role Switcher**:
   Use the pills in the top right to instantly switch between **Admin**, **Security Staff**, **Volunteer**, and **Citizen** without tedious re-logins.
