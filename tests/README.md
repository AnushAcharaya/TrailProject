# Test Scripts Directory

This directory contains all test, debugging, and utility scripts for the FarmCare project.

## Directory Structure

All test and utility scripts have been organized into this single `tests/` folder for better project organization.

## Script Categories

### 🧪 Test Scripts (test_*.py)
Scripts for testing various features and API endpoints:

- **Authentication & OTP:**
  - `test_otp_system.py` - Tests OTP system (email/SMS)
  - `test_login_otp.py` - Tests login OTP flow
  - `test_email_connection.py` - Tests email configuration
  - `test_celery_email.py` - Tests Celery email tasks
  - `test_complete_email_flow.py` - Tests complete email workflow
  - `test_twilio_connection.py` - Tests Twilio SMS connection
  - `test_twilio_sms.py` - Tests Twilio SMS sending
  - `test_redis_connection.py` - Tests Redis connection

- **Profile & User:**
  - `test_profile_api.py` - Tests profile API endpoints
  - `test_profile_api_tokens.py` - Tests profile API with tokens
  - `test_vet_login_flow.py` - Tests vet login workflow

- **Livestock:**
  - `test_species_api.py` - Tests species API endpoints

- **Vaccination:**
  - `test_vaccination_api.py` - Tests vaccination API
  - `test_vaccination_api_endpoint.py` - Tests vaccination endpoints
  - `test_vaccination_endpoints.py` - Tests vaccination CRUD
  - `test_vaccination_get.py` - Tests vaccination retrieval
  - `test_multiple_vaccinations.py` - Tests multiple vaccination records

- **Medical/Treatment:**
  - `test_medical_auth.py` - Tests medical API authentication
  - `test_medical_treatment_create.py` - Tests treatment creation
  - `test_medical_treatment_full.py` - Tests full treatment workflow
  - `test_medicine_create_debug.py` - Debugging medicine creation
  - `test_medicine_display.py` - Tests medicine display
  - `test_medicine_save.py` - Tests medicine saving
  - `test_treatment_data_flow.py` - Tests treatment data flow
  - `test_complete_medicine_flow.py` - Tests complete medicine workflow
  - `test_create_with_medicines.py` - Tests treatment with medicines
  - `test_api_edit_flow.py` - Tests API edit operations

- **Appointments:**
  - `test_appointment_create.py` - Tests appointment creation
  - `test_appointment_integration.py` - Tests appointment integration
  - `test_farmer_appointment.py` - Tests farmer appointment flow
  - `test_vet_appointments.py` - Tests vet appointment flow

### 🔍 Check Scripts (check_*.py)
Scripts for checking database state and data integrity:

- **Database Checks:**
  - `check_database_tables.py` - Checks database table structure
  - `check_redis.py` - Checks Redis connection and data

- **User Data:**
  - `check_users.py` - Checks user accounts
  - `check_users_roles.py` - Checks user roles
  - `check_user_accounts.py` - Checks user account details
  - `check_user_data.py` - Checks user data integrity
  - `check_farmer_data.py` - Checks farmer-specific data

- **Livestock:**
  - `check_livestock_database.py` - Checks livestock database
  - `check_livestock_ownership.py` - Checks livestock ownership
  - `check_species_database.py` - Checks species data

- **Vaccination:**
  - `check_vaccination_data.py` - Checks vaccination records
  - `check_vaccination_urls.py` - Checks vaccination URL patterns

- **Medical/Treatment:**
  - `check_actual_treatments.py` - Checks actual treatment records
  - `check_treatment_dates.py` - Checks treatment date consistency
  - `check_medicine_tracking.py` - Checks medicine tracking data

- **External Services:**
  - `check_twilio_error.py` - Checks Twilio error logs
  - `check_twilio_status.py` - Checks Twilio service status

### 🐛 Debug Scripts (debug_*.py)
Scripts for debugging specific issues:

- `debug_treatment_response.py` - Debugs treatment API responses
- `debug_vaccination_get.py` - Debugs vaccination retrieval

### 🔧 Fix Scripts (fix_*.py)
Scripts for fixing data or configuration issues:

- `fix_vaccination_urls.py` - Fixes vaccination URL patterns
- `fix_treatment_dates_for_tracking.py` - Fixes treatment dates for tracking

### 📋 Diagnostic Scripts (diagnose_*.py)
Scripts for diagnosing system issues:

- `diagnose_login_otp.py` - Diagnoses login OTP issues

### ⚙️ Setup Scripts (setup_*.py)
Scripts for setting up services:

- `setup_twilio_verify.py` - Sets up Twilio Verify service

### 🔐 Enable Scripts (enable_*.py)
Scripts for enabling features:

- `enable_nepal_verify.py` - Enables Nepal phone verification

### ✅ Verify Scripts (verify_*.py)
Scripts for verifying functionality:

- `verify_edit_flow.py` - Verifies edit workflow

### 📝 Utility Scripts
Other utility scripts:

- `add_medicines_to_old_treatments.py` - Adds medicines to existing treatments
- `update_user_phone.py` - Updates user phone numbers
- `explain_medicine_issue.py` - Explains medicine-related issues

## Usage

### Running Test Scripts
```bash
# From project root
python tests/test_otp_system.py
python tests/test_vaccination_api.py
```

### Running Check Scripts
```bash
# Check database state
python tests/check_database_tables.py
python tests/check_livestock_database.py
```

### Running Fix Scripts
```bash
# Fix data issues
python tests/fix_vaccination_urls.py
python tests/fix_treatment_dates_for_tracking.py
```

## Important Notes

1. **Django Environment Required:** Most scripts require Django environment to be loaded
2. **Database Access:** Scripts interact with the actual database - use with caution
3. **Environment Variables:** Ensure `.env` file is properly configured
4. **Dependencies:** All scripts use the same `requirements.txt` from project root

## Best Practices

- Always review script code before running
- Test scripts on development database first
- Keep scripts updated as features evolve
- Document new scripts in this README
- Use descriptive names following the naming conventions

## Naming Conventions

- `test_*.py` - Testing functionality
- `check_*.py` - Checking data/state
- `debug_*.py` - Debugging issues
- `fix_*.py` - Fixing problems
- `diagnose_*.py` - Diagnosing issues
- `setup_*.py` - Setting up services
- `enable_*.py` - Enabling features
- `verify_*.py` - Verifying functionality

## Contributing

When adding new test or utility scripts:
1. Follow the naming convention
2. Add documentation at the top of the script
3. Update this README with script description
4. Place in appropriate category
