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

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

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
                element.textContent = prefix + '$' + (current / 1000000).toFixed(1) + 'M';
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
    }

    // ==========================================================================
    // Demo ROI Calculator (in demo section)
    // ==========================================================================

    const calcTeam = document.getElementById('calc-team');
    const calcDeal = document.getElementById('calc-deal');
    const calcHours = document.getElementById('calc-hours');
    const calcSolution = document.getElementById('calc-solution');

    const calcTeamValue = document.getElementById('calc-team-value');
    const calcHoursValue = document.getElementById('calc-hours-value');

    const calcTime = document.getElementById('calc-time');
    const calcProductivity = document.getElementById('calc-productivity');
    const calcDev = document.getElementById('calc-dev');
    const calcRoi = document.getElementById('calc-roi');

    const HOURLY_RATE = 100;
    const DEVELOPER_COST = 150000;
    const GLUE_COST = 30000;
    const WEEKS_PER_YEAR = 52;

    function calculateDemoROI() {
        if (!calcTeam || !calcDeal || !calcHours) return;

        const teamSize = parseInt(calcTeam.value) || 10;
        const avgDeal = parseInt(calcDeal.value) || 25000;
        const hoursWasted = parseInt(calcHours.value) || 8;

        if (calcTeamValue) calcTeamValue.textContent = teamSize;
        if (calcHoursValue) calcHoursValue.textContent = hoursWasted + ' hrs';

        const timeSavedPerWeek = hoursWasted * 0.7 * teamSize;
        const timeSavedAnnual = Math.round(timeSavedPerWeek * WEEKS_PER_YEAR);
        const productivityValue = timeSavedAnnual * HOURLY_RATE;
        const devSavings = DEVELOPER_COST - GLUE_COST;
        const totalValue = productivityValue + devSavings;
        const roi = Math.round((totalValue / GLUE_COST) * 100);

        if (calcTime) calcTime.textContent = timeSavedAnnual.toLocaleString() + ' hours';
        if (calcProductivity) calcProductivity.textContent = '$' + productivityValue.toLocaleString();
        if (calcDev) calcDev.textContent = '$' + devSavings.toLocaleString();
        if (calcRoi) calcRoi.textContent = roi.toLocaleString() + '%';
    }

    if (calcTeam) calcTeam.addEventListener('input', calculateDemoROI);
    if (calcDeal) calcDeal.addEventListener('input', calculateDemoROI);
    if (calcHours) calcHours.addEventListener('input', calculateDemoROI);
    if (calcSolution) calcSolution.addEventListener('change', calculateDemoROI);

    calculateDemoROI();

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
    // Demo Visualizer Interactions
    // ==========================================================================

    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    const accountItems = document.querySelectorAll('.viz-accounts .account-item');

    accountItems.forEach(item => {
        item.addEventListener('click', () => {
            accountItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
        });
    });

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
