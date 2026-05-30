from app.models.role_model import Role
from app.extensions.db import db
from app.exceptions.http_exceptions import ServiceUnavailableError


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
            roles = Role.query.all()
            if not roles:
                return None
            return roles
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

"""
    @staticmethod
    def update(role_id, role_name):
        try:
            role = RoleRepository.get_by_id(role_id)
            if not role:
                return None

            role.role_name = role_name
            db.session.commit()
            return role

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
"""

"""
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
"""