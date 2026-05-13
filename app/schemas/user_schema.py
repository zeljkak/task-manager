from app.extensions.ma import ma
from app.models.user_model import User
from marshmallow import Schema, fields, validate

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password", "verification_token", "updated_at")
