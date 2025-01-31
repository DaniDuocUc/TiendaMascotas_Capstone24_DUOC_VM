# Generated by Django 5.1.1 on 2024-09-24 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("farming", "0004_remove_alert_product_product_alerts"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="alerts",
            field=models.ManyToManyField(
                blank=True, related_name="products", to="farming.alert"
            ),
        ),
    ]
