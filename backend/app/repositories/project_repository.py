from backend.app.models.project_model import Project
from backend.app.extensions.db import db
from backend.app.exceptions.http_exceptions import ServiceUnavailableError
from datetime import timedelta

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
    def get_projects(text=None, created_by_id=None, created_before=None, created_after=None):
        try:
            projects = Project.query

            if text and text.strip():
                projects = projects.filter(
                    Project.project_name.ilike(f"%{text}%") |
                    Project.project_description.ilike(f"%{text}%")
                )

            if created_by_id is not None:
                projects = projects.filter(Project.created_by_id == created_by_id)

            if created_before is not None:
                projects = projects.filter(Project.created_at <= created_before + timedelta(days=1))

            if created_after is not None:
                projects = projects.filter(Project.created_at >= created_after)

            return projects.order_by(Project.created_at.desc()).all()

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