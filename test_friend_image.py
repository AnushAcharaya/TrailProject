from authentication.models import CustomUser
from userprofile.models import UserProfile

user = CustomUser.objects.filter(full_name__icontains='Kamal').first()
if user:
    print(f"User: {user.username}")
    print(f"Full name: {user.full_name}")
    try:
        profile = user.profile
        print(f"Profile exists: True")
        print(f"Profile image field: {profile.profile_image}")
        if profile.profile_image:
            print(f"Profile image URL: {profile.profile_image.url}")
        else:
            print("Profile image is empty")
    except Exception as e:
        print(f"Error: {e}")
