from marshmallow import Schema, fields
from marshmallow import validates, ValidationError

class TaskStatusSchema(Schema):
    status = fields.Str(required=True)

    @validates("status")
    def validate_status(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Status cannot be blank.")

class TaskStatusResponseSchema(Schema):
    id = fields.Int()
    status = fields.Str()