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
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise MarshmallowValidationError(
            {"date": ["Invalid date format. Expected YYYY-MM-DD"]}
        )

def parse_bool(value):
    if value is None:
        return None
    return value.lower() in ("true", "1", "yes")