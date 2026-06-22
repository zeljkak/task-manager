import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def save_file(file):
    upload_folder = current_app.config["UPLOAD_FOLDER"]

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    original_name = secure_filename(file.filename)

    unique_name = f"{uuid.uuid4().hex}_{original_name}"

    file_path = os.path.join(upload_folder, unique_name)

    file.save(file_path)
    return unique_name, original_name, file.content_type

def delete_file(file_url):
    file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], file_url)

    if os.path.exists(file_path):
        os.remove(file_path)