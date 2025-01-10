# EOH Astro 5 Theme  

## Overview  
This is a customizable Astro theme designed for versatile use. It includes default breadcrumbs, a header, footer, and a sidebar component. The theme also supports blog collections, a landing page, mission and vision pages, and dynamic content creation.  

## Features  
- **Header and Footer**: Easily customizable components.  
- **Blog Pages**:  
  - Blog listing page.  
  - Blog detail page.  
- **Expectations Collection**:  
  - Generates a sidebar menu from items in `src/content`.  
  - Sidebar is a customizable component.  
- **Landing Page**: Includes cards, mission, and vision sections.  
- **Custom Pages**: Easily add new pages as needed.  

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

├── public
│   └── assets
│       ├── images
│       └── styles
└── src
    ├── assets
    ├── components
    ├── content
    │   ├── blog
    │   └── expectations
    │       ├── analytics
    │       └── tasks
    ├── layouts
    ├── pages
    │   ├── blog
    │   ├── contact
    │   ├── expectations
    │   └── mission-vision
    └── utils
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
