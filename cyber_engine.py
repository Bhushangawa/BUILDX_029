# SENTINEL — Cyber Attack Simulation & Automated Response SOC Engine
# Realistic, safe, defensive cybersecurity simulation engine with AI analysis,
# automated isolation, legitimate user protection, and real-time state management.

import sqlite3
import time
import uuid
from datetime import datetime, timedelta
from database import get_db

# 6 Controlled Simulation Scenario Definitions
SCENARIOS = {
    "RANSOMWARE": {
        "title": "Distributed Ransomware Encryption Attempt on Workstation Cluster",
        "type": "Ransomware Simulation",
        "affected_asset_id": "ASSET-NGP-04",
        "affected_asset_name": "Command Room SOC Dispatch Terminal",
        "attack_source_ip": "198.51.100.74",
        "mitre_technique": "T1486 — Data Encrypted for Impact",
        "severity": "CRITICAL",
        "peak_risk_score": 94,
        "ai_confidence": 0.96,
        "detection_reason": "Rapid entropy surge in filesystem (98.4%) and anomalous batch creation of encrypted file headers detected on endpoint ASSET-NGP-04.",
        "recommended_action": "Execute automated micro-segmentation, quarantine endpoint host, kill rogue encryption thread, and stage immutable snapshot restore.",
        "steps": [
            {
                "step": 1,
                "phase": "DETECTING",
                "phase_label": "Attack Detected",
                "risk_score": 45,
                "asset_status": "SUSPICIOUS",
                "event_name": "High Entropy File Operation Anomaly",
                "action_taken": "Triggered Behavioral File Integrity Alert",
                "status": "Investigating",
                "response_action": "Sensors flagged 320 file modifications/sec on /var/data/dispatch",
                "summary": "Suspicious rapid file encryption pattern detected on Command Room Workstation."
            },
            {
                "step": 2,
                "phase": "ANALYZING",
                "phase_label": "Threat Analyzed",
                "risk_score": 75,
                "asset_status": "SUSPICIOUS",
                "event_name": "Ransomware Signature Match (LockBit Variant)",
                "action_taken": "AI Threat Heuristic Correlated",
                "status": "Analyzing",
                "response_action": "Matched payload behavior to Ransom.LockBit.v4 with 96% AI confidence",
                "summary": "AI Threat Engine confirmed active ransomware attempting lateral spread."
            },
            {
                "step": 3,
                "phase": "CRITICAL",
                "phase_label": "Risk Classified",
                "risk_score": 94,
                "asset_status": "SUSPICIOUS",
                "event_name": "Critical Threat Escalation Triggered",
                "action_taken": "Emergency SOC Alert Broadcasted",
                "status": "Escalated",
                "response_action": "Threat level elevated to CRITICAL. Affected host tagged for isolation",
                "summary": "Risk score reached 94/100. Automated defense engine engaging response playbooks."
            },
            {
                "step": 4,
                "phase": "CRITICAL",
                "phase_label": "Asset Isolated",
                "risk_score": 88,
                "asset_status": "ISOLATED",
                "event_name": "Automated Network Micro-Segmentation",
                "action_taken": "Host Network Interface Quarantined",
                "status": "Isolated",
                "response_action": "Host ASSET-NGP-04 isolated at SDN level. Port 445/3389 severed",
                "summary": "Device automatically isolated from Nagpur smart grid subnet to prevent lateral movement."
            },
            {
                "step": 5,
                "phase": "CONTAINED",
                "phase_label": "Threat Contained",
                "risk_score": 52,
                "asset_status": "ISOLATED",
                "event_name": "C2 Beacon Neutralized & Process Killed",
                "action_taken": "Egress Firewall Rule Enacted",
                "status": "Contained",
                "response_action": "Source IP 198.51.100.74 blacklisted. Malicious PID 3892 terminated",
                "summary": "Adversary connection severed. Zero lateral movement across command network."
            },
            {
                "step": 6,
                "phase": "RECOVERING",
                "phase_label": "Recovery Initiated",
                "risk_score": 20,
                "asset_status": "RECOVERING",
                "event_name": "Immutable Snapshot Rollback",
                "action_taken": "Filesystem Snapshot Restored",
                "status": "Recovering",
                "response_action": "Restored 14 uncorrupted files from verified 14:00 shadow copy snapshot",
                "summary": "Automated recovery restored clean files. Legitimate users experienced 100% continuity."
            },
            {
                "step": 7,
                "phase": "RESOLVED",
                "phase_label": "System Restored",
                "risk_score": 0,
                "asset_status": "NORMAL",
                "event_name": "Post-Incident Forensic Clearance",
                "action_taken": "Asset Re-attached to Production Network",
                "status": "Completed",
                "response_action": "Cryptographic checksum SHA-256 verified. Host ASSET-NGP-04 restored to NORMAL",
                "summary": "Incident RESOLVED. Zero data loss. All 1,420 citizen & admin users remained fully protected."
            }
        ]
    },

    "PHISHING": {
        "title": "Credential Harvesting Spear-Phishing Campaign on Admin Gateways",
        "type": "Phishing Attempt Simulation",
        "affected_asset_id": "ASSET-NGP-01",
        "affected_asset_name": "Nagpur Smart Grid Auth Gateway",
        "attack_source_ip": "203.0.113.19",
        "mitre_technique": "T1566.002 — Phishing: Spearphishing Link",
        "severity": "HIGH",
        "peak_risk_score": 86,
        "ai_confidence": 0.95,
        "detection_reason": "Adversary-in-the-Middle (AiTM) reverse proxy spoofing portal login domain detected with invalid TLS cert fingerprint.",
        "recommended_action": "Revoke active token cookies, mandate hardware FIDO2 re-authentication, block spoofed origin domain at recursive DNS resolver.",
        "steps": [
            {
                "step": 1,
                "phase": "DETECTING",
                "phase_label": "Attack Detected",
                "risk_score": 40,
                "asset_status": "SUSPICIOUS",
                "event_name": "Anomalous Login Redirect Pattern",
                "action_taken": "DNS Mismatch Flagged by Web Application Firewall",
                "status": "Investigating",
                "response_action": "Detected 18 unauthorized redirects to clone domain auth-sentinel-portal.net",
                "summary": "Phishing proxy attempt detected targeting admin login tokens."
            },
            {
                "step": 2,
                "phase": "ANALYZING",
                "phase_label": "Threat Analyzed",
                "risk_score": 68,
                "asset_status": "SUSPICIOUS",
                "event_name": "Adversary-in-the-Middle Proxy Confirmed",
                "action_taken": "AI Session Fingerprint Analysis",
                "status": "Analyzing",
                "response_action": "AI detected TLS JA3 fingerprint mismatch on source IP 203.0.113.19",
                "summary": "AI verified credential harvesting proxy attempting to capture JWT session keys."
            },
            {
                "step": 3,
                "phase": "CRITICAL",
                "phase_label": "Risk Classified",
                "risk_score": 86,
                "asset_status": "SUSPICIOUS",
                "event_name": "High Severity Credential Risk Alert",
                "action_taken": "Quarantine Directive Sent to Identity Provider",
                "status": "Escalated",
                "response_action": "Flagged 2 targeted operator sessions for emergency containment",
                "summary": "Risk score elevated to 86/100. Immediate session invalidation triggered."
            },
            {
                "step": 4,
                "phase": "CRITICAL",
                "phase_label": "Asset Isolated",
                "risk_score": 70,
                "asset_status": "ISOLATED",
                "event_name": "Compromised Tokens Revoked",
                "action_taken": "Session Tokens Blacklisted in Redis Cache",
                "status": "Isolated",
                "response_action": "Quarantined 2 target sessions; triggered instant logout on rogue endpoints",
                "summary": "Suspicious login tokens revoked immediately to stop unauthorized entry."
            },
            {
                "step": 5,
                "phase": "CONTAINED",
                "phase_label": "Threat Contained",
                "risk_score": 45,
                "asset_status": "ISOLATED",
                "event_name": "Domain Sinkholed & IP Blocked",
                "action_taken": "DNS RPZ Policy Activated",
                "status": "Contained",
                "response_action": "Source IP 203.0.113.19 blocked. Phishing clone domain sinkholed to 127.0.0.1",
                "summary": "Phishing domain sinkholed at gateway level. No credentials harvested."
            },
            {
                "step": 6,
                "phase": "RECOVERING",
                "phase_label": "Recovery Initiated",
                "risk_score": 18,
                "asset_status": "RECOVERING",
                "event_name": "Enforced Hardware MFA Re-Authentication",
                "action_taken": "FIDO2 Challenge Dispatched",
                "status": "Recovering",
                "response_action": "Targeted staff successfully re-authenticated via hardware biometrics",
                "summary": "Staff accounts secured. Legitimate citizens continued using public portal without disruption."
            },
            {
                "step": 7,
                "phase": "RESOLVED",
                "phase_label": "System Restored",
                "risk_score": 0,
                "asset_status": "NORMAL",
                "event_name": "Auth Gateway Health Cleared",
                "action_taken": "Baseline Token Generation Resumed",
                "status": "Completed",
                "response_action": "Auth Gateway ASSET-NGP-01 restored to 100% nominal health score",
                "summary": "Incident RESOLVED. Phishing campaign neutralized with 100% citizen protection."
            }
        ]
    },

    "UNAUTHORIZED_ACCESS": {
        "title": "Brute Force SSH & Privilege Escalation Attempt on DB Cluster",
        "type": "Unauthorized Access Simulation",
        "affected_asset_id": "ASSET-NGP-02",
        "affected_asset_name": "Central Traffic & Incident DB Cluster",
        "attack_source_ip": "185.220.101.42",
        "mitre_technique": "T1110.001 — Brute Force: Password Guessing",
        "severity": "HIGH",
        "peak_risk_score": 89,
        "ai_confidence": 0.97,
        "detection_reason": "450 failed SSH root authentication attempts detected within 15 seconds from known Tor exit node 185.220.101.42.",
        "recommended_action": "Enforce dynamic IP null-routing at boundary router, disable password auth for SSH, rotate database connection keys.",
        "steps": [
            {
                "step": 1,
                "phase": "DETECTING",
                "phase_label": "Attack Detected",
                "risk_score": 48,
                "asset_status": "SUSPICIOUS",
                "event_name": "Rapid SSH Failure Burst",
                "action_taken": "Rate Limiter Threshold Exceeded",
                "status": "Investigating",
                "response_action": "450 failed root auth attempts logged on port 22 in 15 seconds",
                "summary": "Brute force attack burst detected against central database cluster."
            },
            {
                "step": 2,
                "phase": "ANALYZING",
                "phase_label": "Threat Analyzed",
                "risk_score": 72,
                "asset_status": "SUSPICIOUS",
                "event_name": "Tor Exit Node Anonymizer Match",
                "action_taken": "Threat Intelligence Feed Correlated",
                "status": "Analyzing",
                "response_action": "Source IP 185.220.101.42 matches high-risk anonymizer feed",
                "summary": "AI identified coordinated dictionary attack aiming for root database access."
            },
            {
                "step": 3,
                "phase": "CRITICAL",
                "phase_label": "Risk Classified",
                "risk_score": 89,
                "asset_status": "SUSPICIOUS",
                "event_name": "Privilege Escalation Risk Alert",
                "action_taken": "Automated Defense Policy Triggered",
                "status": "Escalated",
                "response_action": "Threat categorized as HIGH severity. Database port protection engaged",
                "summary": "Risk score 89/100. Critical database assets flagged for automated perimeter defense."
            },
            {
                "step": 4,
                "phase": "CRITICAL",
                "phase_label": "Asset Isolated",
                "risk_score": 74,
                "asset_status": "ISOLATED",
                "event_name": "Management Ingress Blocked",
                "action_taken": "Firewall Ingress Rule Applied",
                "status": "Isolated",
                "response_action": "Management port 22 isolated on ASSET-NGP-02. SQL cluster preserved",
                "summary": "External SSH access severed while internal database queries remain functional."
            },
            {
                "step": 5,
                "phase": "CONTAINED",
                "phase_label": "Threat Contained",
                "risk_score": 42,
                "asset_status": "ISOLATED",
                "event_name": "Source IP Null-Routed",
                "action_taken": "BGP Blackhole Route Dispatched",
                "status": "Contained",
                "response_action": "Source IP 185.220.101.42 permanently banned at boundary firewall",
                "summary": "Attacker IP blocked. Zero unauthorized logins occurred."
            },
            {
                "step": 6,
                "phase": "RECOVERING",
                "phase_label": "Recovery Initiated",
                "risk_score": 15,
                "asset_status": "RECOVERING",
                "event_name": "SSH Key Rotation & Audit Check",
                "action_taken": "Cryptographic Key Refresh",
                "status": "Recovering",
                "response_action": "Rotated cluster keys; verified zero database schema tamper",
                "summary": "Database integrity verified 100% intact. Production read replicas operational."
            },
            {
                "step": 7,
                "phase": "RESOLVED",
                "phase_label": "System Restored",
                "risk_score": 0,
                "asset_status": "NORMAL",
                "event_name": "Database Cluster Verified Nominal",
                "action_taken": "Access Policy Updated to Public-Key Only",
                "status": "Completed",
                "response_action": "Cluster ASSET-NGP-02 status restored to NORMAL. Rate limiter re-armed",
                "summary": "Incident RESOLVED. Central database protected without a single millisecond of downtime."
            }
        ]
    },

    "SUSPICIOUS_LOGIN": {
        "title": "Impossible Travel Anomaly & Suspicious Multi-Session Hijack",
        "type": "Suspicious Login Simulation",
        "affected_asset_id": "ASSET-NGP-05",
        "affected_asset_name": "Citizen Public API & SOS Proxy",
        "attack_source_ip": "45.154.255.88",
        "mitre_technique": "T1078.003 — Valid Accounts: Local Accounts",
        "severity": "HIGH",
        "peak_risk_score": 82,
        "ai_confidence": 0.94,
        "detection_reason": "Impossible geo-velocity detected: Operator logged in from Nagpur (India), followed by concurrent login from Moscow (Russia) within 4 minutes (speed > 4,800 km/h).",
        "recommended_action": "Terminate anomalous overseas session, issue instant SMS/OTP step-up verification to authorized mobile device.",
        "steps": [
            {
                "step": 1,
                "phase": "DETECTING",
                "phase_label": "Attack Detected",
                "risk_score": 38,
                "asset_status": "SUSPICIOUS",
                "event_name": "Geo-Velocity Travel Anomaly",
                "action_taken": "AI Geo-Location Flag Triggered",
                "status": "Investigating",
                "response_action": "Concurrent logins detected: Nagpur (21.14N, 79.08E) vs Moscow (55.75N, 37.61E)",
                "summary": "Impossible travel velocity flagged for operator account."
            },
            {
                "step": 2,
                "phase": "ANALYZING",
                "phase_label": "Threat Analyzed",
                "risk_score": 64,
                "asset_status": "SUSPICIOUS",
                "event_name": "Session Hijack Confidence 94%",
                "action_taken": "Behavioral Anomaly Correlated",
                "status": "Analyzing",
                "response_action": "AI confirmed IP 45.154.255.88 attempted cookie reuse from untrusted user-agent",
                "summary": "AI identified stolen session cookie replay attack from unauthorized geographic region."
            },
            {
                "step": 3,
                "phase": "CRITICAL",
                "phase_label": "Risk Classified",
                "risk_score": 82,
                "asset_status": "SUSPICIOUS",
                "event_name": "Account Takeover Risk Escalation",
                "action_taken": "Policy Lockdown Engaged",
                "status": "Escalated",
                "response_action": "Threat classified as HIGH. Triggered adaptive session boundary containment",
                "summary": "Risk score 82/100. Emergency automated defense protocol activated."
            },
            {
                "step": 4,
                "phase": "CRITICAL",
                "phase_label": "Asset Isolated",
                "risk_score": 68,
                "asset_status": "ISOLATED",
                "event_name": "Overseas Session Terminated",
                "action_taken": "Session ID SESS-8821 Purged",
                "status": "Isolated",
                "response_action": "Foreign session terminated; locked down API proxy gateway path",
                "summary": "Rogue session revoked instantly. Legitimate Nagpur session kept intact under observation."
            },
            {
                "step": 5,
                "phase": "CONTAINED",
                "phase_label": "Threat Contained",
                "risk_score": 38,
                "asset_status": "ISOLATED",
                "event_name": "Malicious Subnet Blacklisted",
                "action_taken": "Geo-IP Boundary Rule Enforced",
                "status": "Contained",
                "response_action": "Blocked IP 45.154.255.88 and associated ASN subnet at edge proxy",
                "summary": "Attacker IP blocked. Zero unauthorized data operations executed."
            },
            {
                "step": 6,
                "phase": "RECOVERING",
                "phase_label": "Recovery Initiated",
                "risk_score": 12,
                "asset_status": "RECOVERING",
                "event_name": "Biometric Step-Up Verification Passed",
                "action_taken": "Verified Legitimate Operator",
                "status": "Recovering",
                "response_action": "Local operator verified identity via SMS OTP; re-issued fresh cryptographic JWT",
                "summary": "Operator re-verified. 1,420 legitimate citizen portal users remained 100% active."
            },
            {
                "step": 7,
                "phase": "RESOLVED",
                "phase_label": "System Restored",
                "risk_score": 0,
                "asset_status": "NORMAL",
                "event_name": "Session State Returned to Nominal",
                "action_taken": "Public API Proxy Health Restored",
                "status": "Completed",
                "response_action": "Citizen API Proxy ASSET-NGP-05 set to NORMAL. Incident logged to audit trail",
                "summary": "Incident RESOLVED. Session hijacking thwarted with zero service interruption."
            }
        ]
    },

    "MALWARE": {
        "title": "Trojan Process Injection & C2 Beaconing on CCTV Video Gateway",
        "type": "Malware Behavior Simulation",
        "affected_asset_id": "ASSET-NGP-03",
        "affected_asset_name": "Nagpur Metro CCTV Video Gateway",
        "attack_source_ip": "91.240.118.15",
        "mitre_technique": "T1055 — Process Injection",
        "severity": "CRITICAL",
        "peak_risk_score": 92,
        "ai_confidence": 0.98,
        "detection_reason": "Unsigned binary attempting DLL injection and reflective memory allocation inside video streaming service daemon PID 4192.",
        "recommended_action": "Kill rogue child process PID 4192, drop outbound TCP connections on port 8443, re-verify system binary SHA-256 hashes.",
        "steps": [
            {
                "step": 1,
                "phase": "DETECTING",
                "phase_label": "Attack Detected",
                "risk_score": 46,
                "asset_status": "SUSPICIOUS",
                "event_name": "Unauthorized Memory Injection Attempt",
                "action_taken": "EDR Process Hook Alert",
                "status": "Investigating",
                "response_action": "Detected VirtualAllocEx call targeting video_stream_service.exe",
                "summary": "Suspicious process injection attempt detected on Nagpur Metro CCTV Gateway."
            },
            {
                "step": 2,
                "phase": "ANALYZING",
                "phase_label": "Threat Analyzed",
                "risk_score": 76,
                "asset_status": "SUSPICIOUS",
                "event_name": "Trojan.Stager Signature Correlated",
                "action_taken": "AI Behavioral Heuristic Match",
                "status": "Analyzing",
                "response_action": "AI classified C2 beaconing behavior with 98% confidence",
                "summary": "AI identified Trojan stager trying to establish backdoor communication."
            },
            {
                "step": 3,
                "phase": "CRITICAL",
                "phase_label": "Risk Classified",
                "risk_score": 92,
                "asset_status": "SUSPICIOUS",
                "event_name": "Critical Video Surveillance Threat",
                "action_taken": "Automated SOC Escalation",
                "status": "Escalated",
                "response_action": "Threat classified as CRITICAL. Video gateway marked for immediate isolation",
                "summary": "Risk score 92/100. Emergency automated process containment triggered."
            },
            {
                "step": 4,
                "phase": "CRITICAL",
                "phase_label": "Asset Isolated",
                "risk_score": 80,
                "asset_status": "ISOLATED",
                "event_name": "Process Suspended & Network Quarantined",
                "action_taken": "Process PID 4192 Suspended",
                "status": "Isolated",
                "response_action": "Suspended rogue thread; blocked outbound TCP egress to 91.240.118.15",
                "summary": "Gateway isolated from external WAN to prevent command & control execution."
            },
            {
                "step": 5,
                "phase": "CONTAINED",
                "phase_label": "Threat Contained",
                "risk_score": 48,
                "asset_status": "ISOLATED",
                "event_name": "Malicious Process Terminated & Dumped",
                "action_taken": "Process Killed & Memory Scanned",
                "status": "Contained",
                "response_action": "Terminated PID 4192; purged temp payload from /tmp/cache/.stg",
                "summary": "Malware process killed and removed from memory. C2 IP blocked at perimeter."
            },
            {
                "step": 6,
                "phase": "RECOVERING",
                "phase_label": "Recovery Initiated",
                "risk_score": 16,
                "asset_status": "RECOVERING",
                "event_name": "Clean Video Streaming Daemon Restarted",
                "action_taken": "Service Hash Verified & Booted",
                "status": "Recovering",
                "response_action": "Restarted verified video streaming service from signed binary baseline",
                "summary": "Clean video streaming service re-launched. Metro surveillance feeds remained 100% operational."
            },
            {
                "step": 7,
                "phase": "RESOLVED",
                "phase_label": "System Restored",
                "risk_score": 0,
                "asset_status": "NORMAL",
                "event_name": "CCTV Video Gateway Integrity Verified",
                "action_taken": "Gateway Returned to Active Duty",
                "status": "Completed",
                "response_action": "ASSET-NGP-03 health score restored to 100. All live streams verified secure",
                "summary": "Incident RESOLVED. CCTV gateway secured and verified with zero video feed compromise."
            }
        ]
    },

    "EXFILTRATION": {
        "title": "Mass Database Exfiltration Attempt via Encrypted Covert Tunnel",
        "type": "Data Exfiltration Attempt Simulation",
        "affected_asset_id": "ASSET-NGP-06",
        "affected_asset_name": "GMCH Emergency Trauma Link",
        "attack_source_ip": "194.26.29.112",
        "mitre_technique": "T1048.003 — Exfiltration Over Alternative Protocol",
        "severity": "CRITICAL",
        "peak_risk_score": 96,
        "ai_confidence": 0.99,
        "detection_reason": "Deep Packet Inspection (DPI) detected 1.8 GB encrypted DNS/ICMP tunneling burst carrying encoded medical record fragments.",
        "recommended_action": "Sever outbound covert tunnel immediately, enforce Data Loss Prevention (DLP) protocol, re-encrypt patient database volume.",
        "steps": [
            {
                "step": 1,
                "phase": "DETECTING",
                "phase_label": "Attack Detected",
                "risk_score": 55,
                "asset_status": "SUSPICIOUS",
                "event_name": "Abnormal Outbound Bandwidth Burst",
                "action_taken": "DLP Bandwidth Anomaly Triggered",
                "status": "Investigating",
                "response_action": "1.8 GB high-frequency DNS query burst logged from GMCH link node",
                "summary": "Suspicious high-volume outbound data flow detected on hospital emergency link."
            },
            {
                "step": 2,
                "phase": "ANALYZING",
                "phase_label": "Threat Analyzed",
                "risk_score": 80,
                "asset_status": "SUSPICIOUS",
                "event_name": "Covert DNS Tunneling Confirmed",
                "action_taken": "Deep Packet Inspection (DPI)",
                "status": "Analyzing",
                "response_action": "AI DPI verified base64-encoded database records inside DNS TXT payloads",
                "summary": "AI confirmed active data exfiltration attempt aiming to steal emergency hospital records."
            },
            {
                "step": 3,
                "phase": "CRITICAL",
                "phase_label": "Risk Classified",
                "risk_score": 96,
                "asset_status": "SUSPICIOUS",
                "event_name": "Critical Data Loss Prevention Alert",
                "action_taken": "Emergency DLP Intercept Activated",
                "status": "Escalated",
                "response_action": "Threat classified as CRITICAL (96/100). Initiating automated egress cutoff",
                "summary": "Risk score 96/100. Automated defense engine executing zero-leak containment."
            },
            {
                "step": 4,
                "phase": "CRITICAL",
                "phase_label": "Asset Isolated",
                "risk_score": 84,
                "asset_status": "ISOLATED",
                "event_name": "Outbound Tunnel Severed",
                "action_taken": "Egress Gateway Connection Dropped",
                "status": "Isolated",
                "response_action": "Severed covert channel on ASSET-NGP-06; blocked destination IP 194.26.29.112",
                "summary": "Exfiltration pipeline cut off within 1.2 seconds. Leakage halted."
            },
            {
                "step": 5,
                "phase": "CONTAINED",
                "phase_label": "Threat Contained",
                "risk_score": 50,
                "asset_status": "ISOLATED",
                "event_name": "Data Leakage Contained (0 Records Lost)",
                "action_taken": "Firewall Protocol Filter Enforced",
                "status": "Contained",
                "response_action": "Enforced strict DNS packet size limits; added exfiltration host to global blocklist",
                "summary": "Threat contained. Zero patient records compromised. Database locked and protected."
            },
            {
                "step": 6,
                "phase": "RECOVERING",
                "phase_label": "Recovery Initiated",
                "risk_score": 14,
                "asset_status": "RECOVERING",
                "event_name": "Database Cryptographic Audit Verified",
                "action_taken": "SHA-256 Table Verification Executed",
                "status": "Recovering",
                "response_action": "Verified 100% record integrity; rotated AES-256 database encryption keys",
                "summary": "Hospital triage system verified healthy. Emergency ambulance dispatching remained unaffected."
            },
            {
                "step": 7,
                "phase": "RESOLVED",
                "phase_label": "System Restored",
                "risk_score": 0,
                "asset_status": "NORMAL",
                "event_name": "Hospital Emergency Link Restored",
                "action_taken": "Safe Egress Pipeline Re-opened with DPI Filter",
                "status": "Completed",
                "response_action": "GMCH Trauma Link ASSET-NGP-06 restored to NORMAL. DLP policy updated",
                "summary": "Incident RESOLVED. Data exfiltration blocked completely with 100% service availability."
            }
        ]
    }
}

