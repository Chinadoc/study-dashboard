// ================== BROWSE DATABASE ==================

// ================== BROWSE DATABASE (Redesign) ==================
console.log('[BROWSE] v20260105.1 Loaded');

// Global Safety Checks
if (typeof currentUser === 'undefined') window.currentUser = null;
if (typeof InventoryManager === 'undefined') window.InventoryManager = { getKeyStock: () => 0, getBlankStock: () => 0, getAllKeys: () => [] };

// Stub for showPremiumModal (defined in auth.js, may not be loaded yet)
if (typeof showPremiumModal === 'undefined') {
    window.showPremiumModal = function () {
        console.log('Premium modal not implemented yet');
        alert('Premium features coming soon! Contact us for early access.');
    };
}

// Lightbox functions for Key Reference images
function openLightbox(imgSrc) {
    document.getElementById('lightboxImage').src = imgSrc;
    document.getElementById('photoLightbox').style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('photoLightbox').style.display = 'none';
}

// ==============================================
// COMMUNITY COMMENTS FUNCTIONS
// ==============================================

async function loadComments(vehicleKey, containerIdx) {
    const container = document.getElementById(`commentsContainer-${containerIdx}`);
    const countBadge = document.getElementById(`commentCount-${containerIdx}`);

    if (!container) return;

    try {
        const response = await fetch(`${API}/api/vehicle-comments?vehicle_key=${encodeURIComponent(vehicleKey)}`);
        const data = await response.json();

        if (data.comments && data.comments.length > 0) {
            countBadge.textContent = data.comments.length;
            container.innerHTML = data.comments.map(c => renderComment(c)).join('');
        } else {
            countBadge.textContent = '0';
            container.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted); padding: 12px; text-align: center;">No tips yet. Be the first to share!</div>';
        }
    } catch (err) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem;">Could not load comments</div>';
        countBadge.textContent = '?';
    }
}

function renderComment(c) {
    const timeAgo = getTimeAgo(c.created_at);
    const score = (c.upvotes || 0) - (c.downvotes || 0);

    return `
        <div class="comment-item" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-weight: 600; color: var(--brand-primary); font-size: 0.8rem;">@${c.user_name}</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">${timeAgo}</span>
                    </div>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">${escapeHtml(c.content)}</p>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                    <button onclick="voteComment(${c.id}, 'up')" style="background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.9rem; color: var(--text-secondary);" title="Helpful">▲</button>
                    <span style="font-size: 0.75rem; font-weight: 600; color: ${score > 0 ? '#22c55e' : score < 0 ? '#ef4444' : 'var(--text-muted)'};">${score}</span>
                    <button onclick="voteComment(${c.id}, 'down')" style="background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.9rem; color: var(--text-secondary);" title="Not helpful">▼</button>
                </div>
            </div>
        </div>
    `;
}

async function postComment(vehicleKey, containerIdx) {
    const input = document.getElementById(`commentInput-${containerIdx}`);
    const content = input?.value?.trim();

    if (!content) {
        showToast && showToast('Please enter a comment', 'error');
        return;
    }

    try {
        const response = await fetch(`${API}/api/vehicle-comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('eurokeys_token') ? `Bearer ${localStorage.getItem('eurokeys_token')}` : ''
            },
            body: JSON.stringify({ vehicle_key: vehicleKey, content })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            showToast && showToast('Tip posted!', 'success');
            loadComments(vehicleKey, containerIdx);
        } else {
            showToast && showToast(data.error || 'Failed to post', 'error');
        }
    } catch (err) {
        showToast && showToast('Network error', 'error');
    }
}

// ==============================================
// LOCKSMITH INTELLIGENCE CARD FUNCTIONS
// ==============================================

const AMAZON_TAG = 'eurokeys-20';

// ==============================================
// PEARL SECTIONS RENDERER (8 Distinct Sections)
// ==============================================

/**
 * Render pearls distributed across distinct sections based on pearl_type
 * @param {Array} pearls - Array of pearl objects with pearl_type
 * @param {Object} vehicle - { year, make, model }
 * @returns {string} HTML for all pearl sections
 */
function renderPearlSections(pearls, vehicle) {
    if (!pearls || pearls.length === 0) {
        console.log('[PEARLS] No pearls to render');
        return '';
    }

    // Quality filter: exclude low-value pearls
    const qualityFilter = (p) => {
        const content = p.pearl_content || '';
        const title = p.pearl_title || '';
        // Exclude: citations, numbered headings, short content, URLs as titles
        if (content.length < 80) return false;
        if (content.includes('accessed December') || content.includes('accessed January')) return false;
        if (/^\d+\.\s/.test(title)) return false; // "1. Introduction..."
        if (/^http/.test(title)) return false;
        if (/^\([\d\/]+\)/.test(title)) return false; // "(3/6) Autel..."
        return true;
    };

    const filteredPearls = pearls.filter(qualityFilter);
    console.log('[PEARLS] Filtered', pearls.length, '->', filteredPearls.length, 'pearls for', vehicle);
    const { year, make, model } = vehicle;

    // Section limits
    const LIMITS = { alerts: 5, akl: 3, addKey: 3, tools: 4, fccRegistry: 4, mechanical: 3, electronic: 3, procedures: 3, youtube: 4, intelligence: 4, general: 4 };

    // Distribute pearls by type
    const sections = {
        alerts: filteredPearls.filter(p => p.pearl_type === 'Alert' || p.is_critical),
        akl: filteredPearls.filter(p => p.pearl_type === 'AKL Procedure'),
        addKey: filteredPearls.filter(p => p.pearl_type === 'Add Key Procedure'),
        tools: filteredPearls.filter(p => p.pearl_type === 'Tool Alert'),
        fccRegistry: filteredPearls.filter(p => p.pearl_type === 'FCC Registry'),
        mechanical: filteredPearls.filter(p => p.pearl_type === 'Mechanical'),
        electronic: filteredPearls.filter(p => p.pearl_type === 'Electronic'),
        procedures: filteredPearls.filter(p => p.pearl_type === 'Procedure'),
        youtube: filteredPearls.filter(p => p.reference_url && p.reference_url.includes('youtube')),
        intelligence: filteredPearls.filter(p => p.pearl_type === 'Intelligence'),
        general: filteredPearls.filter(p => p.pearl_type === 'System Info' || p.pearl_type === 'Reference')
    };

    let html = '';

    // Helper: Render a single pearl card with voting
    const renderPearlCard = (p, expanded = false) => {
        const scoreDisplay = p.score > 0 ? `+${p.score}` : (p.score || '0');
        const scoreColor = p.score > 0 ? '#22c55e' : (p.score < 0 ? '#ef4444' : 'var(--text-muted)');
        const truncatedContent = p.pearl_content?.length > 200 && !expanded
            ? p.pearl_content.substring(0, 200) + '...'
            : p.pearl_content;

        return `
            <div class="pearl-card" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 10px; padding: 16px; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='rgba(139, 92, 246, 0.4)'"
                 onmouseout="this.style.borderColor='rgba(139, 92, 246, 0.15)'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px;">
                    <strong style="color: #c4b5fd; font-size: 0.95rem; flex: 1;">${p.pearl_title || 'Intel'}</strong>
                    ${p.is_critical ? '<span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">⚠️ CRITICAL</span>' : ''}
                </div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
                    ${truncatedContent || ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 8px;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button onclick="votePearl(${p.id}, 1)" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; transition: all 0.2s;"
                                onmouseover="this.style.background='rgba(34,197,94,0.1)'; this.style.color='#22c55e'"
                                onmouseout="this.style.background='none'; this.style.color='var(--text-muted)'">
                            👍
                        </button>
                        <span style="font-weight: 700; color: ${scoreColor}; min-width: 24px; text-align: center;">${scoreDisplay}</span>
                        <button onclick="votePearl(${p.id}, -1)" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; transition: all 0.2s;"
                                onmouseover="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444'"
                                onmouseout="this.style.background='none'; this.style.color='var(--text-muted)'">
                            👎
                        </button>
                        <button onclick="showPearlComments(${p.id})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; font-size: 0.85rem;">
                            💬 ${p.comment_count || 0}
                        </button>
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">
                        ${p.source_doc ? p.source_doc.replace('.html', '').substring(0, 25) : 'Research'}
                    </span>
                </div>
            </div>
        `;
    };

    // Section: Critical Alerts (Always first if present)
    if (sections.alerts.length > 0) {
        const displayAlerts = sections.alerts.slice(0, LIMITS.alerts);
        const hiddenCount = sections.alerts.length - displayAlerts.length;
        html += `
            <div class="pearl-section alerts-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #ef4444; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">⚠️</span> CRITICAL ALERTS
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">${sections.alerts.length} alerts</span>
                </h4>
                <div style="display: grid; gap: 12px;">
                    ${displayAlerts.map(p => renderPearlCard(p)).join('')}
                </div>
                ${hiddenCount > 0 ? `<details style="margin-top: 12px;"><summary style="color: var(--brand-primary); cursor: pointer;">Show ${hiddenCount} more...</summary><div style="display: grid; gap: 12px; margin-top: 12px;">${sections.alerts.slice(LIMITS.alerts).map(p => renderPearlCard(p)).join('')}</div></details>` : ''}
            </div>
        `;
    }

    // Section: All Keys Lost (AKL)
    if (sections.akl.length > 0) {
        const displayAkl = sections.akl.slice(0, LIMITS.akl);
        html += `
            <div class="pearl-section akl-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #f59e0b; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">🚨</span> ALL KEYS LOST
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">${sections.akl.length} procedures</span>
                </h4>
                <div style="display: grid; gap: 12px;">
                    ${displayAkl.map(p => renderPearlCard(p)).join('')}
                </div>
            </div>
        `;
    }

    // Section: Add Key
    if (sections.addKey.length > 0) {
        const displayAddKey = sections.addKey.slice(0, LIMITS.addKey);
        html += `
            <div class="pearl-section addkey-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #22c55e; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">🔑</span> ADD KEY PROCEDURE
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">${sections.addKey.length} procedures</span>
                </h4>
                <div style="display: grid; gap: 12px;">
                    ${displayAddKey.map(p => renderPearlCard(p)).join('')}
                </div>
            </div>
        `;
    }

    // Section: Tool Recommendations
    if (sections.tools.length > 0) {
        html += `
            <div class="pearl-section tools-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #3b82f6; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">🛠️</span> RECOMMENDED TOOLS
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">${sections.tools.length} alerts</span>
                </h4>
                <div style="display: grid; gap: 12px;">
                    ${sections.tools.map(p => renderPearlCard(p)).join('')}
                </div>
            </div>
        `;
    }

    // Section: FCC Registry / What You'll Need
    if (sections.fccRegistry.length > 0 || sections.mechanical.length > 0 || sections.electronic.length > 0) {
        const allParts = [...sections.fccRegistry, ...sections.mechanical, ...sections.electronic];
        html += `
            <div class="pearl-section parts-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #a78bfa; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">📦</span> WHAT YOU'LL NEED
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">FCC IDs, Keys, Parts</span>
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
                    ${allParts.slice(0, 4).map(p => renderPearlCard(p)).join('')}
                </div>
                ${allParts.length > 4 ? `
                    <details style="margin-top: 12px;">
                        <summary style="color: var(--brand-primary); cursor: pointer; font-size: 0.9rem;">Show ${allParts.length - 4} more entries...</summary>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-top: 12px;">
                            ${allParts.slice(4).map(p => renderPearlCard(p)).join('')}
                        </div>
                    </details>
                ` : ''}
            </div>
        `;
    }

    // Section: YouTube Videos
    if (sections.youtube.length > 0) {
        html += `
            <div class="pearl-section youtube-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #ff6b6b; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">🎥</span> VIDEO TUTORIALS
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                    ${sections.youtube.map(p => `
                        <a href="${p.reference_url}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; text-decoration: none; color: white;">
                            <span>▶️</span>
                            <span>${p.pearl_title || 'Watch Tutorial'}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Section: Strategic Intelligence (Deep Research Content)
    if (sections.intelligence.length > 0) {
        const maxIntel = 10;
        html += `
            <div class="pearl-section intelligence-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #22d3ee; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">📊</span> STRATEGIC INTELLIGENCE
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">${sections.intelligence.length} insights</span>
                </h4>
                <div style="display: grid; gap: 12px;">
                    ${sections.intelligence.slice(0, maxIntel).map(p => renderPearlCard(p)).join('')}
                </div>
                ${sections.intelligence.length > maxIntel ? `
                    <details style="margin-top: 12px;">
                        <summary style="color: var(--brand-primary); cursor: pointer; font-size: 0.9rem; padding: 8px 0;">📖 Show ${sections.intelligence.length - maxIntel} more insights...</summary>
                        <div style="display: grid; gap: 12px; margin-top: 12px;">
                            ${sections.intelligence.slice(maxIntel).map(p => renderPearlCard(p)).join('')}
                        </div>
                    </details>
                ` : ''}
            </div>
        `;
    }

    // Section: General Intelligence (System Info, References, Procedures)
    const generalPearls = [...sections.general, ...sections.procedures].slice(0, 6);
    if (generalPearls.length > 0) {
        html += `
            <div class="pearl-section general-section" style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 16px 0; color: #8b5cf6; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">💎</span> RESEARCH INTELLIGENCE
                    <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-muted);">${generalPearls.length} pearls</span>
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                    ${generalPearls.map(p => renderPearlCard(p)).join('')}
                </div>
            </div>
        `;
    }

    // Wrap all sections in a prominent container
    if (html.trim()) {
        html = `
            <div class="pearl-master-section" style="background: linear-gradient(145deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04)); border: 2px solid rgba(139, 92, 246, 0.35); border-radius: 16px; padding: 20px; margin: 24px 0; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(139, 92, 246, 0.25);">
                    <h2 style="margin: 0; color: #a78bfa; font-size: 1.4rem; display: flex; align-items: center; gap: 10px; font-weight: 700;">
                        💎 Intelligence Pearls
                        <span style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${pearls.length} pearls</span>
                    </h2>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Community-verified locksmith intelligence</span>
                </div>
                ${html}
            </div>
        `;
    }

    return html;
}

// Pearl voting function
async function votePearl(pearlId, vote) {
    try {
        const res = await fetch(`${API}/api/pearls/${pearlId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ vote })
        });
        const data = await res.json();
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast(`Vote ${data.action}!`, 'success');
            // Optionally refresh the section
        }
    } catch (e) {
        showToast('Failed to vote', 'error');
    }
}

