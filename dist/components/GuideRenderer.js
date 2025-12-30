/**
 * GuideRenderer - Dynamic renderer for modular guide blocks
 * Renders vehicle guides from JSON block format
 */

// Block type components
function WarningBanner({ content, level, icon }) {
  const levelStyles = {
    critical: 'background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); border-left: 4px solid #ef4444;',
    warning: 'background: linear-gradient(135deg, #78350f 0%, #92400e 100%); border-left: 4px solid #f59e0b;',
    info: 'background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); border-left: 4px solid #3b82f6;',
    tip: 'background: linear-gradient(135deg, #14532d 0%, #166534 100%); border-left: 4px solid #22c55e;'
  };
  const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️', tip: '💡' };

  return `
    <div class="guide-block warning-banner" style="${levelStyles[level] || levelStyles.warning} padding: 16px; border-radius: 8px; margin: 12px 0;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <span style="font-size: 1.5rem;">${icon || icons[level] || '⚠️'}</span>
        <p style="margin: 0; color: #fff; font-weight: 500; line-height: 1.5;">${content}</p>
      </div>
    </div>
  `;
}

function InfoCallout({ content, level, icon }) {
  const levelStyles = {
    tip: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', icon: '💡' },
    note: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: '📝' },
    important: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', icon: '⚡' }
  };
  const style = levelStyles[level] || levelStyles.note;

  return `
    <div class="guide-block info-callout" style="background: ${style.bg}; border-left: 3px solid ${style.border}; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 12px 0;">
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span>${icon || style.icon}</span>
        <p style="margin: 0; color: var(--text-primary); line-height: 1.5;">${content}</p>
      </div>
    </div>
  `;
}

