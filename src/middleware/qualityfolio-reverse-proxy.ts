import type { MiddlewareHandler } from "astro";
import { defineMiddleware } from "astro/middleware";
import { qualityfolioUrl } from "../utils/env.ts";

// Ensure fleetfolioUrl is defined and not empty
if (!qualityfolioUrl) {
    console.warn("fleetfolioUrl is not defined. Skipping fleetfolioReverseProxyMiddleware.");
}
interface State {
    proxiedHtml?: string;
}

const BASE_TARGET_URL = qualityfolioUrl ? new URL(qualityfolioUrl).origin : "";
const TARGET_URL = qualityfolioUrl || "";

// Extract the path from qualityfolioUrl for dynamic href construction
const getQualityfolioPath = () => {
    if (!qualityfolioUrl) return "";
    try {
        const url = new URL(qualityfolioUrl);
        // Remove the filename (e.g., index.sql) and keep the directory path
        const pathParts = url.pathname.split('/').filter(part => part && !part.endsWith('.sql'));
        return pathParts.length > 0 ? `/${pathParts.join('/')}/` : "/";
    } catch (error) {
        console.warn("Error parsing qualityfolioUrl:", error);
        return "";
    }
};

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
                // // // ✅ Fix relative paths in the HTML
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


                // // ✅ Fix internal links - handle multiple patterns
                if (firstSegment) {
                    // Pattern 1: Links that start with the first segment
                    const regex1 = new RegExp(`<a\\s+(.*?)href="/(${firstSegment}/[^"]+)"`, 'g');
                    html = html.replace(
                        regex1,
                        (match, attrs, path) => {
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
                        return `<a ${attrs}href="/qualityfolio/${path}"`;
                    }
                );

                html = html.replace(
                    /<a\s+([^>]*?)href="(\/[^"]+)"([^>]*)>/g,
                    (match, beforeHref, pathWithQuery, afterHref) => {
                        try {
                            const decodedPath = pathWithQuery.replace(/&amp;/g, "&").replace(/&#x3D;/g, "=");
                            const [rawPath, ...queryParts] = decodedPath.split("?");
                            const segments = rawPath.split("/").filter(Boolean);

                            if (segments[0] === "qualityfolio") {
                                return match;
                            }

                            segments.unshift("qualityfolio");

                            const newPath = "/" + segments.join("/");
                            const query = queryParts.length ? "?" + queryParts.join("?") : "";
                            const fullHref = `${newPath}${query}`;

                            return `<a ${beforeHref}href="${fullHref}"${afterHref}>`;
                        } catch (_e) {
                            return match;
                        }
                    }
                );


                html = html.replace(
                    /<a\s+([^>]*?)href="(\/?[a-zA-Z0-9_-]+\.sql(?:\?[^"]*)?)"([^>]*)>/gi,
                    (match, beforeHref, sqlHref, afterHref) => {
                        // Only transform hrefs that start with SQL files (with or without leading slash)
                        const dynamicPath = getQualityfolioPath();
                        const newHref = `/qualityfolio${dynamicPath}${sqlHref.replace(/^\//, '')}`;
                        return `<a ${beforeHref}href="${newHref}"${afterHref}>`;
                    }
                );

                // ✅ Remove empty <h1> tags (including attributes)
                html = html.replace(/<h1[^>]*>\s*<\/h1>/g, "");
                // // ✅ Remove <nav> elements (including content inside)
                // html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, "");

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