from backend.app.extensions.db import db
from backend.app.models.comment_model import Comment
from backend.app.models.task_model import Task
from backend.app.exceptions.http_exceptions import ServiceUnavailableError

class CommentRepository:
    @staticmethod
    def get_by_id(comment_id):
        try:
            comment = (Comment.query.join(Task, Comment.task_id == Task.id)
                       .filter(Comment.id == comment_id,Task.is_deleted.is_(False)).first())
            if not comment:
                return None
            return comment
        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_by_task_id(task_id):
        try:
            return (Comment.query.join(Task, Comment.task_id == Task.id)
                        .filter(Task.id == task_id,Task.is_deleted.is_(False)).all())

        except Exception as e:
            raise ServiceUnavailableError("Database unavailable") from e

    @staticmethod
    def get_all():
        try:
            return (Comment.query.join(Task, Comment.task_id == Task.id)
                       .filter(Task.is_deleted.is_(False)).all())

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


    @staticmethod
    def update(comment, new_comment):
        try:
            comment.comment = new_comment
            db.session.commit()
            return comment

        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e


    @staticmethod
    def delete(comment):
        try:
            db.session.delete(comment)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ServiceUnavailableError("Database unavailable") from e
