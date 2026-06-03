from app.models.project_model import Project
from app.extensions.db import db
from app.exceptions.http_exceptions import ServiceUnavailableError


class ProjectRepository:
    @staticmethod
    def get_by_id(project_id):
        try:
            project = Project.query.get(project_id)
            if not project:
                return None
            return project
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_name(name):
        try:
            project = Project.query.filter_by(project_name=name).first()
            if not project:
                return None
            return project
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def get_all():
        try:
            project = Project.query.all()
            if not project:
                return None
            return project
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
    def update(project):
        try:
            db.session.commit()
            return project

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def delete(project):
        try:
            db.session.delete(project)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e