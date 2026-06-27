from backend.app.extensions.db import db
from datetime import date, timedelta

from backend.app.models import Task, User, task_relations
from backend.app import constants
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
    def get_tasks(title=None, description=None, assigned_to_id=None, status_id=None, priority_id=None, project_id=None, due_before=None, due_after=None, created_before=None, created_after=None, overdue=None, followed_by=None):
        try:
            tasks = Task.query.filter_by(is_deleted=False)

            if title and title.strip():
                tasks = tasks.filter(Task.title.ilike(f"%{title}%"))

            if description and description.strip():
                tasks = tasks.filter(Task.description.ilike(f"%{description}%"))

            if assigned_to_id is not None:
                tasks = tasks.filter(Task.assigned_to_id == assigned_to_id)

            if status_id is not None:
                tasks = tasks.filter(Task.status_id == status_id)

            if priority_id is not None:
                tasks = tasks.filter(Task.priority_id == priority_id)

            if project_id is not None:
                tasks = tasks.filter(Task.project_id == project_id)

            if due_before is not None:
                tasks = tasks.filter(Task.due_date <= due_before)

            if due_after is not None:
                tasks = tasks.filter(Task.due_date >= due_after)

            if created_before is not None:
                tasks = tasks.filter(Task.created_at <= created_before + timedelta(days=1))

            if created_after is not None:
                tasks = tasks.filter(Task.created_at >= created_after)

            if overdue:
                tasks = tasks.filter(
                    Task.due_date.isnot(None),
                    Task.due_date < date.today(),
                    Task.status_id != constants.DONE_STATUS_ID
                )

            if followed_by is not None:
                tasks = tasks.join(Task.followers).filter(User.id == followed_by)

            return tasks.order_by(Task.created_at.desc()).all()

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
    def get_deleted_tasks(title=None, description=None, assigned_to_id=None, status_id=None, priority_id=None, project_id=None, due_before=None, due_after=None, created_before=None, created_after=None, overdue=None, followed_by=None):
        try:
            tasks = Task.query.filter_by(is_deleted=True)

            if title and title.strip():
                tasks = tasks.filter(Task.title.ilike(f"%{title}%"))

            if description and description.strip():
                tasks = tasks.filter(Task.description.ilike(f"%{description}%"))

            if assigned_to_id is not None:
                tasks = tasks.filter(Task.assigned_to_id == assigned_to_id)

            if status_id is not None:
                tasks = tasks.filter(Task.status_id == status_id)

            if priority_id is not None:
                tasks = tasks.filter(Task.priority_id == priority_id)

            if project_id is not None:
                tasks = tasks.filter(Task.project_id == project_id)

            if due_before is not None:
                tasks = tasks.filter(Task.due_date <= due_before)

            if due_after is not None:
                tasks = tasks.filter(Task.due_date >= due_after)

            if created_before is not None:
                tasks = tasks.filter(Task.created_at <= created_before + timedelta(days=1))

            if created_after is not None:
                tasks = tasks.filter(Task.created_at >= created_after)

            if overdue:
                tasks = tasks.filter(
                    Task.due_date.isnot(None),
                    Task.due_date < date.today(),
                    Task.status_id != constants.DONE_STATUS_ID
                )

            if followed_by is not None:
                tasks = tasks.join(Task.followers).filter(User.id == followed_by)

            return tasks.order_by(Task.created_at.desc()).all()

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
