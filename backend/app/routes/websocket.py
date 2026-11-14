from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask_socketio import disconnect

from backend.app.extensions.socketio import socketio
from backend.app.extensions.connection_manager import connection_manager


@socketio.on("connect")
def handle_connect():
    # authenticate the Socket.IO session via JWT access cookie and map by user ID
    try:
        verify_jwt_in_request(locations=["cookies"])
        user_id = int(get_jwt_identity())
    except Exception:
        return False

    connection_manager.connect(user_id, request.sid)
    return True


@socketio.on("disconnect")
def handle_disconnect():
    connection_manager.disconnect(request.sid)


@socketio.on("ping_inbox")
def handle_ping_inbox():
    # keepalive used by the client
    try:
        verify_jwt_in_request(locations=["cookies"])
        user_id = int(get_jwt_identity())
    except Exception:
        disconnect()
        return

    if connection_manager.get_sids(user_id) and request.sid not in connection_manager.get_sids(user_id):
        connection_manager.connect(user_id, request.sid)

    return {"ok": True}
