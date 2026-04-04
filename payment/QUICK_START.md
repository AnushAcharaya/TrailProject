# Payment Module - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Update .env File
```env
ESEWA_MERCHANT_ID=your_merchant_id
ESEWA_SECRET_KEY=your_secret_key
ESEWA_SUCCESS_URL=http://localhost:3000/payment/success
ESEWA_FAILURE_URL=http://localhost:3000/payment/failure
ESEWA_PAYMENT_URL=https://uat.esewa.com.np/epay/main
```

### 2. Migrations Already Applied ✅
```bash
# Already done during setup
python manage.py makemigrations payment
python manage.py migrate payment
```

### 3. Test the API

**Get JWT Token First:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

**Initiate Payment:**
```bash
curl -X POST http://localhost:8000/api/v1/payment/payments/initiate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"product_code":"INSURANCE_PREMIUM"}'
```

## 📋 API Endpoints Cheat Sheet

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/payment/payments/initiate/` | POST | Start payment |
| `/api/v1/payment/payments/verify/` | POST | Verify payment |
| `/api/v1/payment/payments/history/` | GET | Get history |
| `/api/v1/payment/payments/{id}/status_check/` | GET | Check status |

## 🔑 Product Codes

- `INSURANCE_PREMIUM` - Insurance payments
- `APPOINTMENT_FEE` - Appointment fees
- `CONSULTATION_FEE` - Consultation fees
- `OTHER` - Other payments

## 📊 Payment Status

- `pending` - Just created
- `completed` - Verified & successful
- `failed` - Verification failed
- `refunded` - Money returned

## 🎯 Typical Flow

```python
# 1. Initiate
POST /initiate/ → Get payment_data

# 2. Redirect user to eSewa
Submit form to esewa_url with payment_data

# 3. User pays on eSewa
eSewa redirects back with ref_id

# 4. Verify
POST /verify/ with transaction_uuid and ref_id

# 5. Done!
Payment status = 'completed'
```

## 🔧 Admin Access

Visit: `http://localhost:8000/admin/payment/payment/`

## 📖 Full Documentation

- **Complete Guide**: `payment/README.md`
- **API Details**: `payment/API_DOCUMENTATION.md`
- **Setup Summary**: `PAYMENT_BACKEND_SETUP_COMPLETE.md`

## ⚠️ Important Notes

1. **Get eSewa Credentials**: Contact eSewa for merchant account
2. **Use UAT for Testing**: Test environment before production
3. **HTTPS Required**: Production must use HTTPS
4. **Keep Secret Key Safe**: Never commit to git

## 🐛 Troubleshooting

**Payment verification fails?**
- Check eSewa credentials in .env
- Verify network connectivity
- Check Django logs

**Can't create payment?**
- Ensure user is authenticated
- Check amount is > 0
- Verify product_code is valid

## 📞 Support

- eSewa: merchant@esewa.com.np
- Docs: https://developer.esewa.com.np/

---

**That's it! You're ready to accept payments. 🎉**
