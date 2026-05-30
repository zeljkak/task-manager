from app.extensions.db import db
from app.utils.diff import get_changed_fields

from app.models.task_model import Task
from app.models.activity_log_model import ActivityLog

from app.repositories.task_repository import TaskRepository
from app.repositories.user_repository import UserRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.priority_repository import PriorityRepository
from app.repositories.task_status_repository import TaskStatusRepository

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
    def get_task_by_id(task_id):
        task = TaskRepository.get_by_id(task_id)

        if not task:
            raise NotFoundError("Task not found")

        return task

    @staticmethod
    def get_all_tasks():
        tasks = TaskRepository.get_all()

        if not tasks:
            raise NotFoundError("Tasks not found")

        return tasks

    @staticmethod
    def create_task(data, current_user_id):

        #assigned to will always be the user who created the task if left empty
        assigned_to_id = data.get("assigned_to_id") or current_user_id

        assigned_user = UserRepository.get_by_id(assigned_to_id)
        if not assigned_user:
            raise NotFoundError("Assigned user not found")

        if data.get("project_id"):
            if not ProjectRepository.get_by_id(data["project_id"]):
                raise NotFoundError("Project not found")

        if data.get("priority_id"):
            if not PriorityRepository.get_by_id(data["priority_id"]):
                raise NotFoundError("Priority not found")

        if data.get("status_id"):
            if not TaskStatusRepository.get_by_id(data["status_id"]):
                raise NotFoundError("Status not found")

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

        return TaskRepository.create(task)

"""
    @staticmethod
    def copy_task(task):
        class Temp:
            pass

        temp = Temp()
        for attr in TaskService.TRACKED_FIELDS:
            setattr(temp, attr, getattr(task, attr))

        return temp
"""

"""
    @staticmethod
    def update_task(task, data, current_user_id):

        # copy old state
        old_task = TaskService.copy_task(task)

        # apply updates
        for key, value in data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        task.updated_by_id = current_user_id

        # detect changes
        changes = get_changed_fields(old_task, task, TaskService.TRACKED_FIELDS)

        # log changes
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
# move add log and code below to activity log repository later
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

        return task
"""

"""
    @staticmethod
    def delete_task(task):
        TaskRepository.delete(task)
"""