// Pearl comments modal
async function showPearlComments(pearlId) {
    try {
        const res = await fetch(`${API}/api/pearls/${pearlId}/comments`);
        const data = await res.json();
        const comments = data.comments || [];

        const modal = document.createElement('div');
        modal.id = 'pearlCommentsModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow: hidden;">
                <div style="padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: var(--text-primary);">💬 Pearl Comments</h3>
                    <button onclick="document.getElementById('pearlCommentsModal').remove()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 16px; overflow-y: auto; max-height: 50vh;">
                    ${comments.length === 0 ? '<p style="color: var(--text-muted); text-align: center;">No comments yet. Be the first!</p>' : comments.map(c => `
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <strong style="color: var(--text-primary);">${c.username || 'Anonymous'}</strong>
                                <span style="color: var(--text-muted); font-size: 0.8rem;">${new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p style="margin: 0; color: var(--text-secondary);">${c.content}</p>
                        </div>
                    `).join('')}
                </div>
                <div style="padding: 16px; border-top: 1px solid var(--border);">
                    <textarea id="pearlCommentInput" placeholder="Add a comment..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-primary); resize: none; height: 60px;"></textarea>
                    <button onclick="postPearlComment(${pearlId})" style="margin-top: 8px; width: 100%; padding: 10px; background: var(--brand-primary); border: none; border-radius: 8px; color: #000; font-weight: 600; cursor: pointer;">Post Comment</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (e) {
        showToast('Failed to load comments', 'error');
    }
}

async function postPearlComment(pearlId) {
    const input = document.getElementById('pearlCommentInput');
    const content = input?.value?.trim();
    if (!content) return;

    try {
        const res = await fetch(`${API}/api/pearls/${pearlId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Comment added!', 'success');
            document.getElementById('pearlCommentsModal')?.remove();
            showPearlComments(pearlId); // Refresh
        } else {
            showToast(data.error || 'Failed', 'error');
        }
    } catch (e) {
        showToast('Failed to post comment', 'error');
    }
}

/**
 * Parse structured steps from walkthrough data
 */
function parseStructuredSteps(guideData) {
    if (!guideData?.structured_steps_json) return null;
    if (Array.isArray(guideData.structured_steps_json)) {
        return guideData.structured_steps_json;
    }
    try {
        return JSON.parse(guideData.structured_steps_json);
    } catch (e) {
        console.warn('Failed to parse structured steps:', e);
        return null;
    }
}

/**
 * Render difficulty stars (1-5)
 */
function renderDifficultyStars(level) {
    const max = 5;
    const filled = Math.min(Math.max(1, level || 3), max);
    let html = '<div class="difficulty-stars">';
    for (let i = 1; i <= max; i++) {
        html += `<span class="star ${i <= filled ? '' : 'empty'}">★</span>`;
    }
    html += '</div>';
    return html;
}

/**
 * Render an affiliate part link with tracking
 */
function renderAffiliatePart(part, vehicle = {}) {
    const { year, make, model } = vehicle;
    const icons = { fob: '🔑', blade: '🗝️', battery: '🔋', tool: '🔧', lishi: '📐' };
    const icon = icons[part.type] || '🔧';

    // Build search query based on part type
    let query = '';
    switch (part.type) {
        case 'fob':
            query = `${year || ''} ${make || ''} ${model || ''} key fob ${part.id}`.trim();
            break;
        case 'blade':
            query = `${part.id} key blank`;
            break;
        case 'battery':
            query = `${part.id} battery 10 pack`;
            break;
        case 'tool':
            query = `${part.id} locksmith programmer`;
            break;
        case 'lishi':
            query = `Lishi ${part.id} pick decoder`;
            break;
        default:
            query = part.id;
    }

    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
    const trackingData = JSON.stringify({ type: part.type, id: part.id, ...vehicle });

    return `
        <a href="${url}" target="_blank" 
           onclick="logActivity('affiliate_click', ${trackingData})"
           class="part-link">
            <div class="part-info">
                <span class="part-icon">${icon}</span>
                <div>
                    <div class="part-id">${part.id}</div>
                    <div class="part-type">${part.type}</div>
                </div>
            </div>
            <span class="part-arrow">→</span>
        </a>
    `;
}

/**
 * Render comprehensive Key Intel Panel
 * Shows FCC IDs, key cutting info, chip details, and research guide links
 * @param {Array} configs - Vehicle configurations from /api/browse
 * @param {Array} keys - Compatible keys from /api/vehicle-keys (optional)
 * @param {Object} vehicle - { year, make, model }
 * @param {Object} options - { showAffiliateLinks, pearls, walkthrough }
 */
function renderKeyIntelPanel(configs, keys, vehicle, options = {}) {
    const { year, make, model } = vehicle;
    const { showAffiliateLinks = true, pearls = [], walkthrough = null } = options;

    if ((!configs || configs.length === 0) && (!keys || keys.length === 0)) {
        return '';
    }

    // Merge and dedupe FCC configurations
    const fccMap = new Map();

    // Add configs first (higher priority - verified data)
    (configs || []).forEach(c => {
        const fcc = (c.fcc_id || '').toUpperCase().replace(/O/g, '0').replace(/-/g, '');
        if (fcc && fcc !== 'N/A') {
            if (!fccMap.has(fcc)) {
                fccMap.set(fcc, {
                    fcc_id: c.fcc_id,
                    config_type: c.config_type || 'Smart Key',
                    buttons: c.buttons,
                    chip: c.chip || c.chip_family,
                    key_blade: c.key_blade,
                    battery: c.battery,
                    frequency: c.frequency,
                    lishi_tool: c.lishi_tool,
                    programmer: c.programmer,
                    verified: c.verified,
                    source: 'config'
                });
            }
        }
    });

    // Add keys if no configs (fallback)
    if (fccMap.size === 0 && keys && keys.length > 0) {
        keys.forEach(k => {
            const fcc = (k.fcc_id || '').toUpperCase().replace(/O/g, '0').replace(/-/g, '');
            if (fcc && !fccMap.has(fcc)) {
                fccMap.set(fcc, {
                    fcc_id: k.fcc_id,
                    config_type: k.key_type || 'Key',
                    buttons: k.button_count || k.buttons,
                    chip: k.chip,
                    key_blade: null,
                    battery: k.battery,
                    frequency: k.frequency,
                    verified: false,
                    source: 'vehicle_keys'
                });
            }
        });
    }

    const uniqueConfigs = Array.from(fccMap.values());
    if (uniqueConfigs.length === 0) return '';

    // Get cutting info from first config with data
    const cuttingConfig = uniqueConfigs.find(c => c.key_blade || c.lishi_tool) || uniqueConfigs[0];
    const keyBlade = cuttingConfig.key_blade || 'N/A';
    const lishiTool = cuttingConfig.lishi_tool || 'N/A';
    const chip = uniqueConfigs.find(c => c.chip)?.chip || 'N/A';
    const battery = uniqueConfigs.find(c => c.battery)?.battery || 'CR2032';
    const frequency = uniqueConfigs.find(c => c.frequency)?.frequency || 'N/A';

    let html = `<div class="key-intel-panel" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; margin-top: 16px; overflow: hidden;">`;

    // === SECTION 1: KEY OPTIONS (FCC IDs) ===
    html += `
        <div class="key-intel-section" style="padding: 16px; border-bottom: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 1.2rem;">🔐</span>
                <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">KEY OPTIONS</span>
                ${uniqueConfigs.length > 1 ? `<span style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-tertiary); padding: 2px 8px; border-radius: 4px;">${uniqueConfigs.length} variants</span>` : ''}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">`;

    uniqueConfigs.forEach((config, idx) => {
        const isFirst = idx === 0;
        const fccDisplay = config.fcc_id || 'Unknown';
        const btnDisplay = config.buttons ? `${config.buttons}-Btn` : '';
        const typeLabel = config.config_type || 'Smart Key';

        // Determine variant label (Base, Remote Start, etc.)
        let variantLabel = typeLabel;
        if (config.buttons) {
            if (config.buttons <= 4) variantLabel = 'Base Model';
            else if (config.buttons >= 5) variantLabel = 'Remote Start';
        }

        const amazonQuery = `${year} ${make} ${model} key fob ${fccDisplay}`;
        const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(amazonQuery)}&tag=${AMAZON_TAG}`;

        html += `
            <a href="${amazonUrl}" target="_blank" 
               onclick="logActivity('affiliate_click', {type:'key_intel_fcc', fcc:'${fccDisplay}', year:'${year}', make:'${make}', model:'${model}'})"
               style="display: flex; flex-direction: column; padding: 12px; background: ${isFirst ? 'rgba(59,130,246,0.1)' : 'var(--bg-tertiary)'}; border: 1px solid ${isFirst ? 'rgba(59,130,246,0.4)' : 'var(--border)'}; border-radius: 8px; text-decoration: none; transition: all 0.2s;"
               onmouseover="this.style.borderColor='var(--brand-primary)'; this.style.transform='translateY(-2px)'"
               onmouseout="this.style.borderColor='${isFirst ? 'rgba(59,130,246,0.4)' : 'var(--border)'}'; this.style.transform='translateY(0)'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--accent); font-family: monospace;">${fccDisplay}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${btnDisplay} ${variantLabel}</div>
                    </div>
                    ${config.verified ? '<span style="color: #22c55e; font-size: 0.9rem;" title="Verified">✓</span>' : ''}
                </div>
                ${config.chip ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">Chip: ${config.chip}</div>` : ''}
                <div style="font-size: 0.7rem; color: #22c55e; margin-top: 8px;">Buy on Amazon →</div>
            </a>`;
    });

    html += `</div></div>`;

    // === SECTION 2: KEY CUTTING INFO ===
    if (keyBlade !== 'N/A' || lishiTool !== 'N/A' || chip !== 'N/A') {
        html += `
            <div class="key-intel-section" style="padding: 16px; border-bottom: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.2rem;">🗝️</span>
                    <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">KEY CUTTING & CHIP</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">`;

        // Key Blade
        if (keyBlade !== 'N/A') {
            const bladeQuery = `${keyBlade} key blank`;
            const bladeUrl = `https://www.amazon.com/s?k=${encodeURIComponent(bladeQuery)}&tag=${AMAZON_TAG}`;
            html += `
                <a href="${bladeUrl}" target="_blank" 
                   onclick="logActivity('affiliate_click', {type:'key_intel_blade', blade:'${keyBlade}'})"
                   style="display: flex; flex-direction: column; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; text-decoration: none;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Key Blank</div>
                    <div style="font-weight: 600; color: var(--text-primary);">${keyBlade}</div>
                    <div style="font-size: 0.65rem; color: #22c55e; margin-top: 4px;">Shop →</div>
                </a>`;
        }

        // Lishi Tool
        if (lishiTool !== 'N/A') {
            const lishiQuery = `Lishi ${lishiTool} pick decoder`;
            const lishiUrl = `https://www.amazon.com/s?k=${encodeURIComponent(lishiQuery)}&tag=${AMAZON_TAG}`;
            html += `
                <a href="${lishiUrl}" target="_blank" 
                   onclick="logActivity('affiliate_click', {type:'key_intel_lishi', lishi:'${lishiTool}'})"
                   style="display: flex; flex-direction: column; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; text-decoration: none;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Lishi Tool</div>
                    <div style="font-weight: 600; color: var(--text-primary);">${lishiTool}</div>
                    <div style="font-size: 0.65rem; color: #22c55e; margin-top: 4px;">Shop →</div>
                </a>`;
        }

        // Chip Type
        if (chip !== 'N/A') {
            html += `
                <div style="display: flex; flex-direction: column; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Chip Type</div>
                    <div style="font-weight: 600; color: var(--accent);">${chip}</div>
                </div>`;
        }

        // Battery
        if (battery && battery !== 'N/A') {
            const batteryQuery = `${battery} battery 10 pack`;
            const batteryUrl = `https://www.amazon.com/s?k=${encodeURIComponent(batteryQuery)}&tag=${AMAZON_TAG}`;
            html += `
                <a href="${batteryUrl}" target="_blank" 
                   onclick="logActivity('affiliate_click', {type:'key_intel_battery', battery:'${battery}'})"
                   style="display: flex; flex-direction: column; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; text-decoration: none;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Battery</div>
                    <div style="font-weight: 600; color: var(--text-primary);">${battery}</div>
                    <div style="font-size: 0.65rem; color: #22c55e; margin-top: 4px;">Shop →</div>
                </a>`;
        }

        // Frequency
        if (frequency !== 'N/A') {
            html += `
                <div style="display: flex; flex-direction: column; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Frequency</div>
                    <div style="font-weight: 600; color: var(--text-primary);">${frequency}</div>
                </div>`;
        }

        html += `</div></div>`;
    }

    // === SECTION 3: RESEARCH GUIDE (if pearls or walkthrough available) ===
    if (pearls.length > 0 || walkthrough) {
        html += `
            <div class="key-intel-section" style="padding: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.2rem;">📚</span>
                    <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">RESEARCH GUIDE</span>
                    ${walkthrough?.verified ? '<span style="background: rgba(34,197,94,0.2); color: #22c55e; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">Verified</span>' : ''}
                </div>`;

        // Show summary pearls (max 3)
        if (pearls.length > 0) {
            html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
            pearls.slice(0, 3).forEach(pearl => {
                html += `
                    <div style="background: rgba(139, 92, 246, 0.1); border-left: 3px solid #8b5cf6; padding: 10px 12px; border-radius: 0 6px 6px 0;">
                        <div style="font-weight: 600; color: #a78bfa; font-size: 0.85rem; margin-bottom: 4px;">${pearl.pearl_title || 'Key Insight'}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">${(pearl.pearl_content || '').substring(0, 150)}${(pearl.pearl_content || '').length > 150 ? '...' : ''}</div>
                    </div>`;
            });
            html += `</div>`;
        }

        // Show walkthrough link if available
        if (walkthrough && walkthrough.id) {
            html += `
                <button onclick="openGuideModal('${walkthrough.id}')" 
                        style="margin-top: 12px; width: 100%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 12px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>📖</span>
                    <span>View Full Research Guide</span>
                    <span>→</span>
                </button>
                <div id="guide-data-${walkthrough.id}" data-guide-json="${btoa(unescape(encodeURIComponent(JSON.stringify(walkthrough))))}" style="display:none;"></div>`;
        }

        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

/**
 * Render premium-gated content
 * TEMPORARY: Gating disabled - showing all content for development/preview
 */
function renderGatedContent(content, isPremium, userHasPremium) {
    // Disable gating for now - show all content
    return content;

    /* Re-enable for paywall:
    if (!isPremium || userHasPremium) {
        return content;
    }
    return `
        <div class="premium-gate">
            <div class="premium-gate-content">${content}</div>
            <div class="premium-gate-overlay">
                <button class="premium-unlock-btn" onclick="showPremiumModal && showPremiumModal()">
                    🔒 Unlock with Premium
                </button>
            </div>
        </div>
    `;
    */
}

/**
 * Render a Locksmith Intelligence Card
 * @param {Object} walkthrough - Walkthrough data from API
 * @param {Object} config - Vehicle config data
 * @param {Object} vehicle - { year, make, model }
 * @param {Object} options - { isPremiumUser, showAffiliate, cardIndex }
 */
function renderIntelCard(walkthrough, config, vehicle, options = {}) {
    const { isPremiumUser = false, showAffiliate = true, cardIndex = 0 } = options;
    const { year, make, model } = vehicle;

    // Parse structured data from walkthrough
    // The structured_steps_json may be a string that needs parsing first
    let parsed = {};
    if (typeof walkthrough?.structured_steps_json === 'string') {
        try {
            parsed = JSON.parse(walkthrough.structured_steps_json);
        } catch (e) {
            console.warn('Failed to parse structured_steps_json:', e);
        }
    } else if (typeof walkthrough?.structured_steps_json === 'object') {
        parsed = walkthrough.structured_steps_json || {};
    }



    const quickFacts = parsed.quick_facts || walkthrough?.quick_facts || {};
    const partsNeeded = parsed.parts_needed || walkthrough?.parts_needed || [];
    const alerts = parsed.alerts || walkthrough?.alerts || [];
    const steps = parsed.steps || walkthrough?.steps || [];
    const proTips = parsed.pro_tips || walkthrough?.pro_tips || [];

    // Sanitize Quick Facts to reject garbage values
    function sanitizeQuickFactValue(value, fieldType = 'generic') {
        if (!value || value === 'null' || value === 'undefined') return null;
        const strVal = String(value).trim();
        // Reject base64-looking strings (contain + / = and long)
        if (/[\/+=]/.test(strVal) && strVal.length > 15) return null;
        // Reject long alphanumeric hashes (> 20 chars of just letters/numbers)
        if (/^[a-zA-Z0-9]{20,}$/.test(strVal)) return null;
        // Reject values that are too long for display
        if (strVal.length > 30) return null;
        // Field-specific validation
        if (fieldType === 'chip') {
            // Only allow known chip patterns
            if (!/^(NCF|PCF|Hitag|ID4|4[DCEF]|N\/A|Varies)/i.test(strVal) && strVal.length > 15) return null;
        }
        return strVal;
    }

    // Sanitized values for display
    const displayChip = sanitizeQuickFactValue(quickFacts.chip, 'chip') || config?.chip || 'N/A';

    // NEW: Enhanced structured data
    const criticalInsights = parsed.critical_insights || [];
    const dossierSections = parsed.dossier_sections || [];
    const componentLocations = parsed.component_locations || [];
    const toolWorkflow = parsed.tool_workflow || [];

    // NEW: Book-style chapters (full document sections)
    const isBookFormat = parsed.book_format === true;
    const bookChapters = parsed.chapters || [];

    // Derive data from config if walkthrough is sparse
    const fccId = config?.fcc_id || walkthrough?.fcc_id || 'N/A';
    const keyType = config?.config_type || config?.key_type || 'Smart Key';
    const isVerified = config?.verified || walkthrough?.verified;

    // Build parts from config if not in walkthrough
    const parts = partsNeeded.length > 0 ? partsNeeded : [
        { type: 'fob', id: fccId, affiliate: true },
        { type: 'blade', id: config?.key_blade || config?.keyway || 'N/A', affiliate: true },
        { type: 'battery', id: config?.battery || 'CR2032', affiliate: true }
    ].filter(p => p.id && p.id !== 'N/A');

    // Generate unique key for this card
    const cardKey = walkthrough?.id || walkthrough?.slug || `intel-${make}-${model}-${year}-${cardIndex}`;

    // Store HTML content or URL for modal (multi-tier storage support)
    if (walkthrough?.full_content_html) {
        currentWalkthroughHtml = walkthrough.full_content_html;
        currentWalkthroughUrl = null;
    } else if (parsed?.html_url) {
        // Multi-tier storage: fetch HTML from static URL on demand
        currentWalkthroughUrl = parsed.html_url;
        currentWalkthroughHtml = null;
    }
    currentWalkthroughTitle = walkthrough?.title || `${year} ${make} ${model} Guide`;

    let html = `
        <div class="intel-card" id="intel-card-${cardKey}">
            <!-- Card Header -->
            <div class="intel-card-header">
                <div class="intel-card-title">
                    <span>🔑</span>
                    <span>${year} ${make} ${model} - ${keyType}</span>
                </div>
                <div class="intel-card-badges">
                    ${fccId !== 'N/A' ? `<a href="https://www.amazon.com/s?k=${encodeURIComponent(`${year} ${make} ${model} key fob ${fccId}`)}&tag=${AMAZON_TAG}" 
                       target="_blank" 
                       class="fcc-badge affiliate-link" 
                       onclick="typeof logActivity === 'function' && logActivity('affiliate_click', {type:'fcc',id:'${fccId}',year:'${year}',make:'${make}',model:'${model}'})"
                       title="Shop for ${fccId} key fob on Amazon">${fccId} 🛒</a>` : ''}
                    ${isVerified ? '<span class="verified-badge">✔ Verified</span>' : ''}
                </div>
            </div>
            
            <!-- Card Body -->
            <div class="intel-card-body">
                
                <!-- Two Column Layout: Quick Facts + Parts -->
                <div class="intel-grid">
                    <!-- Quick Facts -->
                    <div class="quick-facts">
                        <div class="quick-facts-title">⚡ Quick Facts</div>
                        <div class="quick-facts-grid">
                            <div class="quick-fact">
                                <span class="quick-fact-icon">📊</span>
                                <div class="quick-fact-content">
                                    <div class="quick-fact-label">Difficulty</div>
                                    <div class="quick-fact-value">${renderDifficultyStars(quickFacts.difficulty || 3)}</div>
                                </div>
                            </div>
                            <div class="quick-fact">
                                <span class="quick-fact-icon">⏱️</span>
                                <div class="quick-fact-content">
                                    <div class="quick-fact-label">Time</div>
                                    <div class="quick-fact-value">~${quickFacts.time_mins || walkthrough?.estimated_time_mins || 30} min</div>
                                </div>
                            </div>
                            <div class="quick-fact">
                                <span class="quick-fact-icon">🛡️</span>
                                <div class="quick-fact-content">
                                    <div class="quick-fact-label">Chip</div>
                                    <div class="quick-fact-value">${displayChip}</div>
                                </div>
                            </div>
                            <div class="quick-fact">
                                <span class="quick-fact-icon">${quickFacts.sgw_required ? '⚠️' : '✅'}</span>
                                <div class="quick-fact-content">
                                    <div class="quick-fact-label">SGW</div>
                                    <div class="quick-fact-value" style="color: ${quickFacts.sgw_required ? '#f59e0b' : '#22c55e'};">
                                        ${quickFacts.sgw_required ? 'Bypass Req' : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parts Needed -->
                    ${showAffiliate && parts.length > 0 ? `
                    <div class="parts-needed">
                        <div class="parts-needed-title">🛒 What You'll Need</div>
                        ${parts.map(p => renderAffiliatePart(p, vehicle)).join('')}
                    </div>
                    ` : ''}
                </div>
    `;

    // ===========================================
    // NEW: Critical Insights (Actionable Warnings)
    // ===========================================
    if (criticalInsights.length > 0) {
        html += `<div class="critical-insights-section">`;
        criticalInsights.forEach(insight => {
            const typeColors = {
                danger: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', icon: '🚨' },
                warning: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', icon: '⚠️' },
                info: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', icon: 'ℹ️' }
            };
            const style = typeColors[insight.type] || typeColors.warning;

            html += `
                <div class="critical-insight" style="background: ${style.bg}; border-left: 4px solid ${style.border}; padding: 12px 16px; margin: 8px 0; border-radius: 8px;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <span style="font-size: 1.1rem;">${style.icon}</span>
                        <div>
                            <div style="font-weight: 700; font-size: 0.85rem; color: ${style.border}; margin-bottom: 4px;">${insight.title || 'Warning'}</div>
                            <div style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.5;">${insight.text}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    // ===========================================
    // NEW: Tool Walkthrough (Step-by-Step with Tools)
    // ===========================================
    if (toolWorkflow.length > 0) {
        html += `
            <details class="dossier-section" style="margin-top: 16px;">
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; color: var(--text-primary);">
                    <span>🔧</span>
                    <span>Tool Walkthrough</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-muted);">${toolWorkflow.length} steps</span>
                </summary>
                <div style="padding: 16px; background: var(--bg-secondary); border-radius: 0 0 8px 8px; border: 1px solid var(--border); border-top: none;">
        `;
        toolWorkflow.forEach((step, idx) => {
            html += `
                <div class="workflow-step" style="display: flex; gap: 12px; padding: 10px 0; ${idx > 0 ? 'border-top: 1px solid var(--border);' : ''}">
                    <div style="width: 28px; height: 28px; background: var(--brand-primary); color: var(--bg-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;">${step.step || idx + 1}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${step.title}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${step.description}</div>
                        ${step.tool ? `<div style="margin-top: 6px;"><span style="background: var(--bg-tertiary); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-muted);">🔧 ${step.tool}</span></div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></details>`;
    }

    // ===========================================
    // NEW: Collapsible Dossier Sections
    // ===========================================
    if (dossierSections.length > 0) {
        html += `<div class="dossier-sections" style="margin-top: 16px;">`;
        dossierSections.slice(0, 6).forEach((section, idx) => { // Max 6 sections
            html += `
                <details class="dossier-section" style="margin-top: 8px;">
                    <summary style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; color: var(--text-primary);">
                        <span>${section.icon || '📄'}</span>
                        <span>${section.title}</span>
                    </summary>
                    <div style="padding: 16px; background: var(--bg-secondary); border-radius: 0 0 8px 8px; border: 1px solid var(--border); border-top: none; font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
                        ${section.content_html || section.summary || 'No content available'}
                    </div>
                </details>
            `;
        });
        html += `</div>`;
    }

    // ===========================================
    // BOOK FORMAT: Full Document Chapters
    // ===========================================
    if (isBookFormat && bookChapters.length > 0) {
        html += `<div class="book-chapters" style="margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 1.1rem;">📚</span>
                <span style="font-weight: 600; color: var(--text-primary);">Full Document (${bookChapters.length} Chapters)</span>
            </div>`;

        bookChapters.forEach((chapter, chapterIdx) => {
            const sectionCount = chapter.sections?.length || 0;
            html += `
            <details class="book-chapter" style="margin-top: 8px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%); font-weight: 600; color: var(--text-primary);">
                    <span style="font-size: 1.1rem;">${chapter.icon || '📄'}</span>
                    <span>${chapter.number}. ${chapter.title}</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-primary); padding: 3px 8px; border-radius: 4px;">${sectionCount} section${sectionCount !== 1 ? 's' : ''}</span>
                </summary>
                <div style="padding: 12px 16px; background: var(--bg-secondary);">`;

            if (chapter.sections && chapter.sections.length > 0) {
                chapter.sections.forEach((section, secIdx) => {
                    html += `
                    <details class="book-subsection" style="margin-top: ${secIdx > 0 ? '8px' : '0'};" ${secIdx === 0 ? 'open' : ''}>
                        <summary style="cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg-tertiary); border-radius: 6px; font-weight: 500; font-size: 0.9rem; color: var(--text-primary);">
                            <span style="color: var(--brand-primary); font-weight: 700;">${section.number}</span>
                            <span>${section.title}</span>
                        </summary>
                        <div style="padding: 14px; background: var(--bg-primary); border-radius: 0 0 6px 6px; margin-top: -4px; font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
                            ${section.content_html || '<p>Content loading...</p>'}
                        </div>
                    </details>`;
                });
            }

            html += `</div></details>`;
        });

        html += `</div>`;
    }

    // ===========================================
    // NEW: Component Location Table
    // ===========================================
    if (componentLocations.length > 0) {
        html += `
            <details class="dossier-section" style="margin-top: 16px;">
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; color: var(--text-primary);">
                    <span>📍</span>
                    <span>Component Locations</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-muted);">${componentLocations.length} items</span>
                </summary>
                <div style="padding: 12px; background: var(--bg-secondary); border-radius: 0 0 8px 8px; border: 1px solid var(--border); border-top: none; overflow-x: auto;">
                    <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                <th style="padding: 8px; color: var(--text-muted);">Component</th>
                                <th style="padding: 8px; color: var(--text-muted);">Location</th>
                                <th style="padding: 8px; color: var(--text-muted);">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${componentLocations.map(c => `
                                <tr style="border-bottom: 1px solid var(--border);">
                                    <td style="padding: 8px; font-weight: 600; color: var(--text-primary);">${c.component}</td>
                                    <td style="padding: 8px; color: var(--text-secondary);">${c.location}</td>
                                    <td style="padding: 8px; color: var(--text-muted); font-size: 0.75rem;">${c.notes}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    }

    // Legacy: Critical Alerts (fallback if no critical_insights)
    if (alerts.length > 0 && criticalInsights.length === 0) {
        alerts.slice(0, 3).forEach(alert => {
            if (!alert.premium || isPremiumUser) {
                const level = (alert.level || 'info').toLowerCase();
                const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️' };
                html += `
                    <div class="intel-alert ${level}">
                        <span class="intel-alert-icon">${icons[level] || 'ℹ️'}</span>
                        <div class="intel-alert-content">
                            <div class="intel-alert-title">${level.toUpperCase()}</div>
                            <div class="intel-alert-text">${alert.text || alert.content}</div>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Procedure Steps (collapsible, only if no tool_workflow)
    if (steps.length > 0 && toolWorkflow.length === 0) {
        html += `
            <details class="dossier-section" style="margin-top: 16px;">
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; color: var(--text-primary);">
                    <span>📋</span>
                    <span>Procedure Steps</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-muted);">${steps.length} steps</span>
                </summary>
                <div style="padding: 16px; background: var(--bg-secondary); border-radius: 0 0 8px 8px; border: 1px solid var(--border); border-top: none;">
                ${steps.map((step, idx) => `
                    <div class="procedure-step" style="display: flex; gap: 12px; padding: 8px 0; ${idx > 0 ? 'border-top: 1px solid var(--border);' : ''}">
                        <div style="width: 24px; height: 24px; background: var(--brand-primary); color: var(--bg-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0;">${idx + 1}</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">${step.title || `Step ${idx + 1}`}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${step.description || step.content || ''}</div>
                        </div>
                    </div>
                `).join('')}
                </div>
            </details>
        `;
    }

    // Pro Tips (collapsible)
    if (proTips.length > 0) {
        html += `
            <details class="dossier-section" style="margin-top: 16px;">
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; color: var(--text-primary);">
                    <span>💎</span>
                    <span>Pro Tips</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-muted);">${proTips.length}</span>
                </summary>
                <div style="padding: 16px; background: var(--bg-secondary); border-radius: 0 0 8px 8px; border: 1px solid var(--border); border-top: none;">
                ${proTips.map(tip => `
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <span style="color: var(--brand-primary);">•</span>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${tip.text || tip}</span>
                    </div>
                `).join('')}
                </div>
            </details>
        `;
    }


    // Action Bar
    const youtubeQuery = encodeURIComponent(`${year} ${make} ${model} key programming`);
    const vehicleKey = `${make}|${model}|${year}`;

    // Community Tips Section (inside Intel Card)
    html += `
        <!-- Community Tips Section -->
        <div id="communityTips-intel-${cardIndex}" class="community-tips-section" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
            <details>
                <summary style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-secondary); font-weight: 600;">
                    <span>💬</span>
                    <span>Community Tips</span>
                    <span id="commentCount-intel-${cardIndex}" style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem;">...</span>
                </summary>
                <div style="margin-top: 12px;">
                    <div id="commentsContainer-intel-${cardIndex}" style="margin-bottom: 12px;">
                        <div class="loading" style="font-size: 0.8rem; color: var(--text-muted);">Loading tips...</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="commentInput-intel-${cardIndex}" 
                               placeholder="Share a tip for this vehicle..." 
                               style="flex: 1; padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.85rem;"
                               maxlength="500">
                        <button onclick="postComment('${vehicleKey}', 'intel-${cardIndex}')"
                                style="padding: 8px 16px; background: var(--brand-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                            Post
                        </button>
                    </div>
                </div>
            </details>
        </div>
    `;

    html += `
                <!-- Action Bar -->
                <div class="intel-card-actions">
                    ${walkthrough?.video_url ? `
                    <a href="${walkthrough.video_url}" target="_blank" class="intel-action-btn video">
                        📹 Watch Video
                    </a>
                    ` : `
                    <a href="https://youtube.com/results?search_query=${youtubeQuery}" target="_blank" class="intel-action-btn video">
                        📹 Find Videos
                    </a>
                    `}
                    ${(walkthrough?.full_content_html || parsed?.html_url) ? `
                    <button onclick="showFullGuide(${cardIndex})" class="intel-action-btn">
                        📄 Full Guide
                    </button>
                    ` : ''}
                    <button onclick="document.querySelector('#communityTips-intel-${cardIndex} details')?.setAttribute('open', '')" class="intel-action-btn">
                        💬 Tips
                    </button>
                </div>
            </div>
        </div>
    `;

    return html;
}

// Store walkthrough data for modal access
let currentWalkthroughHtml = null;
let currentWalkthroughUrl = null;  // For multi-tier storage (fetch on demand)
let currentWalkthroughTitle = null;
let currentWalkthroughMeta = null;

/**
 * Show full guide content in a premium modal
 * Renders Google Docs HTML in an iframe for proper formatting
 */
function showFullGuide(cardIndex) {
    let modal = document.getElementById('fullGuideModal');

    if (!modal) {
        // Create beautiful modal with premium styling
        const modalHtml = `
            <div id="fullGuideModal" class="guide-modal-overlay">
                <div class="guide-modal-container">
                    <!-- Floating Header -->
                    <div class="guide-modal-header">
                        <div class="guide-header-left">
                            <span class="guide-header-icon">📖</span>
                            <div class="guide-header-info">
                                <div id="guideModalTitle" class="guide-header-title">Full Guide</div>
                                <div id="guideModalMeta" class="guide-header-meta">
                                    <span class="meta-badge">🖼️ With Images</span>
                                    <span class="meta-badge">📄 Google Docs</span>
                                </div>
                            </div>
                        </div>
                        <div class="guide-header-actions">
                            <button onclick="toggleGuideTheme()" class="guide-btn-icon" title="Toggle Theme">
                                🌓
                            </button>
                            <button onclick="closeFullGuide()" class="guide-btn-close">
                                <span>✕</span> Close
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content Area with iframe -->
                    <div class="guide-modal-body">
                        <div id="guideLoadingState" class="guide-loading">
                            <div class="guide-loading-spinner"></div>
                            <div class="guide-loading-text">Loading document...</div>
                        </div>
                        <iframe id="guideContentFrame" 
                                class="guide-content-frame" 
                                sandbox="allow-same-origin"
                                onload="onGuideFrameLoad()"></iframe>
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div class="guide-modal-footer">
                        <div class="guide-footer-hint">
                            💡 Scroll to view full document • Images included
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('fullGuideModal');
    }

    // Update title if available
    if (currentWalkthroughTitle) {
        document.getElementById('guideModalTitle').textContent = currentWalkthroughTitle;
    }

    // Show loading state
    document.getElementById('guideLoadingState').style.display = 'flex';
    document.getElementById('guideContentFrame').style.opacity = '0';

    // Inject HTML into iframe for proper isolation
    const iframe = document.getElementById('guideContentFrame');

    if (currentWalkthroughHtml) {
        // Create full HTML document with dark theme styling
        const wrappedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    :root {
                        --bg: #111827;
                        --bg-secondary: #1f2937;
                        --text: #f9fafb;
                        --text-secondary: #d1d5db;
                        --accent: #fbbf24;
                        --border: rgba(251, 191, 36, 0.2);
                    }
                    
                    * { box-sizing: border-box; }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: var(--bg);
                        color: var(--text);
                        line-height: 1.8;
                        padding: 32px 40px;
                        margin: 0;
                        font-size: 16px;
                    }
                    
                    /* Override Google Docs default styling */
                    body * {
                        background-color: transparent !important;
                        color: inherit !important;
                    }
                    
                    h1, h2, h3, h4, h5, h6 {
                        color: var(--accent) !important;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                        font-weight: 700;
                        line-height: 1.3;
                    }
                    
                    h1 { font-size: 2rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
                    h2 { font-size: 1.5rem; }
                    h3 { font-size: 1.25rem; }
                    
                    p {
                        margin: 0.75em 0;
                        color: var(--text-secondary) !important;
                    }
                    
                    a {
                        color: var(--accent) !important;
                        text-decoration: underline;
                    }
                    
                    /* Tables */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 1.5em 0;
                        background: var(--bg-secondary) !important;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    
                    th, td {
                        padding: 12px 16px;
                        text-align: left;
                        border: 1px solid var(--border);
                    }
                    
                    th {
                        background: rgba(251, 191, 36, 0.1) !important;
                        font-weight: 600;
                        color: var(--accent) !important;
                    }
                    
                    tr:hover td {
                        background: rgba(251, 191, 36, 0.05) !important;
                    }
                    
                    /* Lists */
                    ul, ol {
                        padding-left: 1.5em;
                        margin: 1em 0;
                    }
                    
                    li {
                        margin: 0.5em 0;
                        color: var(--text-secondary) !important;
                    }
                    
                    /* Images */
                    img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 1em 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    }
                    
                    /* Code blocks */
                    code, pre {
                        font-family: 'Monaco', 'Consolas', monospace;
                        background: var(--bg-secondary) !important;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 0.9em;
                    }
                    
                    pre {
                        padding: 16px;
                        overflow-x: auto;
                    }
                    
                    /* Blockquotes / Callouts */
                    blockquote {
                        border-left: 4px solid var(--accent);
                        margin: 1em 0;
                        padding: 0.5em 1em;
                        background: rgba(251, 191, 36, 0.05) !important;
                        font-style: italic;
                    }
                    
                    /* Dividers */
                    hr {
                        border: none;
                        border-top: 1px solid var(--border);
                        margin: 2em 0;
                    }
                    
                    /* Light theme mode */
                    body.light-theme {
                        --bg: #ffffff;
                        --bg-secondary: #f3f4f6;
                        --text: #111827;
                        --text-secondary: #4b5563;
                        --accent: #d97706;
                        --border: rgba(217, 119, 6, 0.3);
                    }
                    
                    /* Responsive */
                    @media (max-width: 768px) {
                        body { padding: 20px; font-size: 15px; }
                        h1 { font-size: 1.5rem; }
                        h2 { font-size: 1.25rem; }
                    }
                </style>
            </head>
            <body id="guideBody">
                ${currentWalkthroughHtml}
            </body>
            </html>
        `;

        iframe.srcdoc = wrappedHtml;
    } else if (currentWalkthroughUrl) {
        // Multi-tier storage: fetch HTML from static URL
        fetchAndDisplayGuide(currentWalkthroughUrl, iframe);
    } else {
        iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head><style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    background: #111827; 
                    color: #9ca3af; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    margin: 0;
                    text-align: center;
                }
            </style></head>
            <body>
                <div>
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                    <div>Full guide content not available.</div>
                </div>
            </body>
            </html>
        `;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Handle iframe load completion
 */
function onGuideFrameLoad() {
    document.getElementById('guideLoadingState').style.display = 'none';
    document.getElementById('guideContentFrame').style.opacity = '1';
}

/**
 * Toggle between dark and light theme in the guide
 */
function toggleGuideTheme() {
    const iframe = document.getElementById('guideContentFrame');
    try {
        const body = iframe.contentDocument?.getElementById('guideBody');
        if (body) {
            body.classList.toggle('light-theme');
        }
    } catch (e) {
        console.warn('Could not toggle theme:', e);
    }
}

/**
 * Fetch HTML guide from static URL and display in iframe
 * Used for multi-tier storage where full HTML is stored as static files
 */
async function fetchAndDisplayGuide(url, iframe) {
    try {
        console.log('📄 Fetching guide from:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch guide: ${response.status}`);
        }

        const html = await response.text();

        // Wrap with dark theme styling (same as inline HTML)
        const wrappedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    :root {
                        --bg: #111827;
                        --bg-secondary: #1f2937;
                        --text: #f9fafb;
                        --text-secondary: #d1d5db;
                        --accent: #fbbf24;
                        --border: rgba(251, 191, 36, 0.2);
                    }
                    
                    * { box-sizing: border-box; }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: var(--bg);
                        color: var(--text);
                        line-height: 1.8;
                        padding: 32px 40px;
                        margin: 0;
                        font-size: 16px;
                    }
                    
                    /* Override Google Docs default styling */
                    body * {
                        background-color: transparent !important;
                        color: inherit !important;
                    }
                    
                    h1, h2, h3, h4, h5, h6 {
                        color: var(--accent) !important;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                        font-weight: 700;
                        line-height: 1.3;
                    }
                    
                    h1 { font-size: 2rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
                    h2 { font-size: 1.5rem; }
                    h3 { font-size: 1.25rem; }
                    
                    p { margin: 0.75em 0; color: var(--text-secondary) !important; }
                    a { color: var(--accent) !important; text-decoration: underline; }
                    
                    /* Tables */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 1.5em 0;
                        background: var(--bg-secondary) !important;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    
                    th, td { padding: 12px 16px; text-align: left; border: 1px solid var(--border); }
                    th { background: rgba(251, 191, 36, 0.1) !important; font-weight: 600; color: var(--accent) !important; }
                    tr:hover td { background: rgba(251, 191, 36, 0.05) !important; }
                    
                    /* Lists */
                    ul, ol { padding-left: 1.5em; margin: 1em 0; }
                    li { margin: 0.5em 0; color: var(--text-secondary) !important; }
                    
                    /* Images */
                    img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 1em 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    }
                    
                    /* Light theme mode */
                    body.light-theme {
                        --bg: #ffffff;
                        --bg-secondary: #f3f4f6;
                        --text: #111827;
                        --text-secondary: #4b5563;
                        --accent: #d97706;
                        --border: rgba(217, 119, 6, 0.3);
                    }
                </style>
            </head>
            <body id="guideBody">
                ${html}
            </body>
            </html>
        `;

        iframe.srcdoc = wrappedHtml;

    } catch (error) {
        console.error('Failed to fetch guide:', error);
        iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head><style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    background: #111827; 
                    color: #ef4444; 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    margin: 0;
                    text-align: center;
                    padding: 20px;
                }
                .retry { 
                    margin-top: 16px; 
                    padding: 12px 24px; 
                    background: #fbbf24; 
                    color: #111827; 
                    border: none; 
                    border-radius: 8px; 
                    font-weight: 600;
                    cursor: pointer;
                }
            </style></head>
            <body>
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <div>Failed to load guide content.</div>
                <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 8px;">${error.message}</div>
            </body>
            </html>
        `;
        onGuideFrameLoad(); // Hide loading state
    }
}

/**
 * Close the full guide modal
 */
function closeFullGuide() {
    const modal = document.getElementById('fullGuideModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

async function voteComment(commentId, voteType) {
    try {
        const response = await fetch(`${API}/api/vehicle-comments/upvote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment_id: commentId })
        });

        const data = await response.json();

        if (data.error === 'Login required to vote') {
            showToast && showToast('Please sign in to vote', 'info');
        } else if (data.success) {
            // Refresh the comment section - find the vehicle key from URL or state
            // For now just show feedback
            showToast && showToast('Vote recorded', 'success');
        }
    } catch (err) {
        console.error('Vote error:', err);
    }
}

function getTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


const POPULAR_MAKES = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
    'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
    'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini',
    'Mitsubishi', 'Nissan', 'Porsche', 'Ram', 'Subaru', 'Toyota', 'Volkswagen', 'Volvo'
];

// Map makes to domain names for Clearbit Logo API
const MAKE_DOMAINS = {
    'Acura': 'acura.com', 'Audi': 'audi.com', 'BMW': 'bmw.com', 'Buick': 'buick.com',
    'Cadillac': 'cadillac.com', 'Chevrolet': 'chevrolet.com', 'Chrysler': 'chrysler.com',
    'Dodge': 'dodge.com', 'Fiat': 'fiat.com', 'Ford': 'ford.com', 'GMC': 'gmc.com',
    'Honda': 'honda.com', 'Hyundai': 'hyundai.com', 'Infiniti': 'infiniti.com',
    'Jaguar': 'jaguar.com', 'Jeep': 'jeep.com', 'Kia': 'kia.com',
    'Land Rover': 'landrover.com', 'Lexus': 'lexus.com', 'Lincoln': 'lincoln.com',
    'Mazda': 'mazdausa.com', 'Mercedes-Benz': 'mbusa.com', 'Mini': 'miniusa.com',
    'Mitsubishi': 'mitsubishicars.com', 'Nissan': 'nissanusa.com', 'Porsche': 'porsche.com',
    'Ram': 'ramtrucks.com', 'Subaru': 'subaru.com', 'Toyota': 'toyota.com',
    'Volkswagen': 'vw.com', 'Volvo': 'volvocars.com'
};

// Pre-defined Brand Colors for nicer text avatars
const BRAND_COLORS = {
    'Acura': '#E82C2A', 'Audi': '#BB0A30', 'BMW': '#0066B1', 'Buick': '#FF6600',
    'Cadillac': '#A63328', 'Chevrolet': '#CD9834', 'Chrysler': '#003DA5', 'Dodge': '#D61F26',
    'Fiat': '#8E0C3A', 'Ford': '#003478', 'GMC': '#D71920', 'Honda': '#D80027',
    'Hyundai': '#002C5F', 'Infiniti': '#000000', 'Jaguar': '#005A31', 'Jeep': '#FFBA00',
    'Kia': '#BB162B', 'Land Rover': '#005A2C', 'Lexus': '#5A5A5A', 'Lincoln': '#003058',
    'Mazda': '#101010', 'Mercedes-Benz': '#000000', 'Mini': '#000000', 'Mitsubishi': '#E60012',
    'Nissan': '#C3002F', 'Porsche': '#B12B28', 'Ram': '#111111', 'Subaru': '#0047BB',
    'Toyota': '#EB0A1E', 'Volkswagen': '#001E50', 'Volvo': '#003057'
};

function renderMakeGrid() {
    const grid = document.getElementById('makeGrid');
    if (!grid) return; // Element was removed
    if (grid.children.length > 0) return; // Already rendered

    grid.innerHTML = POPULAR_MAKES.map(make => {
        const domain = MAKE_DOMAINS[make] || `${make.toLowerCase().replace(/\s/g, '')}.com`;
        const logoUrl = `https://cdn.brandfetch.io/${domain}/w/256/h/256`; // Brandfetch CDN - sharper logos
        const initials = make.substring(0, 2).toUpperCase();
        const brandColor = BRAND_COLORS[make] || 'var(--brand-primary)';

        return `
                    <div class="make-card" onclick="selectVisualMake('${make}')">
                        <img src="${logoUrl}" alt="${make}" class="make-logo" 
                             style="background: white; padding: 4px; border-radius: 50%; object-fit: contain;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="text-avatar" style="display: none; background: ${brandColor}; color: white; border: 2px solid rgba(255,255,255,0.2);">${initials}</div>
                        <span class="make-name">${make}</span>
                    </div>
                `;
    }).join('');
}

async function selectVisualMake(make) {
    // Hide landing, show selection card
    const hero = document.querySelector('.hero-section');
    const visualSelector = document.getElementById('visualMakeSelector');
    const legacyCard = document.getElementById('legacySearchCard');

    if (hero) hero.style.display = 'none';
    if (visualSelector) visualSelector.style.display = 'none';
    if (legacyCard) legacyCard.style.display = 'block';

    // Set Selected Make UI
    document.getElementById('selectedVehicleDisplay').style.display = 'block';
    document.getElementById('selectedMakeName').textContent = make;

    // Handle Logo & Fallback for Header
    const domain = MAKE_DOMAINS[make] || `${make.toLowerCase().replace(/\s/g, '')}.com`;
    const logoImg = document.getElementById('selectedMakeLogo');
    const logoAvatar = document.getElementById('selectedMakeAvatar');
    const brandColor = BRAND_COLORS[make] || 'var(--brand-primary)';

    logoImg.style.display = 'block';

    logoAvatar.style.display = 'none';
    logoAvatar.style.background = brandColor;
    logoAvatar.style.color = 'white';
    logoAvatar.style.border = '2px solid rgba(255,255,255,0.2)';

    logoImg.style.background = 'white'; // Ensure contrast
    logoImg.style.borderRadius = '50%';
    logoImg.style.padding = '4px';

    logoImg.src = `https://cdn.brandfetch.io/${domain}/w/256/h/256`;
    logoImg.onerror = function () {
        this.style.display = 'none';
        logoAvatar.style.display = 'flex';
        logoAvatar.textContent = make.substring(0, 2).toUpperCase();
    };

    // Set legacy select value
    const mkSelect = document.getElementById('makeSelect');
    if (![...mkSelect.options].some(o => o.value === make)) {
        mkSelect.innerHTML += `<option value="${make}">${make}</option>`;
    }
    mkSelect.value = make;

    // Reset Drill Down State
    document.getElementById('yearChipsContainer').style.display = 'block';
    document.getElementById('modelChipsContainer').style.display = 'none';
    document.getElementById('selectedYearBadge').style.display = 'none';

    // Render Year Chips
    const yearContainer = document.getElementById('yearChips');
    const currentYear = new Date().getFullYear() + 1;
    let html = '';
    for (let y = currentYear; y >= 2000; y--) {
        html += `<button class="inventory-btn" style="padding: 10px 20px; font-weight: 600;" onclick="selectVisualYear('${y}')">${y}</button>`;
    }
    yearContainer.innerHTML = html;
}

function selectVisualYear(year) {
    // Force Update legacy select
    const yrSelect = document.getElementById('yearSelect');
    // Ensure option exists (Fix for broken model loading)
    if (![...yrSelect.options].some(o => o.value == year)) {
        yrSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    yrSelect.value = year;

    // UI Updates
    document.getElementById('yearChipsContainer').style.display = 'none';
    const badge = document.getElementById('selectedYearBadge');
    badge.textContent = year;
    badge.style.display = 'block';

    // Load Models Visually
    console.log("Visual Year Selected:", year, "Triggering loadModels...");
    loadModels();
}


// ==========================================
// GENERATION SELECTOR LOGIC
// ==========================================

const MODEL_GENERATIONS = {
    'Camaro': [
        { label: '1st Gen (1967-1969)', start: 1967, end: 1969, img: 'camaro_1967.png' },
        { label: '2nd Gen (1970-1981)', start: 1970, end: 1981, img: 'camaro_1970.png' },
        { label: '3rd Gen (1982-1992)', start: 1982, end: 1992, img: 'camaro_1982.png' },
        { label: '4th Gen (1993-2002)', start: 1993, end: 2002, img: 'camaro_1993.png' },
        { label: '5th Gen (2010-2015)', start: 2010, end: 2015, img: 'camaro_gen5_tech_card.png' },
        { label: '6th Gen (2016-2024+)', start: 2016, end: 2026, img: 'camaro_gen6_tech_card.png' }
    ],
    // Chevy Trucks & SUVs
    'Silverado': [
        { label: 'Remote Head Era (2007-2013)', start: 2007, end: 2013, img: 'chevrolet_silverado.png' },
        { label: 'K2XX Smart Key (2014-2018)', start: 2014, end: 2018, img: 'chevrolet_silverado_2014_2018.png' },
        { label: 'Global B (2019+)', start: 2019, end: 2026, img: 'chevy_silverado_2024.png' }
    ],
    'Tahoe': [
        { label: 'Remote Head Era (2007-2014)', start: 2007, end: 2014, img: 'chevrolet_tahoe.png' },
        { label: 'K2XX Smart Key (2015-2020)', start: 2015, end: 2020, img: 'chevrolet_tahoe_2015_2020.png' },
        { label: 'Global B (2021+)', start: 2021, end: 2026, img: 'chevrolet_tahoe.png' }
    ],
    'Suburban': [
        { label: 'Remote Head Era (2007-2014)', start: 2007, end: 2014, img: 'chevrolet_suburban.png' },
        { label: 'K2XX Smart Key (2015-2020)', start: 2015, end: 2020, img: 'chevrolet_suburban.png' },
        { label: 'Global B (2021+)', start: 2021, end: 2026, img: 'chevrolet_suburban.png' }
    ],
    // Chevy Sedans & Crossovers
    'Malibu': [
        { label: 'Flip Key Era (2010-2015)', start: 2010, end: 2015, img: 'chevrolet_malibu_2013_2015.png' },
        { label: 'Smart Key Era (2016+)', start: 2016, end: 2026, img: 'chevrolet_malibu.png' }
    ],
    'Cruze': [
        { label: 'Flip Key Era (2011-2015)', start: 2011, end: 2015, img: 'chevrolet_cruze.png' },
        { label: 'Smart Key Era (2016+)', start: 2016, end: 2026, img: 'chevrolet_cruze.png' }
    ],
    'Equinox': [
        { label: 'Flip Key Era (2010-2017)', start: 2010, end: 2017, img: 'chevrolet_equinox_2010_2017.png' },
        { label: 'Smart Key Era (2018+)', start: 2018, end: 2026, img: 'chevrolet_equinox.png' }
    ],
    'Impala': [
        { label: 'Classic Remote Head (2006-2013)', start: 2006, end: 2013, img: 'chevrolet_impala.png' },
        { label: 'New Gen Smart Key (2014+)', start: 2014, end: 2026, img: 'chevrolet_impala.png' }
    ],
    'Traverse': [
        { label: 'Classic Remote Head (2009-2017)', start: 2009, end: 2017, img: 'chevrolet_traverse.png' },
        { label: 'Smart Key Era (2018+)', start: 2018, end: 2026, img: 'chevrolet_traverse.png' }
    ],
    'Mustang': [
        { label: '1st Gen (1964.5-1966)', start: 1965, end: 1966, img: 'mustang_1965.png' },
        { label: '1st Gen (1967-1968)', start: 1967, end: 1968, img: 'mustang_1967.png' },
        { label: '1st Gen (1969-1970)', start: 1969, end: 1970, img: 'mustang_1969.png' },
        { label: '1st Gen (1971-1973)', start: 1971, end: 1973, img: 'mustang_1971.png' },
        { label: '2nd Gen (1974-1978)', start: 1974, end: 1978, img: 'mustang_1974.png' },
        { label: '3rd Gen (Fox) (1979-1986)', start: 1979, end: 1986, img: 'mustang_1979.png' },
        { label: '3rd Gen (Aero) (1987-1993)', start: 1987, end: 1993, img: 'mustang_1987.png' },
        { label: '4th Gen (SN95) (1994-1998)', start: 1994, end: 1998, img: 'mustang_1994.png' },
        { label: '4th Gen (New Edge) (1999-2004)', start: 1999, end: 2004, img: 'mustang_1999.png' },
        { label: '5th Gen (2005-2009)', start: 2005, end: 2009, img: 'mustang_2005.png' },
        { label: '5th Gen (2010-2014)', start: 2010, end: 2014, img: 'mustang_2010.png' },
        { label: '6th Gen (S550) (2015-2023)', start: 2015, end: 2023, img: 'mustang_2015.png' },
        { label: '7th Gen (S650) (2024+)', start: 2024, end: 2025, img: 'mustang_2024.png' }
    ],
    'Challenger': [
        { label: '1st Gen (1970-1974)', start: 1970, end: 1974, img: 'challenger_1970.png' },
        { label: '2nd Gen (1978-1983)', start: 1978, end: 1983, img: 'challenger_1978.png' },
        { label: '3rd Gen (2008-2014)', start: 2008, end: 2014, img: 'challenger_2008.png' },
        { label: '3rd Gen (Facelift) (2015-2023)', start: 2015, end: 2023, img: 'challenger_2015.png' }
    ]
};

function renderGenerationSelector(model) {
    const selectorContainer = document.getElementById('modelChipsContainer'); // Re-use this container for visibility
    const chipGrid = document.getElementById('chipContainer'); // The grid inside

    const generations = MODEL_GENERATIONS[model];

    // Hide filter bar if present
    const filterBar = document.getElementById('modelFilterBar');
    if (filterBar) filterBar.style.display = 'none';

    // Update Header
    const title = document.getElementById('browseTitle'); // Assuming there's a title element or we use another indicator
    // In current UI: <h2 id="makeTitle"></h2>
    const makeTitle = document.getElementById('makeTitle');
    if (makeTitle) makeTitle.innerHTML = `<span style="opacity:0.7">${currentMake}</span> › ${model} <span style="color:var(--brand-primary)">Generations</span>`;

    chipGrid.innerHTML = `
        <div class="generation-selector-grid">
            ${generations.map(gen => `
                <div class="generation-card" onclick="selectGeneration('${model}', ${gen.start}, ${gen.end})">
                    <div class="generation-img-container">
                        <img src="/assets/vehicles/${gen.img}" alt="${gen.label}" class="generation-img">
                    </div>
                    <div class="generation-info">
                        <span class="generation-label">${gen.label}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="width:100%; text-align:center; margin-top:20px;">
            <button class="btn" style="background:var(--bg-secondary); border:1px solid var(--border);" onclick="loadModels(currentMake)">← Back to Models</button>
        </div>
    `;
}

function selectGeneration(model, startYear, endYear) {
    // Select model and start year (as representative)
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        if (![...modelSelect.options].some(o => o.value === model)) {
            const opt = document.createElement('option');
            opt.value = model;
            opt.text = model;
            modelSelect.add(opt);
        }
        modelSelect.value = model;
    }

    // Set year
    // Note: The app relies on "Year" step being active usually.
    // We can "skip" to search directly.
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) yearSelect.value = startYear;

    // Trigger standard search with these parameters
    // We need to ensure global state is set if searchVehicle relies on it
    currentVehicleMake = currentMake;
    currentVehicleModel = model;
    currentVehicleYear = startYear;

    searchVehicle();
}

// Helper to get generation-specific image for Result Page
function getVehicleResultImage(make, model, year) {
    // 1. Check Gen Selector
    if (typeof MODEL_GENERATIONS !== 'undefined' && MODEL_GENERATIONS[model] && year) {
        const gen = MODEL_GENERATIONS[model].find(g => year >= g.start && year <= g.end);
        if (gen) {
            return `/assets/vehicles/${gen.img}`;
        }
    }

    // 2. Fallback to standard clean image
    let cleanMake = make.toLowerCase().trim().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
    let cleanModel = model.toLowerCase().trim().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
    return `/assets/vehicles/${cleanMake}_${cleanModel}.png`;
}

// Key Tech Card Mapping - Maps vehicles to key fob/blade/battery reference images
const KEY_TECH_CARD_MAP = {
    // GM/Chevrolet Platform Mapping by Era
    'Chevrolet': {
        smart: { min: 2016, max: 2099, buttons: { 5: 'gm_global_b_smart_5btn.png', 4: 'gm_global_b_smart_4btn.png', default: 'gm_global_b_smart_5btn.png' } },
        smartLegacy: { min: 2010, max: 2015, buttons: { 5: 'gm_global_a_smart_5btn.png', 4: 'gm_global_a_smart_4btn.png', default: 'gm_global_a_smart_5btn.png' } },
        rhk: { min: 2007, max: 2017, buttons: { 5: 'gm_rhk_5btn_flip.png', 4: 'gm_rhk_4btn_flip.png', default: 'gm_rhk_4btn_flip.png' } },
        classic: { min: 2000, max: 2006, buttons: { 4: 'gm_classic_remote_4btn.png', 3: 'gm_classic_remote_3btn.png', default: 'gm_classic_remote_3btn.png' } },
        fobik: { min: 2010, max: 2015, buttons: { default: 'gm_fobik_4btn.png' } },
        transponder: { min: 1995, max: 2010, buttons: { default: 'gm_transponder_chip.png' } }
    },
    'GMC': {
        smart: { min: 2016, max: 2099, buttons: { 5: 'gm_global_b_smart_5btn.png', 4: 'gm_global_b_smart_4btn.png', default: 'gm_global_b_smart_5btn.png' } },
        smartLegacy: { min: 2010, max: 2015, buttons: { 5: 'gm_global_a_smart_5btn.png', 4: 'gm_global_a_smart_4btn.png', default: 'gm_global_a_smart_5btn.png' } },
        rhk: { min: 2007, max: 2017, buttons: { 5: 'gm_rhk_5btn_flip.png', 4: 'gm_rhk_4btn_flip.png', default: 'gm_rhk_4btn_flip.png' } },
        transponder: { min: 1995, max: 2010, buttons: { default: 'gm_transponder_chip.png' } }
    },
    'Buick': {
        smart: { min: 2016, max: 2099, buttons: { 5: 'gm_global_b_smart_5btn.png', 4: 'gm_global_b_smart_4btn.png', default: 'gm_global_b_smart_5btn.png' } },
        smartLegacy: { min: 2010, max: 2015, buttons: { 5: 'gm_global_a_smart_5btn.png', 4: 'gm_global_a_smart_4btn.png', default: 'gm_global_a_smart_4btn.png' } },
        transponder: { min: 1995, max: 2010, buttons: { default: 'gm_transponder_chip.png' } }
    },
    'Cadillac': {
        smart: { min: 2016, max: 2099, buttons: { 5: 'gm_global_b_smart_5btn.png', 4: 'gm_global_b_smart_4btn.png', default: 'gm_global_b_smart_5btn.png' } },
        smartLegacy: { min: 2010, max: 2015, buttons: { 5: 'gm_global_a_smart_5btn.png', 4: 'gm_global_a_smart_4btn.png', default: 'gm_global_a_smart_5btn.png' } },
        transponder: { min: 1995, max: 2010, buttons: { default: 'gm_transponder_chip.png' } }
    },
    // Ford Platform Mapping
    'Ford': {
        smart: { min: 2015, max: 2099, buttons: { 5: 'ford_smart_5btn.png', 4: 'ford_smart_4btn.png', default: 'ford_smart_5btn.png' } },
        rhk: { min: 2011, max: 2019, buttons: { 5: 'ford_rhk_5btn.png', 4: 'ford_rhk_4btn.png', default: 'ford_rhk_4btn.png' } },
        flip: { min: 2007, max: 2014, buttons: { 4: 'ford_flip_4btn.png', 3: 'ford_flip_3btn.png', default: 'ford_flip_4btn.png' } },
        pats: { min: 1996, max: 2010, buttons: { default: 'ford_pats_transponder.png' } },
        tibbe: { min: 1990, max: 2000, buttons: { default: 'ford_tibbe_transponder.png' } }
    },
    'Lincoln': {
        smart: { min: 2015, max: 2099, buttons: { 5: 'ford_smart_5btn.png', 4: 'ford_smart_4btn.png', default: 'ford_smart_5btn.png' } },
        rhk: { min: 2011, max: 2019, buttons: { 5: 'ford_rhk_5btn.png', 4: 'ford_rhk_4btn.png', default: 'ford_rhk_5btn.png' } },
        pats: { min: 1996, max: 2010, buttons: { default: 'ford_pats_transponder.png' } }
    },
    // Stellantis Platform Mapping
    'Chrysler': {
        smart: { min: 2017, max: 2099, buttons: { 6: 'chrysler_van_remote_6btn.png', 5: 'stellantis_smart_5btn.png', 4: 'stellantis_smart_4btn.png', default: 'stellantis_smart_5btn.png' } },
        fobik: { min: 2008, max: 2020, buttons: { 5: 'stellantis_fobik_5btn.png', 4: 'stellantis_fobik_4btn.png', default: 'stellantis_fobik_4btn.png' } },
        transponder: { min: 1998, max: 2008, buttons: { default: 'stellantis_transponder.png' } }
    },
    'Dodge': {
        smart: { min: 2017, max: 2099, buttons: { 5: 'stellantis_smart_5btn.png', 4: 'stellantis_smart_4btn.png', default: 'stellantis_smart_5btn.png' } },
        fobik: { min: 2008, max: 2020, buttons: { 5: 'stellantis_fobik_5btn.png', 4: 'stellantis_fobik_4btn.png', default: 'stellantis_fobik_4btn.png' } },
        rhk: { min: 2004, max: 2012, buttons: { default: 'dodge_ram_classic_4btn.png' } },
        transponder: { min: 1998, max: 2008, buttons: { default: 'stellantis_transponder.png' } }
    },
    'Jeep': {
        smart: { min: 2018, max: 2099, buttons: { 5: 'jeep_wrangler_smart_5btn.png', 4: 'stellantis_smart_4btn.png', default: 'stellantis_smart_5btn.png' } },
        fobik: { min: 2008, max: 2020, buttons: { 5: 'stellantis_fobik_5btn.png', 4: 'stellantis_fobik_4btn.png', default: 'stellantis_fobik_4btn.png' } },
        rhk: { min: 2007, max: 2018, buttons: { 4: 'jeep_wrangler_rhk_4btn.png', 3: 'jeep_liberty_rhk_3btn.png', default: 'jeep_wrangler_rhk_4btn.png' } },
        transponder: { min: 1998, max: 2008, buttons: { default: 'stellantis_transponder.png' } }
    },
    'Ram': {
        smart: { min: 2019, max: 2099, buttons: { 5: 'stellantis_smart_5btn.png', 4: 'stellantis_smart_4btn.png', default: 'stellantis_smart_5btn.png' } },
        fobik: { min: 2013, max: 2020, buttons: { 5: 'stellantis_fobik_5btn.png', 4: 'stellantis_fobik_4btn.png', default: 'stellantis_fobik_4btn.png' } },
        rhk: { min: 2009, max: 2018, buttons: { default: 'dodge_ram_classic_4btn.png' } },
        transponder: { min: 1998, max: 2012, buttons: { default: 'stellantis_transponder.png' } }
    },
    // Toyota/Lexus Platform Mapping
    'Toyota': {
        smart: { min: 2010, max: 2099, buttons: { 4: 'toyota_smart_4btn.png', 3: 'toyota_smart_3btn.png', default: 'toyota_smart_4btn.png' } },
        rhk: { min: 2005, max: 2018, buttons: { 4: 'toyota_rhk_4btn.png', 3: 'toyota_rhk_3btn.png', default: 'toyota_rhk_4btn.png' } },
        hChip: { min: 2013, max: 2020, buttons: { default: 'toyota_h_chip_transponder.png' } },
        dot: { min: 2003, max: 2012, buttons: { default: 'toyota_dot_chip_transponder.png' } },
        transponder: { min: 1998, max: 2005, buttons: { default: 'toyota_4d67_transponder.png' } }
    },
    'Lexus': {
        smart: { min: 2006, max: 2099, buttons: { 4: 'lexus_smart_4btn.png', 3: 'lexus_smart_3btn.png', default: 'lexus_smart_4btn.png' } },
        transponder: { min: 1998, max: 2010, buttons: { default: 'toyota_4d67_transponder.png' } }
    },
    // Honda/Acura Platform Mapping
    'Honda': {
        smart: { min: 2013, max: 2099, buttons: { 5: 'honda_odyssey_smart_5btn.png', 4: 'honda_smart_4btn.png', 3: 'honda_smart_3btn.png', default: 'honda_smart_4btn.png' } },
        rhk: { min: 2006, max: 2018, buttons: { 4: 'honda_rhk_4btn.png', 3: 'honda_rhk_3btn.png', default: 'honda_rhk_4btn.png' } },
        flip: { min: 2013, max: 2018, buttons: { default: 'honda_flip_3btn.png' } },
        transponder: { min: 1999, max: 2010, buttons: { default: 'honda_transponder.png' } }
    },
    'Acura': {
        smart: { min: 2010, max: 2099, buttons: { 4: 'acura_smart_4btn.png', 3: 'honda_smart_3btn.png', default: 'acura_smart_4btn.png' } },
        rhk: { min: 2005, max: 2015, buttons: { 4: 'honda_rhk_4btn.png', 3: 'honda_rhk_3btn.png', default: 'honda_rhk_4btn.png' } },
        transponder: { min: 1999, max: 2010, buttons: { default: 'honda_transponder.png' } }
    },
    // Nissan/Infiniti Platform Mapping
    'Nissan': {
        smart: { min: 2007, max: 2099, buttons: { 4: 'nissan_smart_4btn.png', 3: 'nissan_smart_3btn.png', default: 'nissan_smart_4btn.png' } },
        rhk: { min: 2005, max: 2016, buttons: { 4: 'nissan_rhk_4btn.png', 3: 'nissan_rhk_3btn.png', default: 'nissan_rhk_4btn.png' } },
        flip: { min: 2007, max: 2018, buttons: { default: 'nissan_flip_4btn.png' } },
        transponder: { min: 2000, max: 2010, buttons: { default: 'nissan_transponder.png' } }
    },
    'Infiniti': {
        smart: { min: 2006, max: 2099, buttons: { 4: 'infiniti_smart_4btn.png', 3: 'nissan_smart_3btn.png', default: 'infiniti_smart_4btn.png' } },
        rhk: { min: 2005, max: 2016, buttons: { 4: 'nissan_rhk_4btn.png', 3: 'nissan_rhk_3btn.png', default: 'nissan_rhk_4btn.png' } },
        transponder: { min: 2000, max: 2008, buttons: { default: 'nissan_transponder.png' } }
    },
    // Hyundai/Kia/Genesis Platform Mapping
    'Hyundai': {
        smart: { min: 2012, max: 2099, buttons: { 4: 'hyundai_smart_4btn.png', 3: 'hyundai_smart_3btn.png', default: 'hyundai_smart_4btn.png' } },
        flip: { min: 2010, max: 2020, buttons: { default: 'hyundai_flip_4btn.png' } },
        transponder: { min: 2005, max: 2012, buttons: { default: 'hyundai_transponder.png' } }
    },
    'Kia': {
        smart: { min: 2012, max: 2099, buttons: { 4: 'kia_smart_4btn.png', 3: 'kia_smart_3btn.png', default: 'kia_smart_4btn.png' } },
        flip: { min: 2010, max: 2020, buttons: { default: 'kia_flip_4btn.png' } },
        transponder: { min: 2005, max: 2012, buttons: { default: 'hyundai_transponder.png' } }
    },
    'Genesis': {
        smart: { min: 2017, max: 2099, buttons: { 4: 'genesis_smart_4btn.png', default: 'genesis_smart_4btn.png' } },
        transponder: { min: 2015, max: 2017, buttons: { default: 'hyundai_transponder.png' } }
    },
    // German Luxury Platform Mapping
    'BMW': {
        smart: { min: 2014, max: 2099, buttons: { default: 'bmw_diamond_key.png' } },
        comfort: { min: 2007, max: 2018, buttons: { default: 'bmw_comfort_access.png' } },
        rhk: { min: 2004, max: 2013, buttons: { default: 'bmw_smart_4btn.png' } }
    },
    'Mercedes-Benz': {
        smart: { min: 2019, max: 2099, buttons: { default: 'mercedes_chrome_key.png' } },
        smartLegacy: { min: 2008, max: 2018, buttons: { default: 'mercedes_smart_3btn.png' } }
    },
    'Audi': {
        smart: { min: 2016, max: 2099, buttons: { default: 'audi_smart_3btn.png' } },
        flip: { min: 2006, max: 2018, buttons: { default: 'audi_flip_3btn.png' } }
    },
    'Volkswagen': {
        smart: { min: 2019, max: 2099, buttons: { default: 'vw_smart_3btn.png' } },
        flip: { min: 2006, max: 2018, buttons: { default: 'audi_flip_3btn.png' } }
    }
};

// Get Key Tech Card Image based on make, year, and key type
function getKeyTechCardImage(make, year, keyType, buttonCount) {
    const yearNum = parseInt(year) || 2020;
    const buttons = parseInt(buttonCount) || 4;

    // Normalize make
    const normalizedMake = make?.trim() || '';
    const makeConfig = KEY_TECH_CARD_MAP[normalizedMake];

    if (!makeConfig) return null;

    // Determine key category from keyType string
    let category = 'smart'; // Default to smart key
    const keyTypeLower = (keyType || '').toLowerCase();

    if (keyTypeLower.includes('transponder') || keyTypeLower.includes('chip only')) {
        category = 'transponder';
    } else if (keyTypeLower.includes('fobik') || keyTypeLower.includes('fob-ik')) {
        category = 'fobik';
    } else if (keyTypeLower.includes('flip') || keyTypeLower.includes('switchblade')) {
        category = 'flip';
    } else if (keyTypeLower.includes('remote head') || keyTypeLower.includes('rhk')) {
        category = 'rhk';
    } else if (keyTypeLower.includes('smart') || keyTypeLower.includes('prox') || keyTypeLower.includes('proximity')) {
        // Check era for smart keys
        if (normalizedMake === 'Chevrolet' || normalizedMake === 'GMC' || normalizedMake === 'Buick' || normalizedMake === 'Cadillac') {
            category = yearNum >= 2016 ? 'smart' : 'smartLegacy';
        } else if (normalizedMake === 'Mercedes-Benz') {
            category = yearNum >= 2019 ? 'smart' : 'smartLegacy';
        } else if (normalizedMake === 'BMW') {
            category = yearNum >= 2014 ? 'smart' : (yearNum >= 2007 ? 'comfort' : 'rhk');
        } else {
            category = 'smart';
        }
    } else if (keyTypeLower.includes('comfort access')) {
        category = 'comfort';
    } else if (keyTypeLower.includes('h-chip') || keyTypeLower.includes('h chip')) {
        category = 'hChip';
    } else if (keyTypeLower.includes('dot') || keyTypeLower.includes('4d67')) {
        category = 'dot';
    } else if (keyTypeLower.includes('pats')) {
        category = 'pats';
    } else if (keyTypeLower.includes('tibbe')) {
        category = 'tibbe';
    }

    // Find matching config by year
    const categoryConfig = makeConfig[category];
    if (!categoryConfig) {
        // Fallback to smart if category not found
        const fallbackConfig = makeConfig.smart || makeConfig[Object.keys(makeConfig)[0]];
        if (!fallbackConfig) return null;
        const img = fallbackConfig.buttons?.[buttons] || fallbackConfig.buttons?.default;
        return img ? `/assets/vehicles/${img}` : null;
    }

    // Check if year is in range
    if (yearNum >= categoryConfig.min && yearNum <= categoryConfig.max) {
        const img = categoryConfig.buttons?.[buttons] || categoryConfig.buttons?.default;
        return img ? `/assets/vehicles/${img}` : null;
    }

    // If not in range, try to find best match
    for (const [cat, config] of Object.entries(makeConfig)) {
        if (yearNum >= config.min && yearNum <= config.max) {
            const img = config.buttons?.[buttons] || config.buttons?.default;
            return img ? `/assets/vehicles/${img}` : null;
        }
    }

    return null;
}

function selectVisualModel(model) {
    // FIX: If year is already selected, skip generation selector and go to results
    if (currentVehicleYear || (document.getElementById('yearSelect') && document.getElementById('yearSelect').value)) {
        const modelSelect = document.getElementById('modelSelect');
        if (![...modelSelect.options].some(o => o.value === model)) {
            modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
        }
        modelSelect.value = model;
        modelSelect.disabled = false;
        searchVehicle();
        return;
    }

    // Check for Generational Flow
    if (MODEL_GENERATIONS[model]) {
        renderGenerationSelector(model);
        return;
    }

    // Standard Logic
    const modelSelect = document.getElementById('modelSelect');
    if (![...modelSelect.options].some(o => o.value === model)) {
        modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
    }
    modelSelect.value = model;
    modelSelect.disabled = false;

    // Trigger Search (Standard flow usually goes to Year step, but this function implies immediate selection)
    // Looking at original code: it called searchVehicle(), implying year was already selected or it defaults?
    // Wait, original code usage: onclick="selectVisualModel('${m.name}')"
    // Usually user selects Make -> Year -> Model. 
    // If Year is already selected (from previous step), then `searchVehicle` works.
    // If Year is NOT selected (e.g. browsing by Make first), `searchVehicle` might fail or alert.
    // Original code:
    // document.getElementById('yearChipsContainer').style.display = 'none'; ... -> loadModels()
    // It seems this function is called AFTER Year selection? 
    // Line 137: console.log("Visual Year Selected:", year, "Triggering loadModels...");
    // So `loadModels` is called after year is picked. So `year` is known.

    searchVehicle();
}

function resetBrowse() {
    document.querySelector('.hero-section').style.display = 'block';
    document.getElementById('visualMakeSelector').style.display = 'block';
    document.getElementById('legacySearchCard').style.display = 'none';
    document.getElementById('results').innerHTML = '';

    // Also hide and clear results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.remove('active');
    }
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }

    // Hide quick dropdown if visible
    const quickDropdown = document.getElementById('quickMakeDropdown');
    if (quickDropdown) quickDropdown.style.display = 'none';

    // Reset selects
    document.getElementById('yearSelect').value = '';
    document.getElementById('makeSelect').value = '';
    document.getElementById('modelSelect').innerHTML = '<option value="">Select Model</option>';
    document.getElementById('modelSelect').disabled = true;
}

function showMakeDropdown() {
    const dropdown = document.getElementById('quickMakeDropdown');
    if (dropdown.style.display === 'none') {
        // Populate with all makes
        dropdown.innerHTML = '<option value="">Select Make...</option>';
        POPULAR_MAKES.forEach(make => {
            dropdown.innerHTML += `<option value="${make}">${make}</option>`;
        });
        dropdown.style.display = 'inline-block';
    } else {
        dropdown.style.display = 'none';
    }
}

function quickChangeMake(make) {
    if (!make) return;
    const dropdown = document.getElementById('quickMakeDropdown');
    dropdown.style.display = 'none';

    // Clear old results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';

    // Change to the new make
    selectVisualMake(make);
}

function handleOmniSearch(e) {
    // Live filtering (on keyup/input)
    const query = e.target.value.trim();
    const lowerQuery = query.toLowerCase();
    const cards = document.querySelectorAll('.make-card');

    // 1. Filter brands visually
    cards.forEach(card => {
        const name = card.querySelector('.make-name').textContent.toLowerCase();
        card.style.display = name.includes(lowerQuery) ? 'flex' : 'none';
    });

    // 2. Handle Enter key for "Universal Search" (VIN or Smart Search)
    if (e.key === 'Enter' && query.length >= 3) {
        // Determine if it's a VIN (17 alphanumeric)
        const vinClean = query.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
        if (vinClean.length === 17) {
            decodeVin(vinClean);
            return;
        }

        // Smart Search: Check if first word is a known Make
        let foundMake = null;
        cards.forEach(card => {
            const name = card.querySelector('.make-name').textContent.toLowerCase();
            // Match full word make only to avoid "Fo" matching "Ford" and "Force" etc improperly
            if (lowerQuery === name || lowerQuery.startsWith(name + ' ')) {
                foundMake = card.querySelector('.make-name').textContent;
            }
        });

        if (foundMake) {
            selectVisualMake(foundMake);
            // Parse rest of query for year/model? 
            // Future enhancement: automatically select year/model if provided
        } else {
            // No make matched - perform FCC database search (same as header search)
            showTab('fcc');
            document.getElementById('fccSearch').value = query;
            if (fccDataLoaded) {
                renderFccTable();
            } else {
                loadFccData();
            }
        }
    }
}

// ================== EXISTING LOGIC MODIFIED ==================

function populateYears() {
    const select = document.getElementById('yearSelect');
    const year = new Date().getFullYear() + 1;
    for (let y = year; y >= 2000; y--) {
        select.innerHTML += `<option value="${y}">${y}</option>`;
    }
}

async function loadMakes() {
    // Legacy loadMakes (triggered by Year dropdown in legacy card)
    const year = document.getElementById('yearSelect').value;
    const select = document.getElementById('makeSelect');

    if (!year) {
        select.innerHTML = '<option value="">Select Make</option>';
        return;
    }

    // Check Cache
    const cacheKey = `makes_${year}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            // Cache valid for 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                console.log('Using cached makes for', year);
                renderMakes(data, select);
                return;
            }
        } catch (e) { localStorage.removeItem(cacheKey); }
    }

    select.innerHTML = '<option value="">Loading...</option>';
    try {
        // Optimized: only fetch 'make' field
        const res = await fetch(`${API}/api/master?year=${year}&fields=make&limit=2000`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const makes = [...new Set(data.rows.map(r => r.make))]
            .filter(isValidMake)
            .sort();

        // Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify({ data: makes, timestamp: Date.now() }));

        renderMakes(makes, select);
    } catch (e) {
        console.error('Failed to load makes:', e);
        select.innerHTML = '<option value="">Select Make</option>';
    }
}

function renderMakes(makes, select) {
    select.innerHTML = '<option value="">Select Make</option>';
    makes.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
    });
}

// Check if model name looks like a product description rather than a vehicle model
function isValidModelName(model) {
    if (!model) return false;
    const badPatterns = [
        /keyless entry/i, /remote key/i, /key fob/i, /flip key/i,
        /smart key/i, /transponder/i, /key blank/i, /mechanical key/i,
        /\d+b\s*w/i,  // "5B w" truncated entries
        /\d+ button/i, /peps/i, /fobik/i, /80 bit/i, /high security/i,
        /proximity/i, /smart remote/i
    ];
    return !badPatterns.some(p => p.test(model));
}

async function loadModels() {
    const year = document.getElementById('yearSelect').value;
    const make = document.getElementById('makeSelect').value;

    // Visual elements
    const chipContainer = document.getElementById('modelChips');
    const containerWrapper = document.getElementById('modelChipsContainer');
    const loader = document.getElementById('modelLoading');
    const filterBar = document.getElementById('modelFilterBar');

    if (!make) return;

    // Show container if it exists
    if (containerWrapper) {
        containerWrapper.style.display = 'block';
        if (chipContainer) chipContainer.innerHTML = '';
        if (filterBar) filterBar.style.display = 'none';
        if (loader) {
            loader.style.display = 'block';
            loader.innerHTML = 'Loading models... <small>(Checking database)</small>';
        }
    }

    // Check Cache
    const cacheKey = `models_v3_${make}_${year}`; // Updated cache key to v3 to invalidate stale lists
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            // Cache valid for 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                console.log('Using cached models for', make, year);
                currentModelsData = data;
                renderModels(data, chipContainer, loader);
                return;
            }
        } catch (e) { localStorage.removeItem(cacheKey); }
    }

    const fetchUrl = `${API}/api/master?year=${year}&make=${encodeURIComponent(make)}&fields=model,key_type,key_type_display&limit=1000`;
    try {
        // Fetch data
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Process unique models with key type info
        const processed = [];
        const seen = new Set();

        (data.rows || []).forEach(r => {
            let name = (r.model || '').trim();
            if (!name || !isValidModelName(name)) return;

            // Clean up suffixes to merge duplicates (e.g., "Trax Remote" -> "Trax")
            // This regex removes " Remote", " Key", " Fob", " Smart Key" from the end, case-insensitive
            name = name.replace(/\s+(remote|key|fob|smart key|model)\s*$/i, '').trim();

            const lowerName = name.toLowerCase();
            const keyType = (r.key_type || r.key_type_display || '').toLowerCase();
            const isProx = keyType.includes('prox') || keyType.includes('smart');

            // If we've already seen this normalized model name, we might simply update its type status
            // instead of adding a new entry unless we want to split by type visually.
            // Current logic implies one chip per model name.

            // Check if we already have this model in our processed list
            const existingIndex = processed.findIndex(p => p.name.toLowerCase() === lowerName);

            if (existingIndex > -1) {
                // If existing was keyed and this is prox (or vice versa), mark as mixed/varies
                const existing = processed[existingIndex];
                if (existing.type !== 'varies') {
                    if ((existing.type === 'prox' && !isProx) || (existing.type === 'keyed' && isProx)) {
                        existing.type = 'varies';
                    }
                }
            } else {
                processed.push({
                    name: name,
                    type: isProx ? 'prox' : 'keyed',
                    // Store original to help with debugging if needed, but display cleaned name
                    originalName: r.model
                });
            }
        });


        // Sort by name
        processed.sort((a, b) => a.name.localeCompare(b.name));

        // Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify({ data: processed, timestamp: Date.now() }));
        currentModelsData = processed;

        renderModels(processed, chipContainer, loader);

    } catch (e) {
        console.error("Failed to load models", e);
        if (loader) {
            loader.innerHTML = `
                        <div style="color: #ff6b6b; padding: 10px; border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; background: rgba(255,107,107,0.05);">
                            <strong>Error loading models.</strong><br>
                            <span style="font-size:0.8rem; opacity:0.8;">The database connection may be slow or timed out.</span><br>
                            <br>
                            <button onclick="selectVisualYear('${year}')" class="inventory-btn" style="padding: 5px 12px; font-size: 0.8rem;">Retry Connection</button>
                        </div>
                    `;
        }
    }
}

