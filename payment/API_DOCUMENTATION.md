# Payment API Documentation

## Base URL
```
http://localhost:8000/api/v1/payment/
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Initiate Payment

Create a new payment transaction and get eSewa payment form data.

**Endpoint:** `POST /payments/initiate/`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 1000,
  "product_code": "INSURANCE_PREMIUM",
  "product_description": "Premium for livestock insurance",
  "tax_amount": 0
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | decimal | Yes | Payment amount (must be > 0) |
| product_code | string | Yes | One of: INSURANCE_PREMIUM, APPOINTMENT_FEE, CONSULTATION_FEE, OTHER |
| product_description | string | No | Description of the product/service |
| tax_amount | decimal | No | Tax amount (default: 0) |

**Success Response (201 Created):**
```json
{
  "success": true,
  "payment_id": 1,
  "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payment_data": {
    "amount": "1000",
    "tax_amount": "0",
    "total_amount": "1000",
    "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "product_code": "INSURANCE_PREMIUM",
    "product_service_charge": "0",
    "product_delivery_charge": "0",
    "success_url": "http://localhost:3000/payment/success",
    "failure_url": "http://localhost:3000/payment/failure",
    "signed_field_names": "total_amount,transaction_uuid,product_code",
    "signature": "base64_encoded_signature"
  },
  "esewa_url": "https://uat.esewa.com.np/epay/main"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "errors": {
    "amount": ["Amount must be greater than 0"],
    "product_code": ["Invalid product code"]
  }
}
```

**Usage:**
1. Call this endpoint to initiate payment
2. Use the returned `payment_data` to create an HTML form
3. Submit the form to `esewa_url` to redirect user to eSewa

---

### 2. Verify Payment

Verify payment after eSewa callback.

**Endpoint:** `POST /payments/verify/`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "ref_id": "0007KBI"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transaction_uuid | string | Yes | Transaction UUID from initiate response |
| ref_id | string | Yes | eSewa reference ID from callback |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": 1,
  "status": "completed",
  "esewa_ref_id": "0007KBI"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "error": "Payment not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Payment verification failed",
  "error": "Verification failed"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 3. Get Payment History

Retrieve payment history for the authenticated user.

**Endpoint:** `GET /payments/history/`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "payments": [
    {
      "id": 1,
      "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": "1000.00",
      "total_amount": "1000.00",
      "product_code": "INSURANCE_PREMIUM",
      "status": "completed",
      "esewa_ref_id": "0007KBI",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T10:35:00Z",
      "user_name": "farmer1"
    },
    {
      "id": 2,
      "transaction_uuid": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
      "amount": "500.00",
      "total_amount": "500.00",
      "product_code": "APPOINTMENT_FEE",
      "status": "completed",
      "esewa_ref_id": "0007KBJ",
      "created_at": "2024-01-14T14:20:00Z",
      "completed_at": "2024-01-14T14:25:00Z",
      "user_name": "farmer1"
    }
  ]
}
```

---

### 4. Check Payment Status

Check the status of a specific payment.

**Endpoint:** `GET /payments/{payment_id}/status_check/`

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| payment_id | integer | ID of the payment |

**Success Response (200 OK):**
```json
{
  "success": true,
  "payment_id": 1,
  "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "amount": "1000.00",
  "product_code": "INSURANCE_PREMIUM",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:35:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Not found."
}
```

---

### 5. List Payments

List all payments (admin sees all, users see only their own).

**Endpoint:** `GET /payments/`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number for pagination |
| page_size | integer | Number of results per page |
| status | string | Filter by status (pending, completed, failed, refunded) |
| product_code | string | Filter by product code |

**Success Response (200 OK):**
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/v1/payment/payments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 1,
      "user_name": "farmer1",
      "user_full_name": "John Doe",
      "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": "1000.00",
      "tax_amount": "0.00",
      "total_amount": "1000.00",
      "product_code": "INSURANCE_PREMIUM",
      "product_description": "Premium for livestock insurance",
      "status": "completed",
      "esewa_ref_id": "0007KBI",
      "payment_method": "esewa",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z",
      "completed_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

### 6. Get Payment Details

Retrieve details of a specific payment.

**Endpoint:** `GET /payments/{payment_id}/`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "user": 1,
  "user_name": "farmer1",
  "user_full_name": "John Doe",
  "transaction_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "amount": "1000.00",
  "tax_amount": "0.00",
  "total_amount": "1000.00",
  "product_code": "INSURANCE_PREMIUM",
  "product_description": "Premium for livestock insurance",
  "status": "completed",
  "esewa_ref_id": "0007KBI",
  "payment_method": "esewa",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z",
  "completed_at": "2024-01-15T10:35:00Z"
}
```

---

## Payment Status Values

| Status | Description |
|--------|-------------|
| pending | Payment initiated but not completed |
| completed | Payment verified and successful |
| failed | Payment verification failed |
| refunded | Payment has been refunded |

---

## Product Code Values

| Code | Description |
|------|-------------|
| INSURANCE_PREMIUM | Insurance premium payments |
| APPOINTMENT_FEE | Veterinary appointment fees |
| CONSULTATION_FEE | Consultation fees |
| OTHER | Other miscellaneous payments |

---

## Complete Payment Flow Example

### Step 1: Initiate Payment (Frontend)

```javascript
const initiatePayment = async (amount, productCode) => {
  const response = await fetch('http://localhost:8000/api/v1/payment/payments/initiate/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount,
      product_code: productCode,
      product_description: 'Payment description'
    })
  });
  
  const data = await response.json();
  return data;
};
```

### Step 2: Redirect to eSewa (Frontend)

```javascript
const redirectToEsewa = (paymentData, esewaUrl) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = esewaUrl;
  
  Object.keys(paymentData).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = paymentData[key];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
};
```

### Step 3: Handle eSewa Callback (Frontend)

```javascript
// On success page (e.g., /payment/success)
const urlParams = new URLSearchParams(window.location.search);
const transactionUuid = urlParams.get('oid');
const refId = urlParams.get('refId');

// Verify payment
const verifyPayment = async () => {
  const response = await fetch('http://localhost:8000/api/v1/payment/payments/verify/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transaction_uuid: transactionUuid,
      ref_id: refId
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Payment verified successfully
    console.log('Payment completed!');
  } else {
    // Payment verification failed
    console.error('Payment failed');
  }
};
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (payment initiated) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (not allowed to access this payment) |
| 404 | Not Found (payment doesn't exist) |
| 500 | Internal Server Error |

---

## Rate Limiting

- Anonymous users: 1000 requests/hour
- Authenticated users: 10000 requests/hour

---

## Notes

1. All amounts are in Nepali Rupees (NPR)
2. Decimal values support up to 2 decimal places
3. Transaction UUIDs are automatically generated
4. Payments cannot be manually created (security measure)
5. Only the payment owner or admin can view payment details
6. Payment verification must be done within reasonable time after eSewa callback
