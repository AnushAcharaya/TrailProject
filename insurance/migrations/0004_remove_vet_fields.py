# Generated migration to remove vet-related fields from Claim model

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('insurance', '0003_rename_supporting_document_to_incident_image'),
    ]

    operations = [
        # Remove vet-related fields
        migrations.RemoveField(
            model_name='claim',
            name='veterinarian',
        ),
        migrations.RemoveField(
            model_name='claim',
            name='vet_notes',
        ),
        migrations.RemoveField(
            model_name='claim',
            name='verification_date',
        ),
        # Remove the veterinarian index
        migrations.AlterIndexTogether(
            name='claim',
            index_together=set(),
        ),
    ]