# In-Memory Active Simulation State
active_sim = {
    "is_running": False,
    "scenario_key": None,
    "current_step": 0,
    "total_steps": 7,
    "incident_id": None,
    "auto_play": True,
    "last_step_time": 0,
    "step_delay_seconds": 3.0,
    "completed": False
}

def get_active_simulation():
    global active_sim
    # If running in auto-play, check if we should auto-advance
    if active_sim["is_running"] and active_sim["auto_play"] and not active_sim["completed"]:
        now = time.time()
        if now - active_sim["last_step_time"] >= active_sim["step_delay_seconds"]:
            advance_simulation_step()
    return active_sim

def start_simulation(scenario_key="RANSOMWARE", auto_play=True, step_delay=3.0):
    global active_sim
    if scenario_key not in SCENARIOS:
        scenario_key = "RANSOMWARE"

    scenario = SCENARIOS[scenario_key]
    incident_id = f"CYB-NGP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Record incident in DB
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO cyber_incidents (
        id, simulation_type, title, severity, risk_score, status, current_step, total_steps,
        affected_asset_id, affected_asset_name, attack_source_ip, detection_reason,
        ai_confidence, recommended_action, actions_taken, legitimate_users_protected,
        service_availability, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_id, scenario_key, scenario["title"], scenario["severity"],
        scenario["steps"][0]["risk_score"], "DETECTING", 1, len(scenario["steps"]),
        scenario["affected_asset_id"], scenario["affected_asset_name"],
        scenario["attack_source_ip"], scenario["detection_reason"],
        scenario["ai_confidence"], scenario["recommended_action"],
        scenario["steps"][0]["response_action"], 1420, 99.98, now_str
    ))

    # Update asset to SUSPICIOUS
    cur.execute("""
    UPDATE cyber_assets SET status = ?, active_threat_id = ?, last_updated = ?
    WHERE id = ?
    """, (scenario["steps"][0]["asset_status"], incident_id, now_str, scenario["affected_asset_id"]))

    # Insert Step 1 Event
    step1 = scenario["steps"][0]
    cur.execute("""
    INSERT INTO cyber_events (incident_id, timestamp, event_name, source_ip, severity, asset_name, action_taken, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_id, now_str, step1["event_name"], scenario["attack_source_ip"],
        scenario["severity"], scenario["affected_asset_name"], step1["action_taken"],
        step1["status"], step1["summary"]
    ))

    # Insert Response Log
    cur.execute("""
    INSERT INTO cyber_response_logs (incident_id, timestamp, action_type, target_asset, status, impact_summary)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        incident_id, now_str, step1["action_taken"], scenario["affected_asset_name"],
        "SUCCESS", step1["response_action"]
    ))

    conn.commit()
    conn.close()

    active_sim = {
        "is_running": True,
        "scenario_key": scenario_key,
        "current_step": 1,
        "total_steps": len(scenario["steps"]),
        "incident_id": incident_id,
        "auto_play": auto_play,
        "last_step_time": time.time(),
        "step_delay_seconds": float(step_delay),
        "completed": False
    }

    return get_simulation_status()

