"""add publishing_queue table

Revision ID: dbbb4b69339c
Revises: 7a9c2e4d8f1b
Create Date: 2026-08-06 00:31:52.712609

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'dbbb4b69339c'
down_revision: Union[str, Sequence[str], None] = '7a9c2e4d8f1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('publishing_queue',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('processing_status', sa.String(length=30), nullable=False),
        sa.Column('execution_priority', sa.Integer(), nullable=False),
        sa.Column('retry_count', sa.Integer(), nullable=False),
        sa.Column('max_retries', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_queue_polling', 'publishing_queue', ['processing_status', 'scheduled_time'], unique=False)
    op.create_index(op.f('ix_publishing_queue_id'), 'publishing_queue', ['id'], unique=False)
    op.create_index(op.f('ix_publishing_queue_processing_status'), 'publishing_queue', ['processing_status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_publishing_queue_processing_status'), table_name='publishing_queue')
    op.drop_index(op.f('ix_publishing_queue_id'), table_name='publishing_queue')
    op.drop_index('idx_queue_polling', table_name='publishing_queue')
    op.drop_table('publishing_queue')