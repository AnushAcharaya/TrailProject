from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf.urls.static import static


schema_view = get_schema_view(
    openapi.Info(
        title="Livestock API",
        default_version='v1',
        description="API documentation for user authentication, farmer & vet modules.",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/profile/', include('userprofile.urls')),  # User profile management
    path('auth/', include('social_django.urls', namespace='social')),
    path('api/v1/livestock/', include('livestockcrud.urls')),
    path('api/v1/vaccination/', include('vaccination.urls')),  # Vaccination CRUD
    path('api/v1/medical/', include('medical.urls')),  # Medical history
    path('api/v1/', include('appointment.urls')),  # Appointments
    path('api/v1/insurance/', include('insurance.urls')),  # Insurance
    path('api/v1/profile-transfer/', include('profileTransfer.urls')),  # Profile Transfer
    path('api/v1/friends/', include('friends.urls')),  # Friends & Friend Requests
    path('api/v1/', include('messaging.urls')),  # Messages

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

