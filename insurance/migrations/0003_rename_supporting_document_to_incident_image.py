# Generated migration to rename supporting_document to incident_image

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('insurance', '0002_claim_medical_history_claim_vaccination_history'),
    ]

    operations = [
        migrations.RenameField(
            model_name='claim',
            old_name='supporting_document',
            new_name='incident_image',
        ),
    ]
