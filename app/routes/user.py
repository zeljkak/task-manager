from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
import os

from app.extensions.limiter import limiter
from app.schemas.user_schema import UserSchema, UserUpdateSchema
from app.services.user_service import UserService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

user_bp = Blueprint('user', __name__, url_prefix='/user')
user_schema = UserSchema()

@user_bp.route('/profile', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/profile.yml"))
@jwt_required()

def profile():
    current_user_id = get_jwt_identity()

    user = UserService.get_user_by_id(current_user_id)

    return jsonify({
        "message": "This is protected data",
        "user": user_schema.dump(user)
    }), 200

@user_bp.route('/update', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/update_user.yml"))
@jwt_required()
@limiter.limit("3 per hour")

def update_profile():
    current_user = get_jwt_identity()

    data =  UserUpdateSchema().load(request.json)
    user = UserService.update_user(current_user, data)

    return jsonify({
        "message": "User profile updated successfully",
        "user": user_schema.dump(user)
    }), 200