from app.repositories.role_repository import RoleRepository

class RoleService:

    @staticmethod
    def get_role_by_id(role_id):
        role = RoleRepository.get_by_id(role_id)

        return role

    @staticmethod
    def get_role_by_name(role_name):
        role = RoleRepository.get_by_name(role_name)

        return role

    @staticmethod
    def get_all_roles():
        roles = RoleRepository.get_all()

        return roles