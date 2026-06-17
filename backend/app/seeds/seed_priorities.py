from backend.app.models.priority_model import Priority
from backend.app.repositories.priority_repository import PriorityRepository
from backend.app import constants


def seed_priorities():
    priorities = [
        {"id": constants.LOW_PRIORITY_ID, "level": "low"},
        {"id": constants.MEDIUM_PRIORITY_ID, "level": "medium"},
        {"id": constants.HIGH_PRIORITY_ID, "level": "high"}
    ]

    for priority_data in priorities:
        existing_priority = PriorityRepository.get_by_id(priority_data["id"])

        if not existing_priority:
            priority = Priority(
                id=priority_data["id"],
                level=priority_data["level"]
            )

            PriorityRepository.create(priority)