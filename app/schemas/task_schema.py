from marshmallow import Schema, fields
from marshmallow import validates, ValidationError


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
