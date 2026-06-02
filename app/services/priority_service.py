from app.exceptions.http_exceptions import NotFoundError
from app.repositories.priority_repository import PriorityRepository

class PriorityService:

    @staticmethod
    def get_priority_by_id(priority_id):
        priority = PriorityRepository.get_by_id(priority_id)

        if not priority:
            raise NotFoundError("Priority not found")

        return priority

    @staticmethod
    def get_priority_by_name(priority_name):
        priority = PriorityRepository.get_by_name(priority_name)

        if not priority:
            raise NotFoundError("Priority not found")

        return priority

    @staticmethod
    def get_all_priorities():
        priorities = PriorityRepository.get_all()

        if not priorities:
            raise NotFoundError("Priorities not found")

        return priorities