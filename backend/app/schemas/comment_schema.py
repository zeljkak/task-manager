from marshmallow import Schema, fields
from marshmallow import validates_schema, ValidationError

from backend.app.schemas.summary_schema import UserSummarySchema
from backend.app.schemas.attachment_schema import AttachmentResponseSchema

class CommentSchema(Schema):
    comment = fields.Str(allow_none=True)
    has_attachments = fields.Boolean(data_key="hasAttachments", load_default=False)

    @validates_schema
    def validate_comment_or_attachments(self, data, **kwargs):
        comment_text = (data.get("comment") or "").strip()
        has_attachments = data.get("has_attachments", False)

        if not comment_text and not has_attachments:
            raise ValidationError(
                "Comment cannot be empty unless attachments are uploaded.",
                field_name="comment"
            )

class CommentResponseSchema(Schema):
    id = fields.Int()
    comment = fields.Str()
    user = fields.Nested(UserSummarySchema)
    task_id = fields.Int(data_key="taskId")
    created_at = fields.DateTime(data_key="createdAt")
    updated_at = fields.DateTime(data_key="updatedAt")
    attachments = fields.Nested(AttachmentResponseSchema, many=True)