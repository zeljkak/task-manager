from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql.functions import current_user

from backend.app.decorators.roles_required import roles_required

from backend.app.schemas.comment_schema import CommentSchema, CommentResponseSchema
from backend.app.services.comment_service import CommentService
from backend.app.services.task_service import TaskService
from backend.app.schemas.task_schema import TaskSchema, TaskResponseSchema, TaskRelationSchema, TaskFollowersResponseSchema, TaskRelationResponseSchema
from backend.app.services.attachment_service import AttachmentService
from backend.app.schemas.attachment_schema import AttachmentResponseSchema

from backend.app.utils.file_storage import save_file
from backend.app.utils.diff import parse_bool, parse_date, parse_user_id
from backend.app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

task_bp = Blueprint('task', __name__, url_prefix='/tasks')

@task_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/tasks.yml"))
@jwt_required()

def get_tasks():
    current_user_id = int(get_jwt_identity())

    text = request.args.get("text", type=str)
    assigned_to_id = parse_user_id(request.args.get("assignedToId", type=str), current_user_id)
    status_id = request.args.get("statusId", type=int)
    status_id = request.args.get("statusId", type=int)
    priority_id = request.args.get("priorityId", type=int)
    project_id = request.args.get("projectId", type=int)
    has_project = request.args.get("hasProject", type=bool)
    due_before = parse_date(request.args.get("dueBefore"))
    due_after = parse_date(request.args.get("dueAfter"))
    created_before = parse_date(request.args.get("createdBefore"))
    created_after = parse_date(request.args.get("createdAfter"))
    overdue = parse_bool(request.args.get("overdue"))
    has_due_date = request.args.get("hasDueDate", type=bool)
    followed_by_id = parse_user_id(request.args.get("followedById", type=str), current_user_id)

    tasks = TaskService.get_tasks(text, assigned_to_id, status_id, priority_id, project_id, has_project, due_before, due_after, created_before, created_after, overdue, has_due_date, followed_by_id)

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

@task_bp.route('/<int:taskId>/attachments', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/create_task_attachment.yml"))
@jwt_required()

def create_task_attachment(taskId):
    current_user = int(get_jwt_identity())
    files = request.files.getlist("file")
    if not files:
        return jsonify({"error": "No file provided"}), 400

    attachments = []
    for file in files:
        if file.filename == "":
            continue
        unique_name, original_name, file_type = save_file(file)

        file_data = {
            "file_url": unique_name,
            "file_name": original_name,
            "file_type": file_type
        }

        attachment = AttachmentService.create_task_attachment(taskId, current_user, file_data)
        attachments.append(attachment)

    return jsonify({
        "message": "Attachment created successfully",
        "attachment": AttachmentResponseSchema(many=True).dump(attachments)
    }), 201

@task_bp.route('/<int:taskId>/comments', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_task_comments.yml"))
@jwt_required()

def get_comments(taskId):
    comments = CommentService.get_all_comments_for_task(taskId)

    return jsonify({
        "comments": CommentResponseSchema(many=True).dump(comments)
    }), 200

@task_bp.route('/<int:taskId>/comments', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/create_task_comment.yml"))
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
    current_user_id = int(get_jwt_identity())

    text = request.args.get("text", type=str)
    assigned_to_id = parse_user_id(request.args.get("assignedToId", type=str), current_user_id)
    status_id = request.args.get("statusId", type=int)
    priority_id = request.args.get("priorityId", type=int)
    project_id = request.args.get("projectId", type=int)
    has_project = request.args.get("hasProject", type=bool)
    due_before = parse_date(request.args.get("dueBefore"))
    due_after = parse_date(request.args.get("dueAfter"))
    created_before = parse_date(request.args.get("createdBefore"))
    created_after = parse_date(request.args.get("createdAfter"))
    overdue = parse_bool(request.args.get("overdue"))
    has_due_date = request.args.get("hasDueDate", type=bool)
    followed_by_id = parse_user_id(request.args.get("followedById", type=str), current_user_id)

    tasks = TaskService.get_deleted_tasks(text, assigned_to_id, status_id, priority_id, project_id, has_project, due_before,
                                  due_after, created_before, created_after, overdue, has_due_date, followed_by_id)

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
        "task": TaskFollowersResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/follow', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/task_following.yml"))
@jwt_required()

def unfollow_task(taskId):
    current_user_id = int(get_jwt_identity())
    task = TaskService.unfollow_task(taskId, current_user_id)

    return jsonify({
        "message": "Task following updated",
        "task": TaskFollowersResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/related', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/get_relation.yml"))
@jwt_required()

def get_relation(taskId):
    task = TaskService.get_task_by_id(taskId)

    return jsonify({
        "task": TaskRelationResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/related', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/create_relation.yml"))
@jwt_required()

def add_relation(taskId):
    data = TaskRelationSchema().load(request.get_json())
    task = TaskService.create_relation(taskId, data["related_task_id"])

    return jsonify({
        "message": "Relation created successfully",
        "task": TaskRelationResponseSchema().dump(task)
    }), 200

@task_bp.route('/<int:taskId>/related', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task/delete_relation.yml"))
@jwt_required()

def remove_relation(taskId):
    data = TaskRelationSchema().load(request.get_json())
    tasks = TaskService.delete_relation(taskId, data["related_task_id"])

    return "", 204