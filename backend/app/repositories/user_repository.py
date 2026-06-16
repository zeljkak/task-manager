from backend.app.models.user_model import User
from backend.app.exceptions.http_exceptions import ServiceUnavailableError
from backend.app.extensions.db import db

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        try:
            user = User.query.filter_by(id=user_id, is_deleted=False).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_email(user_email):
        try:
            user = User.query.filter_by(email=user_email, is_deleted=False).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_token(token):
        try:
            user = User.query.filter_by(verification_token=token, is_deleted=False).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return User.query.filter_by(is_deleted=False).all()

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_deleted_by_id(user_id):
        try:
            user = User.query.filter_by(id=user_id, is_deleted=True).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_deleted_by_email(email):
        try:
            user = User.query.filter_by(email=email, is_deleted=True).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_deleted_by_token(token):
        try:
            user = User.query.filter_by(verification_token=token, is_deleted=True).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_deleted_all():
        try:
            return User.query.filter_by(is_deleted=True).all()

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_email_including_deleted(email):
        try:
            user = User.query.filter_by(email=email).first()
            if not user:
                return None
            return user
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_token_including_deleted(token):
        try:
            user = User.query.filter_by(verification_token=token).first()
            if not user:
                return None
            return user
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
