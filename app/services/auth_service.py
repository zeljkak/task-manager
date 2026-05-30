from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from app.extensions.db import db

from app.exceptions.http_exceptions import (
    BadRequestError,
    AuthenticationError,
    ServiceUnavailableError
)
from app.models import Role

from app.repositories.user_repository import UserRepository


class AuthService:

    @staticmethod
    def login_user(email, password):

        user = UserRepository.get_by_email(email)

        # if the user doesn't exist respond with invalid credentials
        if not user:
            raise AuthenticationError("Invalid credentials")

        if not user.email_verified:
            raise AuthenticationError("Please verify your email first")

        if not check_password_hash(user.password, password):
            raise AuthenticationError("Invalid credentials")

        token = create_access_token(identity=str(user.id), additional_claims={"role": user.role.role_name})

        return token

    @staticmethod
    def verify_email(token):
        user = UserRepository.get_by_token(token)

        if not user:
            raise BadRequestError("Invalid verification token")

        if user.email_verified:
            return {"message": "Email address already verified"}

        user.email_verified = True
        user.verification_token = None

#maybe move this part to repository layer
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Could not verify email")