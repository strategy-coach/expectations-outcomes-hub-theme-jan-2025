---
title: "Authenticated Pages Presentation Demo"
enableEditButton: true

---

# Welcome to the Secure Presentation 🔒  

This presentation includes both **public and restricted** slides. By default, you can view the demo without logging in, but certain slides require authentication.  

On clicking the demo link below, you will be able to navigate through the slides. However, slides **4 and 5** (as configured in `theme.config.ts`) are restricted and will be **skipped** if you are not logged in.  

To view restricted slides, please log in.  

This Feature allows users to create slide-based presentations directly within the theme.

Slide content is managed in **src/pages/presentation.astro**.
Each `<section>` inside the file corresponds to a separate slide.


## Slide-Specific Authentication  

You can configure authentication for specific slides in the `theme.config.ts` file.  

Example:  
```ts
authorizedSlides: [4, 5] // Only slides 4 and 5 require authentication.
```

If you are not logged in, these slides will be skipped during navigation.
If you log in, you will have full access to all slides.

## Demo  

<a href="/presentation" target="_blank">Click here to view the secure demo</a>  

## Full Presentation Authentication  

In addition to slide-wise authentication, you can **restrict access to the entire presentation** by removing its URL from the `authorizedPages` setting in `theme.config.ts`.  

Example:  
```ts
unauthorizedPages: ["presentation"]
```

