from flask_jwt_extended import create_access_token
from app.models.user_model import User
from werkzeug.security import check_password_hash
from app.extensions.db import db

from app.exceptions.http_exceptions import (
    BadRequestError,
    AuthenticationError,
    ServiceUnavailableError
)

class AuthService:

    @staticmethod
    def login_user(email, password):

        try:
            user = User.query.filter_by(email=email).first()
        except Exception:
            raise ServiceUnavailableError("Database unavailable")

        # if the user doesn't exist respond with invalid credentials
        if not user:
            raise AuthenticationError("Invalid credentials")

        if not user.email_verified:
            raise AuthenticationError("Please verify your email first")

        if not check_password_hash(user.password, password):
            raise AuthenticationError("Invalid credentials")

        token = create_access_token(identity=user.email)

        return token

    @staticmethod
    def verify_email(token):
        try:
            user = User.query.filter_by(verification_token=token).first()
        except Exception:
            raise ServiceUnavailableError("Database unavailable")

        if not user:
            raise BadRequestError("Invalid verification token")

        if user.email_verified:
            return {"message": "Email address already verified"}

        user.email_verified = True
        user.verification_token = None

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Could not verify email")