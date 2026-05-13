from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

user_bp = Blueprint('user', __name__, url_prefix='/user')


@user_bp.route('/profile', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/user/profile.yml"))
@jwt_required()

def profile():
    current_user = get_jwt_identity()

    return jsonify({
        "message": "This is protected data",
        "user": current_user
    }), 200