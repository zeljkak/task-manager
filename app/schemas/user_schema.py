from app.extensions.ma import ma
from app.models.user_model import User

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password", "verification_token", "updated_at")

    first_name = ma.auto_field(data_key="firstName")
    last_name = ma.auto_field(data_key="lastName")
    email_verified = ma.auto_field(data_key="emailVerified")
    created_at = ma.auto_field(data_key="createdAt")