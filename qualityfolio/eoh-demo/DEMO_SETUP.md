# EOH Demo Qualityfolio Setup Guide

## Quick Start

Follow these steps to set up and use the EOH demo Qualityfolio dataset:

### 1. Environment Configuration

Update your `.env` file to use the demo data:

```env
# EOH Demo Qualityfolio Configuration
PUBLIC_QUALITYFOLIO_URL="http://localhost:4321/qualityfolio"
ENABLE_QUALITYFOLIO_PREPARE=true
PUBLIC_QUALITYFOLIO_DB="src/content/db/qualityfolio-demo/resource-surveillance.sqlite.db"
```

### 2. Prepare Demo Database

Run the preparation script to ingest the demo data:

```bash
# Option 1: Using npm script (recommended)
pnpm run prepare-qualityfolio-db

# Option 2: Direct Deno execution with demo parameters
deno run -A qualityfolio-surveilr-prepare.ts \
  rssdPath=src/content/db/qualityfolio-demo/resource-surveillance.sqlite.db \
  ingestDir=./qualityfolio/eoh-demo \
  enable=true
```

### 3. Start Development Server

```bash
pnpm run dev
```

### 4. Access Demo Data

Navigate to the Qualityfolio integration:
```
http://localhost:4321/qualityfolio
```

## Demo Data Overview

### Project Information
- **Project ID**: PRJ-EOH-DEMO
- **Project Name**: EOH Theme Demo Project
- **Description**: Comprehensive demonstration of EOH theme capabilities
- **Status**: Active
- **Created**: January 15, 2024

### Test Suites Available

1. **Functional Testing** (`SUT-EOH-FUNC`)
   - User authentication workflows
   - Content management operations
   - Project dashboard functionality

2. **Security Testing** (`SUT-EOH-SEC`)
   - Authentication security validation
   - SQL injection protection testing
   - Input validation and sanitization

3. **Performance Testing** (`SUT-EOH-PERF`)
   - Load testing with concurrent users
   - Scalability assessment
   - Resource utilization monitoring

4. **Integration Testing** (`SUT-EOH-INT`)
   - API integration validation
   - Third-party service integration
   - Database integration testing

5. **Compatibility Testing** (`SUT-EOH-COMPAT`)
   - Cross-browser compatibility
   - Device and platform testing
   - Responsive design validation

6. **Compliance Testing** (`SUT-EOH-COMP`)
   - Accessibility compliance (WCAG 2.1)
   - Security standards validation
   - Web standards compliance

### Sample Test Cases

#### Authentication Tests
- `TC-EOH-001`: Successful stakeholder login
- `TC-EOH-002`: Invalid credentials handling

#### Content Management Tests
- `TC-EOH-003`: Blog post creation and publishing

#### Security Tests
- `TC-EOH-SEC-001`: SQL injection protection validation

#### Performance Tests
- `TC-EOH-PERF-001`: Concurrent user load testing

## Switching Between Real and Demo Data

### Use Real Data
```bash
# Configure for real data
deno run -A qualityfolio-surveilr-prepare.ts \
  rssdPath=src/content/db/qualityfolio/resource-surveillance.sqlite.db \
  ingestDir=./qualityfolio/synthetic-asset-tracking \
  enable=true
```

### Use Demo Data
```bash
# Configure for demo data
deno run -A qualityfolio-surveilr-prepare.ts \
  rssdPath=src/content/db/qualityfolio-demo/resource-surveillance.sqlite.db \
  ingestDir=./qualityfolio/eoh-demo \
  enable=true
```

## Troubleshooting

### Database Issues
If you encounter database issues:

1. **Clear existing database**:
   ```bash
   rm -f src/content/db/qualityfolio-demo/resource-surveillance.sqlite.db
   ```

2. **Re-run preparation**:
   ```bash
   pnpm run prepare-qualityfolio-db
   ```

### Surveilr Not Found
If you get "surveilr command not found":

1. **Install Surveilr**: Follow instructions at https://www.surveilr.com/docs/core/installation/
2. **Verify installation**: `surveilr --version`

### Permission Issues
If you encounter permission issues:

```bash
# Ensure proper permissions
chmod +x qualityfolio-surveilr-prepare.ts
```

## Demo Features Showcase

### 1. **Comprehensive Test Coverage**
- View complete test suites across multiple testing categories
- Examine detailed test cases with realistic scenarios
- Review test execution results and performance metrics

### 2. **Quality Assurance Workflows**
- Explore end-to-end testing processes
- Review test planning and execution documentation
- Analyze test results and quality metrics

### 3. **Project Management Integration**
- See how testing integrates with project management
- Review stakeholder communication and reporting
- Explore project dashboard and progress tracking

### 4. **Security and Compliance**
- Examine security testing methodologies
- Review compliance validation processes
- Explore vulnerability assessment results

## Next Steps

1. **Explore the Data**: Navigate through different test suites and cases
2. **Customize for Your Needs**: Modify the demo data structure for your specific requirements
3. **Integrate with Your Workflow**: Use the demo as a template for your own testing processes
4. **Extend the Dataset**: Add additional test cases and scenarios as needed

---

**Note**: This demo data is designed for educational and demonstration purposes. All test scenarios, user data, and results are synthetic and safe for public demonstration.
