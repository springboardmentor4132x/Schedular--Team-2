"""enforce single marketing team per workspace

A business user may connect to only one marketing team, while a marketing
team can manage many business users. Enforce at the database level by
allowing at most one active marketing-role member per workspace.

Revision ID: f5c3d9b1a742
Revises: aa1b9f7e8c31
"""
from alembic import op
import sqlalchemy as sa

revision = "f5c3d9b1a742"
down_revision = "bc2c4d8e9f10"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index(
        "ix_workspace_members_one_marketing",
        "workspace_members",
        ["workspace_id"],
        unique=True,
        postgresql_where=sa.text("role = 'Marketing' AND status = 'Active'"),
    )


def downgrade():
    op.drop_index("ix_workspace_members_one_marketing", table_name="workspace_members")
