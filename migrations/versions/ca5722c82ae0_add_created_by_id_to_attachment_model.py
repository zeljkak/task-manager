"""add created_by_id to attachment model

Revision ID: ca5722c82ae0
Revises: 4ecb7a1e5537
Create Date: 2026-06-18 14:31:46.550130

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ca5722c82ae0'
down_revision = '4ecb7a1e5537'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('attachment', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created_by_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            'attachment_created_by_id_fkey',
            'users',
            ['created_by_id'],
            ['id']
        )

def downgrade():
    with op.batch_alter_table('attachment', schema=None) as batch_op:
        batch_op.drop_constraint('attachment_created_by_id_fkey', type_='foreignkey')
        batch_op.drop_column('created_by_id')
