from backend.app.models.revoked_token_model import RevokedToken
import traceback
import logging
from flask import request, has_request_context

logger = logging.getLogger(__name__)

def add_jti_to_blocklist(jti: str, exp_timestamp: float) -> bool:
    # adds a JTI to the database blocklist
    # returns True if successfully added or False if the JTI already exists or fails

    jti_str = str(jti)
    exp_float = float(exp_timestamp)
    path = request.path if has_request_context() else "no-request"

    logger.info("BLOCKLIST ADD ATTEMPT jti=%s exp=%s path=%s", jti_str, exp_float, path)
    try:
        added = RevokedToken.add_jti(jti_str, exp_float)
        logger.info("BLOCKLIST ADD RESULT jti=%s added=%s path=%s", jti_str, added, path)
        if not added:
            stack_summary = "".join(traceback.format_stack(limit=6)).strip()
            logger.warning(
                "BLOCKLIST ALREADY PRESENT OR FAILED jti=%s path=%s\n%s",
                jti_str,
                path,
                stack_summary,
            )
        else:
            stack_summary = "".join(traceback.format_stack(limit=5)).strip()
            logger.debug(
                "BLOCKLIST ADDED FROM jti=%s path=%s\n%s",
                jti_str,
                path,
                stack_summary,
            )
        return added
    except Exception as e:
        logger.exception("BLOCKLIST ERROR jti=%s path=%s", jti_str, path)
        return False

def is_jti_blocklisted(jti: str) -> bool:
    # checks if a JTI exists in the blocklist (or auto-cleaned)
    # returns True on DB errors

    jti_str = str(jti)
    path = request.path if has_request_context() else "no-request"

    try:
        blocked = RevokedToken.is_jti_blocklisted(jti_str)
        if blocked:
            logger.warning("BLOCKLIST HIT jti=%s path=%s", jti_str, path)
        return blocked
    except Exception:
        logger.exception("BLOCKLIST CHECK ERROR jti=%s path=%s", jti_str, path)
        return True