'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// ===== TYPES =====
interface ActivityLog {
    id: number;
    user_id: string;
    action: string;
    details: string;
    user_agent: string;
    created_at: number;
    user_name?: string;
    user_email?: string;
}

interface AdminStats {
    top_searches: { query: string; count: number }[];
    top_clicks: { url: string; count: number }[];
    top_vehicle_views: { make: string; model: string; year: string; view_count: number }[];
    global_totals: { searches: number; clicks: number; vin_lookups: number };
    user_growth: number;
    visitor_stats: { active_users: number; total_events: number };
}

interface CloudflareStats {
    last24h: { visitors: number; requests: number; bytesServed: number; cacheRate: string; threats: number };
    last7d: { visitors: number; requests: number; bytesServed: number; cacheRate: string; threats: number };
    daily: { date: string; visitors: number; requests: number }[];
    tech: { errorRate: string; cacheRate: string; statusGroups: Record<string, number> };
    marketing: {
        topCountries: { country: string; requests: number }[];
        topBrowsers: { browser: string; requests: number }[];
        devices: { device: string; requests: number }[];
        topPaths: { path: string; count: number }[];
        topReferrers: { referrer: string; count: number }[];
    };
}

interface InventoryItem {
    item_key: string;
    type: string;
    user_count: number;
    total_qty: number;
}

interface ClickData {
    term: string;
    fcc_id: string;
    click_type: string;
    count: number;
    distinct_users: number;
}

interface UserData {
    id: string;
    email: string;
    name: string;
    picture: string;
    is_pro: boolean;
    is_developer: boolean;
    created_at: number;
    activity_count: number;
    last_activity: number;
    subscription_status?: string;
    stripe_customer_id?: string;
    trial_until?: string;
}

interface StripeCustomer {
    id: string;
    email: string;
    name: string | null;
    created: number;
    metadata: Record<string, string>;
    subscriptions: StripeSubscription[];
    activePlan: string;
    activePlanAmount: number;
    activePlanInterval: string;
    activeSubStatus: string | null;
}

interface StripeSubscription {
    id: string;
    status: string;
    planName: string;
    amount: number;
    interval: string;
    currentPeriodStart: number | null;
    currentPeriodEnd: number | null;
    trialStart: number | null;
    trialEnd: number | null;
    canceledAt: number | null;
    created: number;
}

interface StripeProduct {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    created: number;
    prices: { id: string; amount: number; currency: string; interval: string; active: boolean }[];
}

interface AddonTrial {
    user_id: string;
    addon_id: string;
    trial_started_at: string;
    trial_expires_at: string;
    converted_at: string | null;
    canceled_at: string | null;
    stripe_subscription_id: string | null;
    user_email: string;
    user_name: string;
}

interface BillingData {
    customers: StripeCustomer[];
    products: StripeProduct[];
    addonTrials: AddonTrial[];
    summary: {
        totalCustomers: number;
        activeSubscriptions: number;
        trialingSubscriptions: number;
        canceledSubscriptions: number;
        pastDueSubscriptions: number;
        mrr: number;
    };
}

interface VerificationHistoryItem {
    id: string;
    user_id: string;
    user_name?: string | null;
    user_email?: string | null;
    user_picture?: string | null;
    proof_type: string;
    proof_image_url?: string | null;
    status: 'approved' | 'rejected' | 'pending';
    created_at: number;
    reviewed_at?: number | null;
    reviewed_by_name?: string | null;
    reviewed_by_email?: string | null;
    rejection_reason?: string | null;
    admin_notes?: string | null;
    locksmith_verified?: number | boolean;
    locksmith_verified_at?: number | null;
    verification_level?: string | null;
    nastf_verified?: number | boolean;
}

interface UserInventoryItem {
    id: string;
    item_key: string;
    type: string;
    qty: number;
    used?: number;
    vehicle?: string | null;
    amazon_link?: string | null;
    updated_at: number;
}

interface UserInventorySummary {
    keys_qty: number;
    blanks_qty: number;
    total_qty: number;
    item_rows: number;
    last_updated_at?: number | null;
}

interface UserActivityItem {
    id: number;
    user_id: string;
    action: string;
    details: string;
    user_agent?: string;
    created_at: number;
}

interface UserOverviewResponse {
    user: UserData & {
        locksmith_verified?: number | boolean;
        locksmith_verified_at?: number | null;
        verification_level?: string | null;
        nastf_verified?: number | boolean;
        nastf_verified_at?: number | null;
        trial_until?: number | null;
    };
    inventory: {
        summary: UserInventorySummary;
        items: UserInventoryItem[];
    };
    activity: UserActivityItem[];
    dashboard?: {
        subscription?: {
            tier?: 'free' | 'pro' | 'developer' | string;
            is_pro?: boolean;
            is_developer?: boolean;
            trial_until?: number | null;
            active_addons?: string[];
            tool_subscription_count?: number;
        };
        behavior?: {
            last_7d?: {
                events?: number;
                clicks?: number;
                searches?: number;
                vehicle_views?: number;
                comments?: number;
                votes_cast?: number;
                reports?: number;
            };
            last_30d?: {
                events?: number;
                clicks?: number;
                searches?: number;
                vehicle_views?: number;
                comments?: number;
                votes_cast?: number;
                reports?: number;
            };
            totals?: {
                events?: number;
                clicks?: number;
                searches?: number;
                vehicle_views?: number;
                comments?: number;
                top_level_comments?: number;
                replies?: number;
                upvotes_received?: number;
                votes_cast?: number;
                upvotes_cast?: number;
                downvotes_cast?: number;
                reports?: number;
            };
            top_actions?: Array<{ action: string; count: number }>;
        };
    };
    verification: {
        proofs: VerificationHistoryItem[];
        nastf: Array<{
            id: string;
            proof_type?: string | null;
            proof_image_url?: string | null;
            status: string;
            created_at: number;
            reviewed_at?: number | null;
            reviewed_by_name?: string | null;
            reviewed_by_email?: string | null;
            rejection_reason?: string | null;
        }>;
    };
}

interface CoverageGaps {
    platform_gaps: {
        source: string;
        description: string;
        data: {
            make: string;
            platform_code: string;
            year_start: number;
            year_end: number;
            description: string;
            security_level: string;
            akl_typical: string;
            coverage_count: number;
            gap_status: 'missing' | 'thin' | 'adequate';
            priority: number;
        }[];
    };
    era_gaps: {
        source: string;
        description: string;
        data: {
            era_code: string;
            era_description: string;
            akl_difficulty: string;
            coverage_count: number;
            makes_covered: number;
        }[];
    };
    make_gaps: {
        source: string;
        description: string;
        data: {
            make: string;
            total_platforms: number;
            missing_platforms: number;
            covered_platforms: number;
        }[];
    };
    critical_gaps: {
        source: string;
        description: string;
        data: {
            make: string;
            platform_code: string;
            year_start: number;
            year_end: number;
            security_level: string;
            akl_typical: string;
            notes: string;
            coverage_count: number;
        }[];
    };
    vehicle_gaps: {
        source: string;
        description: string;
        count: number;
    };
    fcc_gaps: {
        source: string;
        description: string;
        count: number;
    };
    content_gaps: {
        source: string;
        description: string;
        count: number;
    };
    summary: {
        total_platforms: number;
        missing_coverage: number;
        thin_coverage: number;
        vehicles_without_coverage: number;
        vehicles_without_fcc: number;
        vehicles_without_content: number;
    };
    category_breakdown?: { category: string; total: number; missing: number }[];
    active_filter?: string | null;
}

interface ModerationFlag {
    flag_id: string;
    comment_id: string;
    reason: string;
    details?: string | null;
    flag_created: number;
    reporter_id: string;
    content: string;
    vehicle_key: string;
    comment_author_id: string;
    comment_author_name?: string | null;
    flag_count?: number | null;
    comment_created: number;
    reporter_name?: string | null;
    reporter_email?: string | null;
}

interface ModerationHistoryItem {
    id: string;
    flag_id: string;
    comment_id: string;
    vehicle_key: string;
    resolution: 'dismissed' | 'deleted' | 'warning_issued';
    delete_comment: boolean;
    note?: string | null;
    resolved_at: number;
    moderator_name?: string | null;
    moderator_email?: string | null;
}

interface PendingVerification {
    id: string;
    user_id: string;
    proof_type: string;
    proof_image_url: string;
    created_at: number;
    user_name?: string | null;
    user_email?: string | null;
    user_picture?: string | null;
}

interface ReviewerRole {
    user_id: string;
    user_name?: string | null;
    user_email?: string | null;
    can_review_verification: boolean | number;
    can_review_nastf: boolean | number;
    can_moderate_community: boolean | number;
    created_by_name?: string | null;
    created_by_email?: string | null;
    updated_at: number;
}

interface CommunityConversionData {
    window_days: number;
    metrics: {
        top_level_comments: number;
        replies: number;
        unique_commenters: number;
        vote_events: number;
        unique_voters: number;
        mentions: number;
        proofs_submitted: number;
        proofs_approved: number;
        newly_verified_users: number;
    };
    conversion: {
        review_pass_rate: number;
        commenter_to_verified_rate: number;
    };
    funnel: Array<{ stage: string; value: number }>;
}

