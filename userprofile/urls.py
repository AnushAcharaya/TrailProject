from django.urls import path
from .views import (
    GetOrCreateProfileView,
    UpdateProfileView,
    UpdatePreferencesView,
    ChangePasswordView,
    DeleteProfileImageView,
    GetAllVetsView
)

app_name = 'userprofile'

urlpatterns = [
    # Get or create profile (GET)
    path('', GetOrCreateProfileView.as_view(), name='get-profile'),
    
    # Update profile information (PUT/PATCH)
    path('update/', UpdateProfileView.as_view(), name='update-profile'),
    
    # Update preferences/settings (PUT/PATCH)
    path('preferences/', UpdatePreferencesView.as_view(), name='update-preferences'),
    
    # Change password (POST)
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Delete profile image (DELETE)
    path('delete-image/', DeleteProfileImageView.as_view(), name='delete-profile-image'),
    
    # Get all vets (GET) - for farmers to view and book appointments
    path('vets/', GetAllVetsView.as_view(), name='get-all-vets'),
]
