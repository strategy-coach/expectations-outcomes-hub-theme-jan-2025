import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro/middleware";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

/** Returns the origin of a URL-like env value, or undefined if it is not a valid URL. */
function toOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return undefined;
  }
}

function originsFromList(value: string | undefined): string[] {
  return (value ?? "")
    .split(/[\s,]+/)
    .map(toOrigin)
    .filter((origin): origin is string => Boolean(origin));
}

const env = import.meta.env;

// Hosts allowed to embed this site in an iframe (the embedToken flow).
// Comma/space separated list of origins, e.g. "https://host.example.com".
const frameAncestors = originsFromList(env.SECURITY_FRAME_ANCESTORS);

// Sites this app embeds (Qualityfolio / Fleetfolio pages).
const frameSources = [
  toOrigin(env.PUBLIC_QUALITYFOLIO_URL),
  toOrigin(env.PUBLIC_FLEETFOLIO_URL),
].filter((origin): origin is string => Boolean(origin));

// Identity provider: login/logout flows redirect and post here.
const zitadelOrigin = toOrigin(env.PUBLIC_ZITADEL_AUTHORITY);

// Google reCAPTCHA (support & feedback widget).
const recaptchaSources = ["https://www.google.com", "https://www.gstatic.com"];

const scriptSources = [
  "https://cdn.jsdelivr.net",
  "https://cdnjs.cloudflare.com",
  "https://lhcforms-static.nlm.nih.gov",
  ...recaptchaSources,
];

const unique = (values: (string | undefined)[]) =>
  [...new Set(values.filter(Boolean))].join(" ");

const contentSecurityPolicy = [
  `default-src 'self'`,
  // 'unsafe-inline' is still required by Astro hydration and the inline <script> blocks in pages.
  `script-src ${unique(["'self'", "'unsafe-inline'", ...scriptSources])}`,
  `style-src 'self' 'unsafe-inline' https:`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data: https:`,
  `connect-src 'self' https: wss:`,
  `frame-src ${unique(["'self'", ...frameSources, ...recaptchaSources])}`,
  `frame-ancestors ${unique(["'self'", ...frameAncestors])}`,
  `form-action ${unique(["'self'", zitadelOrigin])}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": contentSecurityPolicy,
  // Legacy fallback; browsers that support CSP frame-ancestors ignore this header.
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
};

/* -------------------------------------------------------------------------- */
/*                         Security Headers Middleware                         */
/* -------------------------------------------------------------------------- */

export const securityHeadersMiddleware: MiddlewareHandler = defineMiddleware(
  async (_context, next) => {
    const response = await next();

    try {
      for (const [name, value] of Object.entries(securityHeaders)) {
        response.headers.set(name, value);
      }
      return response;
    } catch {
      // Some responses (e.g. Response.redirect) have immutable headers; copy them.
      const headers = new Headers(response.headers);
      for (const [name, value] of Object.entries(securityHeaders)) {
        headers.set(name, value);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  },
);
