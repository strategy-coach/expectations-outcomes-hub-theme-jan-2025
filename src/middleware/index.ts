import type { MiddlewareHandler, AstroCookies } from "astro";
import { defineMiddleware, sequence } from "astro/middleware";
import { isZitadelEnabled, zitadelConfig } from '../utils/env';
const middleware: MiddlewareHandler = defineMiddleware((context, next) => {
    const authStateCookie = context.cookies.get("authState")?.value;
    const organizationName = context.cookies.get("organizationName")?.value;
    const { pathname } = context.url;

    if (isZitadelEnabled) {
        if (pathname == '/post-authorization/') {
            return next();
        }
        else if (authStateCookie === undefined && pathname != '/logout') {
            return context.redirect("/logout");
        } else {
            return next();
        }
    } else {
        return next();
    }



});

export const onRequest: MiddlewareHandler = defineMiddleware(
    (context, next) => {
        next
        return sequence(
            middleware
        )(context, next);
    },
);
