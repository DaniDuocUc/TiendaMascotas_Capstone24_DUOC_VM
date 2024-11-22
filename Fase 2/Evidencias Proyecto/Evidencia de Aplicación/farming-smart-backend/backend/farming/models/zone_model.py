from django.contrib.gis.geos import Polygon
from django.db import models
from django.contrib.gis.db import models as gis_models

from .base_model import BaseModel


class Zone(BaseModel):
    name = models.CharField(
        max_length=255, null=True, default="Zone 01"
    )  # Name of the zone
    address = models.CharField(
        max_length=255, null=True, default="Test 01"
    )  # Address of the zone
    autogenerate_quadrants = models.BooleanField(
        default=True
    )  # Auto-generate quadrants
    square_meters = models.FloatField(
        null=True, default=10
    )  # Total area in square meters
    num_quadrants = models.IntegerField(
        default=1
    )  # Number of quadrants to create
    area = gis_models.PolygonField()  # Using PolygonField for the zone's area

    def __str__(self):
        return self.name

    def calculate_area_in_m2(self):
        if self.area.srid != 3857:
            self.area.transform(
                3857
            )  # Transforma a un sistema de coordenadas basado en metros.
        self.square_meters = round(self.area.area / 10000, 2)

    def generate_quadrants_from_polygon(self):
        if self.area.srid != 3857:
            self.area = self.area.transform(3857)
        min_x, min_y, max_x, max_y = self.area.extent  # xmin, ymin, xmax, ymax

        width = max_x - min_x
        height = max_y - min_y

        rows = int(self.num_quadrants**0.5)
        cols = int(self.num_quadrants / rows)

        quadrants = []

        for i in range(rows):
            for j in range(cols):
                # Calcular los límites de cada cuadrante
                x1 = min_x + j * (width / cols)
                x2 = min_x + (j + 1) * (width / cols)
                y1 = min_y + i * (height / rows)
                y2 = min_y + (i + 1) * (height / rows)

                quadrant_polygon = Polygon(
                    ((x1, y1), (x2, y1), (x2, y2), (x1, y2), (x1, y1)),
                    srid=3857,
                )
                quadrant_polygon.transform(4326)
                quadrants.append(quadrant_polygon)
        return quadrants
