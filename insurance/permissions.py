# insurance/permissions.py
from rest_framework import permissions


class IsFarmer(permissions.BasePermission):
    """
    Permission to only allow farmers to access
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'farmer'


class IsVet(permissions.BasePermission):
    """
    Permission to only allow vets to access
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'vet'


class IsAdmin(permissions.BasePermission):
    """
    Permission to only allow admins to access
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsFarmerOrVet(permissions.BasePermission):
    """
    Permission to allow farmers and vets to access
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['farmer', 'vet', 'admin']
        )


class IsVetOrAdmin(permissions.BasePermission):
    """
    Permission to allow vets and admins to access
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['vet', 'admin']
        )


class IsFarmerOwner(permissions.BasePermission):
    """
    Object-level permission to only allow farmers to edit their own enrollments/claims
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.farmer == request.user