def advance_simulation_step():
    global active_sim
    if not active_sim["is_running"] or active_sim["completed"]:
        return get_simulation_status()

    scenario = SCENARIOS.get(active_sim["scenario_key"])
    if not scenario:
        return get_simulation_status()

    next_step_num = active_sim["current_step"] + 1
    if next_step_num > len(scenario["steps"]):
        active_sim["completed"] = True
        active_sim["is_running"] = False
        return get_simulation_status()

    step_data = scenario["steps"][next_step_num - 1]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db()
    cur = conn.cursor()

    contained_at = now_str if step_data["phase"] == "CONTAINED" else None
    recovered_at = now_str if step_data["phase"] == "RESOLVED" else None

    # Update incident in DB
    cur.execute("""
    UPDATE cyber_incidents SET
        current_step = ?,
        status = ?,
        risk_score = ?,
        actions_taken = actions_taken || ' | ' || ?,
        contained_at = COALESCE(contained_at, ?),
        recovered_at = COALESCE(recovered_at, ?)
    WHERE id = ?
    """, (
        next_step_num, step_data["phase"], step_data["risk_score"],
        step_data["response_action"], contained_at, recovered_at,
        active_sim["incident_id"]
    ))

    # Update asset status
    cur.execute("""
    UPDATE cyber_assets SET status = ?, last_updated = ?,
           health_score = ?
    WHERE id = ?
    """, (
        step_data["asset_status"], now_str,
        100 if step_data["asset_status"] == "NORMAL" else (40 if step_data["asset_status"] == "ISOLATED" else 75),
        scenario["affected_asset_id"]
    ))

    # Insert Event
    cur.execute("""
    INSERT INTO cyber_events (incident_id, timestamp, event_name, source_ip, severity, asset_name, action_taken, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        active_sim["incident_id"], now_str, step_data["event_name"], scenario["attack_source_ip"],
        scenario["severity"], scenario["affected_asset_name"], step_data["action_taken"],
        step_data["status"], step_data["summary"]
    ))

    # Insert Response Log
    cur.execute("""
    INSERT INTO cyber_response_logs (incident_id, timestamp, action_type, target_asset, status, impact_summary)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        active_sim["incident_id"], now_str, step_data["action_taken"], scenario["affected_asset_name"],
        "SUCCESS", step_data["response_action"]
    ))

    conn.commit()
    conn.close()

    active_sim["current_step"] = next_step_num
    active_sim["last_step_time"] = time.time()
    if next_step_num >= len(scenario["steps"]):
        active_sim["completed"] = True
        active_sim["is_running"] = False

    return get_simulation_status()

