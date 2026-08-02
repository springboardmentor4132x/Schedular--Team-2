"""add team requests table

Business users cannot assign a marketing team directly. They submit a request
that the marketing team must approve before an active membership is created.

Revision ID: 7a9c2e4d8f1b
Revises: f5c3d9b1a742
"""
from alembic import op
import sqlalchemy as sa

revision = "7a9c2e4d8f1b"
down_revision = "f5c3d9b1a742"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "team_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("business_user_id", sa.Integer(), nullable=False),
        sa.Column("marketing_user_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("decision_note", sa.String(length=1000)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["business_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["marketing_user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_team_requests_business_user_id", "team_requests", ["business_user_id"])
    op.create_index("ix_team_requests_marketing_user_id", "team_requests", ["marketing_user_id"])


def downgrade():
    op.drop_index("ix_team_requests_marketing_user_id", table_name="team_requests")
    op.drop_index("ix_team_requests_business_user_id", table_name="team_requests")
    op.drop_table("team_requests")
