from backend.app.extensions.db import db
from sqlalchemy.sql import func
from backend.app.models.association_tables import task_followers, task_relations


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    updated_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    assigned_to_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    ## status will always initially be to do if not specified
    status_id = db.Column(db.Integer, db.ForeignKey("task_status.id"), nullable=False, default=2)
    priority_id = db.Column(db.Integer, db.ForeignKey("priorities.id"))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))

    due_date = db.Column(db.Date)
    estimated_hours = db.Column(db.Integer)

    is_deleted = db.Column(db.Boolean, server_default="false", nullable=False)

    created_by = db.relationship("User", foreign_keys=[created_by_id], backref="created_tasks")
    updated_by = db.relationship("User", foreign_keys=[updated_by_id], backref="updated_tasks")
    assigned_to = db.relationship("User", foreign_keys=[assigned_to_id], backref="assigned_tasks")
    status = db.relationship("TaskStatus", backref="tasks")
    priority = db.relationship("Priority", backref="tasks")
    project = db.relationship("Project", backref="tasks")

    attachments = db.relationship("Attachment", back_populates="task", cascade="all, delete-orphan")
    followers = db.relationship("User", secondary=task_followers, back_populates="followed_tasks")
    related = db.relationship("Task", secondary=task_relations, primaryjoin=id == task_relations.c.task_id, secondaryjoin=id == task_relations.c.related_task_id, backref="related_to")

    @property
    def all_related(self):
        return list(self.related) + list(self.related_to)