from datetime import datetime, timezone
from sqlalchemy.sql import func, text
from backend.app.extensions.db import db

class Token(db.Model):
    __tablename__ = "tokens"

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False) # email_verify / password_reset / account_restore
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), server_default=func.now() + text("INTERVAL '15 minutes'"), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = db.relationship("User", backref=db.backref("tokens", cascade="all, delete-orphan"))

    def is_expired(self):
        return datetime.now(timezone.utc) > self.expires_at.astimezone(timezone.utc)