'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PearlRenderer from '@/components/shared/PearlRenderer';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

interface Pearl {
    id?: number;
    content?: string;
    category?: string;
    risk?: string;
    source_doc?: string;
    tags?: string[];
    action?: string;
    pearl_title?: string;
    pearl_content?: string;
    pearl_type?: string;
    is_critical?: boolean;
    score?: number;
    comment_count?: number;
    target_section?: string;
}

interface TechnicalPearlsProps {
    pearls: Pearl[];
    make: string;
    model: string;
}

interface VoteState {
    [pearlId: number]: {
        score: number;
        userVote: number;
    };
}

export default function TechnicalPearls({ pearls, make, model }: TechnicalPearlsProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [voteStates, setVoteStates] = useState<VoteState>({});
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [suggestingEdit, setSuggestingEdit] = useState<Pearl | null>(null);
    const [suggestedContent, setSuggestedContent] = useState('');
    const [editReason, setEditReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const { isAuthenticated } = useAuth();

    const vehicleKey = `${make.toLowerCase()}_${model.toLowerCase()}`;

    // Fetch vote states for all pearls on mount
    useEffect(() => {
        const fetchVotes = async () => {
            const newStates: VoteState = {};
            for (const pearl of pearls) {
                if (pearl.id != null) {
                    try {
                        const res = await fetch(`${API_URL}/api/pearls/${pearl.id}/votes`, {
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
                            }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            newStates[pearl.id] = {
                                score: data.score || 0,
                                userVote: data.user_vote || 0
                            };
                        }
                    } catch (err) {
                        console.error('Failed to fetch votes:', err);
                    }
                }
            }
            setVoteStates(newStates);
        };
        if (pearls.length > 0) {
            fetchVotes();
        }
    }, [pearls]);

    const handleVote = async (pearlId: number, vote: number) => {
        if (!isAuthenticated) {
            alert('Please sign in to vote');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/pearls/vote`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
                },
                body: JSON.stringify({ pearl_id: pearlId, vote })
            });

            if (res.ok) {
                const data = await res.json();
                setVoteStates(prev => ({
                    ...prev,
                    [pearlId]: {
                        score: data.score,
                        userVote: data.user_vote
                    }
                }));
            }
        } catch (err) {
            console.error('Vote failed:', err);
        }
    };

    const handleReply = async (pearlId: number) => {
        if (!replyContent.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/pearls/${pearlId}/reply`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
                },
                body: JSON.stringify({
                    content: replyContent,
                    vehicle_key: vehicleKey
                })
            });

            if (res.ok) {
                setReplyContent('');
                setReplyingTo(null);
                alert('Reply posted! It will appear in the discussion.');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to post reply');
            }
        } catch (err) {
            console.error('Reply failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSuggestEdit = async () => {
        if (!suggestingEdit || !suggestedContent.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/pearls/suggest-edit`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('session_token') || ''}`
                },
                body: JSON.stringify({
                    pearl_id: suggestingEdit.id,
                    original_content: getContent(suggestingEdit),
                    suggested_content: suggestedContent,
                    reason: editReason
                })
            });

            if (res.ok) {
                setSuggestingEdit(null);
                setSuggestedContent('');
                setEditReason('');
                alert('Edit suggestion submitted! You\'ll earn 10 points if approved.');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit suggestion');
            }
        } catch (err) {
            console.error('Suggest edit failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!pearls || pearls.length === 0) {
        return (
            <section className="glass p-6 mb-6">
                <h3 className="flex items-center gap-3 text-lg font-bold text-purple-400 mb-4">
                    <span className="text-xl">💎</span>
                    Technical Pearls
                </h3>
                <div className="text-center text-zinc-500 py-8">
                    <div className="text-4xl mb-2">💡</div>
                    <p>No technical insights available for this vehicle yet.</p>
                </div>
            </section>
        );
    }

    // Map target_section values to human-readable group labels
    const sectionLabels: Record<string, string> = {
        'hardware': 'Hardware Notes',
        'security': 'Security Architecture',
        'tools': 'Tool Requirements',
        'tool_requirement': 'Tool Requirements',
        'troubleshooting': 'Troubleshooting',
        'procedure': 'Procedure Notes',
        'warning_alert': 'Warnings',
        'voltage': 'Voltage & BCM',
        'fcc_hardware': 'FCC & Frequency',
        'chip_security': 'Chip & Immobilizer',
        'mechanical': 'Mechanical / Lishi',
    };

    // Group pearls by target_section (with fallback to category/pearl_type)
    const groupedPearls: Record<string, Pearl[]> = {};
    pearls.forEach(pearl => {
        const rawSection = pearl.target_section || pearl.category || pearl.pearl_type || 'General';
        const label = sectionLabels[rawSection] || rawSection;
        if (!groupedPearls[label]) {
            groupedPearls[label] = [];
        }
        groupedPearls[label].push(pearl);
    });

    const getTitle = (pearl: Pearl): string => {
        if (pearl.pearl_title) return pearl.pearl_title;
        if (!pearl.content) return 'Insight';
        const firstSentence = pearl.content.split('.')[0];
        return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
    };

    const getContent = (pearl: Pearl): string => {
        return pearl.content || pearl.pearl_content || '';
    };

    return (
        <section className="glass p-6 mb-6">
            <h3 className="flex items-center gap-3 text-lg font-bold text-purple-400 mb-4">
                <span className="text-xl">💎</span>
                Technical Pearls
                <span className="text-xs text-zinc-500 font-normal ml-2">
                    ({pearls.length} insight{pearls.length !== 1 ? 's' : ''})
                </span>
            </h3>

            <div className="space-y-4">
                {Object.entries(groupedPearls).map(([type, typePearls]) => (
                    <div key={type}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{getTypeIcon(type)}</span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                                {type}
                            </span>
                            <span className="text-[10px] text-zinc-600">
                                ({typePearls.length})
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(expandedGroups[type] ? typePearls : typePearls.slice(0, 4)).map((pearl, index) => {
                                const pearlId = pearl.id ?? index;
                                const isExpanded = expandedId === pearlId;
                                const riskClass = getRiskClass(pearl);
                                const voteState = voteStates[pearlId] || { score: pearl.score || 0, userVote: 0 };

                                return (
                                    <div
                                        key={pearlId}
                                        className={`
                                            rounded-lg border transition-all
                                            ${riskClass}
                                            ${isExpanded ? 'w-full p-4' : 'px-3 py-2 cursor-pointer'}
                                        `}
                                    >
                                        {/* Pearl header with voting */}
                                        <div className="flex items-start gap-2">
                                            {/* Vote column */}
                                            <div className="flex flex-col items-center gap-0.5 min-w-[28px]">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVote(pearlId, 1); }}
                                                    className={`p-0.5 rounded text-sm hover:bg-white/10 transition ${voteState.userVote === 1 ? 'text-green-400' : 'text-zinc-500'}`}
                                                    title="Upvote"
                                                >
                                                    ▲
                                                </button>
                                                <span className={`text-xs font-semibold ${voteState.score > 0 ? 'text-green-400' : voteState.score < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                                                    {voteState.score}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVote(pearlId, -1); }}
                                                    className={`p-0.5 rounded text-sm hover:bg-white/10 transition ${voteState.userVote === -1 ? 'text-red-400' : 'text-zinc-500'}`}
                                                    title="Downvote"
                                                >
                                                    ▼
                                                </button>
                                            </div>

                                            {/* Pearl content */}
                                            <div className="flex-1" onClick={() => setExpandedId(isExpanded ? null : pearlId)}>
                                                {pearl.is_critical && (
                                                    <span className="text-red-400 mr-1">⚠️</span>
                                                )}
                                                <div className="font-semibold text-sm">
                                                    {getTitle(pearl)}
                                                </div>
                                                {!isExpanded && (
                                                    <div className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                                                        {getContent(pearl)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-zinc-700/50">
                                                <PearlRenderer content={getContent(pearl)} />
                                                {pearl.source_doc && (
                                                    <div className="mt-2 text-[10px] text-zinc-500">
                                                        Source: {pearl.source_doc}
                                                    </div>
                                                )}

                                                {/* Action buttons */}
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-700/30">
                                                    <button
                                                        onClick={() => { setReplyingTo(replyingTo === pearlId ? null : pearlId); }}
                                                        className="text-xs px-3 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 rounded-full transition"
                                                    >
                                                        💬 Reply
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSuggestingEdit(pearl);
                                                            setSuggestedContent(getContent(pearl));
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-full transition"
                                                    >
                                                        ✏️ Suggest Edit
                                                    </button>
                                                </div>

                                                {/* Reply form */}
                                                {replyingTo === pearlId && (
                                                    <div className="mt-3 space-y-2">
                                                        <textarea
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder="Add your comment about this pearl..."
                                                            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white resize-none"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleReply(pearlId)}
                                                                disabled={submitting || !replyContent.trim()}
                                                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs rounded transition"
                                                            >
                                                                {submitting ? 'Posting...' : 'Post Reply'}
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {typePearls.length > 4 && (
                            <button
                                onClick={() => setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }))}
                                className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                {expandedGroups[type]
                                    ? '▲ Show less'
                                    : `▼ Show ${typePearls.length - 4} more`
                                }
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Suggest Edit Modal */}
            {suggestingEdit && (
                <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 md:p-4" onClick={() => setSuggestingEdit(null)}>
                    <div className="bg-zinc-900 md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6 rounded-t-xl md:rounded-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4">✏️ Suggest Edit</h3>

                        <div className="mb-3 md:mb-4">
                            <label className="text-[10px] md:text-xs text-zinc-400 block mb-1">Original Content</label>
                            <div className="p-2 md:p-3 bg-zinc-800 rounded text-xs md:text-sm text-zinc-400 border border-zinc-700 max-h-24 overflow-y-auto">
                                {getContent(suggestingEdit)}
                            </div>
                        </div>

                        <div className="mb-3 md:mb-4">
                            <label className="text-[10px] md:text-xs text-zinc-400 block mb-1">Your Suggested Edit</label>
                            <textarea
                                value={suggestedContent}
                                onChange={(e) => setSuggestedContent(e.target.value)}
                                className="w-full p-2 md:p-3 bg-zinc-800 border border-zinc-700 rounded text-xs md:text-sm text-white resize-none"
                                rows={4}
                            />
                        </div>

                        <div className="mb-3 md:mb-4">
                            <label className="text-[10px] md:text-xs text-zinc-400 block mb-1">Reason for Edit (optional)</label>
                            <input
                                type="text"
                                value={editReason}
                                onChange={(e) => setEditReason(e.target.value)}
                                placeholder="e.g., Fixed typo, Updated procedure, Added clarification..."
                                className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs md:text-sm text-white"
                            />
                        </div>

                        <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-3 border-t border-zinc-700 pt-3 md:pt-4">
                            <p className="text-[10px] md:text-xs text-zinc-500 text-center md:text-left">
                                ⭐ Earn 10 points if your edit is approved!
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setSuggestingEdit(null)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs md:text-sm rounded transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuggestEdit}
                                    disabled={submitting || suggestedContent === getContent(suggestingEdit)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs md:text-sm rounded transition"
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
        'Hardware Notes': '🔩',
        'Security Architecture': '🔐',
        'Tool Requirements': '🔧',
        'Troubleshooting': '🔍',
        'Procedure Notes': '📋',
        'Warnings': '⚠️',
        'Voltage & BCM': '⚡',
        'FCC & Frequency': '📡',
        'Chip & Immobilizer': '🔒',
        'Mechanical / Lishi': '🗝️',
        'General': '💡',
    };
    return icons[type] || '💎';
}

function getRiskClass(pearl: Pearl): string {
    if (pearl.is_critical || pearl.risk === 'critical' || pearl.pearl_type === 'Alert') {
        return 'bg-red-900/20 border-red-700/50 hover:border-red-500/70';
    }
    if (pearl.risk === 'important' || pearl.pearl_type === 'Tool Alert') {
        return 'bg-yellow-900/20 border-yellow-700/50 hover:border-yellow-500/70';
    }
    return 'bg-purple-900/20 border-purple-700/50 hover:border-purple-500/70';
}
