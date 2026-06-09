from marshmallow import Schema, fields
from marshmallow import validates, ValidationError
from backend.app.schemas.user_schema import UserSummarySchema

class ProjectSchema(Schema):
    project_name = fields.Str(required=True, data_key="projectName")
    project_description = fields.Str(allow_none=True, data_key="projectDescription")

    @validates("project_name")
    def validate_project_name(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Project name cannot be blank.")

class ProjectResponseSchema(Schema):
    id = fields.Int()
    project_name = fields.Str(data_key="projectName")
    project_description = fields.Str(data_key="projectDescription")
    created_at = fields.DateTime(data_key="createdAt")
    updated_at = fields.DateTime(data_key="updatedAt")
    created_by = fields.Nested(UserSummarySchema, data_key="createdBy")
    updated_by = fields.Nested(UserSummarySchema, data_key="updatedBy")

class ProjectSummarySchema(Schema):
    id = fields.Int()
    project_name = fields.Str(data_key="projectName")
    project_description = fields.Str(data_key="projectDescription")