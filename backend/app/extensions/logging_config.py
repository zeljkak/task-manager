import os
import logging
from logging.handlers import RotatingFileHandler

NOISY_LOGGERS = (
    "sqlalchemy",
    "sqlalchemy.engine",
    "sqlalchemy.pool",
    "engineio",
    "socketio",
    "werkzeug",
    "urllib3",
    "flask_limiter",
)

def configure_logging(app):
    log_dir = os.path.join(app.root_path, "..", "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "backend.log")

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
    )

    file_handler = RotatingFileHandler(
        log_file, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # attach to root logger so all modules (auth.py, jwt.py, etc.) write to backend.log
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    # avoid duplicate handlers on flask debug reload
    if not any(
            isinstance(h, RotatingFileHandler) and h.baseFilename == file_handler.baseFilename
            for h in root_logger.handlers
    ):
        root_logger.addHandler(file_handler)

    for name in NOISY_LOGGERS:
        logging.getLogger(name).setLevel(logging.WARNING)