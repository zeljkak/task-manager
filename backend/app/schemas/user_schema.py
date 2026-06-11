from backend.app.extensions.ma import ma
from marshmallow import Schema, fields, validates, ValidationError
from backend.app.models.user_model import User

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password", "verification_token", "updated_at")

    first_name = ma.auto_field(data_key="firstName")
    last_name = ma.auto_field(data_key="lastName")
    email_verified = ma.auto_field(data_key="emailVerified")
    created_at = ma.auto_field(data_key="createdAt")
    role_id = ma.auto_field(data_key="roleId")

#for nested user output
class UserSummarySchema(Schema):
    id = fields.Int()
    first_name = fields.Str(data_key="firstName")
    last_name = fields.Str(data_key="lastName")

class UserUpdateSchema(Schema):
    first_name = fields.Str(data_key="firstName")
    last_name = fields.Str(data_key="lastName")

    @validates("first_name")
    def validate_first_name(self, value, **kwargs):
        if len(value.strip()) < 2:
            raise ValidationError("First name must be at least 2 characters long.")

    @validates("last_name")
    def validate_last_name(self, value, **kwargs):
        if len(value.strip()) < 2:
            raise ValidationError("Last name must be at least 2 characters long.")
