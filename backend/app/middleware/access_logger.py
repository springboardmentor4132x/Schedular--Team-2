import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(
    filename="access.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s"
)

logger = logging.getLogger("access_logger")


class AccessLoggerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = round(time.time() - start_time, 4)

        ip = request.client.host if request.client else "Unknown"

        logger.info(
            f"IP={ip} | "
            f"Method={request.method} | "
            f"Path={request.url.path} | "
            f"Status={response.status_code} | "
            f"Time={process_time}s"
        )

        return response
