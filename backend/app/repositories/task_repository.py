from backend.app.extensions.db import db
from backend.app.models.task_model import Task
from backend.app.models.association_tables import task_relations
from backend.app.exceptions.http_exceptions import ServiceUnavailableError

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
            return Task.query.filter_by(is_deleted=False).all()

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
            return Task.query.filter_by(is_deleted=True).all()

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_id_including_deleted(task_id):
        try:
            task = Task.query.filter_by(id=task_id).first()
            if not task:
                return None
            return task
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

    @staticmethod
    def relation_exists(task_id, related_task_id):
        try:
            result = db.session.execute(
                    task_relations.select().where(
                    (task_relations.c.task_id == task_id) &
                    (task_relations.c.related_task_id == related_task_id)
                )).first()

            return result is not None
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def add_relation(task_id, related_task_id):
        try:
            db.session.execute(
                task_relations.insert().values(
                    task_id=task_id,
                    related_task_id=related_task_id)
            )

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def remove_relation(task_id, related_task_id):
        try:
            db.session.execute(
                task_relations.delete().where(
                    (task_relations.c.task_id == task_id) &
                    (task_relations.c.related_task_id == related_task_id))
            )

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
