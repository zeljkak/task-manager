from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
import os
from backend.app.services.notification_service import NotificationService
from backend.app.schemas.notification_schema import NotificationResponseSchema

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

notification_bp = Blueprint("notification", __name__, url_prefix="/notifications")


@notification_bp.route("", methods=["GET"])
@swag_from(os.path.join(BASE_DIR, "../../docs/notification/notifications.yml"))
@jwt_required()
def get_notifications():
    current_user_id = int(get_jwt_identity())
    unread_only = request.args.get("unreadOnly", "false").lower() == "true"
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("perPage", 50, type=int), 100)

    notifications, has_next = NotificationService.get_notifications(
        user_id=current_user_id,
        unread_only=unread_only,
        page=page,
        per_page=per_page,
    )
    unread_count = NotificationService.get_unread_count(current_user_id)

    return jsonify({
        "notifications": NotificationResponseSchema(many=True).dump(notifications),
        "hasNext": has_next,
        "unreadCount": unread_count,
    }), 200


@notification_bp.route("/unread-count", methods=["GET"])
@swag_from(os.path.join(BASE_DIR, "../../docs/notification/unread_count.yml"))
@jwt_required()
def get_unread_count():
    current_user_id = int(get_jwt_identity())
    return jsonify({
        "unreadCount": NotificationService.get_unread_count(current_user_id)
    }), 200


@notification_bp.route("/<int:notificationId>/read", methods=["PATCH"])
@swag_from(os.path.join(BASE_DIR, "../../docs/notification/mark_read.yml"))
@jwt_required()
def mark_notification_read(notificationId):
    current_user_id = int(get_jwt_identity())
    notification = NotificationService.mark_as_read(notificationId, current_user_id)

    return jsonify({
        "message": "Notification marked as read",
        "notification": NotificationResponseSchema().dump(notification),
        "unreadCount": NotificationService.get_unread_count(current_user_id),
    }), 200


@notification_bp.route("/read-all", methods=["PATCH"])
@swag_from(os.path.join(BASE_DIR, "../../docs/notification/mark_all_read.yml"))
@jwt_required()
def mark_all_notifications_read():
    current_user_id = int(get_jwt_identity())
    NotificationService.mark_all_as_read(current_user_id)

    return jsonify({
        "message": "All notifications marked as read",
        "unreadCount": 0,
    }), 200
