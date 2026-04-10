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

export function buildPreviewUrl(baseUrl: string, path: string): string {
    try {
        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        const base = new URL(baseUrl);

        if (!path || path === '/') {
            return base.toString();
        }

        if (path.startsWith('/')) {
            base.pathname = path;
            base.search = '';
            base.hash = '';
            return base.toString();
        }

        return new URL(path, base).toString();
    } catch {
        return baseUrl;
    }
}

export function hasLivePreview(previewUrl: string | undefined | null): boolean {
    return typeof previewUrl === 'string' && /^https?:\/\//i.test(previewUrl);
}
