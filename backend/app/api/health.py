from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Signova Indian Sign Language Learning API",
        "version": "1.0.0"
    }
