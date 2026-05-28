from flask import Blueprint, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required

from app.services.priority_service import PriorityService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

priority_bp = Blueprint('priority', __name__, url_prefix='/priorities')

@priority_bp.route('', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/priority/priorities.yml"))
@jwt_required()

def get_priorities():
    priorities = PriorityService.get_all_priorities()

    return jsonify({
        "priorities": priorities
    }), 200

@priority_bp.route('/<int:priorityId>', methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/priority/get_priority.yml"))
@jwt_required()

def get_priority(priorityId):
    priority = PriorityService.get_priority_by_id(priorityId)

    return jsonify({
        "priority": priority
    }), 200