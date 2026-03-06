import requests
import json
import time

url = "http://localhost:8000/ask"

# 1. Question in Context
payload1 = {
    "question": "What is the remote work policy?",
    "top_k": 3
}

# 2. Question NOT in Context
payload2 = {
    "question": "What is the company policy on bringing pets to the office?",
    "top_k": 3 
}

headers = {
    "Content-Type": "application/json"
}

print("Waiting for server to be fully ready...")
# Give the server a few extra seconds in case models are still loading into memory
time.sleep(5)

print("\n--- Test 1: Question IN Context ---")
try:
    response = requests.post(url, json=payload1, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")

print("\n--- Test 2: Question NOT IN Context ---")
try:
    response = requests.post(url, json=payload2, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
