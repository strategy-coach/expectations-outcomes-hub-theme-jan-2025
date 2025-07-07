---
FII: TC-EOH-003
groupId: GRP-EOH-CMS
title: Verify Blog Post Creation and Publishing Workflow
created_by: "content-lead@eoh-theme.demo"
created_at: "2024-01-15"
test_type: "Manual"
tags: ["blog", "content-creation", "publishing", "demo"]
priority: "High"
demo_notice: "⚠️ DEMO DATA - Synthetic test case for demonstration purposes"
---

### Description

To verify that content creators can successfully create, edit, and publish blog posts within the EOH theme content management system, including proper formatting, media integration, and SEO optimization.

### Pre-Conditions:

- User is authenticated with content creation permissions
- The EOH theme CMS is accessible and functional
- Blog collection is properly configured
- Media upload functionality is available
- Publishing workflow is configured

### Test Steps:

1. **Step 1**: Navigate to the blog creation interface
   - **URL**: `https://eoh-demo.example.com/admin/blog/new`
   - **Expected**: Blog creation form is displayed with all required fields

2. **Step 2**: Create a new blog post with comprehensive content
   - **Title**: "EOH Theme Demo: Streamlining Project Expectations Management"
   - **Slug**: "eoh-theme-demo-expectations-management"
   - **Content**: Rich markdown content with headers, lists, and formatting
   - **Tags**: ["project-management", "expectations", "stakeholder-communication"]
   - **Category**: "Project Updates"

3. **Step 3**: Add media content to the blog post
   - **Featured Image**: Upload demo project dashboard screenshot
   - **Inline Images**: Add 2-3 relevant images within the content
   - **Alt Text**: Provide descriptive alt text for accessibility

4. **Step 4**: Configure SEO and metadata
   - **Meta Description**: "Learn how the EOH theme streamlines project expectations management..."
   - **SEO Title**: "EOH Theme Demo: Project Expectations Management"
   - **Social Media Preview**: Configure Open Graph tags

5. **Step 5**: Save as draft and preview
   - **Action**: Save the blog post as draft
   - **Action**: Use preview functionality to review content
   - **Expected**: Content renders correctly with proper formatting

6. **Step 6**: Publish the blog post
   - **Action**: Change status from draft to published
   - **Expected**: Blog post is published and accessible via public URL
   - **Expected**: Blog appears in blog listing and RSS feed

### Expected Result:

- **Blog Creation**: 
  - All form fields function correctly
  - Rich text editor supports markdown and formatting
  - Media upload and integration works seamlessly
- **Content Rendering**:
  - Blog post displays correctly on public site
  - Images are optimized and load efficiently
  - Responsive design works on all devices
- **SEO Implementation**:
  - Meta tags are generated correctly
  - Structured data is included
  - Social media previews function properly
- **Publishing Workflow**:
  - Draft and publish states work correctly
  - Blog appears in all relevant listings
  - RSS feed is updated automatically

### Post-Conditions:

- Blog post is successfully published and accessible
- Content is properly indexed for search functionality
- SEO metadata is correctly implemented
- Blog appears in all relevant navigation and feeds

### Test Data:

```markdown
# EOH Theme Demo: Streamlining Project Expectations Management

The Expectations-Outcomes-Hub (EOH) theme revolutionizes how project teams manage stakeholder expectations and track project outcomes...

## Key Features

- **Stakeholder Dashboard**: Centralized view of project progress
- **Expectation Tracking**: Clear documentation of project requirements
- **Outcome Measurement**: Comprehensive tracking of deliverables

## Benefits for Project Teams

1. Improved stakeholder communication
2. Clear expectation documentation
3. Streamlined progress reporting
```

---
**Demo Context**: This test case demonstrates comprehensive blog management functionality. All content is synthetic and designed to showcase real-world content creation workflows in the EOH theme.
