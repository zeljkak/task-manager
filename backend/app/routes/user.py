from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
import os

from backend.app.schemas.summary_schema import UserSummarySchema
from backend.app.extensions.limiter import limiter
from backend.app.schemas.auth_schema import EnterEmailSchema
from backend.app.schemas.user_schema import UserSchema, UserUpdateSchema
from backend.app.services.user_service import UserService

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
@limiter.limit("1 per day")

def send_restore_email():
    data = EnterEmailSchema().load(request.get_json())
    UserService.restore_request(data["email"])
    return jsonify({
        "message": "Restore account email sent"
    }), 200

@user_bp.route('/restore/<token>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/validate_token.yml"))

def restore(token):
    UserService.restore_user(token)
    return jsonify({
        "message": "User account restored"
    }), 200