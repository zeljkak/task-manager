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
    def get_logs(task_id=None, user_id=None):
        try:
            activities = ActivityLog.query

            if task_id is not None:
                activities = activities.filter(ActivityLog.task_id == task_id)

            if user_id is not None:
                activities = activities.filter(ActivityLog.user_id == user_id)

            return activities.order_by(ActivityLog.created_at.desc()).all()
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e
