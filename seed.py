import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import engine, Base
from sqlalchemy.orm import Session
from app.seed import seed_database

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        seed_database(db)
