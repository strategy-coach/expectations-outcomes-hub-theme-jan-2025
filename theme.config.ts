// theme.config.ts
const themeConfig = (config: {
  logo: string;
  darkmodeLogo: string;
  title: string;
  organization: string;
  adminEmail: string;
  description: string;
  activeProject: string;
  trackers: { name: string; url: string }[]; // Array of objects for trackers
  contentCollectionSort: string;
  staticFixedFolders: { parent: string; child: string[] }[]; // Array of objects for trackers
  editLink: string;
  baseHyperLinkColor: string;
  presentationBgColor: string;
  excludedEditOptionPages: string[];
  excludedEditOptionFolder: string[];
  headerMenu: { label: string; path: string; requiresAuth?: boolean }[];
  unauthorizedPages: string[];
  isHomePagePublic: boolean;
  authorizedSlides: number[];
}) => {
  return {
    ...config,
  };
};

export default themeConfig({
  logo: "/assets/images/logo.png",
  darkmodeLogo: "/assets/images/EOH-Whitemode.png",
  title: "EOH Astro 5 Site",
  organization: "EOH Hub",
  adminEmail: "admin@example.com",
  description:
    "Welcome to the Expectations and Outcomes hub of EOH Astro 5 Site. This is your go-to resource to all activities regarding EOH Astro 5 Site products.",
  activeProject: "EOH",
  trackers: [
    { name: "Product Bug Tracker", url: "https://example.com/bug-tracker" },
    { name: "Google Analytics", url: "https://analytics.google.com" },
    { name: "Product Reported Issues", url: "#" },
  ],
  contentCollectionSort: "true",
  staticFixedFolders: [
    { parent: "progress", child: ["activity-logs"] },
    { parent: "outcomes", child: ["deliverables"] },
    {
      parent: "expectations",
      child: ["key-milestones", "roles-and-responsibilities"],
    },
    {
      parent: "documentation",
      child: [
        "expectations-and-outcomes",
        "theme-documentation",
        "visualizing-expectations-outcomes",
        "release-notes",
      ],
    },
  ],
  editLink:
    "https://github.com/strategy-coach/expectations-outcomes-hub-theme-jan-2025/edit/main/src/content/",
  baseHyperLinkColor: "#028db7",
  presentationBgColor: "#1e3a47",
  excludedEditOptionPages: [
    "/blog",
    "/my-profile",
    "/expectations",
    "/outcomes",
    "/progress",
    "/github-discussions",
    "/lforms",
    "/teams",
    "/database-query-render",
    "/imap-mail",
  ],
  excludedEditOptionFolder: ["qualityfolio", "lforms"],
  headerMenu: [
    { label: "Home", path: "/" },
    { label: "Documentation", path: "/documentation" },
    { label: "Expectations", path: "/expectations", requiresAuth: true },
    { label: "Outcomes", path: "/outcomes", requiresAuth: true },
    { label: "Progress", path: "/progress", requiresAuth: true },
    { label: "Qualityfolio", path: "/qualityfolio", requiresAuth: true },
    { label: "Blog", path: "/blog" },
  ],
  unauthorizedPages: [
    "documentation",
    "blog",
    "logout",
    "no-permission",
    "presentation",
    "public-presentation",
  ],
  isHomePagePublic: true, // Set this to false if the homepage should require authentication
  authorizedSlides: [4, 5], // Example: Only slides 5 require authentication
});