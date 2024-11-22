ECHO OFF
waitress-serve --port=5000 --url-scheme=https app:create_app
PAUSE