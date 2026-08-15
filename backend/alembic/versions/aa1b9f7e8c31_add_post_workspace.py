"""add post workspace scope

Revision ID: aa1b9f7e8c31
Revises: 8efde741079e
"""
from alembic import op
import sqlalchemy as sa

revision = "aa1b9f7e8c31"
down_revision = "8efde741079e"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("posts", sa.Column("workspace_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_posts_workspace_id", "posts", "workspaces", ["workspace_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_posts_workspace_id", "posts", ["workspace_id"])

def downgrade():
    op.drop_index("ix_posts_workspace_id", table_name="posts")
    op.drop_constraint("fk_posts_workspace_id", "posts", type_="foreignkey")
    op.drop_column("posts", "workspace_id")
