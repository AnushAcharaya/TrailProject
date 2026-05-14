from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict

from livestockcrud.models import Livestock
from medical.models import Treatment
from vaccination.models import Vaccination


class FarmerDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'farmer':
            return Response({'success': False, 'error': 'Only farmers can access this endpoint'}, status=403)

        today = timezone.now().date()

        total_livestock = Livestock.objects.filter(user=user).count()

        upcoming_vaccinations = Vaccination.objects.filter(
            user=user, next_due_date__gte=today
        ).count()

        under_treatment = Treatment.objects.filter(
            user=user, status='In Progress'
        ).count()

        overdue_vaccinations = Vaccination.objects.filter(
            user=user, next_due_date__lt=today
        ).count()

        return Response({
            'success': True,
            'data': {
                'total_livestock': total_livestock,
                'upcoming_vaccinations': upcoming_vaccinations,
                'under_treatment': under_treatment,
                'overdue_tasks': overdue_vaccinations,
            }
        })


class FarmerDashboardChartsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'farmer':
            return Response({'success': False, 'error': 'Only farmers can access this endpoint'}, status=403)

        today = timezone.now().date()

        # Livestock distribution by species
        livestock = Livestock.objects.filter(user=user).select_related('species')
        species_count = defaultdict(int)
        for animal in livestock:
            name = animal.species.name if animal.species else 'Unknown'
            species_count[name] += 1
        livestock_distribution = [{'name': k, 'value': v} for k, v in species_count.items()]

        # Monthly vaccination data — last 6 months
        monthly_data = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1, day=1)

            completed = Vaccination.objects.filter(
                user=user,
                date_given__gte=month_start,
                date_given__lt=month_end,
            ).count()

            overdue = Vaccination.objects.filter(
                user=user,
                next_due_date__gte=month_start,
                next_due_date__lt=min(month_end, today),
            ).count()

            monthly_data.append({
                'month': month_start.strftime('%b'),
                'completed': completed,
                'overdue': overdue,
            })

        return Response({
            'success': True,
            'data': {
                'livestock_distribution': livestock_distribution,
                'monthly_vaccinations': monthly_data,
            }
        })


class FarmerDashboardActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'farmer':
            return Response({'success': False, 'error': 'Only farmers can access this endpoint'}, status=403)

        activities = []

        recent_vaccinations = Vaccination.objects.filter(
            user=user
        ).select_related('livestock').order_by('-created_at')[:5]

        for v in recent_vaccinations:
            activities.append({
                'id': f'vac_{v.id}',
                'type': 'vaccination',
                'description': f'{v.vaccine_name} given to {v.livestock.tag_id}',
                'timestamp': v.created_at.isoformat(),
                'status': 'success' if v.next_due_date >= timezone.now().date() else 'warning',
            })

        recent_treatments = Treatment.objects.filter(
            user=user
        ).select_related('livestock').order_by('-created_at')[:5]

        for t in recent_treatments:
            activities.append({
                'id': f'trt_{t.id}',
                'type': 'treatment',
                'description': f'{t.treatment_name} for {t.livestock.tag_id}',
                'timestamp': t.created_at.isoformat(),
                'status': 'success' if t.status == 'Completed' else 'warning',
            })

        recent_livestock = Livestock.objects.filter(
            user=user
        ).select_related('species').order_by('-created_at')[:3]

        for l in recent_livestock:
            species = l.species.name if l.species else 'Animal'
            activities.append({
                'id': f'live_{l.id}',
                'type': 'livestock',
                'description': f'New {species} registered ({l.tag_id})',
                'timestamp': l.created_at.isoformat(),
                'status': 'success',
            })

        activities.sort(key=lambda x: x['timestamp'], reverse=True)

        return Response({'success': True, 'data': activities[:10]})
