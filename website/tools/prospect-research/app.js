/**
 * ProspectResearchApp - Main UI controller for prospect research tool
 * Supports both single and batch research modes
 */

// Security: HTML escape helper to prevent XSS
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// Escape for HTML attribute values (handles quotes)
function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

class ProspectResearchApp {
    constructor() {
        this.engine = new ResearchEngine();
        this.currentDomain = null;
        this.currentJobId = null;
        this.startTime = null;

        // Batch mode state
        this.mode = 'single'; // 'single' or 'batch'
        this.batchDomains = [];
        this.currentBatchId = null;
        this.batchResults = [];
        this.batchStartTime = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.bindElements();
        this.bindEvents();

        // Check if bridge server is running
        const isHealthy = await this.engine.checkHealth();
        if (!isHealthy) {
            this.showServerError();
        }
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        // Mode switcher
        this.modeTabs = document.querySelectorAll('.mode-btn');

        // Sections - Single mode
        this.inputSection = document.getElementById('research-input');
        this.progressSection = document.getElementById('research-progress');
        this.resultsSection = document.getElementById('research-results');
        this.errorSection = document.getElementById('research-error');

        // Sections - Batch mode
        this.batchInputSection = document.getElementById('batch-input');
        this.batchProgressSection = document.getElementById('batch-progress');
        this.batchResultsSection = document.getElementById('batch-results');

        // Input elements - Single
        this.domainInput = document.getElementById('domain-input');
        this.startButton = document.getElementById('start-research');
        this.inputStatus = document.getElementById('input-status');

        // Input elements - Batch (matching actual HTML IDs)
        this.batchTextarea = document.getElementById('domains-textarea');
        this.csvUploadArea = document.getElementById('csv-dropzone');
        this.csvFileInput = document.getElementById('csv-file-input');
        this.csvFileInfo = document.getElementById('csv-file-info');
        this.csvFileName = document.getElementById('csv-file-name');
        this.removeCsvBtn = document.getElementById('remove-csv');
        this.batchPreview = document.getElementById('domain-preview');
        this.batchDomainCount = document.getElementById('domain-count');
        this.domainTags = document.getElementById('domain-list');
        this.clearBatchBtn = document.getElementById('clear-domains');
        this.startBatchBtn = document.getElementById('start-batch');
        this.batchStatus = document.getElementById('batch-status');
        this.batchMethodTabs = document.querySelectorAll('.method-tab');
        this.batchConcurrency = document.getElementById('batch-concurrency');

        // Progress elements - Single
        this.researchDomainSpan = document.getElementById('research-domain');
        this.progressStatus = document.getElementById('progress-status');
        this.streamContent = document.getElementById('stream-content');
        this.toggleStreamBtn = document.getElementById('toggle-stream');
        this.outputStream = document.querySelector('.output-stream');
        this.cancelBtn = document.getElementById('cancel-research');

        // Progress elements - Batch (matching actual HTML IDs)
        this.batchStatCompleted = document.getElementById('stat-completed');
        this.batchStatRunning = document.getElementById('stat-running');
        this.batchStatPending = document.getElementById('stat-pending');
        this.batchStatFailed = document.getElementById('stat-failed');
        this.batchProgressBar = document.getElementById('batch-progress-fill');
        this.batchProgressText = document.getElementById('batch-progress-text');
        this.pauseBatchBtn = document.getElementById('pause-batch');
        this.resumeBatchBtn = document.getElementById('resume-batch');
        this.cancelBatchBtn = document.getElementById('cancel-batch');
        this.batchJobsList = document.getElementById('batch-jobs-grid');

        // Results elements - Single
        this.resultDomainSpan = document.getElementById('result-domain');
        this.resultTimeSpan = document.getElementById('result-time');
        this.viewPdfBtn = document.getElementById('view-pdf');
        this.downloadPdfBtn = document.getElementById('download-pdf');
        this.viewMarkdownBtn = document.getElementById('view-markdown');
        this.newResearchBtn = document.getElementById('new-research');
        this.pdfPreviewContainer = document.getElementById('pdf-preview-container');
        this.pdfIframe = document.getElementById('pdf-iframe');
        this.closePreviewBtn = document.getElementById('close-preview');

        // Results elements - Batch (matching actual HTML IDs)
        this.finalCompleted = document.getElementById('final-completed');
        this.finalFailed = document.getElementById('final-failed');
        this.exportCsvBtn = document.getElementById('export-csv');
        this.exportHubspotBtn = document.getElementById('export-hubspot');
        this.exportSalesforceBtn = document.getElementById('export-salesforce');
        this.retryFailedBatchBtn = document.getElementById('retry-failed-batch');
        this.resultCardsContainer = document.getElementById('batch-results-list');
        this.newBatchBtn = document.getElementById('new-batch');

        // Error elements
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-research');

        // Comparison elements
        this.comparisonSection = document.getElementById('comparison-view');
        this.openCompareBtn = document.getElementById('open-compare');
        this.backToResultsBtn = document.getElementById('back-to-results');
        this.exportComparisonBtn = document.getElementById('export-comparison');
        this.companyCheckboxes = document.getElementById('company-checkboxes');
        this.comparisonThead = document.getElementById('comparison-thead');
        this.comparisonTbody = document.getElementById('comparison-tbody');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mode switcher
        this.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });

        // Input events - Single
        this.startButton.addEventListener('click', () => this.startResearch());
        this.domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startResearch();
        });
        this.domainInput.addEventListener('input', () => {
            this.inputStatus.textContent = '';
            this.inputStatus.className = 'input-status';
        });

        // Batch method tab switching
        this.batchMethodTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchBatchMethod(tab.dataset.method));
        });

        // Input events - Batch
        if (this.batchTextarea) {
            this.batchTextarea.addEventListener('input', () => this.parseBatchDomains());
        }
        if (this.csvUploadArea) {
            this.csvUploadArea.addEventListener('click', () => this.csvFileInput?.click());
            this.csvUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.csvUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.csvUploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
        if (this.csvFileInput) {
            this.csvFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        if (this.removeCsvBtn) {
            this.removeCsvBtn.addEventListener('click', () => this.removeCSV());
        }
        if (this.clearBatchBtn) {
            this.clearBatchBtn.addEventListener('click', () => this.clearBatch());
        }
        if (this.startBatchBtn) {
            this.startBatchBtn.addEventListener('click', () => this.startBatch());
        }

        // Progress events - Single
        this.toggleStreamBtn?.addEventListener('click', () => this.toggleStream());
        this.cancelBtn?.addEventListener('click', () => this.cancelResearch());

        // Progress events - Batch
        if (this.pauseBatchBtn) {
            this.pauseBatchBtn.addEventListener('click', () => this.pauseBatch());
        }
        if (this.resumeBatchBtn) {
            this.resumeBatchBtn.addEventListener('click', () => this.resumeBatch());
        }
        if (this.retryFailedBatchBtn) {
            this.retryFailedBatchBtn.addEventListener('click', () => this.retryBatch());
        }
        if (this.cancelBatchBtn) {
            this.cancelBatchBtn.addEventListener('click', () => this.cancelBatch());
        }

        // Results events - Single
        this.viewPdfBtn?.addEventListener('click', () => this.viewPDF());
        this.downloadPdfBtn?.addEventListener('click', () => this.downloadPDF());
        this.viewMarkdownBtn?.addEventListener('click', () => this.viewMarkdown());
        this.newResearchBtn?.addEventListener('click', () => this.resetToInput());
        this.closePreviewBtn?.addEventListener('click', () => this.closePreview());

        // Results events - Batch
        if (this.exportCsvBtn) {
            this.exportCsvBtn.addEventListener('click', () => this.exportBatch('csv'));
        }
        if (this.exportHubspotBtn) {
            this.exportHubspotBtn.addEventListener('click', () => this.exportBatch('hubspot'));
        }
        if (this.exportSalesforceBtn) {
            this.exportSalesforceBtn.addEventListener('click', () => this.exportBatch('salesforce'));
        }
        if (this.newBatchBtn) {
            this.newBatchBtn.addEventListener('click', () => this.resetToBatchInput());
        }

        // Error events
        this.retryBtn?.addEventListener('click', () => this.resetToInput());

        // Comparison events
        if (this.openCompareBtn) {
            this.openCompareBtn.addEventListener('click', () => this.openComparison());
        }
        if (this.backToResultsBtn) {
            this.backToResultsBtn.addEventListener('click', () => this.closeComparison());
        }
        if (this.exportComparisonBtn) {
            this.exportComparisonBtn.addEventListener('click', () => this.exportComparison());
        }
    }

    /**
     * Switch between paste and CSV batch methods
     */
    switchBatchMethod(method) {
        // Update tab states
        this.batchMethodTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.method === method);
        });

        // Show/hide content
        const pasteContent = document.querySelector('.paste-content');
        const csvContent = document.querySelector('.csv-content');

        if (method === 'paste') {
            pasteContent?.classList.add('active');
            csvContent?.classList.remove('active');
        } else {
            pasteContent?.classList.remove('active');
            csvContent?.classList.add('active');
        }
    }

    /**
     * Remove uploaded CSV file
     */
    removeCSV() {
        if (this.csvFileInput) this.csvFileInput.value = '';
        if (this.csvFileInfo) this.csvFileInfo.style.display = 'none';
        if (this.csvUploadArea) this.csvUploadArea.style.display = 'flex';
        this.batchDomains = [];
        this.updateBatchPreview();
    }

    // =========================================================================
    // MODE SWITCHING
    // =========================================================================

    /**
     * Switch between single and batch modes
     */
    switchMode(mode) {
        this.mode = mode;

        // Update tab states
        this.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Show/hide appropriate sections
        if (mode === 'single') {
            this.showSection('input');
            if (this.batchInputSection) this.batchInputSection.style.display = 'none';
            if (this.batchProgressSection) this.batchProgressSection.style.display = 'none';
            if (this.batchResultsSection) this.batchResultsSection.style.display = 'none';
        } else {
            this.inputSection.style.display = 'none';
            this.progressSection.style.display = 'none';
            this.resultsSection.style.display = 'none';
            this.errorSection.style.display = 'none';
            if (this.batchInputSection) this.batchInputSection.style.display = 'block';
        }
    }

    /**
     * Start research for entered domain
     */
    async startResearch() {
        const domain = this.domainInput.value.trim();

        // Validate domain
        if (!domain) {
            this.showInputError('Please enter a domain');
            return;
        }

        if (!this.engine.isValidDomain(domain)) {
            this.showInputError('Please enter a valid domain (e.g., company.com)');
            return;
        }

        // Check server health first
        const isHealthy = await this.engine.checkHealth();
        if (!isHealthy) {
            this.showInputError('Bridge server not running. Start with: cd bridge && npm start');
            return;
        }

        this.currentDomain = domain;
        this.startTime = Date.now();

        // Disable input
        this.startButton.disabled = true;
        this.domainInput.disabled = true;

        try {
            // Start research
            const result = await this.engine.startResearch(domain);
            this.currentJobId = result.jobId;

            // Switch to progress view
            this.showSection('progress');
            this.researchDomainSpan.textContent = domain;

            // Reset phases
            this.resetPhases();

            // Clear stream
            this.streamContent.innerHTML = '';
            this.appendToStream(`Starting research for ${domain}...`, 'highlight');

            // Connect to SSE stream
            this.engine.connectToStream(this.currentJobId, {
                onInit: (data) => this.handleInit(data),
                onPhase: (phase, status, phases) => this.handlePhase(phase, status, phases),
                onLog: (text) => this.handleLog(text),
                onComplete: (data) => this.handleComplete(data),
                onError: (text) => this.handleError(text)
            });

        } catch (error) {
            console.error('Failed to start research:', error);
            this.showInputError(error.message);
            this.startButton.disabled = false;
            this.domainInput.disabled = false;
        }
    }

    /**
     * Handle initial state from SSE
     */
    handleInit(data) {
        console.log('Research initialized:', data);
        // Update phases based on initial state
        if (data.phases) {
            Object.entries(data.phases).forEach(([phase, status]) => {
                this.updatePhase(parseInt(phase), status);
            });
        }
    }

    /**
     * Handle phase update from SSE
     */
    handlePhase(phase, status, phases) {
        console.log(`Phase ${phase}: ${status}`);

        // Update all phases
        if (phases) {
            Object.entries(phases).forEach(([p, s]) => {
                this.updatePhase(parseInt(p), s);
            });
        } else {
            this.updatePhase(phase, status);
        }

        // Add to stream
        const phaseNames = {
            1: 'Company Discovery',
            2: 'Pain Point Analysis',
            3: 'Contact Discovery',
            4: 'POC Recommendations',
            5: 'Report Generation',
            6: 'PDF Generation'
        };
        this.appendToStream(`Phase ${phase}: ${phaseNames[phase]} - ${status}`, 'highlight');
    }

    /**
     * Handle log message from SSE
     */
    handleLog(text) {
        // Clean up the text and add to stream
        const lines = text.split('\n').filter(line => line.trim());
        lines.forEach(line => {
            this.appendToStream(line);
        });
    }

    /**
     * Handle research completion
     */
    handleComplete(data) {
        console.log('Research complete:', data);

        const duration = Date.now() - this.startTime;
        const formattedDuration = this.engine.formatDuration(duration);

        if (data.status === 'complete') {
            // Switch to results view
            this.showSection('results');
            this.resultDomainSpan.textContent = this.currentDomain;
            this.resultTimeSpan.textContent = `Completed in ${formattedDuration}`;
            this.showToast(`Research complete for ${this.currentDomain} in ${formattedDuration}`, 'success');
        } else {
            // Show error
            this.showSection('error');
            this.errorMessage.textContent = data.error || 'Research failed. Please try again.';
            this.showToast('Research failed. Please try again.', 'error');
        }

        // Re-enable input for next time
        this.startButton.disabled = false;
        this.domainInput.disabled = false;
    }

    /**
     * Handle error from SSE
     */
    handleError(text) {
        console.error('Research error:', text);
        this.appendToStream(text, 'error');
    }

    /**
     * Update phase indicator in UI
     */
    updatePhase(phase, status) {
        const phaseItem = document.querySelector(`.phase-item[data-phase="${phase}"]`);
        if (!phaseItem) return;

        // Remove all status classes
        phaseItem.classList.remove('pending', 'active', 'complete');

        // Add appropriate class
        if (status === 'active') {
            phaseItem.classList.add('active');
        } else if (status === 'complete') {
            phaseItem.classList.add('complete');
        }
    }

    /**
     * Reset all phases to pending state
     */
    resetPhases() {
        document.querySelectorAll('.phase-item').forEach(item => {
            item.classList.remove('active', 'complete');
        });
    }

    /**
     * Append text to output stream
     */
    appendToStream(text, type = '') {
        const line = document.createElement('div');
        line.className = `stream-line ${type}`;
        line.textContent = text;
        this.streamContent.appendChild(line);

        // Auto-scroll to bottom
        this.outputStream.scrollTop = this.outputStream.scrollHeight;
    }

    /**
     * Toggle output stream visibility
     */
    toggleStream() {
        this.outputStream.classList.toggle('collapsed');
        this.toggleStreamBtn.classList.toggle('collapsed');
    }

    /**
     * Cancel current research
     */
    cancelResearch() {
        this.engine.disconnect();
        this.resetToInput();
    }

    /**
     * View PDF in preview
     */
    viewPDF() {
        const pdfUrl = this.engine.getPDFUrl(this.currentDomain);
        this.pdfIframe.src = pdfUrl;
        this.pdfPreviewContainer.style.display = 'block';

        // Scroll to preview
        this.pdfPreviewContainer.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Download PDF
     */
    downloadPDF() {
        const pdfUrl = this.engine.getPDFUrl(this.currentDomain);
        const sanitized = this.engine.sanitizeDomain(this.currentDomain);

        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${sanitized}-research-report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * View markdown report in new tab
     */
    viewMarkdown() {
        const reportUrl = this.engine.getReportUrl(this.currentDomain);
        window.open(reportUrl, '_blank');
    }

    /**
     * Close PDF preview
     */
    closePreview() {
        this.pdfPreviewContainer.style.display = 'none';
        this.pdfIframe.src = '';
    }

    /**
     * Reset to input view
     */
    resetToInput() {
        this.engine.disconnect();
        this.currentDomain = null;
        this.currentJobId = null;
        this.startTime = null;

        this.domainInput.value = '';
        this.domainInput.disabled = false;
        this.startButton.disabled = false;
        this.inputStatus.textContent = '';
        this.inputStatus.className = 'input-status';

        this.showSection('input');
        this.closePreview();

        // Focus input
        this.domainInput.focus();
    }

    /**
     * Show a specific section
     */
    showSection(section) {
        this.inputSection.style.display = section === 'input' ? 'block' : 'none';
        this.progressSection.style.display = section === 'progress' ? 'block' : 'none';
        this.resultsSection.style.display = section === 'results' ? 'block' : 'none';
        this.errorSection.style.display = section === 'error' ? 'block' : 'none';
    }

    /**
     * Show input error message
     */
    showInputError(message) {
        this.inputStatus.textContent = message;
        this.inputStatus.className = 'input-status error';
    }

    /**
     * Show server not running error
     */
    showServerError() {
        this.showInputError('Bridge server not running. Start with: cd bridge && npm start');
    }

    // =========================================================================
    // BATCH MODE METHODS
    // =========================================================================

    /**
     * Parse domains from textarea input
     */
    parseBatchDomains() {
        if (!this.batchTextarea) return;

        const text = this.batchTextarea.value;
        this.batchDomains = this.engine.parseDomainsFromText(text);
        this.updateBatchPreview();
    }

    /**
     * Handle drag over event for CSV upload
     */
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.csvUploadArea.classList.add('dragover');
    }

    /**
     * Handle drag leave event for CSV upload
     */
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.csvUploadArea.classList.remove('dragover');
    }

    /**
     * Handle file drop for CSV upload
     */
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.csvUploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processCSVFile(files[0]);
        }
    }

    /**
     * Handle file selection for CSV upload
     */
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processCSVFile(files[0]);
        }
    }

    /**
     * Process uploaded CSV file
     */
    processCSVFile(file) {
        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            this.batchDomains = this.engine.parseDomainsFromCSV(csvContent);
            this.updateBatchPreview();

            // Show file info, hide dropzone
            if (this.csvFileName) {
                this.csvFileName.textContent = file.name;
            }
            if (this.csvFileInfo) {
                this.csvFileInfo.style.display = 'flex';
            }
            if (this.csvUploadArea) {
                this.csvUploadArea.style.display = 'none';
            }
        };
        reader.readAsText(file);
    }

    /**
     * Update batch preview with parsed domains
     */
    updateBatchPreview() {
        if (!this.batchPreview || !this.domainTags) return;

        if (this.batchDomains.length === 0) {
            this.batchPreview.style.display = 'none';
            if (this.startBatchBtn) this.startBatchBtn.disabled = true;
            return;
        }

        this.batchPreview.style.display = 'block';
        if (this.batchDomainCount) {
            this.batchDomainCount.textContent = this.batchDomains.length;
        }

        // Render domain tags (show first 20, then "+X more")
        const maxShow = 20;
        const toShow = this.batchDomains.slice(0, maxShow);
        const remaining = this.batchDomains.length - maxShow;

        this.domainTags.innerHTML = toShow.map(domain => `
            <span class="domain-tag">
                ${domain}
                <button class="remove-domain" data-domain="${domain}">&times;</button>
            </span>
        `).join('');

        if (remaining > 0) {
            this.domainTags.innerHTML += `<span class="domain-tag">+${remaining} more</span>`;
        }

        // Bind remove buttons
        this.domainTags.querySelectorAll('.remove-domain').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const domain = btn.dataset.domain;
                this.batchDomains = this.batchDomains.filter(d => d !== domain);
                this.updateBatchPreview();
            });
        });

        if (this.startBatchBtn) {
            this.startBatchBtn.disabled = this.batchDomains.length === 0;
        }
    }

    /**
     * Clear batch input
     */
    clearBatch() {
        this.batchDomains = [];
        if (this.batchTextarea) this.batchTextarea.value = '';
        if (this.csvFileName) {
            this.csvFileName.textContent = '';
            this.csvFileName.style.display = 'none';
        }
        if (this.csvFileInput) this.csvFileInput.value = '';
        this.updateBatchPreview();
    }

    /**
     * Start batch research
     */
    async startBatch() {
        if (this.batchDomains.length === 0) return;

        // Check server health
        const isHealthy = await this.engine.checkHealth();
        if (!isHealthy) {
            if (this.batchStatus) {
                this.batchStatus.textContent = 'Bridge server not running. Start with: cd bridge && npm start';
                this.batchStatus.className = 'input-status error';
            }
            return;
        }

        this.batchStartTime = Date.now();
        this.batchResults = [];

        // Get concurrency option
        const concurrency = parseInt(this.batchConcurrency?.value || '3', 10);

        try {
            // Create batch with options
            const result = await this.engine.createBatch(this.batchDomains, { concurrency });
            this.currentBatchId = result.batchId;

            // Switch to progress view
            if (this.batchInputSection) this.batchInputSection.style.display = 'none';
            if (this.batchProgressSection) this.batchProgressSection.style.display = 'block';

            // Initialize stats
            this.updateBatchStats({
                total: this.batchDomains.length,
                completed: 0,
                failed: 0,
                processing: 0
            });

            // Initialize job cards
            this.initJobCards(this.batchDomains);

            // Connect to batch stream
            this.engine.connectToBatchStream(this.currentBatchId, {
                onInit: (data) => this.handleBatchInit(data),
                onJobStart: (data) => this.handleJobStart(data),
                onJobPhase: (data) => this.handleJobPhase(data),
                onJobComplete: (data) => this.handleJobComplete(data),
                onJobFailed: (data) => this.handleJobFailed(data),
                onBatchComplete: (data) => this.handleBatchComplete(data),
                onError: (text) => console.error('Batch error:', text)
            });

        } catch (error) {
            console.error('Failed to start batch:', error);
            alert('Failed to start batch: ' + error.message);
        }
    }

    /**
     * Initialize job cards in progress view
     */
    initJobCards(domains) {
        if (!this.batchJobsList) return;

        this.batchJobsList.innerHTML = domains.map(domain => `
            <div class="job-card pending" data-domain="${domain}">
                <div class="job-status-icon pending">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </div>
                <div class="job-info">
                    <div class="job-domain">${domain}</div>
                    <div class="job-phase">Queued</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update batch statistics display
     */
    updateBatchStats(stats) {
        const pending = stats.total - stats.completed - stats.failed - stats.processing;

        if (this.batchStatCompleted) this.batchStatCompleted.textContent = stats.completed;
        if (this.batchStatRunning) this.batchStatRunning.textContent = stats.processing;
        if (this.batchStatPending) this.batchStatPending.textContent = pending;
        if (this.batchStatFailed) this.batchStatFailed.textContent = stats.failed;

        // Update progress bar
        const progress = stats.total > 0 ? Math.round(((stats.completed + stats.failed) / stats.total) * 100) : 0;
        if (this.batchProgressBar) {
            this.batchProgressBar.style.width = `${progress}%`;
        }
        if (this.batchProgressText) {
            this.batchProgressText.textContent = `${stats.completed + stats.failed} of ${stats.total} companies`;
        }
    }

    /**
     * Format ETA in human readable format
     */
    formatEta(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    }

    /**
     * Handle batch initialization from SSE
     */
    handleBatchInit(data) {
        console.log('Batch initialized:', data);
        if (data.jobs) {
            let completed = 0, failed = 0, processing = 0;
            Object.values(data.jobs).forEach(job => {
                if (job.status === 'completed') completed++;
                else if (job.status === 'failed') failed++;
                else if (job.status === 'processing') processing++;
            });
            this.updateBatchStats({
                total: this.batchDomains.length,
                completed, failed, processing
            });
        }
    }

    /**
     * Handle job start event from SSE
     */
    handleJobStart(data) {
        const card = this.batchJobsList?.querySelector(`[data-domain="${data.domain}"]`);
        if (card) {
            card.className = 'job-card processing';
            card.querySelector('.job-status-icon').className = 'job-status-icon processing';
            card.querySelector('.job-status-icon').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
            `;
            card.querySelector('.job-phase').textContent = 'Starting...';
        }
        this.updateBatchStats(this.calculateBatchStats());
    }

    /**
     * Handle job phase update from SSE
     */
    handleJobPhase(data) {
        const card = this.batchJobsList?.querySelector(`[data-domain="${data.domain}"]`);
        if (card) {
            const phaseNames = {
                1: 'Company Discovery',
                2: 'Market Position',
                3: 'Technographics',
                4: 'Financials',
                5: 'Pain Points',
                6: 'Contacts',
                7: 'POC Analysis',
                8: 'Output Generation'
            };
            card.querySelector('.job-phase').textContent = phaseNames[data.phase] || `Phase ${data.phase}`;
        }
    }

    /**
     * Handle job completion from SSE
     */
    handleJobComplete(data) {
        const card = this.batchJobsList?.querySelector(`[data-domain="${data.domain}"]`);
        if (card) {
            card.className = 'job-card completed';
            card.querySelector('.job-status-icon').className = 'job-status-icon completed';
            card.querySelector('.job-status-icon').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            card.querySelector('.job-phase').textContent = 'Complete';
        }
        this.batchResults.push({ domain: data.domain, status: 'completed', data: data });
        this.updateBatchStats(this.calculateBatchStats());
    }

    /**
     * Handle job failure from SSE
     */
    handleJobFailed(data) {
        const card = this.batchJobsList?.querySelector(`[data-domain="${data.domain}"]`);
        if (card) {
            card.className = 'job-card failed';
            card.querySelector('.job-status-icon').className = 'job-status-icon failed';
            card.querySelector('.job-status-icon').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
            card.querySelector('.job-phase').textContent = 'Failed';
        }
        this.batchResults.push({ domain: data.domain, status: 'failed', error: data.error });
        this.updateBatchStats(this.calculateBatchStats());
    }

    /**
     * Handle batch completion from SSE
     */
    handleBatchComplete(data) {
        console.log('Batch complete:', data);

        // Switch to results view
        if (this.batchProgressSection) this.batchProgressSection.style.display = 'none';
        if (this.batchResultsSection) this.batchResultsSection.style.display = 'block';

        // Update results header
        const completed = this.batchResults.filter(r => r.status === 'completed').length;
        const failed = this.batchResults.filter(r => r.status === 'failed').length;

        if (this.finalCompleted) {
            this.finalCompleted.textContent = completed;
        }
        if (this.finalFailed) {
            this.finalFailed.textContent = failed;
        }

        // Show retry button if there are failures
        if (this.retryFailedBatchBtn && failed > 0) {
            this.retryFailedBatchBtn.style.display = 'flex';
        }

        // Show toast notification
        const duration = this.engine.formatDuration(Date.now() - this.batchStartTime);
        if (failed === 0) {
            this.showToast(`Batch complete! ${completed} companies researched in ${duration}`, 'success');
        } else {
            this.showToast(`Batch complete: ${completed} succeeded, ${failed} failed`, failed > completed ? 'error' : 'success');
        }

        // Render result cards
        this.renderResultCards();
    }

    /**
     * Calculate current batch statistics
     */
    calculateBatchStats() {
        const cards = this.batchJobsList?.querySelectorAll('.job-card') || [];
        let completed = 0, failed = 0, processing = 0;

        cards.forEach(card => {
            if (card.classList.contains('completed')) completed++;
            else if (card.classList.contains('failed')) failed++;
            else if (card.classList.contains('processing')) processing++;
        });

        return {
            total: this.batchDomains.length,
            completed, failed, processing
        };
    }

    /**
     * Render result cards in results view
     */
    async renderResultCards() {
        if (!this.resultCardsContainer) return;

        const cards = [];

        for (const result of this.batchResults) {
            if (result.status === 'completed') {
                try {
                    const data = await this.engine.getResearchData(result.domain);
                    cards.push(this.createResultCard(result.domain, data));
                } catch (error) {
                    cards.push(this.createResultCard(result.domain, null, 'Data not found'));
                }
            } else {
                cards.push(this.createResultCard(result.domain, null, result.error));
            }
        }

        this.resultCardsContainer.innerHTML = cards.join('');

        // Bind action buttons
        this.resultCardsContainer.querySelectorAll('.view-result-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const domain = btn.dataset.domain;
                window.open(this.engine.getPDFUrl(domain), '_blank');
            });
        });
    }

    /**
     * Create a result card HTML
     */
    createResultCard(domain, data, error = null) {
        const isSuccess = !error && data;
        const companyName = data?.company?.name || domain;
        const contacts = data?.contacts?.length || 0;
        const painPoints = data?.painPoints?.length || 0;

        return `
            <div class="result-card ${isSuccess ? 'success' : 'failed'}">
                <div class="result-card-header">
                    <div>
                        <div class="result-company-name">${escapeHTML(companyName)}</div>
                        <div class="result-domain">${escapeHTML(domain)}</div>
                    </div>
                    <span class="result-status-badge ${isSuccess ? 'success' : 'failed'}">
                        ${isSuccess ? 'Complete' : 'Failed'}
                    </span>
                </div>
                ${isSuccess ? `
                    <div class="result-metrics">
                        <div class="result-metric">
                            <div class="result-metric-value">${escapeHTML(contacts)}</div>
                            <div class="result-metric-label">Contacts</div>
                        </div>
                        <div class="result-metric">
                            <div class="result-metric-value">${escapeHTML(painPoints)}</div>
                            <div class="result-metric-label">Pain Points</div>
                        </div>
                    </div>
                ` : `
                    <div style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: var(--space-4);">
                        ${escapeHTML(error || 'Research failed')}
                    </div>
                `}
                <div class="result-card-actions">
                    ${isSuccess ? `
                        <button class="result-action-btn view-result-btn" data-domain="${escapeAttr(domain)}">View PDF</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Pause batch processing
     */
    async pauseBatch() {
        if (!this.currentBatchId) return;
        try {
            await this.engine.pauseBatch(this.currentBatchId);
            if (this.pauseBatchBtn) this.pauseBatchBtn.style.display = 'none';
            if (this.resumeBatchBtn) this.resumeBatchBtn.style.display = 'flex';
        } catch (error) {
            console.error('Failed to pause batch:', error);
        }
    }

    /**
     * Resume batch processing
     */
    async resumeBatch() {
        if (!this.currentBatchId) return;
        try {
            await this.engine.resumeBatch(this.currentBatchId);
            if (this.pauseBatchBtn) this.pauseBatchBtn.style.display = 'flex';
            if (this.resumeBatchBtn) this.resumeBatchBtn.style.display = 'none';
        } catch (error) {
            console.error('Failed to resume batch:', error);
        }
    }

    /**
     * Retry failed jobs in batch
     */
    async retryBatch() {
        if (!this.currentBatchId) return;
        try {
            await this.engine.retryBatch(this.currentBatchId);
            // Reset failed cards to pending
            this.batchJobsList?.querySelectorAll('.job-card.failed').forEach(card => {
                card.className = 'job-card pending';
                card.querySelector('.job-status-icon').className = 'job-status-icon pending';
                card.querySelector('.job-status-icon').innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                `;
                card.querySelector('.job-phase').textContent = 'Queued (Retry)';
            });
        } catch (error) {
            console.error('Failed to retry batch:', error);
        }
    }

    /**
     * Cancel batch processing
     */
    async cancelBatch() {
        if (!this.currentBatchId) return;
        if (!confirm('Are you sure you want to cancel this batch? Progress will be lost.')) return;

        try {
            await this.engine.cancelBatch(this.currentBatchId);
            this.engine.disconnect();
            this.resetToBatchInput();
        } catch (error) {
            console.error('Failed to cancel batch:', error);
        }
    }

    /**
     * Export batch results
     */
    async exportBatch(format) {
        if (!this.currentBatchId) return;

        // Get the button for loading state
        const buttonMap = {
            'csv': this.exportCsvBtn,
            'hubspot': this.exportHubspotBtn,
            'salesforce': this.exportSalesforceBtn
        };
        const btn = buttonMap[format];
        this.setButtonLoading(btn, true);

        try {
            const blob = await this.engine.exportBatch(this.currentBatchId, format);

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const extension = format === 'csv' ? 'csv' : 'json';
            a.download = `prospect-research-${format}-${Date.now()}.${extension}`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast(`Exported ${format.toUpperCase()} successfully`, 'success');
        } catch (error) {
            console.error('Failed to export batch:', error);
            this.showToast(`Export failed: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    }

    /**
     * Reset to batch input view
     */
    resetToBatchInput() {
        this.engine.disconnect();
        this.currentBatchId = null;
        this.batchResults = [];
        this.batchStartTime = null;

        this.clearBatch();

        if (this.batchProgressSection) this.batchProgressSection.style.display = 'none';
        if (this.batchResultsSection) this.batchResultsSection.style.display = 'none';
        if (this.batchInputSection) this.batchInputSection.style.display = 'block';

        // Reset pause/resume buttons
        if (this.pauseBatchBtn) this.pauseBatchBtn.style.display = 'flex';
        if (this.resumeBatchBtn) this.resumeBatchBtn.style.display = 'none';
    }

    // =========================================================================
    // COMPARISON VIEW METHODS
    // =========================================================================

    /**
     * Open the comparison view
     */
    async openComparison() {
        // Get completed results
        const completedResults = this.batchResults.filter(r => r.status === 'completed');
        if (completedResults.length < 2) {
            alert('Need at least 2 completed companies to compare');
            return;
        }

        // Load data for all completed results
        this.comparisonData = [];
        for (const result of completedResults) {
            try {
                const data = await this.engine.getResearchData(result.domain);
                this.comparisonData.push({ domain: result.domain, data });
            } catch (error) {
                console.error(`Failed to load data for ${result.domain}:`, error);
            }
        }

        if (this.comparisonData.length < 2) {
            alert('Could not load enough company data for comparison');
            return;
        }

        // Render company checkboxes
        this.renderCompanyCheckboxes();

        // Select first 5 companies by default
        this.selectedCompanies = this.comparisonData.slice(0, 5).map(c => c.domain);
        this.updateCheckboxStates();
        this.renderComparisonTable();

        // Show comparison view
        if (this.batchResultsSection) this.batchResultsSection.style.display = 'none';
        if (this.comparisonSection) this.comparisonSection.style.display = 'block';
    }

    /**
     * Render company selection checkboxes
     */
    renderCompanyCheckboxes() {
        if (!this.companyCheckboxes) return;

        this.companyCheckboxes.innerHTML = this.comparisonData.map(({ domain, data }) => {
            const name = data?.company?.name || domain;
            return `
                <label class="company-checkbox" data-domain="${domain}">
                    <input type="checkbox" value="${domain}">
                    <span>${name}</span>
                </label>
            `;
        }).join('');

        // Bind checkbox events
        this.companyCheckboxes.querySelectorAll('.company-checkbox').forEach(label => {
            label.addEventListener('click', (e) => {
                e.preventDefault();
                const domain = label.dataset.domain;
                this.toggleCompanySelection(domain);
            });
        });
    }

    /**
     * Toggle company selection for comparison
     */
    toggleCompanySelection(domain) {
        const index = this.selectedCompanies.indexOf(domain);
        if (index === -1) {
            this.selectedCompanies.push(domain);
        } else {
            this.selectedCompanies.splice(index, 1);
        }
        this.updateCheckboxStates();
        this.renderComparisonTable();
    }

    /**
     * Update checkbox visual states
     */
    updateCheckboxStates() {
        if (!this.companyCheckboxes) return;

        this.companyCheckboxes.querySelectorAll('.company-checkbox').forEach(label => {
            const domain = label.dataset.domain;
            const isSelected = this.selectedCompanies.includes(domain);
            label.classList.toggle('selected', isSelected);
            label.querySelector('input').checked = isSelected;
        });
    }

    /**
     * Render the comparison table
     */
    renderComparisonTable() {
        if (!this.comparisonThead || !this.comparisonTbody) return;

        // Get selected company data
        const companies = this.selectedCompanies
            .map(domain => this.comparisonData.find(c => c.domain === domain))
            .filter(Boolean);

        if (companies.length === 0) {
            this.comparisonThead.innerHTML = '';
            this.comparisonTbody.innerHTML = '<tr><td colspan="100%">Select companies to compare</td></tr>';
            return;
        }

        // Render headers
        this.comparisonThead.innerHTML = `
            <tr>
                <th>Attribute</th>
                ${companies.map(({ data }) => `<th>${data?.company?.name || 'Unknown'}</th>`).join('')}
            </tr>
        `;

        // Define comparison rows
        const rows = [
            { label: 'Domain', getValue: (d) => d?.company?.domain || '-' },
            { label: 'Industry', getValue: (d) => d?.company?.industry || '-' },
            { label: 'Headquarters', getValue: (d) => {
                const hq = d?.company?.headquarters;
                return hq ? `${hq.city || ''}, ${hq.state || ''} ${hq.country || ''}`.trim().replace(/^,\s*/, '') : '-';
            }},
            { label: 'Employees', getValue: (d) => d?.financials?.headcount?.current || '-' },
            { label: 'Revenue', getValue: (d) => d?.financials?.estimatedRevenue?.value || '-' },
            { label: 'Funding', getValue: (d) => d?.financials?.funding?.totalRaised || '-' },
            { label: 'Last Round', getValue: (d) => d?.financials?.funding?.lastRound?.type || '-' },
            { label: 'Growth Stage', getValue: (d) => d?.marketPosition?.growthStage || '-' },
            { label: 'CRM', getValue: (d) => d?.technographics?.crm?.value || '-' },
            { label: 'CS Platform', getValue: (d) => d?.technographics?.customerSuccess?.value || '-' },
            { label: 'Marketing', getValue: (d) => d?.technographics?.marketing?.value || '-' },
            { label: 'Contacts Found', getValue: (d) => d?.contacts?.length || 0 },
            { label: 'Pain Points', getValue: (d) => d?.painPoints?.length || 0 },
            { label: 'Data Confidence', getValue: (d) => {
                const conf = d?.metadata?.overallConfidence;
                if (!conf) return '-';
                return `<span class="comparison-badge ${conf === 'high' ? 'green' : conf === 'medium' ? 'blue' : 'gray'}">${conf}</span>`;
            }}
        ];

        // Render rows
        this.comparisonTbody.innerHTML = rows.map(row => `
            <tr>
                <td>${row.label}</td>
                ${companies.map(({ data }) => `<td>${row.getValue(data)}</td>`).join('')}
            </tr>
        `).join('');
    }

    /**
     * Close comparison view and return to results
     */
    closeComparison() {
        if (this.comparisonSection) this.comparisonSection.style.display = 'none';
        if (this.batchResultsSection) this.batchResultsSection.style.display = 'block';
    }

    /**
     * Export comparison data
     */
    async exportComparison() {
        if (!this.selectedCompanies || this.selectedCompanies.length === 0) {
            this.showToast('No companies selected for export', 'error');
            return;
        }

        this.setButtonLoading(this.exportComparisonBtn, true);

        try {
            const blob = await this.engine.exportDomains(this.selectedCompanies, 'csv');

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `company-comparison-${Date.now()}.csv`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('Comparison exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export comparison:', error);
            this.showToast(`Export failed: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(this.exportComparisonBtn, false);
        }
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    /**
     * Show a toast notification
     */
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        // Add to container
        container.appendChild(toast);

        // Bind close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    /**
     * Set loading state on a button
     */
    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProspectResearchApp();
});