def stop_simulation():
    global active_sim
    active_sim["is_running"] = False
    return get_simulation_status()

def reset_simulation():
    global active_sim
    active_sim = {
        "is_running": False,
        "scenario_key": None,
        "current_step": 0,
        "total_steps": 7,
        "incident_id": None,
        "auto_play": True,
        "last_step_time": 0,
        "step_delay_seconds": 3.0,
        "completed": False
    }

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    cur = conn.cursor()

    # Reset all assets to NORMAL
    cur.execute("UPDATE cyber_assets SET status = 'NORMAL', health_score = 100, active_threat_id = NULL, last_updated = ?", (now_str,))
    
    # Insert clean system reset event
    cur.execute("""
    INSERT INTO cyber_events (incident_id, timestamp, event_name, source_ip, severity, asset_name, action_taken, status, details)
    VALUES (NULL, ?, 'SOC Environment Reset', '10.20.1.1', 'LOW', 'All Assets', 'Baseline Restored', 'Completed', 'Demo simulation state reset to pristine normal baseline. All assets verified 100% operational.')
    """, (now_str,))

    conn.commit()
    conn.close()

    return get_simulation_status()

def get_simulation_status():
    global active_sim
    scenario_key = active_sim.get("scenario_key")
    scenario = SCENARIOS.get(scenario_key) if scenario_key else None

    step_num = active_sim.get("current_step", 0)
    current_step_data = None
    if scenario and step_num > 0 and step_num <= len(scenario["steps"]):
        current_step_data = scenario["steps"][step_num - 1]

    # Pipeline stages with completion states
    pipeline_stages = [
        {"id": 1, "name": "Attack Source", "stage": "DETECTING", "label": "Attack Detected"},
        {"id": 2, "name": "Threat Analysis", "stage": "ANALYZING", "label": "AI Analyzed"},
        {"id": 3, "name": "Risk Assessment", "stage": "CRITICAL", "label": "Risk Classified"},
        {"id": 4, "name": "Asset Identification", "stage": "CRITICAL", "label": "Asset Identified"},
        {"id": 5, "name": "Automated Isolation", "stage": "CONTAINED", "label": "Threat Contained"},
        {"id": 6, "name": "Recovery Workflow", "stage": "RECOVERING", "label": "System Recovering"},
        {"id": 7, "name": "System Normal", "stage": "RESOLVED", "label": "System Restored"}
    ]

    for stage in pipeline_stages:
        if step_num == 0:
            stage["status"] = "IDLE"
        elif stage["id"] < step_num:
            stage["status"] = "COMPLETED"
        elif stage["id"] == step_num:
            stage["status"] = "ACTIVE"
        else:
            stage["status"] = "PENDING"

    # Fetch stats from DB
    dashboard_stats = get_dashboard_stats()

    return {
        "simulation": {
            "is_running": active_sim["is_running"],
            "scenario_key": scenario_key,
            "scenario_title": scenario["title"] if scenario else "No Active Simulation (System Idle)",
            "scenario_type": scenario["type"] if scenario else None,
            "current_step": step_num,
            "total_steps": len(scenario["steps"]) if scenario else 7,
            "incident_id": active_sim.get("incident_id"),
            "completed": active_sim.get("completed", False),
            "auto_play": active_sim.get("auto_play", True),
            "step_data": current_step_data,
            "pipeline": pipeline_stages,
            "mitre_technique": scenario.get("mitre_technique") if scenario else "N/A",
            "ai_threat_analysis": {
                "threat_type": scenario["type"] if scenario else "None Detected",
                "severity": current_step_data["phase"] if current_step_data else "NORMAL",
                "risk_score": current_step_data["risk_score"] if current_step_data else 0,
                "confidence_score": f"{int(scenario['ai_confidence'] * 100)}%" if scenario else "98%",
                "affected_asset": scenario["affected_asset_name"] if scenario else "All Assets Nominal",
                "detection_reason": scenario["detection_reason"] if scenario else "Continuous baseline scanning active. Zero anomalies detected.",
                "recommended_action": scenario["recommended_action"] if scenario else "Maintain standard defensive posture and intrusion prevention monitoring.",
                "current_response_status": current_step_data["action_taken"] if current_step_data else "Monitoring Active",
                "attack_source_ip": scenario["attack_source_ip"] if scenario else "N/A"
            }
        },
        "dashboard": dashboard_stats
    }

