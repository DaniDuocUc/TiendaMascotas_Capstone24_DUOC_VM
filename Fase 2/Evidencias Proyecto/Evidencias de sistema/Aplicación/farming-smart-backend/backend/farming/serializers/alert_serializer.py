from rest_framework import serializers

from farming.models.alert_model import Alert


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            "id",
            "message",
            "level",
            "min_humidity",
            "max_humidity",
            "min_temperature",
            "max_temperature",
        ]
