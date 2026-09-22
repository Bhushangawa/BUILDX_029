import urllib.request
import json

def test_endpoint(name, url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('X-User-Id', 'USR-ADMIN-01')
    req.add_header('X-User-Role', 'ADMIN')
    body = json.dumps(data).encode('utf-8') if data else None
    with urllib.request.urlopen(req, data=body) as res:
        res_json = json.loads(res.read().decode())
        print(f"[PASS] [{method}] {name}: status={res.status}")
        return res_json

print("--- RUNNING SENTINEL BACKEND API TESTS ---")
# 1. Test Incidents list
inc = test_endpoint('Incidents List', 'http://localhost:8000/api/incidents')
print(f"   Found {len(inc.get('incidents', []))} incidents")

# 2. Test Quick Incident Report (Marathi/Hindi keywords)
new_inc = test_endpoint('Report Incident', 'http://localhost:8000/api/incidents', method='POST', data={
    'title': 'Suspicious object at Sitabuldi station',
    'incident_type': 'Suspicious activity',
    'location_name': 'Sitabuldi Interchange',
    'description': 'Sitabuldi metro station chya platform var ek bewaris bag thevli ahe'
})
print(f"   Created: {new_inc['incident_id']} with priority: {new_inc['priority']}")

# 3. Test SOS Trigger
sos_res = test_endpoint('SOS Emergency', 'http://localhost:8000/api/sos', method='POST', data={
    'location_name': 'Wardha Road, Nagpur',
    'sos_type': 'Street Harassment Alert'
})
print(f"   SOS Broadcasted: {sos_res['incident_id']}")

# 4. Test Missing Persons List
mp_res = test_endpoint('Missing Persons', 'http://localhost:8000/api/missing-persons')
print(f"   Found {len(mp_res.get('missing_persons', []))} missing person cases")

# 5. Test Nearest Team Recommendation
rec_res = test_endpoint('Team Recommendation', 'http://localhost:8000/api/teams/recommend?lat=21.1278&lng=79.0683&team_type=CROWD_CONTROL_TEAM')
top_team = rec_res.get('recommendations', [])[0]
print(f"   Top recommended unit: {top_team['team']['name']} (distance: {top_team['distance_km']} km)")

# 6. Test Static Web Server
with urllib.request.urlopen('http://localhost:8000/') as res:
    html = res.read().decode('utf-8')
    assert 'RAKSHAK' in html
    assert 'NAGPUR' in html
    print(f"[PASS] [GET] Static Index HTML served successfully ({len(html)} bytes)")

print("--- ALL BACKEND & STATIC CHECKS PASSED SUCCESSFULLY ---")
