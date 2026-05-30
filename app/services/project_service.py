from app.exceptions.http_exceptions import NotFoundError
from app.repositories.project_repository import ProjectRepository

class ProjectService:

    @staticmethod
    def get_project_by_id(project_id):
        project = ProjectRepository.get_by_id(project_id)

        if not project:
            raise NotFoundError("Project not found")

        return project
    #change the output

    @staticmethod
    def get_project_by_name(project_name):
        project = ProjectRepository.get_by_name(project_name)

        if not project:
            raise NotFoundError("Project not found")

        return project
    #change the output


    @staticmethod
    def get_all_projects():
        projects = ProjectRepository.get_all()

        if not projects:
            raise NotFoundError("Projects not found")

        result = []

        for project in projects:
            result.append({
                'id': project.id,
                'project_name': project.project_name
            })
#change the output to hold all the values
        return result