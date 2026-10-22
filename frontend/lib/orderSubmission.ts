const PREFIX = 'frilo.order.submission.v1.';

type Submission = { key: string; orderId?: number };

function storageKey(userId: number, fingerprint: string): string {
    return `${PREFIX}${userId}.${fingerprint}`;
}

/** Persist before sending: storage failure must not result in an untracked order. */
export function getSubmissionKey(storage: Storage, userId: number, fingerprint: string): string {
    const name = storageKey(userId, fingerprint);
    const existing = storage.getItem(name);
    if (existing) {
        const submission = JSON.parse(existing) as Submission;
        if (typeof submission.key !== 'string') throw new Error('Soumission invalide.');
        return submission.key;
    }
    const key = crypto.randomUUID();
    storage.setItem(name, JSON.stringify({ key }));
    return key;
}

export function rememberSubmissionOrder(storage: Storage, userId: number, fingerprint: string, orderId: number): void {
    const key = getSubmissionKey(storage, userId, fingerprint);
    storage.setItem(storageKey(userId, fingerprint), JSON.stringify({ key, orderId }));
}

export function clearCompletedSubmission(storage: Storage, orderId: number): void {
    for (let index = storage.length - 1; index >= 0; index--) {
        const name = storage.key(index);
        if (!name?.startsWith(PREFIX)) continue;
        try {
            const value = JSON.parse(storage.getItem(name) ?? 'null') as Submission | null;
            if (value?.orderId === orderId) storage.removeItem(name);
        } catch {
            // Unrelated or damaged entries do not block payment confirmation.
        }
    }
}
