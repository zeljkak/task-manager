from backend.app.models.token_model import Token
from backend.app.extensions.db import db
from backend.app.exceptions.http_exceptions import ServiceUnavailableError

class TokenRepository:
    @staticmethod
    def get_by_token_and_type(token_str, expected_type):
        try:
            token = Token.query.filter_by(token=token_str, type=expected_type).first()
            if not token:
                return None
            return token
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def get_by_user_and_type(user_id, expected_type):
        try:
            token = Token.query.filter_by(user_id=user_id, type=expected_type).first()
            if not token:
                return None
            return token
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def create(token):
        try:
            db.session.add(token)
            db.session.commit()
            return token
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def delete(token):
        try:
            db.session.delete(token)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e