function filterModels(type) {
    currentModelFilter = type;

    // Update filter buttons
    const buttons = document.querySelectorAll('.model-filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(type) || (type === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const chipContainer = document.getElementById('modelChips');
    const loader = document.getElementById('modelLoading');

    let filtered = currentModelsData;
    if (type !== 'all') {
        filtered = currentModelsData.filter(m => m.type === type);
    }

    renderModels(filtered, chipContainer, loader, true);
}

function renderModels(models, chipContainer, loader, isFiltering = false) {
    // Get the current make from the page state (FIXED: use #selectedMakeName instead of non-existent .make-title)
    const currentMake = document.getElementById('selectedMakeName')?.textContent?.trim() ||
        document.getElementById('makeSelect')?.value || '';

    // Generate vehicle image URL from local assets
    const getVehicleImageUrl = (make, model) => {
        let cleanMake = make.toLowerCase().trim().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        let cleanModel = model.toLowerCase().trim();

        // Manual mapping for Makes (Match generated filenames)
        if (cleanMake === 'mercedes_benz') cleanMake = 'mercedes';
        if (cleanMake === 'volkswagen') cleanMake = 'vw';
        if (cleanMake === 'land_rover') cleanMake = 'landrover';

        // Manual mapping for specific models to match generated filenames
        const modelMap = {
            'silverado 1500': 'silverado',
            'silverado': 'silverado',
            'sierra 1500': 'sierra',
            'sierra': 'sierra',
            'ram 1500': 'ram_1500',
            'ram 2500': 'ram_2500',
            'f-150': 'f150',
            'f150': 'f150',
            'cr-v': 'crv',
            'cx-5': 'cx5',
            'cx-9': 'cx9',
            'cx-30': 'cx30',
            'rav4': 'rav4',
            '4runner': '4runner',
            'bronco sport': 'bronco_sport',
            'accord': 'accord',
            'civic': 'civic',
            'camry': 'camry',
            'corolla': 'corolla',
            'altima': 'altima',
            'rogue': 'rogue',
            'tucson': 'tucson',
            'elantra': 'elantra',
            'sportage': 'sportage',
            'sorento': 'sorento',
            'jetta': 'jetta',
            'tiguan': 'tiguan',
            '3-series': '3series',
            'c-class': 'cclass',
            // Batch 18-20 Mappings
            'land cruiser': 'landcruiser',
            'corolla cross': 'corollacross',
            'model 3': 'model3',
            'model y': 'modely',
            'model s': 'models',
            'model x': 'modelx',
            'range rover': 'rangerover',
            'range rover sport': 'rangeroversport',
            'f-pace': 'fpace',
            'f-type': 'ftype'
        };

        if (modelMap[cleanModel]) {
            cleanModel = modelMap[cleanModel];
        } else {
            cleanModel = cleanModel.replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
        }

        return `/assets/vehicles/${cleanMake}_${cleanModel}.png`;
    };

    // Populate Visual Grid
    if (chipContainer && loader) {
        loader.style.display = 'none';

        const filterBar = document.getElementById('modelFilterBar');
        if (filterBar && currentModelsData.length > 5) {
            filterBar.style.display = 'flex';
        }

        if (models.length === 0) {
            chipContainer.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
                            No models found for this category.<br>
                            <small>Try selecting "All" or a different category.</small>
                        </div>`;
        } else {
            const imageUrl = (model) => getVehicleImageUrl(currentMake, model);

            chipContainer.innerHTML = models.map(m => {
                let imagesHtml = '';

                // Check for generational images
                if (typeof MODEL_GENERATIONS !== 'undefined' && MODEL_GENERATIONS[m.name]) {
                    const gens = MODEL_GENERATIONS[m.name];
                    // Create multiple img tags
                    // The first one is active by default
                    imagesHtml = gens.map((g, idx) => `
                        <img src="/assets/vehicles/generations/${g.img}" 
                             alt="${m.name} ${g.label}" 
                             class="model-img gen-img ${idx === 0 ? 'active' : ''}"
                             data-idx="${idx}"
                             onerror="this.style.display='none';">
                    `).join('');
                } else {
                    // Standard single image
                    imagesHtml = `
                        <img src="${imageUrl(m.name)}" alt="${m.name}" 
                             class="model-img"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span class="model-img-fallback">${m.name}</span>
                    `;
                }

                return `
                    <div class="model-chip visual-model-chip ${MODEL_GENERATIONS && MODEL_GENERATIONS[m.name] ? 'has-generations' : ''}" onclick="selectVisualModel('${m.name}')">
                        <div class="model-image-wrapper">
                            ${imagesHtml}
                        </div>
                        <span class="model-name">${m.name}</span>
                    </div>
                `;
            }).join('');

            // Start the cycler if not already running
            startModelImageCycler();
        }
    }

    // Populate Legacy Select (only if not filtering, as it needs all options)
    if (!isFiltering) {
        const select = document.getElementById('modelSelect');
        if (select) {
            select.disabled = false;
            select.innerHTML = '<option value="">Select Model</option>';
            // Use simple list for the hidden select
            const uniqueNames = [...new Set(models.map(m => m.name))].sort();
            uniqueNames.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });
        }
    }
}

let imageCyclerInterval = null;

function startModelImageCycler() {
    if (imageCyclerInterval) clearInterval(imageCyclerInterval);

    imageCyclerInterval = setInterval(() => {
        const chips = document.querySelectorAll('.visual-model-chip.has-generations');
        chips.forEach(chip => {
            const images = chip.querySelectorAll('.gen-img');
            if (images.length > 1) {
                // Find current active
                let activeIdx = -1;
                images.forEach((img, idx) => {
                    if (img.classList.contains('active')) activeIdx = idx;
                    img.classList.remove('active');
                });

                // Next index
                let nextIdx = (activeIdx + 1) % images.length;
                images[nextIdx].classList.add('active');
            }
        });
    }, 2500); // Cycle every 2.5 seconds
}




// Helper functions for displayResults
function getAmazonLink(term) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${AFFILIATE_TAG}`;
}

function getKeyTypeIcon(type) {
    const lower = (type || '').toLowerCase();
    if (lower.includes('smart') || lower.includes('prox')) return '📡';
    if (lower.includes('flip')) return '🔑';
    if (lower.includes('remote') || lower.includes('fob')) return '🎛️';
    if (lower.includes('transponder')) return '🏷️';
    return '🔑';
}

function getMakeLogo(make) {
    // Simple mapping or return null to hide
    // In a real app, this might point to /assets/logos/...
    return null;
}

// ========== COMPATIBLE KEYS CAROUSEL ==========
// Global cache for compatible keys by vehicle
const compatibleKeysCache = {};

async function fetchCompatibleKeys(make, model, year) {
    const cacheKey = `${make}|${model}|${year}`;
    if (compatibleKeysCache[cacheKey]) {
        return compatibleKeysCache[cacheKey];
    }

    try {
        console.time('FetchCompatibleKeys');
        const url = `${API}/api/vehicle-keys?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
        const res = await fetch(url);
        const data = await res.json();
        console.timeEnd('FetchCompatibleKeys');
        if (data.keys && data.keys.length > 0) {
            compatibleKeysCache[cacheKey] = data.keys;
            return data.keys;
        }
    } catch (e) {
        console.log('Failed to fetch compatible keys:', e);
    }
    return [];
}

function categorizeKeyType(key) {
    // Smart/Prox: has FCC ID and buttons
    if (key.fcc_id && key.product_title?.toLowerCase().includes('smart')) return 'smart';
    if (key.fcc_id && (key.product_title?.toLowerCase().includes('remote head') || key.product_title?.toLowerCase().includes('rhk'))) return 'remote';
    // Transponder: has chip, no FCC or remote-style
    if (key.chip && !key.fcc_id) return 'transponder';
    if (key.chip && key.fcc_id) return 'smart';
    // Mechanical: shell or blank
    if (key.product_title?.toLowerCase().includes('shell') || key.product_title?.toLowerCase().includes('blank')) return 'mechanical';
    return 'key';
}

function getKeyIcon(type) {
    switch (type) {
        case 'smart': return '📡';
        case 'remote': return '🎛️';
        case 'transponder': return '🏷️';
        case 'mechanical': return '🗝️';
        case 'fobik': return '📡';
        case 'flip': return '🔄';
        case 'rhk': return '🔑';
        case 'blade': return '🗡️';
        default: return '🔑';
    }
}

// Clean product title for display - remove vendor names, conditions, noise
function cleanProductTitle(title) {
    if (!title) return 'Key';
    return title
        // Remove vendor/brand tags
        .replace(/\(BlueRocket\)/gi, '')
        .replace(/\(STRATTEC\)/gi, '')
        .replace(/\(ILCO\)/gi, '')
        .replace(/\(JMA[^)]*\)/gi, '')
        .replace(/\(BRK\)/gi, '')
        // Remove condition descriptors
        .replace(/—?OEM\s*(REFURB|NEW)?\s*(GREAT|MINT|NO LOGO|PRE-?OWNED)?/gi, '')
        .replace(/—?Aftermarket/gi, '')
        // Remove trailing dashes and clean up
        .replace(/\s*—\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Clean FCC ID - get first one if multiple
function cleanFccId(fccId) {
    if (!fccId) return null;
    // Handle newline-separated FCC IDs
    const firstId = fccId.split('\n')[0].split(' ')[0].trim();
    return firstId || null;
}

// Track expanded carousel state
const carouselExpanded = {};

function renderKeyCarousel(keys, cardIndex, selectedIdx = 0) {
    if (!keys || keys.length === 0) return '';

    // Sort keys by button count ASC (Base -> High Spec) to show evolution
    // Map with original index to preserve selection logic
    const keysWithIndices = keys.map((k, i) => ({ ...k, idx: i }));
    keysWithIndices.sort((a, b) => (a.button_count || 0) - (b.button_count || 0));

    // Helper for feature badges
    const getFeaturesBadge = (k) => {
        const feats = k.features || [];
        const labels = [];
        if (feats.includes('rs')) labels.push('Remote Start');
        if (feats.includes('trunk')) labels.push('Trunk');
        if (feats.includes('hatch')) labels.push('Hatch');
        if (feats.includes('tailgate')) labels.push('Tailgate');
        if (feats.includes('panic')) labels.push('Panic');

        if (labels.length === 0 && k.button_count <= 3) return '<span style="color:var(--text-muted); font-size:0.75rem;">Base Config</span>';

        // Return badges (max 2 to avoid clutter)
        return labels.slice(0, 2).map(l => `<span style="background:rgba(34,197,94,0.1); color:#22c55e; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-right:4px; display:inline-block; margin-bottom:2px;">+${l}</span>`).join('');
    };

    let flowHtml = '';
    keysWithIndices.forEach((k, i) => {
        const isSelected = (typeof selectedIdx !== 'undefined') ? (k.idx === selectedIdx) : (i === 0);

        // Visual arrow for progression
        if (i > 0) {
            flowHtml += `<div style="color:var(--text-muted); font-size:1.2rem; opacity:0.5;">➝</div>`;
        }

        const icon = getKeyIcon(k.key_type || 'key');
        const featureBadges = getFeaturesBadge(k);
        const btnLabel = k.button_count ? `${k.button_count}-Btn` : 'Key';
        const isSmart = (k.key_type || '').toLowerCase().includes('smart') || (k.key_type || '').toLowerCase().includes('prox');

        flowHtml += `
            <div class="key-thumb ${isSelected ? 'active' : ''}" 
                 onclick="selectKey(${cardIndex}, ${k.idx})"
                 style="
                    background: ${isSelected ? 'rgba(59,130,246,0.1)' : 'var(--bg-tertiary)'}; 
                    border: 1px solid ${isSelected ? '#3b82f6' : 'var(--border)'};
                    border-radius: 8px;
                    padding: 10px;
                    cursor: pointer;
                    min-width: 130px;
                    text-align: center;
                    transition: all 0.2s;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                 "
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='var(--brand-primary)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='${isSelected ? '#3b82f6' : 'var(--border)'}'">
                 
                 <div style="font-size:1.8rem; margin-bottom:6px;">${icon}</div>
                 <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px; font-size:0.9rem;">${btnLabel}</div>
                 <div style="margin-bottom:6px; min-height:20px;">${featureBadges}</div>
                 ${isSmart ? '<div style="font-size:0.65rem; color:var(--text-muted); border-top:1px solid var(--border); width:100%; padding-top:4px; margin-top:2px;">+ Emergency Blade</div>' : ''}
            </div>
        `;
    });

    return `<div class="key-carousel" id="keyCarousel-${cardIndex}" style="overflow:hidden;">
                <div class="key-carousel-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>🔐 AVAILABLE VARIATIONS (BASE ➝ PREMIUM)</span>
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">Select a variant to view specifics</span>
                </div>
                <div class="key-tree-container" style="overflow-x:auto; padding-bottom:12px;">
                    <div style="display:flex; gap:12px; align-items:center; min-width:max-content; padding: 4px;">
                        ${flowHtml}
                    </div>
                </div>
            </div>`;
}

function expandCarousel(cardIndex) {
    carouselExpanded[cardIndex] = true;
    const container = document.getElementById(`keyCarouselContainer-${cardIndex}`);
    const keys = cardKeysData[cardIndex];
    if (container && keys) {
        container.innerHTML = renderKeyCarousel(keys, cardIndex, 0);
    }
}

function collapseCarousel(cardIndex) {
    carouselExpanded[cardIndex] = false;
    const container = document.getElementById(`keyCarouselContainer-${cardIndex}`);
    const keys = cardKeysData[cardIndex];
    if (container && keys) {
        container.innerHTML = renderKeyCarousel(keys, cardIndex, 0);
    }
}

// Global storage for keys data per card
const cardKeysData = {};

function selectKey(cardIndex, keyIndex) {
    const keys = cardKeysData[cardIndex];
    if (!keys || !keys[keyIndex]) return;

    const key = keys[keyIndex];

    // Update active state on thumbnails
    const carousel = document.getElementById(`keyCarousel-${cardIndex}`);
    if (carousel) {
        carousel.querySelectorAll('.key-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === keyIndex);
        });
    }

    // Update card specs dynamically
    const specsContainer = document.getElementById(`keySpecs-${cardIndex}`);
    if (specsContainer) {
        specsContainer.style.display = 'block';

        // Get defaults from dataset
        const ds = specsContainer.dataset;
        const year = ds.year;
        const make = ds.make;
        const model = ds.model;

        // Resolve values (Key specific -> Vehicle Default -> N/A)
        const cleanTitle = cleanProductTitle(key.product_title);
        const fccId = cleanFccId(key.fcc_id) || cleanFccId(key.oem_part) || null; // Use key specific
        const chip = key.chip || ds.chip;
        const keyway = key.keyway || ds.defaultKeyway; // Assuming key object might have keyway, else default
        const battery = key.battery || ds.defaultBattery;

        // Amazon Tag
        const amazonTag = 'eurokeys-20';

        // Cutting Info
        const codeSeries = ds.codeSeries;
        const lishi = ds.lishi;
        const ignition = ds.ignition;



        // Generate Targeted Amazon Query
        let amazonQuery = `${year} ${make} ${model} key fob`;
        if (key.button_count) amazonQuery += ` ${key.button_count} button`;

        const feats = key.features || [];
        if (feats.includes('rs')) amazonQuery += ` remote start`;
        if (feats.includes('tailgate')) amazonQuery += ` tailgate`;
        if (feats.includes('hatch')) amazonQuery += ` hatch`;
        if (feats.includes('trunk')) amazonQuery += ` trunk`;

        // Append FCC if meaningful
        if (fccId) amazonQuery += ` ${fccId} `;

        specsContainer.innerHTML = `
            <div style="padding: 16px;">
                <div style="margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${cleanTitle}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                        ${fccId ? `FCC: <span style="color:var(--accent); font-family:monospace;">${fccId}</span>` : ''} 
                    </div>
                </div>

                <!-- Three Column Grid for Parts -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
                    <!-- 1. Key/Remote -->
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(amazonQuery)}&tag=${amazonTag}" target="_blank" 
                       onclick="logActivity('affiliate_click', { type: 'carousel_key', term: '${amazonQuery}', fcc_id: '${fccId || ''}' })"
                       style="display: flex; flex-direction: column; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; text-decoration: none; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='var(--brand-primary)'; this.style.background='rgba(59,130,246,0.1)'"
                       onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 1.2rem;">🔑</span>
                            <span style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">Key / Remote</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--accent); margin-bottom: 4px;">${fccId || 'View Choices'}</div>
                        <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                    </a>

                    <!-- 2. Blade/Blank -->
                    ${keyway !== 'N/A' ? `
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${keyway} key blank`)}&tag=${amazonTag}" target="_blank" 
                       onclick="logActivity('affiliate_click', { type: 'carousel_blade', term: '${keyway} key blank', keyway: '${keyway}' })"
                       style="display: flex; flex-direction: column; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; text-decoration: none; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='var(--brand-primary)'; this.style.background='rgba(59,130,246,0.1)'"
                       onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 1.2rem;">🗝️</span>
                            <span style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">Blade / Blank</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--accent); margin-bottom: 4px;">${keyway}</div>
                        ${lishi !== 'N/A' ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px;">Lishi: ${lishi}</div>` : ''}
                        <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                    </a>` : ''}

                    <!-- 3. Battery -->
                    ${battery !== 'N/A' ? `
                    <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${battery} battery`)}&tag=${amazonTag}" target="_blank" 
                       onclick="logActivity('affiliate_click', { type: 'carousel_battery', term: '${battery} battery', battery: '${battery}' })"
                       style="display: flex; flex-direction: column; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; text-decoration: none; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='var(--brand-primary)'; this.style.background='rgba(59,130,246,0.1)'"
                       onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 1.2rem;">🔋</span>
                            <span style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">Battery</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--accent); margin-bottom: 4px;">${battery}</div>
                        <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                    </a>` : ''}
                </div>

                <!--Technical Specs(Condensed)-- >
            ${(codeSeries !== 'N/A' || ignition !== 'N/A') ? `
                <div style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 8px 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-wrap: wrap; gap: 16px; font-size: 0.8rem; color: var(--text-secondary);">
                    ${codeSeries !== 'N/A' ? `<span><strong>Code Series:</strong> <span style="font-family:monospace; color:var(--text-primary);">${codeSeries}</span></span>` : ''}
                    ${ignition !== 'N/A' ? `<span><strong>Ignition:</strong> <span style="color:var(--text-primary);">${ignition}</span></span>` : ''}
                </div>` : ''
            }
            </div>
            `;
    }

    // Update Amazon button
    const amazonBtn = document.getElementById(`amazonBtn - ${cardIndex} `);
    if (amazonBtn && key.amazon_search_url) {
        amazonBtn.href = key.amazon_search_url;
    }

    // Update AKS link
    const aksBtn = document.getElementById(`aksBtn - ${cardIndex} `);
    if (aksBtn && key.url) {
        aksBtn.href = key.url;
        aksBtn.style.display = 'inline-block';
    }
}

// Global state for year navigation
let currentVehicleYear = null;
let currentVehicleMake = null;
let currentVehicleModel = null;

// Refresh vehicle page (forces reload with cache bust)
window.refreshVehiclePage = function () {
    const year = currentVehicleYear;
    const make = currentVehicleMake;
    const model = currentVehicleModel;
    if (year && make && model) {
        // Force cache bust and reload
        window.location.href = `#vehicle/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}?_t=${Date.now()}`;
        setTimeout(() => window.location.reload(), 50);
    } else {
        window.location.reload();
    }
};

async function searchVehicle() {
    const year = document.getElementById('yearSelect').value;
    const make = document.getElementById('makeSelect').value;
    const model = document.getElementById('modelSelect').value;

    if (!year || !make || !model) {
        alert('Please select year, make, and model');
        return;
    }

    // Store current vehicle for year navigation
    currentVehicleYear = parseInt(year);
    currentVehicleMake = make;
    currentVehicleModel = model;

    document.getElementById('resultTitle').textContent = `${make} ${model} `;
    updateYearNavigation(parseInt(year));
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    const browseSection = document.getElementById('legacySearchCard');
    if (browseSection) browseSection.style.display = 'none';
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('active');

    initQuickSearch();
    // await ensureGuidesLoaded(); // Predownload guides for linking

    try {
        const fetchUrl = `${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10&_cb=${Date.now()}`;

        const res = await fetch(fetchUrl);
        const data = await res.json();
        console.log('[DEBUG] API Data received:', data);
        console.log('[DEBUG] Pearls count:', data.pearls?.length || 0);

        if (data.rows && data.rows.length > 0) {
            try {
                // Pass alerts and pearls from API response to displayResults
                const extras = {
                    alerts: data.alerts || [],
                    pearls: data.pearls || [],
                    procedures: data.procedures || [],
                    guide: data.guide || null,
                    walkthroughs: data.walkthroughs || [],
                    configs: data.configs || []
                };
                displayResults(data.rows, year, make, model, extras);
            } catch (innerE) {
                console.error('Display Error:', innerE);
                document.getElementById('resultsContainer').innerHTML = `<div class="error"> Display Error: ${innerE.message}</div> `;
            }
        } else {
            document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found</div>';
        }
    } catch (e) {
        console.error('Search failed:', e);
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
    }
}

// Render search results

// Guide Modal Functions - Handles Base64 Encoded Data
window.openGuideModal = function (id) {
    const dataEl = document.getElementById('guide-data-' + id);
    if (!dataEl) {
        console.error('Guide data element not found for id:', id);
        return;
    }

    try {
        // Decode base64 data (Unicode safe)
        const jsonStr = decodeURIComponent(escape(atob(dataEl.dataset.guideJson)));
        const guide = JSON.parse(jsonStr);

        const modal = document.getElementById('guideModal');
        const modalBody = document.getElementById('guideModalBody');
        const modalTitle = document.getElementById('guideModalTitle'); // Found this ID in the HTML

        if (modalTitle) modalTitle.textContent = guide.title || 'Programming Guide';

        // Render content
        let contentHtml = '';

        // [NEW] Handle Walkthrough Video
        if (guide.video_url) {
            // Simple embed check (YouTube only for now)
            let embedUrl = guide.video_url;
            if (embedUrl.includes('youtube.com/watch?v=')) {
                embedUrl = embedUrl.replace('watch?v=', 'embed/');
            } else if (embedUrl.includes('youtu.be/')) {
                embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
            }

            if (embedUrl.includes('embed')) {
                contentHtml += `
                    <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; margin-bottom: 24px; border: 1px solid var(--border);">
                        <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
                    </div>`;
            }
        }

        // [NEW] Prioritize Structured Steps (Hybrid Storage)
        let steps = guide.steps;
        if (guide.structured_steps_json) {
            try {
                steps = JSON.parse(guide.structured_steps_json);
            } catch (e) {
                console.error('Failed to parse structured_steps_json', e);
            }
        }

        // Check for GuideRenderer or custom steps
        if (window.renderGuideContent && guide.content && !steps) {
            contentHtml += window.renderGuideContent(guide.content);
        } else if (steps && Array.isArray(steps)) {
            // Default render for structured steps
            contentHtml += steps.map((step, idx) => `
            <div class="guide-step" style="margin-bottom: 24px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #60a5fa; margin: 0 0 12px 0; font-size: 1.1rem; display: flex; justify-content: space-between;">
                        <span>${step.title || `Step ${idx + 1}`}</span>
                        ${step.time ? `<span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">⏱️ ${step.time}</span>` : ''}
                    </h3>
                    <div style="color: #e5e7eb; line-height: 1.6;">${step.description || step.content || ''}</div>
                    ${step.images ? step.images.map(img => `<img src="${img}" style="max-width:100%; margin-top:10px; border-radius:6px; border: 1px solid var(--border);">`).join('') : ''}
                    ${step.tools ? `<div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted);">🛠️ Tools: ${step.tools.join(', ')}</div>` : ''}
                </div>
            `).join('');
        } else if (guide.content) {
            // Simple markdown-to-html fallback
            contentHtml += guide.content
                .replace(/\n\n/g, '<br><br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^# (.*)/gm, '<h1>$1</h1>')
                .replace(/^## (.*)/gm, '<h2>$1</h2>')
                .replace(/^### (.*)/gm, '<h3>$1</h3>')
                .replace(/^- (.*)/gm, '<li>$1</li>');
        } else {
            contentHtml = '<p>No content available for this programming procedure.</p>';
        }

        modalBody.innerHTML = contentHtml;
        modal.style.display = 'flex';

    } catch (e) {
        console.error('Error opening guide modal:', e);
        // Fallback for debugging
        alert('Error parsing guide data: ' + e.message);
    }
};

window.closeGuideModal = function () {
    const modal = document.getElementById('guideModal');
    if (modal) modal.style.display = 'none';
};

function displayResults(rows, year, make, model, extras = {}) {
    const container = document.getElementById('resultsContainer');
    const { alerts = [], pearls = [], procedures = [], walkthroughs = [], configs = [], guide: extraGuide = null } = extras;
    console.log('[DEBUG] displayResults called with:', { rowsCount: rows.length, pearlsCount: pearls.length, alertsCount: alerts.length });

    // DEFENSIVE: Handle API response object {total, rows} vs raw array
    if (rows && !Array.isArray(rows) && rows.rows) {
        rows = rows.rows;
    }
    if (!Array.isArray(rows)) {
        container.innerHTML = '<div class="loading">Failed to load results</div>';
        console.error('displayResults: expected array, got', typeof rows, rows);
        return;
    }

    // [NEW] VehicleCard Integration (7-Layer Hub) - Can be toggled on/off
    const useVehicleCard = localStorage.getItem('useVehicleCard') === 'true' ||
                          window.location.hash.includes('vehiclecard=1');
    
    if (useVehicleCard && typeof VehicleCard !== 'undefined') {
        console.log('[VehicleCard] Rendering 7-layer vehicle hub');
        
        // Prepare vehicle data for VehicleCard
        const primaryRow = rows[0] || {};
        const vehicleData = {
            year: parseInt(year),
            make,
            model,
            immobilizer_system: primaryRow.immobilizer_system,
            immobilizer_system_specific: primaryRow.immobilizer_system_specific,
            mcu_mask: primaryRow.mcu_mask,
            chassis_code: primaryRow.chassis_code,
            notes: primaryRow.notes
        };
        
        // Get inventory data if available
        let inventoryData = {};
        if (typeof InventoryManager !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            configs.forEach(c => {
                const fcc = c.fcc_id;
                if (fcc) {
                    inventoryData[fcc] = InventoryManager.getKeyStock(fcc);
                }
            });
        }
        
        // Prepare subscription data (if available)
        const subscriptionData = typeof currentUser !== 'undefined' && currentUser?.subscription 
            ? currentUser.subscription 
            : null;
        
        // Create container for VehicleCard
        container.innerHTML = `
            <div style="margin-bottom: 16px;">
                <button onclick="localStorage.setItem('useVehicleCard', 'false'); window.location.reload();" 
                        style="background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    ⚙️ Switch to Legacy View
                </button>
            </div>
            <div id="vehicleCardContainer"></div>
        `;
        
        // Instantiate and render VehicleCard
        const vehicleCard = new VehicleCard('vehicleCardContainer');
        window.vehicleCard = vehicleCard; // Store globally for method calls
        
        vehicleCard.render({
            vehicle: vehicleData,
            configs: configs || [],
            procedures: procedures || [],
            pearls: pearls || [],
            inventory: inventoryData,
            subscription: subscriptionData
        });
        
        // Set shareable URL
        setVehicleUrl(make, model, year);
        
        return; // Exit early - VehicleCard handles all rendering
    }

    // Legacy rendering continues below...
    // Set shareable URL for this vehicle
    setVehicleUrl(make, model, year);

    // --- UNIFIED VEHICLE HEADER & GLOBALS ---
    
    // Clean year for display to avoid '2024?v=12345' - MUST be declared before first use
    const cleanYear = parseInt(year);

    // 1. Master Header
    const makeLogo = getMakeLogo(make);
    const logoHtml = makeLogo ? `<img src="${makeLogo}" alt="${make}" class="make-logo" onerror="this.style.display='none'" style="width: 32px; height: 32px; object-fit: contain; margin-right: 12px; border-radius: 4px;">` : '';

    // === ARCHITECTURE BADGES (7-Layer Hub) ===
    // Extract immobilizer data from first row for architecture display
    const primaryRow = rows[0] || {};
    const archBadges = [];
    
    // Primary security system badge (e.g., CAS3+, Global B, EWS)
    if (primaryRow.immobilizer_system_specific && primaryRow.immobilizer_system_specific !== primaryRow.immobilizer_system) {
        archBadges.push({ label: primaryRow.immobilizer_system_specific, class: 'security' });
    } else if (primaryRow.immobilizer_system) {
        archBadges.push({ label: primaryRow.immobilizer_system, class: 'security' });
    }
    
    // CAN-FD detection (GM Global B, Ford 2021+, etc.)
    const immoSystem = primaryRow.immobilizer_system || '';
    const notes = primaryRow.notes || '';
    const isCaNFD = immoSystem.includes('Global B') || immoSystem.includes('CAN-FD') ||
                   notes.includes('CAN-FD') || (cleanYear >= 2021 && 
                   (make === 'Chevrolet' || make === 'GMC' || make === 'Cadillac'));
    if (isCaNFD) {
        archBadges.push({ label: 'CAN-FD', class: 'protocol' });
    }
    
    // MCU Mask (BMW specific - e.g., 1L15Y, 0L01Y)
    if (primaryRow.mcu_mask) {
        archBadges.push({ label: `MCU: ${primaryRow.mcu_mask}`, class: 'technical' });
    }
    
    // Chassis code (BMW/MB specific - e.g., E90, F30, W204)
    if (primaryRow.chassis_code) {
        archBadges.push({ label: primaryRow.chassis_code, class: 'chassis' });
    }
    
    // Build badges HTML
    const archBadgesHtml = archBadges.length > 0 ? `
        <div class="vc-arch-badges" style="margin-top: 8px;">
            ${archBadges.map(b => `<span class="vc-badge ${b.class}">${b.label}</span>`).join('')}
        </div>
    ` : '';

    // Calculate global badges (Stellantis/Mercedes)
    // NORMALIZE FCC for deduplication: Uppercase, O->0, Remove Hyphens
    const normFcc = (fcc) => (fcc || '').toUpperCase().replace(/O/g, '0').replace(/-/g, '');
    let globalWarnings = '';
    const uniqueRowsForBadges = rows.reduce((acc, current) => {
        const normalizedCurrent = normFcc(current.fcc_id);
        const x = acc.find(item => normFcc(item.fcc_id) === normalizedCurrent);
        if (!x) return acc.concat([current]);
        return acc;
    }, []);

    uniqueRowsForBadges.forEach(v => {
        if (make.toLowerCase() === 'jeep' && model.toLowerCase().includes('renegade') && parseInt(year) === 2022 && !globalWarnings.includes('Split-Year')) {
            globalWarnings += `<span class="badge"style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">⚠️ Split - Year</span> `;
        }
        if ((v.vin_ordered === 1) && !globalWarnings.includes('VIN-Ordered')) {
            globalWarnings += `<span class="badge"style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);">🔒 VIN - Ordered</span> `;
        }
    });

    // Get Vehicle Image
    const vehicleImage = typeof getVehicleResultImage === 'function' ? getVehicleResultImage(make, model, cleanYear) : null;

    // Get Guide Asset (Early fetch for snippets)
    const guide = typeof getGuideAsset === 'function' ? getGuideAsset(make, model, cleanYear) : null;

    let html = `
            <div class="vehicle-master-header" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden;">
                
                ${vehicleImage ? `<div style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); opacity: 0.12; pointer-events: none;">
                    <img src="${vehicleImage}" alt="${model}" style="max-height: 200px; width: auto; filter: grayscale(100%);">
                </div>` : ''}

                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; position: relative; z-index: 2;">
                    <div style="display: flex; align-items: center;">
                        ${logoHtml}
                        <div>
                            <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; line-height: 1.2; letter-spacing: -0.5px; color: var(--text-primary);">
                                ${cleanYear} ${make} ${model}
                            </h1>
                            <div style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 4px;">
                                ${uniqueRowsForBadges.length} Configuration${uniqueRowsForBadges.length !== 1 ? 's' : ''} Found
                            </div>
                            ${archBadgesHtml}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                        ${globalWarnings}
                    </div>
                </div>
    </div>
            `;

    // 1b. Critical Insight Tiles (Windows Phone Style)
    if (guide && guide.snippets && guide.snippets.length > 0) {
        html += `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
                ${guide.snippets.map(snippet => `
                    <div style="
                        background: ${snippet.color};
                        color: white;
                        border-radius: 8px;
                        padding: 16px;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        aspect-ratio: 1.4;
                        box-shadow: 0 4px 6px -2px rgba(0,0,0,0.3);
                        font-weight: 700;
                        font-size: 0.95rem;
                        line-height: 1.3;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                        transition: transform 0.2s;
                        cursor: default;
                    ">
                        ${snippet.text}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- UNIFIED JOB BRIEF DASHBOARD ---
    // Merges Alerts, Guide, and Pearls into one high-value strategic view

    // 1. Resolve Data Sources
    // Data (pearls, walkthroughs, configs) already extracted from extras at start of function
    const guideDataTop = extraGuide;

    // PRIORITIZE Walkthroughs (New Architecture) -> Legacy Guide -> Local Asset
    let guideData = null;
    let isWalkthrough = false;

    if (walkthroughs && walkthroughs.length > 0) {
        guideData = walkthroughs[0]; // API sorts by is_primary DESC
        isWalkthrough = true;
    } else {
        guideData = extras.guide || (typeof getGuideAsset === 'function' ? getGuideAsset(make, model, cleanYear) : null);
    }

    const hasAlerts = alerts && alerts.length > 0;
    const hasPearls = pearls && pearls.length > 0;
    const hasGuide = guideData && (guideData.content || guideData.id);

    // --- NEW: RENDER INTEL CARD if walkthrough has structured data ---
    const hasStructuredWalkthrough = isWalkthrough && guideData && (
        guideData.structured_steps_json ||
        guideData.quick_facts ||
        guideData.parts_needed
    );

    if (hasStructuredWalkthrough) {
        // Parse structured data if it's a string
        let walkthroughData = guideData;
        if (typeof guideData.structured_steps_json === 'string') {
            try {
                const parsed = JSON.parse(guideData.structured_steps_json);
                walkthroughData = { ...guideData, ...parsed };
            } catch (e) {
                console.warn('Failed to parse structured_steps_json:', e);
            }
        }

        // Get primary config for this vehicle
        const primaryConfig = configs.find(c => c.verified) || configs[0] || null;

        // Check if user has premium (integrate with your auth system)
        const isPremiumUser = typeof currentUser !== 'undefined' && currentUser?.premium;

        // Render the Intel Card
        html += renderIntelCard(walkthroughData, primaryConfig, { year: cleanYear, make, model }, {
            isPremiumUser,
            showAffiliate: true,
            cardIndex: 0
        });
    }

    // --- STRATEGIC INTELLIGENCE (Job Brief) ---
    // Merges Alerts, Guide, and Pearls into one high-value strategic view
    if (hasAlerts || hasPearls || hasGuide) {

        // HELPER: Format Pearl Content (Markdown-lite + Affiliate Links)
        const formatPearlContent = (text) => {
            if (!text) return '';
            const amazonTag = 'eurokeys-20';
            const linkify = (str) => {
                const terms = [
                    { regex: /\b(CR2032|CR2450|CR2025|CR1620)\b/gi, type: 'battery' },
                    { regex: /\b(HU100|HU66|HU101|SIP22|TOY43|TOY48|HON66)\b/gi, type: 'blade' },
                    { regex: /\b(Lishi)\b/gi, type: 'tool' },
                    { regex: /\b(Autel|Key Tool Max|IM508|IM608)\b/gi, type: 'programmer' }
                ];
                let linked = str;
                terms.forEach(t => {
                    linked = linked.replace(t.regex, (match) => {
                        const query = encodeURIComponent(`${match} ${t.type === 'battery' ? 'battery' : 'key tool'}`);
                        return `<a href="https://www.amazon.com/s?k=${query}&tag=${amazonTag}" target="_blank" class="pearl-affiliate-link" style="color: #22c55e; text-decoration: none; border-bottom: 1px dotted #22c55e; font-weight: 600;" onclick="event.stopPropagation();">${match}</a>`;
                    });
                });
                return linked;
            };
            let formatted = text
                .replace(/\* Alert:(.*?)(?=\*|$)/g, '<div style="background: rgba(239, 68, 68, 0.15); border-left: 3px solid #ef4444; padding: 8px 12px; margin: 8px 0; border-radius: 4px; color: #fca5a5;"><strong style="color:#ef4444;">⚠️ ALERT:</strong> $1</div>')
                .replace(/\*\s?(.*?):/g, '<strong style="color: #e9d5ff; display: block; margin-top: 8px;">$1:</strong>')
                .replace(/(\d+)\.\s(.*?)(?=(\d+\.| \*|$))/g, '<div style="margin-left: 8px; margin-bottom: 4px;"><span style="color: #8b5cf6; font-weight: bold;">$1.</span> $2</div>')
                .replace(/\*\s(.*?)(?=(\*|$))/g, '<div style="margin-left: 12px; position: relative; padding-left: 12px;"><span style="position: absolute; left: 0; color: #8b5cf6;">•</span> $1</div>');
            return linkify(formatted);
        };

        // --- NEW: PROCEDURE VIEWER (Split Brain UI) ---
        if (procedures && procedures.length > 0) {
            html += `<div id="procViewerContainer" style="margin-bottom: 24px;"></div>`;
        }

        html += `<div class="job-brief-container" style="background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">`;

        // A. Briefing Header
        html += `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #e2e8f0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                ⚡ Job Brief
                <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">Strategic Intelligence for ${make} ${model}</span>
            </h3>
            ${hasGuide ?
                `<button onclick="openGuideModal('${guideData.id}')" style="background: var(--brand-primary); color: #000; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <span>${isWalkthrough ? '🛠️' : '📖'}</span> ${isWalkthrough ? 'Start Walkthrough' : 'View Guide'}
                 </button>
                 <!-- Hidden data container for modal access -->
                 <div id="guide-data-${guideData.id}" data-guide-json="${btoa(unescape(encodeURIComponent(JSON.stringify(guideData))))}" style="display:none;"></div>`
                : ''}
        </div>`;

        html += `<div style="padding: 20px;">`;

        // B. Critical Alerts (Top Priority)
        if (hasAlerts) {
            html += `<div class="brief-section alerts" style="margin-bottom: 20px;">`;
            alerts.forEach(alert => {
                const color = alert.alert_level === 'CRITICAL' ? '#ef4444' : (alert.alert_level === 'WARNING' ? '#f59e0b' : '#3b82f6');
                const bg = alert.alert_level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : (alert.alert_level === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)');

                html += `
                <div style="background: ${bg}; border-left: 4px solid ${color}; padding: 12px 16px; border-radius: 4px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <strong style="color: ${color}; text-transform: uppercase; font-size: 0.8rem;">${alert.alert_level || 'ALERT'}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${alert.source || 'Verified Source'}</span>
                    </div>
                    <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 4px;">${alert.pearl_title || alert.title || 'Alert'}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">${alert.pearl_content || alert.content || ''}</div>
                </div>`;
            });
            html += `</div>`;
        }

        // C. Programming Pearls (New Section-Based Renderer)
        if (hasPearls) {
            html += renderPearlSections(pearls, { year: cleanYear, make, model });
        }

        // D. Guide Embed (Collapsible Preview)
        if (hasGuide && (guideData.content || guideData.html)) {
            // Determine preview text
            let previewText = '';
            if (guideData.content) {
                // Strip markdown headers for cleaner preview
                previewText = guideData.content.split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 3).join('<br>');
            } else {
                previewText = guideData.html || 'Preview not available.';
            }

            html += `
            <div style="margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px;">
                 <details style="cursor: pointer;">
                    <summary style="color: var(--brand-primary); font-weight: 600; outline: none; list-style: none;">
                        <span style="margin-right: 6px;">▶</span> Expand Procedure Preview
                    </summary>
                    <div style="margin-top: 12px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 8px; max-height: 300px; overflow-y: auto; font-size: 0.9rem; color: var(--text-secondary);">
                        ${previewText}
                        <div style="margin-top: 12px; text-align: center;">
                             <button onclick="openGuideModal('${guideData.id}')" style="background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                                Open Full Details
                             </button>
                        </div>
                    </div>
                </details>
            </div>`;
        }
        html += `</div></div>`; // End job-brief-container
    } else if (guide) {
        html += `
            <div class="guide-callout" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #60a5fa;">📚 Programming Guide Available</h3>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Step-by-step instructions for ${year} ${make} ${model}</p>
                    </div>
                    <button onclick="openGuideModal('${guideData.id}')" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span>View Guide</span>
                        <span>→</span>
                    </button>
                    <!-- Hidden data container -->
                    <div id="guide-data-${guideData.id}" data-guide-json="${btoa(unescape(encodeURIComponent(JSON.stringify(guideData))))}" style="display:none;"></div>
            </div> `;
    }

    // --- CORE PARTS & VIDEO ---
    {
        const youtubeSearchQuery = encodeURIComponent(`${year} ${make} ${model} key programming tutorial`);

        // === NEW: Render Key Intel Panel (comprehensive key data) ===
        // Uses configs from API, fallback to legacy rows, includes pearls and walkthrough
        html += renderKeyIntelPanel(
            configs,                    // Vehicle configs from /api/browse
            [],                         // Compatible keys (loaded dynamically later via carousel)
            { year: cleanYear, make, model },
            {
                showAffiliateLinks: true,
                pearls: pearls || [],
                walkthrough: guideData
            }
        );

        // If no configs available, show legacy fallback with basic info
        if (!configs || configs.length === 0) {
            // Legacy fallback for older vehicles without verified configs
            const legacyRow = rows[0] || {};
            const fccId = legacyRow.fcc_id || 'N/A';
            const keyway = legacyRow.keyway || 'N/A';
            const battery = legacyRow.battery || 'CR2032';
            const chip = legacyRow.chip || 'N/A';
            const amazonTag = 'eurokeys-20';

            // Only show if we have meaningful data
            if (fccId !== 'N/A' || keyway !== 'N/A') {
                html += `
                    <div class="tool-checklist" style="background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.1)); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <span style="font-size: 1.3rem;">🛠️</span>
                            <span style="font-weight: 700; color: #22c55e;">WHAT YOU'LL NEED</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">Legacy Data</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                            ${fccId !== 'N/A' ? `
                            <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${year} ${make} ${model} key fob ${fccId}`)}&tag=${amazonTag}" target="_blank" 
                               onclick="logActivity('affiliate_click', { type: 'checklist_key', term: '${year} ${make} ${model} key fob ${fccId}', fcc_id: '${fccId}' })"
                               style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; text-decoration: none; color: white;">
                                <span>🔑</span>
                                <div>
                                    <div style="font-weight: 600; color: #ffffff;">Key (${fccId})</div>
                                    ${chip !== 'N/A' ? `<div style="font-size: 0.7rem; color: var(--text-muted);">Chip: ${chip}</div>` : ''}
                                    <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                                </div>
                            </a>` : ''}
                            ${keyway !== 'N/A' ? `
                            <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${keyway} key blank`)}&tag=${amazonTag}" target="_blank" 
                               onclick="logActivity('affiliate_click', { type: 'checklist_blade', term: '${keyway} key blank', keyway: '${keyway}' })"
                               style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; text-decoration: none; color: white;">
                                <span>🗝️</span>
                                <div>
                                    <div style="font-weight: 600; color: #ffffff;">Blade (${keyway.split(' ')[0]})</div>
                                    <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                                </div>
                            </a>` : ''}
                            <a href="https://www.amazon.com/s?k=${encodeURIComponent(`${battery} battery 10 pack`)}&tag=${amazonTag}" target="_blank" 
                               onclick="logActivity('affiliate_click', { type: 'checklist_battery', term: '${battery} battery', battery: '${battery}' })"
                               style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; text-decoration: none; color: white;">
                                <span>🔋</span>
                                <div>
                                    <div style="font-weight: 600; color: #ffffff;">Battery (${battery})</div>
                                    <div style="font-size: 0.75rem; color: #22c55e;">Buy on Amazon →</div>
                                </div>
                            </a>
                        </div>
                    </div>`;
            }
        }


        // 5. Video Section (moved down - procedures come after parts)
        html += `
            <div class="video-section" style="background: linear-gradient(135deg, rgba(255,0,0,0.1), rgba(139,0,0,0.1)); border: 1px solid rgba(255,0,0,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.3rem;">📹</span>
                    <span style="font-weight: 700; color: #ff6b6b;">VIDEO TUTORIALS</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">• See it done for ${year} ${make} ${model}</span>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <a href="https://www.youtube.com/results?search_query=${youtubeSearchQuery}" target="_blank" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #ff0000; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        <span>🎬</span> Search YouTube
                    </a>
                </div>
            </div>`;
    } // End Core Parts & Video Section

    // --- Deduplicate and Merge Configs (always needed for key carousel) ---
    const normalizeFcc = (fcc) => (fcc || '').toUpperCase().replace(/O/g, '0').replace(/-/g, '');
    const seen = new Set();

    // [NEW] Merge verified configs first
    const mergedList = [];
    if (configs && Array.isArray(configs)) {
        configs.forEach(c => {
            const fcc = normalizeFcc(c.fcc_id);
            // Normalize to expected shape
            const item = {
                ...c,
                is_verified_config: true,
                keyway: c.key_blade || undefined,
                key_type: c.config_type || c.key_type,
                frequency: c.frequency,
                chip: c.chip,
                battery: c.battery
            };

            // Key includes normalized FCC OR OEM
            const key = fcc ? `FCC:${fcc}` : `OEM:${(c.oem_part_number || '').toUpperCase()}`;
            if ((fcc || c.oem_part_number) && !seen.has(key)) {
                seen.add(key);
                mergedList.push(item);
            }
        });
    }

    // Add Legacy Rows if not seen
    rows.forEach(v => {
        const rawFcc = (v.fcc_id || '').trim();
        const fccId = normalizeFcc(rawFcc);
        const oem = (v.oem_part_number || '').trim().toUpperCase();
        // Key includes normalized FCC OR OEM + key_type if no FCC
        const key = fccId ? `FCC:${fccId}` : `OEM:${oem}-${(v.key_type || '').toLowerCase()}`;

        if (key && !seen.has(key)) {
            seen.add(key);
            mergedList.push(v);
        }
    });

    const uniqueRows = mergedList;

    // --- DETAILED CONFIGURATIONS (Flip Cards + Variations) ---
    {

        // --- FLIP CARD CAROUSEL FOR CONFIGURATIONS ---
        const configCount = uniqueRows.length;
        html += `<div class="configurations-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                <h3 style="font-size: 1.1rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0;">
                    Available Key Configurations (${configCount})
                </h3>
                ${configCount > 1 ? `
                <div class="config-carousel-nav" style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="prevConfigCard()" class="carousel-arrow-btn" aria-label="Previous configuration" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: all 0.2s;">
                        ←
                    </button>
                    <span id="config-carousel-counter" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; min-width: 50px; text-align: center;">1 / ${configCount}</span>
                    <button onclick="nextConfigCard()" class="carousel-arrow-btn" aria-label="Next configuration" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: all 0.2s;">
                        →
                    </button>
                </div>
                ` : ''}
            </div>
            
            <!-- Pagination dots for quick navigation -->
            ${configCount > 1 ? `
            <div id="config-dots-container" style="display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                ${uniqueRows.map((_, i) => `<button onclick="goToConfigCard(${i})" class="config-dot ${i === 0 ? 'active' : ''}" style="width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.2s; background: ${i === 0 ? 'var(--brand-primary)' : 'var(--bg-tertiary)'};" aria-label="Go to configuration ${i + 1}"></button>`).join('')}
            </div>
            ` : ''}
            
            <!-- Flip card container -->
            <div id="config-cards-container" style="position: relative; overflow: hidden;">`;

        // Make Config Cards (hidden by default except first)
        html += uniqueRows.map((v, idx) => {
            const fccId = v.fcc_id || 'N/A';
            const oem = v.oem_part_number || 'N/A';

            // System Logic (Infer Global A/B for Camaro if missing)
            let immoSystem = (v.immobilizer_system || v.immobilizer || 'N/A');
            if (immoSystem === 'N/A' && make.toLowerCase() === 'chevrolet' && model.toLowerCase().includes('camaro')) {
                const y = parseInt(year);
                if (y >= 2010 && y <= 2015) immoSystem = 'Global A';
                else if (y >= 2016 && y <= 2018) immoSystem = 'Global A (PEPS)';
                else if (y >= 2019) immoSystem = 'Global B';
            }

            const chip = v.chip || v.chip_technology || 'N/A';
            const freq = v.frequency ? (v.frequency.toString().toLowerCase().includes('mhz') ? v.frequency : `${v.frequency} MHz`) : 'N/A';
            const keyway = v.keyway || 'N/A';
            const battery = v.battery || 'N/A';

            const keyType = v.key_type || v.crossref_key_type || 'N/A';
            const getKeyTypeBadgeClass = (type) => {
                if (!type) return '';
                const t = type.toLowerCase();
                if (t.includes('transponder')) return 'badge-transponder';
                if (t.includes('smart')) return 'badge-smartkey';
                if (t.includes('remote head')) return 'badge-remotehead';
                if (t.includes('mechanical')) return 'badge-mechanical';
                return 'badge-dark';
            };
            const keyTypeDisplay = v.key_type_display || keyType;
            const keyTypeBadgeClass = getKeyTypeBadgeClass(keyTypeDisplay);

            // GM Architecture & Theme
            let themeClass = '';
            let archName = 'Standard Architecture';
            let archBadgeClass = 'badge-dark';
            let archIcon = '🔧';
            if ((immoSystem && immoSystem.includes('Global A')) || (v.notes && v.notes.includes('Global A'))) {
                themeClass = 'theme-global-a'; archName = 'Global A (Open)'; archBadgeClass = 'global-a'; archIcon = '🟢';
            } else if ((immoSystem && immoSystem.includes('Global B')) || (v.notes && v.notes.includes('Global B'))) {
                themeClass = 'theme-global-b'; archName = 'Global B (Locked)'; archBadgeClass = 'global-b'; archIcon = '🔴';
            }

            // [NEW] Verified Badge
            let verifiedHtml = '';
            if (v.is_verified_config) {
                verifiedHtml = `<span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4); display: inline-flex; align-items: center; gap: 4px;">✅ Verified</span>`;
            }

            // Inventory
            const keyInStock = (typeof currentUser !== 'undefined' && currentUser) && fccId !== 'N/A' && typeof InventoryManager !== 'undefined' ? InventoryManager.getKeyStock(fccId) : 0;
            const blankInStock = (typeof currentUser !== 'undefined' && currentUser) && keyway !== 'N/A' && typeof InventoryManager !== 'undefined' ? InventoryManager.getBlankStock(keyway) : 0;
            const inventoryBadge = keyInStock > 0
                ? `<span class="badge"style="background: #22c55e; color: white;">📦 ${keyInStock} in stock</span> `
                : blankInStock > 0
                    ? `<span class="badge"style="background: #22c55e; color: white;">🔑 ${blankInStock} blanks</span> `
                    : '';

            // Generate the Config Card HTML
            // Get tech card image for this generation
            const techCardImg = typeof getVehicleResultImage === 'function' ? getVehicleResultImage(make, model, parseInt(year)) : null;

            // Get key tech card image (fob/blade/battery reference)
            const keyTechCardImg = typeof getKeyTechCardImage === 'function' ? getKeyTechCardImage(make, year, keyTypeDisplay, v.button_count || 4) : null;

            return `
            <div class="config-card ${themeClass}" data-config-index="${idx}" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; overflow: hidden; position: relative; display: ${idx === 0 ? 'block' : 'none'}; animation: ${idx === 0 ? 'fadeInCard 0.3s ease' : 'none'};">
            
            <!-- Config Header -->
            <div style="background: var(--bg-tertiary); padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                 <div style="display: flex; align-items: center; gap: 10px;">
                    ${keyTypeDisplay ? `<span class="badge ${keyTypeBadgeClass}">${keyTypeDisplay}</span>` : '<span class="badge badge-dark">Standard Configuration</span>'}
                    ${verifiedHtml}
                    <span style="font-weight: 600; font-family: monospace; color: var(--text-primary); font-size: 1.05rem;">
                        ${fccId !== 'N/A' ? `FCC: ${fccId}` : `P/N: ${oem}`}
                    </span>
                 </div>
                 <div class="arch-badge ${archBadgeClass}" style="font-size: 0.75rem; padding: 4px 8px;">${archIcon} ${archName}</div>
            </div>

            <div style="padding: 16px;">
                 <!-- Integrated Key Reference + Specs Layout -->
                 <div style="display: flex; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; align-items: flex-start;">
                    
                    ${keyTechCardImg ? `
                    <!-- Key Tech Card Image (Primary Visual) -->
                    <div style="flex: 0 0 auto; width: 180px; max-width: 100%;">
                       <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border-radius: 12px; padding: 12px; border: 1px solid rgba(255,255,255,0.1);">
                          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.5px; text-align: center;">🔑 Key Reference</div>
                          <img src="${keyTechCardImg}" alt="${make} Key Fob, Blade & Battery" 
                               style="width: 100%; height: auto; border-radius: 8px; display: block; cursor: zoom-in;"
                               onclick="openLightbox('${keyTechCardImg}')"
                               ondblclick="openLightbox('${keyTechCardImg}')"
                               onerror="this.closest('.key-ref-card')?.remove(); this.parentElement.parentElement.remove();">
                       </div>
                    </div>
                    ` : ''}
                    
                    <!-- Electronic Specs (Grows to fill space) -->
                    <div style="flex: 1; min-width: 200px;">
                       <div class="electronic-specs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                          <div class="spec-item"><div class="spec-icon" style="color: #a855f7;">🛡️</div><div class="spec-label">Chip</div><div class="spec-value">${chip}</div></div>
                          <div class="spec-item"><div class="spec-icon" style="color: #06b6d4;">⚡</div><div class="spec-label">Frequency</div><div class="spec-value">${freq}</div></div>
                          <div class="spec-item"><div class="spec-icon" style="color: #22c55e;">🔧</div><div class="spec-label">System</div><div class="spec-value">${immoSystem}</div></div>
                       </div>
                    </div>
                 </div>

                 <!-- Service Specs: Mechanical & Service (Bottom) -->
                 <div class="service-specs-container" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">Service Data</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                        
                        <!-- Blade / Keyway -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-size: 1.2rem;">🗝️</div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">Keyway</div>
                                <div style="font-weight: 600; color: var(--text-primary); font-family: monospace;">${keyway || 'N/A'}</div>
                            </div>
                        </div>

                         <!-- Code Series (Inferred if missing) -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-size: 1.2rem;">🔢</div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">Code Series</div>
                                <div style="font-weight: 600; color: var(--text-primary); font-family: monospace;">
                                    ${v.code_series || (keyway.includes('HU100') && parseInt(year) <= 2016 ? 'Z-Series (8-Cut)' : 'Varies (Check Lishi)')}
                                </div>
                            </div>
                        </div>

                        <!-- Lishi Tool -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-size: 1.2rem;">📐</div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">Lishi Tool</div>
                                <div style="font-weight: 600; color: #22c55e;">
                                    ${v.lishi_tool || (keyway.includes('HU100') ? 'HU100' : 'N/A')}
                                </div>
                            </div>
                        </div>

                        <!-- Battery -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-size: 1.2rem;">🔋</div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">Battery</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${battery}</div>
                            </div>
                        </div>

                    </div>
                 </div>
                 </div> <!-- Close tech card wrapper if present -->

                 <!-- Key Carousel Placeholder -->
                 <div id="keyCarouselContainer-${idx}" class="key-carousel-container" style="background: var(--bg-primary); padding: 12px; border-radius: 8px; border: 1px solid var(--border);"></div>

                 <!-- Dynamic Key Details (Selected Key) -->
                 <div id="keySpecs-${idx}" class="key-specs-container" 
                      style="background: var(--bg-secondary); border-top: 1px solid var(--border); display: none; margin-top: 12px; padding: 12px;"
                      data-default-keyway="${keyway || 'N/A'}"
                      data-default-battery="${battery || 'N/A'}"
                      data-code-series="${v.code_series || 'N/A'}"
                      data-lishi="${v.lishi_tool || 'N/A'}"
                      data-ignition="${v.ignition_retainer || 'N/A'}"
                      data-chip="${chip || 'N/A'}"
                      data-year="${year}" data-make="${make}" data-model="${model}">
                 </div>

                 <!-- Inventory Footer -->
                  <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                     <div style="font-size: 0.8rem; color: #22c55e; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                        ${inventoryBadge}
                     </div>
                     ${(fccId !== 'N/A' || oem !== 'N/A') ? `
                     <div>
                         <a href="#" onclick="searchFccById('${fccId !== 'N/A' ? fccId : ''}'); return false;" style="font-size: 0.85rem; color: var(--brand-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                            <span>View Internal FCC Details</span> <span>→</span>
                         </a>
                     </div>` : ''}
                 </div>
                 
                 ${v.service_notes_pro ? `
                    <details style="margin-top: 12px;">
                        <summary style="cursor: pointer; padding: 8px 12px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 8px; color: #fbbf24; font-weight: 600; font-size: 0.8rem;">
                            📌 Pro Service Notes
                        </summary>
                        <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 0.8rem; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap;">${v.service_notes_pro}</div>
                    </details>` : ''}
                 
                 <!-- Community Tips Section -->
                 <div id="communityTips-${idx}" class="community-tips-section" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
                     <details>
                         <summary style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-secondary); font-weight: 600;">
                             <span>💬</span>
                             <span>Community Tips</span>
                             <span id="commentCount-${idx}" style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem;">...</span>
                         </summary>
                         <div style="margin-top: 12px;">
                             <div id="commentsContainer-${idx}" style="margin-bottom: 12px;">
                                 <div class="loading" style="font-size: 0.8rem; color: var(--text-muted);">Loading tips...</div>
                             </div>
                             <div style="display: flex; gap: 8px;">
                                 <input type="text" id="commentInput-${idx}" 
                                        placeholder="Share a tip for this vehicle..." 
                                        style="flex: 1; padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.85rem;"
                                        maxlength="500">
                                 <button onclick="postComment('${make}|${model}|${cleanYear}', ${idx})"
                                         style="padding: 8px 16px; background: var(--brand-primary); color: var(--bg-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                                     Post
                                 </button>
                             </div>
                         </div>
                     </details>
                 </div>
            </div>
        </div>
            `;
        }).join('');

        html += `</div>`; // End config-cards-container
        html += `</div> `; // End configurations-section

    } // End Detailed Configurations Section

    // CRITICAL FIX: Inject the generated HTML into the DOM
    container.innerHTML = html;

    // Initialize Procedure Viewer (After DOM Injection)
    if (procedures && procedures.length > 0 && window.ProcedureViewer) {
        if (!window.procedureViewer) {
            window.procedureViewer = new ProcedureViewer('procViewerContainer');
        } else {
            // Re-target container (it was replaced by innerHTML)
            window.procedureViewer.container = document.getElementById('procViewerContainer');
        }
        window.procedureViewer.render(procedures, pearls);
    }

    // Add toggle listener for Intel Card comments (if present)
    if (hasStructuredWalkthrough) {
        const intelTipsDetails = document.querySelector('#communityTips-intel-0 details');
        if (intelTipsDetails) {
            intelTipsDetails.addEventListener('toggle', function () {
                if (this.open) {
                    loadComments(`${make}|${model}|${year}`, 'intel-0');
                }
            }, { once: true });
        }
    }

    // PERFORMANCE OPTIMIZATION 2: Fixed broken template literal (was `keyCarouselContainer - ${ idx } `)
    const keyLoadPromise = fetchCompatibleKeys(make, model, year);

    Promise.all(uniqueRows.map(async (v, idx) => {
        const container = document.getElementById(`keyCarouselContainer-${idx}`);
        if (!container) return;

        // Show loading skeleton immediately
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 8px;">Loading keys...</div>';

        try {
            // Reuse single fetch for all cards (same make/model/year)
            const keys = await keyLoadPromise;
            if (keys && keys.length > 0) {
                cardKeysData[idx] = keys;
                container.innerHTML = renderKeyCarousel(keys, idx, 0);
                // Auto-select first key to populate details
                selectKey(idx, 0);
            } else {
                container.innerHTML = '';
            }
        } catch (e) {
            container.innerHTML = '';
        }
    }));

    // Load comments for each configuration
    uniqueRows.forEach((v, idx) => {
        const vehicleKey = `${make}|${model}|${year}`;
        // Add event listener for when comments section is expanded
        const details = document.querySelector(`#communityTips-${idx} details`);
        if (details) {
            details.addEventListener('toggle', function () {
                if (this.open) {
                    loadComments(vehicleKey, idx);
                }
            }, { once: true });
        }
    });
}

