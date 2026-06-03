from app.models.task_status_model import TaskStatus
from app.repositories.task_status_repository import TaskStatusRepository


def seed_task_status():
    task_status = [
        {"id": 1, "status": "Backlog"},
        {"id": 2, "status": "To Do"},
        {"id": 3, "status": "In Progress"},
        {"id": 4, "status": "Done"},
        {"id": 5, "status": "Cancelled"}
    ]

    for task_status_data in task_status:
        existing_task_status = TaskStatusRepository.get_by_id(task_status_data["id"])

        if not existing_task_status:
            task_status = TaskStatus(
                id=task_status_data["id"],
                status=task_status_data["status"]
            )

            TaskStatusRepository.create(task_status)