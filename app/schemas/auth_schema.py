from marshmallow import Schema, fields, validate
import re
from marshmallow import validates, ValidationError

class RegisterSchema(Schema):
    first_name = fields.Str(required=True, data_key="firstName")
    last_name = fields.Str(required=True, data_key="lastName")
    email = fields.Email(required=True)
    password = fields.Str(required=True)

    @validates("first_name")
    def validate_first_name(self, value, **kwargs):
        if len(value.strip()) < 2:
            raise ValidationError("First name must be at least 2 characters long.")

    @validates("last_name")
    def validate_last_name(self, value, **kwargs):
        if len(value.strip()) < 2:
            raise ValidationError("Last name must be at least 2 characters long.")

    @validates("password")
    def validate_password(self, value, **kwargs):

        if len(value) < 8:
            raise ValidationError("Password must be at least 8 characters long.")

        if not re.search(r"[A-Z]", value):
            raise ValidationError("Password must contain at least one uppercase letter.")

        if not re.search(r"[a-z]", value):
            raise ValidationError("Password must contain at least one lowercase letter.")

        if not re.search(r"[0-9]", value):
            raise ValidationError("Password must contain at least one number.")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-\\/\[\]=+;']", value):
            raise ValidationError("Password must contain at least one special character.")

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)
