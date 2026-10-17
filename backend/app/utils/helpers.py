from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse

def success_response(data: Any, message: str = "Success", status_code: int = 200) -> Dict[str, Any]:
    """Helper to return consistent JSON response payload."""
    return {
        "status": "success",
        "message": message,
        "data": data
    }

def error_response(message: str, code: int = 400, details: Optional[Any] = None) -> JSONResponse:
    """Helper to return consistent structured error response."""
    content: Dict[str, Any] = {
        "status": "error",
        "code": code,
        "message": message
    }
    if details:
        content["details"] = details
    return JSONResponse(status_code=code, content=content)
