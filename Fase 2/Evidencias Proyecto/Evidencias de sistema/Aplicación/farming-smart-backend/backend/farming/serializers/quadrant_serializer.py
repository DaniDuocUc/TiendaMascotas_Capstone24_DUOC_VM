from rest_framework_gis.serializers import GeoFeatureModelSerializer
from farming.models.quadrant_model import Quadrant
from farming.serializers.iot_serializer import IOTSerializer
from farming.serializers.product_serializer import ProductSerializer
from farming.serializers.zone_serializer import ZoneSerializer


class QuadrantSerializer(GeoFeatureModelSerializer):
    zone = ZoneSerializer()
    iot = IOTSerializer()
    product = ProductSerializer()

    class Meta:
        model = Quadrant
        geo_field = "area"
        fields = ["id", "zone", "area", "status", "iot", "product"]
