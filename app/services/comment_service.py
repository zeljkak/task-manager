from app.exceptions.http_exceptions import NotFoundError
from app.repositories.comment_repository import CommentRepository

class CommentService:

    @staticmethod
    def get_comment_by_id(comment_id):
        comment = CommentRepository.get_by_id(comment_id)

        if not comment:
            raise NotFoundError("Comment not found")

        return comment
    #change the output

    @staticmethod
    def get_all_comments_for_task(task_id):
        comments = CommentRepository.get_by_task_id(task_id)

        if not comments:
            raise NotFoundError("Role not found")

        result = []

        for comment in comments:
            result.append({comment})
            #change the output, all the values of comment
        return result

    @staticmethod
    def get_all_comments():
        comments = CommentRepository.get_all()

        if not comments:
            raise NotFoundError("Comments not found")

        result = []

        for comment in comments:
            result.append({comment})
            #change the output, all the values of comment

        return result