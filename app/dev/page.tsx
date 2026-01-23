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

// Country flag emoji helper
const countryFlag = (code: string) => {
    if (!code || code.length !== 2) return '🌐';
    const offset = 127397;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
};

// Action icon helper
const actionIcon = (action: string) => {
    const icons: Record<string, string> = {
        'sign_in': '🔑', 'sign_out': '👋', 'search': '🔍', 'view_vehicle': '🚗',
        'click_affiliate': '💰', 'affiliate_click': '💰', 'inventory_add': '📦',
        'vin_lookup': '🔢', 'add_comment': '💬', 'page_view': '👁️'
    };
    return icons[action] || '📝';
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
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');

    const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';

    // Fetch all data on mount
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('session_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const [statsRes, cfRes, activityRes, inventoryRes, clicksRes, usersRes] = await Promise.allSettled([
                fetch(`${API_BASE}/api/admin/stats`, { headers }),
                fetch(`${API_BASE}/api/admin/cloudflare`, { headers }),
                fetch(`${API_BASE}/api/admin/activity?limit=50`, { headers }),
                fetch(`${API_BASE}/api/admin/intelligence/inventory`, { headers }),
                fetch(`${API_BASE}/api/admin/intelligence/clicks`, { headers }),
                fetch(`${API_BASE}/api/admin/users`, { headers })
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
        } catch (e) {
            console.error('Failed to fetch dev data:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

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

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-eurokeys-purple border-t-transparent" />
            </div>
        );
    }

    if (!user || !isDeveloper) return null;

    // Extract top vehicles from Cloudflare paths
    const topVehicles = cloudflareStats?.marketing?.topPaths
        ?.filter(p => p.path.startsWith('/vehicle/'))
        .slice(0, 8)
        .map(p => {
            const parts = p.path.replace('/vehicle/', '').split('/');
            return { make: parts[0], model: parts[1], year: parts[2], count: p.count, path: p.path };
        }) || [];

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
                {(['overview', 'users', 'activity'] as const).map(tab => (
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
                            value={cloudflareStats?.last24h?.visitors || 0}
                            icon="👁️"
                            subtext={cloudflareStats?.last24h ? `${cloudflareStats.last24h.requests.toLocaleString()} requests` : undefined}
                        />
                        <StatCard
                            label="Cache Rate"
                            value={`${cloudflareStats?.tech?.cacheRate || 0}%`}
                            icon="⚡"
                            color={parseFloat(cloudflareStats?.tech?.cacheRate || '0') > 80 ? 'green' : 'yellow'}
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
                                    <p className="text-sm text-slate-500">No vehicle data available</p>
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
                <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                    <h2 className="mb-4 text-lg font-semibold text-white">All Users ({users.length})</h2>
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
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-eurokeys-border/50">
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                {u.picture && <img src={u.picture} alt="" className="h-8 w-8 rounded-full" />}
                                                <span className="font-medium text-white">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-slate-400">{u.email}</td>
                                        <td className="py-3">
                                            <div className="flex gap-1">
                                                {u.is_developer && (
                                                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">Dev</span>
                                                )}
                                                {u.is_pro && (
                                                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">Pro</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 text-slate-300">{u.activity_count || 0} events</td>
                                        <td className="py-3 text-slate-500">{u.last_activity ? timeAgo(u.last_activity) : 'Never'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-5">
                    <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
                    <div className="space-y-2">
                        {activityLogs.map(log => (
                            <div key={log.id} className="flex items-start gap-3 rounded-lg bg-slate-800/50 p-3">
                                <span className="text-xl">{actionIcon(log.action)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-white">{log.action}</span>
                                        {log.user_name && (
                                            <span className="text-sm text-slate-400">by {log.user_name}</span>
                                        )}
                                    </div>
                                    {log.details && (
                                        <p className="mt-1 truncate text-xs text-slate-500 font-mono max-w-lg">{log.details}</p>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(log.created_at)}</span>
                            </div>
                        ))}
                        {activityLogs.length === 0 && (
                            <p className="text-sm text-slate-500">No activity logs</p>
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
