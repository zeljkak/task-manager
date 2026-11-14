from marshmallow import Schema, fields

from backend.app.schemas.summary_schema import UserSummarySchema, TaskSummarySchema


class NotificationResponseSchema(Schema):
    id = fields.Int()
    title = fields.Str()
    message = fields.Str()
    is_read = fields.Bool(data_key="isRead")
    created_at = fields.DateTime(data_key="createdAt")
    actor = fields.Nested(UserSummarySchema)
    task = fields.Nested(TaskSummarySchema)
