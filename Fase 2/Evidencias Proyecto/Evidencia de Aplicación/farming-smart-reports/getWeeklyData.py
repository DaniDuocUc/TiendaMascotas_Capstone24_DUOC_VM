import requests
import re
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify

#Cargar la APi Key o el Jose me wa molestar
load_dotenv()

app = Flask(__name__)

# Función para obtener la API Key desde las variables de entorno
def obtener_api_key():
    api_key = os.getenv('API_KEY') 
    if not api_key:
        raise ValueError("API_KEY no definida en las variables de entorno")
    return api_key


def obtener_humedad(start_date, end_date):
    external_url = "https://dev-iot-backend.farmingsmart.cl/api/device/daily-humidity-averages"
    headers = {"API-Key": obtener_api_key()}
    params = {"start_date": start_date, "end_date": end_date}

    try:
        response = requests.get(external_url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Error al obtener los datos de humedad: {str(e)}"}

# Función para validar el correo electrónico
def validar_correo(correo):
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(regex, correo) is not None

if __name__ == '__main__':
    app.run(debug=True)
