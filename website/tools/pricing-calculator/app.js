/**
 * SaaS Pricing Calculator - Main Application
 * UI interactions and data visualization for the pricing strategy platform
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

class PricingApp {
    constructor() {
        this.engine = new PricingEngine();
        this.currentGoal = 10000; // Default goal: $10K ARR
        this.chart = null;
        this.comparisonModels = [];
        
        this.initializeEventListeners();
        this.loadDefaultModel();
        
        // Delay initial projection update to ensure DOM is ready
        setTimeout(() => {
            this.updateProjections();
        }, 100);
    }

    initializeEventListeners() {
        // Template selector
        document.getElementById('template-selector').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadTemplate(e.target.value);
            }
        });

        // Add tier button
        document.getElementById('add-tier-btn').addEventListener('click', () => {
            this.addTier();
        });

        // Save model button
        document.getElementById('save-model-btn').addEventListener('click', () => {
            this.saveModel();
        });

        // Goal buttons
        document.querySelectorAll('.goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setGoal(parseInt(e.target.dataset.goal));
                this.updateGoalButtons(e.target);
            });
        });

        // Custom goal input
        document.getElementById('custom-goal').addEventListener('input', (e) => {
            const customGoal = parseInt(e.target.value);
            if (customGoal > 0) {
                this.setGoal(customGoal);
                this.updateGoalButtons(null); // Clear active goal buttons
            }
        });

        // Metric inputs
        ['churn-rate', 'cac', 'growth-rate'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateProjections();
            });
        });

        // Comparison controls
        document.getElementById('add-comparison-btn').addEventListener('click', () => {
            this.addModelToComparison();
        });

        // Export controls
        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('share-model-btn').addEventListener('click', () => {
            this.shareModel();
        });
    }

    loadDefaultModel() {
        // Start with a simple 3-tier model
        this.engine.createModel({
            name: 'My Pricing Model',
            tiers: [
                {
                    id: this.engine.generateId(),
                    name: 'Starter',
                    price: 29,
                    billingCycle: 'monthly',
                    targetPercentage: 50,
                    conversionRate: 8,
                    features: ['Basic features', 'Email support', 'Standard integrations']
                },
                {
                    id: this.engine.generateId(),
                    name: 'Professional',
                    price: 99,
                    billingCycle: 'monthly',
                    targetPercentage: 35,
                    conversionRate: 4,
                    features: ['Advanced features', 'Priority support', 'Advanced integrations', 'Custom reporting']
                },
                {
                    id: this.engine.generateId(),
                    name: 'Enterprise',
                    price: 299,
                    billingCycle: 'monthly',
                    targetPercentage: 15,
                    conversionRate: 1,
                    features: ['All features', 'Dedicated support', 'Custom integrations', 'SLA']
                }
            ]
        });

        this.renderPricingTiers();
    }

    loadTemplate(templateName) {
        const model = this.engine.loadTemplate(templateName);
        if (model) {
            this.renderPricingTiers();
            this.updateProjections();
            
            // Show success message
            this.showNotification(`Loaded ${model.name} template`, 'success');
        }
    }

    addTier() {
        const tier = this.engine.addTier({
            name: `Tier ${this.engine.currentModel.tiers.length + 1}`,
            price: 99,
            billingCycle: 'monthly',
            targetPercentage: 20,
            conversionRate: 5,
            features: ['Standard features', 'Support included']
        });

        this.renderPricingTiers();
        this.updateProjections();
        
        // Focus on the new tier's name input
        setTimeout(() => {
            const newTierInput = document.querySelector(`[data-tier-id="${tier.id}"] .tier-name-input`);
            if (newTierInput) newTierInput.focus();
        }, 100);
    }

    renderPricingTiers() {
        const container = document.getElementById('pricing-tiers');
        container.innerHTML = '';

        if (!this.engine.currentModel || this.engine.currentModel.tiers.length === 0) {
            container.innerHTML = '<p class="empty-state">Add your first pricing tier to get started</p>';
            return;
        }

        this.engine.currentModel.tiers.forEach(tier => {
            const tierElement = this.createTierElement(tier);
            container.appendChild(tierElement);
        });
    }

    createTierElement(tier) {
        const tierDiv = document.createElement('div');
        tierDiv.className = 'pricing-tier-card';
        tierDiv.setAttribute('data-tier-id', tier.id);

        tierDiv.innerHTML = `
            <div class="tier-header">
                <input type="text" class="tier-name-input" value="${escapeAttr(tier.name)}" placeholder="Tier name">
                <button class="remove-tier-btn" title="Remove tier">×</button>
            </div>

            <div class="tier-pricing">
                <div class="price-input-group">
                    <span class="price-symbol">$</span>
                    <input type="number" class="tier-price-input" value="${escapeAttr(tier.price)}" min="0" step="1">
                    <select class="tier-billing-select">
                        <option value="monthly" ${tier.billingCycle === 'monthly' ? 'selected' : ''}>per month</option>
                        <option value="annual" ${tier.billingCycle === 'annual' ? 'selected' : ''}>per year</option>
                    </select>
                </div>
            </div>

            <div class="tier-metrics">
                <div class="metric-group">
                    <label>Customer Distribution</label>
                    <input type="number" class="tier-percentage-input" value="${escapeAttr(tier.targetPercentage)}" min="0" max="100" step="5">
                    <span class="metric-suffix">% of customers</span>
                </div>
                <div class="metric-group">
                    <label>Conversion Rate</label>
                    <input type="number" class="tier-conversion-input" value="${escapeAttr(tier.conversionRate)}" min="0" max="100" step="0.5">
                    <span class="metric-suffix">% of leads</span>
                </div>
            </div>

            <div class="tier-features">
                <label>Key features</label>
                <textarea class="tier-features-input" rows="4" placeholder="Core features&#10;Email support&#10;Basic integrations&#10;Monthly reports">${escapeHTML(tier.features.join('\n'))}</textarea>
            </div>
        `;

        // Add event listeners
        this.addTierEventListeners(tierDiv, tier.id);

        return tierDiv;
    }

    addTierEventListeners(tierElement, tierId) {
        // Name input
        tierElement.querySelector('.tier-name-input').addEventListener('input', (e) => {
            this.engine.updateTier(tierId, { name: e.target.value });
        });

        // Price input
        tierElement.querySelector('.tier-price-input').addEventListener('input', (e) => {
            this.engine.updateTier(tierId, { price: parseFloat(e.target.value) || 0 });
            this.updateProjections();
        });

        // Billing cycle select
        tierElement.querySelector('.tier-billing-select').addEventListener('change', (e) => {
            this.engine.updateTier(tierId, { billingCycle: e.target.value });
            this.updateProjections();
        });

        // Target percentage input
        tierElement.querySelector('.tier-percentage-input').addEventListener('input', (e) => {
            this.engine.updateTier(tierId, { targetPercentage: parseFloat(e.target.value) || 0 });
            this.updateProjections();
        });

        // Conversion rate input
        tierElement.querySelector('.tier-conversion-input').addEventListener('input', (e) => {
            this.engine.updateTier(tierId, { conversionRate: parseFloat(e.target.value) || 0 });
            this.updateProjections();
        });

        // Features textarea
        tierElement.querySelector('.tier-features-input').addEventListener('input', (e) => {
            const features = e.target.value.split('\n').filter(f => f.trim());
            this.engine.updateTier(tierId, { features });
        });

        // Remove tier button
        tierElement.querySelector('.remove-tier-btn').addEventListener('click', () => {
            this.removeTier(tierId);
        });
    }

    removeTier(tierId) {
        if (this.engine.currentModel.tiers.length <= 1) {
            this.showNotification('You must have at least one pricing tier', 'error');
            return;
        }

        this.engine.removeTier(tierId);
        this.renderPricingTiers();
        this.updateProjections();
    }

    setGoal(goal) {
        this.currentGoal = goal;
        this.updateProjections();
    }

    updateGoalButtons(activeButton) {
        document.querySelectorAll('.goal-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    updateProjections() {
        const constraints = {
            monthlyChurnRate: parseFloat(document.getElementById('churn-rate').value) || 5,
            customerAcquisitionCost: parseFloat(document.getElementById('cac').value) || 500,
            monthlyGrowthRate: parseFloat(document.getElementById('growth-rate').value) || 20
        };

        const projection = this.engine.calculateProjection(this.currentGoal, constraints);
        console.log('Projection:', projection); // Debug log
        this.renderProjectionResults(projection);
        this.updateChart(projection);
    }

    renderProjectionResults(projection) {
        if (!projection.success) {
            this.showProjectionError(projection.error);
            return;
        }

        // Update metrics
        const months = Math.max(1, Math.round(projection.timeToTarget.months));
        const years = Math.round(months / 12 * 10) / 10;
        
        document.getElementById('time-to-goal').textContent = 
            months < 12 ? `${months} months` : `${months} months (${years} years)`;
        
        document.getElementById('customers-needed').textContent = 
            Math.max(1, projection.requiredCustomers).toLocaleString();
        
        document.getElementById('monthly-new-customers').textContent = 
            Math.max(1, projection.monthlyNewCustomers).toLocaleString();
        
        document.getElementById('customer-ltv').textContent = 
            `$${Math.max(0, Math.round(projection.customerLTV)).toLocaleString()}`;
        
        const ltvCacRatio = projection.ltvCacRatio > 0 ? projection.ltvCacRatio : 0;
        document.getElementById('ltv-cac-ratio').textContent = 
            `${Math.round(ltvCacRatio * 10) / 10}:1`;
        
        document.getElementById('gross-margin').textContent = 
            `${Math.round(projection.grossMargin * 100)}%`;

        // Update tier breakdown if needed
        this.renderTierBreakdown(projection.tierBreakdown);
    }

    renderTierBreakdown(tierBreakdown) {
        // Create or update tier breakdown visualization
        // This could be a pie chart or bar chart showing revenue by tier
        console.log('Tier breakdown:', tierBreakdown);
    }

    showProjectionError(error) {
        // Clear all metric displays
        ['time-to-goal', 'customers-needed', 'monthly-new-customers', 
         'customer-ltv', 'ltv-cac-ratio', 'gross-margin'].forEach(id => {
            document.getElementById(id).textContent = 'N/A';
        });

        this.showNotification(`Projection Error: ${error}`, 'error');
    }

    updateChart(projection) {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;
        
        // Wait for next frame if canvas has no size yet
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            requestAnimationFrame(() => this.updateChart(projection));
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Set the internal size to match display size, accounting for device pixel ratio
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // Scale all drawing operations by the dpr
        ctx.scale(dpr, dpr);
        
        // Use CSS to set the display size
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        if (!projection || !projection.success || !projection.timeline || projection.timeline.length < 2) {
            // Show placeholder
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Configure pricing tiers to see projections', rect.width / 2, rect.height / 2);
            return;
        }

        // Simple chart rendering
        this.renderSimpleChart(ctx, projection.timeline, rect.width, rect.height);
    }

    renderSimpleChart(ctx, timeline, displayWidth, displayHeight) {
        const width = displayWidth || 600;
        const height = displayHeight || 300;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!timeline || timeline.length < 2) {
            // Show placeholder text
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Configure pricing tiers to see projections', width / 2, height / 2);
            return;
        }

        // Set up chart dimensions
        const padding = 50;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Find max values for scaling
        const maxRevenue = Math.max(...timeline.map(t => t.revenue || 0));
        const maxMonth = timeline[timeline.length - 1].month || 1;

        // Prevent division by zero
        if (maxRevenue === 0 || maxMonth === 0) return;

        // Draw axes
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X-axis  
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw revenue line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();

        timeline.forEach((point, index) => {
            const x = padding + (point.month / maxMonth) * chartWidth;
            const y = height - padding - (point.revenue / maxRevenue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();

        // Add goal line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const goalY = height - padding - (this.currentGoal / maxRevenue) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, goalY);
        ctx.lineTo(width - padding, goalY);
        ctx.stroke();
        
        ctx.setLineDash([]);

        // Add labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Revenue Growth Timeline', padding, padding - 10);
        ctx.fillText(`Target: $${this.currentGoal.toLocaleString()}`, padding, goalY - 5);
        
        // Add axis labels
        ctx.textAlign = 'center';
        ctx.fillText('Months', width / 2, height - 10);
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('ARR ($)', 0, 0);
        ctx.restore();
    }

    addModelToComparison() {
        if (!this.engine.currentModel) {
            this.showNotification('Create a pricing model first', 'error');
            return;
        }

        // Clone current model for comparison
        const modelCopy = JSON.parse(JSON.stringify(this.engine.currentModel));
        modelCopy.id = this.engine.generateId();
        modelCopy.name = `${modelCopy.name} (Copy)`;
        
        this.comparisonModels.push(modelCopy);
        this.showComparison();
    }

    showComparison() {
        const section = document.getElementById('comparison-section');
        section.style.display = 'block';
        
        // Render comparison grid
        const grid = document.getElementById('comparison-grid');
        grid.innerHTML = '';

        this.comparisonModels.forEach(model => {
            const modelDiv = document.createElement('div');
            modelDiv.className = 'comparison-model-card';
            modelDiv.innerHTML = `
                <h4>${model.name}</h4>
                <div class="model-summary">
                    <p>Tiers: ${model.tiers.length}</p>
                    <p>Price Range: $${Math.min(...model.tiers.map(t => t.price))} - $${Math.max(...model.tiers.map(t => t.price))}</p>
                </div>
                <button class="remove-comparison-btn" data-model-id="${model.id}">Remove</button>
            `;
            grid.appendChild(modelDiv);
        });

        // Add event listeners for remove buttons
        grid.querySelectorAll('.remove-comparison-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modelId = e.target.dataset.modelId;
                this.comparisonModels = this.comparisonModels.filter(m => m.id !== modelId);
                this.showComparison();
            });
        });
    }

    saveModel() {
        if (!this.engine.currentModel) {
            this.showNotification('No model to save', 'error');
            return;
        }

        // In a real app, this would save to a backend
        const modelData = this.engine.exportModelData();
        localStorage.setItem(`pricing_model_${this.engine.currentModel.id}`, modelData);
        
        this.showNotification('Model saved successfully', 'success');
    }

    exportToPDF() {
        this.showNotification('PDF export feature coming soon', 'info');
    }

    exportToCSV() {
        if (!this.engine.currentModel) {
            this.showNotification('No model to export', 'error');
            return;
        }

        const csvData = this.engine.exportModelData('csv');
        this.downloadFile(csvData, 'pricing-model.csv', 'text/csv');
        
        this.showNotification('CSV exported successfully', 'success');
    }

    shareModel() {
        if (!this.engine.currentModel) {
            this.showNotification('No model to share', 'error');
            return;
        }

        // Generate shareable URL (in production, this would create a shared link)
        const modelData = btoa(JSON.stringify(this.engine.currentModel));
        const shareUrl = `${window.location.origin}${window.location.pathname}?model=${modelData}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showNotification('Shareable link copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Could not copy link to clipboard', 'error');
        });
    }

    downloadFile(data, filename, type) {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        // Create or update notification element
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `notification ${type} show`;

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Initialize the app when DOM is ready
    static init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.pricingApp = new PricingApp();
            });
        } else {
            window.pricingApp = new PricingApp();
        }
    }
}

// Auto-initialize
PricingApp.init();