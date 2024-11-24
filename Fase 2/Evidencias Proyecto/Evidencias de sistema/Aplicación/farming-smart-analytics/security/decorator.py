from flask import request, jsonify

from enviroment_config import EnvironmentConfig

environment = EnvironmentConfig()


def require_api_key(func):
    def wrapper(*args, **kwargs):
        api_key = request.headers.get("X-API-KEY")  # Lee la API key del header
        if api_key != environment.API_KEY:
            return jsonify({"error": "Invalid or missing API key"}), 403
        return func(*args, **kwargs)

    wrapper.__name__ = func.__name__
    return wrapper
