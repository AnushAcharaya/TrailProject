from django.shortcuts import render
from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Livestock, Species, Breed
from .serializers import LivestockSerializer, SpeciesSerializer, BreedSerializer
from .permissions import IsOwnerOrReadOnly

class LivestockPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class LivestockListCreateView(generics.ListCreateAPIView):
    serializer_class = LivestockSerializer
    pagination_class = LivestockPagination
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    
    filterset_fields = ['species', 'health_status', 'is_active']
    search_fields = ['tag_id', 'species__name', 'breed__name']
    ordering_fields = ['created_at', 'purchase_price', 'weight']
    
    def get_queryset(self):
        user = self.request.user
        return Livestock.objects.filter(
            user=user, is_active=True
        ).select_related('species', 'breed', 'user')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LivestockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Livestock.objects.select_related('species', 'breed', 'user')
    serializer_class = LivestockSerializer
    permission_classes = [IsOwnerOrReadOnly]

class SpeciesListCreateView(generics.ListCreateAPIView):
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']

class BreedListCreateView(generics.ListCreateAPIView):
    queryset = Breed.objects.select_related('species')
    serializer_class = BreedSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['species']
    search_fields = ['name', 'species__name']
    ordering_fields = ['name']
