from backend.app.extensions.db import db
from sqlalchemy.sql import func

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(255), nullable=False)
    project_description = db.Column(db.Text)

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    updated_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    created_by = db.relationship("User", foreign_keys=[created_by_id], backref="created_projects")
    updated_by = db.relationship("User", foreign_keys=[updated_by_id], backref="updated_projects")
