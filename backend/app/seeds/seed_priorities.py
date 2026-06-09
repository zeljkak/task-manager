from backend.app.models.priority_model import Priority
from backend.app.repositories.priority_repository import PriorityRepository


def seed_priorities():
    priorities = [
        {"id": 1, "level": "low"},
        {"id": 2, "level": "medium"},
        {"id": 3, "level": "high"}
    ]

    for priority_data in priorities:
        existing_priority = PriorityRepository.get_by_id(priority_data["id"])

        if not existing_priority:
            priority = Priority(
                id=priority_data["id"],
                level=priority_data["level"]
            )

            PriorityRepository.create(priority)