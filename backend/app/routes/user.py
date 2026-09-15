from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, create_access_token, create_refresh_token

from flasgger import swag_from
import os

from backend.app.schemas.user_schema import UserPasswordChangeSchema
from backend.app.schemas.summary_schema import UserSummarySchema
from backend.app.extensions.limiter import limiter
from backend.app.schemas.auth_schema import EnterEmailSchema
from backend.app.schemas.user_schema import UserSchema, UserUpdateSchema
from backend.app.services.user_service import UserService
from backend.app.services.token_service import TokenService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

user_bp = Blueprint('user', __name__, url_prefix='/users')

@user_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/users.yml"))
@jwt_required()

def get_users():
    users = UserService.get_all_users()

    return jsonify({
        "users": UserSummarySchema(many=True).dump(users)
    }), 200

@user_bp.route('/profile', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/profile.yml"))
@jwt_required()

def profile():
    current_user_id = get_jwt_identity()

    user = UserService.get_user_by_id(current_user_id)

    return jsonify({
        "user": UserSchema().dump(user)
    }), 200

@user_bp.route('/change-password', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/change_password.yml"))
@jwt_required()

def change_password():
    current_user_id = get_jwt_identity()
    user = UserService.get_user_by_id(current_user_id)

    data = UserPasswordChangeSchema().load(request.json)

    UserService.verify_password(user, data["current_password"])
    UserService.save_password(user, data["new_password"])

    # calculate the NEW token version in memory first
    next_token_version = user.token_version + 1

    # create fresh tokens with the NEW token_version for the current user
    new_access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role.role_name, "token_version": next_token_version}
    )

    new_refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims={"token_version": next_token_version},
        expires_delta=timedelta(days=30)
    )

    # increment token_version (invalidates ALL old tokens)
    user = UserService.invalidate_all_user_sessions(user)

    response = jsonify({
        "message": "Password updated successfully"
    })

    set_access_cookies(response, new_access_token)
    set_refresh_cookies(response, new_refresh_token)

    return response, 200

@user_bp.route('/update', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/update_user.yml"))
@jwt_required()
@limiter.limit("3 per hour")

def update_profile():
    current_user = get_jwt_identity()

    data = UserUpdateSchema().load(request.json)
    user = UserService.update_user(current_user, data)

    return jsonify({
        "message": "User profile updated successfully",
        "user": UserSchema().dump(user)
    }), 200

@user_bp.route('/delete', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/delete_user.yml"))
@jwt_required()
@limiter.limit("1 per day")

def delete_profile():
    current_user = get_jwt_identity()

    UserService.delete_user(current_user)

    return "", 204

@user_bp.route('/restore-request', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/restore_request.yml"))
@limiter.limit("10 per hour")

def send_restore_email():
    data = EnterEmailSchema().load(request.get_json())
    UserService.restore_request(data["email"])
    return jsonify({
        "message": "If an account with this email exists, restore email was sent"
    }), 200

@user_bp.route('/restore/<token>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/validate_restore_account_token.yml"))
@limiter.limit("5 per day")

def check_restore_token(token):
    TokenService.check_token(token, expected_type='account_restore')
    return jsonify({
        "message": "Token valid"
    }), 200

@user_bp.route('/restore/<token>', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, '../../docs/user/restore_account.yml'))
@limiter.limit("5 per day")

def restore(token):
  # validates, deletes token and sets user.is_deleted = False
  UserService.restore_user(token)
  return jsonify({
      "message": "User account restored successfully"
  }), 200