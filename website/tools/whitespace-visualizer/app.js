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
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Single file upload handler
        document.getElementById('data-upload').addEventListener('change', (e) => this.handleSingleFileUpload(e));
        
        // Sample data loader
        document.getElementById('load-sample-data').addEventListener('click', () => this.loadSampleData());
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
        
        const quartersHTML = `
            <div class="projections-grid">
                <div class="projection-quarter">
                    <div class="quarter-label">Q1 Target</div>
                    <div class="quarter-value">$${this.formatCurrency(projections.q1.totalARR)}</div>
                    <div class="quarter-growth">+${projections.q1.growth}% growth</div>
                </div>
                <div class="projection-quarter">
                    <div class="quarter-label">Q2 Target</div>
                    <div class="quarter-value">$${this.formatCurrency(projections.q2.totalARR)}</div>
                    <div class="quarter-growth">+${projections.q2.growth}% growth</div>
                </div>
                <div class="projection-quarter">
                    <div class="quarter-label">Q3 Target</div>
                    <div class="quarter-value">$${this.formatCurrency(projections.q3.totalARR)}</div>
                    <div class="quarter-growth">+${projections.q3.growth}% growth</div>
                </div>
                <div class="projection-quarter">
                    <div class="quarter-label">Q4 Target</div>
                    <div class="quarter-value">$${this.formatCurrency(projections.q4.totalARR)}</div>
                    <div class="quarter-growth">+${projections.q4.growth}% growth</div>
                </div>
            </div>
            
            <div class="projections-summary">
                <div class="summary-section">
                    <h5>Year-End Forecast</h5>
                    <div class="summary-item highlight">
                        <span class="label">Total New ARR</span>
                        <span class="value">$${this.formatCurrency(projections.yearEnd.totalNewARR)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total ARR</span>
                        <span class="value">$${this.formatCurrency(projections.yearEnd.totalARR)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total Growth</span>
                        <span class="value">${projections.yearEnd.totalGrowth}%</span>
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
        
        projectionsContainer.innerHTML = quartersHTML;
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
        
        const message = `
🎯 WHITESPACE ANALYSIS

Account: ${account.name}
Current ARR: $${this.formatCurrency(account.currentARR)}
Total Market Potential: $${this.formatCurrency(account.totalMarketPotential)}
Whitespace Value: $${this.formatCurrency(account.whitespaceValue)}
Market Penetration: ${account.penetrationRate}%
Growth Stage: ${account.growthStage}

Product: ${product.name}
Category: ${product.category}
List Price: $${this.formatCurrency(product.listPrice)}

Opportunity Score: ${score}/100
${score >= 70 ? '🟢 HIGH PROBABILITY' : score >= 40 ? '🟡 MEDIUM PROBABILITY' : '🔴 LOW PROBABILITY'}

Why this score?
• Market penetration: ${account.penetrationRate < 50 ? 'Low penetration = high opportunity' : 'Higher penetration = limited upside'}
• Growth stage: ${account.growthStage === 'growth' ? 'Growth stage = expansion ready' : 'Account maturity impacts expansion timing'}
• Prerequisites: ${this.engine.checkProductPrerequisites(account, product) ? 'Ready for adoption' : 'Requires foundation products first'}
        `;
        
        alert(message);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.app = new WhitespaceApp();
});