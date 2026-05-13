from app.extensions.db import db
from app.models.user_model import User
from app.models.role_model import Role
from werkzeug.security import generate_password_hash
from config import Config
from app.exceptions.http_exceptions import NotFoundError


def seed_admin_user():

    email = Config.SEED_ADMIN_EMAIL
    password = Config.SEED_ADMIN_PASSWORD

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return

    admin_role = Role.query.filter_by(role_name="admin").first()

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

    db.session.add(user)
    db.session.commit()