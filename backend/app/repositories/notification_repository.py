from backend.app.extensions.db import db
from backend.app.models.notification_model import Notification
from backend.app.exceptions.http_exceptions import ServiceUnavailableError


class NotificationRepository:
    @staticmethod
    def create(notification):
        try:
            db.session.add(notification)
            db.session.commit()
            return notification
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create_many(notifications):
        try:
            db.session.add_all(notifications)
            db.session.commit()
            return notifications
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_id(notification_id):
        try:
            return Notification.query.get(notification_id)
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_for_user(user_id, unread_only=False, page=1, per_page=50):
        try:
            query = Notification.query.filter_by(user_id=user_id)
            if unread_only:
                query = query.filter_by(is_read=False)

            pagination = query.order_by(Notification.created_at.desc()).paginate(
                page=page,
                per_page=per_page,
                error_out=False,
            )
            return pagination.items, pagination.has_next
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def count_unread(user_id):
        try:
            return Notification.query.filter_by(user_id=user_id, is_read=False).count()
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def mark_as_read(notification, user_id):
        try:
            if notification.user_id != user_id:
                return None
            notification.is_read = True
            db.session.commit()
            return notification
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def mark_all_as_read(user_id):
        try:
            Notification.query.filter_by(user_id=user_id, is_read=False).update(
                {"is_read": True},
                synchronize_session=False,
            )
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
