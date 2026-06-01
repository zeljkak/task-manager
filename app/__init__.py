from flask import Flask
from flasgger import Swagger

from app.extensions.jwt import jwt
from app.extensions.db import db
from app.extensions.ma import ma
from app.extensions.limiter import limiter
from app.extensions.migrate import migrate
from app.extensions.mail import mail

from app.routes.auth import auth_bp
from app.routes.user import user_bp
from app.routes.task import task_bp
from app.routes.priority import priority_bp
from app.routes.role import role_bp
from app.routes.project import project_bp

from app import models

from config import Config

from app.errors.handlers import register_error_handlers


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
    #print(app.url_map)

    register_error_handlers(app)

    return app
