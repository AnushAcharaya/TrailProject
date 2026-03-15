# appointment/permissions.py
from rest_framework import permissions


class AppointmentPermission(permissions.BasePermission):
    """
    Custom permission for appointments:
    - Farmers can create and view their own appointments
    - Vets can view and manage appointments assigned to them
    - Admins can do everything
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins can do everything
        if request.user.is_staff:
            return True
        
        # Farmers can create and list
        if request.user.role == 'farmer':
            return view.action in ['create', 'list', 'retrieve', 'stats', 'cancel']
        
        # Vets can list, retrieve, and manage
        if request.user.role == 'vet':
            return view.action in ['list', 'retrieve', 'update', 'partial_update', 
                                   'stats', 'update_status', 'approve', 'decline', 'complete']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins can do everything
        if request.user.is_staff:
            return True
        
        # Farmers can only access their own appointments
        if request.user.role == 'farmer':
            return obj.farmer == request.user
        
        # Vets can only access appointments assigned to them
        if request.user.role == 'vet':
            return obj.veterinarian == request.user
        
        return False
