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

from backend.app.exceptions.http_exceptions import NotFoundError, ForbiddenError, BadRequestError


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
    def get_tasks(text=None, assigned_to_id=None, status_id=None, priority_id=None, project_id=None, has_project=None, due_before=None, due_after=None, created_before=None, created_after=None, overdue=None, followed_by_id=None):
        if has_project is True:
            has_project = False
        return TaskRepository.get_tasks(text, assigned_to_id, status_id, priority_id, project_id, has_project, due_before, due_after, created_before, created_after, overdue, followed_by_id)


    @staticmethod
    def get_deleted_task_by_id(task_id):
        task = TaskRepository.get_deleted_by_id(task_id)

        if not task:
            raise NotFoundError("Task not found")

        return task


    @staticmethod
    def get_deleted_tasks(text=None, assigned_to_id=None, status_id=None, priority_id=None, project_id=None, has_project=None, due_before=None, due_after=None, created_before=None, created_after=None, overdue=None, followed_by_id=None):
        return TaskRepository.get_deleted_tasks(text, assigned_to_id, status_id, priority_id, project_id, has_project, due_before, due_after, created_before, created_after, overdue, followed_by_id)


    @staticmethod
    def get_task_by_id_including_deleted(task_id):
        task = TaskRepository.get_by_id_including_deleted(task_id)

        if not task:
            raise NotFoundError("Task not found")

        return task


    @staticmethod
    def create_task(data, current_user_id):

        #assigned to will always be the user who created the task if left empty
        assigned_to_id = data.get("assigned_to_id") or current_user_id

        assigned_user = UserRepository.get_by_id(assigned_to_id)
        if not assigned_user:
            raise NotFoundError("Assigned user not found")

        if data.get("project_id"):
            project = ProjectRepository.get_by_id(data["project_id"])
            if not project:
                raise NotFoundError("Project not found")
            if project.archived == True:
                project = None
            else:
                project = project.id

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
            project_id=project,
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
        is_allowed = task.created_by_id == current_user_id or task.assigned_to_id == current_user_id or user_role.role_name == "admin"
        if not is_allowed:
            raise ForbiddenError("Cannot update task")

        # copy old state
        old_task = TaskService.copy_task(task)

        if data.get("project_id"):
            project = ProjectRepository.get_by_id(data["project_id"])
            if not project:
                raise NotFoundError("Project not found")
            if project.archived == True:
                raise BadRequestError("Cannot link a task to an archived project")

        assigned_to = UserRepository.get_by_id(data.get("assigned_to_id"))
        if not assigned_to:
            raise NotFoundError("Assigned user not found")

        if data.get("priority_id"):
            if not PriorityRepository.get_by_id(data["priority_id"]):
                raise NotFoundError("Priority not found")

        if data.get("status_id"):
            if not TaskStatusRepository.get_by_id(data["status_id"]):
                raise NotFoundError("Status not found")

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
        is_allowed = task.created_by_id == current_user_id or task.assigned_to_id == current_user_id or user_role.role_name == "admin"
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


    @staticmethod
    def follow_task(task_id, current_user_id):
        user = UserService.get_user_by_id(current_user_id)
        task = TaskService.get_task_by_id(task_id)
        if user in task.followers:
            raise BadRequestError("User already followed this task")
        else:
            task.followers.append(user)


        return TaskRepository.update(task)


    @staticmethod
    def unfollow_task(task_id, current_user_id):
        user = UserService.get_user_by_id(current_user_id)
        task = TaskService.get_task_by_id(task_id)
        if user not in task.followers:
            raise BadRequestError("User already unfollowed this task")
        else:
            task.followers.remove(user)

        return TaskRepository.update(task)


    @staticmethod
    def normalize_relation(task1_id, task2_id):
        if task1_id == task2_id:
            raise BadRequestError("A task cannot relate to itself")

        a, b = sorted((task1_id, task2_id))
        return (a, b)


    @staticmethod
    def create_relation(task1_id, task2_id):
        task1 = TaskService.get_task_by_id(task1_id)
        task2 = TaskService.get_task_by_id(task2_id)
        t1, t2 = TaskService.normalize_relation(task1_id, task2_id)

        if TaskRepository.relation_exists(t1, t2):
            raise BadRequestError("Task relation already exists")

        TaskRepository.add_relation(t1, t2)
        return task1


    @staticmethod
    def delete_relation(task1_id, task2_id):
        task1 = TaskService.get_task_by_id(task1_id)
        task2 = TaskService.get_task_by_id(task2_id)
        t1, t2 = TaskService.normalize_relation(task1_id, task2_id)

        if not TaskRepository.relation_exists(t1, t2):
            raise NotFoundError("Task relation does not exist")

        TaskRepository.remove_relation(t1, t2)