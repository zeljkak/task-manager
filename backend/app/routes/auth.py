from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    get_jwt,
    set_access_cookies,
    jwt_required,
    get_jwt_identity,
    unset_jwt_cookies,
    set_refresh_cookies,
    create_access_token,
    create_refresh_token,
    decode_token, verify_jwt_in_request
)
from flasgger import swag_from
from datetime import timedelta
import os
import logging

from backend.app.extensions.token_blocklist import add_jti_to_blocklist
from backend.app.repositories.user_repository import UserRepository
from backend.app.services.auth_service import AuthService
from backend.app.services.user_service import UserService
from backend.app.schemas.auth_schema import RegisterSchema, LoginSchema, EnterEmailSchema, PasswordResetSchema
from backend.app.schemas.user_schema import UserSchema

from backend.app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

register_schema = RegisterSchema()
login_schema = LoginSchema()
user_schema = UserSchema()

@auth_bp.route('/register', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/register.yml"))
@limiter.limit("1 per minute")

def register():
    data = register_schema.load(request.get_json())
    user = UserService.create_user(data)

    return jsonify({
        "message": "User registered successfully",
        "user": user_schema.dump(user)
    }), 201

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    AuthService.verify_email(token)
    return jsonify({
        "message": "Email verified successfully"
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/forgot_password.yml"))
@limiter.limit("1 per day")

def send_email():
    data = EnterEmailSchema().load(request.get_json())
    user = UserService.get_user_by_email(data["email"])
    AuthService.request_password_reset(data["email"])
    return jsonify({
        "message": "Reset password email sent"
    }), 200

@auth_bp.route('/reset-password/<token>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/validate_token.yml"))

def check_token(token):
    user = UserService.get_user_by_token(token)
    return jsonify({
        "message": "User token valid"
    }), 200

@auth_bp.route('/reset-password/<token>', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/reset_password.yml"))
@limiter.limit("3 per day")

def change_password(token):
    data = PasswordResetSchema().load(request.get_json())
    AuthService.reset_password(token, data)
    return jsonify({
        "message": "Password updated successfully"
    }), 200

@auth_bp.route('/login', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/login.yml"))
@limiter.limit("10 per day")

def login():
    data = login_schema.load(request.get_json())
    access_token, refresh_token = AuthService.login_user(data["email"], data["password"])

    response = jsonify({
        "message": "Login successful"
    })

    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)

    return response, 200

@auth_bp.route('/refresh', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/refresh.yml"))
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    jwt_claims = get_jwt()
    jti = jwt_claims.get("jti")
    exp = jwt_claims.get("exp")

    user = UserRepository.get_by_id_including_deleted(current_user_id)

    if not user or user.is_deleted:
        response = jsonify({
            "error": "token_revoked",
            "message": "Session expired or revoked. Please log in again."
        })
        unset_jwt_cookies(response)
        return response, 401

    # refresh token rotation: revoke current refresh token's JTI
    if jti and exp is not None:
        added = add_jti_to_blocklist(str(jti), float(exp))
        if not added:
            # JTI was already revoked / rotated (potential replay attempt)
            logger.warning(f"Replay attempt detected for JTI {jti} by user {current_user_id}")
            response = jsonify({
                "error": "token_revoked",
                "message": "Token has been revoked or already used."
            })
            unset_jwt_cookies(response)
            return response, 401

    # issue fresh 15-minute access token with live role from DB
    new_access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role.role_name, "token_version": user.token_version}
    )
    new_refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims={"token_version": user.token_version},
        expires_delta=timedelta(days=30)
    )

    response = jsonify({"message": "Token refreshed successfully"})
    set_access_cookies(response, new_access_token)
    set_refresh_cookies(response, new_refresh_token)

    return response, 200

@auth_bp.route('/logout', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/logout.yml"))

def logout():
    user_id = None

    access_cookie_name = current_app.config.get(
        "JWT_ACCESS_COOKIE_NAME",
        "access_token_cookie"
    )

    refresh_cookie_name = current_app.config.get(
        "JWT_REFRESH_COOKIE_NAME",
        "refresh_token_cookie"
    )

    # first try the access token
    access_token = request.cookies.get(access_cookie_name)

    if access_token:
        try:
            decoded_access = decode_token(access_token)

            user_id = decoded_access.get("sub")

        except Exception as e:
            logger.debug(
                f"Failed to decode access token on logout: {e}"
            )

    # if the access token is missing
    refresh_token = request.cookies.get(refresh_cookie_name)
    if not user_id and refresh_token:
        try:
            decoded_refresh = decode_token(refresh_token)
            user_id = decoded_refresh.get("sub")

            # blocklist the current refresh token
            jti = decoded_refresh.get("jti")
            exp = decoded_refresh.get("exp")

            if jti and exp:
                add_jti_to_blocklist(
                    str(jti),
                    float(exp)
                )

        except Exception as e:
            logger.debug(
                f"Failed to decode refresh token on logout: {e}"
            )
    # if user is identified, invalidate all sessions
    if user_id:
        try:
            user = UserRepository.get_by_id_including_deleted(user_id)

            if user:
                UserService.invalidate_user_sessions(user)
                UserRepository.update(user)

        except Exception as e:
            logger.exception(
                f"Failed to invalidate user session during logout: {e}"
            )

    response = jsonify({
        "message": "Logout successful"
    })

    unset_jwt_cookies(response)

    return response, 200