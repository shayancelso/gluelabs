/**
 * Glue Website — Premium Interactions
 * Interactive demos, counters, FAQ accordion, and smooth animations
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================================
    // Navigation
    // ==========================================================================

    const nav = document.querySelector('.nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Throttled scroll handler for nav
    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
        if (lastScrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        lastScrollY = window.pageYOffset;
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking on backdrop (the ::before pseudo-element area)
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ==========================================================================
    // Smooth Scroll
    // ==========================================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // Scroll Animations
    // ==========================================================================

    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });

    animatedElements.forEach(el => observer.observe(el));

    // ==========================================================================
    // Process Modern Animation
    // ==========================================================================

    const processModern = document.querySelector('.process-modern');
    const processCards = document.querySelectorAll('.process-card');
    const processConnectors = document.querySelectorAll('.process-connector');

    if (processModern && processCards.length > 0) {
        const processObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate cards with stagger
                    processCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 200);
                    });

                    // Animate connectors after cards
                    processConnectors.forEach((connector, index) => {
                        setTimeout(() => {
                            connector.classList.add('visible');
                        }, (index + 1) * 200 + 100);
                    });

                    processObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        });

        processObserver.observe(processModern);
    }

    // ==========================================================================
    // Counter Animations
    // ==========================================================================

    function animateCounter(element) {
        const target = parseInt(element.dataset.count) || 0;
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * easeOut);

            if (target >= 1000000) {
                element.textContent = prefix + (current / 1000000).toFixed(1) + 'M';
            } else if (target >= 1000) {
                element.textContent = prefix + (current / 1000).toFixed(0) + 'K' + suffix;
            } else {
                element.textContent = prefix + current + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ==========================================================================
    // Demo Tabs
    // ==========================================================================

    const demoTabs = document.querySelectorAll('.demo-tab');
    const demoPanels = document.querySelectorAll('.demo-panel');

    demoTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            activateTab(tab);
        });

        // Keyboard navigation
        tab.addEventListener('keydown', (e) => {
            let targetIndex;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                targetIndex = (index + 1) % demoTabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                targetIndex = (index - 1 + demoTabs.length) % demoTabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                targetIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                targetIndex = demoTabs.length - 1;
            }

            if (targetIndex !== undefined) {
                demoTabs[targetIndex].focus();
                activateTab(demoTabs[targetIndex]);
            }
        });
    });

    function activateTab(tab) {
        const targetId = tab.dataset.tab;

        demoTabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        demoPanels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');

        const targetPanel = document.getElementById(`demo-${targetId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        // Initialize ROI chart when ROI tab is activated
        if (targetId === 'roi' && typeof window.initRoiChartNow === 'function') {
            setTimeout(window.initRoiChartNow, 100);
        }
    }

    // ==========================================================================
    // Demo ROI Calculator (in demo section) with Live Chart
    // ==========================================================================

    const calcTeam = document.getElementById('calc-team');
    const calcDeal = document.getElementById('calc-deal');
    const calcHours = document.getElementById('calc-hours');
    const calcSolution = document.getElementById('calc-solution');

    const calcTeamValue = document.getElementById('calc-team-value');
    const calcHoursValue = document.getElementById('calc-hours-value');

    const calcBreakeven = document.getElementById('calc-breakeven');
    const calcProductivity = document.getElementById('calc-productivity');
    const calcRoi = document.getElementById('calc-roi');

    const HOURLY_RATE = 100;
    const GLUE_COST = 30000;
    const WEEKS_PER_YEAR = 52;

    // Initialize ROI Chart
    let roiChart = null;
    const roiChartCanvas = document.getElementById('roi-chart');

    function initRoiChart() {
        if (!roiChartCanvas || typeof Chart === 'undefined') return;

        const ctx = roiChartCanvas.getContext('2d');

        roiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 25 }, (_, i) => i), // 0-24 months
                datasets: [
                    {
                        label: 'Cumulative Value',
                        data: [],
                        borderColor: '#a855f7',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    },
                    {
                        label: 'Investment',
                        data: [],
                        borderColor: '#f472b6',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        pointHoverRadius: 0
                    },
                    {
                        label: 'Break-even',
                        data: [],
                        borderColor: '#22c55e',
                        backgroundColor: '#22c55e',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointStyle: 'circle',
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 30, 0.9)',
                        titleColor: '#fff',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        filter: (item) => item.raw !== null,
                        callbacks: {
                            title: (items) => `Month ${items[0].label}`,
                            label: (item) => {
                                const value = item.raw;
                                if (value === null) return null;
                                if (item.dataset.label === 'Break-even') {
                                    return '✓ Break-even reached!';
                                }
                                return `${item.dataset.label}: $${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.4)',
                            font: { size: 10 },
                            maxTicksLimit: 7,
                            callback: (val) => val === 0 ? 'Now' : `${val}mo`
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.4)',
                            font: { size: 10 },
                            callback: (val) => {
                                if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
                                if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K';
                                return '$' + val;
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function calculateDemoROI() {
        if (!calcTeam || !calcDeal || !calcHours) return;

        const teamSize = parseInt(calcTeam.value) || 10;
        const avgDeal = parseInt(calcDeal.value) || 25000;
        const hoursWasted = parseInt(calcHours.value) || 8;

        if (calcTeamValue) calcTeamValue.textContent = teamSize;
        if (calcHoursValue) calcHoursValue.textContent = hoursWasted + ' hrs';

        // Calculate monthly value generation
        const timeSavedPerWeek = hoursWasted * 0.7 * teamSize;
        const monthlyValue = Math.round((timeSavedPerWeek * (WEEKS_PER_YEAR / 12)) * HOURLY_RATE);

        // Generate chart data for 24 months
        const cumulativeValues = [];
        const investmentLine = [];
        let breakEvenMonth = null;

        for (let month = 0; month <= 24; month++) {
            const cumulative = month * monthlyValue;
            cumulativeValues.push(cumulative);
            investmentLine.push(GLUE_COST);

            if (breakEvenMonth === null && cumulative >= GLUE_COST) {
                breakEvenMonth = month;
            }
        }

        // Create break-even point data (sparse array with only the break-even point)
        const breakEvenData = new Array(25).fill(null);
        if (breakEvenMonth !== null && breakEvenMonth <= 24) {
            breakEvenData[breakEvenMonth] = GLUE_COST;
        }

        // Initialize chart if needed, then update
        if (!roiChart && roiChartCanvas && typeof Chart !== 'undefined') {
            initRoiChart();
        }
        if (roiChart) {
            roiChart.data.datasets[0].data = cumulativeValues;
            roiChart.data.datasets[1].data = investmentLine;
            roiChart.data.datasets[2].data = breakEvenData;
            roiChart.update('none');
        }

        // Calculate final values
        const totalValue24Mo = cumulativeValues[24];
        const roi = Math.round(((totalValue24Mo - GLUE_COST) / GLUE_COST) * 100);

        // Update UI
        if (calcBreakeven) {
            calcBreakeven.textContent = breakEvenMonth
                ? `Month ${breakEvenMonth}`
                : 'Month 1';
        }
        if (calcProductivity) calcProductivity.textContent = '$' + totalValue24Mo.toLocaleString();
        if (calcRoi) calcRoi.textContent = roi.toLocaleString() + '%';
    }

    // Initialize chart when ROI panel becomes visible
    const roiPanel = document.getElementById('demo-roi');

    function tryInitChart() {
        if (!roiChart && roiChartCanvas && typeof Chart !== 'undefined') {
            initRoiChart();
            calculateDemoROI();
        } else if (roiChart) {
            calculateDemoROI();
        }
    }

    // Expose globally for activateTab to use
    window.initRoiChartNow = tryInitChart;

    // Watch for ROI panel becoming active
    if (roiPanel) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && roiPanel.classList.contains('active')) {
                    setTimeout(tryInitChart, 50);
                }
            });
        });
        observer.observe(roiPanel, { attributes: true });
    }

    // ROI tab click handler - most reliable method
    const roiTab = document.querySelector('[data-tab="roi"]');
    if (roiTab) {
        roiTab.addEventListener('click', () => {
            setTimeout(tryInitChart, 100);
            setTimeout(tryInitChart, 300); // Backup call
        });
    }

    // Input handlers
    if (calcTeam) calcTeam.addEventListener('input', calculateDemoROI);
    if (calcDeal) calcDeal.addEventListener('input', calculateDemoROI);
    if (calcHours) calcHours.addEventListener('input', calculateDemoROI);
    if (calcSolution) calcSolution.addEventListener('change', calculateDemoROI);

    // Initialize on page load if ROI panel is visible
    setTimeout(() => {
        if (roiPanel && roiPanel.classList.contains('active')) {
            tryInitChart();
        }
    }, 500);

    // ==========================================================================
    // Work-back Planner Interactivity
    // ==========================================================================

    const timelinePhases = document.querySelectorAll('.timeline-phase');
    const workbackProgress = document.querySelector('.workback-progress .progress-value');
    const timelineProgress = document.querySelector('.timeline-progress');
    const timelineToday = document.querySelector('.timeline-today');

    // Click to expand/collapse phase details on mobile
    timelinePhases.forEach(phase => {
        phase.addEventListener('click', () => {
            // On mobile, toggle active state for task visibility
            if (window.innerWidth <= 768) {
                const wasActive = phase.classList.contains('expanded');
                timelinePhases.forEach(p => p.classList.remove('expanded'));
                if (!wasActive) {
                    phase.classList.add('expanded');
                }
            }
        });
    });

    // Animate progress on scroll into view
    const workbackPanel = document.getElementById('demo-workback');
    if (workbackPanel) {
        const workbackObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate the progress ring
                    const ring = workbackPanel.querySelector('.progress-ring .ring-fill');
                    if (ring) {
                        ring.style.transition = 'stroke-dashoffset 1s ease-out';
                    }
                    // Animate the timeline progress bar
                    if (timelineProgress) {
                        timelineProgress.style.transition = 'width 1s ease-out';
                    }
                }
            });
        }, { threshold: 0.3 });

        workbackObserver.observe(workbackPanel);
    }

    // Hover effect to highlight related tasks
    timelinePhases.forEach(phase => {
        phase.addEventListener('mouseenter', () => {
            phase.style.transform = 'translateY(-2px)';
        });
        phase.addEventListener('mouseleave', () => {
            phase.style.transform = 'translateY(0)';
        });
    });

    // ==========================================================================
    // FAQ Accordion
    // ==========================================================================

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                faqItems.forEach(i => i.classList.remove('active'));

                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // ==========================================================================
    // Demo Visualizer Interactions - Interactive with Real Data
    // ==========================================================================

    // Demo data matching the real tool
    const demoData = {
        acme: {
            name: 'Acme Corp',
            whitespace: '$205K',
            coverage: '40%',
            rank: '#1 of 4',
            products: [
                { name: 'Core Platform', status: 'adopted', value: 'Adopted' },
                { name: 'Analytics Suite', status: 'adopted', value: 'Adopted' },
                { name: 'Enterprise API', status: 'opportunity', value: '$120K' },
                { name: 'Security Add-on', status: 'opportunity', value: '$85K' },
                { name: 'Mobile SDK', status: 'none', value: 'Not Applicable' }
            ],
            regions: [
                { name: 'North America', status: 'adopted', value: 'Adopted' },
                { name: 'EMEA', status: 'opportunity', value: '$95K' },
                { name: 'APAC', status: 'opportunity', value: '$110K' },
                { name: 'LATAM', status: 'none', value: 'Not Applicable' }
            ],
            segments: [
                { name: 'Enterprise', status: 'adopted', value: 'Adopted' },
                { name: 'Mid-Market', status: 'opportunity', value: '$145K' },
                { name: 'SMB', status: 'opportunity', value: '$60K' }
            ]
        },
        techstart: {
            name: 'TechStart Inc',
            whitespace: '$148K',
            coverage: '60%',
            rank: '#3 of 4',
            products: [
                { name: 'Core Platform', status: 'adopted', value: 'Adopted' },
                { name: 'Analytics Suite', status: 'opportunity', value: '$48K' },
                { name: 'Enterprise API', status: 'adopted', value: 'Adopted' },
                { name: 'Security Add-on', status: 'opportunity', value: '$65K' },
                { name: 'Mobile SDK', status: 'opportunity', value: '$35K' }
            ],
            regions: [
                { name: 'North America', status: 'adopted', value: 'Adopted' },
                { name: 'EMEA', status: 'adopted', value: 'Adopted' },
                { name: 'APAC', status: 'opportunity', value: '$88K' },
                { name: 'LATAM', status: 'opportunity', value: '$60K' }
            ],
            segments: [
                { name: 'Enterprise', status: 'opportunity', value: '$78K' },
                { name: 'Mid-Market', status: 'adopted', value: 'Adopted' },
                { name: 'SMB', status: 'opportunity', value: '$70K' }
            ]
        },
        globalco: {
            name: 'GlobalCo',
            whitespace: '$245K',
            coverage: '33%',
            rank: '#2 of 4',
            products: [
                { name: 'Core Platform', status: 'adopted', value: 'Adopted' },
                { name: 'Analytics Suite', status: 'opportunity', value: '$75K' },
                { name: 'Enterprise API', status: 'opportunity', value: '$95K' },
                { name: 'Security Add-on', status: 'opportunity', value: '$75K' },
                { name: 'Mobile SDK', status: 'none', value: 'Not Applicable' }
            ],
            regions: [
                { name: 'North America', status: 'adopted', value: 'Adopted' },
                { name: 'EMEA', status: 'opportunity', value: '$120K' },
                { name: 'APAC', status: 'opportunity', value: '$85K' },
                { name: 'LATAM', status: 'opportunity', value: '$40K' }
            ],
            segments: [
                { name: 'Enterprise', status: 'adopted', value: 'Adopted' },
                { name: 'Mid-Market', status: 'opportunity', value: '$165K' },
                { name: 'SMB', status: 'opportunity', value: '$80K' }
            ]
        },
        fastgrow: {
            name: 'FastGrow LLC',
            whitespace: '$77K',
            coverage: '75%',
            rank: '#4 of 4',
            products: [
                { name: 'Core Platform', status: 'adopted', value: 'Adopted' },
                { name: 'Analytics Suite', status: 'adopted', value: 'Adopted' },
                { name: 'Enterprise API', status: 'adopted', value: 'Adopted' },
                { name: 'Security Add-on', status: 'opportunity', value: '$42K' },
                { name: 'Mobile SDK', status: 'opportunity', value: '$35K' }
            ],
            regions: [
                { name: 'North America', status: 'adopted', value: 'Adopted' },
                { name: 'EMEA', status: 'adopted', value: 'Adopted' },
                { name: 'APAC', status: 'opportunity', value: '$47K' },
                { name: 'LATAM', status: 'opportunity', value: '$30K' }
            ],
            segments: [
                { name: 'Enterprise', status: 'adopted', value: 'Adopted' },
                { name: 'Mid-Market', status: 'adopted', value: 'Adopted' },
                { name: 'SMB', status: 'opportunity', value: '$77K' }
            ]
        }
    };

    let currentAccount = 'acme';
    let currentFilter = 'product';

    const demoFilterOptions = document.getElementById('demo-filter-options');
    const demoAccounts = document.getElementById('demo-accounts');
    const demoVizGrid = document.getElementById('demo-viz-grid');
    const demoVizTitle = document.getElementById('demo-viz-title');
    const demoWindowTitle = document.getElementById('demo-window-title');
    const demoWhitespaceValue = document.getElementById('demo-whitespace-value');
    const demoCoverageValue = document.getElementById('demo-coverage-value');
    const demoRankValue = document.getElementById('demo-rank-value');

    function renderDemoViz() {
        const account = demoData[currentAccount];
        if (!account || !demoVizGrid) return;

        const filterLabels = { product: 'Product', region: 'Regional', segment: 'Segment' };
        const dataKey = currentFilter === 'product' ? 'products' : currentFilter === 'region' ? 'regions' : 'segments';
        const items = account[dataKey] || [];

        // Update titles
        if (demoVizTitle) demoVizTitle.textContent = `${account.name} — ${filterLabels[currentFilter]} Whitespace`;
        if (demoWindowTitle) demoWindowTitle.textContent = `Whitespace Visualizer — ${account.name} Dashboard`;

        // Update summary
        if (demoWhitespaceValue) demoWhitespaceValue.textContent = account.whitespace;
        if (demoCoverageValue) demoCoverageValue.textContent = account.coverage;
        if (demoRankValue) demoRankValue.textContent = account.rank;

        // Render grid
        demoVizGrid.innerHTML = items.map((item, i) => `
            <div class="viz-product ${item.status === 'opportunity' ? 'highlight' : ''}" style="animation-delay: ${i * 0.05}s">
                <span class="product-name">${item.name}</span>
                <div class="product-bar"><div class="bar-fill ${item.status}" style="width: 100%"></div></div>
                <span class="product-status ${item.status}">${item.status === 'opportunity' ? item.value + ' Opportunity' : item.value}</span>
            </div>
        `).join('');
    }

    // Filter button clicks
    if (demoFilterOptions) {
        demoFilterOptions.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                demoFilterOptions.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderDemoViz();
            });
        });
    }

    // Account item clicks
    if (demoAccounts) {
        demoAccounts.querySelectorAll('.account-item').forEach(item => {
            item.addEventListener('click', () => {
                demoAccounts.querySelectorAll('.account-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                currentAccount = item.dataset.account;
                renderDemoViz();
            });
        });
    }

    // Initial render
    renderDemoViz();

    // ==========================================================================
    // Interactive Chart Bars
    // ==========================================================================

    const chartBars = document.querySelectorAll('.chart-bar, .glue-bar');

    chartBars.forEach(bar => {
        bar.addEventListener('mouseenter', () => {
            chartBars.forEach(b => b.classList.remove('active'));
            bar.classList.add('active');
        });
    });

    // ==========================================================================
    // Hero Title Animation
    // ==========================================================================

    const heroTitle = document.querySelector('.hero h1');

    if (heroTitle) {
        const lines = heroTitle.querySelectorAll('.hero-line');
        lines.forEach((line, index) => {
            line.style.opacity = '0';
            line.style.transform = 'translateY(40px)';

            setTimeout(() => {
                line.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
            }, 300 + (index * 150));
        });
    }

    // ==========================================================================
    // Card Hover Effects (Desktop Only)
    // ==========================================================================

    const cards = document.querySelectorAll('.service-card, .member-card, .case-card, .testimonial-card');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ==========================================================================
    // Magnetic Buttons (Desktop Only)
    // ==========================================================================

    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-nav');

    if (!isTouchDevice) {
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ==========================================================================
    // Parallax Orbs (Desktop Only - disabled on mobile for performance)
    // ==========================================================================

    const orbs = document.querySelectorAll('.orb');

    if (!isTouchDevice && window.innerWidth > 768) {
        window.addEventListener('scroll', throttle(() => {
            const scrollY = window.pageYOffset;

            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 0.03;
                orb.style.transform = `translate(${scrollY * speed * 0.5}px, ${scrollY * speed}px)`;
            });
        }, 16));
    }

    // ==========================================================================
    // Page Load Animation (handled via CSS to prevent flash)
    // ==========================================================================

    // Remove loading class once DOM is ready
    document.body.classList.add('loaded');

    // ==========================================================================
    // Keyboard Navigation
    // ==========================================================================

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ==========================================================================
    // Tool Library Category Filter
    // ==========================================================================

    const toolCategoryBtns = document.querySelectorAll('.tool-category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    toolCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            toolCategoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;

            // Filter tools
            toolCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.3s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ==========================================================================
    // Heatmap Cell Animation
    // ==========================================================================

    const heatmapCells = document.querySelectorAll('.heatmap-cell');
    let heatmapInterval;

    function animateHeatmap() {
        const randomIndex = Math.floor(Math.random() * heatmapCells.length);
        heatmapCells.forEach((cell, index) => {
            if (index === randomIndex) {
                const classes = ['hot', 'warm', 'cold'];
                const newClass = classes[Math.floor(Math.random() * classes.length)];
                cell.classList.remove('hot', 'warm', 'cold');
                cell.classList.add(newClass);
            }
        });
    }

    const heroSection = document.querySelector('.hero');

    if (heroSection && heatmapCells.length > 0) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    heatmapInterval = setInterval(animateHeatmap, 1500);
                } else {
                    clearInterval(heatmapInterval);
                }
            });
        }, { threshold: 0.2 });

        heroObserver.observe(heroSection);
    }

});

// ==========================================================================
// Utility: Throttle
// ==========================================================================

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==========================================================================
// Mobile Section Dots
// ==========================================================================

(function initMobileSectionDots() {
    const dots = document.querySelectorAll('.section-dot');
    if (!dots.length) return;

    const sections = [
        { id: 'hero', el: document.querySelector('.hero') },
        { id: 'demo', el: document.getElementById('demo') },
        { id: 'about', el: document.getElementById('about') },
        { id: 'how-it-works', el: document.getElementById('how-it-works') },
        { id: 'case-study', el: document.getElementById('case-study') },
        { id: 'contact', el: document.getElementById('contact') }
    ].filter(s => s.el);

    // Click handler for dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const sectionId = dot.dataset.section;
            const section = sectionId === 'hero'
                ? document.querySelector('.hero')
                : document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Intersection observer to track active section
    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || 'hero';
                dots.forEach(dot => {
                    dot.classList.toggle('active', dot.dataset.section === sectionId);
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section.el) observer.observe(section.el);
    });
})();
