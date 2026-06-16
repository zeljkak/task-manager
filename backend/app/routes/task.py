from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.app.decorators.roles_required import roles_required

from backend.app.schemas.comment_schema import CommentSchema, CommentResponseSchema
from backend.app.services.comment_service import CommentService
from backend.app.services.task_service import TaskService
from backend.app.schemas.task_schema import TaskSchema, TaskResponseSchema, TaskRelationSchema

from backend.app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

task_bp = Blueprint('task', __name__, url_prefix='/tasks')

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

    data = TaskSchema().load(request.get_json())
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
@jwt_required()

def create_comment(taskId):
    current_user = int(get_jwt_identity())
    data = CommentSchema().load(request.get_json())
    comment = CommentService.create_comment(data, current_user, taskId)

    return jsonify({
        "message": "Comment created successfully",
        "comment": CommentResponseSchema().dump(comment)
    }), 201

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

@task_bp.route('/deleted', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_deleted_tasks.yml"))
@jwt_required()
@roles_required("admin")

def get_deleted_tasks():
    tasks = TaskService.get_deleted_tasks()

    return jsonify({
        "tasks": TaskResponseSchema(many=True).dump(tasks)
    }), 200

@task_bp.route('/deleted/<int:taskId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_deleted_task.yml"))
@jwt_required()
@roles_required("admin")

def get_deleted_task(taskId):
    task = TaskService.get_deleted_task_by_id(taskId)

    return jsonify({
        "task": TaskResponseSchema().dump(task)
    }), 200

@task_bp.route('/restore/<int:taskId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/restore_task.yml"))
@jwt_required()
@roles_required("admin")

def restore_task(taskId):
    current_user = int(get_jwt_identity())
    task = TaskService.restore_task(taskId, current_user)

    return jsonify({
        "message": "Task updated successfully",
        "task": TaskResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/follow', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/task_following.yml"))
@jwt_required()

def follow_task(taskId):
    current_user_id = int(get_jwt_identity())
    task = TaskService.follow_task(taskId, current_user_id)

    return jsonify({
        "message": "Task following updated",
        "task": TaskResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/follow', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/task_following.yml"))
@jwt_required()

def unfollow_task(taskId):
    current_user_id = int(get_jwt_identity())
    task = TaskService.unfollow_task(taskId, current_user_id)

    return jsonify({
        "message": "Task following updated",
        "task": TaskResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/related', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_relation.yml"))
@jwt_required()

def get_relation(taskId):
    tasks = TaskService.get_related(taskId)

    return jsonify({
        "tasks": TaskResponseSchema(many=True).dump(tasks)
    }), 200

@task_bp.route('/<int:taskId>/related', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/create_relation.yml"))
@jwt_required()

def add_relation(taskId):
    data = TaskRelationSchema().load(request.get_json())
    tasks = TaskService.create_relation(taskId, data["related_task_id"])

    return jsonify({
        "message": "Relation created successfully",
        "tasks": TaskResponseSchema(many=True).dump(tasks)
    }), 200

@task_bp.route('/<int:taskId>/related', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/delete_relation.yml"))
@jwt_required()

def remove_relation(taskId):
    data = TaskRelationSchema().load(request.get_json())
    tasks = TaskService.delete_relation(taskId, data["related_task_id"])

    return "", 204