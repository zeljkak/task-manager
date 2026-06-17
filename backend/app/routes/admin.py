from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from
import os

from backend.app.decorators.roles_required import roles_required

from backend.app.extensions.limiter import limiter
from backend.app.schemas.activity_log_schema import ActivityLogResponseSchema
from backend.app.schemas.role_schema import RoleSchema
from backend.app.schemas.user_schema import UserSchema
from backend.app.services.user_service import UserService
from backend.app.services.activity_log_service import ActivityLogService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/users', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/users.yml"))
@jwt_required()
@roles_required("admin")

def get_users():
    users = UserService.get_all_users()

    return jsonify({
        "users": UserSchema(many=True).dump(users)
    }), 200


@admin_bp.route('/users/<int:userId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/get_user.yml"))
@jwt_required()
@roles_required("admin")

def get_user(userId):
    user = UserService.get_user_by_id(userId)

    return jsonify({
        "user": UserSchema().dump(user)
    }), 200

@admin_bp.route('/users/<int:userId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/update_user.yml"))
@jwt_required()
@roles_required("admin")
@limiter.limit("3 per minute")

def update_user(userId):
    data = RoleSchema().load(request.json)
    user = UserService.update_user_by_admin(userId, data)

    return jsonify({
        "message": "User updated successfully",
        "user": UserSchema().dump(user)
    }), 200

@admin_bp.route('/activity-logs', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/get_activity_logs.yml"))
@jwt_required()
@roles_required("admin")

def get_activity_logs():
    task_id = request.args.get("taskId", type=int)
    user_id = request.args.get("userId", type=int)

    logs = ActivityLogService.get_logs(task_id, user_id)

    return jsonify({
        "activities": ActivityLogResponseSchema(many=True).dump(logs)
    }), 200