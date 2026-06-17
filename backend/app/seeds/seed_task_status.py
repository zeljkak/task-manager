from backend.app.models.task_status_model import TaskStatus
from backend.app.repositories.task_status_repository import TaskStatusRepository
from backend.app import constants

def seed_task_status():
    task_status = [
        {"id": constants.BACKLOG_STATUS_ID, "status": "backlog"},
        {"id": constants.TO_DO_STATUS_ID, "status": "to_do"},
        {"id": constants.IN_PROGRESS_STATUS_ID, "status": "in_progress"},
        {"id": constants.DONE_STATUS_ID, "status": "done"},
        {"id": constants.CANCELED_STATUS_ID, "status": "cancelled"}
    ]

    for task_status_data in task_status:
        existing_task_status = TaskStatusRepository.get_by_id(task_status_data["id"])

        if not existing_task_status:
            task_status = TaskStatus(
                id=task_status_data["id"],
                status=task_status_data["status"]
            )

            TaskStatusRepository.create(task_status)