from flask import Blueprint, request, jsonify, current_app
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.app.schemas.attachment_schema import AttachmentResponseSchema
from backend.app.services.attachment_service import AttachmentService
from backend.app.schemas.comment_schema import CommentSchema, CommentResponseSchema
from backend.app.services.comment_service import CommentService

from backend.app.utils.file_storage import save_file

from backend.app.extensions.limiter import limiter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

comment_bp = Blueprint('comment', __name__, url_prefix='/comments')

@comment_bp.route('/<int:commentId>', methods=['PATCH'])
@swag_from(os.path.join(BASE_DIR, "../../docs/comment/update_comment.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def change_comment(commentId):
    current_user = int(get_jwt_identity())
    data = CommentSchema().load(request.get_json())
    comment = CommentService.update_comment(data, commentId, current_user)

    return jsonify({
        "message": "Comment updated successfully",
        "comment": CommentResponseSchema().dump(comment)
    }), 200

@comment_bp.route('/<int:commentId>/attachments', methods=['POST'])
@swag_from(os.path.join(BASE_DIR, "../../docs/comment/create_comment_attachment.yml"))
@jwt_required()

def create_comment_attachment(commentId):
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

    attachment = AttachmentService.create_comment_attachment(commentId, current_user, file_data)

    return jsonify({
        "message": "Attachment created successfully",
        "attachment": AttachmentResponseSchema().dump(attachment)
    }), 201

@comment_bp.route('/<int:commentId>', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/comment/delete_comment.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def delete_comment(commentId):
    current_user = int(get_jwt_identity())
    CommentService.delete_comment(commentId, current_user)

    return "", 204
