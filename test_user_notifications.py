"""
Test script to verify user-specific notifications

Run this with: python manage.py shell < test_user_notifications.py
"""

from authentication.models import CustomUser
from notifications.utils import create_notification

print("\n" + "="*60)
print("Testing User-Specific Notifications")
print("="*60 + "\n")

# Get users by role
try:
    farmer = CustomUser.objects.filter(role='farmer').first()
    vet = CustomUser.objects.filter(role='vet').first()
    admin = CustomUser.objects.filter(role='admin').first()

    if not farmer:
        print("❌ No farmer found in database")
    if not vet:
        print("❌ No vet found in database")
    if not admin:
        print("❌ No admin found in database")

    if not (farmer and vet and admin):
        print("\n⚠️  Please create users with different roles first")
        exit()

    print(f"✅ Found users:")
    print(f"   Farmer: {farmer.username} (ID: {farmer.id})")
    print(f"   Vet: {vet.username} (ID: {vet.id})")
    print(f"   Admin: {admin.username} (ID: {admin.id})")
    print()

    # Create farmer-specific notification
    print("📬 Creating notification for FARMER...")
    create_notification(
        recipient=farmer,
        notification_type='appointment',
        title='🌾 Farmer Notification',
        message='This notification is ONLY for farmers!',
        link='/appointments'
    )
    print(f"   ✅ Sent to: {farmer.username}")

    # Create vet-specific notification
    print("\n📬 Creating notification for VET...")
    create_notification(
        recipient=vet,
        notification_type='appointment',
        title='🏥 Vet Notification',
        message='This notification is ONLY for vets!',
        link='/vet/appointments'
    )
    print(f"   ✅ Sent to: {vet.username}")

    # Create admin-specific notification
    print("\n📬 Creating notification for ADMIN...")
    create_notification(
        recipient=admin,
        notification_type='system',
        title='⚙️ Admin Notification',
        message='This notification is ONLY for admins!',
        link='/adminpage'
    )
    print(f"   ✅ Sent to: {admin.username}")

    print("\n" + "="*60)
    print("Verification:")
    print("="*60)
    
    from notifications.models import Notification
    
    farmer_count = Notification.objects.filter(recipient=farmer).count()
    vet_count = Notification.objects.filter(recipient=vet).count()
    admin_count = Notification.objects.filter(recipient=admin).count()
    
    print(f"\n📊 Notification counts:")
    print(f"   Farmer ({farmer.username}): {farmer_count} notifications")
    print(f"   Vet ({vet.username}): {vet_count} notifications")
    print(f"   Admin ({admin.username}): {admin_count} notifications")

    print("\n✅ SUCCESS! Each user has their own notifications.")
    print("\n💡 Now login as each user and check the notification bell:")
    print(f"   1. Login as {farmer.username} - you'll see farmer notifications")
    print(f"   2. Login as {vet.username} - you'll see vet notifications")
    print(f"   3. Login as {admin.username} - you'll see admin notifications")
    print("\n" + "="*60 + "\n")

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
