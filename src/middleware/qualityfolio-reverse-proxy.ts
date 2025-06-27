import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro/middleware";
import { qualityfolioUrl } from "../utils/env.ts";

// Ensure fleetfolioUrl is defined and not empty
if (!qualityfolioUrl) {
    console.warn("fleetfolioUrl is not defined. Skipping fleetfolioReverseProxyMiddleware.");
}

const BASE_TARGET_URL = qualityfolioUrl ? new URL(qualityfolioUrl).origin : "";
const TARGET_URL = qualityfolioUrl || "";

export const qualityfolioReverseProxyMiddleware: MiddlewareHandler = defineMiddleware(async (context, next) => {
    // Skip middleware if fleetfolioUrl is not set
    if (!qualityfolioUrl) {
        return next();
    }

    const { pathname, search } = context.url;

    if (pathname.startsWith("/qualityfolio")) {
        let targetUrl;

        if (pathname === "/qualityfolio" || pathname === "/qualityfolio/") {
            targetUrl = `${TARGET_URL}${pathname.replace("/qualityfolio", "")}${search}`;
        } else {
            targetUrl = `${BASE_TARGET_URL}${pathname.replace("/qualityfolio", "")}${search}`;
        }

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
                // // ✅ Fix relative paths in the HTML
                html = html
                    .replace(/(href|src)="\/(\S+\.css)"/g, `$1="${baseUrl}/$2"`)
                    .replace(/(href|src)="\/(\S+\.js)"/g, `$1="${baseUrl}/$2"`)
                    .replace(/url\(\s*['"]?\/(\S+\.css)['"]?\s*\)/g, `url('${baseUrl}/$1')`)
                    .replace(/url\(\s*['"]?\/(\S+\.js)['"]?\s*\)/g, `url('${baseUrl}/$1')`);
                html = html.replace(
                    /data-embed="\/([^"]+)"/g,
                    (_, path) => `data-embed="${baseUrl}/${path}"`
                );

                html = html.replace(
                    /src="\/lib\/([^"]+\.js)"/g,
                    `src="${baseUrl}/lib/$1"`
                );

                const firstSegment = getFirstPathSegment(TARGET_URL);
                console.log("[QUALITYFOLIO] firstSegment:", firstSegment)

                // ✅ Fix internal links - handle multiple patterns
                if (firstSegment) {
                    // Pattern 1: Links that start with the first segment
                    const regex1 = new RegExp(`<a\\s+(.*?)href="/(${firstSegment}/[^"]+)"`, 'g');
                    html = html.replace(
                        regex1,
                        (match, attrs, path) => {
                            console.log(`[QUALITYFOLIO] Replacing link: ${match} -> <a ${attrs}href="/qualityfolio/${path}"`);
                            return `<a ${attrs}href="/qualityfolio/${path}"`;
                        }
                    );
                }

                // Pattern 2: General relative links that don't start with http/https
                html = html.replace(
                    /<a\s+(.*?)href="\/([^"]+)"/g,
                    (match, attrs, path) => {
                        // Skip if it's already been prefixed or is an absolute URL
                        if (path.startsWith('qualityfolio/') || path.startsWith('http')) {
                            return match;
                        }
                        console.log(`[QUALITYFOLIO] Replacing general link: ${match} -> <a ${attrs}href="/qualityfolio/${path}"`);
                        return `<a ${attrs}href="/qualityfolio/${path}"`;
                    }
                );

                // ✅ Remove empty <h1> tags (including attributes)
                html = html.replace(/<h1[^>]*>\s*<\/h1>/g, "");
                // ✅ Remove <nav> elements (including content inside)
                html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, "");

                // ✅ Pass HTML to layout via `locals`
                context.locals.proxiedHtml = html;
                // ✅ Pass HTML to layout via `locals`
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