function getKeyTypeIcon(keyType) {
    const lower = (keyType || '').toLowerCase();
    if (lower.includes('smart') || lower.includes('prox')) return '🚗';
    if (lower.includes('flip')) return '🔄';
    if (lower.includes('fobik')) return '📟';
    if (lower.includes('remote')) return '📡';
    return '🔑';
}

function goBack() {
    // Hide results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');

    // Show the legacy search card (we're already in a search flow)
    const legacyCard = document.getElementById('legacySearchCard');
    if (legacyCard) legacyCard.style.display = 'block';

    // Show year chips again for current make
    const yearChipsContainer = document.getElementById('yearChipsContainer');
    if (yearChipsContainer) yearChipsContainer.style.display = 'block';

    // Hide model chips
    const modelChipsContainer = document.getElementById('modelChipsContainer');
    if (modelChipsContainer) modelChipsContainer.style.display = 'none';

    // Clear selected year badge
    const yearBadge = document.getElementById('selectedYearBadge');
    if (yearBadge) yearBadge.style.display = 'none';

    // Hide year navigation
    const yearNav = document.getElementById('yearNavigation');
    if (yearNav) yearNav.style.display = 'none';
}

// Year Navigation Functions
function updateYearNavigation(year) {
    const yearNav = document.getElementById('yearNavigation');
    const yearCurrent = document.getElementById('yearNavCurrent');
    const prevBtn = document.getElementById('yearPrevBtn');
    const nextBtn = document.getElementById('yearNextBtn');

    if (yearNav && yearCurrent) {
        yearNav.style.display = 'flex';
        yearCurrent.textContent = year;

        // Determine year boundaries (2000 - next year)
        const minYear = 2000;
        const maxYear = new Date().getFullYear() + 1;

        prevBtn.disabled = year <= minYear; nextBtn.disabled = year >= maxYear;
    }
}

