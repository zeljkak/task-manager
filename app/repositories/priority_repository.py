from app.models.priority_model import Priority
from app.extensions.db import db
from app.exceptions.http_exceptions import ServiceUnavailableError


class PriorityRepository:
    @staticmethod
    def get_by_id(priority_id):
        try:
            return Priority.query.get(priority_id)
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return Priority.query.all()
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(priority):
        try:
            db.session.add(priority)
            db.session.commit()
            return priority
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def update(priority_id, level):
        try:
            priority = PriorityRepository.get_by_id(priority_id)
            if not priority:
                return None

            priority.level = level
            db.session.commit()
            return comment

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def delete(priority_id):
        try:
            priority = PriorityRepository.get_by_id(priority_id)
            if not priority:
                return None
            db.session.delete(priority)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e