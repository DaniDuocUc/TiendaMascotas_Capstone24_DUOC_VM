from rest_framework import serializers

from farming.models.zone_model import Zone


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = ["id", "name", "area", "square_meters"]
