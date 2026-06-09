from functools import wraps
from flask_jwt_extended import get_jwt
from backend.app.exceptions.http_exceptions import ForbiddenError

def roles_required(*allowed_roles):

    def wrapper(fn):

        @wraps(fn)
        def decorator(*args, **kwargs):

            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in allowed_roles:
                raise ForbiddenError("You do not have permission")

            return fn(*args, **kwargs)

        return decorator

    return wrapper