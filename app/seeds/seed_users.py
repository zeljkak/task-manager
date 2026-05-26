from app.extensions.db import db
from app.models.user_model import User
from werkzeug.security import generate_password_hash

from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from config import Config
from app.exceptions.http_exceptions import NotFoundError


def seed_admin_user():

    email = Config.SEED_ADMIN_EMAIL
    password = Config.SEED_ADMIN_PASSWORD

    existing_user = UserRepository.get_by_email(email)
    if existing_user:
        return

    admin_role = RoleRepository.get_by_name("admin")
    if not admin_role:
        raise NotFoundError("Admin role does not exist. Seed roles first.")

    user = User(
        first_name="Zeljka",
        last_name="Knezevic",
        email=email,
        password=generate_password_hash(password),
        email_verified=True,
        verification_token=None,
        role_id=admin_role.id
    )

    UserRepository.create(user)