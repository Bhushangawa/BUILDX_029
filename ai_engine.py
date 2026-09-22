import re
import math
import os
from datetime import datetime, timedelta

# Nagpur Landmark Geocoding Knowledge Base
NAGPUR_LANDMARKS = {
    "deekshabhoomi": {"lat": 21.1278, "lng": 79.0683, "name": "Deekshabhoomi Complex"},
    "sitabuldi": {"lat": 21.1466, "lng": 79.0825, "name": "Sitabuldi Interchange & Market"},
    "railway station": {"lat": 21.1524, "lng": 79.0886, "name": "Nagpur Junction Railway Station"},
    "wardha road": {"lat": 21.1118, "lng": 79.0762, "name": "Wardha Road Arterial Corridor"},
    "futala": {"lat": 21.1542, "lng": 79.0435, "name": "Futala Lake Promenade"},
    "seminary hills": {"lat": 21.1685, "lng": 79.0612, "name": "Seminary Hills Reserve Area"},
    "dharampeth": {"lat": 21.1415, "lng": 79.0601, "name": "Dharampeth / Coffee House Square"},
    "sadar": {"lat": 21.1601, "lng": 79.0831, "name": "Sadar Residency Road Bazar"},
    "zero mile": {"lat": 21.1498, "lng": 79.0806, "name": "Zero Mile Stone Landmark"},
    "medical square": {"lat": 21.1302, "lng": 79.0987, "name": "Medical Square GMCH"},
    "gmch": {"lat": 21.1302, "lng": 79.0987, "name": "Government Medical College Nagpur"},
    "mankapur": {"lat": 21.1892, "lng": 79.0745, "name": "Mankapur Sports Complex"},
    "mihan": {"lat": 21.0552, "lng": 79.0531, "name": "MIHAN Industrial Corridor"},
    "ambazari": {"lat": 21.1298, "lng": 79.0401, "name": "Ambazari Lake & Garden"},
    "cotton market": {"lat": 21.1472, "lng": 79.0965, "name": "Cotton Market Nagpur"}
}

def haversine_distance(lat1, lon1, lat2, lon2):
    """Returns distance in meters between two lat/lng points."""
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def extract_nagpur_location(text):
    """Extracts known Nagpur landmark coordinates from free-form text."""
    lower_text = text.lower()
    for key, data in NAGPUR_LANDMARKS.items():
        if key in lower_text:
            return data
    # Default to Zero Mile, Nagpur center if no specific landmark detected
    return {"lat": 21.1458, "lng": 79.0882, "name": "Nagpur Central Zone"}

