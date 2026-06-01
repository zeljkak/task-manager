from app.exceptions.http_exceptions import NotFoundError

from app.repositories.project_repository import ProjectRepository
from app.models.project_model import Project


class ProjectService:

    @staticmethod
    def get_project_by_id(project_id):
        project = ProjectRepository.get_by_id(project_id)

        if not project:
            raise NotFoundError("Project not found")

        return {
            'id': project.id,
            'projectName': project.project_name,
            'projectDescription': project.project_description
        }

    @staticmethod
    def get_project_by_name(project_name):
        project = ProjectRepository.get_by_name(project_name)

        if not project:
            raise NotFoundError("Project not found")

        return {
            'id': project.id,
            'projectNname': project.project_name,
            'projectDescription': project.project_description
        }


    @staticmethod
    def get_all_projects():
        projects = ProjectRepository.get_all()

        if not projects:
            raise NotFoundError("Projects not found")

        result = []

        for project in projects:
            result.append({
                'id': project.id,
                'projectName': project.project_name,
                'projectDescription': project.project_description
            })

        return result

    @staticmethod
    def create_project(data, current_user_id):

        project = Project(
            project_name=data["project_name"],
            project_description=data.get("project_description"),
            created_by_id=current_user_id,
            updated_by_id=current_user_id
        )

        return ProjectRepository.create(project)