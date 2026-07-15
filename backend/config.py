import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = False #set to True in production (HTTPS)
    JWT_COOKIE_CSRF_PROTECT = False #set to True later if you want CSRF protection

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PROJECT_ROOT_BACKEND = os.path.dirname(os.path.abspath(__file__))
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

    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT_BACKEND, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024