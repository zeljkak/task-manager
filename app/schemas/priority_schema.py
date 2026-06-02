from marshmallow import Schema, fields
from marshmallow import validates, ValidationError

class PrioritySchema(Schema):
    level = fields.Str(required=True)

    @validates("level")
    def validate_level(self, value, **kwargs):
        if len(value.strip()) < 1:
            raise ValidationError("Level cannot be blank.")

class PriorityResponseSchema(Schema):
    id = fields.Int()
    level = fields.Str()