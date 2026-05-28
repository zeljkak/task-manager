from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
import os

from app.schemas.user_schema import UserSchema
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