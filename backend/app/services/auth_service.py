from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta
from werkzeug.security import generate_password_hash, check_password_hash

from backend.app.models.user_model import User
from backend.app.services.token_service import TokenService
from backend.app.services.user_service import UserService
from backend.app.services.email_service import EmailService

from backend.app.repositories.user_repository import UserRepository

from backend.app.exceptions.http_exceptions import BadRequestError, AuthenticationError


class AuthService:

    @staticmethod
    def login_user(email, password):

        user = UserService.get_user_by_email_including_deleted(email)

        # if the user doesn't exist respond with invalid credentials
        if not user:
            raise AuthenticationError("Invalid credentials")

        if user.is_deleted:
            raise AuthenticationError("Account deleted, restore available")

        if not user.email_verified:
            raise AuthenticationError("Please verify your email first")

        if not check_password_hash(user.password, password):
            raise AuthenticationError("Invalid credentials")

        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role.role_name, "token_version": user.token_version})
        refresh_token = create_refresh_token(identity=str(user.id), additional_claims={"token_version": user.token_version}, expires_delta=timedelta(days=30))

        return access_token, refresh_token

    @staticmethod
    def request_email_verification(email):
        user = UserRepository.get_by_email(email)
        if not user:
            return

        token = TokenService.create_token(user.email, "email_verify")
        EmailService.send_verification_email(user, token.token)

        return user

    @staticmethod
    def verify_email(token):
        user = TokenService.check_token(token, expected_type="email_verify", consume=True)

        if user.email_verified:
            return {"message": "Email address already verified"}

        user.email_verified = True

        return UserRepository.update(user)

    @staticmethod
    def request_password_reset(email):
        user = UserRepository.get_by_email(email)
        if not user:
            return

        token = TokenService.create_token(email, "password_reset")

        EmailService.send_password_reset_email(user, token.token)

        return user

    @staticmethod
    def reset_password(token, data):
        user = TokenService.check_token(token, "password_reset", consume=True)

        if user.is_deleted:
            raise AuthenticationError("Account deleted, restore available")

        data['password'] = generate_password_hash(data['password'])

        user.password = data['password']
        UserService.invalidate_all_user_sessions(user)

        return UserRepository.update(user)