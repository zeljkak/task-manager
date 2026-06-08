from app.models import Role
from app.models.user_model import User
from app.exceptions.http_exceptions import ServiceUnavailableError, NotFoundError
from app.extensions.db import db

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_email(user_email):
        try:
            user = User.query.filter_by(email=user_email).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_token(token):
        try:
            user = User.query.filter_by(verification_token=token).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            users = User.query.all()
            if not users:
                return None
            return users
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(user):
        try:
            db.session.add(user)
            db.session.commit()
            return user
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def update(user):
        try:
            db.session.commit()
            return user
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

"""
    @staticmethod
    def delete(user_id):
        try:
            user = UserRepository.get_by_id(user_id)
            if not user:
                return None
            db.session.delete(user)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
"""