from backend.app.models.task_status_model import TaskStatus
from backend.app.repositories.task_status_repository import TaskStatusRepository


def seed_task_status():
    task_status = [
        {"id": 1, "status": "backlog"},
        {"id": 2, "status": "to_do"},
        {"id": 3, "status": "in_progress"},
        {"id": 4, "status": "done"},
        {"id": 5, "status": "cancelled"}
    ]

    for task_status_data in task_status:
        existing_task_status = TaskStatusRepository.get_by_id(task_status_data["id"])

        if not existing_task_status:
            task_status = TaskStatus(
                id=task_status_data["id"],
                status=task_status_data["status"]
            )

            TaskStatusRepository.create(task_status)