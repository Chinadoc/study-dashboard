'use client';

import { useState, useMemo, useEffect } from 'react';
import imageManifest from '@/public/data/image_gallery_manifest.json';
import { useAuth } from '@/contexts/AuthContext';
import UpgradePrompt from '@/components/UpgradePrompt';

const FREE_IMAGE_LIMIT = 10;

interface GalleryImage {
  filename: string;
  path: string;
  context: string;
  type: string;
  source_doc: string;
  tags: string[];
  id: string;
}

const MAKE_TAGS = [
  'Acura', 'Alfa', 'Bmw', 'Cadillac', 'Dodge', 'Ford', 'Genesis', 'Gmc',
  'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lexus', 'Mazda',
  'Mercedes', 'Nissan', 'Ram', 'Rivian', 'Stellantis', 'Subaru', 'Tesla',
  'Toyota', 'Volvo', 'Vw'
];

const TOPIC_TAGS = [
  'AKL', 'CHIP', 'ECU', 'PATS', 'Programming', 'SGW', 'Security', 'Smart Key'
];

const YEAR_TAGS = [
  '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'
];

export default function ImageGalleryClient() {
  const { isPro } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSourceImages, setCurrentSourceImages] = useState<GalleryImage[]>([]);

  // Touch handling for swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Navigate to next/previous image
  const navigateImage = (direction: number) => {
    if (currentSourceImages.length <= 1) return;
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < currentSourceImages.length) {
      // Check if target image is locked for non-pro users
      const images = (imageManifest as { images: GalleryImage[] }).images;
      const filteredImgs = images.filter((image) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesDoc = image.source_doc.toLowerCase().includes(query);
          const matchesTags = image.tags.some((t) => t.toLowerCase().includes(query));
          const matchesId = image.id.toLowerCase().includes(query);
          if (!matchesDoc && !matchesTags && !matchesId) return false;
        }
        if (selectedTags.length > 0) {
          const hasMatchingTag = selectedTags.some((tag) =>
            image.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
          );
          if (!hasMatchingTag) return false;
        }
        return true;
      });

      const targetImage = currentSourceImages[newIndex];
      const globalIdx = filteredImgs.indexOf(targetImage);
      const isLocked = !isPro && globalIdx >= FREE_IMAGE_LIMIT;

      if (!isLocked) {
        setCurrentImageIndex(newIndex);
        setSelectedImage(targetImage);
      }
    }
  };

  // Open image in lightbox with navigation context
  const openImageInLightbox = (image: GalleryImage, sourceImages: GalleryImage[]) => {
    const index = sourceImages.indexOf(image);
    setCurrentSourceImages(sourceImages);
    setCurrentImageIndex(index >= 0 ? index : 0);
    setSelectedImage(image);
  };

  // Handle touch events for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateImage(1); // Next image
    } else if (isRightSwipe) {
      navigateImage(-1); // Previous image
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Close lightbox with Escape key, navigate with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateImage(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateImage(1);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentImageIndex, currentSourceImages]);

  const images = (imageManifest as { images: GalleryImage[] }).images;

  // Filter images based on search and tags
  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDoc = image.source_doc.toLowerCase().includes(query);
        const matchesTags = image.tags.some((t) => t.toLowerCase().includes(query));
        const matchesId = image.id.toLowerCase().includes(query);
        if (!matchesDoc && !matchesTags && !matchesId) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          image.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [images, searchQuery, selectedTags]);

  // Get unique source documents for grouping
  const groupedBySource = useMemo(() => {
    const groups: Record<string, GalleryImage[]> = {};
    filteredImages.forEach((image) => {
      const source = image.source_doc.replace('.html', '');
      if (!groups[source]) groups[source] = [];
      groups[source].push(image);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredImages]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Build image URL from R2 via Worker proxy
  const getImageUrl = (image: GalleryImage) => {
    // Images are served from R2 via the Worker API proxy
    const R2_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev/api/r2';

    // Encode each path segment separately to preserve slashes
    const encodedPath = image.path.split('/').map(encodeURIComponent).join('/');
    return `${R2_BASE}/${encodedPath}`;
  };

  return (
    <div className="image-gallery">
      <style jsx>{`
        .image-gallery {
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
          color: #f59e0b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: flex-start;
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

        .tag-groups {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tag-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .tag-group-label {
          font-size: 0.75rem;
          color: #666;
          width: 60px;
        }

        .tag-chip {
          padding: 0.375rem 0.75rem;
          border-radius: 16px;
          border: 1px solid #444;
          background: transparent;
          color: #aaa;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.8rem;
        }

        .tag-chip:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .tag-chip.active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #000;
        }

        .source-section {
          margin-bottom: 2rem;
        }

        .source-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #333;
        }

        .source-header h2 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #f59e0b;
        }

        .source-count {
          background: #333;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #888;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .image-card {
          background: linear-gradient(145deg, #1e1e32 0%, #252540 100%);
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }

        .image-card:hover {
          border-color: #f59e0b;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.15);
        }

        .image-preview {
          width: 100%;
          height: 140px;
          object-fit: cover;
          background: #0f0f1a;
        }

        .image-info {
          padding: 0.75rem;
        }

        .image-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .image-tag {
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-size: 0.65rem;
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .lightbox-content {
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 80vh;
          border-radius: 8px;
        }

        .lightbox-info {
          margin-top: 1rem;
          text-align: center;
        }

        .lightbox-source {
          font-size: 1rem;
          color: #f59e0b;
          margin-bottom: 0.5rem;
        }

        .lightbox-tags {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .lightbox-close {
          position: absolute;
          top: -2rem;
          right: 0;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 2rem;
          cursor: pointer;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .lightbox-close:hover {
          background: rgba(255,255,255,0.2);
        }

        .lightbox-hint {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem;
          pointer-events: none;
        }

        /* Navigation Arrows */
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 2.5rem;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 1001;
        }

        .lightbox-nav:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-50%) scale(1.1);
        }

        .lightbox-nav-prev {
          left: 1.5rem;
        }

        .lightbox-nav-next {
          right: 1.5rem;
        }

        /* Image Counter */
        .lightbox-counter {
          position: absolute;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 1001;
        }

        /* Mobile adjustments for lightbox */
        @media (max-width: 768px) {
          .lightbox-nav {
            width: 44px;
            height: 44px;
            font-size: 1.8rem;
          }

          .lightbox-nav-prev {
            left: 0.5rem;
          }

          .lightbox-nav-next {
            right: 0.5rem;
          }

          .lightbox-counter {
            top: 1rem;
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid #444;
          background: transparent;
          color: #aaa;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .btn-secondary:hover {
          border-color: #666;
          color: #fff;
        }
      `}</style>

      <div className="header">
        <h1>📷 Image Gallery</h1>
        <p className="subtitle">Technical diagrams and reference images from dossiers</p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{filteredImages.length}</div>
          <div className="stat-label">Images</div>
        </div>
        <div className="stat">
          <div className="stat-value">{groupedBySource.length}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat">
          <div className="stat-value">{selectedTags.length}</div>
          <div className="stat-label">Filters Active</div>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-bar"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="tag-groups">
          <div className="tag-group">
            <span className="tag-group-label">Makes:</span>
            {MAKE_TAGS.slice(0, 12).map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="tag-group">
            <span className="tag-group-label">Topics:</span>
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="tag-group">
            <span className="tag-group-label">Years:</span>
            {YEAR_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="no-results">
          <p>No images match your filters.</p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedTags([]);
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        groupedBySource.map(([source, sourceImages]) => {
          return (
            <div key={source} className="source-section">
              <div className="source-header">
                <h2>{source}</h2>
                <span className="source-count">{sourceImages.length} images</span>
              </div>

              <div className="image-grid">
                {sourceImages.map((image, idx) => {
                  // Calculate global index for gating
                  const globalIdx = filteredImages.indexOf(image);
                  const isLocked = !isPro && globalIdx >= FREE_IMAGE_LIMIT;

                  return (
                    <div
                      key={image.id}
                      className="image-card"
                      onClick={() => isLocked ? setShowUpgradeModal(true) : openImageInLightbox(image, sourceImages)}
                      style={isLocked ? {
                        opacity: 0.4,
                        filter: 'blur(3px)',
                        cursor: 'pointer',
                        position: 'relative'
                      } : {}}
                    >
                      {isLocked && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10,
                          fontSize: '2rem',
                          filter: 'none'
                        }}>
                          🔒
                        </div>
                      )}
                      <img
                        src={getImageUrl(image)}
                        alt={image.id}
                        className="image-preview"
                        loading="lazy"
                      />
                      <div className="image-info">
                        <div className="image-tags">
                          {image.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="image-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Show upgrade prompt if there are more images than free limit */}
      {!isPro && filteredImages.length > FREE_IMAGE_LIMIT && (
        <div style={{ marginTop: '2rem' }}>
          <UpgradePrompt
            itemType="images"
            remainingCount={filteredImages.length - FREE_IMAGE_LIMIT}
          />
        </div>
      )}

      {/* Lightbox with navigation - swipe or use arrows */}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Image counter */}
          {currentSourceImages.length > 1 && (
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {currentSourceImages.length}
            </div>
          )}

          {/* Navigation hint */}
          <div className="lightbox-hint">
            {currentSourceImages.length > 1
              ? 'Swipe or use ← → to navigate • ESC to close'
              : 'Click anywhere or press ESC to close'}
          </div>

          {/* Previous arrow */}
          {currentSourceImages.length > 1 && currentImageIndex > 0 && (
            <button
              className="lightbox-nav lightbox-nav-prev"
              onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Next arrow */}
          {currentSourceImages.length > 1 && currentImageIndex < currentSourceImages.length - 1 && (
            <button
              className="lightbox-nav lightbox-nav-next"
              onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)} title="Close (ESC)">
              ×
            </button>
            <img
              src={getImageUrl(selectedImage)}
              alt={selectedImage.id}
              className="lightbox-image"
            />
            <div className="lightbox-info">
              <div className="lightbox-source">{selectedImage.source_doc.replace('.html', '')}</div>
              <div className="lightbox-tags">
                {selectedImage.tags.map((tag) => (
                  <span key={tag} className="image-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="upgrade-modal-overlay"
          onClick={() => setShowUpgradeModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <UpgradePrompt
              itemType="images"
              message="Unlock All Technical Images"
            />
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#888',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
