from flask import Blueprint, request, jsonify
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
@jwt_required()

def change_comment(commentId):
    current_user = int(get_jwt_identity())
    data = CommentSchema().load(request.get_json())

    comment_text = data.get("comment")
    if comment_text and not comment_text.strip():
        data["comment"] = None

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

        attachment = AttachmentService.create_comment_attachment(commentId, current_user, file_data)
        attachments.append(attachment)

    return jsonify({
        "message": "Attachments created successfully",
        "attachments": AttachmentResponseSchema(many=True).dump(attachments)
    }), 201

@comment_bp.route('/<int:commentId>', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/comment/delete_comment.yml"))
@limiter.limit("10 per minute")
@jwt_required()

def delete_comment(commentId):
    current_user = int(get_jwt_identity())
    CommentService.delete_comment(commentId, current_user)

    return "", 204
