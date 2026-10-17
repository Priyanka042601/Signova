# Backward compatibility shim
from app.configuration.database import Base, engine, SessionLocal, get_db, run_migrations, DATABASE_URL

__all__ = ["Base", "engine", "SessionLocal", "get_db", "run_migrations", "DATABASE_URL"]