// PERFORMANCE OPTIMIZATION 3: Debounced year navigation with abort controller
let navigateYearTimeout = null;
let currentNavigationController = null;

async function navigateYear(direction) {
    if (!currentVehicleMake || !currentVehicleModel || !currentVehicleYear) return;

    const newYear = currentVehicleYear + direction;
    const minYear = 2000;
    const maxYear = new Date().getFullYear() + 1;

    if (newYear < minYear || newYear > maxYear) return;

    // Update year immediately for responsive UI
    currentVehicleYear = newYear;
    updateYearNavigation(newYear);

    // Cancel any pending navigation
    if (navigateYearTimeout) {
        clearTimeout(navigateYearTimeout);
    }
    if (currentNavigationController) {
        currentNavigationController.abort();
    }

    // Debounce: wait 150ms before actually fetching (allows rapid clicking)
    navigateYearTimeout = setTimeout(() => {
        loadVehicleByYear(newYear, currentVehicleMake, currentVehicleModel);
    }, 150);
}

async function loadVehicleByYear(year, make, model) {
    console.time('LoadVehicleFull');
    document.getElementById('resultTitle').textContent = `${make} ${model} `;
    updateYearNavigation(year);
    // CRITICAL: Clear container BEFORE loading to prevent stacking
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    try {
        // FIXED: Clean URL (no spaces, correct query syntax)
        const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
        const data = await res.json();

        if (data.rows && data.rows.length > 0) {
            console.timeLog('LoadVehicleFull', 'API Response Received');
            // Pass alerts and pearls from API response to displayResults
            const extras = {
                alerts: data.alerts || [],
                pearls: data.pearls || [],
                guide: data.guide || null
            };
            displayResults(data.rows, year, make, model, extras);
            console.timeEnd('LoadVehicleFull');
        } else {
            // Fetch available years for this make/model
            let availableYearsHtml = '';
            try {
                // FIXED: Clean URL for available years
                const yearsRes = await fetch(`${API}/api/master?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&fields=year_start,year_end&limit=100`);
                const yearsData = await yearsRes.json();
                if (yearsData.rows && yearsData.rows.length > 0) {
                    const yearsSet = new Set();
                    yearsData.rows.forEach(r => {
                        const start = r.year_start || r.year_end;
                        const end = r.year_end || r.year_start;
                        if (start && end) {
                            for (let y = Math.min(start, end); y <= Math.max(start, end); y++) { yearsSet.add(y); }
                        } else if (start) {
                            yearsSet.add(start);
                        }
                    });
                    const sortedYears = [...yearsSet].sort((a, b) => b - a);
                    if (sortedYears.length > 0) {
                        availableYearsHtml = `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Available years for ${make} ${model}:</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 400px; margin: 0 auto;">
                                    ${sortedYears.slice(0, 15).map(y => `
                                        <button onclick="loadVehicleByYear(${y}, '${make}', '${model}')"
                                            style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; transition: all 0.2s;"
                                            onmouseover="this.style.background='var(--brand-primary)'; this.style.color='var(--bg-primary)';"
                                            onmouseout="this.style.background='var(--bg-tertiary)'; this.style.color='var(--text-primary)';">
                                            ${y}
                                        </button>
                                    `).join('')}
                                    ${sortedYears.length > 15 ? `<span style="color: var(--text-muted); font-size: 0.8rem; align-self: center;">+${sortedYears.length - 15} more</span>` : ''}
                                </div>
                            </div>
            `;
                    }
                }
            } catch (e) {
                console.log('Could not fetch available years:', e);
            }

            document.getElementById('resultsContainer').innerHTML = `
            <div class="loading"style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 12px;">🚫</div>
                    <div>No data for ${year} ${make} ${model}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
                        ${availableYearsHtml ? 'Select a year with available data below:' : 'Try adjacent years or this model may not exist for ' + year}
                    </div>
                    ${availableYearsHtml}
                </div>
            `;
        }
    } catch (e) {
        console.error('Year navigation failed:', e);
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
    }
}

