from flask import jsonify
from backend.app.exceptions.http_exceptions import HTTPException
from flask_limiter.errors import RateLimitExceeded
from marshmallow import ValidationError as MarshmallowValidationError
import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            "error": error.message
        }), error.status_code

    @app.errorhandler(MarshmallowValidationError)
    def handle_marshmallow_exception(error):
        messages = error.messages

        if isinstance(messages, dict):
            flat_messages = []

            for field_errors in messages.values():
                if isinstance(field_errors, list):
                    flat_messages.extend(field_errors)
                else:
                    flat_messages.append(str(field_errors))

            return jsonify({
                "error": flat_messages[0] if len(flat_messages) == 1 else flat_messages
            }), 422

        return jsonify({
            "error": str(messages)
        }), 422

    @app.errorhandler(RateLimitExceeded)
    def handle_rate_limit(error):
        return jsonify({
            "error": "Too many requests. Please try again later."
        }), 429

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        logger.exception(error)

        return jsonify({
            "error": str(error)
        }), 500
#"Internal server error" instead of str(error)
