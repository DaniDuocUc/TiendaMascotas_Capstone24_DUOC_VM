from rest_framework import serializers
from farming.models.product_model import Product
from farming.serializers.alert_serializer import AlertSerializer


class ProductSerializer(serializers.ModelSerializer):
    alerts = AlertSerializer(many=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "alerts",
        ]
