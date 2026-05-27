from app.extensions.db import db
from app.models.task_status_model import TaskStatus
from app.exceptions.http_exceptions import ServiceUnavailableError


class TaskStatusRepository:
    @staticmethod
    def get_by_id(task_status_id):
        try:
            return TaskStatus.query.get(task_status_id)
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

    @staticmethod
    def update(task_status_id, status):
        try:
            task_status = TaskStatusRepository.get_by_id(task_status_id)
            if not task_status:
                return None

            task_status.status = status
            db.session.commit()
            return comment

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def delete(task_status_id):
        try:
            task_status = TaskStatusRepository.get_by_id(task_status_id)
            if not task_status:
                return None
            db.session.delete(task_status)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e