def get_dashboard_stats():
    conn = get_db()
    cur = conn.cursor()

    # Asset counts
    cur.execute("SELECT status, COUNT(*) FROM cyber_assets GROUP BY status")
    asset_status_counts = dict(cur.fetchall())

    isolated_count = asset_status_counts.get("ISOLATED", 0)
    suspicious_count = asset_status_counts.get("SUSPICIOUS", 0)
    recovering_count = asset_status_counts.get("RECOVERING", 0)
    normal_count = asset_status_counts.get("NORMAL", 0)
    total_assets = normal_count + isolated_count + suspicious_count + recovering_count

    # Active incidents
    cur.execute("SELECT COUNT(*) FROM cyber_incidents WHERE status != 'RESOLVED'")
    active_incidents = cur.fetchone()[0]

    # Total resolved incidents
    cur.execute("SELECT COUNT(*) FROM cyber_incidents WHERE status = 'RESOLVED'")
    resolved_incidents = cur.fetchone()[0]

    # Latest risk score
    cur.execute("SELECT risk_score, severity, status FROM cyber_incidents ORDER BY id DESC LIMIT 1")
    latest_inc = cur.fetchone()
    if latest_inc and latest_inc[2] != 'RESOLVED':
        current_risk_score = latest_inc[0]
        threat_severity = latest_inc[1]
        security_status = latest_inc[2]
    else:
        current_risk_score = 0
        threat_severity = "NORMAL"
        security_status = "NORMAL"

    # Count response actions
    cur.execute("SELECT COUNT(*) FROM cyber_response_logs")
    total_response_actions = cur.fetchone()[0]

    # Blocked requests calculation
    blocked_requests = (isolated_count * 342) + (18 if security_status != 'NORMAL' else 0) + 12

    conn.close()

    return {
        "security_status": security_status,
        "threat_severity": threat_severity,
        "current_risk_score": current_risk_score,
        "active_incidents": active_incidents,
        "resolved_incidents": resolved_incidents,
        "isolated_devices": isolated_count,
        "suspicious_devices": suspicious_count,
        "total_assets": total_assets,
        "blocked_requests": blocked_requests,
        "system_availability": 99.98 if isolated_count == 0 else 99.85,
        "avg_response_time": "1.4s",
        "legitimate_users_active": 1420,
        "legitimate_users_status": "Protected / Connected",
        "protection_banner": "Attack contained without disrupting legitimate users." if active_incidents > 0 else "All systems operating normally. Zero active disruptions."
    }

