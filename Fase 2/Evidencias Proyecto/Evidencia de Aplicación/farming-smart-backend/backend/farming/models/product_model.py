from django.db import models

from .alert_model import Alert
from .base_model import BaseModel


class Product(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True, default="...")
    alerts = models.ManyToManyField(Alert, related_name="products", blank=True)

    def __str__(self):
        return self.name
