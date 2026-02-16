from django.urls import path
from . import views

urlpatterns = [
    path('livestock/', views.LivestockListCreateView.as_view(), name='livestock-list-create'),
    path('livestock/<int:pk>/', views.LivestockRetrieveUpdateDestroyView.as_view(), name='livestock-detail'),
    path('species/', views.SpeciesListCreateView.as_view(), name='species-list'),
    path('breeds/', views.BreedListCreateView.as_view(), name='breed-list'),
]
