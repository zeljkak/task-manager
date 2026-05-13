from app.extensions.db import db
from app.models.role_model import Role


def seed_roles():
    roles = [
        {"id": 1, "role_name": "admin"},
        {"id": 2, "role_name": "user"}
    ]

    for role_data in roles:
        existing_role = Role.query.get(role_data["id"])

        if not existing_role:
            role = Role(
                id=role_data["id"],
                role_name=role_data["role_name"]
            )

            db.session.add(role)

    db.session.commit()