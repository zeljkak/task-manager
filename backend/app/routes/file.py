from flask import Blueprint, send_from_directory, current_app, make_response, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.exceptions import NotFound
from flasgger import swag_from
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

file_bp = Blueprint("file", __name__)

@file_bp.route("/uploads/<filename>", methods=['GET'])
@swag_from(os.path.join(BASE_DIR, "../../docs/file/file.yml"))
@jwt_required()
def uploaded_file(filename):
    try:
        response = make_response(send_from_directory(current_app.config["UPLOAD_FOLDER"], filename))
        # Add security header to prevent MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response
    except NotFound:
        return jsonify({
            "error": "file_not_found",
            "message": "The requested file does not exist."
        }), 404