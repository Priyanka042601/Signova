from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.configuration.settings import settings
from app.configuration.database import engine, Base, SessionLocal, run_migrations
from app.seed import seed_database
from app.utils.logger import logger
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.error_handlers import register_error_handlers
from app.routes import (
    health,
    auth,
    curriculum,
    lessons,
    signs,
    practice,
    revision,
    profile,
    conversation
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")
    
    # Run automatic schema migrations for newer columns (e.g. clerk_id, email, role)
    run_migrations()
    
    # Create tables if not present
    Base.metadata.create_all(bind=engine)
    
    # Seed authentic ISL curriculum if database is fresh
    with SessionLocal() as db:
        seed_database(db)
        
    logger.info("Database initialized and ISL curriculum verified.")
    yield
    # Shutdown lifecycle
    logger.info(f"Stopping {settings.APP_NAME}...")

app = FastAPI(
    title="Signova API — Indian Sign Language Learning Platform",
    description=(
        "Scalable backend architecture for Signova: gamified ISL curriculum, Clerk authentication, "
        "spaced-repetition revision, interactive conversation lab, and certified vocabulary dictionary."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Register Centralized Error Handlers
register_error_handlers(app)

# Register Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Register CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(curriculum.router, prefix="/api")
app.include_router(lessons.router, prefix="/api")
app.include_router(signs.router, prefix="/api")
app.include_router(practice.router, prefix="/api")
app.include_router(revision.router, prefix="/api")
app.include_router(conversation.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": "A New Way to Connect — Learn Indian Sign Language",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "api_status": "active"
    }
