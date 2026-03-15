import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock

User = get_user_model()

print("=" * 60)
print("LIVESTOCK OWNERSHIP CHECK")
print("=" * 60)

# Get all farmers
farmers = User.objects.filter(role='farmer')
print(f"\nTotal farmers: {farmers.count()}")

for farmer in farmers:
    livestock_count = Livestock.objects.filter(user=farmer).count()
    owner_count = Livestock.objects.filter(owner=farmer).count()
    
    print(f"\nFarmer: {farmer.email}")
    print(f"  Livestock (user field): {livestock_count}")
    print(f"  Livestock (owner field): {owner_count}")
    
    if livestock_count > 0:
        print("  Livestock with 'user' field:")
        for l in Livestock.objects.filter(user=farmer)[:3]:
            print(f"    - {l.tag_id}: user={l.user.email if l.user else 'None'}, owner={l.owner.email if l.owner else 'None'}")
    
    if owner_count > 0:
        print("  Livestock with 'owner' field:")
        for l in Livestock.objects.filter(owner=farmer)[:3]:
            print(f"    - {l.tag_id}: user={l.user.email if l.user else 'None'}, owner={l.owner.email if l.owner else 'None'}")

print("\n" + "=" * 60)
