'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ActivityLog {
    id: number;
    user_id: string;
    action: string;
    metadata: string;
    timestamp: number;
}

export default function DevPanelPage() {
    const { user, loading, isDeveloper } = useAuth();
    const router = useRouter();
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Redirect non-developers
    useEffect(() => {
        if (!loading && (!user || !isDeveloper)) {
            router.replace('/');
        }
    }, [user, loading, isDeveloper, router]);

    const fetchActivityLogs = async () => {
        setLogsLoading(true);
        try {
            const token = localStorage.getItem('session_token');
            const res = await fetch('https://aski.eurokeys.app/api/admin/activity-logs?limit=50', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setActivityLogs(data.logs || []);
            }
        } catch (e) {
            console.error('Failed to fetch activity logs:', e);
        } finally {
            setLogsLoading(false);
        }
    };

    const refreshData = async () => {
        // Placeholder for data refresh functionality
        alert('Data refresh not yet implemented');
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-eurokeys-purple border-t-transparent" />
            </div>
        );
    }

    if (!user || !isDeveloper) {
        return null; // Will redirect
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">🛠️ Developer Panel</h1>
                <p className="mt-2 text-slate-400">Admin tools and system monitoring</p>
            </div>

            {/* User Info Card */}
            <div className="mb-8 rounded-xl border border-eurokeys-border bg-eurokeys-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Current Session</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-sm text-slate-400">User</p>
                        <p className="font-medium text-white">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="font-medium text-white">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">User ID</p>
                        <p className="font-mono text-sm text-slate-300">{user.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Access Level</p>
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                            Developer
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                    onClick={refreshData}
                    className="flex items-center gap-3 rounded-xl border border-eurokeys-border bg-eurokeys-card p-4 text-left transition-colors hover:border-eurokeys-purple/50 hover:bg-eurokeys-purple/10"
                >
                    <span className="text-2xl">🔄</span>
                    <div>
                        <p className="font-medium text-white">Refresh Cache</p>
                        <p className="text-sm text-slate-400">Clear and rebuild data cache</p>
                    </div>
                </button>

                <button
                    onClick={fetchActivityLogs}
                    className="flex items-center gap-3 rounded-xl border border-eurokeys-border bg-eurokeys-card p-4 text-left transition-colors hover:border-eurokeys-purple/50 hover:bg-eurokeys-purple/10"
                >
                    <span className="text-2xl">📋</span>
                    <div>
                        <p className="font-medium text-white">View Activity Logs</p>
                        <p className="text-sm text-slate-400">Recent user actions</p>
                    </div>
                </button>

                <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-eurokeys-border bg-eurokeys-card p-4 text-left transition-colors hover:border-eurokeys-purple/50 hover:bg-eurokeys-purple/10"
                >
                    <span className="text-2xl">☁️</span>
                    <div>
                        <p className="font-medium text-white">Cloudflare Dashboard</p>
                        <p className="text-sm text-slate-400">Workers, D1, R2 management</p>
                    </div>
                </a>
            </div>

            {/* Activity Logs */}
            {activityLogs.length > 0 && (
                <div className="rounded-xl border border-eurokeys-border bg-eurokeys-card p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-eurokeys-border text-left text-slate-400">
                                    <th className="pb-2 font-medium">Action</th>
                                    <th className="pb-2 font-medium">User ID</th>
                                    <th className="pb-2 font-medium">Timestamp</th>
                                    <th className="pb-2 font-medium">Metadata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-eurokeys-border/50">
                                        <td className="py-2 font-medium text-white">{log.action}</td>
                                        <td className="py-2 font-mono text-xs text-slate-400">{log.user_id?.slice(0, 8)}...</td>
                                        <td className="py-2 text-slate-400">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="py-2 font-mono text-xs text-slate-500 max-w-xs truncate">
                                            {log.metadata}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {logsLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-eurokeys-purple border-t-transparent" />
                </div>
            )}
        </div>
    );
}
