"""Initial authentication schema for customers, managers, and refresh tokens

Revision ID: 001_initial_auth_schema
Revises: 
Create Date: 2026-08-31 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_auth_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create Enums
    manager_status_enum = postgresql.ENUM('PENDING', 'APPROVED', 'REJECTED', name='manager_status_enum')
    manager_status_enum.create(op.get_bind(), checkfirst=True)

    user_type_enum = postgresql.ENUM('CUSTOMER', 'MANAGER', name='user_type_enum')
    user_type_enum.create(op.get_bind(), checkfirst=True)

    # 1. Customers Table
    op.create_table(
        'customers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_customers_email', 'customers', ['email'], unique=True)

    # 2. Managers Table
    op.create_table(
        'managers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column(
            'status',
            sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='manager_status_enum'),
            nullable=False,
            server_default='PENDING'
        ),
        sa.Column('requested_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('requested_role_note', sa.Text(), nullable=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('managers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('managers.id', ondelete='SET NULL'), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_managers_email', 'managers', ['email'], unique=True)
    op.create_index('ix_managers_status', 'managers', ['status'], unique=False)

    # 3. Refresh Tokens Table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_type', sa.Enum('CUSTOMER', 'MANAGER', name='user_type_enum'), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_refresh_tokens_token_hash', 'refresh_tokens', ['token_hash'], unique=True)
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'], unique=False)
    op.create_index('ix_refresh_tokens_user_type', 'refresh_tokens', ['user_type'], unique=False)
    op.create_index('ix_refresh_tokens_expires_at', 'refresh_tokens', ['expires_at'], unique=False)


def downgrade() -> None:
    op.drop_table('refresh_tokens')
    op.drop_table('managers')
    op.drop_table('customers')

    op.execute('DROP TYPE IF EXISTS user_type_enum')
    op.execute('DROP TYPE IF EXISTS manager_status_enum')
