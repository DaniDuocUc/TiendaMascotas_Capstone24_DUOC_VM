ECHO OFF
waitress-serve --port=5000 --url-scheme=https api:app
PAUSE