function ToolChecklist({ title, items }) {
  const itemsHtml = items.map(item => `
    <div class="tool-item" style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span style="color: ${item.required ? '#22c55e' : '#6b7280'};">${item.required ? '✓' : '○'}</span>
      <div style="flex: 1;">
        <span style="font-weight: 500; color: var(--text-primary);">${item.name}</span>
        ${item.notes ? `<span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 8px;">${item.notes}</span>` : ''}
      </div>
      ${item.amazon_asin ? `<a href="https://amazon.com/dp/${item.amazon_asin}?tag=eurokeys-20" target="_blank" class="amazon-link" style="font-size: 0.75rem; background: rgba(255,153,0,0.2); color: #ff9900; padding: 4px 8px; border-radius: 4px;">Amazon</a>` : ''}
    </div>
  `).join('');

  return `
    <div class="guide-block tool-checklist" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin: 16px 0;">
      ${title ? `<h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 1rem;">🔧 ${title}</h4>` : ''}
      <div class="tool-list">${itemsHtml}</div>
    </div>
  `;
}

function StepGroup({ title, estimated_time, steps }) {
  const stepsHtml = steps.map(step => `
    <div class="step-item" style="display: flex; gap: 16px; margin-bottom: 16px;">
      <div class="step-number" style="width: 32px; height: 32px; background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0;">
        ${step.number}
      </div>
      <div class="step-content" style="flex: 1;">
        <p style="margin: 0 0 8px 0; color: var(--text-primary); line-height: 1.5;">${step.text}</p>
        ${step.tip ? `<div style="background: rgba(34, 197, 94, 0.1); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; color: #22c55e;">💡 ${step.tip}</div>` : ''}
        ${step.warning ? `<div style="background: rgba(239, 68, 68, 0.1); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; color: #ef4444;">⚠️ ${step.warning}</div>` : ''}
        ${step.substeps ? `<ul style="margin: 8px 0 0 16px; color: var(--text-muted);">${step.substeps.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
        ${step.image_url ? `<img src="/api/assets/${step.image_url}" alt="Step ${step.number}" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">` : ''}
      </div>
    </div>
  `).join('');

  return `
    <div class="guide-block step-group" style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid rgba(255,255,255,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: var(--text-primary);">📋 ${title}</h4>
        ${estimated_time ? `<span style="font-size: 0.8rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 12px;">⏱️ ${estimated_time}</span>` : ''}
      </div>
      <div class="steps-list">${stepsHtml}</div>
    </div>
  `;
}

function ReferenceTable({ title, headers, rows }) {
  const headerHtml = headers.map(h => `<th style="padding: 10px 12px; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--brand-primary);">${h}</th>`).join('');
  const rowsHtml = rows.map(row => {
    const cells = row.cells.map(c => `<td style="padding: 10px 12px; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.1);">${c}</td>`).join('');
    return `<tr style="${row.highlight ? 'background: rgba(var(--brand-primary-rgb), 0.1);' : ''}">${cells}</tr>`;
  }).join('');

  return `
    <div class="guide-block reference-table" style="margin: 16px 0; overflow-x: auto;">
      ${title ? `<h4 style="margin: 0 0 12px 0; color: var(--text-primary);">📊 ${title}</h4>` : ''}
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function DecisionTree({ title, question, branches }) {
  const branchesHtml = branches.map(b => `
    <div style="display: flex; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px;">
      <span style="color: var(--brand-primary); font-weight: 600;">→</span>
      <div>
        <span style="color: #f59e0b; font-weight: 500;">${b.condition}</span>
        <span style="color: var(--text-primary); margin: 0 8px;">:</span>
        <span style="color: var(--text-secondary);">${b.action}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="guide-block decision-tree" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin: 16px 0;">
      <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">🔀 ${title}</h4>
      <p style="color: var(--text-muted); margin-bottom: 12px; font-style: italic;">${question}</p>
      <div class="branches">${branchesHtml}</div>
    </div>
  `;
}

function PricingMatrix({ title, rows }) {
  const rowsHtml = rows.map(r => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div>
        <span style="color: var(--text-primary); font-weight: 500;">${r.scenario}</span>
        ${r.notes ? `<span style="display: block; font-size: 0.8rem; color: var(--text-muted);">${r.notes}</span>` : ''}
      </div>
      <span style="color: #22c55e; font-weight: 700; font-size: 1.1rem;">${r.price_range}</span>
    </div>
  `).join('');

  return `
    <div class="guide-block pricing-matrix" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1)); border-radius: 12px; padding: 20px; margin: 16px 0;">
      <h4 style="margin: 0 0 16px 0; color: var(--text-primary);">💰 ${title}</h4>
      <div class="pricing-rows">${rowsHtml}</div>
    </div>
  `;
}

function ComparisonTable({ title, items, features }) {
  const headerHtml = ['Feature', ...items].map((h, i) =>
    `<th style="padding: 10px; text-align: ${i === 0 ? 'left' : 'center'}; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--brand-primary);">${h}</th>`
  ).join('');

  const rowsHtml = features.map(f => {
    const cells = [f.name, ...f.values].map((c, i) =>
      `<td style="padding: 10px; text-align: ${i === 0 ? 'left' : 'center'}; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.1);">${c}</td>`
    ).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <div class="guide-block comparison-table" style="margin: 16px 0; overflow-x: auto;">
      <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">⚖️ ${title}</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function VideoEmbed({ video_id, title, start_time }) {
  const src = `https://www.youtube.com/embed/${video_id}${start_time ? `?start=${start_time}` : ''}`;
  return `
    <div class="guide-block video-embed" style="margin: 16px 0;">
      <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">🎬 ${title}</h4>
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px;">
        <iframe src="${src}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
      </div>
    </div>
  `;
}

// Accordion Group for Book-like View
function AccordionGroup({ items }) {
  if (!items || !items.length) return '';

  const css = `
    <style>
      .guide-accordion summary::-webkit-details-marker { display: none; }
      .guide-accordion[open] summary .accordion-icon { transform: rotate(180deg); }
      .guide-accordion[open] summary { border-radius: 8px 8px 0 0; background: rgba(255,255,255,0.05) !important; }
    </style>
    `;

  const html = items.map(item => `
    <details class="guide-accordion" style="background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border);">
      <summary style="padding: 14px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none; transition: all 0.2s;">
        <span style="font-weight: 600; color: var(--text-primary); font-size: 1rem;">${item.title}</span>
        <span class="accordion-icon" style="color: var(--text-muted); transition: transform 0.2s;">▼</span>
      </summary>
      <div class="accordion-content" style="padding: 20px; border-top: 1px solid var(--border); color: var(--text-secondary); line-height: 1.6;">
        ${item.content}
      </div>
    </details>
    `).join('');

  return `<div class="accordion-group-container">${css}${html}</div>`;
}

function parseMarkdownToBlocks(markdown) {
  if (!markdown) return [];

  const sections = [];
  const normalized = markdown.replace(/\r\n/g, '\n');

  // Split key sections by H2
  const parts = normalized.split(/^##\s+(.+)$/gm);

  if (parts[0] && parts[0].trim()) {
    sections.push({ title: 'Overview', content: parts[0].trim() });
  }

  for (let i = 1; i < parts.length; i += 2) {
    sections.push({
      title: parts[i].trim(),
      content: parts[i + 1] ? parts[i + 1].trim() : ''
    });
  }

  const items = sections.map(s => {
    let parsed = s.content;
    if (typeof marked !== 'undefined' && marked.parse) {
      parsed = marked.parse(s.content);
    } else {
      parsed = s.content
        .replace(/\n/g, '<br>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }
    return { title: s.title, content: parsed };
  });

  return [{ type: 'accordion_group', items }];
}

// Main renderer function
function renderGuideBlock(block) {
  switch (block.type) {
    case 'warning_banner':
      return WarningBanner(block);
    case 'info_callout':
      return InfoCallout(block);
    case 'tool_checklist':
      return ToolChecklist(block);
    case 'step_group':
      return StepGroup(block);
    case 'reference_table':
      return ReferenceTable(block);
    case 'decision_tree':
      return DecisionTree(block);
    case 'pricing_matrix':
      return PricingMatrix(block);
    case 'comparison_table':
      return ComparisonTable(block);
    case 'video_embed':
      return VideoEmbed(block);
    case 'accordion_group':
      return AccordionGroup(block);
    default:
      console.warn('Unknown block type:', block.type);
      return '';
  }
}

function renderVehicleGuide(guideData) {
  if (!guideData) {
    return '<div style="color: var(--text-muted); text-align: center; padding: 20px;">📚 No guide data available.</div>';
  }

  const headerHtml = `
    <div class="guide-header" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <h2 style="margin: 0 0 8px 0; color: var(--text-primary);">${guideData.title}</h2>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.85rem;">
        <span style="color: var(--text-muted);">📅 ${guideData.year_start || ''}–${guideData.year_end || 'Present'}</span>
        <span style="color: var(--text-muted);">⏱️ ${guideData.estimated_time}</span>
        <span style="padding: 2px 8px; border-radius: 4px; font-weight: 600; ${guideData.difficulty === 'Expert' ? 'background: rgba(239,68,68,0.2); color: #ef4444;' :
      guideData.difficulty === 'Intermediate' ? 'background: rgba(245,158,11,0.2); color: #f59e0b;' :
        'background: rgba(34,197,94,0.2); color: #22c55e;'
    }">${guideData.difficulty}</span>
      </div>
    </div>
  `;

  let modulesHtml = '';
  if (guideData.modules && guideData.modules.length > 0) {
    modulesHtml = guideData.modules.map(renderGuideBlock).join('');
  } else if (guideData.content) {
    const blocks = parseMarkdownToBlocks(guideData.content);
    modulesHtml = blocks.map(renderGuideBlock).join('');
  }

  return `
    <div class="vehicle-guide-container" style="max-width: 900px;">
      ${headerHtml}
      ${modulesHtml}
    </div>
  `;
}

// Export for use in index.html
if (typeof window !== 'undefined') {
  window.renderVehicleGuide = renderVehicleGuide;
  window.renderGuideBlock = renderGuideBlock;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderVehicleGuide, renderGuideBlock };
}
