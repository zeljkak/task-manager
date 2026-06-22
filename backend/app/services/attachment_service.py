from backend.app import constants
from backend.app.utils.file_storage import delete_file

from backend.app.exceptions.http_exceptions import ForbiddenError, NotFoundError, ServiceUnavailableError
from backend.app.models.attachment_model import Attachment
from backend.app.services.task_service import TaskService
from backend.app.services.project_service import ProjectService
from backend.app.services.comment_service import CommentService
from backend.app.services.user_service import UserService
from backend.app.repositories.attachment_repository import AttachmentRepository


class AttachmentService:

    @staticmethod
    def get_attachment_by_id(attachment_id):
        attachment = AttachmentRepository.get_by_id(attachment_id)

        if not attachment:
            raise NotFoundError("Attachment not found")

        return attachment

    @staticmethod
    def get_task_attachments(task_id):
        task = TaskService.get_task_by_id(task_id)
        return task.attachments

    @staticmethod
    def get_project_attachments(project_id):
        project = ProjectService.get_project_by_id(project_id)
        return project.attachments

    @staticmethod
    def get_comment_attachments(comment_id):
        comment = CommentService.get_comment_by_id(comment_id)
        return comment.attachments

    @staticmethod
    def create_task_attachment(task_id, user_id, file_data):
        task = TaskService.get_task_by_id(task_id)
        UserService.get_user_by_id(user_id)

        attachment = Attachment(
            file_url=file_data["file_url"],
            file_name=file_data["file_name"],
            file_type=file_data["file_type"],
            task_id=task.id,
            created_by_id=user_id
        )

        return AttachmentRepository.create(attachment)

    @staticmethod
    def create_project_attachment(project_id, user_id, file_data):
        project = ProjectService.get_project_by_id(project_id)
        UserService.get_user_by_id(user_id)

        attachment = Attachment(
            file_url=file_data["file_url"],
            file_name=file_data["file_name"],
            file_type=file_data["file_type"],
            project_id=project.id,
            created_by_id=user_id
        )

        return AttachmentRepository.create(attachment)

    @staticmethod
    def create_comment_attachment(comment_id, user_id, file_data):
        comment = CommentService.get_comment_by_id(comment_id)
        UserService.get_user_by_id(user_id)

        attachment = Attachment(
            file_url=file_data["file_url"],
            file_name=file_data["file_name"],
            file_type=file_data["file_type"],
            comment_id=comment.id,
            created_by_id=user_id
        )

        return AttachmentRepository.create(attachment)

    @staticmethod
    def delete_attachment(attachment_id, user_id):
        attachment = AttachmentService.get_attachment_by_id(attachment_id)
        user = UserService.get_user_by_id(user_id)

        if user.id != attachment.created_by_id and user.role_id != constants.ADMIN_ID:
            raise ForbiddenError("Cannot delete attachment")

        try:
            delete_file(attachment.file_url)
        except Exception as e:
            raise ServiceUnavailableError("Problem with file system") from e

        return AttachmentRepository.delete(attachment)