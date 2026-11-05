import os
from backend.app.models.project_model import Project
from backend.app.repositories.project_repository import ProjectRepository
from backend.app.repositories.user_repository import UserRepository

def seed_projects():
    admin_email = os.environ.get("SEED_ADMIN_EMAIL", "admin@example.com")
    admin_user = UserRepository.get_by_email(admin_email)

    if not admin_user:
        users = UserRepository.get_all()
        if not users:
            print("Skipping project seeding: No users found in database.")
            return
        admin_user = users[0]

    projects = [
        {
            "id": 1, "project_name": "Example Project",
            "project_description": "This is an example of a project. It can be renamed or deleted.",
            "created_by_id": admin_user.id,
            "updated_by_id": admin_user.id
        }
    ]

    for project_data in projects:
        existing_project = ProjectRepository.get_by_id(project_data["id"])

        if not existing_project:
            project = Project(
                id=project_data["id"],
                project_name=project_data["project_name"],
                project_description=project_data["project_description"],
                created_by_id=project_data["created_by_id"],
                updated_by_id=project_data["updated_by_id"]
            )

            ProjectRepository.create(project)