/**
 * Whitespace Visualizer — Interactive Tool
 */

document.addEventListener('DOMContentLoaded', function() {
    // State
    let selectedAccountId = null;
    let currentView = 'products';

    // DOM Elements
    const accountList = document.getElementById('account-list');
    const vizGrid = document.getElementById('viz-grid');
    const vizAccountName = document.getElementById('viz-account-name');
    const vizViewType = document.getElementById('viz-view-type');
    const vizLegend = document.getElementById('viz-legend');
    const filterTabs = document.querySelectorAll('.filter-tab');

    // Summary elements
    const totalWhitespaceEl = document.getElementById('total-whitespace');
    const coverageScoreEl = document.getElementById('coverage-score');
    const priorityRankEl = document.getElementById('priority-rank');

    // Account detail elements
    const statArr = document.getElementById('stat-arr');
    const statHealth = document.getElementById('stat-health');
    const statIndustry = document.getElementById('stat-industry');

    // ==========================================================================
    // Initialize
    // ==========================================================================

    function init() {
        renderAccountList();
        setupFilterTabs();
        setupMobileMenu();

        // Select first account by default
        if (DEMO_ACCOUNTS.length > 0) {
            selectAccount(DEMO_ACCOUNTS[0].id);
        }
    }

    // ==========================================================================
    // Render Account List
    // ==========================================================================

    function renderAccountList() {
        accountList.innerHTML = DEMO_ACCOUNTS.map(account => {
            const whitespace = calculateTotalWhitespace(account, 'products');
            return `
                <div class="account-item" data-account-id="${account.id}">
                    <span class="account-item-name">${account.name}</span>
                    <span class="account-item-value">${formatCurrency(whitespace)}</span>
                </div>
            `;
        }).join('');

        // Add click handlers
        accountList.querySelectorAll('.account-item').forEach(item => {
            item.addEventListener('click', () => {
                selectAccount(item.dataset.accountId);
            });
        });
    }

    // ==========================================================================
    // Select Account
    // ==========================================================================

    function selectAccount(accountId) {
        selectedAccountId = accountId;
        const account = DEMO_ACCOUNTS.find(a => a.id === accountId);

        if (!account) return;

        // Update selected state in list
        accountList.querySelectorAll('.account-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.accountId === accountId);
        });

        // Update account details
        updateAccountDetails(account);

        // Update visualization
        renderVisualization(account, currentView);

        // Update summary
        updateSummary(account, currentView);
    }

    // ==========================================================================
    // Update Account Details
    // ==========================================================================

    function updateAccountDetails(account) {
        statArr.textContent = formatCurrency(account.arr);
        statHealth.textContent = account.healthScore + '/100';
        statIndustry.textContent = account.industry;
    }

    // ==========================================================================
    // Filter Tabs
    // ==========================================================================

    function setupFilterTabs() {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;

                // Update active state
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update current view
                currentView = view;

                // Re-render if account selected
                if (selectedAccountId) {
                    const account = DEMO_ACCOUNTS.find(a => a.id === selectedAccountId);
                    if (account) {
                        renderVisualization(account, view);
                        updateSummary(account, view);
                    }
                }
            });
        });
    }

    // ==========================================================================
    // Render Visualization
    // ==========================================================================

    function renderVisualization(account, viewType) {
        const viewLabels = {
            products: 'Product Whitespace',
            regions: 'Regional Whitespace',
            segments: 'Segment Whitespace',
            modules: 'Module Gap Analysis'
        };

        // Update header
        vizAccountName.textContent = account.name;
        vizViewType.textContent = viewLabels[viewType];

        // Update legend based on view type
        updateLegend(viewType);

        // Handle modules view differently
        if (viewType === 'modules') {
            renderModuleMatrix(account);
            return;
        }

        const items = account[viewType];

        // Calculate max value for bar scaling
        const maxValue = Math.max(...items.map(item => item.value || 0), 1);

        // Render rows
        vizGrid.innerHTML = items.map((item, index) => {
            const barWidth = item.value > 0 ? Math.round((item.value / maxValue) * 100) : 0;
            const statusClass = item.status.replace('_', '-');

            let statusText = '';
            let statusBadge = '';

            if (item.status === 'adopted') {
                statusText = 'Adopted';
            } else if (item.status === 'opportunity') {
                statusText = formatCurrency(item.value);
                if (item.likelihood) {
                    statusBadge = `<span class="status-badge ${item.likelihood}">${item.likelihood}</span>`;
                }
            } else {
                statusText = item.reason || 'N/A';
            }

            return `
                <div class="viz-row ${statusClass}" style="animation-delay: ${index * 0.05}s">
                    <div class="viz-row-name">${item.name}</div>
                    <div class="viz-row-bar">
                        <div class="viz-row-bar-fill ${statusClass}" style="width: ${barWidth}%"></div>
                    </div>
                    <div class="viz-row-status ${statusClass}">
                        ${statusText}
                        ${statusBadge}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ==========================================================================
    // Update Legend
    // ==========================================================================

    function updateLegend(viewType) {
        if (viewType === 'modules') {
            vizLegend.innerHTML = `
                <span class="legend-item">
                    <span class="legend-dot adopted"></span>
                    Has Module
                </span>
                <span class="legend-item">
                    <span class="legend-dot opportunity"></span>
                    Missing Module
                </span>
            `;
        } else {
            vizLegend.innerHTML = `
                <span class="legend-item">
                    <span class="legend-dot adopted"></span>
                    Adopted
                </span>
                <span class="legend-item">
                    <span class="legend-dot opportunity"></span>
                    Opportunity
                </span>
                <span class="legend-item">
                    <span class="legend-dot not-applicable"></span>
                    Not Applicable
                </span>
            `;
        }
    }

    // ==========================================================================
    // Render Module Matrix
    // ==========================================================================

    function renderModuleMatrix(account) {
        const moduleHeaders = MODULES.map(m =>
            `<th class="module-header"><span>${m.name}</span></th>`
        ).join('');

        const moduleCells = MODULES.map(m => {
            const hasModule = account.modules && account.modules[m.id];
            const statusClass = hasModule ? 'has-module' : 'no-module';
            const icon = hasModule
                ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17L4 12"/></svg>`
                : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
            return `<td class="module-status ${statusClass}">${icon}</td>`;
        }).join('');

        vizGrid.innerHTML = `
            <div class="module-matrix">
                <table class="module-table">
                    <thead>
                        <tr>
                            <th class="company-header">Account</th>
                            ${moduleHeaders}
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="module-row">
                            <td class="company-name">${account.name}</td>
                            ${moduleCells}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // ==========================================================================
    // Update Summary
    // ==========================================================================

    function updateSummary(account, viewType) {
        // Handle modules view differently
        if (viewType === 'modules') {
            const adoption = calculateModuleAdoption(account);
            const gaps = getModuleGaps(account);

            // Update labels for module view
            document.querySelector('.summary-card.highlight .summary-label').textContent = 'Module Gaps';
            document.querySelector('.summary-card:nth-child(2) .summary-label').textContent = 'Adoption Rate';
            document.querySelector('.summary-card:nth-child(3) .summary-label').textContent = 'Modules Active';

            totalWhitespaceEl.textContent = gaps.length + ' gaps';
            coverageScoreEl.textContent = adoption.percentage + '%';
            priorityRankEl.textContent = adoption.adopted + ' of ' + adoption.total;
            return;
        }

        // Reset labels for non-module views
        document.querySelector('.summary-card.highlight .summary-label').textContent = 'Total Whitespace';
        document.querySelector('.summary-card:nth-child(2) .summary-label').textContent = 'Coverage Score';
        document.querySelector('.summary-card:nth-child(3) .summary-label').textContent = 'Priority Rank';

        const whitespace = calculateTotalWhitespace(account, viewType);
        const coverage = calculateCoverageScore(account, viewType);
        const rank = calculatePriorityRank(DEMO_ACCOUNTS, account.id);

        // Animate counter for whitespace
        animateValue(totalWhitespaceEl, whitespace, true);

        // Update coverage
        coverageScoreEl.textContent = coverage + '%';

        // Update rank
        priorityRankEl.textContent = '#' + rank + ' of ' + DEMO_ACCOUNTS.length;
    }

    // ==========================================================================
    // Animate Value
    // ==========================================================================

    function animateValue(element, target, isCurrency = false) {
        const duration = 800;
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (target - startValue) * easeOut);

            element.textContent = isCurrency ? formatCurrency(current) : current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ==========================================================================
    // Mobile Menu
    // ==========================================================================

    function setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });

            // Close on link click
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                });
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active') &&
                    !navLinks.contains(e.target) &&
                    !mobileMenuBtn.contains(e.target)) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            });
        }
    }

    // ==========================================================================
    // Start
    // ==========================================================================

    init();
});
