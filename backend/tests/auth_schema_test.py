from marshmallow import ValidationError
import pytest
from backend.app.schemas.auth_schema import RegisterSchema

def test_register_schema_valid_data():
    schema = RegisterSchema()
    valid_data = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": "Password123!",
        "passwordRepeated": "Password123!"
    }
    result = schema.load(valid_data)
    assert result["email"] == "john@example.com"

def test_register_schema_invalid_password():
    schema = RegisterSchema()
    invalid_data = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": "weakpassword",
        "passwordRepeated": "weakpassword"
    }
    with pytest.raises(ValidationError):
        schema.load(invalid_data)