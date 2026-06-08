from app.extensions.db import db
from app.models.task_model import Task
from app.exceptions.http_exceptions import ServiceUnavailableError

class TaskRepository:
    @staticmethod
    def get_by_id(task_id):
        try:
            task = Task.query.filter_by(id=task_id, is_deleted=False).first()
            if not task:
                return None
            return task
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            tasks = Task.query.filter_by(is_deleted=False).all()
            if not tasks:
                return None
            return tasks
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_deleted_by_id(task_id):
        try:
            task = Task.query.filter_by(id=task_id, is_deleted=True).first()
            if not task:
                return None
            return task
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_deleted_all():
        try:
            tasks = Task.query.filter_by(is_deleted=True).all()
            if not tasks:
                return None
            return tasks
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(task):
        try:
            db.session.add(task)
            db.session.commit()
            return task
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def update(task):
        try:
            db.session.commit()
            return task
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

#will use soft delete instead
"""
    @staticmethod
    def delete(task):
        try:
            db.session.delete(task)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
"""