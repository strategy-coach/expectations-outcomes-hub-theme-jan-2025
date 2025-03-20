import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro/middleware";
import { fleetfolioUrl } from "../utils/env.ts";

const BASE_TARGET_URL = new URL(fleetfolioUrl).origin;
const TARGET_URL = fleetfolioUrl;

export const fleetfolioReverseProxyMiddleware: MiddlewareHandler = defineMiddleware(async (context, next) => {
    const { pathname, search } = context.url;

    if (pathname.startsWith("/fleetfolio")) {
        let targetUrl;

        if (pathname === "/fleetfolio") {
            targetUrl = `${TARGET_URL}${pathname.replace("/fleetfolio", "")}${search}`;
        } else {
            targetUrl = `${BASE_TARGET_URL}${pathname.replace("/fleetfolio", "")}${search}`;
        }

        console.log(`Proxying request to: ${targetUrl}`);

        try {
            const response = await fetch(targetUrl, { redirect: "manual" });
            if (!response.ok) {
                return new Response(`Failed to fetch ${targetUrl}`, { status: response.status });
            }

            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("text/html")) {
                let html = await response.text();
                const baseUrl = new URL(TARGET_URL).origin;

                // ✅ Fix relative paths in the HTML
                html = html
                    .replace(/(href|src)="\/([^"]+\.css)"/g, `$1="${baseUrl}/$2"`)
                    .replace(/(href|src)="\/([^"]+\.js)"/g, `$1="${baseUrl}/$2"`)
                    .replace(/url\(\s*['"]?\/([^'"\)]+\.css)['"]?\s*\)/g, `url('${baseUrl}/$1')`)
                    .replace(/url\(\s*['"]?\/([^'"\)]+\.js)['"]?\s*\)/g, `url('${baseUrl}/$1')`);

                // ✅ Fix internal links
                html = html.replace(
                    /<a\s+(.*?)href="\/(eoh-fleetfolio\/[^"]+)"/g,
                    `<a $1href="/fleetfolio/$2"`
                );

                // ✅ Remove empty <h1> tags (including attributes)
                html = html.replace(/<h1[^>]*>\s*<\/h1>/g, "");
                // ✅ Remove <nav> elements (including content inside)
                html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, "");

                // ✅ Pass HTML to layout via `locals`
                context.locals.proxiedHtml = html;

                return next(); // Let Astro render it in the layout
            }

            // ✅ Handle non-HTML content directly
            const headers = new Headers(response.headers);
            headers.delete("content-encoding");

            return new Response(response.body, {
                status: response.status,
                headers,
            });
        } catch (error) {
            console.error(`Proxy Error: ${error}`);
            return new Response(`Failed to fetch ${targetUrl}`, { status: 500 });
        }
    }

    return next();
});
