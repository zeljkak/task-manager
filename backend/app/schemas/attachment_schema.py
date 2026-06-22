from flask import request
from marshmallow import Schema, fields
from backend.app.schemas.summary_schema import UserSummarySchema

class AttachmentSchema(Schema):
    pass

class AttachmentResponseSchema(Schema):
    id = fields.Int()
    file_url = fields.Method("get_file_url", data_key="fileUrl")
    file_name = fields.Str(data_key="fileName")
    file_type = fields.Str(data_key="fileType")
    created_at = fields.DateTime(data_key="createdAt")
    created_by = fields.Nested(UserSummarySchema, data_key="createdBy")

    def get_file_url(self, obj):
        return f"{request.host_url}uploads/{obj.file_url}"