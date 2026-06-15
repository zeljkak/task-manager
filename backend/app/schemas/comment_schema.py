from marshmallow import Schema, fields
from marshmallow import validates, ValidationError

from backend.app.schemas.summary_schema import UserSummarySchema

class CommentSchema(Schema):
    comment = fields.Str(required=True)

    @validates("comment")
    def validate_role_name(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Comment cannot be blank.")

class CommentResponseSchema(Schema):
    id = fields.Int()
    comment = fields.Str()
    user = fields.Nested(UserSummarySchema)
    task_id = fields.Int(data_key="taskId")
    created_at = fields.DateTime(data_key="createdAt")
    updated_at = fields.DateTime(data_key="updatedAt")