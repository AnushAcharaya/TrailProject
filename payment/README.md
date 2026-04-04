# Payment Module - eSewa Integration

This module handles eSewa payment gateway integration for the livestock management system.

## Features

- eSewa payment initiation
- Payment verification
- Payment history tracking
- Transaction management
- Support for multiple product types (Insurance, Appointments, Consultations)

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
ESEWA_MERCHANT_ID=your_merchant_id_here
ESEWA_SECRET_KEY=your_secret_key_here
ESEWA_SUCCESS_URL=http://localhost:3000/payment/success
ESEWA_FAILURE_URL=http://localhost:3000/payment/failure
ESEWA_PAYMENT_URL=https://uat.esewa.com.np/epay/main
```

**Note**: For production, change `ESEWA_PAYMENT_URL` to `https://esewa.com.np/epay/main`

### 2. Get eSewa Credentials

1. Visit [eSewa Merchant Portal](https://merchant.esewa.com.np/)
2. Register as a merchant
3. Get your Merchant ID and Secret Key
4. For testing, use UAT (User Acceptance Testing) credentials

### 3. Run Migrations

```bash
python manage.py makemigrations payment
python manage.py migrate payment
```

## API Endpoints

### Base URL: `/api/v1/payment/`

### 1. Initiate Payment

**POST** `/api/v1/payment/payments/initiate/`

Initiates a new payment transaction.

**Request Body:**
```json
{
  "amount": 1000,
  "product_code": "INSURANCE_PREMIUM",
  "product_description": "Insurance premium payment",
  "tax_amount": 0
}
```

**Product Codes:**
- `INSURANCE_PREMIUM` - Insurance premium payments
- `APPOINTMENT_FEE` - Appointment booking fees
- `CONSULTATION_FEE` - Consultation fees
- `OTHER` - Other payments

**Response:**
```json
{
  "success": true,
  "payment_id": 1,
  "transaction_uuid": "uuid-here",
  "payment_data": {
    "amount": "1000",
    "tax_amount": "0",
    "total_amount": "1000",
    "transaction_uuid": "uuid-here",
    "product_code": "INSURANCE_PREMIUM",
    "product_service_charge": "0",
    "product_delivery_charge": "0",
    "success_url": "http://localhost:3000/payment/success",
    "failure_url": "http://localhost:3000/payment/failure",
    "signed_field_names": "total_amount,transaction_uuid,product_code",
    "signature": "generated-signature"
  },
  "esewa_url": "https://uat.esewa.com.np/epay/main"
}
```

### 2. Verify Payment

**POST** `/api/v1/payment/payments/verify/`

Verifies payment after eSewa callback.

**Request Body:**
```json
{
  "transaction_uuid": "uuid-here",
  "ref_id": "esewa-reference-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": 1,
  "status": "completed",
  "esewa_ref_id": "esewa-reference-id"
}
```

### 3. Payment History

**GET** `/api/v1/payment/payments/history/`

Get payment history for the current user.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "payments": [
    {
      "id": 1,
      "transaction_uuid": "uuid-here",
      "amount": "1000.00",
      "total_amount": "1000.00",
      "product_code": "INSURANCE_PREMIUM",
      "status": "completed",
      "esewa_ref_id": "ref-id",
      "created_at": "2024-01-01T10:00:00Z",
      "completed_at": "2024-01-01T10:05:00Z",
      "user_name": "farmer1"
    }
  ]
}
```

### 4. Check Payment Status

**GET** `/api/v1/payment/payments/{id}/status_check/`

Check the status of a specific payment.

**Response:**
```json
{
  "success": true,
  "payment_id": 1,
  "transaction_uuid": "uuid-here",
  "status": "completed",
  "amount": "1000.00",
  "product_code": "INSURANCE_PREMIUM",
  "created_at": "2024-01-01T10:00:00Z",
  "completed_at": "2024-01-01T10:05:00Z"
}
```

### 5. List All Payments (Admin)

**GET** `/api/v1/payment/payments/`

List all payments (admin users see all, regular users see only their own).

## Payment Flow

1. **Initiate Payment**
   - Frontend calls `/initiate/` endpoint
   - Backend creates payment record with status='pending'
   - Backend returns eSewa payment data

2. **Redirect to eSewa**
   - Frontend creates a form with payment data
   - Form is submitted to eSewa URL
   - User completes payment on eSewa

3. **eSewa Callback**
   - eSewa redirects to success/failure URL
   - Frontend receives transaction details
   - Frontend calls `/verify/` endpoint

4. **Verify Payment**
   - Backend verifies with eSewa server
   - Payment status updated to 'completed' or 'failed'
   - Post-payment actions triggered

## Models

### Payment Model

```python
class Payment(models.Model):
    user = ForeignKey(User)
    transaction_uuid = CharField(unique=True)
    amount = DecimalField()
    tax_amount = DecimalField()
    total_amount = DecimalField()
    product_code = CharField(choices=PRODUCT_CHOICES)
    product_description = TextField()
    status = CharField(choices=STATUS_CHOICES)
    esewa_ref_id = CharField()
    payment_method = CharField(default='esewa')
    ip_address = GenericIPAddressField()
    user_agent = TextField()
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    completed_at = DateTimeField()
```

**Status Choices:**
- `pending` - Payment initiated but not completed
- `completed` - Payment verified and completed
- `failed` - Payment verification failed
- `refunded` - Payment refunded

## Admin Panel

Access payment records through Django admin:
- URL: `/admin/payment/payment/`
- Features:
  - View all payments
  - Filter by status, product code, date
  - Search by transaction UUID, user
  - Cannot manually create payments (security)

## Security Features

1. **HMAC Signature**: All payment requests are signed with HMAC-SHA256
2. **Server Verification**: Payments are verified with eSewa server
3. **IP Tracking**: Client IP addresses are logged
4. **User Agent Tracking**: Browser information is stored
5. **Transaction UUID**: Unique identifier prevents duplicate payments

## Testing

### Test with eSewa UAT

1. Use UAT credentials from eSewa
2. Set `ESEWA_PAYMENT_URL=https://uat.esewa.com.np/epay/main`
3. Use test payment amounts (usually Rs. 10-1000)
4. eSewa provides test credentials for completing payments

