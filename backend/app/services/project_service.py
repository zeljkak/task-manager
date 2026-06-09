from backend.app.exceptions.http_exceptions import NotFoundError

from backend.app.repositories.project_repository import ProjectRepository
from backend.app.models.project_model import Project


class ProjectService:

    UPDATABLE_FIELDS = [
        "project_name",
        "project_description"
    ]

    @staticmethod
    def get_project_by_id(project_id):
        project = ProjectRepository.get_by_id(project_id)

        if not project:
            raise NotFoundError("Project not found")

        return project


    @staticmethod
    def get_project_by_name(project_name):
        project = ProjectRepository.get_by_name(project_name)

        if not project:
            raise NotFoundError("Project not found")

        return project


    @staticmethod
    def get_all_projects():
        projects = ProjectRepository.get_all()

        if not projects:
            raise NotFoundError("Projects not found")

        return projects

    @staticmethod
    def create_project(data, current_user_id):

        project = Project(
            project_name=data["project_name"],
            project_description=data.get("project_description"),
            created_by_id=current_user_id,
            updated_by_id=current_user_id
        )

        return ProjectRepository.create(project)

    @staticmethod
    def update_project(project_id, data, current_user_id):
        project = ProjectService.get_project_by_id(project_id)

        for key, value in data.items():
            if key in ProjectService.UPDATABLE_FIELDS:
                setattr(project, key, value)

        project.updated_by_id = current_user_id

        return ProjectRepository.update(project)

    @staticmethod
    def delete_project(project_id):
        project = ProjectService.get_project_by_id(project_id)

        return ProjectRepository.delete(project)