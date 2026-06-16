from backend.app.exceptions.http_exceptions import NotFoundError
from backend.app.repositories.task_status_repository import TaskStatusRepository


class TaskStatusService:

    @staticmethod
    def get_status_by_id(status_id):
        task_status = TaskStatusRepository.get_by_id(status_id)

        if not task_status:
            raise NotFoundError("Task status not found")

        return task_status

    @staticmethod
    def get_status_by_name(status_name):
        task_status = TaskStatusRepository.get_by_name(status_name)

        if not task_status:
            raise NotFoundError("Task status not found")

        return task_status

    @staticmethod
    def get_all_statuses():
        return TaskStatusRepository.get_all()
