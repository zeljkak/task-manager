from backend.app.models.role_model import Role
from backend.app.repositories.role_repository import RoleRepository
from backend.app import constants


def seed_roles():
    roles = [
        {"id": constants.ADMIN_ID, "role_name": "admin"},
        {"id": constants.USER_ID, "role_name": "user"}
    ]

    for role_data in roles:
        existing_role = RoleRepository.get_by_id(role_data["id"])

        if not existing_role:
            role = Role(
                id=role_data["id"],
                role_name=role_data["role_name"]
            )

            RoleRepository.create(role)