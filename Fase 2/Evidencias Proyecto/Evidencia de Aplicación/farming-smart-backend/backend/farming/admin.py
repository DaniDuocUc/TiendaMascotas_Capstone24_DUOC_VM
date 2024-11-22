from django.contrib import admin
from leaflet.admin import LeafletGeoAdmin

from farming.models.iot_model import IOT
from farming.models.product_model import Product
from farming.models.quadrant_model import save_quadrants, Quadrant
from farming.models.zone_model import Zone
from farming.services.iot_service import check_if_model_exists


# Register your models here.


@admin.register(Product)
class ProductModelAdmin(admin.ModelAdmin):
    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields.remove("deleted_at")
        return fields


@admin.register(IOT)
class IOTModelAdmin(LeafletGeoAdmin):
    list_display = ("id", "activate", "deleted_at")
    change_form_template = "admin/backend/change_form.html"
    actions = None

    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields.remove("deleted_at")
        if obj and obj.deleted_at is None or obj is None:
            fields.remove("activate")
        return fields

    def get_actions(self, request):
        actions = super().get_actions(request)
        if "delete_selected" in actions:
            del actions["delete_selected"]
        return actions

    def has_delete_permission(self, request, obj=None):
        if obj and obj.deleted_at is not None:
            return False
        return super().has_delete_permission(request, obj)

    def delete_model(self, request, obj):
        exists_and_deleted = check_if_model_exists(obj.id)
        if exists_and_deleted:
            print("IOT Device Exists and is marked as deleted")
            pass
        else:
            obj.delete()
            obj.deactivate()
            print("IOT Device Deleted")
            obj.save()

    def save_model(self, request, obj, form, change):
        exists_and_deleted = check_if_model_exists(obj.id)
        if exists_and_deleted:
            print("IOT Device Exists and is marked as deleted")
            if obj.activate:
                print("IOT Device is being activated")
                obj.reactivate()
        else:
            print("Deleted at is None")
            obj.deleted_at = None
        obj.save()
        super().save_model(request, obj, form, change)


@admin.register(Zone)
class ZoneModelAdmin(LeafletGeoAdmin):
    change_form_template = "admin/backend/change_form.html"

    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields.remove("deleted_at")
        return fields

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.autogenerate_quadrants:
            obj.calculate_area_in_m2()
            quadrants = obj.generate_quadrants_from_polygon()
            save_quadrants(quadrants, obj)
        obj.save()


@admin.register(Quadrant)
class QuadrantModelAdmin(LeafletGeoAdmin):
    change_form_template = "admin/backend/change_form.html"

    def get_fields(self, request, obj=None):
        fields = super().get_fields(request, obj)
        fields.remove("deleted_at")
        return fields
