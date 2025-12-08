# Admin Page - Display Registered Users Fix

## Problem
The admin page was showing hardcoded dummy data instead of fetching real registered users from the database.

## Solution Implemented

### 1. Added Admin API Functions (`Frontend/src/services/api.js`)
```javascript
- fetchAllUsers() - Fetches all registered users from backend
- approveUser(userId) - Approves a user
- declineUser(userId) - Declines a user
```

All functions include JWT token authentication from localStorage.

### 2. Updated AdminPage Component (`Frontend/src/pages/AdminPage.jsx`)
**Changes:**
- Added state management for users, loading, and filtering
- Implemented `loadUsers()` function to fetch users from backend API
- Added `handleApprove()` and `handleDecline()` functions
- Created `transformUserData()` to map backend data to component format
- Replaced hardcoded data with dynamic user list
- Added loading and empty states

**Data Mapping:**
Backend → Frontend:
- `id` → `id`
- `name` (full_name) → `name`
- `role` → `role` (capitalized)
- `status` → `status` (capitalized)
- `phone` → `phone`
- `email` → `email`
- `address` → `address`
- `farmName` → `farmName` (for farmers)
- `specialization` → `specialization` (for vets)
- `submittedDate` → `submittedDate`
- `nid_photo_url` → documents array (for farmers)
- `certificate_photo_url` → documents array (for vets)

### 3. Updated FilterBar Component (`Frontend/src/components/AdminSearch.jsx`)
**Changes:**
- Added `onFilterChange` and `currentFilter` props
- Implemented `handleStatusChange()` to update filter
- Connected status dropdown to parent component

## How It Works

1. **On Page Load:**
   - AdminPage fetches all users from `/api/v1/auth/admin/users/`
   - Users are stored in state
   - Loading indicator shows while fetching

2. **Filtering:**
   - User selects status filter (All/Pending/Approved/Declined)
   - FilterBar calls `onFilterChange()`
   - AdminPage filters users and re-renders

3. **Approve/Decline:**
   - Admin clicks Approve/Decline button
   - API call made to `/api/v1/auth/admin/users/{id}/approve/` or `/decline/`
   - On success, users list is reloaded
   - UI updates with new status

## Backend API Endpoints Used

- `GET /api/v1/auth/admin/users/` - Fetch all users
- `POST /api/v1/auth/admin/users/{id}/approve/` - Approve user
- `POST /api/v1/auth/admin/users/{id}/decline/` - Decline user

## Authentication

All admin API calls include JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Token is retrieved from localStorage (set during login).

## User Data Display

**For Farmers:**
- Shows: Name, Role, Status, Phone, Email, Address, Farm Name
- Documents: NID Photo (if uploaded)

**For Veterinarians:**
- Shows: Name, Role, Status, Phone, Email, Address, Specialization
- Documents: Certificate Photo (if uploaded)

## Testing

1. Register a new user (farmer or vet)
2. Verify email and phone OTP
3. Login as admin
4. Admin page should show the registered user
5. Click Approve/Decline to change status
6. Use filter dropdown to filter by status

## Notes

- Users with role='admin' are excluded from the list (backend filter)
- Only users with status='pending', 'approved', or 'declined' are shown
- Document URLs are absolute URLs from backend
- Empty state shown when no users match filter