def analyze_incident(title, description, location_name="", media_url=None):
    """
    AI-Assisted Incident Intelligence:
    Categorizes, scores priority, matches required response team,
    extracts entities, and provides recommended next actions.
    Uses localized multilingual NLP semantics (English, Hindi, Marathi keywords).
    """
    full_text = f"{title} {description} {location_name}".lower()

    # Keyword rules for categorization
    crowd_keywords = ["crowd", "surge", "stampede", "exit block", "rush", "gate", "gathering", "bhid", "गर्दी", "भीड़", "बैरिकेड"]
    medical_keywords = ["unconscious", "collapse", "heart", "breathing", "dizziness", "blood", "injured", "ambulance", "hospital", "behosh", "बेहोश", "जखमी", "रक्त"]
    crime_keywords = ["snatch", "stole", "chain", "robbery", "thief", "gun", "knife", "attack", "fight", "assault", "chori", "मारहाण", "चोरी", "चोर"]
    suspicious_keywords = ["bag", "unattended", "luggage", "bomb", "suspicious", "threat", "abandoned", "वारिस", "संशयास्पद", "विचित्र"]
    missing_keywords = ["lost", "missing", "separated", "child", "elderly", "kid", "mulga", "mulgi", "हरवला", "गुमशुदा", "लापता"]
    safety_keywords = ["harass", "stalking", "follow", "unsafe", "alone", "dark", "छेड़छाड़", "सुरक्षा", "मदत"]

    category = "General Security"
    priority = "MEDIUM"
    suggested_team = "SECURITY_TEAM"
    confidence = 0.88
    extracted_entities = []
    action_recommendation = "Deploy nearest security officer for preliminary scene assessment."

    # Priority determination
    if any(k in full_text for k in ["collapse", "unconscious", "bomb", "knife", "gun", "stampede", "critical", "dying", "heart"]):
        priority = "CRITICAL"
        confidence = 0.98
    elif any(k in full_text for k in ["snatch", "crowd", "surge", "fight", "assault", "chori", "lost"]):
        priority = "HIGH"
        confidence = 0.92
    elif any(k in full_text for k in ["suspicious", "wallet", "stolen", "dispute", "noise"]):
        priority = "MEDIUM"
        confidence = 0.89
    else:
        priority = "LOW"
        confidence = 0.82

    # Category and Team matching
    if any(k in full_text for k in medical_keywords):
        category = "Medical Emergency"
        suggested_team = "MEDICAL_SUPPORT"
        action_recommendation = "Dispatch GMCH Trauma Mobile Unit with paramedic kit & oxygen immediately."
    elif any(k in full_text for k in crowd_keywords):
        category = "Crowd Management"
        suggested_team = "CROWD_CONTROL_TEAM"
        action_recommendation = "Alert event sector officers, open auxiliary relief gates, and enforce one-way pedestrian routing."
    elif any(k in full_text for k in missing_keywords):
        category = "Missing Person"
        suggested_team = "SEARCH_TEAM"
        action_recommendation = "Activate zonal search perimeter, alert volunteer search radius, and review gateway CCTV."
    elif any(k in full_text for k in crime_keywords):
        category = "Crime / Street Safety"
        suggested_team = "SECURITY_TEAM"
        action_recommendation = "Initiate sector perimeter cordon, broadcast suspect vehicle description, and trace nearby CCTV feeds."
    elif any(k in full_text for k in suspicious_keywords):
        category = "Public Safety / Suspicious Activity"
        suggested_team = "SECURITY_TEAM"
        action_recommendation = "Isolate area with 50-meter safety tape and dispatch certified bomb disposal / canine patrol unit."
    elif any(k in full_text for k in safety_keywords):
        category = "Personal & Women Safety"
        suggested_team = "SECURITY_TEAM"
        action_recommendation = "Dispatch nearest quick response patrol vehicle and initiate continuous phone contact with reporter."

    # Extract Nagpur landmarks
    location_data = extract_nagpur_location(full_text)
    extracted_entities.append(f"Location: {location_data['name']}")

    # Extract time indicators
    if "just now" in full_text or "abhi" in full_text or "aata" in full_text:
        extracted_entities.append("Time Sensitivity: Immediate (0-5 mins ago)")
    elif "minutes" in full_text:
        extracted_entities.append("Time Sensitivity: Recent (< 30 mins ago)")

    summary = (
        f"AI Analysis: Identified as [{category}] with [{priority}] priority in {location_data['name']}. "
        f"Recommended deployment: {suggested_team}. {action_recommendation}"
    )

    return {
        "category": category,
        "priority": priority,
        "suggested_team_type": suggested_team,
        "confidence": confidence,
        "summary": summary,
        "action_recommendation": action_recommendation,
        "extracted_entities": extracted_entities,
        "geocoded_location": location_data,
        "ai_engine_source": "SENTINEL Local Nagpur NLP Engine (Offline Rule-Based Fallback)"
    }

def detect_duplicates(new_lat, new_lng, new_category, new_desc, existing_incidents, max_distance_meters=500):
    """
    Checks for spatial and semantic duplicates among active incidents in Nagpur.
    Returns: {"has_duplicate": bool, "master_incident_id": str, "similarity_pct": int, "reason": str}
    """
    new_text = new_desc.lower()
    for inc in existing_incidents:
        if inc["status"] in ["RESOLVED", "CLOSED"]:
            continue

        # Calculate spatial distance
        dist = haversine_distance(new_lat, new_lng, inc["latitude"], inc["longitude"])
        if dist <= max_distance_meters:
            # Check category or text similarity
            category_match = inc["category"].lower() in new_category.lower() or new_category.lower() in inc["category"].lower()

            # Word overlap similarity
            words_a = set(re.findall(r'\w+', new_text))
            words_b = set(re.findall(r'\w+', inc["description"].lower()))
            overlap = len(words_a.intersection(words_b))
            
            if dist < 200 or (category_match and overlap >= 2):
                similarity = min(95, int(70 + (max_distance_meters - dist) / max_distance_meters * 25))
                return {
                    "has_duplicate": True,
                    "master_incident_id": inc["id"],
                    "master_title": inc["title"],
                    "distance_meters": round(dist, 1),
                    "similarity_pct": similarity,
                    "reason": f"Active incident '{inc['id']}' reported {round(dist)}m away with matching characteristics ({inc['category']})."
                }

    return {
        "has_duplicate": False,
        "master_incident_id": None,
        "similarity_pct": 0,
        "reason": "No spatial or semantic duplicate detected in current sector."
    }

if __name__ == "__main__":
    test_text = "Deekshabhoomi ke Gate 3 ke paas bahut crowd hai aur exit block ho raha hai"
    result = analyze_incident("Crowd near Gate 3", test_text)
    print("AI Analysis Result:")
    print(result)
