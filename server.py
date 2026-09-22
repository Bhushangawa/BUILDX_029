import http.server
import socketserver
import json
import urllib.parse
import os
import mimetypes
import sqlite3
from datetime import datetime, timedelta

from database import get_db, init_db, hash_pw
from ai_engine import analyze_incident, detect_duplicates, haversine_distance, NAGPUR_LANDMARKS, extract_nagpur_location
from cyber_engine import (
    start_simulation, get_simulation_status, advance_simulation_step,
    stop_simulation, reset_simulation, get_dashboard_stats, get_cyber_events,
    get_cyber_incidents, get_cyber_incident_detail, get_cyber_assets
)

PORT = 8000
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

def row_to_dict(row):
    return dict(row) if row else None

def rows_to_list(rows):
    return [dict(r) for r in rows]

def get_current_user_from_headers(headers):
    # Simulated auth session: Authorization header or X-User-Role
    auth_user_id = headers.get("X-User-Id", "USR-ADMIN-01")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (auth_user_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {"id": "USR-ADMIN-01", "name": "Inspector Rajesh Shinde", "role": "ADMIN"}

class SentinelHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data, default=str).encode('utf-8')
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id, X-User-Role")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id, X-User-Role")
        self.end_headers()

    def parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            raw = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # API routing
        if path.startswith("/api/"):
            try:
                self.handle_api_get(path, query)
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_json({"error": str(e)}, status=500)
            return

        # Serve static files (HTML, CSS, JS)
        if path == "/" or path == "":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            try:
                self.handle_api_post(path)
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_json({"error": str(e)}, status=500)
            return

        self.send_json({"error": "Endpoint not found"}, status=404)

    def handle_api_get(self, path, query):
        conn = get_db()
        cur = conn.cursor()
        current_user = get_current_user_from_headers(self.headers)
        user_role = current_user.get("role", "CITIZEN")

        # 1. Auth Me
        if path == "/api/auth/me":
            self.send_json({"user": current_user})

        # 2. Incidents List
        elif path == "/api/incidents":
            category = query.get("category", [None])[0]
            priority = query.get("priority", [None])[0]
            status = query.get("status", [None])[0]
            search = query.get("search", [None])[0]

            sql = """
            SELECT i.*, t.name as assigned_team_name, t.leader_name as assigned_team_leader
            FROM incidents i
            LEFT JOIN response_teams t ON i.assigned_team_id = t.id
            WHERE 1=1
            """
            params = []

            # If CITIZEN, only allow own incidents or non-sensitive summary
            if user_role == "CITIZEN" and query.get("mine_only", ["0"])[0] == "1":
                sql += " AND i.reporter_id = ?"
                params.append(current_user["id"])

            if category and category != "ALL":
                sql += " AND i.category = ?"
                params.append(category)
            if priority and priority != "ALL":
                sql += " AND i.priority = ?"
                params.append(priority)
            if status and status != "ALL":
                sql += " AND i.status = ?"
                params.append(status)
            if search:
                sql += " AND (i.title LIKE ? OR i.description LIKE ? OR i.location_name LIKE ?)"
                term = f"%{search}%"
                params.extend([term, term, term])

            sql += " ORDER BY CASE i.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, i.created_at DESC"
            cur.execute(sql, params)
            rows = cur.fetchall()

            # Format rows & redact reporter info if unauthorized
            result = []
            for r in rows:
                item = dict(r)
                if user_role not in ["ADMIN", "SECURITY_STAFF"] and item.get("is_anonymous"):
                    item["reporter_name"] = "Anonymous Citizen"
                    item["reporter_contact"] = None
                result.append(item)

            self.send_json({"incidents": result, "count": len(result)})

        # 3. Single Incident Detail
        elif path.startswith("/api/incidents/"):
            inc_id = path.replace("/api/incidents/", "").strip("/")
            cur.execute("""
            SELECT i.*, t.name as assigned_team_name, t.leader_name as assigned_team_leader, t.contact_phone as assigned_team_phone
            FROM incidents i
            LEFT JOIN response_teams t ON i.assigned_team_id = t.id
            WHERE i.id = ?
            """, (inc_id,))
            inc = cur.fetchone()
            if not inc:
                self.send_json({"error": "Incident not found"}, status=404)
                conn.close()
                return

            incident_dict = dict(inc)
            # Fetch timeline
            cur.execute("SELECT * FROM case_timeline WHERE entity_type='INCIDENT' AND entity_id=? ORDER BY created_at ASC", (inc_id,))
            timeline = rows_to_list(cur.fetchall())
            incident_dict["timeline"] = timeline

            # Mask reporter details if not admin/security
            if user_role not in ["ADMIN", "SECURITY_STAFF"] and incident_dict.get("is_anonymous"):
                incident_dict["reporter_name"] = "Anonymous Citizen"
                incident_dict["reporter_contact"] = None

            self.send_json({"incident": incident_dict})

        # 4. Missing Persons List (Strict Privacy Control)
        elif path == "/api/missing-persons":
            cur.execute("""
            SELECT mp.*, t.name as assigned_team_name
            FROM missing_persons mp
            LEFT JOIN response_teams t ON mp.assigned_team_id = t.id
            ORDER BY mp.created_at DESC
            """)
            rows = rows_to_list(cur.fetchall())

            # PRIVACY RULE: If role is CITIZEN, do not expose sensitive child photo, phone numbers, or private family information!
            sanitized = []
            for r in rows:
                item = dict(r)
                if user_role == "CITIZEN":
                    # Redact private contacts and unverified family data for public citizens
                    item["reporter_phone"] = "[REDACTED FOR PRIVACY]"
                    item["reporter_name"] = "[AUTHORIZED DESK ONLY]"
                    # Hide detailed photo URL if child to prevent unauthorized indexing
                    if item.get("person_type") == "CHILD":
                        item["photo_url"] = None
                sanitized.append(item)

            self.send_json({"missing_persons": sanitized, "count": len(sanitized)})

        # 5. Missing Person Detail with Sightings & Timeline
        elif path.startswith("/api/missing-persons/"):
            mp_id = path.replace("/api/missing-persons/", "").strip("/")
            cur.execute("""
            SELECT mp.*, t.name as assigned_team_name, t.leader_name as assigned_team_leader, t.contact_phone as assigned_team_phone
            FROM missing_persons mp
            LEFT JOIN response_teams t ON mp.assigned_team_id = t.id
            WHERE mp.id = ?
            """, (mp_id,))
            mp = cur.fetchone()
            if not mp:
                self.send_json({"error": "Missing person record not found"}, status=404)
                conn.close()
                return

            mp_dict = dict(mp)
            # Sightings
            cur.execute("SELECT * FROM sightings WHERE missing_person_id=? ORDER BY created_at DESC", (mp_id,))
            mp_dict["sightings"] = rows_to_list(cur.fetchall())

            # Timeline
            cur.execute("SELECT * FROM case_timeline WHERE entity_type='MISSING_PERSON' AND entity_id=? ORDER BY created_at ASC", (mp_id,))
            mp_dict["timeline"] = rows_to_list(cur.fetchall())

            # Privacy rule mask
            if user_role == "CITIZEN":
                mp_dict["reporter_phone"] = "[REDACTED]"
                mp_dict["reporter_name"] = "[AUTHORIZED HELPDESK ONLY]"
                if mp_dict.get("person_type") == "CHILD":
                    mp_dict["photo_url"] = None

            self.send_json({"missing_person": mp_dict})

        # 6. Response Teams List & Nearest Recommendation
        elif path == "/api/teams":
            cur.execute("SELECT * FROM response_teams ORDER BY name ASC")
            teams = rows_to_list(cur.fetchall())
            self.send_json({"teams": teams})

        elif path == "/api/teams/recommend":
            lat = float(query.get("lat", [21.1458])[0])
            lng = float(query.get("lng", [79.0882])[0])
            req_type = query.get("team_type", ["SECURITY_TEAM"])[0]

            cur.execute("SELECT * FROM response_teams")
            all_teams = rows_to_list(cur.fetchall())

            ranked = []
            for t in all_teams:
                dist = haversine_distance(lat, lng, t["current_lat"], t["current_lng"])
                type_bonus = 0 if t["team_type"] == req_type else 1000
                avail_bonus = 0 if t["status"] == "AVAILABLE" else 2000
                score = dist + type_bonus + avail_bonus
                ranked.append({
                    "team": t,
                    "distance_meters": round(dist),
                    "distance_km": round(dist / 1000, 2),
                    "score": score
                })

            ranked.sort(key=lambda x: x["score"])
            self.send_json({"recommendations": ranked})

        # 7. Crowd Event Zones
        elif path == "/api/crowd-zones":
            cur.execute("""
            SELECT cz.*, t.name as assigned_team_name
            FROM crowd_zones cz
            LEFT JOIN response_teams t ON cz.assigned_team_id = t.id
            ORDER BY cz.crowd_level DESC, cz.current_count DESC
            """)
            zones = rows_to_list(cur.fetchall())
            self.send_json({"crowd_zones": zones})

        # 8. Notifications
        elif path == "/api/notifications":
            cur.execute("""
            SELECT * FROM notifications
            WHERE target_role = ? OR target_role = 'ALL' OR target_role IS NULL
            ORDER BY created_at DESC LIMIT 30
            """, (user_role,))
            notifs = rows_to_list(cur.fetchall())
            self.send_json({"notifications": notifs})

        # 9. Analytics KPIs
        elif path == "/api/analytics":
            # Total incidents
            cur.execute("SELECT COUNT(*) FROM incidents")
            total_inc = cur.fetchone()[0]

            # Active incidents
            cur.execute("SELECT COUNT(*) FROM incidents WHERE status NOT IN ('RESOLVED', 'CLOSED')")
            active_inc = cur.fetchone()[0]

            # Critical alerts
            cur.execute("SELECT COUNT(*) FROM incidents WHERE priority = 'CRITICAL' AND status NOT IN ('RESOLVED', 'CLOSED')")
            critical_alerts = cur.fetchone()[0]

            # Missing persons
            cur.execute("SELECT COUNT(*) FROM missing_persons WHERE status != 'FOUND'")
            missing_count = cur.fetchone()[0]

            # Crowd alerts
            cur.execute("SELECT COUNT(*) FROM crowd_zones WHERE alert_status = 1")
            crowd_alerts = cur.fetchone()[0]

            # Available teams
            cur.execute("SELECT COUNT(*) FROM response_teams WHERE status = 'AVAILABLE'")
            available_teams = cur.fetchone()[0]

            # Category distribution
            cur.execute("SELECT category, COUNT(*) as count FROM incidents GROUP BY category")
            category_counts = rows_to_list(cur.fetchall())

            # Priority distribution
            cur.execute("SELECT priority, COUNT(*) as count FROM incidents GROUP BY priority")
            priority_counts = rows_to_list(cur.fetchall())

            # Status distribution
            cur.execute("SELECT status, COUNT(*) as count FROM incidents GROUP BY status")
            status_counts = rows_to_list(cur.fetchall())

            # Area / Landmark breakdown
            cur.execute("""
            SELECT location_name, COUNT(*) as count
            FROM incidents
            GROUP BY location_name
            ORDER BY count DESC LIMIT 8
            """)
            area_counts = rows_to_list(cur.fetchall())

            # Team Workload
            cur.execute("""
            SELECT t.name, t.team_type, t.status, COUNT(i.id) as active_cases
            FROM response_teams t
            LEFT JOIN incidents i ON t.id = i.assigned_team_id AND i.status NOT IN ('RESOLVED', 'CLOSED')
            GROUP BY t.id
            """)
            team_workload = rows_to_list(cur.fetchall())

            # Average response time (simulated calculation based on seed timestamps)
            avg_response_min = 6.4

            self.send_json({
                "kpis": {
                    "total_incidents": total_inc,
                    "active_incidents": active_inc,
                    "critical_alerts": critical_alerts,
                    "missing_persons": missing_count,
                    "crowd_alerts": crowd_alerts,
                    "available_teams": available_teams,
                    "resolved_cases": total_inc - active_inc,
                    "avg_response_minutes": avg_response_min
                },
                "category_breakdown": category_counts,
                "priority_breakdown": priority_counts,
                "status_breakdown": status_counts,
                "area_breakdown": area_counts,
                "team_workload": team_workload
            })

        # 10. Audit Logs (Admin only)
        elif path == "/api/audit-logs":
            if user_role != "ADMIN":
                self.send_json({"error": "Unauthorized access to audit logs"}, status=403)
                conn.close()
                return
            cur.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50")
            logs = rows_to_list(cur.fetchall())
            self.send_json({"audit_logs": logs})

        # 11. Cyber SOC Endpoints
        elif path == "/api/cyber/simulation/status":
            conn.close()
            self.send_json(get_simulation_status())
            return

        elif path == "/api/cyber/dashboard":
            conn.close()
            self.send_json(get_dashboard_stats())
            return

        elif path == "/api/cyber/events":
            conn.close()
            limit = int(query.get("limit", [50])[0])
            self.send_json({"events": get_cyber_events(limit)})
            return

        elif path == "/api/cyber/incidents":
            conn.close()
            self.send_json({"incidents": get_cyber_incidents()})
            return

        elif path.startswith("/api/cyber/incidents/"):
            inc_id = path.split("/")[-1]
            conn.close()
            inc_data = get_cyber_incident_detail(inc_id)
            if inc_data:
                self.send_json({"incident": inc_data})
            else:
                self.send_json({"error": "Cyber incident not found"}, status=404)
            return

        elif path == "/api/cyber/assets":
            conn.close()
            self.send_json({"assets": get_cyber_assets()})
            return

        else:
            self.send_json({"error": f"Path '{path}' not found"}, status=404)

        conn.close()

    def handle_api_post(self, path):
        conn = get_db()
        cur = conn.cursor()
        body = self.parse_body()
        current_user = get_current_user_from_headers(self.headers)
        user_role = current_user.get("role", "CITIZEN")
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Quick Auth Switch (for testing / demo)
        if path == "/api/auth/quick-switch":
            target_role = body.get("role", "ADMIN")
            cur.execute("SELECT * FROM users WHERE role = ? LIMIT 1", (target_role,))
            user = cur.fetchone()
            if user:
                self.send_json({"user": dict(user)})
            else:
                self.send_json({"error": "User role not found"}, status=404)

        # 2. Login
        elif path == "/api/auth/login":
            email = body.get("email", "").strip()
            password = body.get("password", "")
            pw_hash = hash_pw(password)
            cur.execute("SELECT * FROM users WHERE email = ? AND password_hash = ?", (email, pw_hash))
            user = cur.fetchone()
            if user:
                user_dict = dict(user)
                # Log audit
                cur.execute("INSERT INTO audit_logs (user_name, user_role, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
                            (user_dict["name"], user_dict["role"], "LOGIN", f"User logged in from Nagpur portal", now_str))
                conn.commit()
                self.send_json({"success": True, "user": user_dict})
            else:
                self.send_json({"error": "Invalid email or password for Nagpur Sentinel portal."}, status=401)

        # 3. AI Preview / Analysis Endpoint
        elif path == "/api/ai/analyze":
            title = body.get("title", "")
            desc = body.get("description", "")
            loc = body.get("location_name", "")
            analysis = analyze_incident(title, desc, loc)

            # Check duplicates against active database incidents
            cur.execute("SELECT id, title, category, description, latitude, longitude, status FROM incidents")
            existing = rows_to_list(cur.fetchall())
            dup_check = detect_duplicates(
                analysis["geocoded_location"]["lat"],
                analysis["geocoded_location"]["lng"],
                analysis["category"],
                desc,
                existing
            )

            self.send_json({
                "analysis": analysis,
                "duplicate_detection": dup_check
            })

        # 4. Quick Incident Report Submission (Citizen / Volunteer)
        elif path == "/api/incidents":
            title = body.get("title", "").strip() or "Citizen Incident Report"
            inc_type = body.get("incident_type", "Other")
            description = body.get("description", "").strip()
            location_name = body.get("location_name", "Nagpur").strip()
            is_anon = 1 if body.get("is_anonymous") else 0
            contact = body.get("contact", current_user.get("phone"))

            if not description:
                self.send_json({"error": "Incident description is required."}, status=400)
                conn.close()
                return

            # AI Analysis
            ai_res = analyze_incident(title, description, location_name)
            lat = body.get("latitude") or ai_res["geocoded_location"]["lat"]
            lng = body.get("longitude") or ai_res["geocoded_location"]["lng"]

            # Duplicate Detection
            cur.execute("SELECT id, title, category, description, latitude, longitude, status FROM incidents")
            existing = rows_to_list(cur.fetchall())
            dup_info = detect_duplicates(lat, lng, ai_res["category"], description, existing)

            # Generate Unique Nagpur Incident ID
            cur.execute("SELECT COUNT(*) FROM incidents")
            next_num = cur.fetchone()[0] + 101
            inc_id = f"INC-NGP-2026-00{next_num:04d}"

            # Auto suggest team
            suggested_team_type = ai_res["suggested_team_type"]
            cur.execute("SELECT id FROM response_teams WHERE team_type = ? AND status = 'AVAILABLE' LIMIT 1", (suggested_team_type,))
            avail_team = cur.fetchone()
            assigned_team = None # Left for admin verification unless auto-dispatch

            # Insert incident
            cur.execute("""
            INSERT INTO incidents (
                id, title, incident_type, category, description, location_name,
                latitude, longitude, reporter_id, reporter_name, reporter_contact,
                is_anonymous, priority, status, assigned_team_id, ai_category,
                ai_priority, ai_suggested_team_type, ai_confidence, ai_summary,
                is_verified_by_admin, is_duplicate_of, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                inc_id, title, inc_type, ai_res["category"], description, location_name,
                lat, lng, current_user["id"], current_user["name"], contact,
                is_anon, ai_res["priority"], "REPORTED", assigned_team,
                ai_res["category"], ai_res["priority"], suggested_team_type,
                ai_res["confidence"], ai_res["summary"], 0,
                dup_info["master_incident_id"] if dup_info["has_duplicate"] else None,
                now_str, now_str
            ))

            # Timeline event 1: Report Created
            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('INCIDENT', ?, 'Report Created', ?, ?, ?, ?)
            """, (inc_id, f"Incident filed via Sentinel mobile gateway at {location_name}.", current_user["name"], user_role, now_str))

            # Timeline event 2: AI Classification Completed
            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('INCIDENT', ?, 'AI Classification Completed', ?, 'AI Sentinel Core', 'SYSTEM', ?)
            """, (inc_id, ai_res["summary"], now_str))

            # Notification to Control Room
            notif_id = f"NOTIF-{datetime.now().strftime('%H%M%S%f')[:8]}"
            cur.execute("""
            INSERT INTO notifications (id, target_role, title, message, notification_type, related_id, is_read, created_at)
            VALUES (?, 'ADMIN', ?, ?, 'INCIDENT', ?, 0, ?)
            """, (notif_id, f"New Incident: {inc_id} ({ai_res['priority']})", f"{title} at {location_name}. AI: {ai_res['category']}.", inc_id, now_str))

            # Audit log
            cur.execute("INSERT INTO audit_logs (user_name, user_role, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
                        (current_user["name"], user_role, "REPORT_INCIDENT", f"Reported {inc_id} at {location_name}", now_str))

            conn.commit()

            self.send_json({
                "success": True,
                "incident_id": inc_id,
                "priority": ai_res["priority"],
                "category": ai_res["category"],
                "duplicate_alert": dup_info,
                "message": f"Incident {inc_id} successfully recorded in Nagpur Security Command database."
            }, status=201)

        # 5. Admin Verify AI Suggestion
        elif path.endswith("/verify"):
            inc_id = path.replace("/api/incidents/", "").replace("/verify", "").strip("/")
            verified_priority = body.get("priority")
            verified_category = body.get("category")

            cur.execute("SELECT * FROM incidents WHERE id = ?", (inc_id,))
            inc = cur.fetchone()
            if not inc:
                self.send_json({"error": "Incident not found"}, status=404)
                conn.close()
                return

            new_priority = verified_priority or inc["priority"]
            new_cat = verified_category or inc["category"]

            cur.execute("""
            UPDATE incidents
            SET is_verified_by_admin = 1, status = 'VERIFIED', priority = ?, category = ?, updated_at = ?
            WHERE id = ?
            """, (new_priority, new_cat, now_str, inc_id))

            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('INCIDENT', ?, 'Authority Verification', ?, ?, 'ADMIN', ?)
            """, (inc_id, f"Admin confirmed classification: [{new_cat}], Priority: [{new_priority}].", current_user["name"], now_str))

            conn.commit()
            self.send_json({"success": True, "message": f"Incident {inc_id} verified by {current_user['name']}."})

        # 6. Admin Assign Response Team
        elif path.endswith("/assign"):
            inc_id = path.replace("/api/incidents/", "").replace("/assign", "").strip("/")
            team_id = body.get("team_id")

            cur.execute("SELECT * FROM response_teams WHERE id = ?", (team_id,))
            team = cur.fetchone()
            if not team:
                self.send_json({"error": "Response team not found"}, status=404)
                conn.close()
                return

            # Update incident
            cur.execute("""
            UPDATE incidents
            SET assigned_team_id = ?, status = 'ASSIGNED', updated_at = ?
            WHERE id = ?
            """, (team_id, now_str, inc_id))

            # Update team status
            cur.execute("""
            UPDATE response_teams
            SET status = 'DISPATCHED', active_incident_id = ?, updated_at = ?
            WHERE id = ?
            """, (inc_id, now_str, team_id))

            # Timeline
            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('INCIDENT', ?, 'Team Assigned', ?, ?, 'ADMIN', ?)
            """, (inc_id, f"Assigned to {team['name']} ({team['leader_name']}, Ph: {team['contact_phone']}).", current_user["name"], now_str))

            # Notify team / security staff
            notif_id = f"NOTIF-{datetime.now().strftime('%H%M%S%f')[:8]}"
            cur.execute("""
            INSERT INTO notifications (id, target_role, title, message, notification_type, related_id, is_read, created_at)
            VALUES (?, 'SECURITY_STAFF', ?, ?, 'ASSIGNMENT', ?, 0, ?)
            """, (notif_id, f"Dispatch Order: {inc_id}", f"Your unit '{team['name']}' has been dispatched to {inc_id}.", inc_id, now_str))

            conn.commit()
            self.send_json({"success": True, "message": f"Team {team['name']} dispatched to {inc_id}."})

        # 7. Update Incident Status Lifecycle
        elif path.endswith("/status"):
            inc_id = path.replace("/api/incidents/", "").replace("/status", "").strip("/")
            new_status = body.get("status")
            notes = body.get("notes", "")

            valid_statuses = ['REPORTED', 'VERIFIED', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
            if new_status not in valid_statuses:
                self.send_json({"error": "Invalid status transition"}, status=400)
                conn.close()
                return

            cur.execute("SELECT * FROM incidents WHERE id = ?", (inc_id,))
            inc = cur.fetchone()
            if not inc:
                self.send_json({"error": "Incident not found"}, status=404)
                conn.close()
                return

            cur.execute("UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?", (new_status, now_str, inc_id))

            # If resolved or closed, free up the response team
            if new_status in ['RESOLVED', 'CLOSED'] and inc["assigned_team_id"]:
                cur.execute("UPDATE response_teams SET status = 'AVAILABLE', active_incident_id = NULL WHERE id = ?", (inc["assigned_team_id"],))

            # Add Timeline Event
            status_labels = {
                'ACKNOWLEDGED': 'Team Acknowledged',
                'IN_PROGRESS': 'Response In Progress',
                'RESOLVED': 'Incident Resolved',
                'CLOSED': 'Case Officially Closed'
            }
            title = status_labels.get(new_status, f"Status: {new_status}")
            desc = notes or f"Incident status changed to {new_status} by {current_user['name']}."

            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('INCIDENT', ?, ?, ?, ?, ?, ?)
            """, (inc_id, title, desc, current_user["name"], user_role, now_str))

            # Audit
            cur.execute("INSERT INTO audit_logs (user_name, user_role, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
                        (current_user["name"], user_role, "STATUS_CHANGE", f"Updated {inc_id} to {new_status}", now_str))

            conn.commit()
            self.send_json({"success": True, "status": new_status, "message": f"Status updated to {new_status}."})

        # 8. Duplicate Merge / Keep Separate Action
        elif path.endswith("/duplicate-action"):
            inc_id = path.replace("/api/incidents/", "").replace("/duplicate-action", "").strip("/")
            action = body.get("action") # 'MERGE' or 'KEEP_SEPARATE'
            master_id = body.get("master_id")

            if action == "MERGE" and master_id:
                cur.execute("UPDATE incidents SET is_duplicate_of = ?, status = 'CLOSED', updated_at = ? WHERE id = ?", (master_id, now_str, inc_id))
                cur.execute("""
                INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
                VALUES ('INCIDENT', ?, 'Duplicate Merged', ?, ?, 'ADMIN', ?)
                """, (master_id, f"Duplicate incident {inc_id} merged into this master ticket.", current_user["name"], now_str))
                msg = f"Incident {inc_id} linked as duplicate and merged into Master {master_id}."
            else:
                cur.execute("UPDATE incidents SET is_duplicate_of = NULL, updated_at = ? WHERE id = ?", (now_str, inc_id))
                msg = f"Incident {inc_id} verified as distinct and retained as standalone case."

            conn.commit()
            self.send_json({"success": True, "message": msg})

        # 9. Missing Person Report (Child or Elderly)
        elif path == "/api/missing-persons":
            person_type = body.get("person_type", "CHILD") # CHILD or ELDERLY
            full_name = body.get("full_name", "").strip()
            age = int(body.get("age", 0))
            gender = body.get("gender", "MALE")
            last_seen_loc = body.get("last_seen_location", "Nagpur").strip()
            last_seen_time = body.get("last_seen_time", now_str)
            clothing = body.get("clothing_description", "").strip()
            marks = body.get("identifying_marks", "").strip()
            photo = body.get("photo_url")
            rep_name = body.get("reporter_name", current_user["name"])
            rep_phone = body.get("reporter_phone", current_user.get("phone", "+91-9800000000"))
            rep_rel = body.get("reporter_relationship", "Family Member")
            radius = int(body.get("search_radius_meters", 500))

            if not full_name:
                self.send_json({"error": "Person name is required."}, status=400)
                conn.close()
                return

            loc_geo = extract_nagpur_location(last_seen_loc)
            lat = body.get("latitude") or loc_geo["lat"]
            lng = body.get("longitude") or loc_geo["lng"]

            cur.execute("SELECT COUNT(*) FROM missing_persons")
            next_mp = cur.fetchone()[0] + 43
            mp_id = f"MP-NGP-2026-00{next_mp:04d}"

            # Auto suggest Orange City Search Team
            cur.execute("SELECT id FROM response_teams WHERE team_type = 'SEARCH_TEAM' AND status = 'AVAILABLE' LIMIT 1")
            s_team = cur.fetchone()
            assigned_team = s_team[0] if s_team else None

            cur.execute("""
            INSERT INTO missing_persons VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                mp_id, person_type, full_name, age, gender, last_seen_loc, last_seen_time,
                lat, lng, clothing, marks, photo, rep_name, rep_phone, rep_rel,
                "SEARCHING", assigned_team, radius, now_str, now_str
            ))

            # Case timeline
            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('MISSING_PERSON', ?, 'Missing Person Case Opened', ?, ?, ?, ?)
            """, (mp_id, f"Case opened for {person_type.lower()}: {full_name}, age {age}. Last seen at {last_seen_loc}.", current_user["name"], user_role, now_str))

            # Notify Volunteers & Help Desks
            notif_id = f"NOTIF-{datetime.now().strftime('%H%M%S%f')[:8]}"
            cur.execute("""
            INSERT INTO notifications (id, target_role, title, message, notification_type, related_id, is_read, created_at)
            VALUES (?, 'VOLUNTEER', ?, ?, 'MISSING_PERSON', ?, 0, ?)
            """, (notif_id, f"Search Alert: Missing {person_type.capitalize()} in {loc_geo['name']}", f"{age}yo {gender.lower()} wearing {clothing}. Check search radius.", mp_id, now_str))

            conn.commit()
            self.send_json({
                "success": True,
                "missing_person_id": mp_id,
                "message": f"Case {mp_id} registered. Search radius of {radius}m activated in Nagpur zone."
            }, status=201)

        # 10. Missing Person Sighting Submission
        elif path.endswith("/sighting"):
            mp_id = path.replace("/api/missing-persons/", "").replace("/sighting", "").strip("/")
            loc = body.get("sighting_location", "Nagpur")
            notes = body.get("notes", "")
            geo = extract_nagpur_location(loc)
            lat = body.get("latitude") or geo["lat"]
            lng = body.get("longitude") or geo["lng"]

            cur.execute("SELECT COUNT(*) FROM sightings")
            s_count = cur.fetchone()[0] + 1
            s_id = f"SGT-NGP-{s_count:03d}"

            cur.execute("""
            INSERT INTO sightings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (s_id, mp_id, current_user["id"], current_user["name"], loc, lat, lng, now_str, notes, None, 0, now_str))

            # Update MP status to SIGHTING_VERIFYING
            cur.execute("UPDATE missing_persons SET status = 'SIGHTING_VERIFYING', updated_at = ? WHERE id = ?", (now_str, mp_id))

            # Timeline
            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('MISSING_PERSON', ?, 'New Sighting Reported', ?, ?, ?, ?)
            """, (mp_id, f"Volunteer sighting reported near {loc}: '{notes}'", current_user["name"], user_role, now_str))

            conn.commit()
            self.send_json({"success": True, "sighting_id": s_id, "message": "Sighting submitted to control room for verification."})

        # 11. Missing Person Status Update (e.g. Found / Closed)
        elif path.endswith("/mp-status"):
            mp_id = path.replace("/api/missing-persons/", "").replace("/mp-status", "").strip("/")
            status = body.get("status", "FOUND") # SEARCHING, SIGHTING_VERIFYING, FOUND, CLOSED
            notes = body.get("notes", "")

            cur.execute("UPDATE missing_persons SET status = ?, updated_at = ? WHERE id = ?", (status, now_str, mp_id))

            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('MISSING_PERSON', ?, ?, ?, ?, ?, ?)
            """, (mp_id, f"Case Status: {status}", notes or f"Case marked as {status} by {current_user['name']}.", current_user["name"], user_role, now_str))

            conn.commit()
            self.send_json({"success": True, "message": f"Case {mp_id} updated to {status}."})

        # 12. Crowd Zone Density Update (Simulated sensor feed / Manual adjustment)
        elif path.endswith("/crowd-count"):
            zone_id = path.replace("/api/crowd-zones/", "").replace("/crowd-count", "").strip("/")
            count = int(body.get("current_count", 0))

            cur.execute("SELECT * FROM crowd_zones WHERE id = ?", (zone_id,))
            zone = cur.fetchone()
            if not zone:
                self.send_json({"error": "Zone not found"}, status=404)
                conn.close()
                return

            cap = zone["capacity"]
            pct = (count / cap) * 100 if cap > 0 else 0

            if pct >= 90:
                level = "CRITICAL"
                risk = "HIGH_RISK"
                alert = 1
            elif pct >= 75:
                level = "HIGH"
                risk = "ELEVATED"
                alert = 1
            elif pct >= 45:
                level = "MEDIUM"
                risk = "NORMAL"
                alert = 0
            else:
                level = "LOW"
                risk = "NORMAL"
                alert = 0

            cur.execute("""
            UPDATE crowd_zones
            SET current_count = ?, crowd_level = ?, risk_level = ?, alert_status = ?, updated_at = ?
            WHERE id = ?
            """, (count, level, risk, alert, now_str, zone_id))

            if alert == 1:
                # Dispatch alert notification
                notif_id = f"NOTIF-{datetime.now().strftime('%H%M%S%f')[:8]}"
                cur.execute("""
                INSERT INTO notifications (id, target_role, title, message, notification_type, related_id, is_read, created_at)
                VALUES (?, 'ADMIN', ?, ?, 'CROWD', ?, 0, ?)
                """, (notif_id, f"CROWD ALERT: {zone['zone_name']}", f"Capacity at {round(pct)}% ({count}/{cap}). Action recommended.", zone_id, now_str))

            conn.commit()
            self.send_json({
                "success": True,
                "current_count": count,
                "crowd_level": level,
                "risk_level": risk,
                "alert_status": alert,
                "percentage": round(pct, 1)
            })

        # 13. Safe Journey Mode
        elif path == "/api/safe-journey/start":
            start_loc = body.get("start_location", "Sitabuldi Interchange")
            dest = body.get("destination", "Coffee House Square, Dharampeth")
            contact_name = body.get("trusted_contact_name", "Family Contact")
            contact_phone = body.get("trusted_contact_phone", "+91-9800000000")

            start_geo = extract_nagpur_location(start_loc)
            dest_geo = extract_nagpur_location(dest)

            sj_id = f"SJ-NGP-{datetime.now().strftime('%H%M%S')}"

            cur.execute("""
            INSERT INTO safe_journeys VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0, ?, ?)
            """, (
                sj_id, current_user["id"], start_loc, dest,
                start_geo["lat"], start_geo["lng"],
                dest_geo["lat"], dest_geo["lng"],
                start_geo["lat"], start_geo["lng"],
                contact_name, contact_phone,
                now_str, now_str
            ))
            conn.commit()

            self.send_json({
                "success": True,
                "journey_id": sj_id,
                "message": f"Safe Journey activated from {start_loc} to {dest}. Monitoring active route in Nagpur."
            })

        elif path.endswith("/deviation"):
            # Trigger simulated deviation
            sj_id = path.replace("/api/safe-journey/", "").replace("/deviation", "").strip("/")
            cur.execute("UPDATE safe_journeys SET status = 'DEVIATION_ALERT', deviation_detected = 1, updated_at = ? WHERE id = ?", (now_str, sj_id))
            conn.commit()
            self.send_json({
                "success": True,
                "alert": True,
                "prompt": "Route deviation detected. Are you safe?",
                "message": "Simulated deviation triggered. Citizen safety prompt displayed."
            })

        elif path.endswith("/check-in"):
            sj_id = path.replace("/api/safe-journey/", "").replace("/check-in", "").strip("/")
            response = body.get("response", "SAFE") # SAFE or NEED_HELP

            if response == "SAFE":
                cur.execute("UPDATE safe_journeys SET status = 'CHECKED_SAFE', updated_at = ? WHERE id = ?", (now_str, sj_id))
                msg = "Confirmed safe. Journey monitoring continues."
            else:
                cur.execute("UPDATE safe_journeys SET status = 'EMERGENCY_TRIGGERED', updated_at = ? WHERE id = ?", (now_str, sj_id))
                # Trigger critical incident on dashboard
                cur.execute("SELECT * FROM safe_journeys WHERE id = ?", (sj_id,))
                sj = cur.fetchone()
                inc_id = f"INC-NGP-2026-SJ{sj_id[-4:]}"
                cur.execute("""
                INSERT INTO incidents (
                    id, title, incident_type, category, description, location_name,
                    latitude, longitude, reporter_id, reporter_name, reporter_contact,
                    is_anonymous, priority, status, created_at, updated_at
                ) VALUES (?, ?, 'Personal safety', 'Personal & Women Safety', ?, ?, ?, ?, ?, ?, ?, 0, 'CRITICAL', 'REPORTED', ?, ?)
                """, (
                    inc_id, f"Safe Journey Emergency: {sj['start_location']} -> {sj['destination']}",
                    f"Citizen triggered NEED HELP following route deviation between {sj['start_location']} and {sj['destination']}. Emergency contact: {sj['trusted_contact_name']} ({sj['trusted_contact_phone']})",
                    sj['destination'], sj['dest_lat'], sj['dest_lng'],
                    current_user["id"], current_user["name"], sj['trusted_contact_phone'],
                    now_str, now_str
                ))
                msg = "EMERGENCY DISPATCHED: Trusted contacts notified and Security Command alerted."

            conn.commit()
            self.send_json({"success": True, "message": msg})

        # 14. 1-Click SOS Trigger
        elif path == "/api/sos":
            loc_name = body.get("location_name", "Sitabuldi Interchange, Nagpur")
            geo = extract_nagpur_location(loc_name)
            lat = body.get("latitude") or geo["lat"]
            lng = body.get("longitude") or geo["lng"]
            sos_type = body.get("sos_type", "General Emergency")

            cur.execute("SELECT COUNT(*) FROM incidents")
            inc_id = f"INC-NGP-2026-SOS{cur.fetchone()[0] + 101}"

            # Create instant CRITICAL incident
            cur.execute("""
            INSERT INTO incidents (
                id, title, incident_type, category, description, location_name,
                latitude, longitude, reporter_id, reporter_name, reporter_contact,
                is_anonymous, priority, status, created_at, updated_at
            ) VALUES (?, ?, 'Emergency', 'SOS Emergency', ?, ?, ?, ?, ?, ?, ?, 0, 'CRITICAL', 'REPORTED', ?, ?)
            """, (
                inc_id, f"URGENT SOS: {sos_type} at {loc_name}",
                f"Instant 1-Click SOS triggered by {current_user['name']} at {loc_name}. Immediate nearest security and medical units requested.",
                loc_name, lat, lng,
                current_user["id"], current_user["name"], current_user.get("phone", "+91-9800000000"),
                now_str, now_str
            ))

            # Timeline
            cur.execute("""
            INSERT INTO case_timeline (entity_type, entity_id, event_title, event_description, performed_by_name, role, created_at)
            VALUES ('INCIDENT', ?, 'SOS Broadcast', 'Citizen activated 1-click emergency SOS. GPS coordinates captured.', ?, 'CITIZEN', ?)
            """, (inc_id, current_user["name"], now_str))

            # Immediate Notification
            notif_id = f"NOTIF-{datetime.now().strftime('%H%M%S%f')[:8]}"
            cur.execute("""
            INSERT INTO notifications (id, target_role, title, message, notification_type, related_id, is_read, created_at)
            VALUES (?, 'ADMIN', ?, ?, 'SOS', ?, 0, ?)
            """, (notif_id, f"🚨 CRITICAL SOS: {loc_name}", f"Instant emergency alert by {current_user['name']}.", inc_id, now_str))

            conn.commit()
            self.send_json({
                "success": True,
                "incident_id": inc_id,
                "message": "SOS Emergency signal broadcasted to Nagpur Central Command. Response units alerted."
            })

        # 16. Cyber Simulation Trigger Endpoints
        elif path == "/api/cyber/simulation/start":
            conn.close()
            scenario = body.get("scenario_type", "RANSOMWARE")
            auto_play = body.get("auto_play", True)
            step_delay = float(body.get("step_delay", 3.0))
            res = start_simulation(scenario, auto_play, step_delay)
            self.send_json(res)
            return

        elif path == "/api/cyber/simulation/next-step":
            conn.close()
            res = advance_simulation_step()
            self.send_json(res)
            return

        elif path == "/api/cyber/simulation/stop":
            conn.close()
            res = stop_simulation()
            self.send_json(res)
            return

        elif path == "/api/cyber/simulation/reset":
            conn.close()
            res = reset_simulation()
            self.send_json(res)
            return

        else:
            self.send_json({"error": "Endpoint not found"}, status=404)

        conn.close()

def run_server():
    init_db()
    server_address = ('', PORT)
    httpd = socketserver.ThreadingTCPServer(server_address, SentinelHandler)
    httpd.allow_reuse_address = True
    print(f"SENTINEL Server running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
        print("Server stopped.")

if __name__ == "__main__":
    run_server()
