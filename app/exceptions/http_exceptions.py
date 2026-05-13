class HTTPException(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class BadRequestError(HTTPException):
    def __init__(self, message="Bad request (missing or invalid fields)"):
        super().__init__(message, 400)


class AuthenticationError(HTTPException):
    def __init__(self, message="Invalid credentials"):
        super().__init__(message, 401)


class NotFoundError(HTTPException):
    def __init__(self, message="Not found"):
        super().__init__(message, 404)


class DuplicatesError(HTTPException):
    def __init__(self, message="Already exists"):
        super().__init__(message, 409)

#NOT USED, MARSHMALLOW HANDLES IT IN HANDLERS.PY
"""class ValidationError(HTTPException):
    def __init__(self, message="Validation error (invalid format)"):
        super().__init__(message, 422)"""

#NOT USED, FLASK LIMITER HANDLES IT IN HANDLERS.PY
"""class TooManyRequestsError(HTTPException):
    def __init__(self, message="Too many requests"):
        super().__init__(message, 429)"""


class ServiceUnavailableError(HTTPException):
    def __init__(self, message="Service unavailable"):
        super().__init__(message, 503)