function normalizeProofUrl(rawUrl: string): string {
    const value = String(rawUrl || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    const stripped = value.replace(/^\/+/, '');
    return `https://pub-6f55decd53fc486a97f4a7c74e53f6c4.r2.dev/${stripped}`;
}

// Helper to format bytes
const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// Helper to format relative time
const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

const relativeTime = (timestamp?: number | null) => {
    if (!timestamp) return 'N/A';
    const diff = timestamp - Date.now();
    const absSeconds = Math.floor(Math.abs(diff) / 1000);
    if (absSeconds < 60) return diff >= 0 ? 'in <1m' : 'just now';
    if (absSeconds < 3600) {
        const value = Math.floor(absSeconds / 60);
        return diff >= 0 ? `in ${value}m` : `${value}m ago`;
    }
    if (absSeconds < 86400) {
        const value = Math.floor(absSeconds / 3600);
        return diff >= 0 ? `in ${value}h` : `${value}h ago`;
    }
    const value = Math.floor(absSeconds / 86400);
    return diff >= 0 ? `in ${value}d` : `${value}d ago`;
};

const formatDateTime = (timestamp?: number | null) => {
    if (!timestamp) return 'N/A';
    try {
        return new Date(timestamp).toLocaleString();
    } catch {
        return 'N/A';
    }
};

const formatActionLabel = (action: string) =>
    String(action || '')
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

// Country flag emoji helper
const countryFlag = (code: string) => {
    if (!code || code.length !== 2) return '🌐';
    const offset = 127397;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
};

// Activity categories for filtering
const ACTIVITY_CATEGORIES: Record<string, { label: string; icon: string; actions: string[] }> = {
    all: { label: 'All', icon: '📋', actions: [] },
    auth: { label: 'Auth', icon: '🔐', actions: ['sign_in', 'sign_out', 'identify', 'session_start'] },
    navigation: { label: 'Navigation', icon: '🧭', actions: ['page_view', 'view_vehicle', 'view_fcc', 'scroll_depth'] },
    search: { label: 'Search', icon: '🔍', actions: ['search', 'vin_lookup'] },
    business: { label: 'Business', icon: '💼', actions: ['click_affiliate', 'affiliate_click', 'inventory_add', 'log_job', 'add_comment'] },
    system: { label: 'System', icon: '⚙️', actions: ['engagement', 'error'] },
};

// Action icon helper (expanded)
const actionIcon = (action: string) => {
    const icons: Record<string, string> = {
        'sign_in': '🔑', 'sign_out': '👋', 'identify': '🪪', 'session_start': '🚀',
        'page_view': '👁️', 'view_vehicle': '🚗', 'view_fcc': '📡', 'scroll_depth': '📜',
        'search': '🔍', 'vin_lookup': '🔢',
        'click_affiliate': '💰', 'affiliate_click': '💰', 'inventory_add': '📦',
        'log_job': '📝', 'add_comment': '💬',
        'engagement': '⏱️', 'error': '❌'
    };
    return icons[action] || '📋';
};

// Get category for an action
const getActionCategory = (action: string): string => {
    for (const [category, data] of Object.entries(ACTIVITY_CATEGORIES)) {
        if (data.actions.includes(action)) return category;
    }
    return 'system';
};

const PROOF_TYPE_LABELS: Record<string, string> = {
    nastf_vsp: 'NASTF VSP Card',
    business_license: 'Business License',
    aloa_card: 'ALOA Membership Card',
    state_license: 'State Locksmith License',
    tool_photo: 'Professional Tools',
    insurance_cert: 'Insurance Certificate',
    work_van: 'Work Van / Vehicle',
};

export default function DevPanelPage() {
    const { user, loading, isDeveloper } = useAuth();
    const router = useRouter();

    // State
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
    const [cloudflareStats, setCloudflareStats] = useState<CloudflareStats | null>(null);
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [clickData, setClickData] = useState<ClickData[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [coverageGaps, setCoverageGaps] = useState<CoverageGaps | null>(null);
    const [moderationQueue, setModerationQueue] = useState<ModerationFlag[]>([]);
    const [moderationNotesByFlag, setModerationNotesByFlag] = useState<Record<string, string>>({});
    const [moderationHistory, setModerationHistory] = useState<ModerationHistoryItem[]>([]);
    const [verificationQueue, setVerificationQueue] = useState<PendingVerification[]>([]);
    const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
    const [reviewerRoles, setReviewerRoles] = useState<ReviewerRole[]>([]);
    const [communityConversion, setCommunityConversion] = useState<CommunityConversionData | null>(null);
    const [billingData, setBillingData] = useState<BillingData | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserOverview, setSelectedUserOverview] = useState<UserOverviewResponse | null>(null);
    const [loadingUserOverview, setLoadingUserOverview] = useState(false);
    const [userOverviewError, setUserOverviewError] = useState<string | null>(null);
    const [reviewerTargetUserId, setReviewerTargetUserId] = useState<string>('');
    const [reviewerCanVerification, setReviewerCanVerification] = useState<boolean>(true);
    const [reviewerCanNastf, setReviewerCanNastf] = useState<boolean>(false);
    const [reviewerCanModeration, setReviewerCanModeration] = useState<boolean>(false);
    const [savingReviewerRole, setSavingReviewerRole] = useState<boolean>(false);
    const [resolvingFlagId, setResolvingFlagId] = useState<string | null>(null);
    const [moderationError, setModerationError] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [reviewingVerificationId, setReviewingVerificationId] = useState<string | null>(null);
    const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
    const [verificationRejectReasons, setVerificationRejectReasons] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'gaps' | 'moderation' | 'verification' | 'billing'>('overview');
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);

    const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';
    const MOD_HISTORY_KEY = 'eurokeys:moderation-history';
    const getSessionToken = () => localStorage.getItem('session_token') || localStorage.getItem('auth_token') || '';

    // Fetch all data on mount
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        const token = getSessionToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const [statsRes, cfRes, activityRes, inventoryRes, clicksRes, usersRes, gapsRes, moderationRes, moderationHistoryRes, verificationRes, verificationHistoryRes, reviewerRolesRes, communityConversionRes, billingRes] = await Promise.allSettled([
                fetch(`${API_BASE}/api/admin/stats`, { headers }),
                fetch(`${API_BASE}/api/admin/cloudflare`, { headers }),
                fetch(`${API_BASE}/api/admin/activity?limit=50`, { headers }),
                fetch(`${API_BASE}/api/admin/intelligence/inventory`, { headers }),
                fetch(`${API_BASE}/api/admin/intelligence/clicks`, { headers }),
                fetch(`${API_BASE}/api/admin/users`, { headers }),
                fetch(`${API_BASE}/api/admin/coverage-gaps${categoryFilter ? `?category=${categoryFilter}` : ''}`, { headers }),
                fetch(`${API_BASE}/api/moderation/queue`, { headers }),
                fetch(`${API_BASE}/api/moderation/history?limit=100`, { headers }),
                fetch(`${API_BASE}/api/verification/pending`, { headers }),
                fetch(`${API_BASE}/api/verification/history?limit=150&status=approved`, { headers }),
                fetch(`${API_BASE}/api/reviewer-roles`, { headers }),
                fetch(`${API_BASE}/api/community/conversion?days=30`, { headers }),
                fetch(`${API_BASE}/api/admin/billing`, { headers })
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                setAdminStats(await statsRes.value.json());
            }
            if (cfRes.status === 'fulfilled' && cfRes.value.ok) {
                const data = await cfRes.value.json();
                if (!data.error) setCloudflareStats(data);
            }
            if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
                const data = await activityRes.value.json();
                setActivityLogs(data.activity || []);
            }
            if (inventoryRes.status === 'fulfilled' && inventoryRes.value.ok) {
                const data = await inventoryRes.value.json();
                setInventoryData(data.items || []);
            }
            if (clicksRes.status === 'fulfilled' && clicksRes.value.ok) {
                const data = await clicksRes.value.json();
                setClickData(data.clicks || []);
            }
            if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                const data = await usersRes.value.json();
                setUsers(data.users || []);
            }
            if (gapsRes.status === 'fulfilled' && gapsRes.value.ok) {
                const data = await gapsRes.value.json();
                setCoverageGaps(data);
            }
            if (moderationRes.status === 'fulfilled' && moderationRes.value.ok) {
                const data = await moderationRes.value.json();
                setModerationQueue(data.flags || []);
                setModerationError(null);
            } else if (moderationRes.status === 'fulfilled' && !moderationRes.value.ok) {
                setModerationError('Failed to load moderation queue');
            }
            if (moderationHistoryRes.status === 'fulfilled' && moderationHistoryRes.value.ok) {
                const data = await moderationHistoryRes.value.json();
                setModerationHistory(Array.isArray(data.actions) ? data.actions : []);
            }
            if (verificationRes.status === 'fulfilled' && verificationRes.value.ok) {
                const data = await verificationRes.value.json();
                setVerificationQueue(Array.isArray(data.verifications) ? data.verifications : []);
                setVerificationError(null);
            } else if (verificationRes.status === 'fulfilled' && !verificationRes.value.ok) {
                setVerificationError('Failed to load verification queue');
            }
            if (verificationHistoryRes.status === 'fulfilled' && verificationHistoryRes.value.ok) {
                const data = await verificationHistoryRes.value.json();
                setVerificationHistory(Array.isArray(data.history) ? data.history : []);
            }
            if (reviewerRolesRes.status === 'fulfilled' && reviewerRolesRes.value.ok) {
                const data = await reviewerRolesRes.value.json();
                setReviewerRoles(Array.isArray(data.roles) ? data.roles : []);
            }
            if (communityConversionRes.status === 'fulfilled' && communityConversionRes.value.ok) {
                const data = await communityConversionRes.value.json();
                setCommunityConversion(data || null);
            }
            if (billingRes.status === 'fulfilled' && billingRes.value.ok) {
                const data = await billingRes.value.json();
                setBillingData(data || null);
            }
        } catch (e) {
            console.error('Failed to fetch dev data:', e);
        } finally {
            setIsLoading(false);
        }
    }, [categoryFilter]);

    const parseVehicleKey = (vehicleKey: string): { label: string; href: string } => {
        const raw = String(vehicleKey || '');
        const separator = raw.includes('|') ? '|' : (raw.includes('_') ? '_' : '');
        const parts = (separator ? raw.split(separator) : [raw]).map((part) => part.trim()).filter(Boolean);
        if (parts.length < 2) {
            return { label: raw || 'Vehicle', href: '/browse' };
        }
        let year: string | null = null;
        if (/^\d{4}$/.test(parts[parts.length - 1])) {
            year = parts.pop() || null;
        }
        const make = parts[0];
        const model = parts.slice(1).join(' ');
        const label = `${make} ${model}${year ? ` ${year}` : ''}`.trim();
        const href = year
            ? `/vehicle/${encodeURIComponent(make.toLowerCase())}/${encodeURIComponent(model.toLowerCase())}/${year}#comments`
            : `/browse?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
        return { label, href };
    };

    const resolveModerationFlag = async (
        flag: ModerationFlag,
        resolution: 'dismissed' | 'deleted' | 'warning_issued',
        deleteComment: boolean
    ) => {
        const token = getSessionToken();
        if (!token) {
            setModerationError('Missing session token');
            return;
        }
        const moderatorNote = (moderationNotesByFlag[flag.flag_id] || '').trim();
        setResolvingFlagId(flag.flag_id);
        setModerationError(null);
        try {
            const response = await fetch(`${API_BASE}/api/moderation/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    flag_id: flag.flag_id,
                    resolution,
                    delete_comment: deleteComment,
                    note: moderatorNote || undefined,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to resolve report');
            }
            setModerationQueue((prev) => prev.filter((item) => item.flag_id !== flag.flag_id));
            setModerationNotesByFlag((prev) => {
                const next = { ...prev };
                delete next[flag.flag_id];
                return next;
            });
            setModerationHistory((prev) => [{
                id: `mod_history_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                flag_id: flag.flag_id,
                comment_id: flag.comment_id,
                vehicle_key: flag.vehicle_key,
                resolution,
                delete_comment: deleteComment,
                note: moderatorNote || null,
                resolved_at: Date.now(),
                moderator_name: user?.name || null,
                moderator_email: user?.email || null,
            }, ...prev].slice(0, 100));
        } catch (err: any) {
            setModerationError(err?.message || 'Failed to resolve report');
        } finally {
            setResolvingFlagId(null);
        }
    };

    const reviewVerificationProof = async (proofId: string, action: 'approve' | 'reject') => {
        const token = getSessionToken();
        if (!token) {
            setVerificationError('Missing session token');
            return;
        }

        const rejectionReason = (verificationRejectReasons[proofId] || '').trim();
        const adminNotes = (verificationNotes[proofId] || '').trim();
        if (action === 'reject' && !rejectionReason) {
            setVerificationError('Rejection reason is required to reject a proof.');
            return;
        }

        setReviewingVerificationId(proofId);
        setVerificationError(null);

        try {
            const response = await fetch(`${API_BASE}/api/verification/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    proof_id: proofId,
                    action,
                    rejection_reason: action === 'reject' ? rejectionReason : undefined,
                    admin_notes: adminNotes || undefined,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || `Failed to ${action} proof`);
            }

            setVerificationQueue((prev) => prev.filter((item) => item.id !== proofId));
        } catch (err: any) {
            setVerificationError(err?.message || `Failed to ${action} proof`);
        } finally {
            setReviewingVerificationId(null);
        }
    };

    const fetchUserOverview = async (targetUserId: string) => {
        const token = getSessionToken();
        if (!token) {
            setUserOverviewError('Missing session token');
            return;
        }
        setSelectedUserId(targetUserId);
        setLoadingUserOverview(true);
        setUserOverviewError(null);
        try {
            const response = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(targetUserId)}/overview`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load user details');
            }
            setSelectedUserOverview(data as UserOverviewResponse);
        } catch (err: any) {
            setUserOverviewError(err?.message || 'Failed to load user details');
            setSelectedUserOverview(null);
        } finally {
            setLoadingUserOverview(false);
        }
    };

    const openUserSupportView = (targetUserId: string) => {
        setActiveTab('users');
        void fetchUserOverview(targetUserId);
    };

    const saveReviewerRole = async () => {
        const token = getSessionToken();
        if (!token) {
            setVerificationError('Missing session token');
            return;
        }
        if (!reviewerTargetUserId) {
            setVerificationError('Select a user before saving reviewer role.');
            return;
        }

        setSavingReviewerRole(true);
        setVerificationError(null);
        try {
            const response = await fetch(`${API_BASE}/api/reviewer-roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: reviewerTargetUserId,
                    can_review_verification: reviewerCanVerification,
                    can_review_nastf: reviewerCanNastf,
                    can_moderate_community: reviewerCanModeration,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save reviewer role');
            }
            await fetchAllData();
        } catch (err: any) {
            setVerificationError(err?.message || 'Failed to save reviewer role');
        } finally {
            setSavingReviewerRole(false);
        }
    };

    // Redirect non-developers
    useEffect(() => {
        if (!loading && (!user || !isDeveloper)) {
            router.replace('/');
        }
    }, [user, loading, isDeveloper, router]);

    useEffect(() => {
        if (user && isDeveloper) {
            fetchAllData();
        }
    }, [user, isDeveloper, fetchAllData]);

    useEffect(() => {
        if (typeof window === 'undefined' || !user || !isDeveloper) return;
        try {
            const raw = localStorage.getItem(MOD_HISTORY_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
                setModerationHistory(parsed.slice(0, 100));
            }
        } catch {
            // Ignore malformed local moderation history.
        }
    }, [user, isDeveloper, MOD_HISTORY_KEY]);

    useEffect(() => {
        if (typeof window === 'undefined' || !user || !isDeveloper) return;
        try {
            localStorage.setItem(MOD_HISTORY_KEY, JSON.stringify(moderationHistory.slice(0, 100)));
        } catch {
            // Ignore localStorage write failures.
        }
    }, [moderationHistory, user, isDeveloper, MOD_HISTORY_KEY]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-eurokeys-purple border-t-transparent" />
            </div>
        );
    }

    if (!user || !isDeveloper) return null;

    // Extract top vehicles from activity logs (database-backed, not Cloudflare)
    const topVehicles = (adminStats?.top_vehicle_views || []).slice(0, 8).map((v: any) => ({
        make: v.make,
        model: v.model,
        year: v.year,
        count: v.view_count
    }));

    const selectedDashboard = selectedUserOverview?.dashboard;
    const selectedSubscription = selectedDashboard?.subscription;
    const selectedBehavior = selectedDashboard?.behavior;
    const selectedTier = selectedSubscription?.tier
        || (selectedUserOverview?.user?.is_developer ? 'developer' : selectedUserOverview?.user?.is_pro ? 'pro' : 'free');
    const selectedTopActions = selectedBehavior?.top_actions || [];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">🛠️ Developer Panel</h1>
                    <p className="mt-1 text-slate-400">Admin tools and system monitoring</p>
                </div>
                <button
                    onClick={fetchAllData}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg bg-eurokeys-purple/20 px-4 py-2 text-sm font-medium text-eurokeys-purple transition-colors hover:bg-eurokeys-purple/30 disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <span>🔄</span>
                    )}
                    Refresh
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-2 border-b border-eurokeys-border pb-2">
                {(['overview', 'users', 'activity', 'gaps', 'verification', 'moderation', 'billing'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                            ? 'bg-eurokeys-purple/20 text-eurokeys-purple'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        {tab === 'overview' && '📊 Overview'}
                        {tab === 'users' && '👥 Users'}
                        {tab === 'activity' && '📋 Activity'}
                        {tab === 'gaps' && '🔍 Coverage Gaps'}
                        {tab === 'verification' && `🪪 Verification (${verificationQueue.length})`}
                        {tab === 'moderation' && `🛡️ Moderation (${moderationQueue.length})`}
                        {tab === 'billing' && `💳 Billing (${billingData?.summary?.totalCustomers || 0})`}
                    </button>
                ))}
            </div>

            {/* Current Session Card */}
            <div className="mb-6 rounded-xl border border-eurokeys-border bg-gradient-to-r from-eurokeys-card to-eurokeys-purple/5 p-5">
                <div className="flex items-center gap-4">
                    {user.picture && (
                        <img src={user.picture} alt="" className="h-12 w-12 rounded-full ring-2 ring-eurokeys-purple/30" />
                    )}
                    <div className="flex-1">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                        Developer
                    </span>
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Overview Stats Row */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Active Users (30d)"
                            value={adminStats?.visitor_stats?.active_users || 0}
                            icon="👥"
                            trend={adminStats?.user_growth ? `+${adminStats.user_growth} this week` : undefined}
                        />
                        <StatCard
                            label="Total Events"
                            value={adminStats?.visitor_stats?.total_events || 0}
                            icon="📊"
                        />
                        <StatCard
                            label="Visitors (24h)"
                            value={cloudflareStats?.last24h?.visitors != null ? cloudflareStats.last24h.visitors : 'N/A'}
                            icon="👁️"
                            subtext={cloudflareStats?.last24h
                                ? `${cloudflareStats.last24h.requests.toLocaleString()} requests`
                                : 'Cloudflare not configured'}
                        />
                        <StatCard
                            label="Cache Rate"
                            value={cloudflareStats?.tech?.cacheRate != null ? `${cloudflareStats.tech.cacheRate}%` : 'N/A'}
                            icon="⚡"
                            color={parseFloat(cloudflareStats?.tech?.cacheRate || '0') > 80 ? 'green' : cloudflareStats ? 'yellow' : undefined}
                            subtext={!cloudflareStats ? 'Cloudflare not configured' : undefined}
                        />
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Top Vehicles */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    🚗 Most Viewed Vehicles
                                </h2>
                                {topVehicles.length > 0 ? (
                                    <div className="space-y-2">
                                        {topVehicles.map((v, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-slate-500">#{i + 1}</span>
                                                    <div>
                                                        <p className="font-medium text-white capitalize">
                                                            {v.year} {v.make?.replace(/-/g, ' ')} {v.model?.replace(/-/g, ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-eurokeys-purple/20 px-2 py-1 text-xs font-medium text-eurokeys-purple">
                                                    {v.count?.toLocaleString()} views
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No vehicle views recorded yet
                                    </p>
                                )}
                            </div>

                            {/* Top Searches */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    🔍 Top Searches
                                </h2>
                                {adminStats?.top_searches?.length ? (
                                    <div className="space-y-2">
                                        {adminStats.top_searches.slice(0, 8).map((s, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                                                <span className="font-mono text-sm text-slate-300">{s.query || '(empty)'}</span>
                                                <span className="text-xs text-slate-500">{s.count}x</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No search data</p>
                                )}
                            </div>

                            {/* Inventory Intelligence */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    📦 Popular Inventory Items
                                </h2>
                                {inventoryData.length > 0 ? (
                                    <div className="space-y-2">
                                        {inventoryData.slice(0, 6).map((item, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{item.item_key}</p>
                                                    <p className="text-xs text-slate-500">{item.type} • {item.user_count} users</p>
                                                </div>
                                                <span className="text-sm font-bold text-eurokeys-purple">{item.total_qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No inventory data</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Traffic & Geo */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    🌍 Traffic by Country (7d)
                                </h2>
                                {cloudflareStats?.marketing?.topCountries?.length ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {cloudflareStats.marketing.topCountries.slice(0, 8).map((c, i) => (
                                            <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-2">
                                                <span className="text-lg">{countryFlag(c.country)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">{c.country}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">{c.requests?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Cloudflare not configured</p>
                                )}
                            </div>

                            {/* Device Breakdown */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    📱 Device Distribution
                                </h2>
                                {cloudflareStats?.marketing?.devices?.length ? (
                                    <div className="space-y-3">
                                        {cloudflareStats.marketing.devices.map((d, i) => {
                                            const total = cloudflareStats.marketing.devices.reduce((sum, x) => sum + x.requests, 0);
                                            const pct = total > 0 ? (d.requests / total) * 100 : 0;
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-slate-300 capitalize">{d.device || 'unknown'}</span>
                                                        <span className="text-slate-500">{pct.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-eurokeys-purple to-blue-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No device data</p>
                                )}
                            </div>

                            {/* System Health */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    💚 System Health
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <HealthIndicator
                                        label="Error Rate"
                                        value={`${cloudflareStats?.tech?.errorRate || '0'}%`}
                                        status={parseFloat(cloudflareStats?.tech?.errorRate || '0') < 1 ? 'good' : parseFloat(cloudflareStats?.tech?.errorRate || '0') < 5 ? 'warning' : 'error'}
                                    />
                                    <HealthIndicator
                                        label="Cache Hit"
                                        value={`${cloudflareStats?.tech?.cacheRate || '0'}%`}
                                        status={parseFloat(cloudflareStats?.tech?.cacheRate || '0') > 80 ? 'good' : 'warning'}
                                    />
                                    <HealthIndicator
                                        label="Threats Blocked"
                                        value={cloudflareStats?.last7d?.threats?.toString() || '0'}
                                        status="good"
                                    />
                                    <HealthIndicator
                                        label="Data Served (7d)"
                                        value={formatBytes(cloudflareStats?.last7d?.bytesServed || 0)}
                                        status="neutral"
                                    />
                                </div>

                                {/* Status Code Breakdown */}
                                {cloudflareStats?.tech?.statusGroups && (
                                    <div className="mt-4 pt-4 border-t border-eurokeys-border">
                                        <p className="text-xs text-slate-500 mb-2">Response Codes</p>
                                        <div className="flex gap-2">
                                            {Object.entries(cloudflareStats.tech.statusGroups).map(([code, count]) => (
                                                <span
                                                    key={code}
                                                    className={`rounded px-2 py-1 text-xs font-mono ${code === '2xx' ? 'bg-green-500/20 text-green-400' :
                                                        code === '3xx' ? 'bg-blue-500/20 text-blue-400' :
                                                            code === '4xx' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                        }`}
                                                >
                                                    {code}: {count?.toLocaleString()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Community Conversion Funnel */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                        🧭 Community Conversion (30d)
                                    </h2>
                                    <span className="text-xs text-slate-500">Reviewer + Verification Funnel</span>
                                </div>
                                {!communityConversion ? (
                                    <p className="text-sm text-slate-500">No conversion data yet.</p>
                                ) : (
                                    <>
                                        <div className="mb-3 grid grid-cols-2 gap-2">
                                            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2.5">
                                                <p className="text-[11px] uppercase tracking-wide text-slate-500">Review Pass</p>
                                                <p className="text-lg font-semibold text-emerald-300">{communityConversion.conversion.review_pass_rate}%</p>
                                            </div>
                                            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2.5">
                                                <p className="text-[11px] uppercase tracking-wide text-slate-500">Commenter to Verified</p>
                                                <p className="text-lg font-semibold text-blue-300">{communityConversion.conversion.commenter_to_verified_rate}%</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {communityConversion.funnel.map((stage) => (
                                                <div key={stage.stage} className="flex items-center justify-between rounded-lg bg-slate-900/45 px-3 py-2">
                                                    <span className="text-xs text-slate-300">{stage.stage}</span>
                                                    <span className="text-sm font-semibold text-white">{stage.value.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Affiliate Performance */}
                            <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    💰 Affiliate Clicks
                                </h2>
                                {clickData.length > 0 ? (
                                    <div className="space-y-2">
                                        {clickData.slice(0, 5).map((c, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{c.term || c.fcc_id || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{c.distinct_users} unique users</p>
                                                </div>
                                                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                                                    {c.count} clicks
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No click data</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <h2 className="mb-4 text-lg font-semibold text-white">All Users ({users.length})</h2>
                        <p className="mb-3 text-xs text-slate-500">Click a user name to open inventory, activity, and verification support details.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-eurokeys-border text-left text-slate-400">
                                        <th className="pb-3 font-medium">User</th>
                                        <th className="pb-3 font-medium">Email</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Activity</th>
                                        <th className="pb-3 font-medium">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const isSelected = selectedUserId === u.id;
                                        return (
                                            <tr key={u.id} className={`border-b border-eurokeys-border/50 ${isSelected ? 'bg-eurokeys-purple/10' : ''}`}>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        {u.picture && <img src={u.picture} alt="" className="h-8 w-8 rounded-full" />}
                                                        <button
                                                            type="button"
                                                            onClick={() => void fetchUserOverview(u.id)}
                                                            className="font-medium text-white hover:text-eurokeys-purple underline-offset-2 hover:underline"
                                                        >
                                                            {u.name || u.email}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-slate-400">{u.email}</td>
                                                <td className="py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.is_developer && (
                                                            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">Dev</span>
                                                        )}
                                                        {u.is_pro && (
                                                            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">Pro</span>
                                                        )}
                                                        {u.subscription_status && (
                                                            <span className={`rounded px-2 py-0.5 text-xs ${u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                                u.subscription_status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                                                                    u.subscription_status === 'canceled' ? 'bg-red-500/20 text-red-400' :
                                                                        'bg-slate-500/20 text-slate-400'
                                                                }`}>{u.subscription_status}</span>
                                                        )}
                                                        {u.stripe_customer_id && (
                                                            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">Stripe</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-slate-300">{u.activity_count || 0} events</td>
                                                <td className="py-3 text-slate-500">{u.last_activity ? timeAgo(u.last_activity) : 'Never'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white">User Support View</h3>
                            {selectedUserOverview?.user?.id && (
                                <button
                                    type="button"
                                    onClick={() => void fetchUserOverview(selectedUserOverview.user.id)}
                                    className="rounded border border-slate-600 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700"
                                >
                                    Refresh
                                </button>
                            )}
                        </div>
                        {!selectedUserId ? (
                            <p className="text-sm text-slate-500">Select a user from the table.</p>
                        ) : loadingUserOverview ? (
                            <p className="text-sm text-slate-400">Loading user details...</p>
                        ) : userOverviewError ? (
                            <p className="text-sm text-red-300">{userOverviewError}</p>
                        ) : !selectedUserOverview ? (
                            <p className="text-sm text-slate-500">No user details loaded.</p>
                        ) : (
                            <div className="space-y-3 text-xs">
                                <div className="rounded border border-slate-700 bg-slate-900/60 p-2.5">
                                    <p className="font-semibold text-slate-100">{selectedUserOverview.user.name || selectedUserOverview.user.email}</p>
                                    <p className="text-slate-400">{selectedUserOverview.user.email}</p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {(selectedUserOverview.user.locksmith_verified || selectedUserOverview.user.nastf_verified) ? (
                                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] text-emerald-300">Verified</span>
                                        ) : (
                                            <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-300">Unverified</span>
                                        )}
                                        {selectedUserOverview.user.verification_level && (
                                            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[11px] text-blue-300">
                                                {selectedUserOverview.user.verification_level}
                                            </span>
                                        )}
                                        <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[11px] text-violet-300">
                                            Tier: {String(selectedTier).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded border border-slate-700 bg-slate-900/60 p-2.5">
                                    <p className="mb-1 font-semibold text-slate-200">Quick User Dashboard</p>
                                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Clicks 7d</p>
                                            <p className="font-semibold text-slate-100">{selectedBehavior?.last_7d?.clicks || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Searches 7d</p>
                                            <p className="font-semibold text-slate-100">{selectedBehavior?.last_7d?.searches || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Comments 30d</p>
                                            <p className="font-semibold text-slate-100">{selectedBehavior?.last_30d?.comments || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Votes 30d</p>
                                            <p className="font-semibold text-slate-100">{selectedBehavior?.last_30d?.votes_cast || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Vehicle Views 30d</p>
                                            <p className="font-semibold text-slate-100">{selectedBehavior?.last_30d?.vehicle_views || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Events Total</p>
                                            <p className="font-semibold text-slate-100">{selectedBehavior?.totals?.events || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Tool Subs</p>
                                            <p className="font-semibold text-slate-100">{selectedSubscription?.tool_subscription_count || 0}</p>
                                        </div>
                                        <div className="rounded bg-slate-950/60 px-2 py-1.5">
                                            <p className="text-slate-500">Active Add-ons</p>
                                            <p className="font-semibold text-slate-100">{selectedSubscription?.active_addons?.length || 0}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 rounded bg-slate-950/60 px-2 py-1.5">
                                        <p className="text-[11px] text-slate-500">Trial Until</p>
                                        <p className="font-medium text-slate-200">
                                            {selectedSubscription?.trial_until
                                                ? `${formatDateTime(selectedSubscription.trial_until)} (${relativeTime(selectedSubscription.trial_until)})`
                                                : 'No active trial'}
                                        </p>
                                    </div>
                                    <div className="mt-2 rounded bg-slate-950/60 px-2 py-1.5">
                                        <p className="mb-1 text-[11px] text-slate-500">Top Actions</p>
                                        {selectedTopActions.length === 0 ? (
                                            <p className="text-slate-500">No action data yet</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTopActions.map((item) => (
                                                    <span key={`${item.action}-${item.count}`} className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300">
                                                        {formatActionLabel(item.action)}: {item.count}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded border border-slate-700 bg-slate-900/60 p-2.5">
                                    <p className="mb-1 font-semibold text-slate-200">Inventory Snapshot</p>
                                    <p className="text-slate-400">
                                        Total {selectedUserOverview.inventory.summary.total_qty || 0} items
                                        ({selectedUserOverview.inventory.summary.keys_qty || 0} keys, {selectedUserOverview.inventory.summary.blanks_qty || 0} blanks)
                                    </p>
                                    <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                                        {selectedUserOverview.inventory.items.length === 0 ? (
                                            <p className="text-slate-500">No inventory rows</p>
                                        ) : selectedUserOverview.inventory.items.slice(0, 20).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between rounded bg-slate-950/60 px-2 py-1">
                                                <span className="text-slate-300">{item.item_key}</span>
                                                <span className="text-slate-400">{item.qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded border border-slate-700 bg-slate-900/60 p-2.5">
                                    <p className="mb-1 font-semibold text-slate-200">Verification History</p>
                                    <div className="max-h-36 space-y-1 overflow-y-auto">
                                        {selectedUserOverview.verification.proofs.length === 0 ? (
                                            <p className="text-slate-500">No proof records</p>
                                        ) : selectedUserOverview.verification.proofs.slice(0, 20).map((proof) => (
                                            <div key={proof.id} className="rounded bg-slate-950/60 px-2 py-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-300">{PROOF_TYPE_LABELS[proof.proof_type] || proof.proof_type}</span>
                                                    <span className={`${proof.status === 'approved' ? 'text-emerald-300' : proof.status === 'rejected' ? 'text-red-300' : 'text-amber-300'}`}>
                                                        {proof.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    {proof.reviewed_at ? timeAgo(proof.reviewed_at) : timeAgo(proof.created_at)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded border border-slate-700 bg-slate-900/60 p-2.5">
                                    <p className="mb-1 font-semibold text-slate-200">Recent Activity</p>
                                    <div className="max-h-36 space-y-1 overflow-y-auto">
                                        {selectedUserOverview.activity.length === 0 ? (
                                            <p className="text-slate-500">No activity rows</p>
                                        ) : selectedUserOverview.activity.slice(0, 25).map((a) => (
                                            <div key={`${a.id}-${a.created_at}`} className="flex items-center justify-between rounded bg-slate-950/60 px-2 py-1">
                                                <span className="text-slate-300">{a.action.replace(/_/g, ' ')}</span>
                                                <span className="text-[11px] text-slate-500">{timeAgo(a.created_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (() => {
                // Filter logs by category
                const filteredLogs = activityFilter === 'all'
                    ? activityLogs
                    : activityLogs.filter(log => ACTIVITY_CATEGORIES[activityFilter]?.actions.includes(log.action));

                // Count activities per category
                const categoryCounts = Object.keys(ACTIVITY_CATEGORIES).reduce((acc, cat) => {
                    if (cat === 'all') {
                        acc[cat] = activityLogs.length;
                    } else {
                        acc[cat] = activityLogs.filter(log => ACTIVITY_CATEGORIES[cat].actions.includes(log.action)).length;
                    }
                    return acc;
                }, {} as Record<string, number>);

                return (
                    <div className="space-y-4">
                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(ACTIVITY_CATEGORIES).map(([key, cat]) => (
                                <button
                                    key={key}
                                    onClick={() => setActivityFilter(key)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${activityFilter === key
                                        ? 'bg-eurokeys-purple text-white'
                                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${activityFilter === key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {categoryCounts[key] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Activity List */}
                        <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">
                                    Recent Activity
                                    {activityFilter !== 'all' && (
                                        <span className="ml-2 text-sm font-normal text-slate-400">
                                            ({ACTIVITY_CATEGORIES[activityFilter]?.label})
                                        </span>
                                    )}
                                </h2>
                                <span className="text-sm text-slate-500">
                                    {filteredLogs.length} events
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredLogs.map(log => {
                                    const isExpanded = expandedActivityId === log.id;
                                    const category = getActionCategory(log.action);
                                    let parsedDetails: any = null;
                                    try {
                                        parsedDetails = log.details ? JSON.parse(log.details) : null;
                                    } catch {
                                        parsedDetails = log.details;
                                    }

                                    return (
                                        <div
                                            key={log.id}
                                            className={`rounded-lg bg-slate-800/50 transition-all ${isExpanded ? 'ring-1 ring-eurokeys-purple/50' : ''}`}
                                        >
                                            <button
                                                onClick={() => setExpandedActivityId(isExpanded ? null : log.id)}
                                                className="flex items-start gap-3 p-3 w-full text-left"
                                            >
                                                <span className="text-xl flex-shrink-0">{actionIcon(log.action)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-white">{log.action.replace(/_/g, ' ')}</span>
                                                        <span className={`rounded px-1.5 py-0.5 text-xs ${category === 'auth' ? 'bg-green-500/20 text-green-400' :
                                                            category === 'navigation' ? 'bg-blue-500/20 text-blue-400' :
                                                                category === 'search' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    category === 'business' ? 'bg-purple-500/20 text-purple-400' :
                                                                        'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                            {ACTIVITY_CATEGORIES[category]?.label || category}
                                                        </span>
                                                        {log.user_name && (
                                                            <span className="text-sm text-slate-400">by {log.user_name}</span>
                                                        )}
                                                    </div>
                                                    {!isExpanded && log.details && (
                                                        <p className="mt-1 truncate text-xs text-slate-500 font-mono max-w-lg">
                                                            {typeof parsedDetails === 'object'
                                                                ? Object.entries(parsedDetails).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
                                                                : log.details.substring(0, 100)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(log.created_at)}</span>
                                                    <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                        ▼
                                                    </span>
                                                </div>
                                            </button>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="px-3 pb-3 pt-0">
                                                    <div className="rounded-lg bg-slate-900/70 p-3 space-y-2">
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-slate-500">User ID:</span>
                                                                <span className="ml-2 font-mono text-slate-300">{log.user_id}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Email:</span>
                                                                <span className="ml-2 text-slate-300">{log.user_email || 'N/A'}</span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-slate-500">User Agent:</span>
                                                                <span className="ml-2 font-mono text-slate-400 text-xs break-all">{log.user_agent}</span>
                                                            </div>
                                                        </div>
                                                        {parsedDetails && (
                                                            <div className="mt-2 pt-2 border-t border-slate-700">
                                                                <p className="text-xs text-slate-500 mb-1">Details:</p>
                                                                <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                                                    {typeof parsedDetails === 'object'
                                                                        ? JSON.stringify(parsedDetails, null, 2)
                                                                        : parsedDetails}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {filteredLogs.length === 0 && (
                                    <p className="text-sm text-slate-500 py-4 text-center">
                                        {activityFilter === 'all'
                                            ? 'No activity logs'
                                            : `No ${ACTIVITY_CATEGORIES[activityFilter]?.label.toLowerCase()} activity`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {activeTab === 'gaps' && (
                <div className="space-y-6">
                    {/* Category Filter Buttons */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-slate-500 uppercase tracking-wide mr-2">Filter by Category:</span>
                        {[
                            { key: null, label: 'All', icon: '📊' },
                            { key: 'vehicle_platform', label: 'Platforms', icon: '🚗' },
                            { key: 'immo_system', label: 'IMMO Systems', icon: '🔐' },
                            { key: 'security_module', label: 'Modules', icon: '🛡️' },
                            { key: 'chip_protocol', label: 'Chips', icon: '💾' }
                        ].map((cat) => (
                            <button
                                key={cat.key || 'all'}
                                onClick={async () => {
                                    setCategoryFilter(cat.key);
                                    // Re-fetch with new filter
                                    const token = localStorage.getItem('session_token');
                                    const res = await fetch(`https://euro-keys.jeremy-samuels17.workers.dev/api/admin/coverage-gaps${cat.key ? `?category=${cat.key}` : ''}`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (res.ok) setCoverageGaps(await res.json());
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${categoryFilter === cat.key
                                    ? 'bg-eurokeys-purple text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                {coverageGaps?.category_breakdown?.find(c => c.category === cat.key)?.total && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 text-[10px]">
                                        {coverageGaps.category_breakdown.find(c => c.category === cat.key)?.total}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Summary Stats - Two Rows */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Platform Security Gaps</h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                label="Total Platforms"
                                value={coverageGaps?.summary?.total_platforms || 0}
                                icon="📦"
                            />
                            <StatCard
                                label="Missing Coverage"
                                value={coverageGaps?.summary?.missing_coverage || 0}
                                icon="❌"
                                color="red"
                            />
                            <StatCard
                                label="Thin Coverage"
                                value={coverageGaps?.summary?.thin_coverage || 0}
                                icon="⚠️"
                                color="yellow"
                            />
                        </div>
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide pt-2">Vehicle Data Gaps</h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                label="No Tool Coverage"
                                value={coverageGaps?.summary?.vehicles_without_coverage || 0}
                                icon="🔧"
                                color="red"
                            />
                            <StatCard
                                label="No FCC Data"
                                value={coverageGaps?.summary?.vehicles_without_fcc || 0}
                                icon="📡"
                                color="yellow"
                            />
                            <StatCard
                                label="No Content"
                                value={coverageGaps?.summary?.vehicles_without_content || 0}
                                icon="📚"
                                color="yellow"
                            />
                        </div>
                    </div>

                    {/* Critical Gaps - Priority */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                🚨 Critical Gaps (High Security, Low Coverage)
                            </h2>
                            {coverageGaps?.critical_gaps?.source && (
                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                    {coverageGaps.critical_gaps.source}
                                </span>
                            )}
                        </div>
                        {coverageGaps?.critical_gaps?.data?.length ? (
                            <div className="space-y-2">
                                {coverageGaps.critical_gaps.data.map((g, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                                        <div>
                                            <p className="font-medium text-white capitalize">
                                                {g.make} • {g.platform_code}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {g.year_start}–{g.year_end} • Security: {g.security_level} • AKL: {g.akl_typical}
                                            </p>
                                            {g.notes && (
                                                <p className="text-xs text-slate-400 mt-1">{g.notes}</p>
                                            )}
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${g.coverage_count === 0
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {g.coverage_count} records
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No critical gaps found</p>
                        )}
                    </div>

                    {/* Vehicle Gaps (NEW) */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    🚗 Vehicles Without Tool Coverage
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">{coverageGaps?.vehicle_gaps?.description}</p>
                            </div>
                            {coverageGaps?.vehicle_gaps?.source && (
                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                    {coverageGaps.vehicle_gaps.source}
                                </span>
                            )}
                        </div>
                        {coverageGaps?.vehicle_gaps?.count ? (
                            <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
                                <span className="text-4xl font-bold text-red-400">
                                    {coverageGaps.vehicle_gaps.count}
                                </span>
                                <span className="text-slate-400">vehicle make/model combinations without tool coverage data</span>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">All vehicles have tool coverage data</p>
                        )}
                    </div>

                    {/* Makes with Gaps */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                🏭 Coverage by Make
                            </h2>
                            {coverageGaps?.make_gaps?.source && (
                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                    {coverageGaps.make_gaps.source}
                                </span>
                            )}
                        </div>
                        {coverageGaps?.make_gaps?.data?.length ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {coverageGaps.make_gaps.data.map((m, i) => (
                                    <div key={i} className="rounded-lg border border-eurokeys-border bg-slate-800/30 p-3">
                                        <p className="font-medium text-white capitalize mb-2">{m.make}</p>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>Platforms: {m.total_platforms}</span>
                                            <span className="text-green-400">✓ {m.covered_platforms}</span>
                                            <span className="text-red-400">✗ {m.missing_platforms}</span>
                                        </div>
                                        <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-eurokeys-purple"
                                                style={{ width: `${(m.covered_platforms / m.total_platforms) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No make data available</p>
                        )}
                    </div>

                    {/* Era Breakdown */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                📅 Coverage by Era
                            </h2>
                            {coverageGaps?.era_gaps?.source && (
                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                    {coverageGaps.era_gaps.source}
                                </span>
                            )}
                        </div>
                        {coverageGaps?.era_gaps?.data?.length ? (
                            <div className="space-y-3">
                                {coverageGaps.era_gaps.data.map((e, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                                        <div>
                                            <p className="font-medium text-white">{e.era_description}</p>
                                            <p className="text-xs text-slate-500">
                                                AKL Difficulty: <span className={
                                                    e.akl_difficulty === 'low' ? 'text-green-400' :
                                                        e.akl_difficulty === 'medium' ? 'text-yellow-400' :
                                                            e.akl_difficulty === 'high' ? 'text-orange-400' :
                                                                'text-red-400'
                                                }>{e.akl_difficulty}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-eurokeys-purple">{e.coverage_count}</p>
                                            <p className="text-xs text-slate-500">{e.makes_covered} makes</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No era data available</p>
                        )}
                    </div>

                    {/* FCC Gaps */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    📡 Vehicles Without FCC Data
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">{coverageGaps?.fcc_gaps?.description}</p>
                            </div>
                            {coverageGaps?.fcc_gaps?.source && (
                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                    {coverageGaps.fcc_gaps.source}
                                </span>
                            )}
                        </div>
                        {coverageGaps?.fcc_gaps?.count ? (
                            <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
                                <span className="text-4xl font-bold text-yellow-400">
                                    {coverageGaps.fcc_gaps.count}
                                </span>
                                <span className="text-slate-400">vehicle make/model combinations without FCC ID mappings</span>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">All vehicles have FCC data</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'verification' && (
                <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Locksmith Verification Review Queue</h2>
                        <button
                            onClick={fetchAllData}
                            disabled={isLoading}
                            className="rounded-lg border border-eurokeys-border bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                        >
                            Refresh Queue
                        </button>
                    </div>

                    <p className="mb-4 text-sm text-slate-400">
                        Review pending proof submissions including NASTF, licenses, and membership cards.
                    </p>

                    <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Reviewer Role Access</p>
                        <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_auto_auto_auto_auto] md:items-center">
                            <select
                                className="rounded border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-200"
                                value={reviewerTargetUserId}
                                onChange={(e) => setReviewerTargetUserId(e.target.value)}
                                disabled={savingReviewerRole}
                            >
                                <option value="">Select user...</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name || u.email} ({u.email})
                                    </option>
                                ))}
                            </select>
                            <label className="flex items-center gap-1.5 text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={reviewerCanVerification}
                                    onChange={(e) => setReviewerCanVerification(e.target.checked)}
                                    disabled={savingReviewerRole}
                                />
                                Verify
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={reviewerCanNastf}
                                    onChange={(e) => setReviewerCanNastf(e.target.checked)}
                                    disabled={savingReviewerRole}
                                />
                                NASTF
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={reviewerCanModeration}
                                    onChange={(e) => setReviewerCanModeration(e.target.checked)}
                                    disabled={savingReviewerRole}
                                />
                                Moderation
                            </label>
                            <button
                                type="button"
                                onClick={saveReviewerRole}
                                disabled={savingReviewerRole}
                                className="rounded border border-blue-500/40 bg-blue-500/15 px-2.5 py-1.5 text-xs font-medium text-blue-200 hover:bg-blue-500/25 disabled:opacity-50"
                            >
                                {savingReviewerRole ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        <div className="mt-3 space-y-1">
                            {reviewerRoles.length === 0 ? (
                                <p className="text-xs text-slate-500">No reviewer roles assigned.</p>
                            ) : (
                                reviewerRoles.slice(0, 12).map((role) => (
                                    <div key={role.user_id} className="flex flex-wrap items-center justify-between rounded border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-xs">
                                        <span className="text-slate-200">
                                            {role.user_name || role.user_email || role.user_id}
                                        </span>
                                        <span className="text-slate-400">
                                            {role.can_review_verification ? 'Verify' : ''}
                                            {role.can_review_verification && role.can_review_nastf ? ' • ' : ''}
                                            {role.can_review_nastf ? 'NASTF' : ''}
                                            {(role.can_review_verification || role.can_review_nastf) && role.can_moderate_community ? ' • ' : ''}
                                            {role.can_moderate_community ? 'Moderation' : ''}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {verificationError && (
                        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {verificationError}
                        </div>
                    )}

                    {verificationQueue.length === 0 ? (
                        <div className="rounded-lg border border-eurokeys-border bg-slate-800/40 px-4 py-5 text-sm text-slate-400">
                            No pending verification proofs.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {verificationQueue.map((proof) => {
                                const isReviewing = reviewingVerificationId === proof.id;
                                const proofUrl = normalizeProofUrl(proof.proof_image_url);
                                return (
                                    <div key={proof.id} className="rounded-xl border border-eurokeys-border bg-slate-900/60 p-4">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300">
                                                        {PROOF_TYPE_LABELS[proof.proof_type] || proof.proof_type}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {timeAgo(proof.created_at)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-300">
                                                    <button
                                                        type="button"
                                                        onClick={() => openUserSupportView(proof.user_id)}
                                                        className="text-left hover:text-eurokeys-purple hover:underline"
                                                    >
                                                        {proof.user_name || 'Unknown User'} {proof.user_email ? `(${proof.user_email})` : ''}
                                                    </button>
                                                </p>
                                            </div>
                                        </div>

                                        {proofUrl ? (
                                            <>
                                                <div className="mb-2 flex flex-wrap gap-2">
                                                    <a
                                                        href={proofUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded border border-blue-500/40 bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-200 hover:bg-blue-500/25"
                                                    >
                                                        Open Proof
                                                    </a>
                                                    <a
                                                        href={proofUrl}
                                                        download
                                                        className="rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                                <a
                                                    href={proofUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mb-2 block w-fit"
                                                >
                                                    <img
                                                        src={proofUrl}
                                                        alt={`${PROOF_TYPE_LABELS[proof.proof_type] || proof.proof_type} proof`}
                                                        className="max-h-64 rounded-lg border border-slate-700 object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </a>
                                                <p className="mb-3 break-all text-[11px] text-slate-500">{proofUrl}</p>
                                            </>
                                        ) : (
                                            <div className="mb-3 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                                Proof file URL is missing for this submission.
                                            </div>
                                        )}

                                        <textarea
                                            className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                                            placeholder="Admin notes (optional)"
                                            value={verificationNotes[proof.id] || ''}
                                            onChange={(e) => setVerificationNotes((prev) => ({ ...prev, [proof.id]: e.target.value }))}
                                            disabled={isReviewing}
                                        />
                                        <input
                                            type="text"
                                            className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                                            placeholder="Rejection reason (required when rejecting)"
                                            value={verificationRejectReasons[proof.id] || ''}
                                            onChange={(e) => setVerificationRejectReasons((prev) => ({ ...prev, [proof.id]: e.target.value }))}
                                            disabled={isReviewing}
                                        />

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => void reviewVerificationProof(proof.id, 'approve')}
                                                disabled={isReviewing}
                                                className="rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-200 hover:bg-green-500/25 disabled:opacity-50"
                                            >
                                                {isReviewing ? 'Working...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => void reviewVerificationProof(proof.id, 'reject')}
                                                disabled={isReviewing}
                                                className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/25 disabled:opacity-50"
                                            >
                                                {isReviewing ? 'Working...' : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Approved Verification History</p>
                            <span className="text-[11px] text-slate-500">{verificationHistory.length} records</span>
                        </div>
                        {verificationHistory.length === 0 ? (
                            <p className="text-xs text-slate-500">No approval history found yet.</p>
                        ) : (
                            <div className="max-h-80 space-y-1.5 overflow-y-auto">
                                {verificationHistory.slice(0, 120).map((item) => {
                                    const proofUrl = normalizeProofUrl(item.proof_image_url || '');
                                    return (
                                        <div key={item.id} className="rounded border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-xs text-slate-300">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-slate-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => openUserSupportView(item.user_id)}
                                                            className="text-left hover:text-eurokeys-purple hover:underline"
                                                        >
                                                            {item.user_name || item.user_email || item.user_id}
                                                        </button>
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {PROOF_TYPE_LABELS[item.proof_type] || item.proof_type}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : item.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                        {item.status}
                                                    </span>
                                                    <p className="mt-1 text-[11px] text-slate-500">
                                                        {item.reviewed_at ? timeAgo(item.reviewed_at) : timeAgo(item.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                                <span>Reviewer: {item.reviewed_by_name || item.reviewed_by_email || 'Unknown'}</span>
                                                {item.verification_level && (
                                                    <span>Level: {item.verification_level}</span>
                                                )}
                                                {(item.nastf_verified === 1 || item.nastf_verified === true) && (
                                                    <span>NASTF</span>
                                                )}
                                            </div>
                                            {proofUrl && (
                                                <a
                                                    href={proofUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 inline-flex rounded border border-blue-500/40 bg-blue-500/15 px-1.5 py-0.5 text-[11px] text-blue-200 hover:bg-blue-500/25"
                                                >
                                                    Open proof
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'moderation' && (
                <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Comment Moderation Queue</h2>
                        <button
                            onClick={fetchAllData}
                            disabled={isLoading}
                            className="rounded-lg border border-eurokeys-border bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                        >
                            Refresh Queue
                        </button>
                    </div>

                    {moderationError && (
                        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {moderationError}
                        </div>
                    )}

                    <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Moderation Actions</p>
                            {moderationHistory.length > 0 && (
                                <button
                                    onClick={() => setModerationHistory([])}
                                    className="rounded border border-slate-600 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {moderationHistory.length === 0 ? (
                            <p className="text-xs text-slate-500">No moderation actions recorded yet.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {moderationHistory.slice(0, 8).map((entry) => {
                                    const vehicle = parseVehicleKey(entry.vehicle_key);
                                    return (
                                        <div key={entry.id} className="rounded border border-slate-700 bg-slate-950/60 px-2.5 py-2 text-xs text-slate-300">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-slate-100">{entry.resolution.replace(/_/g, ' ')}</span>
                                                    <a href={vehicle.href} className="text-eurokeys-purple hover:text-indigo-300">
                                                        {vehicle.label}
                                                    </a>
                                                </div>
                                                <span className="text-slate-500">{timeAgo(entry.resolved_at)}</span>
                                            </div>
                                            {entry.note ? (
                                                <p className="mt-1 text-slate-400">Note: {entry.note}</p>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {moderationQueue.length === 0 ? (
                        <div className="rounded-lg border border-eurokeys-border bg-slate-800/40 px-4 py-5 text-sm text-slate-400">
                            No pending comment reports.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {moderationQueue.map((flag) => {
                                const isResolving = resolvingFlagId === flag.flag_id;
                                const vehicle = parseVehicleKey(flag.vehicle_key);
                                return (
                                    <div key={flag.flag_id} className="rounded-xl border border-eurokeys-border bg-slate-900/60 p-4">
                                        <div className="mb-2 flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold uppercase text-yellow-300">
                                                        {flag.reason.replace(/_/g, ' ')}
                                                    </span>
                                                    <a href={vehicle.href} className="text-sm font-medium text-eurokeys-purple hover:text-indigo-300">
                                                        {vehicle.label}
                                                    </a>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Reported by {flag.reporter_name || flag.reporter_email || 'Unknown'} • {timeAgo(flag.flag_created)}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                                                {flag.flag_count || 1} flag{(flag.flag_count || 1) === 1 ? '' : 's'}
                                            </span>
                                        </div>

                                        <div className="mb-2 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">Comment</p>
                                            <p className="mt-1 text-sm text-slate-200 whitespace-pre-wrap">{flag.content}</p>
                                        </div>

                                        {flag.details && (
                                            <div className="mb-2 text-xs text-slate-400">
                                                <span className="font-medium text-slate-300">Reporter details:</span> {flag.details}
                                            </div>
                                        )}

                                        <textarea
                                            value={moderationNotesByFlag[flag.flag_id] || ''}
                                            onChange={(e) => setModerationNotesByFlag((prev) => ({ ...prev, [flag.flag_id]: e.target.value }))}
                                            placeholder="Moderator note (optional, saved in local timeline)"
                                            className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500"
                                            disabled={isResolving}
                                        />

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => void resolveModerationFlag(flag, 'dismissed', false)}
                                                disabled={isResolving}
                                                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                                            >
                                                {isResolving ? 'Working...' : 'Dismiss'}
                                            </button>
                                            <button
                                                onClick={() => void resolveModerationFlag(flag, 'warning_issued', false)}
                                                disabled={isResolving}
                                                className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/25 disabled:opacity-50"
                                            >
                                                {isResolving ? 'Working...' : 'Warn User'}
                                            </button>
                                            <button
                                                onClick={() => void resolveModerationFlag(flag, 'deleted', true)}
                                                disabled={isResolving}
                                                className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/25 disabled:opacity-50"
                                            >
                                                {isResolving ? 'Working...' : 'Delete Comment'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="space-y-6">
                    {/* Billing Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <StatCard
                            label="Total Customers"
                            value={billingData?.summary?.totalCustomers || 0}
                            icon="👥"
                        />
                        <StatCard
                            label="Active Subscriptions"
                            value={billingData?.summary?.activeSubscriptions || 0}
                            icon="✅"
                            color="green"
                        />
                        <StatCard
                            label="Trialing"
                            value={billingData?.summary?.trialingSubscriptions || 0}
                            icon="⏳"
                            color="yellow"
                        />
                        <StatCard
                            label="Canceled"
                            value={billingData?.summary?.canceledSubscriptions || 0}
                            icon="❌"
                            color="red"
                        />
                        <StatCard
                            label="MRR"
                            value={`$${(billingData?.summary?.mrr || 0).toFixed(2)}`}
                            icon="💰"
                            color="green"
                        />
                    </div>

                    {/* Stripe Customers Table */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                💳 Stripe Customers
                            </h2>
                            <a
                                href="https://dashboard.stripe.com/customers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-eurokeys-border px-3 py-1.5 text-xs text-slate-400 hover:border-eurokeys-purple/50 hover:text-slate-200"
                            >
                                Open in Stripe →
                            </a>
                        </div>
                        {!billingData?.customers?.length ? (
                            <p className="text-sm text-slate-500">No Stripe customers found. Check that STRIPE_SECRET_KEY is configured.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-eurokeys-border text-left text-slate-400">
                                            <th className="pb-3 font-medium">Customer</th>
                                            <th className="pb-3 font-medium">Plan</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Amount</th>
                                            <th className="pb-3 font-medium">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {billingData.customers.map((c) => (
                                            <tr key={c.id} className="border-b border-eurokeys-border/50">
                                                <td className="py-3">
                                                    <div>
                                                        <p className="font-medium text-white">{c.name || c.email || 'Unknown'}</p>
                                                        {c.name && <p className="text-xs text-slate-500">{c.email}</p>}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className="text-slate-300">{c.activePlan}</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${c.activeSubStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        c.activeSubStatus === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                                                            c.activeSubStatus === 'past_due' ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {c.activeSubStatus || 'no sub'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-300">
                                                    {c.activePlanAmount > 0
                                                        ? `$${c.activePlanAmount.toFixed(2)}/${c.activePlanInterval || 'mo'}`
                                                        : '—'}
                                                </td>
                                                <td className="py-3 text-slate-500">
                                                    {new Date(c.created).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Expanded subscription details per customer */}
                        {billingData?.customers?.some(c => c.subscriptions.length > 0) && (
                            <div className="mt-4 border-t border-eurokeys-border pt-4">
                                <h3 className="mb-3 text-sm font-semibold text-slate-300">📋 All Subscriptions</h3>
                                <div className="space-y-2">
                                    {billingData.customers.flatMap(c =>
                                        c.subscriptions.map(s => (
                                            <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`h-2 w-2 rounded-full ${s.status === 'active' ? 'bg-green-400' :
                                                        s.status === 'trialing' ? 'bg-blue-400' :
                                                            s.status === 'canceled' ? 'bg-red-400' :
                                                                'bg-slate-400'
                                                        }`} />
                                                    <div>
                                                        <p className="text-sm text-white">{c.name || c.email}</p>
                                                        <p className="text-xs text-slate-500">{s.planName} • {s.status}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-300">
                                                        {s.amount > 0 ? `$${s.amount.toFixed(2)}/${s.interval || 'mo'}` : 'Free trial'}
                                                    </p>
                                                    {s.trialEnd && (
                                                        <p className="text-xs text-slate-500">
                                                            Trial ends {new Date(s.trialEnd).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {s.canceledAt && (
                                                        <p className="text-xs text-red-400">
                                                            Canceled {new Date(s.canceledAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products & Pricing */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                            📦 Products & Pricing
                        </h2>
                        {!billingData?.products?.length ? (
                            <p className="text-sm text-slate-500">No active products found in Stripe.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {billingData.products.map(p => (
                                    <div key={p.id} className="rounded-lg border border-eurokeys-border bg-slate-800/50 p-4">
                                        <h3 className="font-semibold text-white">{p.name}</h3>
                                        {p.description && (
                                            <p className="mt-1 text-xs text-slate-400">{p.description}</p>
                                        )}
                                        <div className="mt-3 space-y-1">
                                            {p.prices.map(pr => (
                                                <div key={pr.id} className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-300">
                                                        ${pr.amount.toFixed(2)}/{pr.interval}
                                                    </span>
                                                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${pr.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {pr.active ? 'active' : 'archived'}
                                                    </span>
                                                </div>
                                            ))}
                                            {p.prices.length === 0 && (
                                                <p className="text-xs text-slate-500">No prices configured</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Addon Trials (from DB) */}
                    <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                            🧪 Add-on Trials (Database)
                        </h2>
                        {!billingData?.addonTrials?.length ? (
                            <p className="text-sm text-slate-500">No addon trials recorded.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-eurokeys-border text-left text-slate-400">
                                            <th className="pb-3 font-medium">User</th>
                                            <th className="pb-3 font-medium">Add-on</th>
                                            <th className="pb-3 font-medium">Trial Started</th>
                                            <th className="pb-3 font-medium">Trial Expires</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {billingData.addonTrials.map((t, i) => (
                                            <tr key={`${t.user_id}-${t.addon_id}-${i}`} className="border-b border-eurokeys-border/50">
                                                <td className="py-3">
                                                    <p className="text-white">{t.user_name || t.user_email}</p>
                                                    {t.user_name && <p className="text-xs text-slate-500">{t.user_email}</p>}
                                                </td>
                                                <td className="py-3 text-slate-300 capitalize">{t.addon_id?.replace(/_/g, ' ')}</td>
                                                <td className="py-3 text-slate-500">{t.trial_started_at ? new Date(t.trial_started_at).toLocaleDateString() : '—'}</td>
                                                <td className="py-3 text-slate-500">{t.trial_expires_at ? new Date(t.trial_expires_at).toLocaleDateString() : '—'}</td>
                                                <td className="py-3">
                                                    {t.converted_at ? (
                                                        <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">Converted</span>
                                                    ) : t.canceled_at ? (
                                                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">Canceled</span>
                                                    ) : t.trial_expires_at && new Date(t.trial_expires_at) > new Date() ? (
                                                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">Active Trial</span>
                                                    ) : (
                                                        <span className="rounded bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">Expired</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap gap-3">
                <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-eurokeys-border bg-eurokeys-card px-4 py-2 text-sm text-slate-300 transition-colors hover:border-eurokeys-purple/50"
                >
                    ☁️ Cloudflare Dashboard
                </a>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-eurokeys-border bg-eurokeys-card px-4 py-2 text-sm text-slate-300 transition-colors hover:border-eurokeys-purple/50"
                >
                    🐙 GitHub
                </a>
                <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-eurokeys-border bg-eurokeys-card px-4 py-2 text-sm text-slate-300 transition-colors hover:border-eurokeys-purple/50"
                >
                    💳 Stripe Dashboard
                </a>
            </div>
        </div>
    );
}

// ===== COMPONENTS =====

function StatCard({ label, value, icon, trend, subtext, color }: {
    label: string;
    value: string | number;
    icon: string;
    trend?: string;
    subtext?: string;
    color?: 'green' | 'yellow' | 'red';
}) {
    return (
        <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-4">
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                {trend && (
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">{trend}</span>
                )}
            </div>
            <p className={`mt-2 text-2xl font-bold ${color === 'green' ? 'text-green-400' :
                color === 'yellow' ? 'text-yellow-400' :
                    color === 'red' ? 'text-red-400' : 'text-white'
                }`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <p className="text-sm text-slate-400">{label}</p>
            {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
    );
}

function HealthIndicator({ label, value, status }: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'error' | 'neutral';
}) {
    const colors = {
        good: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        error: 'bg-red-500/20 text-red-400 border-red-500/30',
        neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };

    return (
        <div className={`rounded-lg border p-3 ${colors[status]}`}>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs opacity-80">{label}</p>
        </div>
    );
}
