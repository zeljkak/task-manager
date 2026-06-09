from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

from backend.app.services.user_service import UserService
from backend.app.services.email_service import EmailService

from backend.app.exceptions.http_exceptions import (
    BadRequestError,
    AuthenticationError,
    ServiceUnavailableError
)

from backend.app.repositories.user_repository import UserRepository


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

        return UserRepository.update(user)

    @staticmethod
    def request_password_reset(email):
        user = UserService.set_verification_token(email)

        try:
            EmailService.send_password_reset_email(user)
        except Exception:
            # add resend link option
            raise ServiceUnavailableError("Email service unavailable")
        return user

    @staticmethod
    def reset_password(token, data):
        user = UserRepository.get_by_token(token)

        if not user:
            raise BadRequestError("Invalid verification token")

        data['password'] = generate_password_hash(data['password'])

        user.password = data['password']
        user.verification_token = None

        return UserRepository.update(user)