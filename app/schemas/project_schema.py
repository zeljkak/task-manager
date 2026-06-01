from marshmallow import Schema, fields
from marshmallow import validates, ValidationError


class ProjectSchema(Schema):
    project_name = fields.Str(required=True, data_key="projectName")
    project_description = fields.Str(allow_none=True, data_key="projectDescription")

    @validates("project_name")
    def validate_project_name(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Project name cannot be blank.")
