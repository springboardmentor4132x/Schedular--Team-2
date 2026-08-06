"""add publishing_logs + analytics tables and missing indexes

Revision ID: 9c1f7e5a3b20
Revises: dbbb4b69339c
Create Date: 2026-08-06 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c1f7e5a3b20'
down_revision: Union[str, Sequence[str], None] = 'dbbb4b69339c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── publishing_logs (Module 5) ──────────────────────────────────────
    op.create_table('publishing_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=True),
        sa.Column('platform', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('response', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_publishing_logs_post_id'), 'publishing_logs', ['post_id'], unique=False)

    # ── Module 6 analytics tables ───────────────────────────────────────
    op.create_table('post_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('likes', sa.Integer(), nullable=False),
        sa.Column('comments', sa.Integer(), nullable=False),
        sa.Column('shares', sa.Integer(), nullable=False),
        sa.Column('saves', sa.Integer(), nullable=False),
        sa.Column('reach', sa.Integer(), nullable=False),
        sa.Column('impressions', sa.Integer(), nullable=False),
        sa.Column('clicks', sa.Integer(), nullable=False),
        sa.Column('engagement_rate', sa.Float(), nullable=False),
        sa.Column('last_synced', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('post_id', name='post_analytics_post_id_key')
    )
    op.create_index(op.f('ix_post_analytics_id'), 'post_analytics', ['id'], unique=False)

    op.create_table('audience_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('social_account_id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('followers', sa.Integer(), nullable=False),
        sa.Column('new_followers', sa.Integer(), nullable=False),
        sa.Column('lost_followers', sa.Integer(), nullable=False),
        sa.Column('gender_distribution', sa.Text(), nullable=True),
        sa.Column('age_distribution', sa.Text(), nullable=True),
        sa.Column('country_distribution', sa.Text(), nullable=True),
        sa.Column('city_distribution', sa.Text(), nullable=True),
        sa.Column('language_distribution', sa.Text(), nullable=True),
        sa.Column('most_active_hours', sa.Text(), nullable=True),
        sa.Column('most_active_days', sa.Text(), nullable=True),
        sa.Column('last_synced', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['social_account_id'], ['social_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('social_account_id', name='audience_analytics_social_account_id_key')
    )
    op.create_index(op.f('ix_audience_analytics_id'), 'audience_analytics', ['id'], unique=False)

    op.create_table('campaign_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('total_posts', sa.Integer(), nullable=False),
        sa.Column('reach', sa.Integer(), nullable=False),
        sa.Column('impressions', sa.Integer(), nullable=False),
        sa.Column('engagement', sa.Integer(), nullable=False),
        sa.Column('clicks', sa.Integer(), nullable=False),
        sa.Column('roi', sa.Float(), nullable=False),
        sa.Column('completion_percentage', sa.Float(), nullable=False),
        sa.Column('last_synced', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('campaign_id', name='campaign_analytics_campaign_id_key')
    )
    op.create_index(op.f('ix_campaign_analytics_id'), 'campaign_analytics', ['id'], unique=False)

    op.create_table('platform_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('social_account_id', sa.Integer(), nullable=False),
        sa.Column('platform_name', sa.String(length=50), nullable=False),
        sa.Column('followers', sa.Integer(), nullable=False),
        sa.Column('reach', sa.Integer(), nullable=False),
        sa.Column('impressions', sa.Integer(), nullable=False),
        sa.Column('engagement', sa.Integer(), nullable=False),
        sa.Column('clicks', sa.Integer(), nullable=False),
        sa.Column('snapshot_date', sa.Date(), nullable=False),
        sa.Column('last_synced', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['social_account_id'], ['social_accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_platform_analytics_id'), 'platform_analytics', ['id'], unique=False)
    op.create_index(op.f('ix_platform_analytics_snapshot_date'), 'platform_analytics', ['snapshot_date'], unique=False)

    # ── notifications table (missing from earlier migrations) ───────────
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=True),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=True),
        sa.Column('read', sa.Boolean(), nullable=True),
        sa.Column('signature', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_signature'), 'notifications', ['signature'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index('ix_notifications_user_id_read', 'notifications', ['user_id', 'read'], unique=False)

    # ── posts table publishing modifications (Module 5) ─────────────────
    op.add_column('posts', sa.Column('published_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('posts', sa.Column('failure_reason', sa.String(length=500), nullable=True))
    op.add_column('posts', sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('posts', sa.Column('platform_post_id', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('api_response', sa.Text(), nullable=True))

    # ── Query-optimization indexes on existing tables ───────────────────
    op.create_index(op.f('ix_posts_status'), 'posts', ['status'], unique=False)
    op.create_index(op.f('ix_posts_published_at'), 'posts', ['published_at'], unique=False)


def downgrade() -> None:
    op.drop_column('posts', 'api_response')
    op.drop_column('posts', 'platform_post_id')
    op.drop_column('posts', 'retry_count')
    op.drop_column('posts', 'failure_reason')
    op.drop_column('posts', 'published_at')

    op.drop_index(op.f('ix_posts_published_at'), table_name='posts')
    op.drop_index(op.f('ix_posts_status'), table_name='posts')
    op.drop_index('ix_notifications_user_id_read', table_name='notifications')
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_signature'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')

    op.drop_index(op.f('ix_platform_analytics_snapshot_date'), table_name='platform_analytics')
    op.drop_index(op.f('ix_platform_analytics_id'), table_name='platform_analytics')
    op.drop_table('platform_analytics')

    op.drop_index(op.f('ix_campaign_analytics_id'), table_name='campaign_analytics')
    op.drop_table('campaign_analytics')

    op.drop_index(op.f('ix_audience_analytics_id'), table_name='audience_analytics')
    op.drop_table('audience_analytics')

    op.drop_index(op.f('ix_post_analytics_id'), table_name='post_analytics')
    op.drop_table('post_analytics')

    op.drop_index(op.f('ix_publishing_logs_post_id'), table_name='publishing_logs')
    op.drop_table('publishing_logs')
