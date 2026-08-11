import os
import uuid
import bleach
from werkzeug.utils import secure_filename
from werkzeug.security import safe_join
from flask import current_app
from backend.app.exceptions.http_exceptions import BadRequestError

ALLOWED_EXTENSIONS = {
    #images
    "png", "jpg", "jpeg", "gif", "svg", "webp",

    #documents
    "pdf", "docx", "txt", "csv", "xlsx", "xls", "pptx"
}

ALLOWED_SVG_TAGS = [
    'svg', 'g', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon',
    'ellipse', 'text', 'tspan', 'defs', 'use', 'clipPath'
]

ALLOWED_SVG_ATTRIBUTES = {
    '*': [
        #layout
        'class', 'id', 'width', 'height', 'viewBox', 'xmlns', 'version', 'preserveAspectRatio',

        #shape
        'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points',

        #fill
        'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset',
        'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'opacity',

        #text
        'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor',
        'dominant-baseline', 'alignment-baseline', 'dx', 'dy',

        #transform
        'cursor', 'transform', 'clip-path', 'clip-rule', 'gradientUnits', 'gradientTransform',
        'offset', 'stop-color', 'stop-opacity'
    ]
}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_svg(file_stream):
    #Reads SVG content, strips out scripts/event listeners, and returns cleaned bytes
    content = file_stream.read().decode('utf-8', errors='ignore')
    cleaned_content = bleach.clean(
        content,
        tags=ALLOWED_SVG_TAGS,
        attributes=ALLOWED_SVG_ATTRIBUTES,
        strip=True
    )
    return cleaned_content.encode('utf-8')

def save_file(file):
    if not file.filename or not allowed_file(file.filename):
        raise BadRequestError("File type not allowed")

    upload_folder = current_app.config["UPLOAD_FOLDER"]

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    original_name = secure_filename(file.filename)

    if not original_name:
        original_name = "file"

    unique_name = f"{uuid.uuid4().hex}_{original_name}"

    file_path = os.path.join(upload_folder, unique_name)

    if original_name.lower().endswith('.svg'):
        clean_bytes = sanitize_svg(file.stream)
        with open(file_path, 'wb') as f:
            f.write(clean_bytes)
    else:
        file.save(file_path)

    return unique_name, original_name, file.content_type

def delete_file(file_url):
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    file_path = safe_join(upload_folder, file_url)

    if file_path and os.path.exists(file_path):
        os.remove(file_path)