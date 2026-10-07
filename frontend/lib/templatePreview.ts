export interface TemplatePreviewPage {
    label: string;
    path: string;
}

export function parsePreviewPages(value: unknown): TemplatePreviewPage[] {
    if (Array.isArray(value)) {
        const pages = value
            .map((item) => {
                if (!item || typeof item !== 'object') {
                    return null;
                }

                const candidate = item as { label?: unknown; path?: unknown };
                const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
                const path = typeof candidate.path === 'string' ? candidate.path.trim() : '';
                if (!label) {
                    return null;
                }

                return {
                    label,
                    path: path || '/',
                };
            })
            .filter((item): item is TemplatePreviewPage => item !== null);

        return pages;
    }

    if (typeof value === 'string') {
        try {
            return parsePreviewPages(JSON.parse(value));
        } catch {
            return [];
        }
    }

    return [];
}

export function parsePreviewGallery(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    if (typeof value === 'string') {
        try {
            return parsePreviewGallery(JSON.parse(value));
        } catch {
            return [];
        }
    }

    return [];
}

export function buildPreviewUrl(baseUrl: string, path: string, params: Record<string, string | undefined> = {}): string {
    if (!hasLivePreview(baseUrl)) return '';
    if (/[\x00-\x20\x7f\\]/.test(path) || path.startsWith('//')) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return hasLivePreview(path) ? path : '';

    try {
        const isExternal = /^https?:\/\//i.test(baseUrl);
        const base = new URL(baseUrl, 'https://preview.local');
        if (!path || path === '/') {
            if (isExternal) return baseUrl;
            if (!/\.[a-z0-9]+$/i.test(base.pathname)) {
                base.pathname = `${base.pathname.replace(/\/$/, '')}/index.html`;
            }
        } else {
            // Directory URLs without a trailing slash keep their historical meaning.
            if (!/\.[a-z0-9]+$/i.test(base.pathname) && !base.pathname.endsWith('/')) {
                base.pathname += '/';
            }
            const resolved = new URL(path, base);
            if (isExternal) return resolved.toString();
            applyPreviewParams(resolved, params);
            return `${resolved.pathname}${resolved.search}${resolved.hash}`;
        }
        applyPreviewParams(base, params);
        return `${base.pathname}${base.search}${base.hash}`;
    } catch {
        return '';
    }
}

function applyPreviewParams(url: URL, params: Record<string, string | undefined>): void {
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });
}

export function hasLivePreview(previewUrl: string | undefined | null): boolean {
    if (!previewUrl || /[\x00-\x20\x7f\\]/.test(previewUrl) || previewUrl.startsWith('//')) return false;
    if (previewUrl.startsWith('/')) return true;
    try {
        const url = new URL(previewUrl);
        return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch {
        return false;
    }
}
