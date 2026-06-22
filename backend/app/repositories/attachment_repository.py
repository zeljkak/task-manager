from backend.app.extensions.db import db
from backend.app.exceptions.http_exceptions import ServiceUnavailableError
from backend.app.models.attachment_model import Attachment

class AttachmentRepository:

    @staticmethod
    def get_by_id(attachment_id):
        try:
            attachment = Attachment.query.get(attachment_id)
            if not attachment:
                return None
            return attachment

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(attachment):
        try:
            db.session.add(attachment)
            db.session.commit()
            return attachment
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def delete(attachment):
        try:
            db.session.delete(attachment)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e