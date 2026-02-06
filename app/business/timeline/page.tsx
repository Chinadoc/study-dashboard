'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FleetTimelineEvent,
    ProviderLineMapping,
    appendFleetTimelineEvent,
    deleteProviderLine,
    fetchFleetTimeline,
    fetchProviderLines,
    importFleetTimelineRows,
    upsertProviderLine,
} from '@/lib/fleetOpsTimeline';
import { useFleet } from '@/contexts/FleetContext';
import { AccessDenied } from '@/components/business/FleetRoleGuards';

const STATUS_OPTIONS = [
    'all',
    'appointment',
    'accepted',
    'in_progress',
    'on_hold',
    'closed',
    'cancelled',
    'pending_close',
    'pending_cancel',
    'estimate',
    'follow_up',
    'pending',
    'completed',
    'unassigned',
    'claimed',
];

const SOURCE_OPTIONS = ['all', 'manual', 'system', 'twilio', 'powerdispatch', 'import'];
const IMPORT_PROVIDER_OPTIONS = ['powerdispatch', 'twilio', 'import'];

function extractRowsFromJsonPayload(parsed: any): Record<string, unknown>[] {
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.events)) return parsed.events;
    if (Array.isArray(parsed?.rows)) return parsed.rows;
    if (Array.isArray(parsed?.data)) return parsed.data;
    return [];
}

async function parseSpreadsheetRows(file: File): Promise<Record<string, unknown>[]> {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return [];

    const worksheet = workbook.Sheets[firstSheet];
    const objectRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: null,
        raw: false,
    });
    if (objectRows.length > 0) return objectRows;

    const tableRows = XLSX.utils.sheet_to_json<any[]>(worksheet, {
        header: 1,
        defval: '',
        raw: false,
    });
    const cleaned = tableRows.filter(row => Array.isArray(row) && row.some(cell => String(cell ?? '').trim() !== ''));
    if (cleaned.length < 2) return [];

    const [headers, ...rows] = cleaned;
    return rows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((header, index) => {
            const key = String(header ?? '').trim() || `column_${index + 1}`;
            obj[key] = row[index] ?? null;
        });
        return obj;
    });
}

function toDatetimeLocalValue(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): number {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
}

function eventIcon(eventType: string): string {
    const t = eventType.toLowerCase();
    if (t.includes('recording')) return '🎙️';
    if (t.includes('call')) return '📞';
    if (t.includes('conference')) return '👥';
    if (t.includes('status')) return '🔄';
    if (t.includes('created')) return '🆕';
    if (t.includes('assigned')) return '👷';
    if (t.includes('import')) return '📥';
    return '📝';
}

