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
        const items = account[viewType];
        const viewLabels = {
            products: 'Product Whitespace',
            regions: 'Regional Whitespace',
            segments: 'Segment Whitespace'
        };

        // Update header
        vizAccountName.textContent = account.name;
        vizViewType.textContent = viewLabels[viewType];

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
    // Update Summary
    // ==========================================================================

    function updateSummary(account, viewType) {
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
