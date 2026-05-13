from enum import unique

from app.extensions.db import db

class Priority(db.Model):
    __tablename__ = "priorities"

    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.String(50), unique=True, nullable=False)