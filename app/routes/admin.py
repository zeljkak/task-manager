from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from app.decorators.roles_required import roles_required

from app.services.task_service import TaskService
from app.schemas.task_schema import TaskResponseSchema

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/tasks', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/get_deleted_tasks.yml"))
@jwt_required()
@roles_required("admin")

def get_deleted_tasks():
    tasks = TaskService.get_deleted_tasks()

    return jsonify({
        "tasks": TaskResponseSchema(many=True).dump(tasks)
    }), 200

@admin_bp.route('/tasks/deleted/<int:taskId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/get_deleted_task.yml"))
@jwt_required()
@roles_required("admin")

def get_deleted_task(taskId):
    task = TaskService.get_deleted_task_by_id(taskId)

    return jsonify({
        "task": TaskResponseSchema().dump(task)
    }), 200

@admin_bp.route('/tasks/restore/<int:taskId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/admin/restore_task.yml"))
@jwt_required()
@roles_required("admin")

def restore_task(taskId):
    current_user = int(get_jwt_identity())
    task = TaskService.restore_task(taskId, current_user)

    return jsonify({
        "message": "Task updated successfully",
        "task": TaskResponseSchema().dump(task)
    }), 200