# userprofile/vet_dashboard_views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from authentication.models import CustomUser
from livestockcrud.models import Livestock
from medical.models import Treatment
from vaccination.models import Vaccination
from appointment.models import Appointment


class VetDashboardStatsView(APIView):
    """
    GET: Retrieve dashboard statistics for vet
    Returns total farmers, animals, pending treatments, and today's appointments
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Check if user is a vet
        if user.role != 'vet':
            return Response({
                'success': False,
                'error': 'Only vets can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        today = timezone.now().date()
        
        # Count farmers this vet has accepted/completed appointments with
        farmers_with_appointments = Appointment.objects.filter(
            veterinarian=user,
            status__in=['Approved', 'Completed']
        ).values('farmer').distinct().count()
        
        # Count animals this vet has treated (completed treatments)
        # Get all farmers this vet has worked with
        vet_farmers = Appointment.objects.filter(
            veterinarian=user,
            status__in=['Approved', 'Completed']
        ).values_list('farmer', flat=True).distinct()
        
        # Count completed treatments for those farmers' animals
        # Note: Treatment.status uses 'Completed' (capital C), not 'completed'
        animals_treated = Treatment.objects.filter(
            user__in=vet_farmers,
            status='Completed'
        ).values('livestock').distinct().count()
        
        # Count pending appointments (appointments waiting for vet to accept)
        pending_appointments = Appointment.objects.filter(
            veterinarian=user,
            status='Pending'
        ).count()
        
        # Count today's appointments that vet has accepted
        todays_appointments = Appointment.objects.filter(
            veterinarian=user,
            preferred_date=today,
            status__in=['Approved', 'Completed']
        ).count()
        
        return Response({
            'success': True,
            'data': {
                'total_farmers': farmers_with_appointments,
                'total_animals': animals_treated,
                'pending_treatments': pending_appointments,
                'todays_appointments': todays_appointments
            }
        }, status=status.HTTP_200_OK)


class VetDashboardActivitiesView(APIView):
    """
    GET: Retrieve recent activities for vet dashboard
    Returns recent treatments, vaccinations, and animal registrations
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Check if user is a vet
        if user.role != 'vet':
            return Response({
                'success': False,
                'error': 'Only vets can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get limit from query params (default 10)
        limit = int(request.query_params.get('limit', 10))
        
        # Get date 30 days ago
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Get farmers this vet has worked with (accepted/completed appointments)
        vet_farmers = Appointment.objects.filter(
            veterinarian=user,
            status__in=['Approved', 'Completed']
        ).values_list('farmer', flat=True).distinct()
        
        activities = []
        
        # Get recent treatments - only for farmers this vet has worked with
        recent_treatments = Treatment.objects.filter(
            user__in=vet_farmers,
            created_at__gte=thirty_days_ago
        ).select_related('livestock', 'livestock__user').order_by('-created_at')[:limit]
        
        for treatment in recent_treatments:
            activities.append({
                'id': f'treatment_{treatment.id}',
                'type': 'treatment',
                'description': f'Treated {treatment.livestock.tag_id} for {treatment.treatment_name}',
                'animal_tag': treatment.livestock.tag_id,
                'timestamp': treatment.created_at.isoformat(),
                'icon': 'treatment'
            })
        
        # Get recent vaccinations - only for farmers this vet has worked with
        recent_vaccinations = Vaccination.objects.filter(
            user__in=vet_farmers,
            created_at__gte=thirty_days_ago
        ).select_related('livestock').order_by('-created_at')[:limit]
        
        for vaccination in recent_vaccinations:
            activities.append({
                'id': f'vaccination_{vaccination.id}',
                'type': 'vaccination',
                'description': f'{vaccination.vaccine_name} given to {vaccination.livestock.tag_id}',
                'animal_tag': vaccination.livestock.tag_id,
                'timestamp': vaccination.created_at.isoformat(),
                'icon': 'vaccination'
            })
        
        # Get recent animal registrations - only for farmers this vet has worked with
        recent_animals = Livestock.objects.filter(
            user__in=vet_farmers,
            created_at__gte=thirty_days_ago
        ).select_related('user').order_by('-created_at')[:limit]
        
        for animal in recent_animals:
            farmer_name = f"{animal.user.first_name} {animal.user.last_name}" if animal.user.first_name else animal.user.username
            activities.append({
                'id': f'animal_{animal.id}',
                'type': 'new_animal',
                'description': f'New Animal ({animal.tag_id}) added for {farmer_name}',
                'animal_tag': animal.tag_id,
                'timestamp': animal.created_at.isoformat(),
                'icon': 'new_animal'
            })
        
        # Sort all activities by timestamp (most recent first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Limit to requested number
        activities = activities[:limit]
        
        return Response({
            'success': True,
            'data': activities
        }, status=status.HTTP_200_OK)


class VetDashboardAlertsView(APIView):
    """
    GET: Retrieve pending tasks and alerts for vet dashboard
    Returns overdue vaccinations and treatments needing follow-up
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Check if user is a vet
        if user.role != 'vet':
            return Response({
                'success': False,
                'error': 'Only vets can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        today = timezone.now().date()
        seven_days_from_now = today + timedelta(days=7)
        
        # Get farmers this vet has worked with (accepted/completed appointments)
        vet_farmers = Appointment.objects.filter(
            veterinarian=user,
            status__in=['Approved', 'Completed']
        ).values_list('farmer', flat=True).distinct()
        
        alerts = []
        
        # Add pending appointments for this vet
        pending_appointments = Appointment.objects.filter(
            veterinarian=user,
            status='Pending'
        ).select_related('farmer').order_by('preferred_date')
        
        for appointment in pending_appointments:
            days_until = (appointment.preferred_date - today).days
            farmer_name = f"{appointment.farmer.first_name} {appointment.farmer.last_name}" if appointment.farmer.first_name else appointment.farmer.username
            alerts.append({
                'id': f'pending_apt_{appointment.id}',
                'type': 'pending_appointment',
                'description': f'Pending appointment with {farmer_name} on {appointment.preferred_date}',
                'animal_tag': appointment.animal_type,
                'priority': 'high' if days_until <= 1 else 'medium',
                'days_until_due': days_until if days_until >= 0 else None,
                'days_overdue': abs(days_until) if days_until < 0 else None
            })
        
        # Find overdue vaccinations - only for farmers this vet has worked with
        overdue_vaccinations = Vaccination.objects.filter(
            user__in=vet_farmers,
            next_due_date__lt=today
        ).select_related('livestock')
        
        for vaccination in overdue_vaccinations:
            days_overdue = (today - vaccination.next_due_date).days
            alerts.append({
                'id': f'overdue_vac_{vaccination.id}',
                'type': 'overdue_vaccination',
                'description': f'{vaccination.vaccine_name} overdue for {vaccination.livestock.tag_id}',
                'animal_tag': vaccination.livestock.tag_id,
                'priority': 'high',
                'days_overdue': days_overdue
            })
        
        # Find treatments needing follow-up - only for farmers this vet has worked with
        upcoming_treatments = Treatment.objects.filter(
            user__in=vet_farmers,
            next_treatment_date__lte=seven_days_from_now,
            next_treatment_date__gte=today,
            status='In Progress'
        ).select_related('livestock')
        
        for treatment in upcoming_treatments:
            days_until_due = (treatment.next_treatment_date - today).days
            alerts.append({
                'id': f'followup_{treatment.id}',
                'type': 'follow_up',
                'description': f'{treatment.treatment_name} ({treatment.livestock.tag_id}) needs follow-up check-up',
                'animal_tag': treatment.livestock.tag_id,
                'priority': 'medium' if days_until_due > 2 else 'high',
                'days_until_due': days_until_due
            })
        
        # Sort by priority (high first) and then by days
        def sort_key(alert):
            priority_order = {'high': 0, 'medium': 1, 'low': 2}
            return (priority_order.get(alert['priority'], 3), 
                    alert.get('days_overdue', -alert.get('days_until_due', 0)))
        
        alerts.sort(key=sort_key)
        
        # Return top 10 alerts
        alerts = alerts[:10]
        
        return Response({
            'success': True,
            'data': alerts
        }, status=status.HTTP_200_OK)
