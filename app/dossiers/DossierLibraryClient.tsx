'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import dossierManifest from '@/public/data/dossier_manifest.json';
import { useAuth } from '@/contexts/AuthContext';
import UpgradePrompt from '@/components/UpgradePrompt';
import TourBanner from '@/components/onboarding/TourBanner';

const FREE_OPEN_LIMIT = 3;
const OPENED_STORAGE_KEY = 'eurokeys_dossiers_opened';

interface DossierSection {
  heading: string;
  level: number;
  preview: string;
  makes: string[];
  topics: string[];
  platforms: string[];
  years: number[];
}

interface Dossier {
  id: string;
  title: string;
  embed_url: string;
  view_url: string;
  modified: string;
  is_public: boolean;
  makes: string[];
  topics: string[];
  platforms: string[];
  years: number[];
  sections: DossierSection[];
}

const TOPIC_FILTERS = [
  'AKL',
  'Key Programming',
  'Immobilizer',
  'Smart Key',
  'Security Gateway',
  'PATS',
  'CAN-FD',
  'EEPROM',
];

const MAKE_OPTIONS = [
  'All Makes',
  'Acura',
  'Alfa Romeo',
  'Audi',
  'BMW',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Land Rover',
  'Lexus',
  'Lincoln',
  'Mazda',
  'Mercedes-Benz',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Porsche',
  'Ram',
  'Rivian',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
];

// Helper to format years as a range
const formatYearRange = (years: number[]): string => {
  if (!years || years.length === 0) return '';
  const sorted = [...years].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min === max) return `${min}`;
  return `${min}–${max}`;
};

