from app.extensions.db import db
from app.models.user_model import User
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailService

from app.exceptions.http_exceptions import (
    DuplicatesError,
    ServiceUnavailableError
)

class UserService:

    DEFAULT_ROLE_ID = 2

    @staticmethod
    def get_user_by_id(user_id):
        return UserRepository.get_by_id(user_id)

    @staticmethod
    def get_user_by_email(email):
        return UserRepository.get_by_email(email)


    @staticmethod
    def create_user(data):
        existing_user = UserService.get_user_by_email(data["email"])

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

        UserRepository.create(user)

        try:
            EmailService.send_verification_email(user)
        except Exception:
            # add resend link option
            raise ServiceUnavailableError("Email service unavailable")
        return user


    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user.password, password)