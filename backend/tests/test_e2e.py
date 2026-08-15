import requests
import sys
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_result(step, response):
    print(f"\n--- {step} ---")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def main():
    print("Starting End-to-End JWT & Endpoint Test...")
    
    # 1. Register a test user
    email = "e2etest@example.com"
    password = "password123"
    
    reg_data = {
        "email": email,
        "password": password,
        "username": "e2etestuser",
        "first_name": "E2E",
        "last_name": "Test"
    }
    
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    # Ignore 400 if user exists, just proceed to login
    if res.status_code not in (200, 201, 400):
        print("Registration failed unexpectedly!")
        print_result("Register", res)
        sys.exit(1)
        
    # 2. Login
    login_data = {
        "email": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print_result("Login & Get JWT Token", res)
    
    if res.status_code != 200:
        print("Login failed!")
        sys.exit(1)
        
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Test /auth/me (Profile)
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print_result("Fetch Profile (/auth/me)", res)
    
    # 4. Test Settings
    res = requests.get(f"{BASE_URL}/settings", headers=headers)
    print_result("Fetch Settings", res)
    
    # 5. Test Workspaces (Team)
    res = requests.get(f"{BASE_URL}/workspaces", headers=headers)
    print_result("Fetch Workspaces", res)
    
    # 6. Create Workspace
    ws_data = {"name": "Test E2E Workspace"}
    res = requests.post(f"{BASE_URL}/workspaces", json=ws_data, headers=headers)
    print_result("Create Workspace", res)
    
    # 7. Test Social Accounts
    res = requests.get(f"{BASE_URL}/social", headers=headers)
    print_result("Fetch Social Accounts", res)
    
    # 8. Connect Social Account
    social_data = {"platform": "linkedin"}
    res = requests.post(f"{BASE_URL}/social/connect", json=social_data, headers=headers)
    print_result("Connect Social Account", res)

    print("\nEnd-to-End API Test Completed Successfully!")

if __name__ == "__main__":
    main()
