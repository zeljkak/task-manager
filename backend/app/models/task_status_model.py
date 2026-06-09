from backend.app.extensions.db import db

class TaskStatus(db.Model):
    __tablename__ = "task_status"

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(50), unique=True, nullable=False)