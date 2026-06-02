from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.task_service import TaskService
from app.schemas.task_schema import TaskSchema, TaskResponseSchema

from app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

task_bp = Blueprint('task', __name__, url_prefix='/tasks')

task_schema = TaskSchema()

@task_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/tasks.yml"))
@jwt_required()

def get_tasks():
    tasks = TaskService.get_all_tasks()

    return jsonify({
        "tasks": TaskResponseSchema(many=True).dump(tasks)
    }), 200

@task_bp.route('/<int:taskId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_task.yml"))
@jwt_required()

def get_task(taskId):
    task = TaskService.get_task_by_id(taskId)

    return jsonify({
        "task": TaskResponseSchema().dump(task)
    }), 200

@task_bp.route('/create_task', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/create_task.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def create_task():
    current_user = int(get_jwt_identity())

    data = task_schema.load(request.get_json())
    task = TaskService.create_task(data, current_user)

    return jsonify({
        "message": "Task created successfully",
        "task": TaskResponseSchema().dump(task)
    }), 201