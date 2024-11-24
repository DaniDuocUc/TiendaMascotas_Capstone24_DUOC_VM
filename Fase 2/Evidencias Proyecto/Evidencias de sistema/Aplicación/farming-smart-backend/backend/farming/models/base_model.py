from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True, default=None)

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        print("delete")
        self.deleted_at = timezone.now()
        self.save()
        return self

    def save(
        self,
        force_insert=False,
        force_update=False,
        using=None,
        update_fields=None,
    ):
        self.updated_at = timezone.now()
        super().save(force_insert, force_update, using, update_fields)

    def update(self, **kwargs):
        for field, value in kwargs.items():
            setattr(self, field, value)
        self.save()
        return self