### Test Endpoints

```bash
# Initiate payment
curl -X POST http://localhost:8000/api/v1/payment/payments/initiate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "product_code": "INSURANCE_PREMIUM"
  }'

# Verify payment
curl -X POST http://localhost:8000/api/v1/payment/payments/verify/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_uuid": "uuid-here",
    "ref_id": "esewa-ref-id"
  }'

# Get payment history
curl -X GET http://localhost:8000/api/v1/payment/payments/history/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration with Other Modules

### Insurance Module

When a payment for insurance premium is completed:
```python
# In payment/views.py _handle_successful_payment()
if payment.product_code == 'INSURANCE_PREMIUM':
    # Activate insurance enrollment
    # Link payment to enrollment record
    pass
```

### Appointment Module

When a payment for appointment fee is completed:
```python
if payment.product_code == 'APPOINTMENT_FEE':
    # Confirm appointment
    # Link payment to appointment record
    pass
```

## Troubleshooting

### Payment Verification Fails

1. Check eSewa credentials in `.env`
2. Verify network connectivity to eSewa servers
3. Check logs for detailed error messages
4. Ensure transaction_uuid matches

### Signature Mismatch

1. Verify `ESEWA_SECRET_KEY` is correct
2. Check that amount, transaction_uuid, and product_code match
3. Ensure no extra spaces in credentials

### Payment Stuck in Pending

1. User may have closed browser before completing payment
2. Network issues during eSewa redirect
3. Check eSewa transaction status manually
4. Can manually verify using admin panel

## Logging

Payment operations are logged with the following levels:
- `INFO`: Successful operations (initiation, verification)
- `WARNING`: Verification failures
- `ERROR`: System errors, network issues

View logs:
```bash
# Check Django logs
tail -f logs/django.log

# Or use Django's logging
python manage.py shell
>>> import logging
>>> logger = logging.getLogger('payment')
```

## Production Checklist

- [ ] Update `ESEWA_MERCHANT_ID` with production credentials
- [ ] Update `ESEWA_SECRET_KEY` with production key
- [ ] Change `ESEWA_PAYMENT_URL` to production URL
- [ ] Update success/failure URLs to production frontend
- [ ] Enable HTTPS for all payment endpoints
- [ ] Set up proper logging and monitoring
- [ ] Configure payment notification webhooks
- [ ] Test with small amounts first
- [ ] Set up backup payment verification cron job
- [ ] Configure payment reconciliation reports

## Support

For eSewa integration issues:
- eSewa Merchant Support: merchant@esewa.com.np
- eSewa Documentation: https://developer.esewa.com.np/

For module issues:
- Check Django logs
- Review payment records in admin panel
- Contact system administrator
