from alembic.autogenerate.compare import comments

from app.extensions.db import db
from app.models.comment_model import Comment
from app.exceptions.http_exceptions import ServiceUnavailableError

class CommentRepository:
    @staticmethod
    def get_by_id(comment_id):
        try:
            comment = Comment.query.get(comment_id)
            if not comment:
                return None
            return comment
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_task_id(task_id):
        try:
            comments = Comment.query.filter_by(task_id=task_id).all()
            if not comments:
                return None
            return comments
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            comments = Comment.query.all()
            if not comments:
                return None
            return comments
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def create(comment):
        try:
            db.session.add(comment)
            db.session.commit()
            return comment
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e

"""
    @staticmethod
    def update(comment_id, new_comment):
        try:
            comment = CommentRepository.get_by_id(comment_id)
            if not comment:
                return None

            comment.comment = new_comment
            db.session.commit()
            return comment

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
"""

"""
    @staticmethod
    def delete(comment_id):
        try:
            comment = CommentRepository.get_by_id(comment_id)
            if not comment:
                return None
            db.session.delete(comment)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
"""