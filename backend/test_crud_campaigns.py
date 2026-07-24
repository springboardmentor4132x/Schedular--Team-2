import subprocess
import time
import json
import uuid
import sys
import urllib.request
import urllib.parse
from urllib.error import HTTPError

print("Starting server...")
server = subprocess.Popen(["venv\\Scripts\\python", "-m", "uvicorn", "main:app", "--port", "8001"])
time.sleep(4) # wait for startup

def make_request(url, method="GET", data=None, headers=None, is_form=False):
    if headers is None:
        headers = {}
    
    if data is not None:
        if is_form:
            data = urllib.parse.urlencode(data).encode('utf-8')
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        else:
            data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except HTTPError as e:
        body = e.read().decode()
        return e.code, body

try:
    BASE_URL = "http://127.0.0.1:8001"
    
    # 1. Register and Login to get Token
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    register_data = {
        "username": f"user_{uuid.uuid4().hex[:6]}",
        "email": email,
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "User",
        "phone": "1234567890",
        "role": "creator"
    }

    login_data = {
        "username": email,
        "password": "Password123!"
    }

    status, resp_reg = make_request(f"{BASE_URL}/api/v1/auth/register", method="POST", data=register_data)
    if status != 200:
        print("Register failed:", resp_reg)
        sys.exit(1)

    status, resp_login = make_request(f"{BASE_URL}/api/v1/auth/login", method="POST", data=login_data, is_form=True)
    if status != 200:
        print("Login failed:", resp_login)
        sys.exit(1)
        
    token = resp_login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("[SUCCESS] Authentication successful")

    # 1. POST /api/v1/campaigns
    campaign_payload = {
        "name": "Summer Sale",
        "description": "Big summer sale campaign",
        "start_date": "2026-06-01",
        "end_date": "2026-08-31"
    }
    status, response = make_request(f"{BASE_URL}/api/v1/campaigns/", method="POST", data=campaign_payload, headers=headers)
    if status != 201:
        print("[FAIL] POST failed:", status, response)
        sys.exit(1)
    campaign_id = response["id"]
    print("[SUCCESS] POST /api/v1/campaigns")

    # 2. GET /api/v1/campaigns
    status, response = make_request(f"{BASE_URL}/api/v1/campaigns/", method="GET", headers=headers)
    if status != 200:
        print("[FAIL] GET ALL failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] GET /api/v1/campaigns")

    # 3. GET /api/v1/campaigns/{id}
    status, response = make_request(f"{BASE_URL}/api/v1/campaigns/{campaign_id}", method="GET", headers=headers)
    if status != 200:
        print("[FAIL] GET BY ID failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] GET /api/v1/campaigns/{id}")

    # 4. PUT /api/v1/campaigns/{id}
    update_payload = {
        "name": "Winter Sale",
        "status": "Active"
    }
    status, response = make_request(f"{BASE_URL}/api/v1/campaigns/{campaign_id}", method="PUT", data=update_payload, headers=headers)
    if status != 200:
        print("[FAIL] PUT failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] PUT /api/v1/campaigns/{id}")

    # 5. DELETE /api/v1/campaigns/{id}
    status, response = make_request(f"{BASE_URL}/api/v1/campaigns/{campaign_id}", method="DELETE", headers=headers)
    if status != 200:
        print("[FAIL] DELETE failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] DELETE /api/v1/campaigns/{id}")

    print("\nSUCCESS: All Campaign CRUD APIs are working flawlessly!")
finally:
    server.terminate()
