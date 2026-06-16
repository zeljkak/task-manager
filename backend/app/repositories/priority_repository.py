from backend.app.models.priority_model import Priority
from backend.app.extensions.db import db
from backend.app.exceptions.http_exceptions import ServiceUnavailableError


class PriorityRepository:
    @staticmethod
    def get_by_id(priority_id):
        try:
            priority = Priority.query.get(priority_id)
            if not priority:
                return None
            return priority
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_name(priority_name):
        try:
            priority = Priority.query.filter_by(name=priority_name).first()
            if not priority:
                return None
            return priority
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
