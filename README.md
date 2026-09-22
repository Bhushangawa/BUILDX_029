# 🛡️ SENTINEL — AI-Assisted Smart Security & Emergency Coordination Platform

> **BUILD-X Hackathon — Security Management Track**  
> *"One platform. One command center. Faster coordination."*

---

## 📌 Executive Summary

During large public events, festivals, stadiums, and smart municipal transit, security information is fragmented. Paper-based help desk logs cause critical delays during missing person emergencies, walkie-talkie communication gets congested during crowd surges, and unverified social media posts cause panic and false sightings.

**SENTINEL** is a production-grade full-stack security command and emergency coordination web application that bridges **Citizens**, **Authorized Volunteers**, **Field Security Responders**, and the **Central Command Room** into a unified, real-time tactical network.

---

## 🚨 Core Security Scenarios Solved

### 1. Missing Child & Elderly Assistance (`/missing-persons`)
- **Dynamic Search Perimeter**: Automatically calculates and renders search radii on an interactive Leaflet map based on elapsed time and walking velocity (e.g. 850m perimeter).
- **Privacy-First Child Dossiers**: Sensitive child identifying marks and guardian contact numbers are masked from the public internet; authorized search dossiers are exclusively unlocked for vetted volunteers and police.
- **Vetted Sightings Pipeline**: Citizens and volunteers submit sightings with timestamps and locations. Admin/police verify sightings before dispatching search teams, eliminating false sightings and hoaxes.
- **Case Lifecycle**: `REPORTED` → `VERIFIED` → `SEARCH_DISPATCHED` → `SIGHTING_LOGGED` → `FOUND_SAFE` → `CLOSED`.

### 2. Crowd Management & Surge Monitoring (`/crowd-monitoring`)
- **Perimeter Zone Monitoring**: Entry Gate 1, South Exit Gate B, Main Arena Stage, North Parking, Medical Station, Central Help Desk, and VIP Restricted Zones.
- **Density Ratios**: `LOW` (0–40%), `MEDIUM` (40–70%), `HIGH` (70–85%), and `CRITICAL` (85%+).
- **Automated Hazard Alarms**: When density exceeds 85%, automatic critical alarms alert the command center and suggest the nearest crowd-control unit.
- **Interactive Surge Simulator**: Includes a 1-click `"Simulate Surge (90%+)"` trigger for live demonstrations.

### 3. Personal / Women Safety — Safe Journey Mode (`/safe-journey`)
- **Commuter Escort**: Active tracking for commuters in auto-rickshaws, cabs, buses, or walking.
- **Intelligent Route Deviation Detection**: Detects off-course movements and triggers the exact prompt:
  > **"Route deviation detected. Are you safe?"**
- **Dual Response**:
  - **"I AM SAFE"**: Resets deviation warning and continues monitoring.
  - **"NEED HELP"**: Immediately transmits emergency GPS coordinates to the Security Command Center map and alerts primary trusted contacts via simulated SMS.

### 4. Quick Incident Reporting & 1-Touch SOS (`/incidents` & Navigation Bar)
- **Sub-30-Second Reporting**: Fast reporting for theft, chain-snatching, suspicious items, and emergencies.
- **Witness Anonymity**: Optional anonymous reporting protects witnesses from retaliation while preserving audit integrity.
- **Emergency SOS**: Prominent 1-touch red SOS button in the navigation bar with siren animations and instant patrol dispatch.

### 5. AI Incident Intelligence & Multilingual NLP
- **Multilingual Understanding**: Natural language processing for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** (e.g., *"Gate 3 ke paas bohot bheed hai aur log dhakka de rahe hain"*).
- **Extracted Entities**: Extracts category, urgency priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), locations, suspect descriptors, and stolen articles.
- **AI Duplicate Detection & Clustering**: Detects when multiple witnesses report the same incident within a spatial (< 450m) and temporal (< 60 min) window with Jaccard keyword overlap. Clusters them into **1 Master Incident** with one-click **MERGE** or **KEEP SEPARATE** actions.

