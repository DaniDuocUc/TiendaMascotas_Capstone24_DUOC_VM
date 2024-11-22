def get_weather(lat: str, lon: str):
    import requests
    if not lat or not lon:
        return []
    url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={lat}&lon={lon}"
    print(f"Requesting URL: {url}")
    try:
        headers = {
            "User-Agent": "MyWeatherApp/1.0 (myemail@example.com)"  # Cambia esto por tu información
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"API responded with status code {response.status_code}")
            return []
        data = response.json()
        if 'properties' not in data or 'timeseries' not in data['properties']:
            print("Unexpected response structure")
            return []
        return data['properties']['timeseries']
    except requests.exceptions.RequestException as e:
        print(f"Error while making request: {e}")
        return []
