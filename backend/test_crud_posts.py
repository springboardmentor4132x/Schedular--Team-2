import subprocess
import time
import json
import uuid
import sys
import urllib.request
import urllib.parse
from urllib.error import HTTPError
from datetime import datetime, timedelta, timezone

print("Starting server...")
server = subprocess.Popen(["venv\\Scripts\\python", "-m", "uvicorn", "main:app", "--port", "8002"])
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
    BASE_URL = "http://127.0.0.1:8002"
    
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

    # 1. Create Post
    post_payload = {
        "title": "My First Post",
        "caption": "This is a wonderful post caption.",
        "content_type": "text"
    }
    status, response = make_request(f"{BASE_URL}/api/v1/posts/", method="POST", data=post_payload, headers=headers)
    if status != 201:
        print("[FAIL] POST /api/v1/posts/ failed:", status, response)
        sys.exit(1)
    post_id = response["id"]
    print("[SUCCESS] Create Post (POST /api/v1/posts/)")

    # 2. Get All Posts
    status, response = make_request(f"{BASE_URL}/api/v1/posts/", method="GET", headers=headers)
    if status != 200 or len(response) == 0:
        print("[FAIL] GET ALL failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Get All Posts (GET /api/v1/posts/)")

    # 3. Get Post By ID
    status, response = make_request(f"{BASE_URL}/api/v1/posts/{post_id}", method="GET", headers=headers)
    if status != 200:
        print("[FAIL] GET BY ID failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Get Post By ID (GET /api/v1/posts/{id})")

    # 4. Update Post
    update_payload = {
        "title": "My Updated Post",
        "caption": "Updated caption"
    }
    status, response = make_request(f"{BASE_URL}/api/v1/posts/{post_id}", method="PUT", data=update_payload, headers=headers)
    if status != 200 or response["title"] != "My Updated Post":
        print("[FAIL] PUT failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Update Post (PUT /api/v1/posts/{id})")

    # 5. Delete Post
    status, response = make_request(f"{BASE_URL}/api/v1/posts/{post_id}", method="DELETE", headers=headers)
    if status != 200:
        print("[FAIL] DELETE failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Delete Post (DELETE /api/v1/posts/{id})")

    # 6. Save Draft
    draft_payload = {
        "title": "My Draft Post"
    }
    status, response = make_request(f"{BASE_URL}/api/v1/posts/save-draft", method="POST", data=draft_payload, headers=headers)
    if status != 200 or response["status"] != "Draft":
        print("[FAIL] Save Draft failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Save Draft (POST /api/v1/posts/save-draft)")

    # 7. Schedule Post
    future_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    schedule_payload = {
        "title": "My Scheduled Post",
        "scheduled_for": future_time
    }
    status, response = make_request(f"{BASE_URL}/api/v1/posts/schedule", method="POST", data=schedule_payload, headers=headers)
    if status != 200 or response["status"] != "Scheduled":
        print("[FAIL] Schedule Post failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Schedule Post (POST /api/v1/posts/schedule)")

    # 8. Retrieve Scheduled Posts
    status, response = make_request(f"{BASE_URL}/api/v1/posts/scheduled", method="GET", headers=headers)
    if status != 200 or len(response) == 0:
        print("[FAIL] Retrieve Scheduled Posts failed:", status, response)
        sys.exit(1)
    print("[SUCCESS] Retrieve Scheduled Posts (GET /api/v1/posts/scheduled)")

    print("\nSUCCESS: All Posts CRUD APIs are working flawlessly!")
finally:
    server.terminate()
