import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from insurance.views import EnrollmentViewSet

User = get_user_model()

# Get admin user
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    print("No admin user found!")
    exit()

print(f"Testing with admin user: {admin_user.email}")
print()

# Create a request
factory = APIRequestFactory()
request = factory.get('/api/v1/insurance/enrollments/')
request.user = admin_user

# Get the viewset
view = EnrollmentViewSet.as_view({'get': 'list'})
response = view(request)

print(f"Status Code: {response.status_code}")
print(f"Response Data: {response.data}")