function statusBadgeClass(status?: string | null): string {
    const key = (status || '').toLowerCase();
    if (key === 'closed' || key === 'completed') return 'bg-green-500/20 text-green-400 border-green-500/40';
    if (key === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (key === 'in_progress' || key === 'accepted') return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    if (key === 'on_hold' || key === 'pending_close' || key === 'pending_cancel') return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (key === 'appointment' || key === 'pending' || key === 'unassigned' || key === 'claimed') return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
    return 'bg-zinc-700/40 text-zinc-300 border-zinc-600';
}

function formatDuration(seconds?: number | null): string {
    if (!seconds || seconds <= 0) return '';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
}

export default function FleetOpsTimelinePage() {
    const { loading, isFleetMember, role, organization } = useFleet();
    const isManager = role === 'owner' || role === 'dispatcher';

    const now = Date.now();
    const startOfDay = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }, []);

    const [fromInput, setFromInput] = useState(toDatetimeLocalValue(startOfDay));
    const [toInput, setToInput] = useState(toDatetimeLocalValue(now));
    const [status, setStatus] = useState('all');
    const [source, setSource] = useState('all');
    const [company, setCompany] = useState('');
    const [technician, setTechnician] = useState('');
    const [jobId, setJobId] = useState('');
    const [search, setSearch] = useState('');
    const [events, setEvents] = useState<FleetTimelineEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importMessage, setImportMessage] = useState<string | null>(null);
    const [manualMessage, setManualMessage] = useState('');
    const [expandedMapEventId, setExpandedMapEventId] = useState<string | null>(null);
    const [importProvider, setImportProvider] = useState('powerdispatch');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [lineMappings, setLineMappings] = useState<ProviderLineMapping[]>([]);
    const [lineProvider, setLineProvider] = useState('powerdispatch');
    const [lineNumber, setLineNumber] = useState('');
    const [lineExtension, setLineExtension] = useState('');
    const [lineLabel, setLineLabel] = useState('');
    const [lineMessage, setLineMessage] = useState<string | null>(null);

    const loadEvents = async () => {
        if (!organization?.id) return;
        setLoadingEvents(true);
        setError(null);
        try {
            const data = await fetchFleetTimeline({
                organizationId: organization.id,
                from: fromDatetimeLocalValue(fromInput),
                to: fromDatetimeLocalValue(toInput),
                status: status !== 'all' ? status : undefined,
                source: source !== 'all' ? source : undefined,
                company: company || undefined,
                technician: technician || undefined,
                jobId: jobId || undefined,
                search: search || undefined,
                limit: 400,
            });
            setEvents(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load timeline');
        } finally {
            setLoadingEvents(false);
        }
    };

    const loadLineMappings = async () => {
        if (!organization?.id) return;
        try {
            const lines = await fetchProviderLines(organization.id);
            setLineMappings(lines);
        } catch (e) {
            setLineMappings([]);
        }
    };

    useEffect(() => {
        if (!organization?.id || !isManager) return;
        loadEvents();
        loadLineMappings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organization?.id, isManager]);

    const handleQuickToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setFromInput(toDatetimeLocalValue(d.getTime()));
        setToInput(toDatetimeLocalValue(Date.now()));
    };

    const handleManualEvent = async () => {
        if (!manualMessage.trim() || !organization?.id) return;
        setImportMessage(null);
        try {
            await appendFleetTimelineEvent(
                {
                    eventType: 'manual_note',
                    eventSource: 'manual',
                    details: manualMessage.trim(),
                    occurredAt: Date.now(),
                },
                organization.id
            );
            setManualMessage('');
            await loadEvents();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add note');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = async (file: File) => {
        if (!organization?.id) return;
        setImportMessage(null);
        setError(null);
        try {
            const fileName = file.name.toLowerCase();
            let rows: Record<string, unknown>[] = [];

            if (fileName.endsWith('.json')) {
                const text = await file.text();
                rows = extractRowsFromJsonPayload(JSON.parse(text));
            } else if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                rows = await parseSpreadsheetRows(file);
            } else {
                // Fallback: try JSON first, then spreadsheet parsing.
                try {
                    const text = await file.text();
                    rows = extractRowsFromJsonPayload(JSON.parse(text));
                } catch {
                    rows = await parseSpreadsheetRows(file);
                }
            }

            if (!rows.length) {
                setError('Import file has no rows/events. Use JSON, CSV, or XLSX with data rows.');
                return;
            }

            const result = await importFleetTimelineRows(rows, importProvider, organization.id);
            setImportMessage(`Imported ${result.imported}/${result.total} records (${result.duplicates} duplicates skipped).`);
            await loadEvents();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Import failed');
        }
    };

    const handleAddLineMapping = async () => {
        if (!organization?.id) return;
        setLineMessage(null);
        try {
            const line = await upsertProviderLine(
                {
                    provider: lineProvider,
                    phoneNumber: lineNumber || undefined,
                    extension: lineExtension || undefined,
                    label: lineLabel || undefined,
                },
                organization.id
            );
            setLineMappings(prev => [line, ...prev.filter(p => p.id !== line.id)]);
            setLineNumber('');
            setLineExtension('');
            setLineLabel('');
            setLineMessage('Line mapping saved.');
        } catch (e) {
            setLineMessage(e instanceof Error ? e.message : 'Failed to save mapping');
        }
    };

    const handleDeleteLineMapping = async (id: string) => {
        if (!organization?.id) return;
        try {
            await deleteProviderLine(id, organization.id);
            setLineMappings(prev => prev.filter(line => line.id !== id));
        } catch (e) {
            setLineMessage(e instanceof Error ? e.message : 'Failed to delete mapping');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center text-zinc-400">
                Loading fleet timeline...
            </div>
        );
    }

    if (!isFleetMember || !isManager) {
        return (
            <AccessDenied
                requiredRole={['owner', 'dispatcher']}
                title="Fleet Ops Timeline"
                message="This page is available to fleet managers and dispatchers."
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">Fleet Ops Timeline</h2>
                        <p className="text-sm text-zinc-400">Append-only call, dispatch, and job activity log (365-day retention).</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleQuickToday}
                            className="px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700"
                        >
                            Today
                        </button>
                        <button
                            onClick={loadEvents}
                            className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <label className="text-xs text-zinc-400">
                        From
                        <input
                            type="datetime-local"
                            value={fromInput}
                            onChange={e => setFromInput(e.target.value)}
                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs text-zinc-400">
                        To
                        <input
                            type="datetime-local"
                            value={toInput}
                            onChange={e => setToInput(e.target.value)}
                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs text-zinc-400">
                        Status
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                        >
                            {STATUS_OPTIONS.map(option => (
                                <option key={option} value={option}>
                                    {option === 'all' ? 'All statuses' : option.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-zinc-400">
                        Source
                        <select
                            value={source}
                            onChange={e => setSource(e.target.value)}
                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                        >
                            {SOURCE_OPTIONS.map(option => (
                                <option key={option} value={option}>
                                    {option === 'all' ? 'All sources' : option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
                    <input
                        type="text"
                        placeholder="Company"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Technician"
                        value={technician}
                        onChange={e => setTechnician(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Job ID / Reference"
                        value={jobId}
                        onChange={e => setJobId(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Search details, customer, call IDs"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                        onClick={loadEvents}
                        className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
                    >
                        Apply Filters
                    </button>
                    <select
                        value={importProvider}
                        onChange={e => setImportProvider(e.target.value)}
                        className="px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg"
                    >
                        {IMPORT_PROVIDER_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleImportClick}
                        className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold"
                    >
                        Import All
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleImportFile(file);
                            e.currentTarget.value = '';
                        }}
                    />
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Add manual note to timeline"
                        value={manualMessage}
                        onChange={e => setManualMessage(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleManualEvent}
                        className="px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                    >
                        Add Note
                    </button>
                </div>

                {(error || importMessage || lineMessage) && (
                    <div className="mt-3 space-y-2">
                        {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}
                        {importMessage && <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">{importMessage}</div>}
                        {lineMessage && <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">{lineMessage}</div>}
                    </div>
                )}
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 sm:p-5">
                <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-3">Provider Line Mapping</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <select
                        value={lineProvider}
                        onChange={e => setLineProvider(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="powerdispatch">powerdispatch</option>
                        <option value="twilio">twilio</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Phone number"
                        value={lineNumber}
                        onChange={e => setLineNumber(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Extension (optional)"
                        value={lineExtension}
                        onChange={e => setLineExtension(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Label"
                            value={lineLabel}
                            onChange={e => setLineLabel(e.target.value)}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                            onClick={handleAddLineMapping}
                            className="px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                        >
                            Save
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    {lineMappings.length === 0 && (
                        <div className="text-sm text-zinc-500">No mappings yet. Add provider numbers/extensions to auto-route webhooks.</div>
                    )}
                    {lineMappings.map(line => (
                        <div key={line.id} className="flex items-center justify-between gap-3 bg-zinc-800/70 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
                            <div className="text-zinc-300">
                                <span className="uppercase text-xs text-zinc-500 mr-2">{line.provider}</span>
                                <span>{line.phoneNumber || 'N/A'}</span>
                                {line.extension ? <span className="text-zinc-500"> ext {line.extension}</span> : null}
                                {line.label ? <span className="text-zinc-400"> - {line.label}</span> : null}
                            </div>
                            <button
                                onClick={() => handleDeleteLineMapping(line.id)}
                                className="text-red-300 hover:text-red-200 text-xs"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {loadingEvents && (
                    <div className="text-sm text-zinc-400">Loading timeline...</div>
                )}
                {!loadingEvents && events.length === 0 && (
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-sm text-zinc-500">
                        No activity found for the selected filters.
                    </div>
                )}

                {events.map(event => {
                    const mapQuery = event.mapQuery || event.customerAddress || '';
                    const hasRecording = !!(event.playbackUrl || event.recordingUrl);
                    const mapIsOpen = expandedMapEventId === event.id;
                    return (
                        <div key={event.id} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span>{eventIcon(event.eventType)}</span>
                                        <span className="text-white font-semibold">{event.eventType.replace(/_/g, ' ')}</span>
                                        <span className="text-xs text-zinc-500">{event.eventSource}</span>
                                        {event.status && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadgeClass(event.status)}`}>
                                                {event.status.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                        {event.isImported && (
                                            <span className="text-xs px-2 py-0.5 rounded-full border bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                                                imported
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-zinc-400 mt-1">
                                        {new Date(event.occurredAt || event.createdAt || Date.now()).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-zinc-500">
                                    {event.jobId ? <div>Job: {event.jobId}</div> : null}
                                    {event.providerCallId ? <div>Call: {event.providerCallId}</div> : null}
                                    {event.providerConferenceId ? <div>Conf: {event.providerConferenceId}</div> : null}
                                </div>
                            </div>

                            {(event.details || event.customerName || event.technicianName || event.companyName) && (
                                <div className="mt-3 text-sm text-zinc-300 space-y-1">
                                    {event.details ? <div>{event.details}</div> : null}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-400">
                                        {event.companyName ? <span>🏢 {event.companyName}</span> : null}
                                        {event.technicianName ? <span>👷 {event.technicianName}</span> : null}
                                        {event.customerName ? <span>👤 {event.customerName}</span> : null}
                                        {event.customerPhone ? <span>📱 {event.customerPhone}</span> : null}
                                        {event.fromNumber || event.toNumber ? (
                                            <span>📞 {event.fromNumber || '?'} → {event.toNumber || '?'}</span>
                                        ) : null}
                                        {event.durationSeconds ? <span>⏱ {formatDuration(event.durationSeconds)}</span> : null}
                                    </div>
                                </div>
                            )}

                            {(hasRecording || mapQuery) && (
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                    {hasRecording && (
                                        <audio
                                            controls
                                            preload="none"
                                            src={event.playbackUrl || event.recordingUrl || undefined}
                                            className="max-w-full"
                                        />
                                    )}
                                    {mapQuery && (
                                        <button
                                            onClick={() => setExpandedMapEventId(mapIsOpen ? null : (event.id || null))}
                                            className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
                                        >
                                            {mapIsOpen ? 'Hide Map' : 'Show Map'}
                                        </button>
                                    )}
                                    {mapQuery && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
                                        >
                                            Open Maps
                                        </a>
                                    )}
                                </div>
                            )}

                            {mapQuery && mapIsOpen && (
                                <div className="mt-3 border border-zinc-700 rounded-lg overflow-hidden">
                                    <iframe
                                        title={`Map ${event.id}`}
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                                        className="w-full h-56"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
