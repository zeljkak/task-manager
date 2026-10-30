from marshmallow import Schema, fields

from backend.app.schemas.task_schema import TaskResponseSchemaForAdmin
from backend.app.schemas.summary_schema import UserSummarySchema



class ActivityLogResponseSchema(Schema):
    id = fields.Int()
    action = fields.Str()
    field = fields.Str()
    old_value = fields.Raw(data_key="oldValue")
    new_value = fields.Raw(data_key="newValue")
    user = fields.Nested(UserSummarySchema)
    task = fields.Nested(TaskResponseSchemaForAdmin)
    created_at = fields.DateTime(data_key="createdAt")
