from backend.app.exceptions.http_exceptions import NotFoundError, ForbiddenError, ServiceUnavailableError
from backend.app.models.comment_model import Comment
from backend.app.repositories.comment_repository import CommentRepository
from backend.app.services.task_service import TaskService
from backend.app.utils.file_storage import delete_file


class CommentService:

    @staticmethod
    def get_comment_by_id(comment_id):
        comment = CommentRepository.get_by_id(comment_id)

        if not comment:
            raise NotFoundError("Comment not found")

        return comment

    @staticmethod
    def get_all_comments_for_task(task_id):
        TaskService.get_task_by_id(task_id)
        return CommentRepository.get_by_task_id(task_id)

    @staticmethod
    def get_all_comments():
        return CommentRepository.get_all()

    @staticmethod
    def create_comment(data, current_user_id, task_id):
        TaskService.get_task_by_id(task_id)
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

        if comment.attachments:
            for attachment in comment.attachments:
                try:
                    delete_file(attachment.file_url)
                except Exception as e:
                    raise ServiceUnavailableError("Problem with file system") from e

        return CommentRepository.delete(comment)
