import asyncio
import logging

from app.database.database import SessionLocal
from app.services import publishing_service

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 30


async def start_publishing_worker():
    """Runs forever, polling the publishing queue every POLL_INTERVAL_SECONDS."""
    while True:
        db = SessionLocal()
        try:
            publishing_service.process_publishing_queue(db)
        except Exception:
            logger.exception("Error while processing publishing queue")
        finally:
            db.close()
        await asyncio.sleep(POLL_INTERVAL_SECONDS)