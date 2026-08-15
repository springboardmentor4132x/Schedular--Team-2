from app.auth.jwt import create_access_token, verify_access_token

user_data = {
    "email": "poojitha@gmail.com",
    "role": "student"
}

token = create_access_token(user_data)

print("Generated JWT Token:\n")
print(token)

decoded = verify_access_token(token)

print("\nDecoded Token:\n")
print(decoded)