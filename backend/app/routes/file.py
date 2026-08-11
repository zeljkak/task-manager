from flask import Blueprint, send_from_directory, current_app, make_response
from flask_jwt_extended import jwt_required

file_bp = Blueprint("file", __name__)

@file_bp.route("/uploads/<filename>")
@jwt_required()
def uploaded_file(filename):
    response = make_response(send_from_directory(current_app.config["UPLOAD_FOLDER"], filename))

    # Add security header to prevent MIME-type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    return response