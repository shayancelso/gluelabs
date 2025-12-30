/**
 * Gloo Website - GSAP Animations
 * Retool-inspired scroll and interaction animations
 *
 * Dependencies: GSAP Core, ScrollTrigger, TextPlugin
 */

(function() {
    'use strict';

    // ========================================
    // Configuration & Detection
    // ========================================

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Exit early if user prefers reduced motion
    if (prefersReducedMotion) {
        console.log('Reduced motion preferred - GSAP animations disabled');
        return;
    }

    // ========================================
    // GSAP Registration
    // ========================================

    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // ========================================
    // Hero Typewriter Effect
    // ========================================

    const HeroTypewriter = {
        phrases: ['whitespace', 'ROI calculator', 'account health'],
        currentIndex: 0,
        textElement: null,
        isTyping: false,

        init() {
            const highlightEl = document.querySelector('.hero-highlight');
            if (!highlightEl) return;

            // Create typewriter structure
            highlightEl.innerHTML = `<span class="typewriter-text"></span><span class="typewriter-cursor">|</span>`;

            this.textElement = highlightEl.querySelector('.typewriter-text');
            if (!this.textElement) return;

            // Start typing after hero animations complete
            setTimeout(() => this.startCycle(), 1000);
        },

        startCycle() {
            this.typePhrase(this.phrases[this.currentIndex]);
        },

        typePhrase(phrase) {
            this.isTyping = true;

            // Type out the phrase character by character
            gsap.to(this.textElement, {
                duration: phrase.length * 0.08,
                text: phrase,
                ease: 'none',
                onComplete: () => {
                    // Hold for 3 seconds, then delete
                    setTimeout(() => this.deletePhrase(), 3000);
                }
            });
        },

        deletePhrase() {
            const currentText = this.textElement.textContent;

            gsap.to(this.textElement, {
                duration: 0.4,
                text: '',
                ease: 'power2.in',
                onComplete: () => {
                    // Move to next phrase
                    this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
                    // Small pause before typing next phrase
                    setTimeout(() => this.typePhrase(this.phrases[this.currentIndex]), 300);
                }
            });
        }
    };

    // ========================================
    // Hero Staggered Load Animation
    // ========================================

    const HeroStagger = {
        init() {
            const heroElements = [
                { selector: '.hero-badge', delay: 0 },
                { selector: '#hero-heading', delay: 0.1 },
                { selector: '.hero-subtitle', delay: 0.2 },
                { selector: '.hero-cta', delay: 0.3 },
                { selector: '.hero-stats', delay: 0.4 },
                { selector: '.hero-visual', delay: 0.5 },
                { selector: '.scroll-indicator', delay: 0.7 }
            ];

            heroElements.forEach(({ selector, delay }) => {
                const el = document.querySelector(selector);
                if (!el) return;

                // Remove existing data-animate to prevent conflict
                el.removeAttribute('data-animate');
                el.removeAttribute('data-delay');

                gsap.set(el, { opacity: 0, y: 40 });
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: delay,
                    ease: 'power3.out'
                });
            });
        }
    };

    // ========================================
    // Dashboard Floating + Mouse Parallax Effect
    // ========================================

    const HeroFloat = {
        dashboard: null,

        init() {
            if (isMobile) return;

            this.dashboard = document.querySelector('.hero-product-preview');
            if (!this.dashboard) return;

            // Subtle floating animation
            gsap.to(this.dashboard, {
                y: -15,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Mouse parallax effect
            if (!isTouchDevice) {
                this.initMouseParallax();
            }
        },

        initMouseParallax() {
            const heroSection = document.querySelector('.hero');
            if (!heroSection) return;

            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate offset from center (-1 to 1)
                const offsetX = (mouseX - centerX) / centerX;
                const offsetY = (mouseY - centerY) / centerY;

                // Apply rotation and translation based on mouse position
                gsap.to(this.dashboard, {
                    rotateY: offsetX * 8,
                    rotateX: -offsetY * 6,
                    x: offsetX * 25,
                    y: offsetY * 10,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            heroSection.addEventListener('mouseleave', () => {
                gsap.to(this.dashboard, {
                    rotateY: 0,
                    rotateX: 0,
                    x: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        }
    };

    // ========================================
    // Enhanced Scroll Animations
    // ========================================

    const ScrollAnimations = {
        init() {
            // Add class to body for CSS hooks
            document.body.classList.add('gsap-loaded');

            // Find all elements with data-scroll attribute
            const scrollElements = document.querySelectorAll('[data-scroll]');

            scrollElements.forEach(el => {
                const type = el.dataset.scroll;
                const delay = parseFloat(el.dataset.scrollDelay) || 0;

                const animations = {
                    'fade-up': { y: 60, opacity: 0 },
                    'fade-left': { x: -60, opacity: 0 },
                    'fade-right': { x: 60, opacity: 0 },
                    'scale-in': { scale: 0.85, opacity: 0 }
                };

                if (!animations[type]) return;

                gsap.from(el, {
                    ...animations[type],
                    duration: 0.8,
                    delay: delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        }
    };

    // ========================================
    // Sticky Scroll "See It Live" Section
    // ========================================

    const StickyScrollSection = {
        chapters: ['whitespace', 'health', 'roi', 'workback'],
        currentChapter: 0,
        isInitialized: false,
        progressElement: null,

        init() {
            // Skip on tablet and mobile - use normal tabbed interface
            if (isTablet) return;

            const section = document.querySelector('.demo');
            if (!section) return;

            // Create progress indicator (fixed position, hidden by default)
            this.createProgressIndicator();

            // Initialize ScrollTrigger for tab switching only (no pinning for now)
            this.initScrollTrigger(section);

            this.isInitialized = true;
        },

        createProgressIndicator() {
            const progressHTML = `
                <div class="sticky-progress" style="display: none;">
                    <div class="progress-dots">
                        ${this.chapters.map((_, i) => `<span class="progress-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                    </div>
                    <div class="progress-line">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', progressHTML);
            this.progressElement = document.querySelector('.sticky-progress');
        },

        initScrollTrigger(section) {
            const self = this;

            // Simple scroll-based tab switching without pinning
            ScrollTrigger.create({
                trigger: section,
                start: 'top 30%',
                end: 'bottom 30%',
                onEnter: () => self.showProgress(),
                onLeave: () => self.hideProgress(),
                onEnterBack: () => self.showProgress(),
                onLeaveBack: () => self.hideProgress(),
                onUpdate: (trigger) => {
                    const progress = trigger.progress;

                    // Explicit ranges to ensure Whitespace Visualizer displays first
                    // This prevents skipping chapter 0 due to scroll trigger start position
                    let chapterIndex;
                    if (progress < 0.30) chapterIndex = 0;      // Whitespace Visualizer
                    else if (progress < 0.55) chapterIndex = 1; // Account Health
                    else if (progress < 0.80) chapterIndex = 2; // ROI Calculator
                    else chapterIndex = 3;                       // Work-back Planner

                    if (chapterIndex !== self.currentChapter) {
                        self.switchChapter(chapterIndex);
                    }

                    self.updateProgress(progress);
                }
            });
        },

        showProgress() {
            if (this.progressElement) {
                this.progressElement.style.display = 'flex';
                gsap.fromTo(this.progressElement,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: 0.3 }
                );
            }
        },

        hideProgress() {
            if (this.progressElement) {
                gsap.to(this.progressElement, {
                    opacity: 0,
                    x: -20,
                    duration: 0.3,
                    onComplete: () => {
                        if (this.progressElement) {
                            this.progressElement.style.display = 'none';
                        }
                    }
                });
            }
        },

        switchChapter(index) {
            const chapterId = this.chapters[index];

            // Update demo tabs
            document.querySelectorAll('.demo-tab').forEach((tab) => {
                const tabId = tab.dataset.tab;
                tab.classList.toggle('active', tabId === chapterId);
            });

            // Update demo panels with crossfade
            document.querySelectorAll('.demo-panel').forEach(panel => {
                const isActive = panel.id === `demo-${chapterId}`;

                if (isActive && !panel.classList.contains('active')) {
                    // Fade in new panel
                    gsap.fromTo(panel,
                        { opacity: 0, scale: 0.98 },
                        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
                    );
                }

                panel.classList.toggle('active', isActive);
            });

            // Update progress dots
            document.querySelectorAll('.progress-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i <= index);
            });

            this.currentChapter = index;
        },

        updateProgress(progress) {
            const fill = document.querySelector('.progress-fill');
            if (fill) {
                fill.style.height = `${progress * 100}%`;
            }
        }
    };

    // ========================================
    // Comparison Section Animation
    // ========================================

    const ComparisonAnimation = {
        init() {
            const grid = document.querySelector('.comparison-grid');
            if (!grid) return;

            const oldWay = document.querySelector('.comparison-card.old-way');
            const divider = document.querySelector('.comparison-divider');
            const glueWay = document.querySelector('.comparison-card.glue-way');

            if (!oldWay || !divider || !glueWay) return;

            // Remove existing data-animate
            grid.removeAttribute('data-animate');
            grid.removeAttribute('data-delay');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });

            tl.from(oldWay, {
                x: -80,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out'
            })
            .from(divider, {
                scale: 0,
                opacity: 0,
                duration: 0.4,
                ease: 'back.out(1.7)'
            }, '-=0.3')
            .from(glueWay, {
                x: 80,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, '-=0.3');
        }
    };

    // ========================================
    // Process Timeline Animation
    // ========================================

    const ProcessAnimation = {
        init() {
            const processSection = document.querySelector('.process-modern');
            if (!processSection) return;

            const cards = gsap.utils.toArray('.process-card');
            const connectors = gsap.utils.toArray('.process-connector');

            // Set initial state
            gsap.set(cards, { opacity: 0, y: 40 });
            gsap.set(connectors, { opacity: 0, scaleX: 0 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: processSection,
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });

            cards.forEach((card, i) => {
                tl.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                    onComplete: () => card.classList.add('visible')
                }, i * 0.2);

                if (connectors[i]) {
                    tl.to(connectors[i], {
                        opacity: 1,
                        scaleX: 1,
                        duration: 0.4,
                        ease: 'power2.out',
                        onComplete: () => connectors[i].classList.add('visible')
                    }, (i * 0.2) + 0.1);
                }
            });
        }
    };

    // ========================================
    // Tool Cards Waterfall Animation
    // ========================================

    const ToolCardsAnimation = {
        init() {
            const cards = gsap.utils.toArray('.service-card');
            if (cards.length === 0) return;

            cards.forEach((card, i) => {
                // Remove existing data-animate
                card.removeAttribute('data-animate');
                card.removeAttribute('data-delay');

                // Calculate cascade delay based on grid position
                const row = Math.floor(i / 3);
                const col = i % 3;
                const delay = (row + col) * 0.08;

                gsap.from(card, {
                    y: 50,
                    opacity: 0,
                    duration: 0.6,
                    delay: delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.services-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        }
    };

    // ========================================
    // Case Study Animation
    // ========================================

    const CaseStudyAnimation = {
        init() {
            const quote = document.querySelector('.case-quote');
            const challengeCard = document.querySelector('.case-card:first-of-type');
            const solutionCard = document.querySelector('.case-card:last-of-type');

            if (quote) {
                // Quote mark scale animation
                const quoteMark = quote.querySelector('.quote-mark');
                if (quoteMark) {
                    gsap.from(quoteMark, {
                        scale: 0.5,
                        opacity: 0,
                        duration: 0.6,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: quote,
                            start: 'top 80%'
                        }
                    });
                }
            }

            // Challenge/Solution cards slide in from sides
            if (challengeCard && solutionCard) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.case-grid',
                        start: 'top 75%'
                    }
                });

                tl.from(challengeCard, {
                    x: -60,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power3.out'
                })
                .from(solutionCard, {
                    x: 60,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power3.out'
                }, '-=0.4');
            }
        }
    };

    // ========================================
    // FAQ Accordion Enhancement
    // ========================================

    const FAQAnimation = {
        init() {
            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                const icon = item.querySelector('.faq-icon');

                if (!question || !answer) return;

                // Set initial state
                gsap.set(answer, { height: 0, opacity: 0 });

                // Use capture phase and stop propagation to prevent original script.js handler
                question.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();

                    const isOpen = item.classList.contains('active');

                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherIcon = otherItem.querySelector('.faq-icon');

                            otherItem.classList.remove('active');
                            gsap.to(otherAnswer, { height: 0, opacity: 0, duration: 0.3 });
                            gsap.to(otherIcon, { rotation: 0, duration: 0.3 });
                        }
                    });

                    if (isOpen) {
                        // Close current
                        item.classList.remove('active');
                        gsap.to(answer, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut' });
                        gsap.to(icon, { rotation: 0, duration: 0.3, ease: 'power2.inOut' });
                    } else {
                        // Open current
                        item.classList.add('active');
                        gsap.to(answer, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' });
                        gsap.to(icon, { rotation: 45, duration: 0.3, ease: 'power2.out' });
                    }
                }, true); // capture phase
            });
        }
    };

    // ========================================
    // Navigation Hide/Show on Scroll
    // ========================================

    const NavigationAnimation = {
        nav: null,
        lastScrollY: 0,
        isHidden: false,
        scrollThreshold: 5, // Minimum scroll distance to trigger

        init() {
            this.nav = document.querySelector('.nav');
            if (!this.nav) return;

            this.lastScrollY = window.scrollY;

            // Use native scroll event for more responsive behavior
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        },

        handleScroll() {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - this.lastScrollY;

            // Only trigger after scrolling past hero (100px)
            if (currentScrollY > 100) {
                // Scrolling down - hide nav
                if (scrollDelta > this.scrollThreshold && !this.isHidden) {
                    gsap.to(this.nav, {
                        y: -100,
                        duration: 0.3,
                        ease: 'power2.in'
                    });
                    this.isHidden = true;
                }
                // Scrolling up - show nav
                else if (scrollDelta < -this.scrollThreshold && this.isHidden) {
                    gsap.to(this.nav, {
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    this.isHidden = false;
                }
            } else {
                // Always show nav when near top
                if (this.isHidden) {
                    gsap.to(this.nav, {
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    this.isHidden = false;
                }
            }

            this.lastScrollY = currentScrollY;
        }
    };

    // ========================================
    // Testimonials Stagger Animation with 3D Effect
    // ========================================

    const TestimonialsAnimation = {
        init() {
            const cards = gsap.utils.toArray('.testimonial-card');
            if (cards.length === 0) return;

            // Set perspective on parent for 3D effect (desktop only)
            const grid = document.querySelector('.testimonials-grid');
            if (grid && !isMobile) {
                grid.style.perspective = '1000px';
            }

            cards.forEach((card, i) => {
                // Remove existing data-animate
                card.removeAttribute('data-animate');
                card.removeAttribute('data-delay');

                // Add transform style for 3D (desktop only)
                if (!isMobile) {
                    card.style.transformStyle = 'preserve-3d';
                }

                // Simpler animation on mobile, full 3D on desktop
                const animProps = isMobile ? {
                    y: 40,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: 'power3.out'
                } : {
                    y: 100,
                    opacity: 0,
                    rotateX: 25,
                    rotateY: i === 0 ? -15 : i === 2 ? 15 : 0,
                    scale: 0.85,
                    duration: 1,
                    delay: i * 0.2,
                    ease: 'power3.out'
                };

                gsap.from(card, {
                    ...animProps,
                    scrollTrigger: {
                        trigger: '.testimonials-grid',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        }
    };

    // ========================================
    // Stats Counter Enhancement
    // ========================================

    const StatsAnimation = {
        init() {
            const resultCards = gsap.utils.toArray('.result-card');
            if (resultCards.length === 0) return;

            resultCards.forEach((card, i) => {
                // Remove existing data-animate
                card.removeAttribute('data-animate');
                card.removeAttribute('data-delay');
            });

            gsap.from(resultCards, {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.results-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        }
    };

    // ========================================
    // CTA Section Animation
    // ========================================

    const CTAAnimation = {
        init() {
            const ctaContent = document.querySelector('.cta-content');
            if (!ctaContent) return;

            // Remove existing data-animate
            ctaContent.removeAttribute('data-animate');

            const heading = ctaContent.querySelector('h2');
            const text = ctaContent.querySelector('p:not(.cta-trust)');
            const buttons = ctaContent.querySelector('.cta-buttons');
            const trust = ctaContent.querySelector('.cta-trust');

            const elements = [heading, text, buttons, trust].filter(Boolean);

            gsap.from(elements, {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: ctaContent,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        }
    };

    // ========================================
    // Tool Library Ticker Enhancement
    // ========================================

    const TickerAnimation = {
        init() {
            const carouselRows = document.querySelectorAll('.carousel-row');

            carouselRows.forEach(row => {
                const track = row.querySelector('.carousel-track');
                if (!track) return;

                // Pause on hover
                row.addEventListener('mouseenter', () => {
                    gsap.to(track, { animationPlayState: 'paused', duration: 0.3 });
                    track.style.animationPlayState = 'paused';
                });

                row.addEventListener('mouseleave', () => {
                    gsap.to(track, { animationPlayState: 'running', duration: 0.3 });
                    track.style.animationPlayState = 'running';
                });
            });
        }
    };

    // ========================================
    // Initialization
    // ========================================

    function init() {
        console.log('GSAP Animations initializing...');

        // Hero animations
        HeroStagger.init();
        HeroTypewriter.init();
        HeroFloat.init();

        // Scroll animations
        ScrollAnimations.init();

        // Section-specific animations
        StickyScrollSection.init();
        ComparisonAnimation.init();
        ProcessAnimation.init();
        ToolCardsAnimation.init();
        CaseStudyAnimation.init();
        TestimonialsAnimation.init();
        StatsAnimation.init();
        CTAAnimation.init();

        // Interactive elements
        FAQAnimation.init();
        NavigationAnimation.init();
        TickerAnimation.init();

        console.log('GSAP Animations initialized successfully');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
    });

})();