// Quick switch to a different make (pre-populate dropdowns)
async function quickSwitchMake(make) {
    // Hide results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.remove('active');

    // Clear results container
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';

    // Set the make in dropdown
    const makeSelect = document.getElementById('makeSelect');
    makeSelect.value = make;

    // Trigger visual make selection
    await selectVisualMake(make);
}

// Quick switch to a different model (same year/make)
async function quickSwitchModel(year, make, model) {
    document.getElementById('yearSelect').value = year;
    document.getElementById('makeSelect').value = make;
    await loadModels();
    document.getElementById('modelSelect').value = model;
    await searchVehicle();
}

// Quick search from results page
async function quickLoadMakes() {
    const year = document.getElementById('quickYear').value;
    const select = document.getElementById('quickMake');

    if (!year) {
        select.innerHTML = '<option value="">Make</option>';
        return;
    }
    select.innerHTML = '<option value="">Loading...</option>';

    try {
        const res = await fetch(`${API}/api/master?year=${year}&limit=1000`);
        const data = await res.json();
        const makes = [...new Set(data.rows.map(r => r.make))].filter(isValidMake).sort();
        select.innerHTML = '<option value="">Make</option>';
        makes.forEach(m => { select.innerHTML += `<option value = "${m}"> ${m}</option> `; });
    } catch (e) {
        select.innerHTML = '<option value="">Make</option>';
    }
}

