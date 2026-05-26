from app.models.user_model import User
from app.exceptions.http_exceptions import ServiceUnavailableError
from app.extensions.db import db

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        try:
            return User.query.get(user_id)
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_email(user_email):
        try:
            return User.query.filter_by(email=user_email).first()
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_token(token):
        try:
            return User.query.filter_by(verification_token=token).first()
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return User.query.all()
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