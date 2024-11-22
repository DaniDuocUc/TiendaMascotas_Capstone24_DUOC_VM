from django.db import models
from .base_model import BaseModel


class Alert(BaseModel):
    LEVEL_CHOICES = [
        ("info", "Info"),
        ("warning", "Warning"),
        ("critical", "Critical"),
    ]
    message = models.CharField(max_length=255, null=True, blank=True)
    level = models.CharField(
        max_length=10, choices=LEVEL_CHOICES, default="info"
    )
    # Range fields for humidity
    min_humidity = models.FloatField()  # Minimum humidity percentage
    max_humidity = models.FloatField()  # Maximum humidity percentage

    # Range fields for temperature
    min_temperature = (
        models.FloatField()
    )  # Minimum temperature in Celsius or Fahrenheit
    max_temperature = (
        models.FloatField()
    )  # Maximum temperature in Celsius or Fahrenheit

    def __str__(self):
        return f"{self.id} | {self.level}"

    def is_humidity_within_range(self, humidity):
        """Check if a given humidity value is within the alert's range."""
        return self.min_humidity <= humidity <= self.max_humidity

    def is_temperature_within_range(self, temperature):
        """Check if a given temperature value is within the alert's range."""
        return self.min_temperature <= temperature <= self.max_temperature
