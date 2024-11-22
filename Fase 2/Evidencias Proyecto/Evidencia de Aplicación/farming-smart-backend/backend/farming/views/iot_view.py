from rest_framework import viewsets

from farming.models.iot_model import IOT
from farming.serializers.iot_serializer import IOTSerializer


class IOTViewSet(viewsets.ModelViewSet):
    queryset = IOT.objects.all()
    serializer_class = IOTSerializer
