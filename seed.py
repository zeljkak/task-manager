from app import create_app
from app.seeds.seed_roles import seed_roles
from app.seeds.seed_projects import seed_projects
from app.seeds.seed_priorities import seed_priorities
from app.seeds.seed_task_status import seed_task_status
from app.seeds.seed_users import seed_admin_user

app = create_app()

with app.app_context():
    seed_roles()
    seed_projects()
    seed_priorities()
    seed_task_status()
    seed_admin_user()

    print("Database seeded successfully!")