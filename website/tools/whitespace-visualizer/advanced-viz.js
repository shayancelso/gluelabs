/**
 * Advanced Whitespace Visualization Engine
 * Enterprise-grade interactive heat map and analytics
 */

class WhitespaceVisualizer {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.currentAccount = null;
        this.currentView = 'heatmap';
        this.selectedCell = null;
        this.filters = {
            probability_min: 0,
            value_min: 0,
            timeline_max: 365,
            show_adopted: true
        };
        
        this.initializeContainer();
        this.bindEvents();
    }
    
    initializeContainer() {
        this.container.innerHTML = `
            <div class="viz-controls">
                <div class="view-switcher">
                    <button class="view-btn active" data-view="heatmap">Heat Map</button>
                    <button class="view-btn" data-view="matrix">Opportunity Matrix</button>
                    <button class="view-btn" data-view="network">Stakeholder Network</button>
                    <button class="view-btn" data-view="timeline">Timeline</button>
                </div>
                
                <div class="advanced-filters">
                    <div class="filter-group">
                        <label>Min Probability</label>
                        <input type="range" id="prob-filter" min="0" max="100" value="0" class="filter-slider">
                        <span class="filter-value">0%</span>
                    </div>
                    <div class="filter-group">
                        <label>Min Value</label>
                        <input type="range" id="value-filter" min="0" max="100000" value="0" step="5000" class="filter-slider">
                        <span class="filter-value">$0</span>
                    </div>
                    <div class="filter-group">
                        <label>Max Timeline</label>
                        <input type="range" id="timeline-filter" min="30" max="365" value="365" step="15" class="filter-slider">
                        <span class="filter-value">365 days</span>
                    </div>
                </div>
                
                <div class="ai-insights">
                    <div class="insight-card" id="ai-recommendations">
                        <div class="insight-header">
                            <span class="insight-icon">🤖</span>
                            <span>AI Recommendations</span>
                        </div>
                        <div class="insight-content">
                            Analyzing account patterns...
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="viz-main-area">
                <div class="viz-header">
                    <h3 id="viz-account-title">Select an account to begin analysis</h3>
                    <div class="account-metrics">
                        <div class="metric-card">
                            <span class="metric-label">Total Opportunity</span>
                            <span class="metric-value" id="total-opportunity">$0</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-label">Weighted Pipeline</span>
                            <span class="metric-value" id="weighted-pipeline">$0</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-label">Avg Deal Size</span>
                            <span class="metric-value" id="avg-deal-size">$0</span>
                        </div>
                        <div class="metric-card health">
                            <span class="metric-label">Health Score</span>
                            <span class="metric-value" id="health-score">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="visualization-container">
                    <div id="heatmap-view" class="viz-view active">
                        <div class="heatmap-legend">
                            <div class="legend-title">Opportunity Value</div>
                            <div class="legend-scale">
                                <span class="legend-min">$0</span>
                                <div class="legend-gradient"></div>
                                <span class="legend-max">$100K+</span>
                            </div>
                            <div class="legend-items">
                                <span class="legend-item"><span class="legend-dot adopted"></span>Adopted</span>
                                <span class="legend-item"><span class="legend-dot high-prob"></span>High Probability</span>
                                <span class="legend-item"><span class="legend-dot med-prob"></span>Medium Probability</span>
                                <span class="legend-item"><span class="legend-dot low-prob"></span>Low Probability</span>
                            </div>
                        </div>
                        
                        <div class="heatmap-matrix" id="heatmap-matrix">
                            <!-- Generated dynamically -->
                        </div>
                    </div>
                    
                    <div id="matrix-view" class="viz-view">
                        <div class="opportunity-matrix" id="opportunity-matrix">
                            <!-- Generated dynamically -->
                        </div>
                    </div>
                    
                    <div id="network-view" class="viz-view">
                        <div class="stakeholder-network" id="stakeholder-network">
                            <!-- Generated dynamically -->
                        </div>
                    </div>
                    
                    <div id="timeline-view" class="viz-view">
                        <div class="timeline-chart" id="timeline-chart">
                            <!-- Generated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="cell-detail-panel" id="cell-detail-panel">
                <!-- Populated when cell is clicked -->
            </div>
            
            <div class="scenario-planning" id="scenario-planning">
                <div class="scenario-header">
                    <h4>Scenario Planning</h4>
                    <button class="scenario-btn" id="run-scenarios">Run What-If Analysis</button>
                </div>
                <div class="scenario-content">
                    <div class="scenario-results" id="scenario-results">
                        <!-- Scenario analysis results -->
                    </div>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // View switcher
        this.container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Filter controls
        this.container.querySelectorAll('.filter-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.updateFilters(e.target.id, e.target.value);
            });
        });
        
        // Scenario planning
        document.getElementById('run-scenarios')?.addEventListener('click', () => {
            this.runScenarioAnalysis();
        });
    }
    
    loadAccount(accountId) {
        this.currentAccount = this.data.ENTERPRISE_ACCOUNTS[accountId];
        if (!this.currentAccount) return;
        
        this.updateAccountHeader();
        this.updateMetrics();
        this.renderCurrentView();
        this.generateAIRecommendations();
    }
    
    updateAccountHeader() {
        const titleEl = document.getElementById('viz-account-title');
        titleEl.textContent = `${this.currentAccount.name} — Whitespace Analysis`;
        
        // Add account context
        const contextEl = document.createElement('div');
        contextEl.className = 'account-context';
        contextEl.innerHTML = `
            <span class="context-item">${this.currentAccount.industry}</span>
            <span class="context-item">${this.currentAccount.size}</span>
            <span class="context-item">${this.currentAccount.employees.toLocaleString()} employees</span>
            <span class="context-item">ARR: $${(this.currentAccount.current_arr / 1000).toFixed(0)}K</span>
        `;
        titleEl.appendChild(contextEl);
    }
    
    updateMetrics() {
        const opportunities = this.getFilteredOpportunities();
        const totalOpp = opportunities.reduce((sum, opp) => sum + opp.value, 0);
        const weightedPipeline = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability), 0);
        const avgDealSize = opportunities.length > 0 ? totalOpp / opportunities.length : 0;
        
        document.getElementById('total-opportunity').textContent = this.formatCurrency(totalOpp);
        document.getElementById('weighted-pipeline').textContent = this.formatCurrency(weightedPipeline);
        document.getElementById('avg-deal-size').textContent = this.formatCurrency(avgDealSize);
        document.getElementById('health-score').textContent = this.currentAccount.health_score;
        
        // Animate values
        this.animateMetrics();
    }
    
    renderCurrentView() {
        // Hide all views
        this.container.querySelectorAll('.viz-view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show current view
        const currentView = document.getElementById(`${this.currentView}-view`);
        currentView.classList.add('active');
        
        // Render based on current view
        switch(this.currentView) {
            case 'heatmap':
                this.renderHeatMap();
                break;
            case 'matrix':
                this.renderOpportunityMatrix();
                break;
            case 'network':
                this.renderStakeholderNetwork();
                break;
            case 'timeline':
                this.renderTimeline();
                break;
        }
    }
    
    renderHeatMap() {
        const matrix = document.getElementById('heatmap-matrix');
        const whitespace = this.currentAccount.whitespace_matrix;
        
        // Create header row
        const headerRow = document.createElement('div');
        headerRow.className = 'matrix-row header-row';
        headerRow.innerHTML = `
            <div class="matrix-cell corner-cell">Products / Services</div>
            ${this.data.BUYING_CENTERS.map(center => 
                `<div class="matrix-cell header-cell" title="${center.name}">${center.name}</div>`
            ).join('')}
        `;
        
        matrix.innerHTML = '';
        matrix.appendChild(headerRow);
        
        // Create data rows
        this.data.PRODUCTS.forEach(product => {
            const row = document.createElement('div');
            row.className = 'matrix-row data-row';
            
            // Product header cell
            const productCell = document.createElement('div');
            productCell.className = 'matrix-cell product-cell';
            productCell.textContent = product.name;
            productCell.setAttribute('title', `${product.category} - Base Price: ${this.formatCurrency(product.basePrice)}`);
            row.appendChild(productCell);
            
            // Data cells
            this.data.BUYING_CENTERS.forEach(center => {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell data-cell';
                
                const opportunity = whitespace[product.id]?.[center.id];
                
                if (opportunity) {
                    if (opportunity.status === 'adopted') {
                        cell.classList.add('adopted');
                        cell.innerHTML = `
                            <div class="cell-content adopted">
                                <span class="cell-value">✓</span>
                                <span class="cell-label">Adopted</span>
                            </div>
                        `;
                    } else {
                        const intensity = this.calculateIntensity(opportunity.value);
                        const probabilityClass = this.getProbabilityClass(opportunity.probability);
                        
                        cell.classList.add('opportunity', probabilityClass);
                        cell.style.setProperty('--intensity', intensity);
                        
                        cell.innerHTML = `
                            <div class="cell-content">
                                <span class="cell-value">${this.formatCurrency(opportunity.value)}</span>
                                <span class="cell-probability">${Math.round(opportunity.probability * 100)}%</span>
                                <span class="cell-timeline">${opportunity.timeline}</span>
                            </div>
                        `;
                        
                        // Click handler for detailed view
                        cell.addEventListener('click', () => {
                            this.showCellDetail(product, center, opportunity);
                        });
                    }
                } else {
                    cell.classList.add('no-opportunity');
                    cell.innerHTML = `<div class="cell-content"><span class="cell-label">N/A</span></div>`;
                }
                
                row.appendChild(cell);
            });
            
            matrix.appendChild(row);
        });
    }
    
    showCellDetail(product, buyingCenter, opportunity) {
        const panel = document.getElementById('cell-detail-panel');
        panel.classList.add('active');
        
        const champion = opportunity.champion ? 
            this.currentAccount.stakeholders[opportunity.champion] : null;
        
        panel.innerHTML = `
            <div class="detail-header">
                <h4>${product.name} × ${buyingCenter.name}</h4>
                <button class="close-btn" onclick="this.closest('.cell-detail-panel').classList.remove('active')">×</button>
            </div>
            
            <div class="detail-content">
                <div class="detail-section">
                    <h5>Opportunity Overview</h5>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Value</span>
                            <span class="detail-value">${this.formatCurrency(opportunity.value)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Probability</span>
                            <span class="detail-value">${Math.round(opportunity.probability * 100)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Timeline</span>
                            <span class="detail-value">${opportunity.timeline}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Weighted Value</span>
                            <span class="detail-value">${this.formatCurrency(opportunity.value * opportunity.probability)}</span>
                        </div>
                    </div>
                </div>
                
                ${champion ? `
                    <div class="detail-section">
                        <h5>Champion</h5>
                        <div class="champion-info">
                            <span class="champion-name">${champion.name}</span>
                            <span class="champion-role">${champion.role}</span>
                            <span class="engagement-badge ${champion.engagement}">${champion.engagement} engagement</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="detail-section">
                    <h5>Product Information</h5>
                    <div class="product-info">
                        <span>Category: ${product.category}</span>
                        <span>Complexity: ${product.complexity}</span>
                        <span>Base Price: ${this.formatCurrency(product.basePrice)}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h5>Buying Center Analysis</h5>
                    <div class="buying-center-info">
                        <span>Influence: ${buyingCenter.influence}</span>
                        <span>Budget Authority: ${buyingCenter.budget}</span>
                        <span>Decision Speed: ${buyingCenter.decision_speed}</span>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="action-btn primary">Create Opportunity</button>
                    <button class="action-btn secondary">Schedule Demo</button>
                    <button class="action-btn secondary">Send ROI Analysis</button>
                </div>
            </div>
        `;
    }
    
    generateAIRecommendations() {
        const recommendations = this.calculateAIRecommendations();
        const panel = document.getElementById('ai-recommendations');
        const content = panel.querySelector('.insight-content');
        
        content.innerHTML = `
            <div class="recommendations-list">
                ${recommendations.map(rec => `
                    <div class="recommendation-item ${rec.priority}">
                        <div class="rec-header">
                            <span class="rec-title">${rec.title}</span>
                            <span class="rec-priority">${rec.priority}</span>
                        </div>
                        <div class="rec-description">${rec.description}</div>
                        <div class="rec-impact">Expected Impact: ${rec.impact}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    calculateAIRecommendations() {
        const opportunities = this.getFilteredOpportunities();
        const recommendations = [];
        
        // High-value opportunities
        const highValue = opportunities
            .filter(opp => opp.value > 50000 && opp.probability > 0.7)
            .sort((a, b) => (b.value * b.probability) - (a.value * a.probability))
            .slice(0, 2);
            
        highValue.forEach(opp => {
            recommendations.push({
                title: `Focus on ${opp.product_name} opportunity`,
                description: `High-value opportunity (${this.formatCurrency(opp.value)}) with strong probability (${Math.round(opp.probability * 100)}%)`,
                impact: this.formatCurrency(opp.value * opp.probability),
                priority: 'high'
            });
        });
        
        // Quick wins
        const quickWins = opportunities
            .filter(opp => opp.timeline_days <= 60 && opp.probability > 0.8)
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 1);
            
        quickWins.forEach(opp => {
            recommendations.push({
                title: `Quick win: ${opp.product_name}`,
                description: `Fast close opportunity (${opp.timeline}) with high probability`,
                impact: this.formatCurrency(opp.value),
                priority: 'medium'
            });
        });
        
        // Stakeholder engagement
        const lowEngagement = Object.values(this.currentAccount.stakeholders)
            .filter(s => s.engagement === 'low' && s.influence !== 'low');
            
        if (lowEngagement.length > 0) {
            recommendations.push({
                title: 'Improve stakeholder engagement',
                description: `${lowEngagement.length} high-influence stakeholders have low engagement`,
                impact: 'Increased deal velocity',
                priority: 'medium'
            });
        }
        
        return recommendations.slice(0, 3);
    }
    
    // Utility methods
    calculateIntensity(value) {
        const maxValue = 100000;
        return Math.min(value / maxValue, 1);
    }
    
    getProbabilityClass(probability) {
        if (probability >= 0.7) return 'high-prob';
        if (probability >= 0.5) return 'med-prob';
        return 'low-prob';
    }
    
    formatCurrency(amount) {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
        return `$${amount.toLocaleString()}`;
    }
    
    getFilteredOpportunities() {
        const whitespace = this.currentAccount.whitespace_matrix;
        const opportunities = [];
        
        Object.keys(whitespace).forEach(productId => {
            const product = this.data.PRODUCTS.find(p => p.id === productId);
            Object.keys(whitespace[productId]).forEach(centerId => {
                const opp = whitespace[productId][centerId];
                if (opp.status === 'opportunity') {
                    opportunities.push({
                        ...opp,
                        product_id: productId,
                        product_name: product.name,
                        center_id: centerId,
                        timeline_days: parseInt(opp.timeline.split(' ')[0])
                    });
                }
            });
        });
        
        return opportunities.filter(opp => {
            return opp.probability >= (this.filters.probability_min / 100) &&
                   opp.value >= this.filters.value_min &&
                   opp.timeline_days <= this.filters.timeline_max;
        });
    }
    
    updateFilters(filterId, value) {
        const valueSpan = document.querySelector(`#${filterId}`).nextElementSibling;
        
        switch(filterId) {
            case 'prob-filter':
                this.filters.probability_min = parseInt(value);
                valueSpan.textContent = `${value}%`;
                break;
            case 'value-filter':
                this.filters.value_min = parseInt(value);
                valueSpan.textContent = this.formatCurrency(parseInt(value));
                break;
            case 'timeline-filter':
                this.filters.timeline_max = parseInt(value);
                valueSpan.textContent = `${value} days`;
                break;
        }
        
        this.updateMetrics();
        this.renderCurrentView();
    }
    
    switchView(viewName) {
        this.currentView = viewName;
        
        // Update active button
        this.container.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        this.renderCurrentView();
    }
    
    animateMetrics() {
        // Add subtle animations to metric updates
        this.container.querySelectorAll('.metric-value').forEach(el => {
            el.style.transform = 'scale(1.1)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
        });
    }
}

// Export for use
window.WhitespaceVisualizer = WhitespaceVisualizer;