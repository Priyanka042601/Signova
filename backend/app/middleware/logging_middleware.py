import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("signova.http")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
            process_time_ms = (time.perf_counter() - start_time) * 1000.0
            
            # Don't clutter logs for static assets or simple health checks if debug is low
            if path != "/api/health":
                logger.info(
                    f"{method} {path} - Status: {response.status_code} - {process_time_ms:.1f}ms - IP: {client_host}"
                )
            return response
        except Exception as e:
            process_time_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"{method} {path} - EXCEPTION: {e} - {process_time_ms:.1f}ms - IP: {client_host}",
                exc_info=True
            )
            raise
