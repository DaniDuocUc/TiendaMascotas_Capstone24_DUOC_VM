from rest_framework import viewsets
from rest_framework.response import Response
from farming.models.quadrant_model import Quadrant
from farming.serializers.quadrant_serializer import QuadrantSerializer


class QuadrantViewSet(viewsets.ModelViewSet):
    queryset = Quadrant.objects.all()
    serializer_class = QuadrantSerializer

    def list(self, request, *args, **kwargs):
        queryset = Quadrant.objects.all()
        for quadrant in queryset:
            if quadrant.product and quadrant.iot:
                for alert in quadrant.product.alerts.all():
                    print(alert.message, "-", alert.level)
                    status = alert.is_humidity_within_range(
                        quadrant.iot.humidity
                    )
                    if status:
                        print("Humidity is within range")
                    else:
                        print("Humidity is not within range")
                        quadrant.status = "red"
                        quadrant.save()
        serializer = QuadrantSerializer(queryset, many=True)
        return Response(serializer.data)
