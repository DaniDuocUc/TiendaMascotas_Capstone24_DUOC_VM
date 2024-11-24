from django.urls import path, include
from rest_framework.routers import DefaultRouter

from farming.views.iot_view import IOTViewSet
from farming.views.quadrant_view import QuadrantViewSet

router = DefaultRouter()
router.register(r"quadrants", QuadrantViewSet)
router.register(r"iots", IOTViewSet)

urlpatterns = [
    path("v1/", include(router.urls)),
]
