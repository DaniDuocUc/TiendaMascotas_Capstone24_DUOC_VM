import os
from dotenv import load_dotenv, find_dotenv


class EnvironmentConfig:
    load_dotenv(find_dotenv())
    DATABASE_HOST = os.getenv('DB_HOST', 'localhost')
    DATABASE_PORT = os.getenv('DB_PORT', 5432)
    DATABASE_USER = os.getenv('DB_USER', 'username')
    DATABASE_PASS = os.getenv('DB_PASSWORD', 'password')
    DATABASE_NAME = os.getenv('DB_NAME', 'mydb')
    API_KEY = os.getenv('API_KEY', '123456789abcdef')

    def get_database_url(self):
        return f'postgresql://{self.DATABASE_USER}:{self.DATABASE_PASS}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}'
