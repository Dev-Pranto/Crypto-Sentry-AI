from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.worker.tasks"]
)

# Optional: Add a periodic task schedule
celery.conf.beat_schedule = {
    'fetch-crypto-data-every-minute': {
        'task': 'app.worker.tasks.fetch_crypto_data',
        'schedule': crontab(minute='*'), # Runs every minute
    },
}
