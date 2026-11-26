from backend.app.extensions.db import db
from datetime import date, timedelta
from sqlalchemy import func

from backend.app.models import Task, User, task_relations
from backend.app import constants
from backend.app.exceptions.http_exceptions import ServiceUnavailableError, NotFoundError

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
    def get_tasks(text=None, assigned_to_id=None, status_id=None, priority_id=None, project_id=None, has_project=None, due_before=None, due_after=None, created_before=None, created_after=None, overdue=None, has_due_date=None, followed_by_id=None, page=1, per_page=75):
        try:
            page = max(1, int(page or 1))
            per_page = max(1, int(per_page or 75))

            num_statuses = 5
            per_status = max(1, per_page // num_statuses) if status_id is None else per_page

            base_query = Task.query.filter_by(is_deleted=False)

            if text and text.strip():
                base_query = base_query.filter(
                    Task.title.ilike(f"%{text}%") |
                    Task.description.ilike(f"%{text}%")
                )

            if assigned_to_id is not None:
                base_query = base_query.filter(Task.assigned_to_id == assigned_to_id)

            if status_id is not None:
                base_query = base_query.filter(Task.status_id == status_id)

            if priority_id is not None:
                base_query = base_query.filter(Task.priority_id == priority_id)

            if project_id is not None:
                base_query = base_query.filter(Task.project_id == project_id)
            elif has_project is True:
                base_query = base_query.filter(Task.project_id.isnot(None))
            elif has_project is False:
                base_query = base_query.filter(Task.project_id.is_(None))

            if due_before is not None:
                base_query = base_query.filter(Task.due_date <= due_before)

            if due_after is not None:
                base_query = base_query.filter(Task.due_date >= due_after)

            if created_before is not None:
                base_query = base_query.filter(Task.created_at <= created_before + timedelta(days=1))

            if created_after is not None:
                base_query = base_query.filter(Task.created_at >= created_after)

            if overdue:
                base_query = base_query.filter(
                    Task.due_date.isnot(None),
                    Task.due_date < date.today(),
                    Task.status_id != constants.DONE_STATUS_ID
                )
            elif due_after is None and due_before is None and has_due_date is not None:
                if has_due_date is True:
                    base_query = base_query.filter(Task.due_date.isnot(None))
                elif has_due_date is False:
                    base_query = base_query.filter(Task.due_date.is_(None))

            if followed_by_id is not None:
                base_query = base_query.join(Task.followers).filter(User.id == followed_by_id)

            status_counts = dict(
                base_query.with_entities(Task.status_id, func.count(Task.id))
                .group_by(Task.status_id)
                .all()
            )

            visible_limit = page * per_status
            has_more_by_status = {
                sid: total > visible_limit
                for sid, total in status_counts.items()
            }
            has_more = any(has_more_by_status.values())

            row_num = func.row_number().over(
                partition_by=Task.status_id,
                order_by=(Task.updated_at.desc(), Task.id.desc())
            ).label("row_num")

            ranked_subquery = base_query.add_columns(row_num).subquery()

            start_row = (page - 1) * per_status + 1
            end_row = page * per_status

            TaskPaged = db.aliased(Task, ranked_subquery)

            tasks = (
                db.session.query(TaskPaged)
                .filter(
                    ranked_subquery.c.row_num >= start_row,
                    ranked_subquery.c.row_num <= end_row,
                )
                .order_by(TaskPaged.status_id, TaskPaged.updated_at.desc(), TaskPaged.id.desc())
                .all()
            )

            return {
                "tasks": tasks,
                "has_more": has_more,
                "has_more_by_status": has_more_by_status,
            }

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
    def get_deleted_tasks(text=None, assigned_to_id=None, status_id=None, priority_id=None, project_id=None, has_project=None, due_before=None, due_after=None, created_before=None, created_after=None, overdue=None, has_due_date=None, followed_by_id=None, page=1, per_page=75):
        try:
            page = max(1, int(page or 1))
            per_page = max(1, int(per_page or 75))

            num_statuses = 5
            per_status = max(1, per_page // num_statuses) if status_id is None else per_page

            base_query = Task.query.filter_by(is_deleted=True)

            if text and text.strip():
                base_query = base_query.filter(
                    Task.title.ilike(f"%{text}%") |
                    Task.description.ilike(f"%{text}%")
                )

            if assigned_to_id is not None:
                base_query = base_query.filter(Task.assigned_to_id == assigned_to_id)

            if status_id is not None:
                base_query = base_query.filter(Task.status_id == status_id)

            if priority_id is not None:
                base_query = base_query.filter(Task.priority_id == priority_id)

            if project_id is not None:
                base_query = base_query.filter(Task.project_id == project_id)
            elif has_project is True:
                base_query = base_query.filter(Task.project_id.isnot(None))
            elif has_project is False:
                base_query = base_query.filter(Task.project_id.is_(None))

            if due_before is not None:
                base_query = base_query.filter(Task.due_date <= due_before)

            if due_after is not None:
                base_query = base_query.filter(Task.due_date >= due_after)

            if created_before is not None:
                base_query = base_query.filter(Task.created_at <= created_before + timedelta(days=1))

            if created_after is not None:
                base_query = base_query.filter(Task.created_at >= created_after)

            if overdue:
                base_query = base_query.filter(
                    Task.due_date.isnot(None),
                    Task.due_date < date.today(),
                    Task.status_id != constants.DONE_STATUS_ID
                )
            elif due_after is None and due_before is None and has_due_date is not None:
                if has_due_date is True:
                    base_query = base_query.filter(Task.due_date.isnot(None))
                elif has_due_date is False:
                    base_query = base_query.filter(Task.due_date.is_(None))

            if followed_by_id is not None:
                base_query = base_query.join(Task.followers).filter(User.id == followed_by_id)

            status_counts = dict(
                base_query.with_entities(Task.status_id, func.count(Task.id))
                .group_by(Task.status_id)
                .all()
            )

            visible_limit = page * per_status
            has_more_by_status = {
                sid: total > visible_limit
                for sid, total in status_counts.items()
            }
            has_more = any(has_more_by_status.values())

            row_num = func.row_number().over(
                partition_by=Task.status_id,
                order_by=(Task.updated_at.desc(), Task.id.desc())
            ).label("row_num")

            ranked_subquery = base_query.add_columns(row_num).subquery()

            start_row = (page - 1) * per_status + 1
            end_row = page * per_status

            TaskPaged = db.aliased(Task, ranked_subquery)

            tasks = (
                db.session.query(TaskPaged)
                .filter(
                    ranked_subquery.c.row_num >= start_row,
                    ranked_subquery.c.row_num <= end_row,
                )
                .order_by(TaskPaged.status_id, TaskPaged.updated_at.desc(), TaskPaged.id.desc())
                .all()
            )

            return {
                "tasks": tasks,
                "has_more": has_more,
                "has_more_by_status": has_more_by_status,
            }

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