export default function DossierLibraryClient() {
  const { hasDossiers } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState('All Makes');
  const [expandedDossier, setExpandedDossier] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [openedIds, setOpenedIds] = useState<string[]>([]);

  // Load opened dossier IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OPENED_STORAGE_KEY);
      if (stored) setOpenedIds(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const openDossierGated = useCallback((dossier: Dossier) => {
    // Pro / dossier subscribers bypass the limit
    if (hasDossiers) {
      window.open(dossier.embed_url, '_blank');
      return;
    }

    // Already opened this one? Let them re-open it (doesn't count again)
    if (openedIds.includes(dossier.id)) {
      window.open(dossier.embed_url, '_blank');
      return;
    }

    // Check if they've hit the free limit
    if (openedIds.length >= FREE_OPEN_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    // Open and track
    const updated = [...openedIds, dossier.id];
    setOpenedIds(updated);
    try { localStorage.setItem(OPENED_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    window.open(dossier.embed_url, '_blank');
  }, [hasDossiers, openedIds]);

  // Normalise manifest entries – some may have null/missing fields
  const dossiers = (dossierManifest as Dossier[]).map((d) => ({
    ...d,
    title: d.title ?? '',
    makes: d.makes ?? [],
    topics: d.topics ?? [],
    platforms: d.platforms ?? [],
    years: d.years ?? [],
    sections: (d.sections ?? []).map((s) => ({
      ...s,
      heading: s.heading ?? '',
      preview: s.preview ?? '',
      makes: s.makes ?? [],
      topics: s.topics ?? [],
      platforms: s.platforms ?? [],
      years: s.years ?? [],
    })),
  }));

  // Filter dossiers based on search, topics, and make
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((dossier) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = dossier.title.toLowerCase().includes(query);
        const matchesSections = dossier.sections.some(
          (s) =>
            s.heading.toLowerCase().includes(query) ||
            s.preview.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSections) return false;
      }

      // Topic filter
      if (selectedTopics.length > 0) {
        const hasMatchingTopic = selectedTopics.some((topic) =>
          dossier.topics.includes(topic)
        );
        if (!hasMatchingTopic) return false;
      }

      // Make filter
      if (selectedMake !== 'All Makes') {
        if (!dossier.makes.includes(selectedMake)) return false;
      }

      return true;
    });
  }, [dossiers, searchQuery, selectedTopics, selectedMake]);

  // Group by primary make (first in list, or from title)
  const groupedByMake = useMemo(() => {
    const groups: Record<string, Dossier[]> = {};

    filteredDossiers.forEach((dossier) => {
      // Try to identify primary make from title
      let primaryMake = 'General';
      for (const make of MAKE_OPTIONS.slice(1)) {
        if (dossier.title.includes(make) || dossier.title.includes(make.split('-')[0])) {
          primaryMake = make;
          break;
        }
      }
      // Fallback to first make in list
      if (primaryMake === 'General' && dossier.makes.length > 0) {
        primaryMake = dossier.makes[0];
      }

      if (!groups[primaryMake]) groups[primaryMake] = [];
      groups[primaryMake].push(dossier);
    });

    // Sort groups - prioritize selected make or search term match
    return Object.entries(groups).sort(([a], [b]) => {
      // If a make is selected, put it first
      if (selectedMake !== 'All Makes') {
        if (a === selectedMake) return -1;
        if (b === selectedMake) return 1;
      }

      // If searching, prioritize makes that match the search query
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const aMatches = a.toLowerCase().includes(queryLower);
        const bMatches = b.toLowerCase().includes(queryLower);
        if (aMatches && !bMatches) return -1;
        if (bMatches && !aMatches) return 1;
      }

      // Otherwise alphabetical
      return a.localeCompare(b);
    });
  }, [filteredDossiers, selectedMake, searchQuery]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const openDossier = (dossier: Dossier) => {
    openDossierGated(dossier);
  };

  return (
    <div className="dossier-library">
      <style jsx>{`
        .dossier-library {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
          color: #fff;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .header .subtitle {
          color: #888;
          font-size: 1rem;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-bar {
          flex: 1;
          min-width: 250px;
          max-width: 400px;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #333;
          background: #1a1a2e;
          color: #fff;
          font-size: 1rem;
        }

        .search-bar::placeholder {
          color: #666;
        }

        .topic-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .topic-chip {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid #444;
          background: transparent;
          color: #aaa;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .topic-chip:hover {
          border-color: #0ea5e9;
          color: #0ea5e9;
        }

        .topic-chip.active {
          background: #0ea5e9;
          border-color: #0ea5e9;
          color: #fff;
        }

        .make-select {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #333;
          background: #1a1a2e;
          color: #fff;
          font-size: 1rem;
          min-width: 150px;
        }

        .make-section {
          margin-bottom: 2rem;
        }

        .make-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #333;
        }

        .make-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #0ea5e9;
        }

        .make-count {
          background: #333;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #888;
        }

        .dossier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .dossier-card {
          background: linear-gradient(145deg, #1e1e32 0%, #252540 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.2s;
        }

        .dossier-card:hover {
          border-color: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
          flex: 1;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          margin-left: 0.5rem;
          flex-shrink: 0;
        }

        .section-count {
          background: #333;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #888;
          white-space: nowrap;
        }

        .year-range {
          background: rgba(16, 185, 129, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #10b981;
          white-space: nowrap;
          font-weight: 500;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }

        .tag {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .tag.topic {
          background: rgba(14, 165, 233, 0.2);
          color: #0ea5e9;
        }

        .tag.platform {
          background: rgba(168, 85, 247, 0.2);
          color: #a855f7;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #0ea5e9;
          color: #fff;
        }

        .btn-primary:hover {
          background: #0284c7;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #444;
          color: #aaa;
        }

        .btn-secondary:hover {
          border-color: #666;
          color: #fff;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0ea5e9;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
        }
      `}</style>

      <div className="header">
        <h1>📚 Dossier Library</h1>
        <p className="subtitle">{dossiers.length} Technical Documents</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <TourBanner tourId="knowledge-deep-dive" storageKey="eurokeys_dossier_first_visit" />
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{filteredDossiers.length}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {filteredDossiers.reduce((sum, d) => sum + d.sections.length, 0).toLocaleString()}
          </div>
          <div className="stat-label">Sections</div>
        </div>
        <div className="stat">
          <div className="stat-value">{groupedByMake.length}</div>
          <div className="stat-label">Makes</div>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-bar"
          placeholder="Search dossiers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="topic-chips">
          {TOPIC_FILTERS.map((topic) => (
            <button
              key={topic}
              className={`topic-chip ${selectedTopics.includes(topic) ? 'active' : ''}`}
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <select
          className="make-select"
          value={selectedMake}
          onChange={(e) => setSelectedMake(e.target.value)}
        >
          {MAKE_OPTIONS.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      {filteredDossiers.length === 0 ? (
        <div className="no-results">
          <p>No dossiers match your filters.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedTopics([]);
              setSelectedMake('All Makes');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {groupedByMake.map(([make, makeDossiers]) => (
            <div key={make} className="make-section">
              <div className="make-header">
                <h2>{make}</h2>
                <span className="make-count">{makeDossiers.length} docs</span>
              </div>

              <div className="dossier-grid">
                {makeDossiers.map((dossier) => (
                  <div
                    key={dossier.id}
                    className="dossier-card"
                  >
                    <div className="card-header">
                      <h3 className="card-title">
                        {dossier.title}
                      </h3>
                      <div className="card-meta">
                        <span className="section-count">
                          {dossier.sections.length} sections
                        </span>
                        {formatYearRange(dossier.years) && (
                          <span className="year-range">
                            {formatYearRange(dossier.years)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="card-tags">
                      {dossier.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="tag topic">
                          {topic}
                        </span>
                      ))}
                      {dossier.platforms.slice(0, 2).map((platform) => (
                        <span key={platform} className="tag platform">
                          {platform}
                        </span>
                      ))}
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => openDossier(dossier)}
                      >
                        Open
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDossier(
                            expandedDossier === dossier.id ? null : dossier.id
                          );
                        }}
                      >
                        {expandedDossier === dossier.id ? 'Hide' : 'Sections'}
                      </button>
                    </div>

                    {expandedDossier === dossier.id && (
                      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
                        {dossier.sections.slice(0, 5).map((section, i) => (
                          <div key={i} style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: '#aaa' }}>{section.heading}</strong>
                            <p style={{ margin: '0.25rem 0', opacity: 0.7 }}>
                              {section.preview.slice(0, 100)}...
                            </p>
                          </div>
                        ))}
                        {dossier.sections.length > 5 && (
                          <p style={{ fontStyle: 'italic' }}>
                            +{dossier.sections.length - 5} more sections...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

        </>
      )}

      {/* Upgrade Modal — shown when non-Pro user hits the open limit */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div style={{ maxWidth: '420px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <UpgradePrompt
              itemType="dossiers"
              message="You've previewed 3 free dossiers"
              remainingCount={filteredDossiers.length - FREE_OPEN_LIMIT}
            />
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#333',
                border: 'none',
                borderRadius: '8px',
                color: '#888',
                cursor: 'pointer'
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
