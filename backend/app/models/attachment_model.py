from backend.app.extensions.db import db
from enum import Enum
from sqlalchemy.sql import func

class AttachmentEntityType(Enum):
    TASK = "task"
    PROJECT = "project"
    COMMENT = "comment"


class Attachment(db.Model):
    __tablename__ = "attachment"

    id = db.Column(db.Integer, primary_key=True)
    file_url = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255))
    file_type = db.Column(db.String(100))

    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id", ondelete="CASCADE"))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"))
    comment_id = db.Column(db.Integer, db.ForeignKey("comments.id", ondelete="CASCADE"))
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    task = db.relationship("Task", back_populates="attachments")
    project = db.relationship("Project", back_populates="attachments")
    comment = db.relationship("Comment", back_populates="attachments")
    created_by = db.relationship("User", foreign_keys=[created_by_id], backref="created_attachments")
