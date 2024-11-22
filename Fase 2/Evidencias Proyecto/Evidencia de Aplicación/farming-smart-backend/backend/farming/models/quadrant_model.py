from django.db import models
from django.contrib.gis.db import models as gis_models

from .iot_model import IOT
from .product_model import Product
from .zone_model import Zone
from .base_model import BaseModel


def save_quadrants(quadrants, zone: Zone):
    if zone.quadrants.exists():
        zone.quadrants.all().delete()

    for quadrant_polygon in quadrants:
        Quadrant.objects.create(
            zone=zone, area=quadrant_polygon, status="green"
        )


class Quadrant(BaseModel):
    STATUS_CHOICES = [("green", "Green"), ("yellow", "Yellow"), ("red", "Red")]
    product = models.ForeignKey(
        Product,
        related_name="quadrants",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    zone = models.ForeignKey(
        Zone, related_name="quadrants", on_delete=models.CASCADE
    )
    area = gis_models.PolygonField()
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="green"
    )
    iot = models.OneToOneField(
        IOT,
        related_name="quadrant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):
        if self.iot is None:
            return (
                f"{self.id} | {self.zone.name} | "
                f"Status {self.status} | "
                f"No Device | {self.product}"
            )
        return (
            f"{self.id} | {self.zone.name} | "
            f"Status {self.status} | "
            f"IOT Device {self.iot.id} | {self.product}"
        )
