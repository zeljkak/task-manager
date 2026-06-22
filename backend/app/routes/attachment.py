from flask import Blueprint
from flasgger import swag_from
import os

from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.app.services.attachment_service import AttachmentService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

attachment_bp = Blueprint('attachment', __name__, url_prefix='/attachments')

@attachment_bp.route('/<int:attachmentId>', methods=['DELETE'])
@swag_from(os.path.join(BASE_DIR, "../../docs/attachment/delete_attachment.yml"))
@jwt_required()

def delete_attachment(attachmentId):
    current_user = int(get_jwt_identity())
    AttachmentService.delete_attachment(attachmentId, current_user)

    return "", 204
