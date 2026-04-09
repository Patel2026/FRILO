import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseFeatures(features: unknown): string[] {
    if (Array.isArray(features)) {
        return features.filter((item): item is string => typeof item === 'string');
    }
    if (typeof features === 'string') {
        try {
            const parsed = JSON.parse(features);
            if (Array.isArray(parsed)) return parsed;
            return [];
        } catch {
            console.warn("Failed to parse features JSON:", features);
            return [];
        }
    }
    return [];
}
