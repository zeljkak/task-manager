from backend.app.extensions.db import db
from backend.app.models.activity_log_model import ActivityLog
from backend.app.exceptions.http_exceptions import ServiceUnavailableError

class ActivityLogRepository:
    @staticmethod
    def create(log):
        try:
            db.session.add(log)
            db.session.commit()
            return log
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_logs(task_id=None, user_id=None, page=1, per_page=50):
        try:
            activities = ActivityLog.query

            if task_id is not None:
                activities = activities.filter(ActivityLog.task_id == task_id)

            if user_id is not None:
                activities = activities.filter(ActivityLog.user_id == user_id)

            pagination = activities.order_by(ActivityLog.created_at.desc()).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            return pagination.items, pagination.has_next
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e