async function quickLoadModels() {
    const year = document.getElementById('quickYear').value;
    const make = document.getElementById('quickMake').value;
    const select = document.getElementById('quickModel');

    if (!make) {
        select.innerHTML = '<option value="">Model</option>';
        return;
    }
    select.innerHTML = '<option value="">Loading...</option>';

    try {
        const res = await fetch(`${API}/api/master?year=${year}&make=${encodeURIComponent(make)}&limit=500`);
        const data = await res.json();
        const models = [...new Set(data.rows.map(r => r.model))].sort();
        select.innerHTML = '<option value="">Model</option>';
        models.forEach(m => { select.innerHTML += `<option value = "${m}"> ${m}</option> `; });
    } catch (e) {
        select.innerHTML = '<option value="">Model</option>';
    }
}

async function quickSearch() {
    const year = document.getElementById('quickYear').value;
    const make = document.getElementById('quickMake').value;
    const model = document.getElementById('quickModel').value;

    if (!year || !make || !model) {
        alert('Please select year, make, and model');
        return;
    }

    // Store current vehicle for year navigation
    currentVehicleYear = parseInt(year);
    currentVehicleMake = make;
    currentVehicleModel = model;

    document.getElementById('resultTitle').textContent = `${make} ${model} `;
    updateYearNavigation(parseInt(year));
    document.getElementById('resultsContainer').innerHTML = '<div class="loading">Loading...</div>';

    try {
        const res = await fetch(`${API}/api/browse?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`);
        const data = await res.json();
        if (data.rows && data.rows.length > 0) {
            displayResults(data.rows, year, make, model);
        } else {
            document.getElementById('resultsContainer').innerHTML = '<div class="loading">No results found</div>';
        }
    } catch (e) {
        document.getElementById('resultsContainer').innerHTML = '<div class="loading">Failed to load</div>';
    }
}

