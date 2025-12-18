import type { MiddlewareHandler } from "astro";
import { defineMiddleware, sequence } from "astro/middleware";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { isZitadelEnabled } from "../utils/env.ts";
import themeConfig from "../../theme.config.ts";
import { fleetfolioReverseProxyMiddleware } from "./fleetfolio-reverse-proxy.ts";
import { qualityfolioReverseProxyMiddleware } from "./qualityfolio-reverse-proxy.ts";
import { getUserRole } from "../../src/services/zitadel.services.ts";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const EMBED_SECRET = import.meta.env.EMBED_SECRET as string | undefined;
console.log("EMBED_SECRET:", EMBED_SECRET ? "configured" : "not configured");

const EMBED_JWT_CONFIG = {
  issuer: "host-app",
  audience: "astro-microsite",
  algorithms: ["HS256"] as const,
};

const { unauthorizedPages, isHomePagePublic } = themeConfig;

/* -------------------------------------------------------------------------- */
/*                                JWT Typings                                 */
/* -------------------------------------------------------------------------- */

interface EmbedJwtPayload extends JwtPayload {
  zitadelUserId: string;
  zitadelTenantId: string;
  scope: string[];
}

/* -------------------------------------------------------------------------- */
/*                              Helper functions                               */
/* -------------------------------------------------------------------------- */


function assertEmbedSecret() {
  if (!EMBED_SECRET) {
    throw new Error("EMBED_SECRET is not configured");
  }
}

function verifyEmbedToken(token: string): EmbedJwtPayload {
  assertEmbedSecret();

  const payload = jwt.verify(token, EMBED_SECRET, {
    issuer: EMBED_JWT_CONFIG.issuer,
    audience: EMBED_JWT_CONFIG.audience,
    algorithms: EMBED_JWT_CONFIG.algorithms,
    clockTolerance: 5, // seconds
  }) as EmbedJwtPayload;

  if (!payload.scope?.includes("embed")) {
    throw new Error("Missing embed scope");
  }

  if (!payload.zitadelUserId || !payload.zitadelTenantId) {
    throw new Error("Missing ZITADEL claims");
  }

  return payload;
}

/* -------------------------------------------------------------------------- */
/*                         Authentication Middleware                           */
/* -------------------------------------------------------------------------- */

const authenticationMiddleware: MiddlewareHandler = defineMiddleware(
  async (context, next) => {
    const { pathname } = context.url;

    let userId = context.cookies.get("zitadel_user_id")?.value;
    let userRole = context.cookies.get("zitadel_user_role")?.value;

    const embedToken = context.url.searchParams.get("embedToken");

    /* ------------------------- Embedded access flow ------------------------- */
    if (embedToken) {

      try {
        const payload = verifyEmbedToken(embedToken);

        userId = payload.zitadelUserId;

        const roleResponse = await getUserRole(
          payload.zitadelUserId,
          payload.zitadelTenantId
        );

        if (!roleResponse?.result?.length) {
          return context.redirect("/login");
        }

        userRole = roleResponse.result[0].roleKeys?.[0];
      } catch (error) {
        return new Response("Invalid or expired embed token", {
          status: 401,
        });
      }
    }

    /* ------------------------- Normal auth flow ----------------------------- */
    if (!isZitadelEnabled) {
      return next();
    }

    if (
      pathname.startsWith("/api/") ||
      pathname === "/login" ||
      pathname === "/logout" ||
      pathname === "/reset-password" ||
      (isHomePagePublic && pathname === "/")
    ) {
      return next();
    }

    const pathRoot = pathname === "/" ? "/" : pathname.split("/")[1];

    if (!userId && !unauthorizedPages.includes(pathRoot)) {
      return context.redirect("/login");
    }

    if (userId && pathname.includes("/admin")) {
      if (!userRole?.includes("admin")) {
        return context.redirect("/");
      }
    }

    return next();
  }
);

/* -------------------------------------------------------------------------- */
/*                               Middleware Chain                              */
/* -------------------------------------------------------------------------- */

export const onRequest: MiddlewareHandler = defineMiddleware((context, next) =>
  sequence(
    authenticationMiddleware,
    fleetfolioReverseProxyMiddleware,
    qualityfolioReverseProxyMiddleware
  )(context, next)
);
