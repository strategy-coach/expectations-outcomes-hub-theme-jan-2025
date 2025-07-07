---
FII: TC-EOH-002
groupId: GRP-EOH-AUTH
title: Verify Invalid Login Credentials Handling
created_by: "qa-lead@eoh-theme.demo"
created_at: "2024-01-15"
test_type: "Automation"
tags: ["login", "negative-testing", "security", "demo"]
priority: "High"
demo_notice: "⚠️ DEMO DATA - Synthetic test case for demonstration purposes"
---

### Description

To verify that the EOH theme authentication system properly handles invalid login credentials and provides appropriate error messages without exposing sensitive information.

### Pre-Conditions:

- The EOH theme application is deployed and accessible
- The login page is functional and accessible
- Invalid test credentials are prepared for testing
- Error handling mechanisms are implemented

### Test Steps:

1. **Step 1**: Navigate to the EOH theme login page
   - **URL**: `https://eoh-demo.example.com/login`
   - **Expected**: Login form is displayed correctly

2. **Step 2**: Enter invalid email address
   - **Email**: `invalid.user@nonexistent.domain`
   - **Password**: `AnyPassword123!`
   - **Action**: Click "Sign In" button

3. **Step 3**: Verify appropriate error handling
   - **Expected**: Generic error message displayed
   - **Expected**: No specific information about email existence
   - **Expected**: Form remains accessible for retry

4. **Step 4**: Test with valid email but invalid password
   - **Email**: `stakeholder.demo@eoh-theme.demo`
   - **Password**: `WrongPassword123!`
   - **Action**: Click "Sign In" button

5. **Step 5**: Verify security measures
   - **Expected**: Account lockout after multiple failed attempts
   - **Expected**: Rate limiting on authentication attempts
   - **Expected**: No sensitive information in error responses

### Expected Result:

- **HTTP Status Code**: 401 Unauthorized for invalid credentials
- **Error Response**: 
  - Generic error message: "Invalid email or password"
  - No indication of whether email exists
  - No exposure of system internals
- **Security Measures**:
  - Rate limiting active after multiple attempts
  - Account lockout mechanism functioning
  - Proper logging of failed attempts
- **User Experience**:
  - Clear but secure error messaging
  - Form remains usable for retry
  - No system information disclosure

### Post-Conditions:

- User remains unauthenticated
- Failed login attempts are properly logged
- Security measures are triggered appropriately
- System remains secure against brute force attacks

---
**Demo Context**: This test case demonstrates proper security testing for authentication failures. All test scenarios use synthetic credentials to showcase secure error handling practices.
