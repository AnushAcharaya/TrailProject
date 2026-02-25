# Vaccination System - Quick Start Guide

## For Developers

### Running the System

1. **Start Backend Server**:
   ```bash
   python manage.py runserver
   ```

2. **Start Frontend** (in separate terminal):
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000/api/vaccination/`
   - Admin Panel: `http://localhost:8000/admin/`

---

## For Users

### Adding a Vaccination Record

1. Login as a farmer or vet
2. Navigate to **Vaccinations** from the sidebar
3. Click **"Add Vaccination"** button
4. Fill in the form:
   - Select livestock from dropdown
   - Enter vaccine name (e.g., "Foot and Mouth Disease Vaccine")
   - Select vaccine type (Viral/Bacterial/Clostridial)
   - Choose date given
   - Choose next due date (must be after date given)
   - Add optional notes
5. Click **"Save Vaccination"**
6. Success notification will appear
7. Auto-redirect to vaccination list

### Viewing Vaccinations

1. Navigate to **Vaccinations** page
2. View summary cards at top:
   - **Upcoming**: Vaccinations due in the future
   - **Completed**: Past vaccinations (placeholder)
   - **Overdue**: Vaccinations past due date
3. Use tabs to filter:
   - **Upcoming**: Shows future vaccinations
   - **Completed**: Shows completed vaccinations
   - **Overdue**: Shows overdue vaccinations
4. Each card shows:
   - Vaccine name and type
   - Livestock tag ID
   - Date given and due date
   - Status badge
   - Days until due
   - Notes (if any)

---

## API Endpoints

### Authentication
All endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <your_token>
```

### Endpoints

#### List All Vaccinations
```
GET /api/vaccination/
```
Returns all vaccinations for authenticated user.

#### Get Counts
```
GET /api/vaccination/counts/
```
Returns:
```json
{
  "upcoming": 5,
  "overdue": 2,
  "due_today": 1
}
```

#### Get Upcoming Vaccinations
```
GET /api/vaccination/upcoming/
```
Returns vaccinations with `next_due_date` in the future.

#### Get Overdue Vaccinations
```
GET /api/vaccination/overdue/
```
Returns vaccinations with `next_due_date` in the past.

#### Create Vaccination
```
POST /api/vaccination/
Content-Type: application/json

{
  "livestock_tag": "PT00001",
  "vaccine_name": "FMD Vaccine",
  "vaccine_type": "Viral Vaccine",
  "date_given": "2026-02-20",
  "next_due_date": "2026-08-20",
  "notes": "First dose"
}
```

#### Get Single Vaccination
```
GET /api/vaccination/{id}/
```

#### Update Vaccination
```
PUT /api/vaccination/{id}/
Content-Type: application/json

{
  "livestock_tag": "PT00001",
  "vaccine_name": "FMD Vaccine Updated",
  "vaccine_type": "Viral Vaccine",
  "date_given": "2026-02-20",
  "next_due_date": "2026-08-20",
  "notes": "Updated notes"
}
```

#### Delete Vaccination
```
DELETE /api/vaccination/{id}/
```

---

## Frontend Usage

### Import API Functions
```javascript
import {
  getAllVaccinations,
  getVaccinationCounts,
  getUpcomingVaccinations,
  getOverdueVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination
} from '../services/vaccinationApi';
```

### Example: Fetch Vaccinations
```javascript
const fetchVaccinations = async () => {
  const result = await getAllVaccinations();
  if (result.success) {
    setVaccinations(result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Example: Create Vaccination
```javascript
const handleSubmit = async (formData) => {
  const result = await createVaccination({
    livestock: 'PT00001',
    vaccineName: 'FMD Vaccine',
    vaccineType: 'Viral Vaccine',
    dateGiven: '2026-02-20',
    nextDueDate: '2026-08-20',
    notes: 'First dose'
  });
  
  if (result.success) {
    console.log('Created:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

---

## Database Queries

### Get All Vaccinations for a User
```python
from vaccination.models import Vaccination

vaccinations = Vaccination.objects.filter(user=request.user)
```

### Get Upcoming Vaccinations
```python
from django.utils import timezone

today = timezone.now().date()
upcoming = Vaccination.objects.filter(
    user=request.user,
    next_due_date__gt=today
).order_by('next_due_date')
```

### Get Overdue Vaccinations
```python
overdue = Vaccination.objects.filter(
    user=request.user,
    next_due_date__lt=today
).order_by('next_due_date')
```

### Create Vaccination
```python
from vaccination.models import Vaccination
from livestockcrud.models import Livestock

livestock = Livestock.objects.get(tag_id='PT00001')
vaccination = Vaccination.objects.create(
    livestock=livestock,
    user=request.user,
    vaccine_name='FMD Vaccine',
    vaccine_type='Viral Vaccine',
    date_given='2026-02-20',
    next_due_date='2026-08-20',
    notes='First dose'
)
```

---

## Common Tasks

### Check Vaccination Status
```python
vaccination = Vaccination.objects.get(id=1)
status = vaccination.get_status()  # 'upcoming', 'overdue', or 'due_today'
days = vaccination.days_until_due()  # Number of days (negative if overdue)
```

### Filter by Vaccine Type
```python
viral_vaccines = Vaccination.objects.filter(
    user=request.user,
    vaccine_type='Viral Vaccine'
)
```

### Search by Vaccine Name
```python
fmd_vaccines = Vaccination.objects.filter(
    user=request.user,
    vaccine_name__icontains='FMD'
)
```

---

## Troubleshooting

### Issue: Cannot create vaccination
**Check**:
1. Is user authenticated? (Token in localStorage)
2. Does livestock exist and belong to user?
3. Is next_due_date after date_given?

### Issue: Vaccinations not showing
**Check**:
1. Is user logged in?
2. Does user have any vaccinations?
3. Check browser console for errors
4. Check network tab for API responses

### Issue: 401 Unauthorized
**Fix**:
1. Check if token exists: `localStorage.getItem('token')`
2. Login again to get fresh token
3. Check token expiry

---

## Testing

### Test Vaccination Creation
```bash
# Using curl
curl -X POST http://localhost:8000/api/vaccination/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "livestock_tag": "PT00001",
    "vaccine_name": "Test Vaccine",
    "vaccine_type": "Viral Vaccine",
    "date_given": "2026-02-20",
    "next_due_date": "2026-08-20"
  }'
```

### Test Vaccination List
```bash
curl -X GET http://localhost:8000/api/vaccination/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Status Indicators

- 🟢 **Upcoming**: Next due date is in the future
- 🔴 **Overdue**: Next due date has passed
- 🟡 **Due Today**: Next due date is today

---

## Best Practices

1. **Always validate dates**: Ensure next_due_date is after date_given
2. **Add notes**: Include important details about the vaccination
3. **Regular monitoring**: Check overdue vaccinations regularly
4. **Accurate records**: Enter correct dates and vaccine information
5. **Ownership**: Users can only access their own vaccinations

---

**Need Help?** Check `VACCINATION_SYSTEM_SUMMARY.md` for detailed documentation.
