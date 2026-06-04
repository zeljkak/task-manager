from app.extensions.db import db
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

class ActivityLog(db.Model):
    __tablename__ = "activity_log"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)

    action = db.Column(db.String(50), nullable=False)

    field = db.Column(db.String(50))

    old_value = db.Column(JSONB)
    new_value = db.Column(JSONB)

    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user = db.relationship("User")
    task = db.relationship("Task")