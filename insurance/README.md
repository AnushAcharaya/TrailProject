# Insurance Backend API

Complete Django REST Framework backend for the livestock insurance system.

## Models

### 1. InsurancePlan
- Insurance plan options (Basic, Standard, Premium, Comprehensive)
- Coverage amount, premium amount, description
- Coverage types: death, theft, disease, accident, natural disaster
- Waiting period configuration

### 2. Enrollment
- Links farmer, livestock, and insurance plan
- Status: Active, Pending, Expired, Cancelled
- Start/end dates, premium payment tracking
- Unique constraint: one enrollment per livestock-plan-date combination

### 3. Claim
- Insurance claim submission and tracking
- Claim types: Death, Theft, Disease, Accident, Natural Disaster, Other
- Status flow: Submitted → Under Review → Pending Verification → Verified → Approved/Rejected → Paid
- Vet verification with notes
- Admin approval with approved amount
- File upload support for supporting documents

## API Endpoints

### Insurance Plans
- `GET /api/v1/insurance/plans/` - List all active plans
- `GET /api/v1/insurance/plans/{id}/` - Get plan details

### Enrollments (Farmer only)
- `GET /api/v1/insurance/enrollments/` - List farmer's enrollments
- `POST /api/v1/insurance/enrollments/` - Create new enrollment
- `GET /api/v1/insurance/enrollments/{id}/` - Get enrollment details
- `PUT/PATCH /api/v1/insurance/enrollments/{id}/` - Update enrollment
- `DELETE /api/v1/insurance/enrollments/{id}/` - Delete enrollment
- `GET /api/v1/insurance/enrollments/active/` - Get active enrollments
- `POST /api/v1/insurance/enrollments/{id}/cancel/` - Cancel enrollment

### Claims (Farmer, Vet, Admin)
- `GET /api/v1/insurance/claims/` - List claims (filtered by role)
- `POST /api/v1/insurance/claims/` - Create new claim (Farmer)
- `GET /api/v1/insurance/claims/{id}/` - Get claim details
- `PUT/PATCH /api/v1/insurance/claims/{id}/` - Update claim
- `DELETE /api/v1/insurance/claims/{id}/` - Delete claim
- `GET /api/v1/insurance/claims/my_claims/` - Get farmer's claims
- `GET /api/v1/insurance/claims/pending_verification/` - Get claims pending vet verification
- `POST /api/v1/insurance/claims/{id}/verify/` - Vet verifies claim
- `POST /api/v1/insurance/claims/{id}/update_status/` - Admin updates claim status
- `GET /api/v1/insurance/claims/stats/` - Get claim statistics
- `GET /api/v1/insurance/claims/by_status/?status=Submitted` - Filter by status

## Permissions

- **IsFarmer**: Only farmers can access
- **IsVet**: Only vets can access
- **IsAdmin**: Only admins can access
- **IsFarmerOrVet**: Farmers, vets, and admins can access
- **IsVetOrAdmin**: Vets and admins can access
- **IsFarmerOwner**: Object-level permission for farmer's own data

## Filters

### Enrollment Filters
- `status` - Filter by enrollment status
- `plan_type` - Filter by plan type
- `livestock_species` - Filter by livestock species
- `start_date_after`, `start_date_before` - Date range filters
- `end_date_after`, `end_date_before` - Date range filters

### Claim Filters
- `status` - Filter by claim status
- `claim_type` - Filter by claim type
- `farmer_name` - Search by farmer name
- `incident_date_after`, `incident_date_before` - Date range filters
- `min_amount`, `max_amount` - Amount range filters
- `livestock_tag` - Filter by livestock tag number

## Setup Instructions

1. **Add to INSTALLED_APPS** (already done):
```python
INSTALLED_APPS = [
    ...
    'insurance',
]
```

2. **Add to URLs** (already done):
```python
path('api/v1/insurance/', include('insurance.urls')),
```

3. **Run migrations**:
```bash
python manage.py makemigrations insurance
python manage.py migrate
```

4. **Create sample insurance plans** (optional):
```bash
python manage.py shell
```
```python
from insurance.models import InsurancePlan

InsurancePlan.objects.create(
    name="Basic Protection",
    plan_type="basic",
    coverage_amount=500.00,
    premium_amount=50.00,
    description="Basic coverage for livestock",
    covers_death=True,
    waiting_period_days=30
)

InsurancePlan.objects.create(
    name="Standard Coverage",
    plan_type="standard",
    coverage_amount=1000.00,
    premium_amount=100.00,
    description="Standard coverage with disease protection",
    covers_death=True,
    covers_disease=True,
    waiting_period_days=30
)

InsurancePlan.objects.create(
    name="Premium Plan",
    plan_type="premium",
    coverage_amount=1500.00,
    premium_amount=150.00,
    description="Premium coverage with theft protection",
    covers_death=True,
    covers_disease=True,
    covers_theft=True,
    waiting_period_days=15
)

InsurancePlan.objects.create(
    name="Comprehensive Protection",
    plan_type="comprehensive",
    coverage_amount=2000.00,
    premium_amount=200.00,
    description="Complete coverage for all risks",
    covers_death=True,
    covers_disease=True,
    covers_theft=True,
    covers_accident=True,
    covers_natural_disaster=True,
    waiting_period_days=15
)
```

## Data Flow

### Farmer Enrollment Flow
1. Farmer views available insurance plans
2. Farmer selects livestock and plan
3. Farmer submits enrollment
4. Enrollment status: Pending → Active (after payment)

### Claim Submission Flow
1. Farmer submits claim with details and documents
2. Status: Submitted
3. Admin reviews: Submitted → Under Review → Pending Verification
4. Vet verifies: Pending Verification → Verified/Rejected
5. Admin approves: Verified → Approved/Rejected
6. Payment processed: Approved → Paid

## Testing

Test the API using tools like Postman or curl:

```bash
# Get all plans
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/insurance/plans/

# Create enrollment
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"livestock": 1, "plan": 1, "start_date": "2024-01-01", "end_date": "2024-12-31", "premium_paid": 100.00}' \
  http://localhost:8000/api/v1/insurance/enrollments/

# Submit claim
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"enrollment": 1, "claim_type": "Disease", "claim_amount": 500.00, "incident_date": "2024-03-01", "incident_location": "Farm", "description": "Livestock fell ill"}' \
  http://localhost:8000/api/v1/insurance/claims/

# Get claim stats
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/insurance/claims/stats/
```

## Notes

- All monetary values are in NPR (Nepalese Rupees)
- File uploads are stored in `media/insurance/claims/`
- Claim amount cannot exceed plan coverage amount
- Only active enrollments can have claims
- Vets can only verify claims in "Pending Verification" status
- Admins have full access to all claims and can update any status
