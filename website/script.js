/**
 * Glue Website — Premium Interactions
 * Smooth animations, cursor effects, and micro-interactions
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================================
    // Cursor Glow Effect
    // ==========================================================================

    const cursorGlow = document.querySelector('.cursor-glow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smooth follow with easing
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        if (cursorGlow) {
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Hide cursor glow when mouse leaves window
    document.addEventListener('mouseleave', () => {
        if (cursorGlow) cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        if (cursorGlow) cursorGlow.style.opacity = '0.3';
    });

    // ==========================================================================
    // Navigation
    // ==========================================================================

    const nav = document.querySelector('.nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu
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
                const navHeight = nav.offsetHeight;
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

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

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
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // ==========================================================================
    // Interactive Chart Bars
    // ==========================================================================

    const chartBars = document.querySelectorAll('.chart-bar');

    chartBars.forEach(bar => {
        bar.addEventListener('mouseenter', () => {
            chartBars.forEach(b => b.classList.remove('active'));
            bar.classList.add('active');
        });
    });

    // ==========================================================================
    // Preview Grid Animation
    // ==========================================================================

    const previewCells = document.querySelectorAll('.preview-cell');
    let cellInterval;

    function animatePreviewGrid() {
        const randomIndex = Math.floor(Math.random() * previewCells.length);
        previewCells.forEach((cell, index) => {
            if (index === randomIndex) {
                cell.classList.toggle('active');
            }
        });
    }

    // Start animation when services section is visible
    const servicesSection = document.querySelector('.services');

    if (servicesSection) {
        const servicesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cellInterval = setInterval(animatePreviewGrid, 800);
                } else {
                    clearInterval(cellInterval);
                }
            });
        }, { threshold: 0.2 });

        servicesObserver.observe(servicesSection);
    }

    // ==========================================================================
    // Magnetic Buttons
    // ==========================================================================

    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-nav');

    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ==========================================================================
    // Parallax Orbs
    // ==========================================================================

    const orbs = document.querySelectorAll('.hero-orb');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.1;
            orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    // ==========================================================================
    // Text Reveal Animation
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
    // Stats Counter Animation
    // ==========================================================================

    const statNumbers = document.querySelectorAll('.stat-number');

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;

                // Only animate if it contains a number
                if (text.includes('$') || text.includes('%')) {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';

                    setTimeout(() => {
                        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, 200);
                }

                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statsObserver.observe(stat));

    // ==========================================================================
    // Card Tilt Effect
    // ==========================================================================

    const tiltCards = document.querySelectorAll('.problem-card, .service-card, .member-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ==========================================================================
    // Smooth Entry Animation
    // ==========================================================================

    // Add initial page load animation
    document.body.style.opacity = '0';

    window.addEventListener('load', () => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    });

    // ==========================================================================
    // Keyboard Navigation Enhancement
    // ==========================================================================

    document.addEventListener('keydown', (e) => {
        // Close mobile menu on Escape
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

});

// ==========================================================================
// Performance: Throttle scroll events
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
