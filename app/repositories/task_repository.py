from app.extensions.db import db
from app.models.task_model import Task
from app.exceptions.http_exceptions import ServiceUnavailableError

class TaskRepository:
    @staticmethod
    def get_by_id(task_id):
        try:
            task = Task.query.get(task_id)
            if not task:
                return None
            return task
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            tasks = Task.query.all()
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
    def update(task_id, data):
        try:
            task = TaskRepository.get_by_id(task_id)
            if not task:
                return None

            for key, value in data.items():
                if hasattr(task, key):
                    setattr(task, key, value)

            db.session.commit()
            return task

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def delete(task_id):
        try:
            task = TaskRepository.get_by_id(task_id)
            if not task:
                return None
            db.session.delete(task)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e