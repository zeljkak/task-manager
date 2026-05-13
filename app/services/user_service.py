from app.extensions.db import db
from app.models.user_model import User
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from app.services.email_service import EmailService

from app.exceptions.http_exceptions import (
    DuplicatesError,
    ServiceUnavailableError
)

class UserService:

    DEFAULT_ROLE_ID = 2

    @staticmethod
    def create_user(data):

        try:
            existing_user = User.query.filter_by(email=data["email"]).first()
        except Exception:
            raise ServiceUnavailableError("Database unavailable")

        if existing_user:
            raise DuplicatesError('User already exists')

        hashed_password = generate_password_hash(data['password'])

        user = User(
            first_name = data["first_name"],
            last_name = data["last_name"],
            email = data["email"],
            password = hashed_password,
            email_verified = False,
            verification_token = str(uuid.uuid4()),
            role_id = UserService.DEFAULT_ROLE_ID
        )

        try:
            db.session.add(user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable")

        try:
            EmailService.send_verification_email(user)
        except Exception:
            # add resend link option
            raise ServiceUnavailableError("Email service unavailable")
        return user

    @staticmethod
    def get_user_by_email(email):
        try:
            user = User.query.filter_by(email=email).first()
        except Exception:
            raise ServiceUnavailableError("Database unavailable")

        return user


    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user.password, password)