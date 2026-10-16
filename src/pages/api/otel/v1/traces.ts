import type { APIRoute } from "astro";

export const prerender = false; // must run on server

const OTLP_URL = import.meta.env.PUBLIC_OTLP_TRACES_URL; // e.g. https://vendor.example.com/v1/traces
const OTLP_TOKEN = import.meta.env.PUBLIC_OTLP_TOKEN;    // secret (NOT PUBLIC_)

function getClientIp(request: Request, clientAddress?: string): string | null {
    const headers = request.headers;
    const candidates = [
        headers.get("cf-connecting-ip"), // Cloudflare
        headers.get("x-real-ip"),
        headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        headers.get("true-client-ip"),
        clientAddress,
    ];
    return candidates.find((ip) => !!ip) ?? null;
}

// Overwrite the client-reported "ipAddress" span attribute with the
// server-observed IP so ad-blocker/CORS failures on the browser's
// third-party ipify/ipwho.is lookups no longer surface as "unknown-ip".
function withServerIp(payload: unknown, ip: string): unknown {
    if (typeof payload !== "object" || payload === null) return payload;
    const root = payload as { resourceSpans?: unknown };
    if (!Array.isArray(root.resourceSpans)) return payload;

    for (const resourceSpan of root.resourceSpans) {
        const scopeSpans = (resourceSpan as { scopeSpans?: unknown })?.scopeSpans;
        if (!Array.isArray(scopeSpans)) continue;
        for (const scopeSpan of scopeSpans) {
            const spans = (scopeSpan as { spans?: unknown })?.spans;
            if (!Array.isArray(spans)) continue;
            for (const span of spans) {
                const attributes = (span as { attributes?: unknown })?.attributes;
                if (!Array.isArray(attributes)) continue;
                const ipAttr = attributes.find(
                    (a) => (a as { key?: string })?.key === "ipAddress",
                ) as { value?: unknown } | undefined;
                if (ipAttr) {
                    ipAttr.value = { stringValue: ip };
                } else {
                    attributes.push({ key: "ipAddress", value: { stringValue: ip } });
                }
            }
        }
    }
    return payload;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        if (!OTLP_URL || !OTLP_TOKEN) {
            return new Response("Telemetry proxy not configured", { status: 500 });
        }

        const contentType =
            request.headers.get("content-type") ?? "application/x-protobuf";

        let ip: string | null = null;
        try {
            ip = getClientIp(request, clientAddress);
        } catch {
            // clientAddress can throw if unavailable (e.g. non-adapter dev server)
            ip = getClientIp(request);
        }

        const rawBody = await request.arrayBuffer();

        let body: BodyInit = rawBody;
        if (ip && contentType.includes("application/json")) {
            try {
                const json = JSON.parse(new TextDecoder().decode(rawBody));
                body = JSON.stringify(withServerIp(json, ip));
            } catch {
                // Malformed JSON: forward the original bytes untouched.
                body = rawBody;
            }
        }

        const upstream = await fetch(OTLP_URL, {
            method: "POST",
            headers: {
                "content-type": contentType,
                "authorization": OTLP_TOKEN,
                "stream-name": "default" // or `Bearer ${OTLP_TOKEN}` per vendor
            },
            body,
        });

        // Return upstream status without exposing secret
        return new Response(await upstream.text(), {
            status: upstream.status,
            headers: { "content-type": upstream.headers.get("content-type") ?? "text/plain" },
        });
    } catch {
        return new Response("Telemetry proxy error", { status: 502 });
    }
};