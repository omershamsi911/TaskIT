# test_api.py
import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000/api"

async def test_backend():
    async with httpx.AsyncClient() as client:
        print("🧪 Testing Taskit Backend\n")
        
        # 1. Test Health Endpoint
        print("1️⃣ Testing health endpoint...")
        response = await client.get("http://localhost:8000/health")
        print(f"   Status: {response.status_code} - {response.json()}\n")
        
        # 2. Test Signup
        print("2️⃣ Testing user signup...")
        signup_data = {
            "full_name": "Test User",
            "phone": "+923001534567",
            "email": "test@example2.com",
            "password": "test123",  # Short, simple password
            "role": "customer"
        }
        response = await client.post(f"{BASE_URL}/auth/signup", json=signup_data)
        if response.status_code == 200:
            tokens = response.json()
            print(f"   ✅ Signup successful!")
            print(f"   Access Token: {tokens['access_token'][:50]}...\n")
            access_token = tokens['access_token']
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print("Raw response:", response.text)
            return
        
        # 3. Test Get Current User
        print("3️⃣ Testing get current user...")
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await client.get(f"{BASE_URL}/users/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            print(f"   ✅ User: {user['full_name']} ({user['email']})\n")
        else:
            print(f"   ❌ Failed: {response.json()}\n")
        
        # 4. Test Add Address
        print("4️⃣ Testing add address...")
        address_data = {
            "label": "Home",
            "address_line1": "123 Main Street",
            "city": "Karachi",
            "province": "Sindh",
            "postal_code": "74000",
            "lat": 24.8607,
            "lng": 67.0011,
            "is_default": True
        }
        response = await client.post(
            f"{BASE_URL}/users/addresses",
            json=address_data,
            headers=headers
        )
        if response.status_code == 201:
            address = response.json()
            print(f"   ✅ Address added: {address['address_line1']}\n")
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print("Raw response:", response.text)
        
        # 5. Test Search Providers
        print("5️⃣ Testing provider search...")
        response = await client.get(
            f"{BASE_URL}/providers/search",
            params={"lat": 24.8607, "lng": 67.0011, "max_distance_km": 10},
            headers=headers
        )
        if response.status_code == 200:
            providers = response.json()
            print(f"   ✅ Found {len(providers)} providers\n")
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print("Raw response:", response.text)
        
        # 6. Test AI Matching
        print("6️⃣ Testing AI provider matching...")
        response = await client.get(
            f"{BASE_URL}/ai/match-providers",
            params={
                "subcategory_id": 1,
                "lat": 24.8607,
                "lng": 67.0011,
                "budget": 500,
                "limit": 3
            },
            headers=headers
        )
        if response.status_code == 200:
            matches = response.json()
            print(f"   ✅ AI matched {len(matches)} providers\n")
        else:
            print(f"   ⚠️  AI matching returned: {response.status_code}\n")
        
        print("✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(test_backend())