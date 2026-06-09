from backend.app.extensions.db import db

task_relations = db.Table(
    "task_relations",
    db.Column("task_id", db.Integer, db.ForeignKey("tasks.id"), primary_key=True),
    db.Column("related_task_id", db.Integer, db.ForeignKey("tasks.id"), primary_key=True)
)

task_followers = db.Table(
    "task_followers",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("task_id", db.Integer, db.ForeignKey("tasks.id"), primary_key=True)
)