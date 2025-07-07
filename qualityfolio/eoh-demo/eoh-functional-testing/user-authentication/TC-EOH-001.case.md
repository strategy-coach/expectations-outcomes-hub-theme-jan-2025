---
FII: TC-EOH-001
groupId: GRP-EOH-AUTH
title: Verify Successful Stakeholder Login to EOH Dashboard
created_by: "qa-lead@eoh-theme.demo"
created_at: "2024-01-15"
test_type: "Automation"
tags: ["login", "stakeholder", "dashboard", "demo"]
priority: "High"
demo_notice: "⚠️ DEMO DATA - Synthetic test case for demonstration purposes"
---

### Description

To verify that a project stakeholder can successfully log in to the EOH theme dashboard using valid credentials and access their personalized project information.

### Pre-Conditions:

- The EOH theme application is deployed and accessible
- The stakeholder has valid login credentials (email and password)
- The stakeholder account is active and properly configured
- The authentication API endpoint is functional and accessible
- The project dashboard is properly configured for the stakeholder's projects

### Test Steps:

1. **Step 1**: Navigate to the EOH theme login page
   - **URL**: `https://eoh-demo.example.com/login`
   - **Expected**: Login form is displayed with email and password fields

2. **Step 2**: Enter valid stakeholder credentials
   - **Email**: `stakeholder.demo@eoh-theme.demo`
   - **Password**: `SecureDemo123!`
   - **Action**: Click "Sign In" button

3. **Step 3**: Verify successful authentication and redirection
   - **Expected**: User is redirected to the personalized dashboard
   - **URL**: `https://eoh-demo.example.com/dashboard`

4. **Step 4**: Validate dashboard content and stakeholder-specific information
   - **Expected**: Dashboard displays stakeholder's assigned projects
   - **Expected**: User profile information is correctly displayed
   - **Expected**: Navigation menu shows appropriate stakeholder-level options

5. **Step 5**: Verify session establishment and security
   - **Expected**: Authentication token is properly set in browser storage
   - **Expected**: Session timeout is configured appropriately
   - **Expected**: CSRF protection is active

### Expected Result:

- **HTTP Status Code**: 200 OK for all requests
- **Authentication Response**: 
  - Successful login with valid JWT token
  - Proper session establishment
  - Secure cookie configuration
- **Dashboard Access**:
  - Stakeholder-specific project information displayed
  - Appropriate navigation and menu options
  - Personalized welcome message with stakeholder name
- **Security Validation**:
  - Secure token handling and storage
  - Proper HTTPS enforcement
  - CSRF protection active

### Post-Conditions:

- Stakeholder is successfully authenticated and logged into the system
- Dashboard displays current project status and relevant information
- User session is properly established with appropriate timeout settings
- All subsequent requests include proper authentication headers

### Test Data:

```json
{
  "test_user": {
    "email": "stakeholder.demo@eoh-theme.demo",
    "password": "SecureDemo123!",
    "role": "stakeholder",
    "projects": ["EOH-DEMO-PROJECT-001", "EOH-DEMO-PROJECT-002"],
    "name": "Demo Stakeholder",
    "organization": "Demo Organization Inc."
  }
}
```

---
**Demo Context**: This test case demonstrates comprehensive authentication testing for stakeholder users in the EOH theme. All user data is synthetic and designed for safe demonstration of real-world authentication workflows.
