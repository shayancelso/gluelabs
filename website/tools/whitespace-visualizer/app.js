/**
 * Whitespace Analysis Tool - Main Application
 * UI interactions and data visualization for the revenue expansion platform
 */

class WhitespaceApp {
    constructor() {
        this.engine = window.whitespaceEngine;
        this.dataLoaded = {
            accounts: false,
            products: false,
            adoptions: false
        };
        this.currentScenario = 'expected';
        this.currentView = 'quarterly';
        this.currentProjections = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Single file upload handler
        document.getElementById('data-upload').addEventListener('change', (e) => this.handleSingleFileUpload(e));
        
        // Sample data loader
        document.getElementById('load-sample-data').addEventListener('click', () => this.loadSampleData());
        
        // Modal close handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Close modal when clicking on overlay
        document.getElementById('opportunity-modal').addEventListener('click', (e) => {
            if (e.target.id === 'opportunity-modal') {
                this.closeModal();
            }
        });
    }

    async handleSingleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusElement = document.getElementById('data-status');
        const uploadBtn = document.querySelector('.upload-btn');
        
        try {
            this.updateStatus(statusElement, 'processing', 'Processing file...');
            uploadBtn.disabled = true;
            
            const csvText = await this.readFileAsText(file);
            const result = this.engine.loadSingleFile(csvText);
            
            if (result.success) {
                this.dataLoaded.accounts = true;
                this.dataLoaded.products = true;
                this.dataLoaded.adoptions = true;
                
                this.updateStatus(statusElement, 'success', 
                    `✓ ${result.accounts} accounts, ${result.products} products, ${result.adoptions} adoptions loaded`);
                this.updateUploadButton(uploadBtn, '✓ Data Loaded Successfully');
                
                // Hide the import section and run analysis
                document.querySelector('.data-import-section').style.display = 'none';
                this.runAnalysis();
            }
            
        } catch (error) {
            this.updateStatus(statusElement, 'error', error.message);
            uploadBtn.disabled = false;
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    updateStatus(element, type, message) {
        element.textContent = message;
        element.className = `upload-status ${type}`;
        element.style.display = 'block';
    }

    updateUploadButton(button, text) {
        button.textContent = text;
        button.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    }

    loadSampleData() {
        try {
            const result = this.engine.loadSampleData();
            
            // Update status
            this.updateStatus(document.getElementById('data-status'), 'success', 
                '✓ 5 sample accounts, 6 products, 10 adoptions loaded');
            this.updateUploadButton(document.querySelector('.upload-btn'), '✓ Sample Data Loaded');
            
            // Mark all data as loaded
            Object.keys(this.dataLoaded).forEach(key => this.dataLoaded[key] = true);
            
            // Hide import section and run analysis
            document.querySelector('.data-import-section').style.display = 'none';
            this.runAnalysis();
            
        } catch (error) {
            console.error('Failed to load sample data:', error);
        }
    }

    checkAnalysisReadiness() {
        // Check if we have at least accounts and products
        if (this.dataLoaded.accounts && this.dataLoaded.products) {
            setTimeout(() => this.runAnalysis(), 1000);
        }
    }

    runAnalysis() {
        try {
            const results = this.engine.generateAnalysis();
            this.displayResults(results);
            
            // Show results section with animation
            const resultsSection = document.getElementById('analysis-results');
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed: ' + error.message);
        }
    }

    displayResults(results) {
        console.log('Analysis results:', results); // Debug log
        this.displayStats(results.stats);
        this.displayMatrix(results.matrix);
        this.displayRevenueProjections(results.stats.revenueProjections);
        this.displayExpansionPlaybooks();
        this.displayAdvancedAnalytics(results.stats, results.opportunities);
        this.displayDashboard(results.opportunities, results.stats);
    }

    displayStats(stats) {
        const statsContainer = document.getElementById('analysis-stats');
        
        console.log('Stats object:', stats); // Debug log
        
        // Check if whitespace metrics are available
        if (stats.whitespaceMetrics) {
            statsContainer.innerHTML = `
                <div class="analysis-stat">
                    <span class="stat-value">$${this.formatCurrency(stats.whitespaceMetrics.totalMarketPotential)}</span>
                    <span class="stat-label">Total Market Potential</span>
                </div>
                <div class="analysis-stat">
                    <span class="stat-value">$${this.formatCurrency(stats.whitespaceMetrics.totalWhitespaceValue)}</span>
                    <span class="stat-label">Total Whitespace Value</span>
                </div>
                <div class="analysis-stat">
                    <span class="stat-value">${stats.whitespaceMetrics.marketCaptureRate}%</span>
                    <span class="stat-label">Market Capture Rate</span>
                </div>
                <div class="analysis-stat">
                    <span class="stat-value">${stats.totalOpportunities}</span>
                    <span class="stat-label">Expansion Opportunities</span>
                </div>
            `;
        } else {
            // Fallback to basic stats
            statsContainer.innerHTML = `
                <div class="analysis-stat">
                    <span class="stat-value">${stats.totalAccounts}</span>
                    <span class="stat-label">Total Accounts</span>
                </div>
                <div class="analysis-stat">
                    <span class="stat-value">${stats.totalOpportunities}</span>
                    <span class="stat-label">Expansion Opportunities</span>
                </div>
                <div class="analysis-stat">
                    <span class="stat-value">$${this.formatCurrency(stats.totalOpportunityValue)}</span>
                    <span class="stat-label">Total Opportunity Value</span>
                </div>
                <div class="analysis-stat">
                    <span class="stat-value">${stats.potentialLift}%</span>
                    <span class="stat-label">Potential ARR Lift</span>
                </div>
            `;
        }
    }

    displayRevenueProjections(projections) {
        const projectionsContainer = document.getElementById('revenue-projections');
        
        console.log('New projections structure:', projections); // Debug log
        
        // Handle both old and new projection structures
        const quarters = projections.quarters || {
            q1: projections.q1,
            q2: projections.q2, 
            q3: projections.q3,
            q4: projections.q4
        };
        
        const quartersHTML = `
            <div class="scenario-controls">
                <div class="control-group">
                    <label class="control-label">Scenario Planning</label>
                    <div class="scenario-buttons">
                        <button class="scenario-btn active" data-scenario="expected" onclick="app.switchScenario('expected')">Expected</button>
                        <button class="scenario-btn" data-scenario="conservative" onclick="app.switchScenario('conservative')">Conservative</button>
                        <button class="scenario-btn" data-scenario="optimistic" onclick="app.switchScenario('optimistic')">Optimistic</button>
                    </div>
                </div>
                <div class="control-group">
                    <label class="control-label">View Mode</label>
                    <div class="view-toggle">
                        <button class="view-btn active" data-view="quarterly" onclick="app.switchView('quarterly')">Quarterly</button>
                        <button class="view-btn" data-view="monthly" onclick="app.switchView('monthly')">Monthly</button>
                    </div>
                </div>
            </div>
            
            <div class="projections-grid" id="projections-display">
                ${Object.entries(quarters).map(([quarter, data]) => `
                    <div class="projection-quarter clickable-quarter" data-quarter="${quarter}" onclick="app.showQuarterBreakdown('${quarter}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">
                        <div class="quarter-label">${quarter.toUpperCase()} Target</div>
                        <div class="quarter-value">$${this.formatCurrency(data.totalARR || data.newARR)}</div>
                        <div class="quarter-growth">+${data.newARR ? this.formatCurrency(data.newARR) : this.formatCurrency(data.totalARR - projections.current)} new ARR</div>
                        <div class="quarter-confidence">${data.confidenceLevel || 75}% confidence</div>
                        <div class="quarter-count">${data.breakdown ? data.breakdown.length : 0} opportunities</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="methodology-section">
                <h5>📊 How We Calculate These Projections</h5>
                <div class="methodology-grid">
                    <div class="methodology-item">
                        <strong>Q1:</strong> High-confidence opportunities (Score 80+) with prerequisites met
                    </div>
                    <div class="methodology-item">
                        <strong>Q2:</strong> Medium opportunities in growth-stage accounts (Score 50-64)
                    </div>
                    <div class="methodology-item">
                        <strong>Q3:</strong> Developing opportunities requiring nurturing (Score 35-49)
                    </div>
                    <div class="methodology-item">
                        <strong>Q4:</strong> Speculative opportunities with long-term potential (Score <35)
                    </div>
                </div>
                <p class="methodology-formula"><strong>Formula:</strong> Projected Value = Opportunity Value × Score-Based Probability × Quarter Confidence</p>
            </div>
            
            <div class="projections-summary">
                <div class="summary-section">
                    <h5>Year-End Forecast</h5>
                    <div class="summary-item highlight">
                        <span class="label">Total New ARR</span>
                        <span class="value">$${this.formatCurrency(projections.yearEnd ? projections.yearEnd.totalNewARR : projections.confidence.expected)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total ARR</span>
                        <span class="value">$${this.formatCurrency(projections.yearEnd ? projections.yearEnd.totalARR : projections.current + projections.confidence.expected)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total Growth</span>
                        <span class="value">${projections.yearEnd ? projections.yearEnd.totalGrowth : '0'}%</span>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h5>Confidence Scenarios</h5>
                    <div class="summary-item">
                        <span class="label">Conservative</span>
                        <span class="value">$${this.formatCurrency(projections.confidence.conservative)}</span>
                    </div>
                    <div class="summary-item highlight">
                        <span class="label">Expected</span>
                        <span class="value">$${this.formatCurrency(projections.confidence.expected)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Optimistic</span>
                        <span class="value">$${this.formatCurrency(projections.confidence.optimistic)}</span>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h5>ROI Analysis</h5>
                    <div class="summary-item">
                        <span class="label">Expansion Cost</span>
                        <span class="value">$${this.formatCurrency(projections.roi.estimatedCost)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Net Gain</span>
                        <span class="value">$${this.formatCurrency(projections.roi.netGain)}</span>
                    </div>
                    <div class="summary-item highlight">
                        <span class="label">ROI</span>
                        <span class="value">${projections.roi.roi}%</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Payback Period</span>
                        <span class="value">${projections.roi.paybackMonths} months</span>
                    </div>
                </div>
            </div>
        `;
        
        // Store projections for scenario switching
        this.currentProjections = projections;
        
        projectionsContainer.innerHTML = quartersHTML;
        
        // Initialize quarter click listeners
        this.addQuarterClickListeners();
    }

    displayExpansionPlaybooks() {
        const playbooksContainer = document.getElementById('expansion-playbooks');
        const playbooks = this.engine.generateExpansionPlaybooks();
        
        console.log('Generated playbooks:', playbooks); // Debug log
        
        const playbooksHTML = playbooks.map(pb => {
            const playbook = pb.playbook;
            const playbookTypeClass = playbook.type.replace(/-/g, '_');
            const account = this.engine.accounts.find(a => a.id === pb.accountId);
            const accountOpportunities = this.engine.getAccountOpportunities(account);
            const totalOpportunityValue = accountOpportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0);
            
            return `
                <div class="playbook-card playbook-${playbookTypeClass}" data-account-id="${pb.accountId}">
                    <div class="playbook-overview">
                        <div class="playbook-meta">
                            <div class="account-info">
                                <h5 class="account-name">${pb.accountName}</h5>
                                <div class="account-details">
                                    <span class="account-tier">${account.tier}</span>
                                    <span class="account-industry">${account.industry}</span>
                                    <span class="account-size">${account.companySize}</span>
                                </div>
                            </div>
                            <div class="playbook-strategy">
                                <div class="strategy-type">${this.formatPlaybookType(playbook.type)}</div>
                                <div class="strategy-value">$${this.formatCurrency(totalOpportunityValue)} potential</div>
                            </div>
                        </div>
                        <div class="playbook-expand" onclick="app.togglePlaybook('${pb.accountId}')">
                            <span class="expand-text">View Strategy</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="playbook-content" id="playbook-${pb.accountId}" style="display: none;">
                        <div class="strategy-overview">
                            <div class="strategy-description">
                                <h6>Strategy Overview</h6>
                                <p>${playbook.description}</p>
                            </div>
                        </div>
                        
                        <div class="playbook-tabs">
                            <div class="tab-nav">
                                <button class="tab-btn active" onclick="app.switchPlaybookTab('${pb.accountId}', 'execution')">Execution Plan</button>
                                <button class="tab-btn" onclick="app.switchPlaybookTab('${pb.accountId}', 'team')">Team & Metrics</button>
                                <button class="tab-btn" onclick="app.switchPlaybookTab('${pb.accountId}', 'competitive')">Competitive Intel</button>
                            </div>
                            
                            <div class="tab-content">
                                <div class="tab-panel active" data-tab="execution">
                                    <div class="execution-roadmap">
                                        <h6>Execution Timeline</h6>
                                        <div class="roadmap-timeline">
                                            ${Object.entries(playbook.timeline).map(([period, activity], index) => `
                                                <div class="roadmap-milestone ${index === 0 ? 'current' : ''}">
                                                    <div class="milestone-marker">
                                                        <div class="milestone-number">${index + 1}</div>
                                                    </div>
                                                    <div class="milestone-content">
                                                        <div class="milestone-period">${period}</div>
                                                        <div class="milestone-description">${activity}</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-panel" data-tab="team">
                                    <div class="team-metrics-grid">
                                        <div class="team-section">
                                            <h6>Key Stakeholders</h6>
                                            <div class="team-list">
                                                ${playbook.stakeholders.map(stakeholder => `
                                                    <div class="team-member">
                                                        <div class="member-role">${stakeholder.role}</div>
                                                        <div class="member-duty">${stakeholder.responsibility}</div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="metrics-section">
                                            <h6>Success Metrics</h6>
                                            <div class="metrics-list">
                                                ${Object.entries(playbook.successMetrics).map(([metric, target]) => `
                                                    <div class="metric-item">
                                                        <div class="metric-name">${metric}</div>
                                                        <div class="metric-target">${target}</div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-panel" data-tab="competitive">
                                    <div class="competitive-intelligence">
                                        <div class="intel-section">
                                            <h6>Competitive Landscape</h6>
                                            <div class="competitors-overview">
                                                <div class="primary-competitors">
                                                    <span class="label">Primary Threats:</span>
                                                    <span class="competitors">${playbook.competitiveInsights.primaryCompetitors.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="intel-section">
                                            <h6>Our Competitive Advantages</h6>
                                            <div class="advantages-list">
                                                ${playbook.competitiveInsights.competitiveAdvantages.map(advantage => `
                                                    <div class="advantage-point">${advantage}</div>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="intel-section">
                                            <h6>Counter-Strategies</h6>
                                            <div class="strategies-list">
                                                ${playbook.competitiveInsights.counterStrategies.map(strategy => `
                                                    <div class="strategy-point">${strategy}</div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="playbook-actions">
                            <button class="action-btn primary" onclick="app.showDetailedPlaybook('${pb.accountId}')">
                                View Full Playbook
                            </button>
                            <button class="action-btn secondary" onclick="app.exportPlaybook('${pb.accountId}')">
                                Export Strategy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        playbooksContainer.innerHTML = playbooksHTML;
    }

    formatPlaybookType(type) {
        const typeMap = {
            'aggressive-expansion': 'High-Velocity Expansion',
            'strategic-growth': 'Strategic Growth',
            'platform-deepening': 'Platform Deepening',
            'relationship-building': 'Relationship Building',
            'trust-establishment': 'Trust Establishment',
            'tactical-expansion': 'Tactical Expansion'
        };
        return typeMap[type] || type;
    }

    togglePlaybook(accountId) {
        const content = document.getElementById(`playbook-${accountId}`);
        const isVisible = content.style.display !== 'none';
        
        // Close all other playbooks
        document.querySelectorAll('.playbook-content').forEach(el => {
            el.style.display = 'none';
        });
        
        // Toggle current playbook
        if (!isVisible) {
            content.style.display = 'block';
        }
        
        // Update expand icon
        document.querySelectorAll('.playbook-expand svg').forEach(icon => {
            icon.style.transform = 'rotate(0deg)';
        });
        
        if (!isVisible) {
            const expandIcon = content.previousElementSibling.querySelector('.playbook-expand svg');
            expandIcon.style.transform = 'rotate(180deg)';
        }
    }

    showDetailedPlaybook(accountId) {
        const playbooks = this.engine.generateExpansionPlaybooks();
        const playbook = playbooks.find(pb => pb.accountId === accountId);
        
        if (!playbook) return;
        
        const modalContent = `
            <div class="detailed-playbook">
                <div class="playbook-overview">
                    <h4>${playbook.playbook.title}</h4>
                    <p class="playbook-desc">${playbook.playbook.description}</p>
                </div>
                
                <div class="phases-section">
                    <h5>Execution Phases</h5>
                    <div class="phases-timeline">
                        ${playbook.playbook.phases.map((phase, index) => `
                            <div class="phase-item">
                                <div class="phase-header">
                                    <div class="phase-number">${phase.phase}</div>
                                    <div class="phase-title">${phase.title}</div>
                                    <div class="phase-duration">${phase.duration}</div>
                                </div>
                                <div class="phase-activities">
                                    <ul>
                                        ${phase.activities.map(activity => `<li>${activity}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="resources-section">
                    <h5>Required Resources</h5>
                    <ul class="resources-list">
                        ${playbook.playbook.resources.map(resource => `<li>${resource}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="risks-section">
                    <h5>Risk Assessment & Mitigation</h5>
                    <div class="risks-grid">
                        ${playbook.playbook.riskMitigation.map(risk => `
                            <div class="risk-card risk-${risk.likelihood.toLowerCase()}">
                                <div class="risk-title">${risk.risk}</div>
                                <div class="risk-details">
                                    <span class="risk-likelihood">Likelihood: ${risk.likelihood}</span>
                                    <span class="risk-impact">Impact: ${risk.impact}</span>
                                </div>
                                <div class="risk-mitigation">${risk.mitigation}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modal-body-content').innerHTML = modalContent;
        document.getElementById('opportunity-modal').style.display = 'flex';
    }

    switchPlaybookTab(accountId, tabName) {
        const playbook = document.querySelector(`[data-account-id="${accountId}"]`);
        if (!playbook) return;
        
        // Update tab buttons
        const tabBtns = playbook.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        playbook.querySelector(`[onclick*="'${tabName}'"]`).classList.add('active');
        
        // Update tab panels
        const tabPanels = playbook.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => panel.classList.remove('active'));
        playbook.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    exportPlaybook(accountId) {
        const playbooks = this.engine.generateExpansionPlaybooks();
        const playbook = playbooks.find(pb => pb.accountId === accountId);
        
        if (!playbook) return;
        
        // Create downloadable content
        const exportData = {
            playbook: playbook.playbook,
            exportedAt: new Date().toISOString(),
            account: playbook.accountName
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${playbook.accountName.replace(/\s+/g, '_')}_expansion_playbook.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    displayMatrix(matrix) {
        const matrixContainer = document.getElementById('whitespace-matrix');
        
        // Create matrix table
        const accounts = this.engine.accounts;
        const products = this.engine.products;
        
        let tableHTML = '<table class="matrix-table">';
        
        // Header row
        tableHTML += '<thead><tr>';
        tableHTML += '<th class="account-header">Account</th>';
        products.forEach(product => {
            tableHTML += `<th>${product.name}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Data rows
        tableHTML += '<tbody>';
        accounts.forEach(account => {
            tableHTML += '<tr>';
            tableHTML += `<th class="account-header">${account.name}</th>`;
            
            products.forEach(product => {
                const cell = matrix[account.id][product.id];
                const statusClass = cell.status;
                let cellContent = '';
                
                if (cell.status === 'adopted') {
                    cellContent = '✓ Adopted';
                } else if (cell.status === 'opportunity') {
                    cellContent = `
                        <div class="opportunity-value">$${this.formatCurrency(cell.opportunityValue)}</div>
                        <div class="opportunity-details">Click for details</div>
                    `;
                } else {
                    cellContent = 'N/A';
                }
                
                const clickable = cell.status === 'opportunity' ? 'clickable' : '';
                tableHTML += `
                    <td class="matrix-cell ${statusClass} ${clickable}" 
                        data-account="${account.id}" 
                        data-product="${product.id}">
                        ${cellContent}
                    </td>
                `;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        matrixContainer.innerHTML = tableHTML;
        
        // Add click event listeners to opportunity cells
        this.addMatrixEventListeners();
    }

    addMatrixEventListeners() {
        const opportunityCells = document.querySelectorAll('.matrix-cell.opportunity');
        opportunityCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const accountId = cell.dataset.account;
                const productId = cell.dataset.product;
                this.showOpportunityDetails(accountId, productId);
            });
        });
    }

    displayDashboard(opportunities, stats) {
        // Top opportunities
        const topOpportunitiesHTML = opportunities.slice(0, 5).map(opp => `
            <div class="opportunity-item">
                <div class="opportunity-info">
                    <div class="opportunity-account">${opp.account.name}</div>
                    <div class="opportunity-product">${opp.product.name}</div>
                </div>
                <div class="opportunity-value-display">
                    <div class="value">$${this.formatCurrency(opp.opportunityValue)}</div>
                    <div class="score">Score: ${opp.score}</div>
                </div>
            </div>
        `).join('');
        document.getElementById('top-opportunities').innerHTML = topOpportunitiesHTML;
        
        // Product opportunities
        const productOppsHTML = Object.entries(stats.opportunitiesByProduct)
            .sort((a, b) => b[1].value - a[1].value)
            .slice(0, 5)
            .map(([product, data]) => `
                <div class="opportunity-item">
                    <div class="opportunity-info">
                        <div class="opportunity-account">${product}</div>
                        <div class="opportunity-product">${data.count} opportunities</div>
                    </div>
                    <div class="opportunity-value-display">
                        <div class="value">$${this.formatCurrency(data.value)}</div>
                    </div>
                </div>
            `).join('');
        document.getElementById('product-opportunities').innerHTML = productOppsHTML;
        
        // Account priorities - enhanced with whitespace metrics
        let accountPrioritiesHTML;
        
        if (stats.whitespaceMetrics && stats.whitespaceMetrics.topWhitespaceAccounts) {
            accountPrioritiesHTML = stats.whitespaceMetrics.topWhitespaceAccounts
                .map(account => `
                    <div class="opportunity-item">
                        <div class="opportunity-info">
                            <div class="opportunity-account">${account.name}</div>
                            <div class="opportunity-product">${account.penetrationRate}% penetrated • ${account.growthStage} stage</div>
                        </div>
                        <div class="opportunity-value-display">
                            <div class="value">$${this.formatCurrency(account.whitespaceValue)}</div>
                            <div class="score">Whitespace</div>
                        </div>
                    </div>
                `).join('');
        } else {
            // Fallback to opportunity-based priorities
            accountPrioritiesHTML = Object.entries(stats.opportunitiesByAccount)
                .sort((a, b) => b[1].value - a[1].value)
                .slice(0, 5)
                .map(([account, data]) => `
                    <div class="opportunity-item">
                        <div class="opportunity-info">
                            <div class="opportunity-account">${account}</div>
                            <div class="opportunity-product">${data.count} opportunities</div>
                        </div>
                        <div class="opportunity-value-display">
                            <div class="value">$${this.formatCurrency(data.value)}</div>
                        </div>
                    </div>
                `).join('');
        }
        
        document.getElementById('account-priorities').innerHTML = accountPrioritiesHTML;
    }

    showOpportunityDetails(accountId, productId) {
        const account = this.engine.accounts.find(a => a.id === accountId);
        const product = this.engine.products.find(p => p.id === productId);
        const score = this.engine.calculateOpportunityScore(account, product);
        
        // Get enhanced account intelligence
        const accountOpportunities = this.engine.getAccountOpportunities(account);
        const expansionReadiness = this.engine.calculateExpansionReadiness(account);
        const growthTrajectory = this.engine.analyzeGrowthTrajectory(account);
        const riskFactors = this.engine.identifyRiskFactors(account);
        const nextBestAction = this.engine.getNextBestAction(account, accountOpportunities);
        
        const scoreBadgeClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
        const scoreBadgeText = score >= 70 ? '🟢 HIGH PROBABILITY' : score >= 40 ? '🟡 MEDIUM PROBABILITY' : '🔴 LOW PROBABILITY';
        
        const modalContent = `
            <div class="detail-section">
                <h4>Account Overview</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Account Name</div>
                        <div class="detail-value">${account.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Current ARR</div>
                        <div class="detail-value">$${this.formatCurrency(account.currentARR)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Total Market Potential</div>
                        <div class="detail-value highlight">$${this.formatCurrency(account.totalMarketPotential)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Whitespace Value</div>
                        <div class="detail-value highlight">$${this.formatCurrency(account.whitespaceValue)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Market Penetration</div>
                        <div class="detail-value">${account.penetrationRate}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Growth Stage</div>
                        <div class="detail-value">${account.growthStage}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Product Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Product Name</div>
                        <div class="detail-value">${product.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Category</div>
                        <div class="detail-value">${product.category}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">List Price</div>
                        <div class="detail-value">$${this.formatCurrency(product.listPrice)}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Opportunity Analysis</h4>
                <div class="detail-item">
                    <div class="detail-label">Opportunity Score</div>
                    <div class="detail-value highlight">${score}/100</div>
                    <div class="score-badge ${scoreBadgeClass}">${scoreBadgeText}</div>
                </div>
                
                <h4 style="margin-top: var(--space-lg); margin-bottom: var(--space-md);">Why this score?</h4>
                <ul class="insight-list">
                    <li><strong>Market Penetration:</strong> ${account.penetrationRate < 50 ? 'Low penetration rate indicates significant expansion opportunity' : 'Higher penetration rate suggests limited remaining upside'}</li>
                    <li><strong>Growth Stage:</strong> ${account.growthStage === 'growth' ? 'Account is in growth stage, making them ready for expansion' : 'Account maturity may impact expansion timing and adoption speed'}</li>
                    <li><strong>Prerequisites:</strong> ${this.engine.checkProductPrerequisites(account, product) ? 'All prerequisite products are adopted, ready for immediate implementation' : 'Requires foundation products to be adopted first before expansion'}</li>
                    <li><strong>Strategic Fit:</strong> ${product.category === 'Platform' ? 'Core platform product provides foundation for future expansions' : product.category === 'Security' ? 'Security solutions are typically high-priority for enterprise accounts' : 'Complementary product enhances overall platform value'}</li>
                </ul>
            </div>
            
            <div class="detail-section">
                <h4>🎯 Account Intelligence</h4>
                <div class="intelligence-grid">
                    <div class="intelligence-item">
                        <div class="intelligence-label">Expansion Readiness</div>
                        <div class="intelligence-value">
                            <span class="readiness-score readiness-${expansionReadiness.level.toLowerCase()}">${expansionReadiness.score}/100</span>
                            <span class="readiness-level">${expansionReadiness.level} Readiness</span>
                        </div>
                    </div>
                    <div class="intelligence-item">
                        <div class="intelligence-label">Growth Trajectory</div>
                        <div class="intelligence-value">
                            <span class="trajectory-indicator">${growthTrajectory.trajectory}</span>
                            <span class="trajectory-growth">+${growthTrajectory.projectedGrowth}% projected</span>
                        </div>
                    </div>
                </div>
                
                <div class="readiness-factors">
                    <h5>Readiness Factors</h5>
                    <div class="factors-list">
                        ${expansionReadiness.factors.map(factor => `
                            <div class="factor-item">
                                <div class="factor-name">${factor.factor}</div>
                                <div class="factor-score">${factor.score}pts</div>
                                <div class="factor-note">${factor.note}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>⚡ Next Best Action</h4>
                <div class="action-recommendation">
                    <p class="next-action">${nextBestAction}</p>
                </div>
                
                ${riskFactors.length > 0 ? `
                    <h5>Risk Factors</h5>
                    <div class="risk-factors">
                        ${riskFactors.map(risk => `
                            <div class="risk-item risk-${risk.severity.toLowerCase()}">
                                <div class="risk-header">
                                    <span class="risk-name">${risk.risk}</span>
                                    <span class="risk-severity">${risk.severity}</span>
                                </div>
                                <div class="risk-mitigation">${risk.mitigation}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <h5>Growth Drivers</h5>
                <ul class="growth-drivers">
                    ${growthTrajectory.keyDrivers.map(driver => `<li>${driver}</li>`).join('')}
                </ul>
            </div>
        `;
        
        document.getElementById('modal-body-content').innerHTML = modalContent;
        document.getElementById('opportunity-modal').style.display = 'flex';
    }

    showQuarterBreakdown(quarter, quarterData) {
        // Parse the quarter data if it's a string
        const data = typeof quarterData === 'string' ? JSON.parse(quarterData.replace(/&quot;/g, '"')) : quarterData;
        
        console.log('Quarter breakdown data:', quarter, data);
        
        if (!data.breakdown || data.breakdown.length === 0) {
            alert(`${quarter.toUpperCase()} has no opportunities assigned yet.`);
            return;
        }
        
        const modalContent = `
            <div class="detail-section">
                <h4>${quarter.toUpperCase()} Revenue Breakdown</h4>
                <div class="quarter-summary">
                    <div class="summary-stat">
                        <span class="stat-label">Total New ARR</span>
                        <span class="stat-value highlight">$${this.formatCurrency(data.newARR)}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Confidence Level</span>
                        <span class="stat-value">${data.confidenceLevel}%</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-label">Opportunities</span>
                        <span class="stat-value">${data.breakdown.length}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Individual Opportunities</h4>
                <div class="opportunities-list">
                    ${data.breakdown.map(opp => `
                        <div class="opportunity-breakdown-item">
                            <div class="opp-header">
                                <div class="opp-title">
                                    <strong>${opp.account}</strong> → ${opp.product}
                                </div>
                                <div class="opp-values">
                                    <span class="projected-value">$${this.formatCurrency(opp.projectedValue)}</span>
                                    <span class="score-indicator score-${opp.score >= 70 ? 'high' : opp.score >= 50 ? 'medium' : 'low'}">${opp.score}</span>
                                </div>
                            </div>
                            <div class="opp-details">
                                <div class="calculation">${opp.calculation}</div>
                                <div class="reasoning">${opp.reasoning}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Why ${quarter.toUpperCase()}?</h4>
                <div class="quarter-explanation">
                    ${quarter === 'q1' ? 
                        'These are high-confidence opportunities (score 80+) or opportunities with prerequisites already met. They represent our best near-term expansion prospects.' :
                    quarter === 'q2' ?
                        'These opportunities are in growth-stage accounts with medium confidence scores (50-64). They need some nurturing but should close within 6 months.' :
                    quarter === 'q3' ?
                        'These opportunities require more development and account nurturing (score 35-49). Timeline depends on relationship building and product readiness.' :
                        'These are speculative opportunities with long-term potential (score <35). They represent future expansion possibilities that need significant development.'
                    }
                </div>
            </div>
        `;
        
        document.getElementById('modal-body-content').innerHTML = modalContent;
        document.getElementById('opportunity-modal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('opportunity-modal').style.display = 'none';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    switchScenario(scenario) {
        this.currentScenario = scenario;
        
        // Update button states
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-scenario="${scenario}"]`).classList.add('active');
        
        // Recalculate and display projections
        if (this.currentProjections) {
            this.updateProjectionsDisplay();
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Update display
        if (this.currentProjections) {
            this.updateProjectionsDisplay();
        }
    }

    updateProjectionsDisplay() {
        const projections = this.currentProjections;
        const scenario = this.currentScenario;
        
        // Calculate scenario multipliers
        const multipliers = {
            conservative: 0.7,
            expected: 1.0,
            optimistic: 1.4
        };
        
        const multiplier = multipliers[scenario];
        const quarters = projections.quarters;
        
        if (this.currentView === 'quarterly') {
            this.displayQuarterlyView(quarters, multiplier, scenario);
        } else {
            this.displayMonthlyView(quarters, multiplier, scenario);
        }
    }

    displayQuarterlyView(quarters, multiplier, scenario) {
        const container = document.getElementById('projections-display');
        
        const quartersHTML = Object.entries(quarters).map(([quarter, data]) => {
            const adjustedNewARR = Math.round(data.newARR * multiplier);
            const adjustedTotalARR = data.totalARR - data.newARR + adjustedNewARR;
            
            return `
                <div class="projection-quarter clickable-quarter" data-quarter="${quarter}">
                    <div class="quarter-label">${quarter.toUpperCase()} Target</div>
                    <div class="quarter-value">$${this.formatCurrency(adjustedTotalARR)}</div>
                    <div class="quarter-growth">+${this.formatCurrency(adjustedNewARR)} new ARR</div>
                    <div class="quarter-confidence">${data.confidenceLevel}% confidence</div>
                    <div class="quarter-count">${data.breakdown ? data.breakdown.length : 0} opportunities</div>
                    <div class="scenario-indicator">${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = quartersHTML;
        
        // Re-add event listeners
        this.addQuarterClickListeners();
    }

    displayMonthlyView(quarters, multiplier, scenario) {
        const container = document.getElementById('projections-display');
        
        // Convert quarterly data to monthly breakdown
        const monthlyData = this.convertToMonthlyBreakdown(quarters, multiplier);
        
        const monthsHTML = monthlyData.map((month, index) => `
            <div class="projection-month">
                <div class="month-label">${month.name}</div>
                <div class="month-value">$${this.formatCurrency(month.totalARR)}</div>
                <div class="month-growth">+${this.formatCurrency(month.newARR)} new ARR</div>
                <div class="month-confidence">${month.confidence}% confidence</div>
                <div class="month-opportunities">${month.opportunities} opportunities</div>
            </div>
        `).join('');
        
        container.innerHTML = monthsHTML;
    }

    convertToMonthlyBreakdown(quarters, multiplier) {
        const months = [];
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        let cumulativeARR = this.currentProjections.current;
        
        Object.entries(quarters).forEach(([quarter, data], qIndex) => {
            const monthsInQuarter = 3;
            const quarterlyNewARR = Math.round(data.newARR * multiplier);
            const monthlyNewARR = Math.round(quarterlyNewARR / monthsInQuarter);
            
            for (let m = 0; m < monthsInQuarter; m++) {
                const monthIndex = qIndex * 3 + m;
                const isLastMonthOfQuarter = m === monthsInQuarter - 1;
                const adjustedMonthlyARR = isLastMonthOfQuarter 
                    ? quarterlyNewARR - (monthlyNewARR * 2) // Adjust for rounding
                    : monthlyNewARR;
                
                cumulativeARR += adjustedMonthlyARR;
                
                months.push({
                    name: monthNames[monthIndex],
                    newARR: adjustedMonthlyARR,
                    totalARR: cumulativeARR,
                    confidence: data.confidenceLevel - (m * 5), // Slightly lower confidence as month progresses
                    opportunities: Math.ceil((data.breakdown?.length || 0) / monthsInQuarter)
                });
            }
        });
        
        return months;
    }

    addQuarterClickListeners() {
        const quarterElements = document.querySelectorAll('.projection-quarter');
        quarterElements.forEach(element => {
            element.addEventListener('click', () => {
                const quarter = element.dataset.quarter;
                const quarterData = this.currentProjections.quarters[quarter];
                this.showQuarterBreakdown(quarter, quarterData);
            });
        });
    }

    // Advanced Analytics Dashboard Functions
    displayAdvancedAnalytics(stats, opportunities) {
        this.displayKeyMetrics(stats, opportunities);
        this.displayAnalyticsCharts(stats, opportunities);
        this.initializeAnalyticsInteractivity();
    }

    displayKeyMetrics(stats, opportunities) {
        // Total Pipeline Value
        const totalPipeline = opportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0);
        document.getElementById('total-pipeline-value').textContent = `$${this.formatCurrency(totalPipeline)}`;
        
        // High-Probability Opportunities
        const highProbOpps = opportunities.filter(opp => opp.score >= 70);
        document.getElementById('qualified-opportunities').textContent = highProbOpps.length;
        document.getElementById('opportunities-trend').textContent = `${highProbOpps.length} ready for immediate action`;
        
        // Average Account Penetration
        const avgPenetration = this.engine.accounts.reduce((sum, acc) => sum + acc.penetrationRate, 0) / this.engine.accounts.length;
        document.getElementById('average-penetration').textContent = `${Math.round(avgPenetration)}%`;
        document.getElementById('penetration-trend').textContent = `${Math.round(100 - avgPenetration)}% whitespace remaining`;
        
        // Expansion Velocity Score
        const velocityScore = this.calculateExpansionVelocityScore(stats, opportunities);
        document.getElementById('expansion-velocity').textContent = velocityScore;
        document.getElementById('velocity-trend').textContent = 'Speed of opportunity execution';
    }

    calculateExpansionVelocityScore(stats, opportunities) {
        // Calculate based on opportunity scoring, account readiness, and market dynamics
        const avgScore = opportunities.reduce((sum, opp) => sum + opp.score, 0) / opportunities.length;
        const readinessScore = this.engine.accounts.reduce((sum, acc) => sum + acc.expansionReadiness, 0) / this.engine.accounts.length;
        const velocityScore = Math.round((avgScore + readinessScore) / 2);
        return velocityScore;
    }

    displayAnalyticsCharts(stats, opportunities) {
        // Revenue Opportunity Heatmap
        this.renderOpportunityHeatmap(opportunities);
        
        // Account Growth Trajectory
        this.renderGrowthTrajectory(stats);
        
        // Expansion Success Probability
        this.renderProbabilityDistribution(opportunities);
        
        // Competitive Risk Assessment
        this.renderCompetitiveRiskAssessment(stats);
        
        // Strategic Account Performance Matrix
        this.renderPerformanceMatrix(stats);
    }

    renderOpportunityHeatmap(opportunities) {
        const heatmapContainer = document.getElementById('opportunity-heatmap');
        
        // Group opportunities by account and product
        const heatmapData = {};
        opportunities.forEach(opp => {
            if (!heatmapData[opp.account.name]) {
                heatmapData[opp.account.name] = {};
            }
            heatmapData[opp.account.name][opp.product.name] = opp.score;
        });

        let heatmapHTML = '<div class="heatmap-grid">';
        
        Object.entries(heatmapData).slice(0, 5).forEach(([accountName, products]) => {
            heatmapHTML += `<div class="heatmap-row">
                <div class="heatmap-label">${accountName}</div>
                <div class="heatmap-cells">`;
            
            Object.entries(products).forEach(([productName, score]) => {
                const intensity = score / 100;
                const colorClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
                heatmapHTML += `<div class="heatmap-cell ${colorClass}" 
                    title="${productName}: ${score}%" 
                    style="opacity: ${0.3 + intensity * 0.7}">
                    ${Math.round(score)}%
                </div>`;
            });
            
            heatmapHTML += `</div></div>`;
        });
        
        heatmapHTML += '</div>';
        heatmapContainer.innerHTML = heatmapHTML;
    }

    renderGrowthTrajectory(stats) {
        const trajectoryContainer = document.getElementById('growth-trajectory');
        
        // Simulate growth trajectory data
        const trajectoryData = this.engine.accounts.slice(0, 5).map(account => ({
            name: account.name,
            current: account.currentARR,
            projected3m: account.currentARR * 1.08,
            projected6m: account.currentARR * 1.18,
            projected12m: account.currentARR * 1.35
        }));

        let trajectoryHTML = '<div class="trajectory-chart">';
        
        trajectoryData.forEach(account => {
            const growth12m = ((account.projected12m - account.current) / account.current * 100).toFixed(1);
            trajectoryHTML += `
                <div class="trajectory-item">
                    <div class="trajectory-account">${account.name}</div>
                    <div class="trajectory-bar">
                        <div class="trajectory-current" style="width: 30%">
                            <span>Current: $${this.formatCurrency(account.current)}</span>
                        </div>
                        <div class="trajectory-growth" style="width: 70%">
                            <span>+${growth12m}% growth potential</span>
                        </div>
                    </div>
                    <div class="trajectory-target">Target: $${this.formatCurrency(account.projected12m)}</div>
                </div>
            `;
        });
        
        trajectoryHTML += '</div>';
        trajectoryContainer.innerHTML = trajectoryHTML;
    }

    renderProbabilityDistribution(opportunities) {
        const probabilityContainer = document.getElementById('probability-distribution');
        
        // Calculate probability distribution
        const distribution = {
            high: opportunities.filter(opp => opp.score >= 70).length,
            medium: opportunities.filter(opp => opp.score >= 40 && opp.score < 70).length,
            low: opportunities.filter(opp => opp.score < 40).length
        };

        const total = distribution.high + distribution.medium + distribution.low;
        
        let distributionHTML = `
            <div class="probability-chart">
                <div class="probability-bar">
                    <div class="prob-segment high" style="width: ${(distribution.high/total)*100}%">
                        <span>${distribution.high}</span>
                    </div>
                    <div class="prob-segment medium" style="width: ${(distribution.medium/total)*100}%">
                        <span>${distribution.medium}</span>
                    </div>
                    <div class="prob-segment low" style="width: ${(distribution.low/total)*100}%">
                        <span>${distribution.low}</span>
                    </div>
                </div>
                <div class="probability-legend">
                    <div class="legend-item">
                        <span class="legend-color high"></span>
                        High Probability (${Math.round((distribution.high/total)*100)}%)
                    </div>
                    <div class="legend-item">
                        <span class="legend-color medium"></span>
                        Medium Probability (${Math.round((distribution.medium/total)*100)}%)
                    </div>
                    <div class="legend-item">
                        <span class="legend-color low"></span>
                        Low Probability (${Math.round((distribution.low/total)*100)}%)
                    </div>
                </div>
            </div>
        `;
        
        probabilityContainer.innerHTML = distributionHTML;
    }

    renderCompetitiveRiskAssessment(stats) {
        const riskContainer = document.getElementById('competitive-risk');
        
        // Simulate competitive risk data
        const riskAccounts = this.engine.accounts.slice(0, 4).map(account => ({
            name: account.name,
            riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
            threats: ['Salesforce', 'HubSpot', 'Microsoft'][Math.floor(Math.random() * 3)]
        }));

        let riskHTML = '<div class="risk-assessment">';
        
        riskAccounts.forEach(account => {
            const riskColor = account.riskLevel === 'high' ? 'var(--color-error)' : 
                             account.riskLevel === 'medium' ? 'var(--color-warning)' : 'var(--color-success)';
            
            riskHTML += `
                <div class="risk-item">
                    <div class="risk-account">
                        <span class="risk-indicator" style="background: ${riskColor}"></span>
                        ${account.name}
                    </div>
                    <div class="risk-level">${account.riskLevel.toUpperCase()} RISK</div>
                    <div class="risk-threat">Primary threat: ${account.threats}</div>
                </div>
            `;
        });
        
        riskHTML += '</div>';
        riskContainer.innerHTML = riskHTML;
    }

    renderPerformanceMatrix(stats) {
        const matrixContainer = document.getElementById('performance-matrix');
        
        // Create scatter plot data
        const matrixData = this.engine.accounts.map(account => ({
            name: account.name,
            x: account.currentARR,
            y: account.expansionReadiness || Math.random() * 100,
            size: account.whitespaceValue,
            color: account.penetrationRate > 60 ? 'var(--color-success)' : 
                   account.penetrationRate > 30 ? 'var(--color-warning)' : 'var(--color-primary)'
        }));

        let matrixHTML = `
            <div class="performance-scatter">
                <div class="scatter-plot">
        `;
        
        matrixData.forEach(point => {
            const xPos = Math.min(90, (point.x / Math.max(...matrixData.map(p => p.x))) * 80 + 10);
            const yPos = Math.min(90, (point.y / 100) * 80 + 10);
            const bubbleSize = Math.min(20, Math.max(8, (point.size / Math.max(...matrixData.map(p => p.size))) * 15 + 5));
            
            matrixHTML += `
                <div class="scatter-point" 
                     style="left: ${xPos}%; bottom: ${yPos}%; width: ${bubbleSize}px; height: ${bubbleSize}px; background: ${point.color}"
                     title="${point.name}: ARR $${this.formatCurrency(point.x)}, Score ${Math.round(point.y)}%">
                </div>
            `;
        });
        
        matrixHTML += `
                </div>
                <div class="scatter-axes">
                    <div class="x-axis-label">Current ARR →</div>
                    <div class="y-axis-label">Opportunity Score ↑</div>
                </div>
            </div>
        `;
        
        matrixContainer.innerHTML = matrixHTML;
    }

    initializeAnalyticsInteractivity() {
        // Analytics button handlers
        document.querySelectorAll('.analytics-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from siblings
                e.target.parentElement.querySelectorAll('.analytics-btn').forEach(sibling => {
                    sibling.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Handle timeframe changes, filter changes, etc.
                const timeframe = e.target.dataset.timeframe;
                if (timeframe) {
                    this.updateGrowthTrajectory(timeframe);
                }
            });
        });

        // Analytics select handlers
        document.querySelectorAll('.analytics-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.target.id;
                const value = e.target.value;
                
                if (id === 'heatmap-filter') {
                    this.filterHeatmap(value);
                } else if (id.includes('matrix-')) {
                    this.updatePerformanceMatrix();
                }
            });
        });
    }

    updateGrowthTrajectory(timeframe) {
        // Update trajectory based on selected timeframe
        console.log(`Updating growth trajectory for ${timeframe}`);
    }

    filterHeatmap(filter) {
        // Filter heatmap based on selection
        console.log(`Filtering heatmap by ${filter}`);
    }

    updatePerformanceMatrix() {
        // Update matrix based on axis selections
        console.log('Updating performance matrix');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.app = new WhitespaceApp();
});