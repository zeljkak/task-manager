from collections import defaultdict
from threading import Lock


class ConnectionManager:
    # maps authenticated user IDs to active Socket.IO session IDs

    def __init__(self):
        self._user_sids = defaultdict(set)
        self._sid_users = {}
        self._lock = Lock()

    def connect(self, user_id: int, sid: str) -> None:
        with self._lock:
            user_id = int(user_id)
            self._user_sids[user_id].add(sid)
            self._sid_users[sid] = user_id

    def disconnect(self, sid: str) -> None:
        with self._lock:
            user_id = self._sid_users.pop(sid, None)
            if user_id is None:
                return
            sids = self._user_sids.get(user_id)
            if not sids:
                return
            sids.discard(sid)
            if not sids:
                self._user_sids.pop(user_id, None)

    def get_sids(self, user_id: int) -> set[str]:
        with self._lock:
            return set(self._user_sids.get(int(user_id), set()))

    def is_connected(self, user_id: int) -> bool:
        return bool(self.get_sids(user_id))


connection_manager = ConnectionManager()
