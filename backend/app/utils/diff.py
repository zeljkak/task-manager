from datetime import datetime
from marshmallow import ValidationError as MarshmallowValidationError

def get_changed_fields(old_obj, new_obj, fields):

    changes = []

    for field in fields:

        old_value = getattr(old_obj, field, None)
        new_value = getattr(new_obj, field, None)

        # normalize datetimes
        if hasattr(old_value, "isoformat"):
            old_value = old_value.isoformat()

        if hasattr(new_value, "isoformat"):
            new_value = new_value.isoformat()

        if old_value != new_value:
            changes.append({
                "field": field,
                "old": old_value,
                "new": new_value
            })

    return changes

def parse_date(value):
    if not value:
        return None

    try:
        if isinstance(value, str):
            clean_value = value.replace('Z', '+00:00')
        else:
            clean_value = value
        return datetime.fromisoformat(clean_value)

    except (ValueError, TypeError):
        raise MarshmallowValidationError(
            {"date": ["Invalid date format. Expected ISO 8601 (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)"]}
        )

def parse_bool(value):
    if value is None:
        return None
    return value.lower() in ("true", "1", "yes")

def parse_user_id(val, current_user_id):
    if not val:
        return None

    val_str = str(val).strip().lower()
    if val_str == "me":
        return current_user_id

    try:
        return int(val_str)
    except ValueError:
        return None