import time
import logging
from sqlalchemy.exc import IntegrityError
from backend.app.extensions.db import db

logger = logging.getLogger(__name__)

class RevokedToken(db.Model):
    __tablename__ = 'revoked_tokens'

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), unique=True, nullable=False, index=True)
    exp = db.Column(db.Float, nullable=False)

    @classmethod
    def add_jti(cls, jti: str, exp_timestamp: float):
        #inserts a revoked JTI, returns True on success or False if the JTI already exists
        try:
            token = cls(jti=jti, exp=exp_timestamp)
            db.session.add(token)
            db.session.commit()
            return True
        except IntegrityError:
            db.session.rollback()
            return False
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to add JTI {jti} to blocklist: {e}")
            return False

    @classmethod
    def is_jti_blocklisted(cls, jti: str) -> bool:
        #checks if JTI is blocklisted, returns True if a db error occurs
        try:
            token = cls.query.filter_by(jti=jti).first()
            if not token:
                return False

            # Auto-clean expired entries
            if time.time() > token.exp:
                db.session.delete(token)
                db.session.commit()
                return False

            return True
        except Exception as e:
            logger.error(f"Error checking blocklist status for JTI {jti}: {e}")
            return True

    @classmethod
    def delete_expired_tokens(cls) -> int:
        #utility method for cleanup, should be scheduled
        try:
            now = time.time()
            deleted = cls.query.filter(cls.exp < now).delete()
            db.session.commit()
            return deleted
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to clean up expired JTIs: {e}")
            return 0