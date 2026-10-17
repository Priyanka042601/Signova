import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.configuration.settings import settings

logger = logging.getLogger("signova.database")

# Database URL
DATABASE_URL = settings.DATABASE_URL

# SQLite configuration
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency that yields a database session and ensures it is closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_migrations():
    """
    Lightweight, safe migration utility that ensures newer columns exist in database tables.
    Particularly useful when running against an existing SQLite file without full Alembic migration runs.
    """
    try:
        with engine.connect() as conn:
            # Check users table schema
            if "sqlite" in DATABASE_URL:
                cursor = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in cursor.fetchall()]
                
                if columns:
                    if "clerk_id" not in columns:
                        logger.info("Migrating schema: adding clerk_id to users table")
                        conn.execute(text("ALTER TABLE users ADD COLUMN clerk_id VARCHAR(100)"))
                        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_clerk_id ON users(clerk_id)"))
                    
                    if "email" not in columns:
                        logger.info("Migrating schema: adding email to users table")
                        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255)"))
                        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_email ON users(email)"))

                    if "role" not in columns:
                        logger.info("Migrating schema: adding role to users table")
                        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'learner'"))

                    if "updated_at" not in columns:
                        logger.info("Migrating schema: adding updated_at to users table")
                        conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME"))

                    conn.commit()
    except Exception as e:
        logger.warning(f"Database schema migration notice: {e}")
