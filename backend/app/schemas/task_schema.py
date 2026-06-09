from marshmallow import Schema, fields
from marshmallow import validates, ValidationError

from backend.app.schemas.priority_schema import PriorityResponseSchema
from backend.app.schemas.project_schema import ProjectSummarySchema
from backend.app.schemas.user_schema import UserSummarySchema


class TaskSchema(Schema):
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)

    status_id = fields.Int(allow_none=True, data_key="statusId")
    priority_id = fields.Int(allow_none=True, data_key="priorityId")
    project_id = fields.Int(allow_none=True, data_key="projectId")

    assigned_to_id = fields.Int(allow_none=True, data_key="assignedToId")

    due_date = fields.Date(allow_none=True, data_key="dueDate")
    estimated_hours = fields.Int(allow_none=True, data_key="estimatedHours")

    @validates("title")
    def validate_title(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Title cannot be blank.")

class TaskResponseSchema(Schema):
    id = fields.Int()
    title = fields.Str()
    description = fields.Str()
    assigned_to = fields.Nested(UserSummarySchema, data_key="assignedTo")
    due_date = fields.Date(data_key="dueDate")
    estimated_hours = fields.Int(data_key="estimatedHours")
    status_id = fields.Int(data_key="statusId")
    priority = fields.Nested(PriorityResponseSchema)
    project = fields.Nested(ProjectSummarySchema)
    created_at = fields.DateTime(data_key="createdAt")
    created_by = fields.Nested(UserSummarySchema, data_key="createdBy")