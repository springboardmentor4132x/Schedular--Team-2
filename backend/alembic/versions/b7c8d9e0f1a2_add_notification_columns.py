"""add notification columns (category, read_at, delivery_channel)

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2026-08-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c8d9e0f1a2'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('notifications', sa.Column('category', sa.String(length=50), nullable=True))
    op.add_column('notifications', sa.Column('read_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('notifications', sa.Column('delivery_channel', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('notifications', 'delivery_channel')
    op.drop_column('notifications', 'read_at')
    op.drop_column('notifications', 'category')
