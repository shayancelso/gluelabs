/**
 * Territory Planner - Page Initialization Script
 * Handles page-specific setup, navigation, and mobile optimizations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation scroll behavior
    initNavigationScroll();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize smooth scroll for anchor links
    initSmoothScroll();

    // Initialize Lou mascot animations
    initLouAnimations();
});

/**
 * Navigation scroll behavior
 */
function initNavigationScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                if (window.scrollY > 50) {
                    nav.classList.add('nav-scrolled');
                } else {
                    nav.classList.remove('nav-scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', function() {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Lou mascot animations
 */
function initLouAnimations() {
    const lou = document.getElementById('lou-upload');
    if (!lou) return;

    // Add idle animation
    lou.classList.add('idle');

    // Add hover effect
    const uploadZone = document.getElementById('upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('mouseenter', function() {
            lou.classList.add('excited');
        });

        uploadZone.addEventListener('mouseleave', function() {
            lou.classList.remove('excited');
        });
    }
}

/**
 * Add CSS for Lou animations and other dynamic styles
 */
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Lou mascot animations */
    .lou-mascot {
        transition: transform 0.3s ease;
    }

    .lou-mascot.idle {
        animation: louBounce 2s ease-in-out infinite;
    }

    .lou-mascot.excited {
        animation: louExcited 0.5s ease-in-out;
    }

    .lou-mascot.processing {
        animation: louSpin 1s linear infinite;
    }

    .lou-mascot.success {
        animation: louSuccess 0.5s ease-out;
    }

    .lou-mascot.error {
        animation: louError 0.5s ease-out;
    }

    @keyframes louBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }

    @keyframes louExcited {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    @keyframes louSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes louSuccess {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    @keyframes louError {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    /* Upload zone states */
    .upload-zone.drag-over {
        border-color: var(--color-primary);
        background: rgba(99, 102, 241, 0.05);
    }

    .upload-zone.drag-over .lou-mascot {
        animation: louExcited 0.3s ease-in-out infinite;
    }

    /* Upload status styles */
    .upload-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        font-size: 0.9375rem;
        margin-top: var(--space-md);
    }

    .upload-status.loading {
        background: rgba(99, 102, 241, 0.1);
        color: var(--color-primary);
    }

    .upload-status.success {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
    }

    .upload-status.error {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
    }

    .status-icon {
        font-size: 1.25rem;
    }

    /* Modal form styles */
    .modal-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
        margin-top: var(--space-xl);
    }

    .modal-form .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .modal-form .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-secondary);
    }

    .modal-form .form-group input,
    .modal-form .form-group select {
        padding: 12px 16px;
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        font-size: 1rem;
        color: var(--color-text);
        background: white;
        transition: var(--transition-fast);
    }

    .modal-form .form-group input:focus,
    .modal-form .form-group select:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .modal-form .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        background: var(--gradient-primary);
        border: none;
        border-radius: var(--radius-md);
        font-size: 1rem;
        font-weight: 600;
        color: white;
        cursor: pointer;
        transition: var(--transition-fast);
    }

    .modal-form .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    }

    /* Nav scrolled state */
    .nav.nav-scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    }

    /* Mobile menu styles */
    .mobile-menu-btn {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        z-index: 1001;
    }

    .mobile-menu-btn span {
        display: block;
        width: 24px;
        height: 2px;
        background: var(--color-text);
        transition: var(--transition-fast);
    }

    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }

    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: flex;
        }

        .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 320px;
            height: 100vh;
            background: white;
            flex-direction: column;
            padding: 80px 24px 24px;
            gap: 16px;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            z-index: 1000;
        }

        .nav-links.active {
            right: 0;
        }

        .nav-links a {
            font-size: 1.125rem;
            padding: 12px 0;
        }
    }

    /* Modal overlay and content */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: var(--space-lg);
    }

    .modal-content {
        background: white;
        border-radius: var(--radius-xl);
        padding: var(--space-xl);
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border: none;
        background: var(--glass-bg);
        border-radius: 50%;
        font-size: 1.5rem;
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
    }

    .modal-close:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }

    .modal-body h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: var(--space-sm);
    }

    .modal-body p {
        color: var(--color-text-secondary);
    }
`;

document.head.appendChild(dynamicStyles);
