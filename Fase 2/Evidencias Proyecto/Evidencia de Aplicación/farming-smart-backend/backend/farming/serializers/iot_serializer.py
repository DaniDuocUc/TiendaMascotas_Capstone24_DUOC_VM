from rest_framework import serializers

from farming.models.iot_model import IOT


class IOTSerializer(serializers.ModelSerializer):
    class Meta:
        model = IOT
        fields = [
            "id",
            "location",
        ]
