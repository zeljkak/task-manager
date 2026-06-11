from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from backend.app.services.auth_service import AuthService
from backend.app.services.user_service import UserService
from backend.app.schemas.auth_schema import RegisterSchema, LoginSchema, EnterEmailSchema, PasswordResetSchema
from backend.app.schemas.user_schema import UserSchema

from backend.app.extensions.limiter import limiter

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
@limiter.limit("2 per minute")

def login():
    data = login_schema.load(request.get_json())
    token = AuthService.login_user(data["email"], data["password"])

    return jsonify({
        "message": "Login successful",
        "accessToken": token
    }), 200
