from werkzeug.security import generate_password_hash, check_password_hash

from backend.app.models.user_model import User
from backend.app.repositories.user_repository import UserRepository
from backend.app.services.activity_log_service import ActivityLogService
from backend.app.services.email_service import EmailService
from backend.app.services.token_service import TokenService
from backend.app.services.role_service import RoleService

from backend.app.exceptions.http_exceptions import (
    DuplicatesError, NotFoundError, AuthenticationError, BadRequestError
)
from marshmallow import ValidationError


class UserService:

    DEFAULT_ROLE_ID = 2

    TRACKED_FIELDS = [
        "first_name",
        "last_name"
    ]

    @staticmethod
    def get_user_by_id(user_id):
        user = UserRepository.get_by_id(user_id)

        if not user:
            raise NotFoundError('User not found')

        return user


    @staticmethod
    def get_user_by_email(email):
        user = UserRepository.get_by_email(email)
        if not user:
            raise NotFoundError("User not found")

        return user


    @staticmethod
    def get_all_users():
        return UserRepository.get_all()


    @staticmethod
    def get_deleted_user_by_id(user_id):
        user = UserRepository.get_deleted_by_id(user_id)

        if not user:
            raise NotFoundError("User not found")

        return user


    @staticmethod
    def get_deleted_user_by_email(email):
        user = UserRepository.get_deleted_by_email(email)

        if not user:
            raise NotFoundError("User not found")

        return user


    @staticmethod
    def get_deleted_users():
        return UserRepository.get_deleted_all()


    @staticmethod
    def get_user_by_id_including_deleted(user_id):
        user = UserRepository.get_by_id_including_deleted(user_id)

        if not user:
            raise NotFoundError('User not found')

        return user


    @staticmethod
    def get_user_by_email_including_deleted(email):
        user = UserRepository.get_by_email_including_deleted(email)

        if not user:
            raise NotFoundError('User not found')

        return user


    @staticmethod
    def invalidate_all_user_sessions(user):
        user.token_version += 1
        return UserRepository.update(user)


    @staticmethod
    def save_password(user, new_password):
        user.password = generate_password_hash(new_password)
        return UserRepository.update(user)


    @staticmethod
    def verify_password(user, password):
        if not check_password_hash(user.password, password):
            raise ValidationError('Incorrect current password')
        return True


    @staticmethod
    def create_user(data):
        existing_user = UserRepository.get_by_email_including_deleted(data["email"])
        if existing_user:
            raise DuplicatesError('User already exists')

        hashed_password = generate_password_hash(data['password'])

        user = User(
            first_name = data["first_name"],
            last_name = data["last_name"],
            email = data["email"],
            password = hashed_password,
            email_verified = False,
            role_id = UserService.DEFAULT_ROLE_ID
        )

        UserRepository.create(user)
        token = TokenService.create_token(user.email, "email_verify")
        EmailService.send_verification_email(user, token.token)

        return user


    @staticmethod
    def update_user(current_user_id, data):
        user = UserService.get_user_by_id(current_user_id)

        for key, value in data.items():
            if key in UserService.TRACKED_FIELDS:
                setattr(user, key, value)

        return UserRepository.update(user)


    @staticmethod
    def update_user_by_admin(user_id, data):
        role_name = data["role_name"].lower()
        user = UserService.get_user_by_id(user_id)
        role = RoleService.get_role_by_name(role_name)

        if user.role_id != role.id:
            user.role_id = role.id
            UserService.invalidate_all_user_sessions(user)
        return UserRepository.update(user)


    @staticmethod
    def delete_user(user_id):
        user = UserService.get_user_by_id(user_id)
        user.is_deleted = True
        UserService.invalidate_all_user_sessions(user)

        ActivityLogService.deletion_activity(user_id, "USER_DELETED")
        return UserRepository.update(user)


    @staticmethod
    def restore_request(email):
        user = UserRepository.get_deleted_by_email(email)
        if not user:
            return

        token = TokenService.create_token(user.email, "account_restore")
        EmailService.send_restore_account_email(user, token.token)

        return user


    @staticmethod
    def restore_user(token):
        user = TokenService.check_token(token, expected_type="account_restore", consume=True)
        user.is_deleted = False
        UserService.invalidate_all_user_sessions(user)

        ActivityLogService.deletion_activity(user.id, "USER_RESTORED")
        return UserRepository.update(user)

    @staticmethod
    def check_followed_tasks(user_id):
        user = UserService.get_user_by_id(user_id)
        return user.followed_tasks