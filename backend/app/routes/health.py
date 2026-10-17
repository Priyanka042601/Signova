from fastapi import APIRouter
from app.configuration.settings import settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health", summary="Service health status")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }
