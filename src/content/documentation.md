# EOH Astro 5 Theme  

## Overview  
The EOH Astro 5 Theme is a highly customizable and versatile Astro-based theme. It comes with built-in components like breadcrumbs, a header, footer, and sidebar for seamless navigation. The theme supports dynamic content creation, including features for expectations and outcomes, blog collections, landing pages, static pages, and integration with GitHub Discussions Blog Loader.  

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

## GitHub Discussions  

This project demonstrates how to integrate GitHub Discussions into an Astro site using the `github-discussions-blog-loader`.  

## Setup  

### Setting Up Environment Variables  

1. Copy the `.env.example` file to `.env`:  
   ```bash
   cp .env.example .env
   ```  

To use the GitHub Discussions loader, follow these steps:  

#### 1. Provide Environment Variables  

Ensure the following environment variables are set in your project. You can create a `.env` file in the root of your project and add these values:  

- `PUBLIC_GITHUB_TOKEN`: A GitHub Personal Access Token with read access to discussions.  
- `PUBLIC_GITHUB_REPO_NAME`: The name of the GitHub repository.  
- `PUBLIC_GITHUB_OWNER_NAME`: The owner of the GitHub repository (user or organization).  

```env
PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxx  
PUBLIC_GITHUB_REPO_NAME=xxxxxxxxxxx  
PUBLIC_GITHUB_OWNER_NAME=xxxxx  
```  

#### 2. Use the Component  

You can call the GitHub Discussions loader component in your Astro files. The component is located at:  

`src/components/github_discussion/githubDiscussion.astro`  

#### Example Usage  

To use the loader, import the component and include it in your template:  

```astro
---  
import GithubDiscussionLoader from "../components/github_discussion/githubDiscussion.astro";  
---  

<GithubDiscussionLoader />  
```  

## ZITADEL Authentication Component  

You can use the ZITADEL authentication component in your Astro files. The component is located at:  

`src/components/zitadel-authentication`  

### Update `.env` File with the Following Values  

```env
PUBLIC_ZITADEL_CLIENT_ID="xxxxxxxxx"  
PUBLIC_ZITADEL_AUTHORITY="xxxxxxxxx"  
PUBLIC_ZITADEL_REDIRECT_URI="xxxxxxxxx"  
PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI="xxxxxxxxx"  
PUBLIC_ZITADEL_ORGANIZATION_ID="xxxxxxxxx"  
PUBLIC_ZITADEL_PROJECT_ID="xxxxxxxxx"  

# Enable or disable ZITADEL authentication
ENABLE_ZITADEL_AUTH=true
```  

### Example Usage  

To use the authentication component, import it and include it in your template:  

```astro
---  
import { Authentication } from "../components/zitadel-authentication";  
import { zitadelConfig } from "../utils/env";  
---  
```  

#### Login Example  

```astro
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

#### Logout Example  

```astro
<Authentication  
  clientId={zitadelConfig.clientId}  
  authority={zitadelConfig.authority}  
  redirectUri={zitadelConfig.redirectUri}  
  postLogoutRedirectUri={zitadelConfig.postLogoutRedirectUri}  
  organizationId={zitadelConfig.organizationId}  
  projectId={zitadelConfig.projectId}  
  operation="logout"  
/>  
```  

### Enabling/Disabling ZITADEL Authentication  

You can enable or disable ZITADEL authentication by setting the `ENABLE_ZITADEL_AUTH` environment variable in your `.env` file:  

- **Enable**: `ENABLE_ZITADEL_AUTH=true`  
- **Disable**: `ENABLE_ZITADEL_AUTH=false`  

## Default Login Credentials for Demo  

| User Name | Password       |  
|-----------|----------------|  
| EOHdemo   | Demo@eoh1234   |  

---

Enjoy building with this flexible and user-friendly Astro theme!  