from app.exceptions.http_exceptions import NotFoundError, ForbiddenError
from app.models.comment_model import Comment
from app.repositories.comment_repository import CommentRepository

class CommentService:

    @staticmethod
    def get_comment_by_id(comment_id):
        comment = CommentRepository.get_by_id(comment_id)

        if not comment:
            raise NotFoundError("Comment not found")

        return comment

    @staticmethod
    def get_all_comments_for_task(task_id):
        comments = CommentRepository.get_by_task_id(task_id)

        if not comments:
            raise NotFoundError("Comment not found")

        return comments

    @staticmethod
    def get_all_comments():
        comments = CommentRepository.get_all()

        if not comments:
            raise NotFoundError("Comments not found")

        return comments

    @staticmethod
    def create_comment(data, current_user_id, task_id):
        comment = Comment(
            comment=data["comment"],
            user_id=current_user_id,
            task_id=task_id
        )

        return CommentRepository.create(comment)

    @staticmethod
    def update_comment(data, comment_id, current_user_id):
        comment = CommentService.get_comment_by_id(comment_id)

        if comment.user_id != current_user_id:
            raise ForbiddenError("Cannot update comment")

        new_comment = data["comment"]

        return CommentRepository.update(comment, new_comment)

    @staticmethod
    def delete_comment(comment_id, current_user_id):
        comment = CommentService.get_comment_by_id(comment_id)
        if comment.user_id != current_user_id:
            raise ForbiddenError("Cannot delete comment")

        return CommentRepository.delete(comment)
