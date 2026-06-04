from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from app.decorators.roles_required import roles_required

from app.schemas.comment_schema import CommentSchema, CommentResponseSchema
from app.services.comment_service import CommentService
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

@task_bp.route('/<int:taskId>/comments', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_comments_for_task.yml"))
@jwt_required()

def get_comments(taskId):
    comments = CommentService.get_all_comments_for_task(taskId)

    return jsonify({
        "comments": CommentResponseSchema(many=True).dump(comments)
    }), 200

@task_bp.route('/<int:taskId>/comments', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/create_comment_for_task.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def create_comment(taskId):
    current_user = int(get_jwt_identity())
    data = CommentSchema().load(request.get_json())
    comment = CommentService.create_comment(data, current_user, taskId)

    return jsonify({
        "message": "Comment created successfully",
        "comment": CommentResponseSchema().dump(comment)
    }), 200

@task_bp.route('/<int:taskId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/update_task.yml"))
@jwt_required()

def update_task(taskId):
    current_user = int(get_jwt_identity())
    data = TaskSchema().load(request.get_json())

    task = TaskService.update_task(taskId, data, current_user)

    return jsonify({
        "message": "Task updated successfully",
        "task": TaskResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/delete_task.yml"))
@limiter.limit("2 per minute")
@jwt_required()

def delete_task(taskId):
    current_user = int(get_jwt_identity())
    TaskService.delete_task(taskId, current_user)

    return "", 204