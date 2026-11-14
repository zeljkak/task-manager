from backend.app.models.notification_model import Notification
from backend.app.repositories.notification_repository import NotificationRepository
from backend.app.schemas.notification_schema import NotificationResponseSchema
from backend.app.extensions.socketio import socketio
from backend.app.extensions.connection_manager import connection_manager
from backend.app.exceptions.http_exceptions import NotFoundError, ForbiddenError


class NotificationService:
    response_schema = NotificationResponseSchema()

    @staticmethod
    def _task_stakeholder_ids(task):
        recipient_ids = set()
        if task.assigned_to_id:
            recipient_ids.add(int(task.assigned_to_id))
        if task.created_by_id:
            recipient_ids.add(int(task.created_by_id))
        for follower in getattr(task, "followers", []) or []:
            recipient_ids.add(int(follower.id))
        return recipient_ids

    @staticmethod
    def _emit_to_user(user_id, payload):
        for sid in connection_manager.get_sids(user_id):
            socketio.emit("notification", payload, to=sid)

    @staticmethod
    def notify_users(recipient_ids, actor_id, title, message, task_id=None):
        """Persist notifications and broadcast live payloads, excluding the actor."""
        actor_id = int(actor_id)
        unique_recipients = {
            int(recipient_id)
            for recipient_id in recipient_ids
            if recipient_id is not None and int(recipient_id) != actor_id
        }

        if not unique_recipients:
            return []

        notifications = [
            Notification(
                user_id=recipient_id,
                actor_id=actor_id,
                title=title,
                message=message,
                task_id=task_id,
            )
            for recipient_id in unique_recipients
        ]

        created = NotificationRepository.create_many(notifications)

        for notification in created:
            payload = NotificationService.response_schema.dump(notification)
            NotificationService._emit_to_user(notification.user_id, payload)

        return created

    @staticmethod
    def notify_task_stakeholders(task, actor_id, title, message, extra_recipient_ids=None):
        recipient_ids = NotificationService._task_stakeholder_ids(task)
        if extra_recipient_ids:
            recipient_ids.update(int(rid) for rid in extra_recipient_ids if rid is not None)
        return NotificationService.notify_users(
            recipient_ids=recipient_ids,
            actor_id=actor_id,
            title=title,
            message=message,
            task_id=task.id if task else None,
        )

    @staticmethod
    def get_notifications(user_id, unread_only=False, page=1, per_page=50):
        return NotificationRepository.get_for_user(
            user_id=user_id,
            unread_only=unread_only,
            page=page,
            per_page=per_page,
        )

    @staticmethod
    def get_unread_count(user_id):
        return NotificationRepository.count_unread(user_id)

    @staticmethod
    def mark_as_read(notification_id, user_id):
        notification = NotificationRepository.get_by_id(notification_id)
        if not notification:
            raise NotFoundError("Notification not found")
        if notification.user_id != int(user_id):
            raise ForbiddenError("Cannot update notification")

        updated = NotificationRepository.mark_as_read(notification, int(user_id))
        return updated

    @staticmethod
    def mark_all_as_read(user_id):
        NotificationRepository.mark_all_as_read(int(user_id))
