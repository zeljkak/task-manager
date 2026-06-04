from app.models.activity_log_model import ActivityLog

from app.repositories.activity_log_repository import ActivityLogRepository

class ActivityLogService:
    @staticmethod
    def create_activity(change, task_id, current_user_id):
        log = ActivityLog(
            user_id=current_user_id,
            task_id=task_id,
            action="TASK_UPDATED",
            field=change["field"],
            old_value=change["old"],
            new_value=change["new"]
        )
        return ActivityLogRepository.create(log)

    @staticmethod
    def deletion_activity(task_id, current_user_id, action):
        if action == "TASK_DELETED":
            old_val = bool(0)
            new_val = bool(1)
        else:
            old_val = bool(1)
            new_val = bool(0)

        log = ActivityLog(
            user_id=current_user_id,
            task_id=task_id,
            action=action,
            field="is_deleted",
            old_value=old_val,
            new_value=new_val
        )
        return ActivityLogRepository.create(log)
