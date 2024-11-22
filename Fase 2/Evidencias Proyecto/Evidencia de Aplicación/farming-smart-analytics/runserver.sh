#!/bin/bash
gunicorn --config gunicorn_config.py api:app