import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Configure for eager mode (no broker needed for development)
app.conf.update(
    task_always_eager=True,
    task_eager_propagates=True,
    broker_connection_retry_on_startup=False,
)

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