def get_cyber_events(limit=50):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT id, incident_id, timestamp, event_name, source_ip, severity, asset_name, action_taken, status, details
    FROM cyber_events
    ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_cyber_incidents(limit=20):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT i.*, a.name as asset_name, a.ip_address as asset_ip
    FROM cyber_incidents i
    LEFT JOIN cyber_assets a ON i.affected_asset_id = a.id
    ORDER BY i.created_at DESC LIMIT ?
    """, (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_cyber_incident_detail(incident_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM cyber_incidents WHERE id = ?", (incident_id,))
    inc_row = cur.fetchone()
    if not inc_row:
        conn.close()
        return None

    incident = dict(inc_row)

    # Fetch events timeline for this incident
    cur.execute("SELECT * FROM cyber_events WHERE incident_id = ? ORDER BY id ASC", (incident_id,))
    events = [dict(r) for r in cur.fetchall()]

    # Fetch response logs
    cur.execute("SELECT * FROM cyber_response_logs WHERE incident_id = ? ORDER BY id ASC", (incident_id,))
    response_logs = [dict(r) for r in cur.fetchall()]

    conn.close()

    incident["timeline"] = events
    incident["response_logs"] = response_logs
    return incident

def get_cyber_assets():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM cyber_assets ORDER BY id ASC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
