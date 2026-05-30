from app.exceptions.http_exceptions import NotFoundError
from app.repositories.role_repository import RoleRepository

class RoleService:

    @staticmethod
    def get_role_by_id(role_id):
        role = RoleRepository.get_by_id(role_id)

        if not role:
            raise NotFoundError("Role not found")

        return {
        'id': role.id,
        'level': role.role_name
        }

    @staticmethod
    def get_role_by_name(role_name):
        role = RoleRepository.get_by_name(role_name)

        if not role:
            raise NotFoundError("Role not found")

        return {
            'id': role.id,
            'level': role.role_name
        }

    @staticmethod
    def get_all_roles():
        roles = RoleRepository.get_all()

        if not roles:
            raise NotFoundError("Roles not found")

        result = []

        for role in roles:
            result.append({
                'id': role.id,
                'level': role.role_name
            })

        return result