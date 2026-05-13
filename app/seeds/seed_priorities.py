from app.extensions.db import db
from app.models.priority_model import Priority


def seed_priorities():
    priorities = [
        {"id": 1, "level": "low"},
        {"id": 2, "level": "medium"},
        {"id": 3, "level": "high"}
    ]

    for priority_data in priorities:
        existing_priority = Priority.query.get(priority_data["id"])

        if not existing_priority:
            priority = Priority(
                id=priority_data["id"],
                level=priority_data["level"]
            )

            db.session.add(priority)

    db.session.commit()