import eventlet

eventlet.monkey_patch()

from backend.app import create_app

app = create_app()

## USE THIS FOR PRODUCTION. RUN WITH:
# gunicorn --worker-class eventlet -w 1 backend.wsgi:app
