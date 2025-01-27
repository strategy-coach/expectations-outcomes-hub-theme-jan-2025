// theme.config.ts
const themeConfig = (config: {
  logo: string;
  title: string;
  adminEmail: string;
  description:string;
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
});