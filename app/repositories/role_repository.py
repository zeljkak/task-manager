from app.models.role_model import Role
from app.extensions.db import db
from app.exceptions.http_exceptions import ServiceUnavailableError


class RoleRepository:
    @staticmethod
    def get_by_id(role_id):
        try:
            return Role.query.get(role_id)
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_name(name):
        try:
            return Role.query.filter_by(role_name=name).first()
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

    @staticmethod
    def delete(role_id):
        try:
            role = RoleRepository.get_by_id(role_id)
            if not role:
                return None
            db.session.delete(role)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e