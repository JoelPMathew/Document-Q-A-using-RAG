import requests
import json
import time

url = "http://localhost:8000/ask"

def run_test(question):
    print(f"\n--- Test: {question} ---")
    payload = {
        "question": question,
        "top_k": 3
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    time.sleep(2) # Give uvicorn a moment to reload
    run_test("What are the security protocols?")
    run_test("Paid off Time?")
    run_test("Can I bring my pet dinosaur to work?")
