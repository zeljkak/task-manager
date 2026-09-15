import uuid
from backend.app.exceptions.http_exceptions import BadRequestError
from backend.app.repositories.token_repository import TokenRepository
from backend.app.models.token_model import Token

class TokenService:
    @staticmethod
    def generate_token():
        return str(uuid.uuid4())

    @staticmethod
    def delete_token(token):
        return TokenRepository.delete(token)

    @staticmethod
    def check_expiration(token):
        if token.is_expired():
            TokenService.delete_token(token)
            raise BadRequestError("Token has expired")

    @staticmethod
    def check_token(token_str, expected_type, consume=False):
        token = TokenRepository.get_by_token_and_type(token_str, expected_type)

        if not token:
            raise BadRequestError("Invalid token")

        # check expiration
        TokenService.check_expiration(token)

        user = token.user
        if consume:
            TokenService.delete_token(token)

        return user

    @staticmethod
    def create_token(email, token_type):
        from backend.app.services.user_service import UserService

        user = UserService.get_user_by_email_including_deleted(email)

        # clean up existing tokens of the same type for this user
        token = TokenRepository.get_by_user_and_type(user.id, token_type)
        if token:
            TokenService.delete_token(token)

        raw_token = TokenService.generate_token()
        new_token = Token(token=raw_token, type=token_type, user_id=user.id)

        return TokenRepository.create(new_token)
