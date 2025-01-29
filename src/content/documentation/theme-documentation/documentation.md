# EOH Astro 5 Theme  

## Overview  
The **EOH Astro 5 Theme** is a highly customizable and versatile Astro-based theme. It comes equipped with essential components like breadcrumbs, headers, footers, and sidebars for seamless navigation. The theme supports dynamic content creation, including features such as blog collections, landing pages, static pages, and GitHub Discussions integration.

## Features  
- **Header and Footer**: Easily customizable components.  
- **Blog Pages**:  
  - Blog listing page.  
  - Blog detail page.  
- **Expectations & Outcomes Collection**:  
  - Generates a sidebar menu from items in `src/content`.  
  - Sidebar is a customizable component.  
- **Landing Page**: Includes cards, mission, and vision sections etc.  
- **Custom Pages**: Easily add new pages as needed.  

## GitHub Discussions Integration  

This theme demonstrates integration with GitHub Discussions using the `github-discussions-blog-loader`.

### Setup  

1. **Copy Environment Variables**:  
   Copy `.env.example` to `.env`:  
   ```bash
   cp .env.example .env
   ```

2. **Configure Environment Variables**:  
   Update the `.env` file with the following values:
   - `PUBLIC_GITHUB_TOKEN`: GitHub Personal Access Token with read access to discussions.  
   - `PUBLIC_GITHUB_REPO_NAME`: Repository name.  
   - `PUBLIC_GITHUB_OWNER_NAME`: Repository owner (user or organization).  

   Example:
   ```env
   PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxx
   PUBLIC_GITHUB_REPO_NAME=your-repo-name
   PUBLIC_GITHUB_OWNER_NAME=your-username
   ```

3. **Use the GitHub Discussion Loader Component**:  
   Import and include the component in your Astro templates:  
   ```astro
   ---
   import GithubDiscussionLoader from "../components/github_discussion/githubDiscussion.astro";
   ---
   <GithubDiscussionLoader />
   ```

## ZITADEL Authentication Component  

Easily integrate ZITADEL authentication into your project.  

1. **Update Environment Variables**:  
   Add the following to the `.env` file:  
   ```env
   PUBLIC_ZITADEL_CLIENT_ID="your-client-id"
   PUBLIC_ZITADEL_AUTHORITY="your-authority"
   PUBLIC_ZITADEL_REDIRECT_URI="your-redirect-uri"
   PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI="your-logout-redirect-uri"
   PUBLIC_ZITADEL_ORGANIZATION_ID="your-organization-id"
   PUBLIC_ZITADEL_PROJECT_ID="your-project-id"
   PUBLIC_ZITADEL_API_TOKEN = xxxxxxxxxxxxxxxxxx

   ```

2. **Use the Authentication Component**:  
   Import and use it in your templates:  
   ```astro
   ---
   import { Authentication } from "../components/zitadel-authentication";
   import { zitadelConfig } from "../utils/env";
   ---
   <Authentication
     clientId={zitadelConfig.clientId}
     authority={zitadelConfig.authority}
     redirectUri={zitadelConfig.redirectUri}
     postLogoutRedirectUri={zitadelConfig.postLogoutRedirectUri}
     organizationId={zitadelConfig.organizationId}
     projectId={zitadelConfig.projectId}
     operation="login"
   />
   ```

3. **Example Usage**:  
   - **Login**:  
     ```astro
     <Authentication operation="login" />
     ```
   - **Logout**:  
     ```astro
     <Authentication operation="logout" />
     ```

## Demo Login Credentials  

| Username | Password       |
|----------|----------------|
| EOHdemo  | Demo@eoh1234   |

## Getting Started  

1. **Clone the Repository**  
   ```bash
   git clone <repository-url>  
   cd <repository-directory>
   
2. **Install Dependencies**  
   ```bash
   pnpm install

   
3. **To enable search in local run the following command**
   ```bash
   pnpm run pagefind-search

4. **Start the development server**  
   ```bash
   pnpm run dev
   

5. **Build the site**  
   ```bash
   pnpm run build
   ```

## Folder Structure  