### 6. Central Security Command Center & Smart Leaflet Map (`/command-center`)
- **Top KPI Cards**: Active Incidents, Critical Emergencies, Missing Persons, Crowd Alerts, Active Teams, Cases Resolved Today, Average Response Time.
- **Interactive Leaflet Map**: Custom color-coded situational pins:
  - 🔴 **Red**: Critical Emergency / SOS / Deviation Alert (pulsing beacon)
  - 🟠 **Orange**: Missing Person (with circular search radius)
  - 🟡 **Yellow**: Crowd Alert Zone
  - 🔵 **Blue**: Help Desk & Police Hub
  - 🟢 **Green**: Response Team Patrol
  - 🟣 **Purple**: Restricted Perimeter Zone
- **Slide-Over Case Dossier**: Displays full AI summary, unit re-assignment dropdown, and chronological case timelines.

### 7. 5-Minute Guided Hackathon Demonstration Tour
- Built-in floating demonstration controller bar with sequential scripted steps:
  1. *Missing Child Report (Aarav, 6yo at North Lawn)*
  2. *AI Triage & Search Radius Calculation*
  3. *Dispatch Delta K9 Search & Rescue Team*
  4. *Exit Gate B Crowd Surge Alarm (93% capacity)*
  5. *Safe Journey Auto-Rickshaw Route Deviation Alert*
  6. *Duplicate Chain-Snatching Reports Detected & Clustered*
  7. *Volunteer Sighting Verified & Child Reunited Safe*
  8. *Incident Resolved & Live Analytics Updated*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Maps** | Leaflet + OpenStreetMap |
| **Database** | Prisma ORM + SQLite (Embedded Relational Database) |
| **Icons** | Lucide React |
| **NLP AI Engine** | Multilingual Deterministic Semantic NLP (EN/HI/MR) + Extensible LLM Adapter |

---

## 🚀 Quick Start Guide

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Bhushangawa/BUILDX_029.git
cd BUILDX_029
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
# Push schema to local SQLite database
npx prisma db push

# Seed with realistic public festival scenario data
node prisma/seed.js
```

### 3. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Navigation & Role Switching

Use the **Active Testing Role Bar** at the top of the interface to switch between user perspectives:
- **Citizen**: Priya Sharma (`/`, `/incidents`, `/safe-journey`, SOS)
- **Authorized Volunteer**: Vikram Jadhav (`/volunteer`, `/missing-persons`)
- **Security Staff**: Inspector Rajesh Rathore (`/responder`, `/command-center`)
- **Admin / Control Room**: Commander Anita Deshmukh (`/command-center`, `/crowd-monitoring`, `/analytics`)

Use the **Language Selector** to toggle between **English**, **हिंदी**, and **मराठी**.

---

## 📂 Project Architecture

```
├── prisma/
│   ├── schema.prisma             # Full relational SQLite schema
│   └── seed.js                   # Seed script for festival scenario
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── layout.tsx            # Root layout with Navbar, Demo Tour, Modals
│   │   ├── page.tsx              # Landing page
│   │   ├── command-center/       # Central Command Center & Leaflet Tactical Map
│   │   ├── incidents/            # Incident reporting & AI triage
│   │   ├── missing-persons/      # Child & elderly missing person directory
│   │   ├── crowd-monitoring/     # Live crowd zone occupancy & surge simulator
│   │   ├── safe-journey/         # Safe Journey mode & route deviation sensor
│   │   ├── responder/            # Security staff responder portal
│   │   ├── volunteer/            # Authorized volunteer tasking portal
│   │   ├── analytics/            # Operations analytics & heatmap matrix
│   │   └── api/                  # 16 REST API endpoints
│   ├── components/
│   │   ├── map/                  # Leaflet Dynamic Map & Custom SVG Beacons
│   │   ├── layout/               # Navbar, Role Switcher, Language Selector
│   │   ├── incident/             # Quick Report Modal & SOS Emergency Modal
│   │   └── demo/                 # 5-Minute Guided Hackathon Tour Controller
│   ├── lib/
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── ai-engine.ts          # Multilingual NLP triage & duplicate clustering
│   │   ├── translations.ts       # English, Hindi, and Marathi dictionaries
│   │   ├── geo-utils.ts          # Haversine distance & coordinate helpers
│   │   ├── escalation.ts         # SLA escalation watchdog
│   │   └── types.ts              # TypeScript domain interfaces
│   └── styles/
│       └── globals.css           # Tailwind + Leaflet custom styling
```