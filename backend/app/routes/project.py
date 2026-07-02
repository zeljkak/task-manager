from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.app.decorators.roles_required import roles_required

from backend.app.utils.file_storage import save_file
from backend.app.utils.diff import parse_bool, parse_date

from backend.app.services.project_service import ProjectService
from backend.app.services.attachment_service import AttachmentService
from backend.app.schemas.attachment_schema import AttachmentResponseSchema
from backend.app.schemas.project_schema import ProjectSchema, ProjectResponseSchema
from backend.app.schemas.summary_schema import ProjectSummarySchema

from backend.app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

project_bp = Blueprint('project', __name__, url_prefix='/projects')

project_schema = ProjectSchema()

@project_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/projects.yml"))
@jwt_required()

def get_projects():
    text = request.args.get("projectText", type=str)
    created_by_id = request.args.get("createdById", type=int)
    created_before = parse_date(request.args.get("createdBefore"))
    created_after = parse_date(request.args.get("createdAfter"))

    projects = ProjectService.get_projects(text, created_by_id, created_before, created_after)

    return jsonify({
        "projects": ProjectResponseSchema(many=True).dump(projects)
    }), 200

@project_bp.route('/list', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/projects_list.yml"))
@jwt_required()

def get_projects_list():
    projects = ProjectService.get_projects()

    return jsonify({
        "projects": ProjectSummarySchema(many=True).dump(projects)
    }), 200

@project_bp.route('/<int:projectId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/get_project.yml"))
@jwt_required()

def get_project(projectId):
    project = ProjectService.get_project_by_id(projectId)

    return jsonify({
        "project": ProjectResponseSchema().dump(project)
    }), 200

@project_bp.route('/create_project', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/create_project.yml"))
@limiter.limit("10 per minute")
@jwt_required()
@roles_required("admin")

def create_project():
    current_user = int(get_jwt_identity())

    data = project_schema.load(request.get_json())
    project = ProjectService.create_project(data, current_user)

    return jsonify({
        "message": "Project created successfully",
        "project": ProjectResponseSchema().dump(project)
    }), 201

@project_bp.route('/<int:projectId>/attachments', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/create_project_attachment.yml"))
@jwt_required()

def create_project_attachment(projectId):
    current_user = int(get_jwt_identity())
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    unique_name, original_name, file_type = save_file(file)

    file_url = unique_name

    file_data = {
        "file_url": file_url,
        "file_name": original_name,
        "file_type": file_type
    }

    attachment = AttachmentService.create_project_attachment(projectId, current_user, file_data)

    return jsonify({
        "message": "Attachment created successfully",
        "attachment": AttachmentResponseSchema().dump(attachment)
    }), 201

@project_bp.route('<int:projectId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/update_project.yml"))
@limiter.limit("10 per minute")
@jwt_required()
@roles_required("admin")

def update_project(projectId):
    current_user = int(get_jwt_identity())

    data = project_schema.load(request.get_json())
    project = ProjectService.update_project(projectId, data, current_user)

    return jsonify({
        "message": "Project updated successfully",
        "project": ProjectResponseSchema().dump(project)
    }), 200

@project_bp.route('/<int:projectId>/archive', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/archive_project.yml"))
@limiter.limit("2 per minute")
@jwt_required()
@roles_required("admin")

def archive_project(projectId):
    project = ProjectService.archive_project(projectId)

    return jsonify({
        "message": "Project archived successfully",
        "project": ProjectResponseSchema().dump(project)
    }), 200

@project_bp.route('/<int:projectId>/unarchive', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/unarchive_project.yml"))
@limiter.limit("2 per minute")
@jwt_required()
@roles_required("admin")

def unarchive_project(projectId):
    project = ProjectService.unarchive_project(projectId)

    return jsonify({
        "message": "Project unarchived successfully",
        "project": ProjectResponseSchema().dump(project)
    }), 200