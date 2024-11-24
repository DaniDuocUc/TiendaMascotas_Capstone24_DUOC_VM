from django.core.exceptions import ObjectDoesNotExist

from farming.models.iot_model import IOT


def check_if_model_exists(id: int) -> bool | None:
    try:
        # Look up the model by name (or any other unique field you require)
        obj = IOT.objects.get(id=id)
        # Check if the 'deleted' field is not None
        if obj.deleted_at is not None:
            return True  # The model exists and is marked as deleted
        else:
            return False  # The model exists but is not marked as deleted
    except ObjectDoesNotExist:
        return None  # The model does not exist
