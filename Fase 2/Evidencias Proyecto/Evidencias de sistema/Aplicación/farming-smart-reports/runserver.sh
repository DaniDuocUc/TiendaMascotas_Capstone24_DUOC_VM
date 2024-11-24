#!/bin/sh

gunicorn --config gunicorn_config.py "app:create_app()"