// Populate quick search years when results are shown
function initQuickSearch() {
    const select = document.getElementById('quickYear');
    if (select.options.length <= 1) {
        const year = new Date().getFullYear() + 1; for (let y = year; y >= 2000; y--) {
            select.innerHTML += `<option value = "${y}"> ${y}</option> `;
        }
    }
}

// ==============================================
// CONFIGURATION CAROUSEL FUNCTIONS
// ==============================================

window.currentConfigIndex = 0;

window.updateConfigCarouselUI = function () {
    const cards = document.querySelectorAll('.config-card');
    const dots = document.querySelectorAll('.config-dot');
    const counter = document.getElementById('config-carousel-counter');

    if (cards.length === 0) return;

    // Ensure index is within bounds
    if (window.currentConfigIndex >= cards.length) window.currentConfigIndex = 0;
    if (window.currentConfigIndex < 0) window.currentConfigIndex = cards.length - 1;

    // Update Cards
    cards.forEach((card, idx) => {
        if (idx === window.currentConfigIndex) {
            card.style.display = 'block';
            card.style.animation = 'fadeInConfigCard 0.3s ease forwards';
        } else {
            card.style.display = 'none';
        }
    });

    // Update Dots
    dots.forEach((dot, idx) => {
        if (idx === window.currentConfigIndex) {
            dot.classList.add('active');
            dot.style.background = 'var(--brand-primary)';
            dot.style.transform = 'scale(1.2)';
        } else {
            dot.classList.remove('active');
            dot.style.background = 'var(--bg-tertiary)';
            dot.style.transform = 'scale(1)';
        }
    });

    // Update Counter
    if (counter) {
        counter.textContent = `${window.currentConfigIndex + 1} / ${cards.length}`;
    }
};

window.nextConfigCard = function () {
    const cards = document.querySelectorAll('.config-card');
    if (cards.length <= 1) return;

    window.currentConfigIndex++;
    if (window.currentConfigIndex >= cards.length) {
        window.currentConfigIndex = 0;
    }
    window.updateConfigCarouselUI();
};

window.prevConfigCard = function () {
    const cards = document.querySelectorAll('.config-card');
    if (cards.length <= 1) return;

    window.currentConfigIndex--;
    if (window.currentConfigIndex < 0) {
        window.currentConfigIndex = cards.length - 1;
    }
    window.updateConfigCarouselUI();
};

window.goToConfigCard = function (index) {
    window.currentConfigIndex = index;
    window.updateConfigCarouselUI();
};

