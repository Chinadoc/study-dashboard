/**
 * Google Drive Integration Module
 * Fetches and displays walkthrough files from a private Google Drive folder
 * Also supports local walkthrough files in /assets/walkthroughs/
 */

const GDrive = {
    API_BASE: window.location.hostname === 'localhost'
        ? 'http://localhost:8787'
        : 'https://euro-keys.jeremy-samuels17.workers.dev',

    cachedFiles: null,
    currentFileId: null,

    // Local walkthroughs that don't require Google Drive
    localWalkthroughs: [
        {
            id: 'local_vw_jetta_peps_akl',
            name: '2014 VW Jetta PEPS/KESSY - All Keys Lost',
            path: '/assets/walkthroughs/vw_jetta_peps_akl.html',
            mimeType: 'text/html',
            modifiedTime: '2026-01-21T00:00:00Z',
            size: null,
            isLocal: true,
            tags: ['VW', 'Jetta', 'PEPS', 'KESSY', 'AKL', 'NEC+24C64', 'Bench']
        }
    ],

    /**
     * Initialize the Drive module
     */
    init() {
        this.bindEvents();
        console.log('GDrive: Module initialized');
    },

    /**
     * Bind UI events
     */
    bindEvents() {
        // Listen for walkthroughs tab click
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-tab="walkthroughs"]') || e.target.closest('[data-tab="walkthroughs"]')) {
                this.loadWalkthroughs();
            }
        });

        // Close viewer on backdrop click
        const viewer = document.getElementById('walkthroughViewer');
        if (viewer) {
            viewer.addEventListener('click', (e) => {
                if (e.target === viewer) {
                    this.closeViewer();
                }
            });
        }
    },

    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
        const token = localStorage.getItem('session_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    /**
     * Load walkthroughs list from Drive and local files
     */
    async loadWalkthroughs(folderId = null) {
        const container = document.getElementById('walkthroughsList');
        if (!container) {
            console.warn('GDrive: walkthroughsList container not found');
            return;
        }

        container.innerHTML = `
            <div class="walkthroughs-loading">
                <div class="spinner"></div>
                <p>Loading walkthroughs...</p>
            </div>
        `;

        let driveFiles = [];

        try {
            const url = folderId
                ? `${this.API_BASE}/api/drive/files?folderId=${encodeURIComponent(folderId)}`
                : `${this.API_BASE}/api/drive/files`;

            const res = await fetch(url, {
                headers: this.getAuthHeaders()
            });

            if (res.ok) {
                const data = await res.json();
                driveFiles = data.files || [];
            } else {
                console.warn('GDrive: Could not load Drive files, showing local only');
            }
        } catch (err) {
            console.warn('GDrive: Error loading Drive files:', err.message);
        }

        // Merge local walkthroughs with Drive files (local first)
        this.cachedFiles = [...this.localWalkthroughs, ...driveFiles];
        this.renderFileList(this.cachedFiles);
    },

    /**
     * Render the file list as cards
     */
    renderFileList(files) {
        const container = document.getElementById('walkthroughsList');
        if (!container) return;

        if (!files || files.length === 0) {
            container.innerHTML = `
                <div class="walkthroughs-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No walkthroughs found</p>
                    <small>Add HTML or ZIP files to your configured Google Drive folder</small>
                </div>
            `;
            return;
        }

        container.innerHTML = files.map(file => {
            const isLocal = file.isLocal || false;
            const clickHandler = isLocal
                ? `GDrive.openLocalFile('${file.path}')`
                : `GDrive.openFile('${file.id}')`;
            const badgeHtml = isLocal
                ? '<span class="walkthrough-badge local">📚 Research</span>'
                : '';

            return `
            <div class="walkthrough-card" onclick="${clickHandler}" data-file-id="${file.id}">
                <div class="walkthrough-icon">
                    ${file.mimeType.includes('zip') ? '<i class="fas fa-file-archive"></i>' : '<i class="fas fa-file-alt"></i>'}
                </div>
                <div class="walkthrough-info">
                    <h3 class="walkthrough-title">${this.formatFileName(file.name)}</h3>
                    ${badgeHtml}
                    <div class="walkthrough-meta">
                        <span><i class="fas fa-clock"></i> ${this.formatDate(file.modifiedTime)}</span>
                        ${file.size ? `<span><i class="fas fa-file"></i> ${this.formatSize(file.size)}</span>` : ''}
                    </div>
                </div>
                <div class="walkthrough-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
        }).join('');
    },

    /**
     * Open a local walkthrough file
     */
    async openLocalFile(path) {
        const viewer = document.getElementById('walkthroughViewer');
        const content = document.getElementById('walkthroughContent');

        if (!viewer || !content) {
            console.error('GDrive: Viewer elements not found');
            return;
        }

        viewer.classList.add('active');
        content.innerHTML = `
            <div class="walkthroughs-loading">
                <div class="spinner"></div>
                <p>Loading walkthrough...</p>
            </div>
        `;

        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error('Failed to load local file');

            const html = await res.text();

            // Extract just the body content if it's a full HTML document
            let bodyContent = html;
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (bodyMatch) {
                bodyContent = bodyMatch[1];
            }

            // Extract and apply styles from the document
            const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            if (styleMatch) {
                const styleContent = styleMatch.join('\n');
                // Create a scoped style element
                bodyContent = `<style>${styleMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n')}</style>${bodyContent}`;
            }

            // Update title from the file
            const titleEl = document.getElementById('walkthroughTitle');
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            if (titleEl && titleMatch) {
                titleEl.textContent = titleMatch[1];
            }

            content.innerHTML = this.sanitizeHtml(bodyContent);
            this.fixContentLinks(content);

        } catch (err) {
            console.error('GDrive: Error loading local file:', err);
            content.innerHTML = `
                <div class="walkthroughs-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${err.message}</p>
                    <button onclick="GDrive.closeViewer()" class="btn btn-secondary">Close</button>
                </div>
            `;
        }
    },

    /**
     * Open and display a file from Google Drive
     */
    async openFile(fileId) {
        this.currentFileId = fileId;

        // Show loading state
        const viewer = document.getElementById('walkthroughViewer');
        const content = document.getElementById('walkthroughContent');

        if (!viewer || !content) {
            console.error('GDrive: Viewer elements not found');
            return;
        }

        viewer.classList.add('active');
        content.innerHTML = `
            <div class="walkthroughs-loading">
                <div class="spinner"></div>
                <p>Loading walkthrough...</p>
            </div>
        `;

        try {
            const res = await fetch(`${this.API_BASE}/api/drive/file/${fileId}`, {
                headers: this.getAuthHeaders()
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to load file');
            }

            const data = await res.json();

            // Update title
            const titleEl = document.getElementById('walkthroughTitle');
            if (titleEl) {
                titleEl.textContent = this.formatFileName(data.name);
            }

            // Handle ZIP files (base64 encoded)
            if (data.encoding === 'base64') {
                content.innerHTML = await this.extractZipContent(data.content, data.name);
            } else {
                // HTML content - sanitize and display
                content.innerHTML = this.sanitizeHtml(data.content);
            }

            // Fix relative links in content
            this.fixContentLinks(content);

        } catch (err) {
            console.error('GDrive: Error loading file:', err);
            content.innerHTML = `
                <div class="walkthroughs-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${err.message}</p>
                    <button onclick="GDrive.closeViewer()" class="btn btn-secondary">Close</button>
                </div>
            `;
        }
    },

    /**
     * Extract and display content from a ZIP file
     */
    async extractZipContent(base64Content, fileName) {
        // For now, show a message that ZIP extraction requires JSZip
        // In a full implementation, we'd use JSZip library
        return `
            <div class="zip-preview">
                <i class="fas fa-file-archive fa-3x"></i>
                <h3>${this.formatFileName(fileName)}</h3>
                <p>ZIP file preview</p>
                <p class="text-muted">Download to view the full walkthrough content</p>
                <a href="data:application/zip;base64,${base64Content}" 
                   download="${fileName}" 
                   class="btn btn-primary">
                    <i class="fas fa-download"></i> Download ZIP
                </a>
            </div>
        `;
    },

    /**
     * Sanitize HTML content for safe display
     */
    sanitizeHtml(html) {
        // Remove potentially dangerous elements but keep structure
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Remove scripts
        temp.querySelectorAll('script').forEach(el => el.remove());

        // Remove event handlers
        temp.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        return temp.innerHTML;
    },

    /**
     * Fix relative links in loaded content
     */
    fixContentLinks(container) {
        // Open external links in new tab
        container.querySelectorAll('a[href^="http"]').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    },

    /**
     * Close the viewer
     */
    closeViewer() {
        const viewer = document.getElementById('walkthroughViewer');
        if (viewer) {
            viewer.classList.remove('active');
        }
        this.currentFileId = null;
    },

    /**
     * Format file name for display (remove extension, clean up)
     */
    formatFileName(name) {
        return name
            .replace(/\.(html|htm|zip)$/i, '')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ');
    },

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    },

    /**
     * Format file size for display
     */
    formatSize(bytes) {
        if (!bytes) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GDrive.init());
} else {
    GDrive.init();
}

// Expose globally
window.GDrive = GDrive;
