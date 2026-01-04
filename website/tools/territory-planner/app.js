/**
 * Territory Planner App
 * UI Controller for the Territory Planner tool
 */

class TerritoryApp {
    constructor() {
        this.engine = window.territoryEngine;
        this.currentScenario = 'expected';
        this.currentSegment = 'Mid-Market';
        this.capacityThreshold = 85;
        this.dataLoaded = false;

        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // File upload
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');
        const sampleDataBtn = document.getElementById('sample-data-btn');

        if (uploadZone) {
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        if (sampleDataBtn) {
            sampleDataBtn.addEventListener('click', () => this.loadSampleData());
        }

        // Scenario buttons
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleScenarioChange(e));
        });

        // Segment buttons
        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSegmentChange(e));
        });

        // Capacity threshold slider
        const capacitySlider = document.getElementById('capacity-threshold');
        if (capacitySlider) {
            capacitySlider.addEventListener('input', (e) => this.handleThresholdChange(e));
        }

        // Scenario planner actions
        document.getElementById('add-rep-btn')?.addEventListener('click', () => this.showAddRepModal());
        document.getElementById('remove-rep-btn')?.addEventListener('click', () => this.showRemoveRepModal());
        document.getElementById('reassign-btn')?.addEventListener('click', () => this.showReassignModal());
        document.getElementById('simulate-churn-btn')?.addEventListener('click', () => this.simulateChurn());
        document.getElementById('add-accounts-btn')?.addEventListener('click', () => this.scrollToAllocator());
        document.getElementById('reset-scenario-btn')?.addEventListener('click', () => this.resetScenario());

        // Account allocator
        document.getElementById('add-new-account-btn')?.addEventListener('click', () => this.addPendingAccount());
        document.getElementById('apply-recommendations-btn')?.addEventListener('click', () => this.applyRecommendations());

        // Export button
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportReport());

        // Modal close
        document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    }

    /**
     * Handle file drop
     */
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * Handle file select from input
     */
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * Process uploaded file
     */
    processFile(file) {
        if (!file.name.endsWith('.csv')) {
            this.showStatus('error', 'Please upload a CSV file');
            return;
        }

        this.showStatus('loading', 'Processing your data...');
        this.setLouState('processing');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                this.engine.parseCSV(csvText);
                this.dataLoaded = true;
                this.showStatus('success', `Loaded ${this.engine.accounts.length} accounts for ${this.engine.reps.length} team members`);
                this.setLouState('success');
                this.runAnalysis();
            } catch (error) {
                this.showStatus('error', error.message);
                this.setLouState('error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Load sample data
     */
    loadSampleData() {
        if (window.sampleTerritoryData) {
            this.showStatus('loading', 'Loading sample data...');
            this.setLouState('processing');

            setTimeout(() => {
                try {
                    this.engine.parseCSV(window.sampleTerritoryData);
                    this.dataLoaded = true;
                    this.showStatus('success', `Loaded ${this.engine.accounts.length} sample accounts`);
                    this.setLouState('success');
                    this.runAnalysis();
                } catch (error) {
                    this.showStatus('error', error.message);
                    this.setLouState('error');
                }
            }, 500);
        } else {
            this.showStatus('error', 'Sample data not available');
        }
    }

    /**
     * Show status message
     */
    showStatus(type, message) {
        const statusEl = document.getElementById('upload-status');
        if (!statusEl) return;

        statusEl.className = `upload-status ${type}`;
        statusEl.innerHTML = `
            <span class="status-icon">${type === 'loading' ? '⏳' : type === 'success' ? '✓' : '✕'}</span>
            <span class="status-message">${message}</span>
        `;
        statusEl.style.display = 'block';
    }

    /**
     * Set Lou mascot state
     */
    setLouState(state) {
        const lou = document.getElementById('lou-upload');
        if (!lou) return;

        lou.className = `lou-mascot ${state}`;
    }

    /**
     * Run full analysis and update UI
     */
    runAnalysis() {
        // Hide import section, show analysis
        document.getElementById('import-section').style.display = 'none';
        document.getElementById('analysis-section').style.display = 'block';

        // Initialize projection controls listeners
        this.initProjectionControls();

        // Update all sections
        this.updateSummaryMetrics();
        this.updateTeamTable();
        this.updateEquityAnalysis();
        this.updateBookHealth();
        this.updateProjections();
        this.updateScenarioComparison();
        this.updateBenchmarks();
        this.updateTerritoryDropdown();
    }

    /**
     * Update summary metrics cards
     */
    updateSummaryMetrics() {
        const summary = this.engine.getSummaryMetrics();

        document.getElementById('total-reps').textContent = summary.teamSize;
        document.getElementById('total-arr').textContent = this.engine.formatCurrency(summary.totalARR);
        document.getElementById('avg-capacity').textContent = `${summary.avgCapacity}%`;
        document.getElementById('total-whitespace').textContent = this.engine.formatCurrency(summary.totalActionableWhitespace);
        document.getElementById('at-risk-arr').textContent = this.engine.formatCurrency(summary.totalAtRiskARR);
        document.getElementById('avg-health').textContent = summary.avgHealth;
    }

    /**
     * Update team table
     */
    updateTeamTable() {
        const tbody = document.getElementById('team-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.engine.reps.map(rep => {
            const capacityClass = rep.capacityStatus;
            const benchmarkClass = rep.benchmarkComparison.arrDiff > 10 ? 'over' :
                                   rep.benchmarkComparison.arrDiff < -10 ? 'under' : 'balanced';
            const benchmarkText = rep.benchmarkComparison.arrDiff > 0 ?
                                  `+${Math.round(rep.benchmarkComparison.arrDiff)}%` :
                                  `${Math.round(rep.benchmarkComparison.arrDiff)}%`;

            return `
                <tr>
                    <td><strong>${rep.name}</strong></td>
                    <td>${rep.accountCount}</td>
                    <td>${this.engine.formatCurrency(rep.totalARR)}</td>
                    <td>
                        <div class="capacity-bar">
                            <div class="capacity-fill ${capacityClass}" style="width: ${Math.min(100, rep.capacityScore)}%"></div>
                        </div>
                        ${rep.capacityScore}%
                    </td>
                    <td>${this.engine.formatCurrency(rep.totalActionableWhitespace)}</td>
                    <td>${this.engine.formatCurrency(rep.atRiskARR)}</td>
                    <td>${rep.avgHealth}</td>
                    <td><span class="benchmark-status ${benchmarkClass}">${benchmarkText}</span></td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Update equity analysis section with enhanced dollar-value disparities
     */
    updateEquityAnalysis() {
        const equity = this.engine.calculateEquityScores();

        // Update equity scores with new structure
        document.getElementById('arr-equity-score').textContent = `${Math.round(equity.arr.score)}%`;
        document.getElementById('ws-equity-score').textContent = `${Math.round(equity.whitespace.score)}%`;
        document.getElementById('capacity-equity-score').textContent = `${Math.round(equity.capacity.score)}%`;
        document.getElementById('risk-equity-score').textContent = `${Math.round(equity.risk.score)}%`;

        // Update equity charts
        this.renderEquityChart('arr-equity-chart', this.engine.reps.map(r => ({
            label: r.name,
            value: r.totalARR
        })));

        this.renderEquityChart('whitespace-equity-chart', this.engine.reps.map(r => ({
            label: r.name,
            value: r.totalActionableWhitespace
        })));

        this.renderEquityChart('capacity-equity-chart', this.engine.reps.map(r => ({
            label: r.name,
            value: r.capacityScore
        })));

        this.renderEquityChart('risk-equity-chart', this.engine.reps.map(r => ({
            label: r.name,
            value: r.atRiskARR
        })));

        // Update insights with new detailed format
        const insights = this.engine.getEquityInsights();
        const insightsContainer = document.getElementById('equity-insights');

        if (insightsContainer) {
            insightsContainer.innerHTML = insights.map(insight => `
                <div class="insight-item ${insight.type}">
                    <div class="insight-icon ${insight.type}">
                        ${insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✓' : 'ℹ️'}
                    </div>
                    <div class="insight-content">
                        <div class="insight-text">${insight.text}</div>
                        ${insight.detail ? `<div class="insight-detail">${insight.detail}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Update recommendations panel
        this.updateRecommendationsPanel();
    }

    /**
     * Update smart recommendations panel
     */
    updateRecommendationsPanel() {
        const recommendationsContainer = document.getElementById('smart-recommendations');
        if (!recommendationsContainer) return;

        const recommendations = this.engine.generateSmartRecommendations();

        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="no-recommendations">
                    <span class="success-icon">✓</span>
                    <p>No immediate actions required. Your team is well-balanced!</p>
                </div>
            `;
            return;
        }

        recommendationsContainer.innerHTML = recommendations.slice(0, 5).map(rec => `
            <div class="recommendation-card ${rec.priority}">
                <div class="rec-header">
                    <span class="rec-priority ${rec.priority}">${rec.priority.toUpperCase()}</span>
                    <span class="rec-type">${rec.type.replace('_', ' ')}</span>
                </div>
                <div class="rec-action">${rec.action}</div>
                <div class="rec-impact">${rec.impact}</div>
                ${rec.reason ? `<div class="rec-reason">${rec.reason}</div>` : ''}
                ${rec.accounts ? `<div class="rec-accounts">Accounts: ${rec.accounts.slice(0, 3).join(', ')}${rec.accounts.length > 3 ? '...' : ''}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Render equity bar chart
     */
    renderEquityChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxValue = Math.max(...data.map(d => d.value));

        container.innerHTML = data.map(d => {
            const height = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
            return `
                <div class="equity-bar"
                     style="height: ${height}%"
                     data-label="${d.label}: ${typeof d.value === 'number' && d.value > 1000 ? this.engine.formatCurrency(d.value) : d.value}">
                </div>
            `;
        }).join('');
    }

    /**
     * Update projections section with configurable levers
     */
    updateProjections() {
        // Get projection config from UI controls
        const config = this.getProjectionConfig();
        const projections = this.engine.calculateProjections(config);

        // Current state
        document.getElementById('current-team-size').textContent = projections.current.teamSize;
        document.getElementById('current-total-arr').textContent = this.engine.formatCurrency(projections.current.totalARR);
        document.getElementById('current-avg-capacity').textContent = `${projections.current.avgCapacity}%`;
        document.getElementById('current-headroom').textContent = this.engine.formatCurrency(projections.current.headroomARR || 0);

        // Projected state (12-month outlook)
        document.getElementById('projected-arr').textContent = this.engine.formatCurrency(projections.projected.totalARR);

        const projCapacityEl = document.getElementById('projected-capacity');
        projCapacityEl.textContent = `${projections.projected.projectedCapacity}%`;
        projCapacityEl.className = projections.projected.projectedCapacity > config.targetCapacity ? 'proj-value warning' : 'proj-value';

        document.getElementById('required-headcount').textContent = projections.projected.requiredHeadcount;
        document.getElementById('hire-recommendation').textContent = projections.projected.hiringNeed > 0 ?
            `+${projections.projected.hiringNeed}` : 'None';

        // Update capacity runway indicator
        const runwayEl = document.getElementById('capacity-runway');
        if (runwayEl) {
            const runwayText = projections.capacityRunway >= 12
                ? '12+ months'
                : `${projections.capacityRunway} month${projections.capacityRunway !== 1 ? 's' : ''}`;
            runwayEl.textContent = runwayText;
            runwayEl.className = projections.capacityRunway <= 2 ? 'runway-critical' :
                                 projections.capacityRunway <= 4 ? 'runway-warning' : 'runway-healthy';
        }

        // Update monthly projection timeline
        this.renderMonthlyTimeline(projections.monthlyProjections, config);

        // Update hiring timeline
        this.renderHiringTimeline(projections.timeline);
    }

    /**
     * Get projection configuration from UI controls
     */
    getProjectionConfig() {
        return {
            newLogoGrowth: parseFloat(document.getElementById('new-logo-growth')?.value || 15) / 100,
            expansionRate: parseFloat(document.getElementById('expansion-rate')?.value || 10) / 100,
            churnRate: parseFloat(document.getElementById('churn-rate')?.value || 5) / 100,
            hiringLeadTime: parseInt(document.getElementById('hiring-lead-time')?.value || 45),
            rampTime: parseInt(document.getElementById('ramp-time')?.value || 90),
            targetCapacity: parseInt(document.getElementById('capacity-threshold')?.value || 80),
            projectionMonths: 12
        };
    }

    /**
     * Render monthly projection timeline chart
     */
    renderMonthlyTimeline(projections, config) {
        const container = document.getElementById('monthly-timeline');
        if (!container) return;

        const maxCapacity = Math.max(...projections.map(p => p.capacity), 100);

        container.innerHTML = `
            <div class="timeline-chart">
                <div class="timeline-header">
                    <span>Capacity Projection (12 Months)</span>
                    <span class="timeline-legend">
                        <span class="legend-item healthy">Healthy</span>
                        <span class="legend-item warning">Warning</span>
                        <span class="legend-item critical">Critical</span>
                    </span>
                </div>
                <div class="timeline-bars">
                    ${projections.map(p => {
                        const height = Math.min(100, (p.capacity / maxCapacity) * 100);
                        const barClass = p.isCritical ? 'critical' :
                                        p.isOverCapacity ? 'warning' : 'healthy';
                        return `
                            <div class="timeline-bar-container">
                                <div class="timeline-bar ${barClass}" style="height: ${height}%"
                                     title="${p.month}: ${p.capacity}% capacity, ${this.engine.formatCurrency(p.arr)} ARR">
                                    ${p.hireTriggered ? '<span class="hire-marker">+1</span>' : ''}
                                </div>
                                <span class="timeline-label">${p.month.substring(0, 3)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="timeline-threshold" style="bottom: ${(config.targetCapacity / maxCapacity) * 100}%">
                    <span>${config.targetCapacity}% target</span>
                </div>
            </div>
            <div class="timeline-summary">
                <div class="summary-item">
                    <span class="summary-label">Expected Expansion</span>
                    <span class="summary-value positive">+${this.engine.formatCurrency(projections.reduce((s, p) => s + p.expansion, 0))}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Expected Churn</span>
                    <span class="summary-value negative">-${this.engine.formatCurrency(projections.reduce((s, p) => s + p.churn, 0))}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Net Growth</span>
                    <span class="summary-value">${this.engine.formatCurrency(projections[projections.length - 1].arr - projections[0].arr)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render hiring timeline with enhanced styling
     */
    renderHiringTimeline(timeline) {
        const container = document.querySelector('.timeline-content');
        if (!container) return;

        container.innerHTML = timeline.map(item => `
            <div class="timeline-item ${item.urgency || ''} ${item.type || ''}">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-action">${item.action}</div>
                <div class="timeline-reason">${item.reason}</div>
            </div>
        `).join('');
    }

    /**
     * Update book health scorecard
     */
    updateBookHealth() {
        const container = document.getElementById('book-health-scorecard');
        if (!container) return;

        const teamHealth = this.engine.getTeamBookHealth();

        container.innerHTML = `
            <div class="book-health-header">
                <div class="health-score-circle ${teamHealth.overallStatus}">
                    <span class="score-number">${teamHealth.avgScore}</span>
                    <span class="score-label">Team Score</span>
                </div>
                <div class="health-summary">
                    <p>${teamHealth.healthyReps.length} of ${this.engine.reps.length} reps have healthy books</p>
                    ${teamHealth.criticalReps.length > 0 ?
                        `<p class="critical">${teamHealth.criticalReps.length} rep(s) need attention</p>` : ''}
                </div>
            </div>
            <div class="rep-health-grid">
                ${teamHealth.repScores.map(rep => `
                    <div class="rep-health-card ${rep.score >= 80 ? 'healthy' : rep.score >= 60 ? 'warning' : 'critical'}">
                        <div class="rep-health-header">
                            <span class="rep-name">${rep.rep}</span>
                            <span class="rep-score">${rep.score}</span>
                        </div>
                        ${rep.issues.length > 0 ? `
                            <div class="rep-issues">
                                ${rep.issues.map(issue => `<span class="issue-tag">${issue}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${rep.warnings.length > 0 ? `
                            <div class="rep-warnings">
                                ${rep.warnings.map(warning => `<span class="warning-tag">${warning}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="rep-health-metrics">
                            <span>Risk: ${rep.riskPct}%</span>
                            <span>Penetration: ${rep.penetrationRate}%</span>
                            <span>Expansion Ready: ${rep.expansionReady}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Initialize projection control listeners
     */
    initProjectionControls() {
        const controls = [
            'new-logo-growth',
            'expansion-rate',
            'churn-rate',
            'hiring-lead-time',
            'ramp-time',
            'capacity-threshold'
        ];

        controls.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateProjections());
                // Update display value for range inputs
                const displayEl = document.getElementById(`${id}-value`);
                if (displayEl) {
                    el.addEventListener('input', () => {
                        displayEl.textContent = el.type === 'range'
                            ? (id.includes('rate') || id.includes('growth') ? `${el.value}%` : el.value)
                            : el.value;
                    });
                }
            }
        });
    }

    /**
     * Handle scenario change
     */
    handleScenarioChange(e) {
        document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentScenario = e.target.dataset.scenario;
        this.updateProjections();
    }

    /**
     * Handle segment change
     */
    handleSegmentChange(e) {
        document.querySelectorAll('.segment-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentSegment = e.target.dataset.segment;
        this.updateBenchmarks();
    }

    /**
     * Handle threshold slider change
     */
    handleThresholdChange(e) {
        this.capacityThreshold = parseInt(e.target.value);
        document.getElementById('threshold-value').textContent = `${this.capacityThreshold}%`;
        this.updateProjections();
    }

    /**
     * Update scenario comparison
     */
    updateScenarioComparison() {
        const comparison = this.engine.getScenarioComparison();
        const container = document.getElementById('scenario-comparison');
        if (!container) return;

        const metrics = [
            { key: 'teamSize', label: 'Team Size' },
            { key: 'totalARR', label: 'Total ARR', format: 'currency' },
            { key: 'avgCapacity', label: 'Avg Capacity', format: 'percent' },
            { key: 'totalActionableWhitespace', label: 'Whitespace', format: 'currency' },
            { key: 'totalAtRiskARR', label: 'At-Risk ARR', format: 'currency' }
        ];

        container.innerHTML = metrics.map(metric => {
            const data = comparison[metric.key];
            const formatValue = (val) => {
                if (metric.format === 'currency') return this.engine.formatCurrency(val);
                if (metric.format === 'percent') return `${Math.round(val)}%`;
                return val;
            };

            const impactClass = data.direction === 'positive' ? 'impact-positive' :
                               data.direction === 'negative' ? 'impact-negative' : 'impact-neutral';

            const impactText = data.diff !== 0 ?
                (data.diff > 0 ? '+' : '') + (metric.format === 'currency' ?
                    this.engine.formatCurrency(data.diff) :
                    metric.format === 'percent' ? `${Math.round(data.diff)}%` : data.diff) :
                'No change';

            return `
                <div class="comparison-row">
                    <div class="comparison-col">
                        <div class="comparison-label">${metric.label}</div>
                        <div class="comparison-value">${formatValue(data.original)}</div>
                    </div>
                    <div class="comparison-col">
                        <div class="comparison-label">${metric.label}</div>
                        <div class="comparison-value">${formatValue(data.scenario)}</div>
                    </div>
                    <div class="comparison-col">
                        <div class="comparison-label">Impact</div>
                        <div class="comparison-value ${impactClass}">${impactText}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update benchmarks section
     */
    updateBenchmarks() {
        const benchmarks = this.engine.getBenchmarkComparison(this.currentSegment);

        // Accounts per rep
        document.getElementById('your-accounts').textContent = benchmarks.accounts.yourValue;
        document.getElementById('benchmark-accounts').textContent = benchmarks.accounts.benchmarkRange;
        const accountsBar = document.getElementById('benchmark-accounts-bar');
        accountsBar.style.width = `${benchmarks.accounts.percentage}%`;
        accountsBar.className = `your-value ${benchmarks.accounts.status === 'good' ? 'good' : benchmarks.accounts.status === 'over' ? 'bad' : 'warning'}`;

        // ARR per rep
        document.getElementById('your-arr-per-rep').textContent = this.engine.formatCurrency(benchmarks.arr.yourValue);
        document.getElementById('benchmark-arr').textContent = benchmarks.arr.benchmarkRange;
        const arrBar = document.getElementById('benchmark-arr-bar');
        arrBar.style.width = `${benchmarks.arr.percentage}%`;
        arrBar.className = `your-value ${benchmarks.arr.status === 'good' ? 'good' : benchmarks.arr.status === 'over' ? 'warning' : 'warning'}`;

        // Capacity
        document.getElementById('your-capacity').textContent = `${benchmarks.capacity.yourValue}%`;
        document.getElementById('benchmark-capacity').textContent = benchmarks.capacity.benchmarkTarget;
        const capacityBar = document.getElementById('benchmark-capacity-bar');
        capacityBar.style.width = `${benchmarks.capacity.percentage}%`;
        capacityBar.className = `your-value ${benchmarks.capacity.status === 'good' ? 'good' : 'bad'}`;

        // Risk
        document.getElementById('your-risk').textContent = `${benchmarks.risk.yourValue}%`;
        document.getElementById('benchmark-risk').textContent = benchmarks.risk.benchmarkTarget;
        const riskBar = document.getElementById('benchmark-risk-bar');
        riskBar.style.width = `${benchmarks.risk.percentage}%`;
        riskBar.className = `your-value ${benchmarks.risk.status === 'good' ? 'good' : 'bad'}`;
    }

    /**
     * Update territory dropdown in allocator
     */
    updateTerritoryDropdown() {
        const select = document.getElementById('new-account-territory');
        if (!select) return;

        const territories = this.engine.getTerritories();
        select.innerHTML = '<option value="">Select...</option>' +
            territories.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    /**
     * Show add rep modal
     */
    showAddRepModal() {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>Add Team Member</h3>
            <p>Simulate adding a new CSM/AM to the team to see the impact on capacity and equity.</p>
            <div class="modal-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="new-rep-name" placeholder="Enter name">
                </div>
                <button class="btn-primary" id="confirm-add-rep">Add to Scenario</button>
            </div>
        `;
        document.getElementById('modal').style.display = 'flex';

        document.getElementById('confirm-add-rep').addEventListener('click', () => {
            const name = document.getElementById('new-rep-name').value.trim();
            if (name) {
                this.engine.simulateAddRep(name);
                this.updateScenarioComparison();
                this.updateSummaryMetrics();
                this.updateTeamTable();
                this.updateProjections();
                this.closeModal();
            }
        });
    }

    /**
     * Show remove rep modal
     */
    showRemoveRepModal() {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>Remove Team Member</h3>
            <p>Simulate removing a team member to see the impact on remaining capacity.</p>
            <div class="modal-form">
                <div class="form-group">
                    <label>Select Team Member</label>
                    <select id="remove-rep-select">
                        ${this.engine.reps.map(r => `<option value="${r.name}">${r.name} (${r.accountCount} accounts)</option>`).join('')}
                    </select>
                </div>
                <button class="btn-primary" id="confirm-remove-rep">Remove from Scenario</button>
            </div>
        `;
        document.getElementById('modal').style.display = 'flex';

        document.getElementById('confirm-remove-rep').addEventListener('click', () => {
            const name = document.getElementById('remove-rep-select').value;
            if (name) {
                this.engine.simulateRemoveRep(name);
                this.updateScenarioComparison();
                this.updateSummaryMetrics();
                this.updateTeamTable();
                this.updateEquityAnalysis();
                this.updateProjections();
                this.closeModal();
            }
        });
    }

    /**
     * Show reassign modal
     */
    showReassignModal() {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>Reassign Accounts</h3>
            <p>Move accounts between team members to rebalance workloads.</p>
            <div class="modal-form">
                <div class="form-group">
                    <label>From Rep</label>
                    <select id="from-rep-select">
                        ${this.engine.reps.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Accounts</label>
                    <div id="account-checkboxes" style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                        <!-- Populated dynamically -->
                    </div>
                </div>
                <div class="form-group">
                    <label>To Rep</label>
                    <select id="to-rep-select">
                        ${this.engine.reps.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
                    </select>
                </div>
                <button class="btn-primary" id="confirm-reassign">Reassign</button>
            </div>
        `;
        document.getElementById('modal').style.display = 'flex';

        const fromSelect = document.getElementById('from-rep-select');
        const accountsContainer = document.getElementById('account-checkboxes');

        const updateAccounts = () => {
            const rep = this.engine.reps.find(r => r.name === fromSelect.value);
            if (rep) {
                accountsContainer.innerHTML = rep.accounts.map(a => `
                    <label style="display: block; padding: 4px 0; cursor: pointer;">
                        <input type="checkbox" value="${a.account_name}">
                        ${a.account_name} (${this.engine.formatCurrency(a.current_arr)})
                    </label>
                `).join('');
            }
        };

        fromSelect.addEventListener('change', updateAccounts);
        updateAccounts();

        document.getElementById('confirm-reassign').addEventListener('click', () => {
            const toRep = document.getElementById('to-rep-select').value;
            const selectedAccounts = Array.from(accountsContainer.querySelectorAll('input:checked'))
                .map(cb => cb.value);

            if (selectedAccounts.length > 0 && toRep) {
                this.engine.simulateReassignment(selectedAccounts, toRep);
                this.updateScenarioComparison();
                this.updateSummaryMetrics();
                this.updateTeamTable();
                this.updateEquityAnalysis();
                this.updateProjections();
                this.closeModal();
            }
        });
    }

    /**
     * Simulate churn
     */
    simulateChurn() {
        this.engine.simulateChurn(0.35);
        this.updateScenarioComparison();
        this.updateSummaryMetrics();
        this.updateTeamTable();
        this.updateEquityAnalysis();
        this.updateProjections();
    }

    /**
     * Scroll to allocator section
     */
    scrollToAllocator() {
        document.querySelector('.allocator-container')?.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Reset scenario to original state
     */
    resetScenario() {
        this.engine.resetToOriginal();
        this.updateScenarioComparison();
        this.updateSummaryMetrics();
        this.updateTeamTable();
        this.updateEquityAnalysis();
        this.updateProjections();
    }

    /**
     * Add pending account for allocation
     */
    addPendingAccount() {
        const name = document.getElementById('new-account-name').value.trim();
        const arr = parseFloat(document.getElementById('new-account-arr').value) || 0;
        const tam = parseFloat(document.getElementById('new-account-tam').value) || 0;
        const territory = document.getElementById('new-account-territory').value;
        const segment = document.getElementById('new-account-segment').value;

        if (!name || arr <= 0) {
            alert('Please enter account name and ARR');
            return;
        }

        this.engine.addPendingAccount({
            name,
            arr,
            tam: tam || arr * 3,
            territory: territory || 'Unassigned',
            segment
        });

        this.updatePendingList();
        this.updateRecommendations();

        // Clear form
        document.getElementById('new-account-name').value = '';
        document.getElementById('new-account-arr').value = '';
        document.getElementById('new-account-tam').value = '';
    }

    /**
     * Update pending accounts list
     */
    updatePendingList() {
        const container = document.getElementById('pending-list');
        const countEl = document.getElementById('pending-count');

        countEl.textContent = this.engine.pendingAccounts.length;

        container.innerHTML = this.engine.pendingAccounts.map(account => `
            <div class="pending-item">
                <div class="pending-item-info">
                    <div class="pending-item-name">${account.name}</div>
                    <div class="pending-item-details">${this.engine.formatCurrency(account.arr)} ARR • ${account.segment}</div>
                </div>
                <button class="remove-pending-btn" data-id="${account.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');

        container.querySelectorAll('.remove-pending-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.engine.removePendingAccount(e.currentTarget.dataset.id);
                this.updatePendingList();
                this.updateRecommendations();
            });
        });
    }

    /**
     * Update allocation recommendations
     */
    updateRecommendations() {
        const container = document.getElementById('recommendations-list');
        const applyBtn = document.getElementById('apply-recommendations-btn');

        if (this.engine.pendingAccounts.length === 0) {
            container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Add accounts above to see recommendations</p>';
            applyBtn.disabled = true;
            return;
        }

        const recommendations = this.engine.getAccountRecommendations(this.engine.pendingAccounts);

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-account">${rec.account.name}</div>
                <div class="recommendation-assignment">
                    Assign to <strong>${rec.recommendedRep}</strong>
                </div>
                <div class="recommendation-reason">${rec.reasons.join(', ')}</div>
            </div>
        `).join('');

        applyBtn.disabled = false;
        this.currentRecommendations = recommendations;
    }

    /**
     * Apply all recommendations
     */
    applyRecommendations() {
        if (this.currentRecommendations && this.currentRecommendations.length > 0) {
            this.engine.applyRecommendations(this.currentRecommendations);
            this.updatePendingList();
            this.updateRecommendations();
            this.updateSummaryMetrics();
            this.updateTeamTable();
            this.updateEquityAnalysis();
            this.updateProjections();
            this.updateScenarioComparison();
        }
    }

    /**
     * Export report
     */
    exportReport() {
        const summary = this.engine.getSummaryMetrics();
        const equity = this.engine.calculateEquityScores();

        let csv = 'Territory Planner Report\n\n';
        csv += 'Summary Metrics\n';
        csv += `Team Size,${summary.teamSize}\n`;
        csv += `Total ARR,${summary.totalARR}\n`;
        csv += `Avg Capacity,${summary.avgCapacity}%\n`;
        csv += `Actionable Whitespace,${summary.totalActionableWhitespace}\n`;
        csv += `At-Risk ARR,${summary.totalAtRiskARR}\n\n`;

        csv += 'Team Details\n';
        csv += 'Rep,Accounts,ARR,Capacity,Whitespace,At-Risk ARR,Avg Health\n';
        this.engine.reps.forEach(rep => {
            csv += `${rep.name},${rep.accountCount},${rep.totalARR},${rep.capacityScore}%,${rep.totalActionableWhitespace},${rep.atRiskARR},${rep.avgHealth}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'territory-planner-report.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.territoryApp = new TerritoryApp();
});
