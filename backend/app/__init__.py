from flask import Flask
from flasgger import Swagger
from flask_cors import CORS

from backend.app.extensions.jwt import jwt, configure_jwt
from backend.app.extensions.db import db
from backend.app.extensions.ma import ma
from backend.app.extensions.limiter import limiter
from backend.app.extensions.migrate import migrate
from backend.app.extensions.mail import mail
from backend.app.extensions.socketio import socketio

from backend.app.routes.auth import auth_bp
from backend.app.routes.user import user_bp
from backend.app.routes.task import task_bp
from backend.app.routes.priority import priority_bp
from backend.app.routes.role import role_bp
from backend.app.routes.project import project_bp
from backend.app.routes.comment import comment_bp
from backend.app.routes.task_status import task_status_bp
from backend.app.routes.admin import admin_bp
from backend.app.routes.attachment import attachment_bp
from backend.app.routes.file import file_bp
from backend.app.routes.notification import notification_bp

from backend.app import models
from backend.config import Config
from backend.app.errors.handlers import register_error_handlers

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Task Manager API",
        "description": "API documentation",
        "version": "1.0"
    }
}

swagger = Swagger(template=swagger_template)

def create_app():
    app = Flask(__name__)

    from flask import send_from_directory, current_app
    import os

    # enable React and Flask communication
    CORS(app, supports_credentials=True, origins=Config.FRONTEND_URL)

    # load everything from config.py
    app.config.from_object(Config)

    # initialize Swagger
    swagger.init_app(app)
    jwt.init_app(app)
    configure_jwt(jwt)
    db.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)
    # migrations/ lives at the repository root (sibling of backend/)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    migrate.init_app(app, db, directory=os.path.join(project_root, "migrations"))
    mail.init_app(app)

    cors_origin = Config.FRONTEND_URL or "*"
    socketio.init_app(
        app,
        cors_allowed_origins=cors_origin,
        supports_credentials=True,
        async_mode="eventlet",
    )
    # register Socket.IO connect/disconnect handlers (mapped by user ID)
    from backend.app.routes import websocket

    # register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(priority_bp)
    app.register_blueprint(role_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(task_status_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(attachment_bp)
    app.register_blueprint(file_bp)
    app.register_blueprint(notification_bp)
    #print(app.url_map)

    register_error_handlers(app)

    return app
