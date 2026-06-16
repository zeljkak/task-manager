from backend.app.models.role_model import Role
from backend.app.extensions.db import db
from backend.app.exceptions.http_exceptions import ServiceUnavailableError


class RoleRepository:
    @staticmethod
    def get_by_id(role_id):
        try:
            role = Role.query.get(role_id)
            if not role:
                return None
            return role
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_name(name):
        try:
            role = Role.query.filter_by(role_name=name).first()
            if not role:
                return None
            return role
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return Role.query.all()

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(role):
        try:
            db.session.add(role)
            db.session.commit()
            return role
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
