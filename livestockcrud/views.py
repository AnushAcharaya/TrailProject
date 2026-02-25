from django.shortcuts import render
from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
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
            user=user
        ).select_related('species', 'breed', 'user')

    def perform_create(self, serializer):
        user = self.request.user
        
        # Generate tag_id based on farmer's name
        # Format: [FirstLetter][LastLetter][5-digit-number]
        full_name = user.full_name.strip()
        name_parts = full_name.split()
        
        if len(name_parts) >= 2:
            # Get first letter of first name and first letter of last name
            first_letter = name_parts[0][0].upper()
            last_letter = name_parts[-1][0].upper()
        else:
            # If only one name, use first and last letter of that name
            first_letter = full_name[0].upper()
            last_letter = full_name[-1].upper() if len(full_name) > 1 else full_name[0].upper()
        
        prefix = f"{first_letter}{last_letter}"
        
        # Get the count of existing livestock for this user to generate next number
        existing_count = Livestock.objects.filter(user=user).count()
        next_number = existing_count + 1
        
        # Generate tag_id with 5-digit number (padded with zeros)
        tag_id = f"{prefix}{next_number:05d}"
        
        # Ensure uniqueness (in case of concurrent requests or deleted records)
        while Livestock.objects.filter(tag_id=tag_id).exists():
            next_number += 1
            tag_id = f"{prefix}{next_number:05d}"
        
        serializer.save(user=user, tag_id=tag_id)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def preview_next_tag_id(request):
    """Preview what the next tag ID will be for the current user"""
    user = request.user
    
    # Generate tag_id preview based on farmer's name
    full_name = user.full_name.strip()
    name_parts = full_name.split()
    
    if len(name_parts) >= 2:
        first_letter = name_parts[0][0].upper()
        last_letter = name_parts[-1][0].upper()
    else:
        first_letter = full_name[0].upper()
        last_letter = full_name[-1].upper() if len(full_name) > 1 else full_name[0].upper()
    
    prefix = f"{first_letter}{last_letter}"
    
    # Get the count of existing livestock for this user
    existing_count = Livestock.objects.filter(user=user).count()
    next_number = existing_count + 1
    
    # Generate preview tag_id
    tag_id = f"{prefix}{next_number:05d}"
    
    return Response({'tag_id': tag_id})

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
