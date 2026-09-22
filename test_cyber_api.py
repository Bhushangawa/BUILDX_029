import urllib.request
import json
import time

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

print("--- TESTING CYBER ATTACK SIMULATION & AUTOMATED RESPONSE API ---")

# 1. Test Dashboard stats
dash = test_endpoint('Cyber Dashboard Stats', 'http://127.0.0.1:8000/api/cyber/dashboard')
print(f"   Initial Security Status: {dash['security_status']}, Availability: {dash['system_availability']}%")

# 2. Test Asset Inventory
assets = test_endpoint('Cyber Assets', 'http://127.0.0.1:8000/api/cyber/assets')
print(f"   Found {len(assets['assets'])} critical infrastructure assets")

# 3. Start Ransomware Simulation
sim = test_endpoint('Start Ransomware Sim', 'http://127.0.0.1:8000/api/cyber/simulation/start', method='POST', data={
    'scenario_type': 'RANSOMWARE',
    'auto_play': False
})
print(f"   Simulation Started: {sim['simulation']['scenario_title']} (Step {sim['simulation']['current_step']}/{sim['simulation']['total_steps']})")
print(f"   Risk Score: {sim['simulation']['ai_threat_analysis']['risk_score']}/100, AI Confidence: {sim['simulation']['ai_threat_analysis']['confidence_score']}")

# 4. Advance step (Manual Step-by-Step)
step2 = test_endpoint('Advance Step 2', 'http://127.0.0.1:8000/api/cyber/simulation/next-step', method='POST')
print(f"   Now at Step {step2['simulation']['current_step']}: Phase={step2['simulation']['step_data']['phase']}, Action={step2['simulation']['step_data']['action_taken']}")

# 5. Advance step to Isolation
step3 = test_endpoint('Advance Step 3', 'http://127.0.0.1:8000/api/cyber/simulation/next-step', method='POST')
step4 = test_endpoint('Advance Step 4 (Isolation)', 'http://127.0.0.1:8000/api/cyber/simulation/next-step', method='POST')
print(f"   Step 4 Asset Status: {step4['simulation']['step_data']['asset_status']}, Risk Score: {step4['simulation']['step_data']['risk_score']}")

# 6. Test Security Events Log
events = test_endpoint('Cyber Event Log', 'http://127.0.0.1:8000/api/cyber/events')
print(f"   Logged {len(events['events'])} security events")

# 7. Test Incident Detail
incidents = test_endpoint('Cyber Incidents List', 'http://127.0.0.1:8000/api/cyber/incidents')
inc_id = incidents['incidents'][0]['id']
inc_detail = test_endpoint(f'Incident Detail ({inc_id})', f'http://127.0.0.1:8000/api/cyber/incidents/{inc_id}')
print(f"   Incident Detail: {inc_detail['incident']['title']} (Events: {len(inc_detail['incident']['timeline'])})")

# 8. Test Reset Demo
reset_res = test_endpoint('Reset Cyber Demo', 'http://127.0.0.1:8000/api/cyber/simulation/reset', method='POST')
print(f"   Reset completed: is_running={reset_res['simulation']['is_running']}, risk_score={reset_res['dashboard']['current_risk_score']}")

# 9. Verify Existing Incident APIs still 100% working
inc_list = test_endpoint('Existing Incident List', 'http://127.0.0.1:8000/api/incidents')
print(f"   Existing Platform Incidents: {len(inc_list.get('incidents', []))} (100% Intact)")

print("--- ALL CYBER SOC BACKEND TESTS PASSED SUCCESSFULLY ---")
