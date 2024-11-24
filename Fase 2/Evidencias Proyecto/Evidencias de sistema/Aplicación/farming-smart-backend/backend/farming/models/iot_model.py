from django.db import models
from django.contrib.gis.db import models as gis_models

from .base_model import BaseModel


class IOT(BaseModel):
    id = models.CharField(max_length=100, primary_key=True, unique=False)
    location = gis_models.PointField(null=True, blank=True)
    activate = models.BooleanField(default=True)

    def __str__(self):
        return f"IOT Device {self.id} | Active: {self.activate} | Deleted: {self.deleted_at}"

    def reactivate(self):
        self.activate = True
        self.deleted_at = None
        self.save()

    def deactivate(self):
        self.activate = False
        self.save()
