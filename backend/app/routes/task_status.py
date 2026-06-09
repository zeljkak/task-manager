from flask import Blueprint, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required
from backend.app.schemas.task_status_schema import TaskStatusResponseSchema

from backend.app.services.task_status_service import TaskStatusService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

task_status_bp = Blueprint('task_status', __name__, url_prefix='/task_statuses')

@task_status_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task_status/task_statuses.yml"))
@jwt_required()

def get_statuses():
    task_statuses = TaskStatusService.get_all_statuses()

    return jsonify({
        "taskStatuses": TaskStatusResponseSchema(many=True).dump(task_statuses)
    }), 200

@task_status_bp.route('/<int:taskStatusId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/task_status/get_task_status.yml"))
@jwt_required()

def get_status(taskStatusId):
    task_status = TaskStatusService.get_status_by_id(taskStatusId)

    return jsonify({
        "taskStatus": TaskStatusResponseSchema().dump(task_status)
    }), 200