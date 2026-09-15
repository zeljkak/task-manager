from backend.app.extensions.ma import ma
from marshmallow import Schema, fields, validates, ValidationError
from backend.app.models.user_model import User
from backend.app.schemas.summary_schema import TaskSummarySchema
import re

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password", "updated_at")

    first_name = ma.auto_field(data_key="firstName")
    last_name = ma.auto_field(data_key="lastName")
    email_verified = ma.auto_field(data_key="emailVerified")
    is_deleted = ma.auto_field(data_key="isDeleted")
    created_at = ma.auto_field(data_key="createdAt")
    role_id = ma.auto_field(data_key="roleId")
    followed_tasks = fields.Nested(TaskSummarySchema, data_key="followedTasks", many=True)

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

class UserPasswordChangeSchema(Schema):
    current_password = fields.Str(required=True, data_key="currentPassword")
    new_password = fields.Str(required=True, data_key="newPassword")

    @validates("new_password")
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