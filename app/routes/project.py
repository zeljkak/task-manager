from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity
from app.decorators.roles_required import roles_required

from app.services.project_service import ProjectService
from app.schemas.project_schema import ProjectSchema, ProjectSummarySchema, ProjectResponseSchema

from app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

project_bp = Blueprint('project', __name__, url_prefix='/projects')

project_schema = ProjectSchema()

@project_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/projects.yml"))
@jwt_required()

def get_projects():
    projects = ProjectService.get_all_projects()

    return jsonify({
        "projects": ProjectResponseSchema(many=True).dump(projects)
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
    }), 201

@project_bp.route('/<int:projectId>', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/project/delete_project.yml"))
@limiter.limit("2 per minute")
@jwt_required()
@roles_required("admin")

def delete_project(projectId):
    ProjectService.delete_project(projectId)

    return "", 204