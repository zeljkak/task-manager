from app.extensions.db import db
from app.utils.diff import get_changed_fields
from app.models.task_model import Task
from app.models.activity_log_model import ActivityLog

from app.exceptions.http_exceptions import (
    NotFoundError,
    ServiceUnavailableError
)

class TaskService:

    TRACKED_FIELDS = [
        "title",
        "description",
        "status_id",
        "priority_id",
        "assigned_to_id",
        "due_date",
        "estimated_hours"
    ]


    @staticmethod
    def create_task(data, current_user_id):

        #assigned to will always be the user who created the task if left empty
        assigned_to_id = data.get("assigned_to_id") or current_user_id

        task = Task(
            title=data["title"],
            description=data.get("description"),
            status_id=data.get("status_id"),
            priority_id=data.get("priority_id"),
            assigned_to_id=assigned_to_id,
            created_by_id=current_user_id,
            updated_by_id=current_user_id,
            due_date=data.get("due_date"),
            estimated_hours=data.get("estimated_hours")
        )

        try:
            db.session.add(task)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable")

        return task


    @staticmethod
    def copy_task(task):
        class Temp:
            pass

        temp = Temp()
        for attr in TaskService.TRACKED_FIELDS:
            setattr(temp, attr, getattr(task, attr))

        return temp


    @staticmethod
    def update_task(task, data, current_user_id):

        # copy old state
        old_task = TaskService.copy_task(task)

        # apply updates
        for key, value in data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        task.updated_by_id = current_user_id

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable")

        # detect changes
        changes = get_changed_fields(old_task, task, TaskService.TRACKED_FIELDS)

        # log changes
        try:
            for change in changes:
                log = ActivityLog(
                    user_id=current_user_id,
                    task_id=task.id,
                    action="TASK_UPDATED",
                    field=change["field"],
                    old_value=change["old"],
                    new_value=change["new"]
                )
                db.session.add(log)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable")

        return task


    @staticmethod
    def get_task_by_id(task_id):

        try:
            task = Task.query.get(task_id)
        except Exception:
            raise ServiceUnavailableError("Database unavailable")

        if not task:
            raise NotFoundError("Task not found")

        return task


    @staticmethod
    def get_all_tasks():
        try:
            return Task.query.all()
        except Exception:
            raise ServiceUnavailableError("Database unavailable")


    @staticmethod
    def delete_task(task):
        try:
            db.session.delete(task)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable")