from flask import Blueprint, send_from_directory, current_app

file_bp = Blueprint("file", __name__)

@file_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        filename
    )