from flask import Flask
from flasgger import Swagger
from flask_cors import CORS

from backend.app.extensions.jwt import jwt
from backend.app.extensions.db import db
from backend.app.extensions.ma import ma
from backend.app.extensions.limiter import limiter
from backend.app.extensions.migrate import migrate
from backend.app.extensions.mail import mail

from backend.app.routes.auth import auth_bp
from backend.app.routes.user import user_bp
from backend.app.routes.task import task_bp
from backend.app.routes.priority import priority_bp
from backend.app.routes.role import role_bp
from backend.app.routes.project import project_bp
from backend.app.routes.comment import comment_bp
from backend.app.routes.task_status import task_status_bp
from backend.app.routes.admin import admin_bp

from backend.app import models

from backend.config import Config

from backend.app.errors.handlers import register_error_handlers


swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Task Manager API",
        "description": "API documentation",
        "version": "1.0"
    },
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Enter: Bearer <your_token>"
        }
    }
}

swagger = Swagger(template=swagger_template)

def create_app():
    app = Flask(__name__)

    #enable React and Flask communication
    CORS(app)
    # for production use a second parameter: origins=["http://localhost:5173"]

    #Load everything from config.py
    app.config.from_object(Config)

    # Initialize Swagger
    swagger.init_app(app)
    jwt.init_app(app)
    db.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    #Register blueprint
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(priority_bp)
    app.register_blueprint(role_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(task_status_bp)
    app.register_blueprint(admin_bp)
    #print(app.url_map)

    register_error_handlers(app)

    return app
