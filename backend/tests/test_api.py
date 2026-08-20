import requests

BASE_URL = "http://127.0.0.1:8000"


def print_result(title, response):
    print("=" * 60)
    print(title)
    print("Status Code :", response.status_code)

    try:
        print("Response :", response.json())
    except:
        print("Response :", response.text)


# ------------------------------
# Root Endpoint
# ------------------------------
response = requests.get(f"{BASE_URL}/")
print_result("GET /", response)


# ------------------------------
# Register User
# ------------------------------
register_data = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123"
}

response = requests.post(
    f"{BASE_URL}/api/v1/auth/register",
    json=register_data
)

print_result("POST /api/v1/auth/register", response)


# ------------------------------
# Duplicate Registration
# ------------------------------
response = requests.post(
    f"{BASE_URL}/api/v1/auth/register",
    json=register_data
)

print_result("POST Duplicate Register", response)


# ------------------------------
# Login
# ------------------------------
login_data = {
    "email": "test@example.com",
    "password": "Test@123"
}

response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json=login_data
)

print_result("POST /api/v1/auth/login", response)

token = None

try:
    token = response.json()["access_token"]
except:
    pass


# ------------------------------
# Invalid Login
# ------------------------------
invalid_login = {
    "email": "wrong@example.com",
    "password": "wrongpassword"
}

response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json=invalid_login
)

print_result("POST Invalid Login", response)


# ------------------------------
# Protected Route
# ------------------------------
if token:
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(
        f"{BASE_URL}/api/v1/users/me",
        headers=headers
    )

    print_result("GET Protected Route", response)


# ------------------------------
# Unauthorized Route
# ------------------------------
response = requests.get(
    f"{BASE_URL}/api/v1/users/me"
)

print_result("GET Unauthorized Route", response)