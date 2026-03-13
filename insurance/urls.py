# insurance/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsurancePlanViewSet, EnrollmentViewSet, ClaimViewSet

router = DefaultRouter()
router.register(r'plans', InsurancePlanViewSet, basename='insurance-plan')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'claims', ClaimViewSet, basename='claim')

urlpatterns = [
    path('', include(router.urls)),
]
