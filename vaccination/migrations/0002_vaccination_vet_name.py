# Generated migration file

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vaccination', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='vaccination',
            name='vet_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
