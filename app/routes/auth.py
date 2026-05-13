from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flasgger import swag_from
import os

from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.schemas.auth_schema import RegisterSchema, LoginSchema
from app.schemas.user_schema import UserSchema

from app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

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
        "message": "User registered successfully,",
        "user": user_schema.dump(user)
    }), 201

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    AuthService.verify_email(token)
    return jsonify({
        "message": "Email verified successfully",
    }), 200

@auth_bp.route('/login', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/auth/login.yml"))
@limiter.limit("2 per minute")

def login():
    data = login_schema.load(request.get_json())
    token = AuthService.login_user(data["email"], data["password"])

    return jsonify({
        "message": "Login successful",
        "access_token": token
    }), 200
