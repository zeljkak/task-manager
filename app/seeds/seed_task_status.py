from app.extensions.db import db
from app.models.task_status_model import TaskStatus


def seed_task_status():
    task_status = [
        {"id": 1, "status": "backlog"},
        {"id": 2, "status": "to_do"},
        {"id": 3, "status": "in_progress"},
        {"id": 4, "status": "done"},
        {"id": 5, "status": "cancelled"}
    ]

    for task_status_data in task_status:
        existing_task_status = TaskStatus.query.get(task_status_data["id"])

        if not existing_task_status:
            task_status = TaskStatus(
                id=task_status_data["id"],
                status=task_status_data["status"]
            )

            db.session.add(task_status)

    db.session.commit()