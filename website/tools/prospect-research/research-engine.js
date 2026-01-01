/**
 * ResearchEngine - API communication layer for prospect research
 * Handles communication with the bridge server
 */
class ResearchEngine {
    constructor(serverUrl = 'http://localhost:3847') {
        this.serverUrl = serverUrl;
        this.currentJobId = null;
        this.eventSource = null;
    }

    /**
     * Sanitize domain for use in URLs
     */
    sanitizeDomain(domain) {
        return domain.replace(/\./g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    }

    /**
     * Validate domain format
     */
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain.trim());
    }

    /**
     * Check if the bridge server is running
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.serverUrl}/api/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Start a new research job
     * @param {string} domain - The domain to research
     * @returns {Promise<{jobId: string, status: string, domain: string}>}
     */
    async startResearch(domain) {
        const response = await fetch(`${this.serverUrl}/api/research`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ domain: domain.trim() })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start research');
        }

        const data = await response.json();
        this.currentJobId = data.jobId;
        return data;
    }

    /**
     * Connect to the SSE stream for job progress
     * @param {string} jobId - The job ID to stream
     * @param {Object} callbacks - Callback functions
     * @param {Function} callbacks.onInit - Called with initial state
     * @param {Function} callbacks.onPhase - Called when phase changes
     * @param {Function} callbacks.onLog - Called for log messages
     * @param {Function} callbacks.onComplete - Called when research completes
     * @param {Function} callbacks.onError - Called on errors
     */
    connectToStream(jobId, callbacks) {
        // Close existing connection if any
        this.disconnect();

        const url = `${this.serverUrl}/api/research/stream?jobId=${encodeURIComponent(jobId)}`;
        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'init':
                        if (callbacks.onInit) {
                            callbacks.onInit(data);
                        }
                        break;

                    case 'phase':
                        if (callbacks.onPhase) {
                            callbacks.onPhase(data.phase, data.status, data.phases);
                        }
                        break;

                    case 'log':
                        if (callbacks.onLog) {
                            callbacks.onLog(data.text);
                        }
                        break;

                    case 'complete':
                        if (callbacks.onComplete) {
                            callbacks.onComplete(data);
                        }
                        this.disconnect();
                        break;

                    case 'error':
                        if (callbacks.onError) {
                            callbacks.onError(data.text);
                        }
                        break;
                }
            } catch (err) {
                console.error('Error parsing SSE message:', err);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            if (callbacks.onError) {
                callbacks.onError('Connection to research server lost');
            }
            this.disconnect();
        };
    }

    /**
     * Get job status
     * @param {string} jobId - The job ID
     * @returns {Promise<Object>}
     */
    async getStatus(jobId) {
        const response = await fetch(
            `${this.serverUrl}/api/research/status?jobId=${encodeURIComponent(jobId)}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get status');
        }

        return response.json();
    }

    /**
     * Get the PDF URL for a domain
     * @param {string} domain - The original domain
     * @returns {string}
     */
    getPDFUrl(domain) {
        return `${this.serverUrl}/api/pdf/${encodeURIComponent(domain)}`;
    }

    /**
     * Get the markdown report URL for a domain
     * @param {string} domain - The original domain
     * @returns {string}
     */
    getReportUrl(domain) {
        return `${this.serverUrl}/api/report/${encodeURIComponent(domain)}`;
    }

    /**
     * Get all files for a domain
     * @param {string} domain - The original domain
     * @returns {Promise<{domain: string, files: string[]}>}
     */
    async getFiles(domain) {
        const response = await fetch(
            `${this.serverUrl}/api/files/${encodeURIComponent(domain)}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get files');
        }

        return response.json();
    }

    /**
     * Disconnect from the SSE stream
     */
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    /**
     * Format duration in human-readable format
     * @param {number} ms - Duration in milliseconds
     * @returns {string}
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    }

    // =========================================================================
    // BATCH PROCESSING METHODS
    // =========================================================================

    /**
     * Create a new batch of research jobs
     * @param {string[]} domains - Array of domains to research
     * @param {Object} options - Batch options
     * @returns {Promise<Object>}
     */
    async createBatch(domains, options = {}) {
        const response = await fetch(`${this.serverUrl}/api/batch/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains, options })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create batch');
        }

        return response.json();
    }

    /**
     * Get batch status
     * @param {string} batchId - The batch ID
     * @returns {Promise<Object>}
     */
    async getBatchStatus(batchId) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/status`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get batch status');
        }

        return response.json();
    }

    /**
     * Connect to batch SSE stream
     * @param {string} batchId - The batch ID
     * @param {Object} callbacks - Callback functions
     */
    connectToBatchStream(batchId, callbacks) {
        this.disconnect();

        const url = `${this.serverUrl}/api/batch/${batchId}/stream`;
        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'init':
                        if (callbacks.onInit) callbacks.onInit(data);
                        break;
                    case 'job:start':
                        if (callbacks.onJobStart) callbacks.onJobStart(data);
                        break;
                    case 'job:phase':
                        if (callbacks.onJobPhase) callbacks.onJobPhase(data);
                        break;
                    case 'job:complete':
                        if (callbacks.onJobComplete) callbacks.onJobComplete(data);
                        break;
                    case 'job:failed':
                        if (callbacks.onJobFailed) callbacks.onJobFailed(data);
                        break;
                    case 'batch:complete':
                        if (callbacks.onBatchComplete) callbacks.onBatchComplete(data);
                        this.disconnect();
                        break;
                }
            } catch (err) {
                console.error('Error parsing batch SSE message:', err);
            }
        };

        this.eventSource.onerror = () => {
            if (callbacks.onError) {
                callbacks.onError('Connection to batch stream lost');
            }
        };
    }

    /**
     * Pause a batch
     * @param {string} batchId - The batch ID
     */
    async pauseBatch(batchId) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/pause`, {
            method: 'POST'
        });
        return response.json();
    }

    /**
     * Resume a batch
     * @param {string} batchId - The batch ID
     */
    async resumeBatch(batchId) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/resume`, {
            method: 'POST'
        });
        return response.json();
    }

    /**
     * Retry failed jobs in a batch
     * @param {string} batchId - The batch ID
     */
    async retryBatch(batchId) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/retry`, {
            method: 'POST'
        });
        return response.json();
    }

    /**
     * Cancel a batch
     * @param {string} batchId - The batch ID
     */
    async cancelBatch(batchId) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/cancel`, {
            method: 'POST'
        });
        return response.json();
    }

    /**
     * Get batch results
     * @param {string} batchId - The batch ID
     */
    async getBatchResults(batchId) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/results`);
        return response.json();
    }

    /**
     * List all batches
     */
    async listBatches() {
        const response = await fetch(`${this.serverUrl}/api/batches`);
        return response.json();
    }

    /**
     * Export batch results
     * @param {string} batchId - The batch ID
     * @param {string} format - Export format (csv, hubspot, salesforce)
     * @param {Object} options - Export options
     */
    async exportBatch(batchId, format = 'csv', options = {}) {
        const response = await fetch(`${this.serverUrl}/api/batch/${batchId}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format, options })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Export failed');
        }

        // Return blob for download
        return response.blob();
    }

    /**
     * Export specific domains
     * @param {string[]} domains - Domains to export
     * @param {string} format - Export format
     * @param {Object} options - Export options
     */
    async exportDomains(domains, format = 'csv', options = {}) {
        const response = await fetch(`${this.serverUrl}/api/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains, format, options })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Export failed');
        }

        return response.blob();
    }

    /**
     * Get available export formats
     */
    async getExportFormats() {
        const response = await fetch(`${this.serverUrl}/api/export/formats`);
        return response.json();
    }

    /**
     * Compare multiple companies
     * @param {string[]} domains - Domains to compare
     */
    async compareCompanies(domains) {
        const response = await fetch(
            `${this.serverUrl}/api/compare?domains=${encodeURIComponent(domains.join(','))}`
        );
        return response.json();
    }

    /**
     * List all researched prospects
     */
    async listProspects() {
        const response = await fetch(`${this.serverUrl}/api/prospects`);
        return response.json();
    }

    /**
     * Get research data JSON for a domain
     * @param {string} domain - The domain
     */
    async getResearchData(domain) {
        const response = await fetch(`${this.serverUrl}/api/data/${encodeURIComponent(domain)}`);
        if (!response.ok) {
            throw new Error('Research data not found');
        }
        return response.json();
    }

    /**
     * Parse domains from text input
     * @param {string} text - Text containing domains (newline or comma separated)
     * @returns {string[]} - Array of valid domains
     */
    parseDomainsFromText(text) {
        return text
            .split(/[\n,]+/)
            .map(d => d.trim().toLowerCase())
            .filter(d => d && this.isValidDomain(d));
    }

    /**
     * Parse domains from CSV file content
     * @param {string} csvContent - CSV file content
     * @returns {string[]} - Array of valid domains
     */
    parseDomainsFromCSV(csvContent) {
        const lines = csvContent.split('\n');
        const domains = [];

        // Try to find domain column
        const header = lines[0]?.toLowerCase() || '';
        let domainIndex = 0;

        if (header.includes(',')) {
            const cols = header.split(',').map(c => c.trim());
            domainIndex = cols.findIndex(c =>
                c === 'domain' || c === 'website' || c === 'url' || c === 'company_domain'
            );
            if (domainIndex === -1) domainIndex = 0;
        }

        // Extract domains from each line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            let value;
            if (line.includes(',')) {
                const cols = line.split(',');
                value = cols[domainIndex]?.trim().replace(/"/g, '');
            } else {
                value = line;
            }

            // Clean up domain
            if (value) {
                value = value.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
                if (this.isValidDomain(value)) {
                    domains.push(value);
                }
            }
        }

        return [...new Set(domains)]; // Dedupe
    }
}

// Export for use in app.js
window.ResearchEngine = ResearchEngine;
