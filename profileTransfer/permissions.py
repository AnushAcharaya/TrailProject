# profileTransfer/permissions.py
from rest_framework import permissions


class TransferPermission(permissions.BasePermission):
    """
    Custom permission for transfer operations
    
    - Farmers can create, view their own transfers, and respond to received transfers
    - Admins can view all transfers and approve/reject them
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to access the view"""
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins have full access
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        
        # Farmers can access most endpoints
        if request.user.role == 'farmer':
            # Farmers cannot access admin-only endpoints
            admin_actions = ['pending_review', 'admin_approve', 'admin_reject', 'complete']
            if view.action in admin_actions:
                return False
            return True
        
        # Other roles have no access
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check if user has permission to access specific transfer"""
        # Admins have full access
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        
        # Farmers can only access transfers they're involved in
        if request.user.role == 'farmer':
            # Can view if sender or receiver
            if view.action in ['retrieve', 'list']:
                return obj.sender == request.user or obj.receiver == request.user
            
            # Can update/delete if sender and status is pending
            if view.action in ['update', 'partial_update', 'destroy', 'cancel']:
                return obj.sender == request.user and obj.status == 'Pending'
            
            # Can approve/reject if receiver and status is pending
            if view.action in ['receiver_approve', 'receiver_reject']:
                return obj.receiver == request.user and obj.status == 'Pending'
            
            return False
        
        return False


class IsFarmer(permissions.BasePermission):
    """Permission class for farmer-only endpoints"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'farmer'
        )


class IsAdmin(permissions.BasePermission):
    """Permission class for admin-only endpoints"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff)
        )
