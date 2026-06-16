from backend.app.extensions.db import db
from backend.app.models.task_status_model import TaskStatus
from backend.app.exceptions.http_exceptions import ServiceUnavailableError


class TaskStatusRepository:
    @staticmethod
    def get_by_id(task_status_id):
        try:
            task_status = TaskStatus.query.get(task_status_id)
            if not task_status:
                return None
            return task_status
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_name(status):
        try:
            task_status = TaskStatus.query.filter_by(status=status).first()
            if not task_status:
                return None
            return task_status
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return TaskStatus.query.all()

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(task_status):
        try:
            db.session.add(task_status)
            db.session.commit()
            return task_status
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
