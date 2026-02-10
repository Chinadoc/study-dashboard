export const COMMUNITY_UPDATED_EVENT = 'eurokeys:community-updated';
const COMMUNITY_UPDATED_STORAGE_KEY = 'eurokeys:community-updated-last';

export type CommunityUpdateAction = 'comment' | 'reply' | 'vote' | 'moderation' | 'refresh';

export interface CommunityUpdateDetail {
    action: CommunityUpdateAction;
    vehicleKey?: string;
    commentId?: string;
    source?: 'thread' | 'hub';
    timestamp: number;
}

export function emitCommunityUpdate(
    detail: Omit<CommunityUpdateDetail, 'timestamp'>
): CommunityUpdateDetail {
    const payload: CommunityUpdateDetail = {
        ...detail,
        timestamp: Date.now(),
    };

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent<CommunityUpdateDetail>(COMMUNITY_UPDATED_EVENT, { detail: payload }));
        try {
            localStorage.setItem(COMMUNITY_UPDATED_STORAGE_KEY, JSON.stringify(payload));
        } catch {
            // Ignore storage quota/private mode errors.
        }
    }

    return payload;
}

export function subscribeCommunityUpdates(onUpdate: (detail: CommunityUpdateDetail) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleCustomEvent = (event: Event) => {
        const customEvent = event as CustomEvent<CommunityUpdateDetail>;
        const detail = customEvent.detail;
        if (detail && typeof detail === 'object') onUpdate(detail);
    };

    const handleStorage = (event: StorageEvent) => {
        if (event.key !== COMMUNITY_UPDATED_STORAGE_KEY || !event.newValue) return;
        try {
            const detail = JSON.parse(event.newValue) as CommunityUpdateDetail;
            if (detail && typeof detail === 'object') {
                onUpdate(detail);
            }
        } catch {
            // Ignore malformed payloads.
        }
    };

    window.addEventListener(COMMUNITY_UPDATED_EVENT, handleCustomEvent as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener(COMMUNITY_UPDATED_EVENT, handleCustomEvent as EventListener);
        window.removeEventListener('storage', handleStorage);
    };
}
