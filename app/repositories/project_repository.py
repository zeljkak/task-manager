from app.models.project_model import Project
from app.extensions.db import db
from app.exceptions.http_exceptions import ServiceUnavailableError


class ProjectRepository:
    @staticmethod
    def get_by_id(project_id):
        try:
            return Project.query.get(project_id)
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return Project.query.all()
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(project):
        try:
            db.session.add(project)
            db.session.commit()
            return project
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def delete(project_id):
        try:
            project = ProjectRepository.get_by_id(project_id)
            if not project:
                return None
            db.session.delete(project)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e