import requests
import json

# Test creating a position
def test_create_position():
    url = 'http://127.0.0.1:8000/public-api/positions'
    data = {
        'name': 'Test Position from Python',
        'description': 'Created via Python script',
        'active': True
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("Position created successfully!")
        else:
            print(f"Failed to create position. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

# Test getting positions
def test_get_positions():
    url = 'http://127.0.0.1:8000/public-api/positions'
    
    headers = {
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            positions = response.json()
            print(f"Found {len(positions)} positions:")
            for position in positions:
                print(f"  - {position['id']}: {position['name']}")
        else:
            print(f"Failed to get positions. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing position API...")
    test_get_positions()
    test_create_position()
    print("Testing complete!") 