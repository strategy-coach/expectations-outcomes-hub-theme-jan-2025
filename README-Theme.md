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

To use the GitHub Discussions loader, follow these steps:

#### 1. Provide Environment Variables

Ensure the following environment variables are set in your project. You can create a `.env` file in the root of your project and add these values:

PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxx

PUBLIC_GITHUB_REPO_NAME=xxxxxxxxxxx

PUBLIC_GITHUB_OWNER_NAME=xxxxx

PUBLIC_GITHUB_TOKEN: A GitHub Personal Access Token with read access to discussions.

PUBLIC_GITHUB_REPO_NAME: The name of the GitHub repository.

PUBLIC_GITHUB_OWNER_NAME: The owner of the GitHub repository (user or organization).

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

## Getting Started  

1. **Clone the Repository**  
   ```bash
   git clone <repository-url>  
   cd <repository-directory>
   
2. **Install Dependencies**  
   ```bash
   pnpm install

3. **Start the development server**  
   ```bash
   pnpm run dev

4. **Build the site**  
   ```bash
   pnpm run build


## Folder Structure  

```text


├── LICENSE
├── README-Theme.md
├── README.md
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── public
│   └── assets
│       ├── images
│       └── styles
├── src
│   ├── components
│   │   ├── Sidebar.tsx
│   │   └── github_discussion
│   │       ├── githubDiscussion.astro
│   │       ├── githubDiscussionDetails.tsx
│   │       └── githubDisscussion.tsx
│   ├── content
│   │   ├── blog
│   │   ├── connect
│   │   ├── expectations
│   │   └── outcomes
│   ├── content.config.ts
│   ├── layouts
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Layout.astro
│   │   └── NavLink.astro
│   ├── pages
│   │   ├── blog
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── connect
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── contact
│   │   │   └── index.astro
│   │   ├── discussions
│   │   │   └── index.astro
│   │   ├── expectations
│   │   │   ├── [...slug].astro
│   │   │   └── index.astro
│   │   ├── index.astro
│   │   ├── mission-vision
│   │   │   └── index.astro
│   │   └── outcomes
│   │       ├── [...slug].astro
│   │       └── index.astro
│   └── utils
│       └── helper.astro
├── tailwind.config.js
├── tsconfig.json
└── visualizing-expectations-outcomes.md
```
- **`src/components`**: Contains the header, footer, and sidebar components.  
- **`src/content`**: Add items here for generating sidebar menus.  
- **`src/pages`**: Add or update pages (e.g., blog, landing page, mission, vision).  

## Customization  
- Update `header` and `footer` components as needed.  
- Add or modify pages in the `src/pages` folder.  
- Customize sidebar menu items via `src/content`.  

---

Enjoy building with this flexible and user-friendly Astro theme!  
