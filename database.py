import sqlite3
import os
import json
import hashlib
from datetime import datetime, timedelta

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "sentinel.db")

def get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('CITIZEN', 'VOLUNTEER', 'SECURITY_STAFF', 'ADMIN')),
        phone TEXT,
        badge_number TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 2. Response Teams table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS response_teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        team_type TEXT NOT NULL CHECK(team_type IN ('SECURITY_TEAM', 'CROWD_CONTROL_TEAM', 'SEARCH_TEAM', 'MEDICAL_SUPPORT', 'HELP_DESK_TEAM')),
        status TEXT NOT NULL CHECK(status IN ('AVAILABLE', 'DISPATCHED', 'BUSY', 'OFF_DUTY')),
        current_lat REAL NOT NULL,
        current_lng REAL NOT NULL,
        base_location TEXT NOT NULL,
        leader_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        active_incident_id TEXT,
        updated_at TEXT NOT NULL
    );
    """)

    # 3. Crowd Zones table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crowd_zones (
        id TEXT PRIMARY KEY,
        zone_name TEXT NOT NULL,
        location_landmark TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius_meters INTEGER NOT NULL DEFAULT 150,
        capacity INTEGER NOT NULL,
        current_count INTEGER NOT NULL,
        crowd_level TEXT NOT NULL CHECK(crowd_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        risk_level TEXT NOT NULL CHECK(risk_level IN ('NORMAL', 'ELEVATED', 'HIGH_RISK')),
        alert_status INTEGER NOT NULL DEFAULT 0,
        assigned_team_id TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(assigned_team_id) REFERENCES response_teams(id)
    );
    """)

    # 4. Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        reporter_id TEXT NOT NULL,
        reporter_name TEXT NOT NULL,
        reporter_contact TEXT,
        is_anonymous INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        status TEXT NOT NULL CHECK(status IN ('REPORTED', 'VERIFIED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
        assigned_team_id TEXT,
        ai_category TEXT,
        ai_priority TEXT,
        ai_suggested_team_type TEXT,
        ai_confidence REAL DEFAULT 0.90,
        ai_summary TEXT,
        is_verified_by_admin INTEGER NOT NULL DEFAULT 0,
        is_duplicate_of TEXT,
        escalation_status TEXT DEFAULT 'NORMAL',
        media_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(assigned_team_id) REFERENCES response_teams(id),
        FOREIGN KEY(reporter_id) REFERENCES users(id)
    );
    """)

    # 5. Missing Persons table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS missing_persons (
        id TEXT PRIMARY KEY,
        person_type TEXT NOT NULL CHECK(person_type IN ('CHILD', 'ELDERLY')),
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        last_seen_location TEXT NOT NULL,
        last_seen_time TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        clothing_description TEXT NOT NULL,
        identifying_marks TEXT,
        photo_url TEXT,
        reporter_name TEXT NOT NULL,
        reporter_phone TEXT NOT NULL,
        reporter_relationship TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('SEARCHING', 'SIGHTING_VERIFYING', 'FOUND', 'CLOSED')),
        assigned_team_id TEXT,
        search_radius_meters INTEGER NOT NULL DEFAULT 500,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(assigned_team_id) REFERENCES response_teams(id)
    );
    """)

    # 6. Missing Person Sightings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sightings (
        id TEXT PRIMARY KEY,
        missing_person_id TEXT NOT NULL,
        submitted_by_user_id TEXT NOT NULL,
        submitted_by_name TEXT NOT NULL,
        sighting_location TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        sighting_time TEXT NOT NULL,
        notes TEXT NOT NULL,
        photo_url TEXT,
        is_verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(missing_person_id) REFERENCES missing_persons(id),
        FOREIGN KEY(submitted_by_user_id) REFERENCES users(id)
    );
    """)

    # 7. Safe Journeys table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS safe_journeys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        start_location TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_lat REAL NOT NULL,
        start_lng REAL NOT NULL,
        dest_lat REAL NOT NULL,
        dest_lng REAL NOT NULL,
        current_lat REAL NOT NULL,
        current_lng REAL NOT NULL,
        trusted_contact_name TEXT NOT NULL,
        trusted_contact_phone TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'DEVIATION_ALERT', 'CHECKED_SAFE', 'EMERGENCY_TRIGGERED', 'COMPLETED')),
        deviation_detected INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)

    # 8. Case Timeline table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS case_timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL, -- 'INCIDENT' or 'MISSING_PERSON'
        entity_id TEXT NOT NULL,
        event_title TEXT NOT NULL,
        event_description TEXT NOT NULL,
        performed_by_name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 9. Notifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        target_role TEXT, -- CITIZEN, VOLUNTEER, SECURITY_STAFF, ADMIN, or NULL for all
        user_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        notification_type TEXT NOT NULL CHECK(notification_type IN ('INCIDENT', 'ALERT', 'ASSIGNMENT', 'MISSING_PERSON', 'CROWD', 'SOS', 'DEVIATION')),
        related_id TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    # 10. Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 11. Cyber Assets Inventory table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cyber_assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL CHECK(asset_type IN ('GATEWAY', 'AUTH_SERVER', 'DB_CLUSTER', 'CCTV_STORAGE', 'WORKSTATION', 'EMERGENCY_PORTAL')),
        ip_address TEXT NOT NULL,
        subnet TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('NORMAL', 'SUSPICIOUS', 'ISOLATED', 'RECOVERING')),
        location TEXT NOT NULL,
        health_score INTEGER NOT NULL DEFAULT 100,
        active_threat_id TEXT,
        last_updated TEXT NOT NULL
    );
    """)

    # 12. Cyber Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cyber_incidents (
        id TEXT PRIMARY KEY,
        simulation_type TEXT NOT NULL,
        title TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        risk_score INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('DETECTING', 'ANALYZING', 'CRITICAL', 'CONTAINED', 'RECOVERING', 'RESOLVED')),
        current_step INTEGER NOT NULL DEFAULT 1,
        total_steps INTEGER NOT NULL DEFAULT 7,
        affected_asset_id TEXT,
        affected_asset_name TEXT,
        attack_source_ip TEXT,
        detection_reason TEXT,
        ai_confidence REAL DEFAULT 0.94,
        recommended_action TEXT,
        actions_taken TEXT,
        legitimate_users_protected INTEGER DEFAULT 1420,
        service_availability REAL DEFAULT 99.98,
        created_at TEXT NOT NULL,
        contained_at TEXT,
        recovered_at TEXT,
        FOREIGN KEY(affected_asset_id) REFERENCES cyber_assets(id)
    );
    """)

    # 13. Cyber Security Events Stream table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cyber_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        timestamp TEXT NOT NULL,
        event_name TEXT NOT NULL,
        source_ip TEXT NOT NULL,
        severity TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT
    );
    """)

    # 14. Cyber Response Actions Log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cyber_response_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        timestamp TEXT NOT NULL,
        action_type TEXT NOT NULL,
        target_asset TEXT NOT NULL,
        status TEXT NOT NULL,
        impact_summary TEXT NOT NULL
    );
    """)

    conn.commit()
    seed_data(conn)
    seed_cyber_data(conn)
    conn.close()
    print("Database initialized & seeded successfully at", DB_PATH)

def seed_data(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        return

    now = datetime.now()
    t_minus = lambda mins: (now - timedelta(minutes=mins)).strftime("%Y-%m-%d %H:%M:%S")

    # 1. Seed Users (All 4 roles)
    users_data = [
        ("USR-ADMIN-01", "Inspector Rajesh Shinde", "admin@sentinel.ngp", hash_pw("admin123"), "ADMIN", "+91-712-2561100", "NGP-CMD-01", t_minus(600)),
        ("USR-SEC-01", "Officer Amit Deshmukh", "security@sentinel.ngp", hash_pw("security123"), "SECURITY_STAFF", "+91-9823011223", "NGP-SEC-402", t_minus(600)),
        ("USR-VOL-01", "Pooja Wankhede", "volunteer@sentinel.ngp", hash_pw("volunteer123"), "VOLUNTEER", "+91-9765432109", "NGP-VOL-108", t_minus(600)),
        ("USR-CIT-01", "Snehal Patil", "citizen@sentinel.ngp", hash_pw("citizen123"), "CITIZEN", "+91-9422114455", None, t_minus(600)),
        ("USR-CIT-02", "Rohit Bhave", "rohit@gmail.com", hash_pw("citizen123"), "CITIZEN", "+91-9890123456", None, t_minus(400))
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)", users_data)

    # 2. Seed Response Teams in Nagpur
    teams_data = [
        ("TEAM-NGP-01", "Sitabuldi Quick Response Unit", "SECURITY_TEAM", "AVAILABLE", 21.1466, 79.0825, "Sitabuldi Metro Station Outpost", "Sub-Inspector V. Kulkarni", "+91-712-2561201", None, t_minus(120)),
        ("TEAM-NGP-02", "Deekshabhoomi Crowd Control Bravo", "CROWD_CONTROL_TEAM", "BUSY", 21.1278, 79.0683, "Deekshabhoomi Command Camp", "Head Constable S. Thakre", "+91-712-2561202", "INC-NGP-2026-000102", t_minus(90)),
        ("TEAM-NGP-03", "Orange City Search & Rescue Delta", "SEARCH_TEAM", "AVAILABLE", 21.1415, 79.0601, "Dharampeth Zonal Center", "Captain M. Gedam", "+91-712-2561203", None, t_minus(60)),
        ("TEAM-NGP-04", "Nagpur GMCH Trauma Mobile 1", "MEDICAL_SUPPORT", "AVAILABLE", 21.1302, 79.0987, "Medical Square GMCH Base", "Dr. A. Borkar", "+91-712-2561204", None, t_minus(30)),
        ("TEAM-NGP-05", "Futala Lake Patrol & Safety", "SECURITY_TEAM", "AVAILABLE", 21.1542, 79.0435, "Futala Waterfront Kiosk", "Havildar R. Meshram", "+91-712-2561205", None, t_minus(45)),
        ("TEAM-NGP-06", "Nagpur Rly Central Help Desk", "HELP_DESK_TEAM", "AVAILABLE", 21.1524, 79.0886, "Nagpur Junction Station Concourse", "Coordinator Sunita Rao", "+91-712-2561206", None, t_minus(100))
    ]
    cursor.executemany("INSERT INTO response_teams VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", teams_data)

    # 3. Seed Crowd Zones in Nagpur
    zones_data = [
        ("ZONE-NGP-01", "Deekshabhoomi Stupa Gate 3", "Deekshabhoomi Complex", 21.1278, 79.0683, 200, 3500, 3200, "HIGH", "ELEVATED", 1, "TEAM-NGP-02", t_minus(5)),
        ("ZONE-NGP-02", "Sitabuldi Interchange Concourse", "Sitabuldi Metro Station", 21.1466, 79.0825, 150, 2000, 1150, "MEDIUM", "NORMAL", 0, "TEAM-NGP-01", t_minus(10)),
        ("ZONE-NGP-03", "Futala Lake Promenade East", "Futala Waterfront", 21.1542, 79.0435, 250, 1500, 480, "LOW", "NORMAL", 0, "TEAM-NGP-05", t_minus(15)),
        ("ZONE-NGP-04", "Sadar Residency Road Bazar", "Sadar Market", 21.1601, 79.0831, 180, 2500, 1400, "MEDIUM", "NORMAL", 0, None, t_minus(20)),
        ("ZONE-NGP-05", "Nagpur Rly West Entry Gate", "Nagpur Junction", 21.1524, 79.0886, 120, 1800, 1650, "CRITICAL", "HIGH_RISK", 1, "TEAM-NGP-06", t_minus(2)),
        ("ZONE-NGP-06", "Mankapur Indoor Stadium Arena", "Mankapur Sports Complex", 21.1892, 79.0745, 300, 5000, 1800, "LOW", "NORMAL", 0, None, t_minus(35))
    ]
    cursor.executemany("INSERT INTO crowd_zones VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", zones_data)

    # 4. Seed Nagpur Incidents
    incidents_data = [
        (
            "INC-NGP-2026-000101",
            "Attempted Chain Snatching on Wardha Road",
            "Chain-snatching",
            "Crime",
            "Two riders on a black pulsar snatched gold chain near Sai Mandir bus stop, heading towards Chhatrapati Square.",
            "Wardha Road near Sai Mandir",
            21.1118, 79.0762,
            "USR-CIT-01", "Snehal Patil", "+91-9422114455", 0,
            "HIGH", "IN_PROGRESS", "TEAM-NGP-01",
            "Personal Safety / Street Crime", "HIGH", "SECURITY_TEAM", 0.94,
            "Urgent vehicular pursuit and cordon off towards Chhatrapati Square recommended.",
            1, None, "NORMAL", None, t_minus(85), t_minus(30)
        ),
        (
            "INC-NGP-2026-000102",
            "Excessive Crowd Surge at Deekshabhoomi Gate 3",
            "Crowd issue",
            "Crowd Management",
            "Heavy gathering following evening prayer ceremony. Flow bottleneck at Gate 3 exit barricade.",
            "Deekshabhoomi Gate 3",
            21.1278, 79.0683,
            "USR-VOL-01", "Pooja Wankhede", "+91-9765432109", 0,
            "HIGH", "ACKNOWLEDGED", "TEAM-NGP-02",
            "Crowd Management", "HIGH", "CROWD_CONTROL_TEAM", 0.98,
            "Open auxiliary gates 4 and 5 immediately to disperse pedestrian density.",
            1, None, "WARNING", None, t_minus(42), t_minus(25)
        ),
        (
            "INC-NGP-2026-000103",
            "Unattended Luggage Bag near Zero Mile Metro",
            "Suspicious activity",
            "Public Safety",
            "Large blue duffel bag left unattended beside ticket counter for over 35 minutes.",
            "Zero Mile Stone Metro Station",
            21.1498, 79.0806,
            "USR-CIT-02", "Rohit Bhave", "+91-9890123456", 0,
            "CRITICAL", "VERIFIED", None,
            "Suspicious Activity / Bomb Threat Protocol", "CRITICAL", "SECURITY_TEAM", 0.96,
            "Cordon 50m perimeter; dispatch bomb detection squad and verify CCTV feeds.",
            1, None, "ESCALATION", None, t_minus(28), t_minus(15)
        ),
        (
            "INC-NGP-2026-000104",
            "Elderly Citizen Dizziness & Medical Distress",
            "Emergency",
            "Medical Support",
            "68-year-old male collapsed on Futala promenade walking track, breathing with difficulty.",
            "Futala Lake Promenade",
            21.1542, 79.0435,
            "USR-CIT-01", "Snehal Patil", None, 1,
            "CRITICAL", "ASSIGNED", "TEAM-NGP-04",
            "Medical Emergency", "CRITICAL", "MEDICAL_SUPPORT", 0.99,
            "Dispatch GMCH ambulance immediately with oxygen supply and AED.",
            1, None, "NORMAL", None, t_minus(18), t_minus(12)
        ),
        (
            "INC-NGP-2026-000105",
            "Pickpocketing near Sitabuldi Footover Bridge",
            "Theft",
            "Property Crime",
            "Wallet stolen during rush hour transit near Sitabuldi market stairs.",
            "Sitabuldi Market Bridge",
            21.1466, 79.0825,
            "USR-CIT-02", "Rohit Bhave", "+91-9890123456", 0,
            "LOW", "RESOLVED", "TEAM-NGP-01",
            "Theft", "LOW", "HELP_DESK_TEAM", 0.91,
            "CCTV footage reviewed and FIR receipt generated at local help desk.",
            1, None, "NORMAL", None, t_minus(180), t_minus(60)
        )
    ]
    cursor.executemany("""
    INSERT INTO incidents VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    """, incidents_data)

    # 5. Seed Missing Persons in Nagpur
    missing_data = [
        (
            "MP-NGP-2026-000041",
            "CHILD",
            "Aarav Sachin Meshram",
            6,
            "MALE",
            "Deekshabhoomi Garden Area near Fountain",
            t_minus(55),
            21.1278, 79.0683,
            "Yellow cartoon T-shirt, blue denim shorts, red sandals",
            "Small birthmark on left forearm, speaks Marathi and Hindi",
            "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=300",
            "Sachin Meshram (Father)",
            "+91-9822334455",
            "Father",
            "SEARCHING",
            "TEAM-NGP-03",
            400,
            t_minus(50),
            t_minus(10)
        ),
        (
            "MP-NGP-2026-000042",
            "ELDERLY",
            "Damodharrao Joshi",
            74,
            "MALE",
            "Sitabuldi Metro Station Gate 2",
            t_minus(140),
            21.1466, 79.0825,
            "White Kurta-Pyjama, black frame spectacles, walking stick with rubber tip",
            "Mild Alzheimer's/memory loss, responds slowly, wearing silver wrist kada",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
            "Dr. Anjali Joshi (Daughter)",
            "+91-9890556677",
            "Daughter",
            "SIGHTING_VERIFYING",
            "TEAM-NGP-01",
            800,
            t_minus(130),
            t_minus(15)
        )
    ]
    cursor.executemany("INSERT INTO missing_persons VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", missing_data)

    # 6. Seed Sightings
    sightings_data = [
        (
            "SGT-NGP-001",
            "MP-NGP-2026-000042",
            "USR-VOL-01",
            "Pooja Wankhede",
            "Near Anand Talkies square chai stall, Sitabuldi",
            21.1450, 79.0810,
            t_minus(25),
            "Saw elderly gentleman matching description sitting on public bench looking confused.",
            None,
            1,
            t_minus(20)
        )
    ]
    cursor.executemany("INSERT INTO sightings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sightings_data)

    # 7. Seed Case Timeline
    timeline_data = [
        ("INCIDENT", "INC-NGP-2026-000101", "Report Created", "Citizen submitted report for chain snatching via mobile app.", "Snehal Patil", "CITIZEN", t_minus(85)),
        ("INCIDENT", "INC-NGP-2026-000101", "AI Classification Completed", "Classified as High Priority Personal Safety / Crime. Recommended Security Team.", "AI Sentinel Core", "SYSTEM", t_minus(84)),
        ("INCIDENT", "INC-NGP-2026-000101", "Admin Verification", "Admin verified severity and approved dispatch recommendation.", "Inspector Rajesh Shinde", "ADMIN", t_minus(75)),
        ("INCIDENT", "INC-NGP-2026-000101", "Team Assigned", "Assigned Sitabuldi Quick Response Unit (TEAM-NGP-01).", "Inspector Rajesh Shinde", "ADMIN", t_minus(70)),
        ("INCIDENT", "INC-NGP-2026-000101", "Response In Progress", "Team reached Wardha Road Sai Mandir intersection and initiated CCTV tracing.", "Officer Amit Deshmukh", "SECURITY_STAFF", t_minus(30)),

        ("MISSING_PERSON", "MP-NGP-2026-000041", "Missing Child Case Filed", "Family reported 6-year-old child separated during large gathering at Deekshabhoomi.", "Sachin Meshram", "CITIZEN", t_minus(50)),
        ("MISSING_PERSON", "MP-NGP-2026-000041", "Help Desk & Search Radius Activated", "400m perimeter around Deekshabhoomi Stupa geo-fenced. Orange City Search Team alerted.", "Inspector Rajesh Shinde", "ADMIN", t_minus(45)),
        ("MISSING_PERSON", "MP-NGP-2026-000041", "Volunteer Search Alert Dispatched", "Authorized volunteers in South-West Nagpur quadrant notified with sensitive data masked.", "Control Room Dispatch", "ADMIN", t_minus(40))
    ]
    cursor.executemany("INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", timeline_data)

    # 8. Seed Notifications
    notifications_data = [
        ("NOTIF-01", "ADMIN", "USR-ADMIN-01", "High Priority Alert: Wardha Rd", "Attempted chain snatching reported near Sai Mandir. Action in progress.", "INCIDENT", "INC-NGP-2026-000101", 0, t_minus(80)),
        ("NOTIF-02", "ADMIN", "USR-ADMIN-01", "Crowd Density Warning: Deekshabhoomi", "Gate 3 capacity exceeded 90%. Auxiliary gates recommended to open.", "CROWD", "ZONE-NGP-01", 0, t_minus(40)),
        ("NOTIF-03", "VOLUNTEER", "USR-VOL-01", "Search Mission: 6yo Child at Deekshabhoomi", "Please check exits and stalls near Fountain quadrant. Follow verified guidelines.", "MISSING_PERSON", "MP-NGP-2026-000041", 0, t_minus(45)),
        ("NOTIF-04", "SECURITY_STAFF", "USR-SEC-01", "Dispatch Assignment Received", "TEAM-NGP-01 assigned to incident INC-NGP-2026-000101.", "ASSIGNMENT", "INC-NGP-2026-000101", 1, t_minus(70))
    ]
    cursor.executemany("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", notifications_data)

    # 9. Seed Safe Journey (Sitabuldi to Dharampeth)
    cursor.execute("""
    INSERT INTO safe_journeys VALUES (
        'SJ-NGP-001', 'USR-CIT-01', 'Sitabuldi Interchange', 'Coffee House Square, Dharampeth',
        21.1466, 79.0825, 21.1415, 79.0601, 21.1440, 79.0710,
        'Sunita Patil (Sister)', '+91-9422001122',
        'ACTIVE', 0, ?, ?
    )
    """, (t_minus(15), t_minus(2)))

    # 10. Seed Audit Logs
    audit_data = [
        ("Inspector Rajesh Shinde", "ADMIN", "SYSTEM_STARTUP", "RAKSHAK Security Coordination Engine booted for Nagpur City zone.", t_minus(600)),
        ("Inspector Rajesh Shinde", "ADMIN", "TEAM_ASSIGNMENT", "Assigned TEAM-NGP-01 to INC-NGP-2026-000101.", t_minus(70)),
        ("Officer Amit Deshmukh", "SECURITY_STAFF", "STATUS_UPDATE", "Updated INC-NGP-2026-000101 to IN_PROGRESS.", t_minus(30))
    ]
    cursor.executemany("INSERT INTO audit_logs (user_name, user_role, action, details, created_at) VALUES (?, ?, ?, ?, ?)", audit_data)

    conn.commit()

def seed_cyber_data(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cyber_assets")
    if cursor.fetchone()[0] > 0:
        return

    now = datetime.now()
    t_minus = lambda mins: (now - timedelta(minutes=mins)).strftime("%Y-%m-%d %H:%M:%S")

    # Seed Enterprise Assets
    assets_data = [
        ("ASSET-NGP-01", "Nagpur Smart Grid Auth Gateway", "AUTH_SERVER", "10.20.1.10", "10.20.1.0/24", "NORMAL", "Sitabuldi Data Center Rack A1", 100, None, t_minus(1)),
        ("ASSET-NGP-02", "Central Traffic & Incident DB Cluster", "DB_CLUSTER", "10.20.2.15", "10.20.2.0/24", "NORMAL", "Deekshabhoomi Secure Vault", 100, None, t_minus(1)),
        ("ASSET-NGP-03", "Nagpur Metro CCTV Video Gateway", "CCTV_STORAGE", "10.20.3.40", "10.20.3.0/24", "NORMAL", "Zero Mile Command Post", 100, None, t_minus(1)),
        ("ASSET-NGP-04", "Command Room SOC Dispatch Terminal", "WORKSTATION", "10.20.4.102", "10.20.4.0/24", "NORMAL", "Civil Lines Control Desk 4", 100, None, t_minus(1)),
        ("ASSET-NGP-05", "Citizen Public API & SOS Proxy", "GATEWAY", "10.20.5.80", "10.20.5.0/24", "NORMAL", "Cloud DMZ Cluster", 100, None, t_minus(1)),
        ("ASSET-NGP-06", "GMCH Emergency Trauma Link", "EMERGENCY_PORTAL", "10.20.6.22", "10.20.6.0/24", "NORMAL", "Medical Square Hospital Node", 100, None, t_minus(1))
    ]
    cursor.executemany("INSERT INTO cyber_assets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", assets_data)

    # Seed initial baseline clean event
    baseline_events = [
        (None, t_minus(10), "System Integrity Scan", "10.20.1.1", "LOW", "All Assets", "Baseline Verification", "Completed", "All 6 critical infrastructure nodes operating in nominal state. Zero active vulnerabilities detected.")
    ]
    cursor.executemany("INSERT INTO cyber_events (incident_id, timestamp, event_name, source_ip, severity, asset_name, action_taken, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", baseline_events)

    conn.commit()

if __name__ == "__main__":
    init_db()
