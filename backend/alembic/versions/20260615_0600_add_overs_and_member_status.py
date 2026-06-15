"""add overs_per_innings and member status

Revision ID: a1b2c3d4e5f6
Revises: dfdccfd1d5de
Create Date: 2026-06-15 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = 'dfdccfd1d5de'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('matches', sa.Column('overs_per_innings', sa.Integer(), server_default='16', nullable=False))
    op.add_column('team_members', sa.Column('status', sa.String(20), server_default='available', nullable=False))


def downgrade() -> None:
    op.drop_column('matches', 'overs_per_innings')
    op.drop_column('team_members', 'status')
