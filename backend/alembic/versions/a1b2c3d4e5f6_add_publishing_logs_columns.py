"""add dedicated publishing_logs columns

Revision ID: a1b2c3d4e5f6
Revises: 9c1f7e5a3b20
Create Date: 2026-08-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9c1f7e5a3b20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('publishing_logs', sa.Column('failure_reason', sa.String(length=500), nullable=True))
    op.add_column('publishing_logs', sa.Column('platform_post_id', sa.String(length=255), nullable=True))
    op.add_column('publishing_logs', sa.Column('api_response', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('publishing_logs', 'api_response')
    op.drop_column('publishing_logs', 'platform_post_id')
    op.drop_column('publishing_logs', 'failure_reason')