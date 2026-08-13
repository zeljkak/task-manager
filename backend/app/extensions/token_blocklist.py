from backend.app.models.revoked_token_model import RevokedToken

def add_jti_to_blocklist(jti: str, exp_timestamp: float) -> bool:
    # adds a JTI to the database blocklist
    # returns True if successfully added or False if the JTI already exists or fails
    return RevokedToken.add_jti(str(jti), float(exp_timestamp))

def is_jti_blocklisted(jti: str) -> bool:
    # checks if a JTI exists in the blocklist (or auto-cleaned)
    # returns True on DB errors
    return RevokedToken.is_jti_blocklisted(str(jti))