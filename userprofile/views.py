from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import update_session_auth_hash
from .models import UserProfile
from .serializers import (
    UserProfileSerializer,
    UpdateProfileSerializer,
    UpdatePreferencesSerializer,
    ChangePasswordSerializer
)


class GetOrCreateProfileView(APIView):
    """
    GET: Retrieve the logged-in user's profile.
    Creates profile if it doesn't exist.
    Only returns data for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get or create profile for the user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        serializer = UserProfileSerializer(profile, context={'request': request})
        
        return Response({
            'success': True,
            'message': 'Profile retrieved successfully' if not created else 'Profile created successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """
    PUT/PATCH: Update the logged-in user's profile information.
    Only allows updating editable fields (bio, location, gender, profile_image).
    Cannot update CustomUser fields (username, email, etc.).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def put(self, request):
        return self._update_profile(request, partial=False)
    
    def patch(self, request):
        return self._update_profile(request, partial=True)
    
    def _update_profile(self, request, partial=False):
        user = request.user
        
        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        serializer = UpdateProfileSerializer(
            profile, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return full profile data
            full_serializer = UserProfileSerializer(profile, context={'request': request})
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': full_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UpdatePreferencesView(APIView):
    """
    PUT/PATCH: Update the logged-in user's preferences/settings.
    Only allows updating preference fields (theme, language, notifications).
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        return self._update_preferences(request, partial=False)
    
    def patch(self, request):
        return self._update_preferences(request, partial=True)
    
    def _update_preferences(self, request, partial=False):
        user = request.user
        
        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        serializer = UpdatePreferencesSerializer(
            profile, 
            data=request.data, 
            partial=partial
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return full profile data
            full_serializer = UserProfileSerializer(profile, context={'request': request})
            
            return Response({
                'success': True,
                'message': 'Preferences updated successfully',
                'data': full_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    POST: Change the logged-in user's password.
    Requires old password verification.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            # Verify old password
            if not user.check_password(old_password):
                return Response({
                    'success': False,
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            # Update session to prevent logout
            update_session_auth_hash(request, user)
            
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DeleteProfileImageView(APIView):
    """
    DELETE: Remove the logged-in user's profile image.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        
        try:
            profile = UserProfile.objects.get(user=user)
            
            if profile.profile_image:
                # Delete the image file
                profile.profile_image.delete(save=False)
                profile.profile_image = None
                profile.save()
                
                return Response({
                    'success': True,
                    'message': 'Profile image deleted successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': 'No profile image to delete'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except UserProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
