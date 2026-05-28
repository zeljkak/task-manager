from app.repositories.priority_repository import PriorityRepository

class PriorityService:

    @staticmethod
    def get_priority_by_id(priority_id):
        priority = PriorityRepository.get_by_id(priority_id)

        return priority

    @staticmethod
    def get_priority_by_name(priority_name):
        priority = PriorityRepository.get_by_name(priority_name)

        return priority

    @staticmethod
    def get_all_priorities():
        priorities = PriorityRepository.get_all()

        return priorities

# There are create, update and delete functions in priority_repository
# for possible expanding of Priority model