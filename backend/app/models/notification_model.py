from backend.app.extensions.db import db
from sqlalchemy.sql import func


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    # recipient of the notification
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    # user who triggered the notification
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)

    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=True, index=True)

    is_read = db.Column(db.Boolean, server_default="false", nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    recipient = db.relationship("User", foreign_keys=[user_id], backref="notifications")
    actor = db.relationship("User", foreign_keys=[actor_id])
    task = db.relationship("Task", backref="notifications")
