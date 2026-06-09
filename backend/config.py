import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
    BASE_URL = os.getenv("BASE_URL")
    FRONTEND_URL = os.getenv("FRONTEND_URL")

    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")

    SEED_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL")
    SEED_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD")