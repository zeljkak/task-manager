from backend.app.models.user_model import User
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

from backend.app.repositories.user_repository import UserRepository
from backend.app.services.activity_log_service import ActivityLogService
from backend.app.services.email_service import EmailService

from backend.app.exceptions.http_exceptions import DuplicatesError, NotFoundError, BadRequestError
from backend.app.services.role_service import RoleService


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
    def get_user_by_token(token):
        user = UserRepository.get_by_token(token)

        if not user:
            raise NotFoundError("User not found")

        return user


    @staticmethod
    def get_all_users():
        users = UserRepository.get_all()

        if not users:
            raise NotFoundError("Users not found")

        return users


    @staticmethod
    def get_deleted_user_by_id(user_id):
        user = UserRepository.get_deleted_by_id(user_id)

        if not user:
            raise NotFoundError("User not found")

        return user


    @staticmethod
    def get_deleted_user_by_token(token):
        user = UserRepository.get_deleted_by_token(token)

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
        users = UserRepository.get_deleted_all()

        if not users:
            raise NotFoundError("Users not found")

        return users


    @staticmethod
    def get_user_by_email_including_deleted(email):
        user = UserRepository.get_by_email_including_deleted(email)

        if not user:
            raise NotFoundError('User not found')

        return user


    @staticmethod
    def get_user_by_token_including_deleted(token):
        user = UserRepository.get_by_token_including_deleted(token)

        if not user:
            raise NotFoundError('User not found')

        return user


    @staticmethod
    def generate_verification_token():
        return str(uuid.uuid4())


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
            verification_token = UserService.generate_verification_token(),
            role_id = UserService.DEFAULT_ROLE_ID
        )

        UserRepository.create(user)
        EmailService.send_verification_email(user)

        return user


    @staticmethod
    def set_verification_token(email):
        user = UserService.get_user_by_email_including_deleted(email)
        user.verification_token = UserService.generate_verification_token()

        return UserRepository.update(user)


    @staticmethod
    def check_verification_token(token):
        user = UserRepository.get_by_token_including_deleted(token)
        if not user:
            raise AuthenticationError('Invalid verification token')
        return user


    @staticmethod
    def update_user(current_user_id, data):
        user = UserService.get_user_by_id(current_user_id)

        for key, value in data.items():
            if key in UserService.TRACKED_FIELDS:
                setattr(user, key, value)

        return UserRepository.update(user)


    @staticmethod
    def update_user_role(user_id, data):
        role_name = data["role_name"].lower()
        user = UserService.get_user_by_id(user_id)
        role = RoleService.get_role_by_name(role_name)

        user.role_id = role.id
        return UserRepository.update(user)


    @staticmethod
    def delete_user(user_id):
        user = UserService.get_user_by_id(user_id)
        user.is_deleted = True

        ActivityLogService.deletion_activity(user_id, "USER_DELETED")
        return UserRepository.update(user)


    @staticmethod
    def restore_request(email):
        user_existence = UserService.get_deleted_user_by_email(email)
        user = UserService.set_verification_token(email)

        EmailService.send_restore_account_email(user)

        return user


    @staticmethod
    def restore_user(token):
        user = UserService.get_deleted_user_by_token(token)
        user.is_deleted = False
        user.verification_token = None

        ActivityLogService.deletion_activity(user.id, "USER_RESTORED")
        return UserRepository.update(user)


    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user.password, password)