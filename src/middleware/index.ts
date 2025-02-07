import type { MiddlewareHandler, AstroCookies } from "astro";
import { defineMiddleware, sequence } from "astro/middleware";
import { isZitadelEnabled, zitadelConfig } from '../utils/env';
import themeConfig from "../../theme.config";

const { unauthorizedPages, isHomePagePublic } = themeConfig;

// Middleware to handle authentication and redirection logic
const authenticationMiddleware: MiddlewareHandler = defineMiddleware(async (context, next) => {
    const isLoggedIn = context.cookies.get("zitadel_user_id")?.value;
    const { pathname } = context.url;
    const splittedPath = pathname == "/" ? "/" : pathname.split("/");
    if (isZitadelEnabled) {

      if (
        pathname === "/post-authorization/" ||
        (isHomePagePublic && pathname === "/")
      ) {
        return next(); // Allow access without further checks
      }

      if (!isLoggedIn && !unauthorizedPages.includes(splittedPath[1])) {
        return context.redirect("/logout"); // Redirect unauthenticated users
      }
    }
    return next(); // Proceed to the next middleware
});

// Main middleware handler to sequence middleware functions
export const onRequest: MiddlewareHandler = defineMiddleware((context, next) => {
    return sequence(authenticationMiddleware)(context, next);
});
