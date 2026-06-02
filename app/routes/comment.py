from flask import Blueprint, request, jsonify
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.comment_schema import CommentSchema, CommentResponseSchema
from app.services.comment_service import CommentService

from app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

comment_bp = Blueprint('comment', __name__, url_prefix='/comments')

@comment_bp.route('/<int:commentId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/comment/change_comment.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def change_comment(commentId):
    current_user = int(get_jwt_identity())
    data = CommentSchema().load(request.get_json())
    comment = CommentService.update_comment(data, commentId, current_user)

    return jsonify({
        "comment": CommentResponseSchema().dump(comment)
    }), 200

@comment_bp.route('/<int:commentId>', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/comment/delete_comment.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def delete_comment(commentId):
    current_user = int(get_jwt_identity())
    CommentService.delete_comment(commentId, current_user)

    return "", 204
