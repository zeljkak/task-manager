from backend.app.services.activity_log_service import ActivityLogService
from backend.app.services.role_service import RoleService
from backend.app.services.user_service import UserService

from backend.app.utils.diff import get_changed_fields

from backend.app.models.task_model import Task

from backend.app.repositories.task_repository import TaskRepository
from backend.app.repositories.user_repository import UserRepository
from backend.app.repositories.project_repository import ProjectRepository
from backend.app.repositories.priority_repository import PriorityRepository
from backend.app.repositories.task_status_repository import TaskStatusRepository

from backend.app.exceptions.http_exceptions import NotFoundError, ForbiddenError

class TaskService:

    TRACKED_FIELDS = [
        "title",
        "description",
        "status_id",
        "priority_id",
        "project_id",
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
    def get_deleted_task_by_id(task_id):
        task = TaskRepository.get_deleted_by_id(task_id)

        if not task:
            raise NotFoundError("Task not found")

        return task

    @staticmethod
    def get_deleted_tasks():
        tasks = TaskRepository.get_deleted_all()

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


    @staticmethod
    def copy_task(task):
        class Temp:
            pass

        temp = Temp()
        for attr in TaskService.TRACKED_FIELDS:
            setattr(temp, attr, getattr(task, attr))

        return temp


    @staticmethod
    def update_task(task_id, data, current_user_id):
        task = TaskService.get_task_by_id(task_id)

        current_user = UserService.get_user_by_id(current_user_id)
        user_role = RoleService.get_role_by_id(current_user.role_id)
        is_allowed = task.created_by_id == current_user_id or task.updated_by_id == current_user_id or task.assigned_to_id == current_user_id or user_role.role_name == "admin"
        if not is_allowed:
            raise ForbiddenError("Cannot update task")

        # copy old state
        old_task = TaskService.copy_task(task)

        # apply updates
        for key, value in data.items():
            if key in TaskService.TRACKED_FIELDS:
                setattr(task, key, value)
        task.updated_by_id = current_user_id

        # detect changes
        changes = get_changed_fields(old_task, task, TaskService.TRACKED_FIELDS)

        #log changes
        for change in changes:
            ActivityLogService.create_activity(change, task.id, current_user_id)

        return TaskRepository.update(task)


    @staticmethod
    def delete_task(task_id, current_user_id):
        task = TaskService.get_task_by_id(task_id)

        current_user = UserService.get_user_by_id(current_user_id)
        user_role = RoleService.get_role_by_id(current_user.role_id)
        is_allowed = task.created_by_id == current_user_id or task.updated_by_id == current_user_id or task.assigned_to_id == current_user_id or user_role.role_name == "admin"
        if not is_allowed:
            raise ForbiddenError("Cannot delete task")

        task.is_deleted = True

        ActivityLogService.deletion_activity(current_user_id, "TASK_DELETED", task_id)

        return TaskRepository.update(task)


    @staticmethod
    def restore_task(task_id, current_user_id):
        task = TaskService.get_deleted_task_by_id(task_id)

        ActivityLogService.deletion_activity(current_user_id, "TASK_RESTORED", task_id)

        task.updated_by_id = current_user_id
        task.is_deleted = False

        return TaskRepository.update(task)