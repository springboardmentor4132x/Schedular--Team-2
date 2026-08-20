"""add business work requests and brand guidelines

Revision ID: bc2c4d8e9f10
Revises: aa1b9f7e8c31
"""
from alembic import op
import sqlalchemy as sa
revision = "bc2c4d8e9f10"
down_revision = "aa1b9f7e8c31"
branch_labels = None
depends_on = None
def upgrade():
    op.create_table("work_requests", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("workspace_id", sa.Integer(), nullable=False), sa.Column("business_user_id", sa.Integer(), nullable=False), sa.Column("status", sa.String(length=20), nullable=False), sa.Column("details", sa.Text(), nullable=False), sa.Column("decision_note", sa.String(length=1000)), sa.Column("reviewed_by_id", sa.Integer()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")), sa.ForeignKeyConstraint(["workspace_id"],["workspaces.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["business_user_id"],["users.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["reviewed_by_id"],["users.id"], ondelete="SET NULL"))
    op.create_index("ix_work_requests_workspace_id", "work_requests", ["workspace_id"])
def downgrade():
    op.drop_index("ix_work_requests_workspace_id", table_name="work_requests")
    op.drop_table("work_requests")
