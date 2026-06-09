from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
import os

from backend.app.decorators.roles_required import roles_required

from backend.app.extensions.limiter import limiter
from backend.app.schemas.role_schema import RoleSchema
from backend.app.schemas.user_schema import UserSchema, UserUpdateSchema
from backend.app.services.user_service import UserService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

user_bp = Blueprint('user', __name__, url_prefix='/users')

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

    user = UserService.delete_user(current_user)

    return "", 204

@user_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/users.yml"))
@jwt_required()
@roles_required("admin")

def get_users():
    users = UserService.get_all_users()

    return jsonify({
        "users": UserSchema(many=True).dump(users)
    }), 200

@user_bp.route('/<int:userId>/role', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/change_role.yml"))
@jwt_required()
@roles_required("admin")

def change_role(userId):
    data = RoleSchema().load(request.json)
    user = UserService.update_user_role(userId, data)

    return jsonify({
        "message": "User role updated successfully",
        "user": UserSchema().dump(user)
    }), 200