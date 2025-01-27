// theme.config.ts
const themeConfig = (config: {
  logo: string;
  title: string;
  adminEmail: string;
}) => {
  return {
    ...config,
  };
};

export default themeConfig({
  logo: "/assets/images/logo.png",
  title: "EOH Astro 5 Site",
  adminEmail: "admin@example.com", 
});