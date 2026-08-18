from flask import jsonify
from flask_jwt_extended import JWTManager
from backend.app.extensions.token_blocklist import is_jti_blocklisted

jwt = JWTManager()

def configure_jwt(jwt_manager: JWTManager) -> None:

    @jwt_manager.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload: dict) -> bool:
        # skip relative imports to avoid circular dependency issues
        from backend.app.repositories.user_repository import UserRepository

        token_type = jwt_payload.get("type")
        jti = jwt_payload.get("jti")

        # check explicitly revoked JTI (used for single-use refresh token rotation)
        if jti and is_jti_blocklisted(str(jti)):
            return True

        # skip token_version check for refresh tokens
        if token_type == "refresh":
            return False

        user_id = jwt_payload.get("sub")
        token_version = jwt_payload.get("token_version")

        if not user_id or token_version is None:
            return True

        user_meta = UserRepository.get_user_auth_metadata(int(user_id))

        # revoke if user does not exist, is soft-deleted, or token version is stale
        if not user_meta or user_meta.is_deleted:
            return True

        return user_meta.token_version != token_version

    @jwt_manager.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "token_revoked",
            "message": "Your session has been invalidated. Please log in again."
        }), 401

    @jwt_manager.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "error": "expired_token",
            "message": "Token verification failed."
        }), 401

    @jwt_manager.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            "error": "invalid_token",
            "message": "Signature verification failed or token malformed"
        }), 401

    @jwt_manager.unauthorized_loader
    def missing_token_callback(error_string):
        if "csrf" in str(error_string).lower():
            return jsonify({
                "error": "csrf_missing",
                "message": "Missing CSRF token."
            }), 401
        return jsonify({
            "error": "authorization_required",
            "message": "Request does not contain a valid authentication token."
        }), 401