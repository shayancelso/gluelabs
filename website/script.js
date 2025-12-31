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
    const processItems = document.querySelectorAll('.process-item');
    const processConnectors = document.querySelectorAll('.process-connector');

    if (processModern && (processCards.length > 0 || processItems.length > 0)) {
        const processObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate cards with stagger (old style)
                    processCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 200);
                    });

                    // Animate items with stagger (new clean style)
                    processItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 150);
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

    // ==========================================================================
    // Prototype Stack - Click to Swap with Dot Navigation
    // ==========================================================================

    const prototypeStack = document.querySelector('.prototype-stack');
    const prototypeDots = document.querySelectorAll('.prototype-dot');

    if (prototypeStack) {
        // Function to update dot active states
        function updatePrototypeDots() {
            const isSwapped = prototypeStack.classList.contains('swapped');
            prototypeDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === (isSwapped ? 1 : 0));
            });
        }

        // Click on images to swap
        prototypeStack.addEventListener('click', function(e) {
            // Don't swap if clicking on a dot (dots handle themselves)
            if (e.target.classList.contains('prototype-dot')) return;

            this.classList.toggle('swapped');
            updatePrototypeDots();
        });

        // Click on dots to swap
        prototypeDots.forEach((dot, index) => {
            dot.addEventListener('click', function(e) {
                e.stopPropagation();
                const isSwapped = prototypeStack.classList.contains('swapped');
                const shouldSwap = (index === 1 && !isSwapped) || (index === 0 && isSwapped);

                if (shouldSwap) {
                    prototypeStack.classList.toggle('swapped');
                    updatePrototypeDots();
                }
            });
        });

        // Add cursor pointer to indicate clickability
        prototypeStack.style.cursor = 'pointer';
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

// ==========================================================================
// Comparison Carousel Dots (Mobile)
// ==========================================================================

(function initComparisonCarousel() {
    const grid = document.querySelector('.comparison-grid');
    const dots = document.querySelectorAll('.comparison-dot');
    const cards = document.querySelectorAll('.comparison-card');

    if (!grid || !dots.length || !cards.length) return;

    // Update active dot based on scroll position
    function updateActiveDot() {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // var(--space-md) = 1.5rem = 24px
        const activeIndex = Math.round(scrollLeft / (cardWidth + gap));

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    // Scroll event listener
    grid.addEventListener('scroll', throttle(updateActiveDot, 50), { passive: true });

    // Dot click handler - scroll to card
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth;
            const gap = 24;
            const scrollTarget = index * (cardWidth + gap);

            grid.scrollTo({
                left: scrollTarget,
                behavior: 'smooth'
            });
        });
    });
})();

// ==========================================================================
// Testimonials Carousel Dots (Mobile)
// ==========================================================================

(function initTestimonialsCarousel() {
    const grid = document.querySelector('.testimonials-grid');
    const dots = document.querySelectorAll('.testimonial-dot');
    const cards = document.querySelectorAll('.testimonial-card');

    if (!grid || !dots.length || !cards.length) return;

    // Update active dot based on scroll position
    function updateActiveDot() {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // var(--space-md) = 1.5rem = 24px
        const activeIndex = Math.round(scrollLeft / (cardWidth + gap));

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    // Scroll event listener
    grid.addEventListener('scroll', throttle(updateActiveDot, 50), { passive: true });

    // Dot click handler - scroll to card
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth;
            const gap = 24;
            const scrollTarget = index * (cardWidth + gap);

            grid.scrollTo({
                left: scrollTarget,
                behavior: 'smooth'
            });
        });
    });
})();

// ==========================================================================
// Tool Library Carousel Dots (Mobile)
// ==========================================================================

(function initToolCarousel() {
    const grid = document.querySelector('.tools-bento-grid');
    const dotsContainer = document.getElementById('toolCarouselDots');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    const cards = document.querySelectorAll('.bento-card');

    if (!grid || !dots.length || !cards.length) return;

    // Update active dot based on scroll position (2 cards per page)
    function updateActiveDot() {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth;
        const gap = 8; // 0.5rem gap on mobile
        const pageWidth = (cardWidth * 2) + gap; // 2 cards per page
        const activeIndex = Math.round(scrollLeft / pageWidth);

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    // Throttle function for scroll performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Scroll event listener
    grid.addEventListener('scroll', throttle(updateActiveDot, 50), { passive: true });

    // Dot click handler - scroll to page (2 cards)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth;
            const gap = 8;
            const pageWidth = (cardWidth * 2) + gap;
            const scrollTarget = index * pageWidth;

            grid.scrollTo({
                left: scrollTarget,
                behavior: 'smooth'
            });
        });
    });

    // Initial update
    updateActiveDot();
})();

// ==========================================================================
// CTA Form Submission
// ==========================================================================

(function initCtaForm() {
    const form = document.getElementById('ctaForm');
    const formSuccess = document.getElementById('ctaFormSuccess');

    if (!form) return;

    // Handle form submission with AJAX
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success state
                form.style.display = 'none';
                if (formSuccess) {
                    formSuccess.style.display = 'block';
                }

                // Reset form after 5 seconds
                setTimeout(() => {
                    form.reset();
                    form.style.display = 'flex';
                    if (formSuccess) {
                        formSuccess.style.display = 'none';
                    }
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 5000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            alert('Something went wrong. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
})();
