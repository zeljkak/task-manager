from flask import Blueprint, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required
from app.decorators.roles_required import roles_required
from app.schemas.role_schema import RoleResponseSchema

from app.services.role_service import RoleService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

role_bp = Blueprint('role', __name__, url_prefix='/roles')

@role_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/role/roles.yml"))
@jwt_required()
@roles_required("admin")

def get_roles():
    roles = RoleService.get_all_roles()

    return jsonify({
        "roles": RoleResponseSchema(many=True).dump(roles)
    }), 200

@role_bp.route('/<int:roleId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/role/get_role.yml"))
@jwt_required()
@roles_required("admin")

def get_role(roleId):
    role = RoleService.get_role_by_id(roleId)

    return jsonify({
        "role": RoleResponseSchema().dump(role)
    }), 200