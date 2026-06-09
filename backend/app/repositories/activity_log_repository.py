from backend.app.extensions.db import db
from backend.app.exceptions.http_exceptions import ServiceUnavailableError

class ActivityLogRepository:
    @staticmethod
    def create(log):
        try:
            db.session.add(log)
        except Exception as e:
            print(e)
            raise ServiceUnavailableError("Database unavailable") from e