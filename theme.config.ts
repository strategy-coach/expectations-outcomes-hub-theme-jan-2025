// theme.config.ts
const themeConfig = (config: {
  logo: string;
  title: string;
  adminEmail: string;
  description: string;
  activeProject: string;
  trackers: { name: string; url: string }[]; // Array of objects for trackers
  contentCollectionSort: string;
  staticFixedFolders: { parent: string; child: string[] }[]; // Array of objects for trackers
  editLink: string;
}) => {
  return {
    ...config,
  };
};

export default themeConfig({
  logo: "/assets/images/logo.png",
  title: "EOH Astro 5 Site",
  adminEmail: "admin@example.com", 
  description: "Welcome to the Expectations and Outcomes hub of EOH Astro 5 Site. This is your go-to resource to all activities regarding EOH Astro 5 Site products.", 
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
    { parent: "expectations", child: ["key-milestones","roles-and-responsibilities"] },
  ],
  editLink: "https://github.com/strategy-coach/expectations-outcomes-hub-theme-jan-2025/edit/main/src/content/",
});