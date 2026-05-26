from app.models.project_model import Project
from app.repositories.project_repository import ProjectRepository


def seed_projects():
    projects = [
        {"id": 1, "project_name": "Example Project", "project_description": "This is an example of a project. It can be renamed or deleted."}
    ]

    for project_data in projects:
        existing_project = ProjectRepository.get_by_id(project_data["id"])

        if not existing_project:
            project = Project(
                id=project_data["id"],
                project_name=project_data["project_name"],
                project_description=project_data["project_description"]
            )

            ProjectRepository.create(project)