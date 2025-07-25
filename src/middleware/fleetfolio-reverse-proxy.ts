import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro/middleware";
import { fleetfolioUrl } from "../utils/env.ts";

// Ensure fleetfolioUrl is defined and not empty
if (!fleetfolioUrl) {
    console.warn("fleetfolioUrl is not defined. Skipping fleetfolioReverseProxyMiddleware.");
}

const BASE_TARGET_URL = fleetfolioUrl ? new URL(fleetfolioUrl).origin : "";
const TARGET_URL = fleetfolioUrl || "";

// Extract the path from fleetfolioUrl for dynamic href construction
const getFleetfolioPath = () => {
    if (!fleetfolioUrl) return "";
    try {
        const url = new URL(fleetfolioUrl);
        // Remove the filename (e.g., assets.sql) and keep the directory path
        const pathParts = url.pathname.split('/').filter(part => part && !part.endsWith('.sql'));
        return pathParts.length > 0 ? `/${pathParts.join('/')}/` : "/";
    } catch (error) {
        console.warn("Error parsing fleetfolioUrl:", error);
        return "";
    }
};

export const fleetfolioReverseProxyMiddleware: MiddlewareHandler = defineMiddleware(async (context, next) => {
    // Skip middleware if fleetfolioUrl is not set
    if (!fleetfolioUrl) {
        return next();
    }

    const { pathname, search } = context.url;

    // You can also get these additional URL parts:


    if (pathname.startsWith("/fleetfolio-service")) {
        let targetUrl;

        if (pathname === "/fleetfolio-service") {
            targetUrl = `${TARGET_URL}${pathname.replace("/fleetfolio-service", "")}${search}`;
        } else {
            targetUrl = `${BASE_TARGET_URL}${pathname.replace("/fleetfolio-service", "")}${search}`;
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
                html = html.replace(/;+\s*$/, "");
                const baseUrl = new URL(TARGET_URL).origin;

                // ✅ Fix relative paths in the HTML
                html = html
                    .replace(/(href|src)="\/(\S+\.css)"/g, `$1="${baseUrl}/$2"`)
                    .replace(/(href|src)="\/(\S+\.js)"/g, `$1="${baseUrl}/$2"`)
                    .replace(/url\(\s*['"]?\/(\S+\.css)['"]?\s*\)/g, `url('${baseUrl}/$1')`)
                    .replace(/url\(\s*['"]?\/(\S+\.js)['"]?\s*\)/g, `url('${baseUrl}/$1')`);

                const firstSegment = getFirstPathSegment(TARGET_URL);
                const regex = new RegExp(`<a\\s+(.*?)href="/(${firstSegment}/[^"]+)"`, 'g');
                // ✅ Fix internal links
                html = html.replace(
                    regex,
                    `<a $1href="/fleetfolio-service/$2"`
                );

                html = html.replace(
                    /<a\s+([^>]*?)href="(\/?[a-zA-Z0-9_-]+\.sql(?:\?[^"]*)?)"([^>]*)>/gi,
                    (match, beforeHref, sqlHref, afterHref) => {
                        // Only transform hrefs that start with SQL files (with or without leading slash)
                        const dynamicPath = getFleetfolioPath();
                        const newHref = `/fleetfolio-service${dynamicPath}${sqlHref.replace(/^\//, '')}`;
                        return `<a ${beforeHref}href="${newHref}"${afterHref}>`;
                    }
                );

                // ✅ Remove empty <h1> tags (including attributes)
                html = html.replace(/<h1[^>]*>\s*<\/h1>/g, "");
                // ✅ Remove <nav> elements (including content inside)
                // html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, "");

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

function getFirstPathSegment(urlString: string): string | null {
    try {
        const url = new URL(urlString);
        const pathSegments = url.pathname.split('/').filter(segment => segment.trim() !== '');
        return pathSegments.length > 0 ? pathSegments[0] : null;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}