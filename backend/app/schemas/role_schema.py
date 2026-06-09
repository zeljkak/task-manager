from marshmallow import Schema, fields
from marshmallow import validates, ValidationError

class RoleSchema(Schema):
    role_name = fields.Str(required=True, data_key="roleName")

    @validates("role_name")
    def validate_role_name(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Role name cannot be blank.")

class RoleResponseSchema(Schema):
    id = fields.Int()
    role_name = fields.Str(data_key="roleName")