```plaintext
├── LICENSE
├── README-Theme.md
├── README.md
├── astro.config.mjs 
├── package.json
├── pnpm-lock.yaml
├── public
│   ├── assets
│   │   ├── images
│   │   └── styles
├── src
│   ├── components
│   │   ├── ContentEditor.tsx
│   │   ├── EditMarkdownButton.jsx
│   │   ├── LatestUpdates.astro
│   │   ├── PageFind.astro
│   │   ├── Sidebar.tsx
│   │   ├── github_discussion
│   │   │   ├── githubDiscussion.astro
│   │   │   ├── githubDiscussionDetails.tsx
│   │   │   └── githubDisscussion.tsx
│   │   ├── profile
│   │   │   ├── editProfile.tsx
│   │   │   ├── gravatar
│   │   │   │   └── Gravatar.tsx
│   │   │   ├── profile.tsx
│   │   │   └── userService.tsx
│   │   └── zitadel-authentication
│   │       ├── index.js
│   │       ├── login.jsx
│   │       └── zitadelAuthentication.astro
│   ├── content
│   │   ├── blog
│   │   ├── documentation
│   │   ├── expectations
│   │   ├── outcomes
│   │   └── progress
│   ├── content.config.ts
│   ├── layouts
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   └── Layout.astro
│   ├── middleware
│   │   └── index.ts
│   ├── pages
│   │   ├── blog
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── contact
│   │   │   └── index.astro
│   │   ├── discussions
│   │   │   └── index.astro
│   │   ├── documentation
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── edit-profile.astro
│   │   ├── expectations
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── index.astro
│   │   ├── logout.astro
│   │   ├── mission-vision
│   │   │   └── index.astro
│   │   ├── my-profile.astro
│   │   ├── no-permission.astro
│   │   ├── outcomes
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── post-authorization.astro
│   │   ├── progress
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   └── qualityfolio.astro
│   └── utils
│       ├── env.ts
│       └── helper.astro
├── support
│   └── ci-cd.sh
├── tailwind.config.js
├── theme.config.ts
├── tsconfig.json
└── visualizing-expectations-outcomes.md
```


## Qualityfolio Configuration

To configure Qualityfolio, add the URL to your environment variables: 

```
PUBLIC_QUALITYFOLIO_URL="xxxxx"
```

Replace xxxxx with the appropriate URL.

## Customization  

- Update `header` and `footer` components to match your branding.  
- Add or modify pages in the `src/pages` directory.  
- Customize the sidebar menu by editing `src/content`.

## Theme Configuration

The `theme.config.ts` file allows you to customize certain aspects of the site's theme, including the logo, title, admin email and tracker details. These configurations are passed as an object to the `themeConfig` function.

### Example Configuration

```typescript
// theme.config.ts
const themeConfig = (config: {
  logo: string;
  title: string;
  adminEmail: string;
  description: string;
  trackers: { name: string; url: string }[];
}) => {
  return {
    ...config,
  };
};

export default themeConfig({
  logo: "/assets/images/logo.png", // Path to the site's logo
  title: "EOH Astro 5 Site", // Title of the site
  adminEmail: "admin@example.com", // Admin email address
  description: "Welcome to the Expectations and Outcomes hub of EOH Astro 5 Site. This is your go-to resource to all activities regarding EOH Astro 5 Site products.", // site short description
  trackers: [
    { name: "Product Bug Tracker", url: "https://example.com/bug-tracker" },
    { name: "Google Analytics", url: "https://analytics.google.com" },
    { name: "Product Reported Issues", url: "#" },
  ],
});

```


## Home Page Widgets

Theme includes widgets designed for the home page: **Skip To**, **Key Resources**, **Meeting Minutes**, **Accomplishments** and **Latest Accomplishments**. These widgets dynamically display content based on Markdown files with specific frontmatter configurations. If no Markdown files contain the required frontmatter configuration for a widget, the corresponding widget block will not appear on the page.

**Widgets Overview**
--------------------

### 1\. **Skip To**

*   Displays a list of titles from Markdown files configured with the skipTo frontmatter.
    
*   ```
      home:
         skipTo: 
            category: "skipTo"
    ```
*   You can add multiple Markdown files with this configuration, and their titles will appear under the **Skip To** card.
    

### 2\. **Key Resources**

*   Displays a list of titles from Markdown files configured with the keyResources frontmatter.
    
*    ```
      home:
         keyResources: 
            category: "keyResources"
     ```
*   Multiple Markdown files can be added with this configuration, and their titles will appear under the **Key Resources** card.
    

### 3\. **Latest Accomplishments**

*   Displays a list of content items sorted by date. The content is sourced from Markdown files with a date field in the frontmatter.
    
*   date: "2025-01-01"
    
*   Content is displayed in descending order of the date field, ensuring the latest accomplishments appear first.
    

### 5\. **Accomplishments**

*   Displays a list of titles from Markdown files configured with the accomplishments frontmatter.
    
*    ```
      home:
         accomplishments: 
            category: "accomplishments"
     ```
*   Multiple Markdown files can be added with this configuration, and their titles will appear under the **Accomplishments** card.

### 4\. **Meeting Minutes**

*   Displays a list of titles from Markdown files configured with the meetingMinutes frontmatter.
    
*    ```
      home:
         meetingMinutes: 
            category: "meetingMinutes"
     ```
*   Multiple Markdown files can be added with this configuration, and their titles will appear under the **Meeting Minutes** card.
    

**Combination Frontmatter**
---------------------------

Markdown files can include configurations for multiple widgets. For example:

```
home:
  keyResources:
    category: "keyResources"
  skipTo: 
    category: "skipTo"
```
This configuration allows the file to be listed under both the **Key Resources** and **Skip To** widgets.



## Observability


To enable observabilty and tracking, set the env variable as true

```
ENABLE_OPEN_OBSERVE=true
```

---

**Enjoy building with the EOH Astro 5 Theme!** 🚀  