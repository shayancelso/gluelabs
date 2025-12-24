/**
 * SaaS Pricing Calculator - Page Initialization
 * Handles page setup and URL parameter processing
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Check for shared model in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sharedModel = urlParams.get('model');
    
    if (sharedModel) {
        try {
            const modelData = JSON.parse(atob(sharedModel));
            loadSharedModel(modelData);
        } catch (error) {
            console.error('Error loading shared model:', error);
            showNotification('Invalid shared model data', 'error');
        }
    }

    // Initialize mobile optimizations
    initializeMobileOptimizations();
    
    // Add keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Set up auto-save functionality
    initializeAutoSave();
});

/**
 * Load a shared pricing model from URL parameters
 */
function loadSharedModel(modelData) {
    if (!window.pricingApp || !window.pricingApp.engine) {
        // If app isn't ready yet, wait and try again
        setTimeout(() => loadSharedModel(modelData), 100);
        return;
    }

    try {
        // Validate model data structure
        if (!modelData.name || !Array.isArray(modelData.tiers)) {
            throw new Error('Invalid model structure');
        }

        // Load the model into the engine
        const loadedModel = window.pricingApp.engine.createModel(modelData);
        
        // Update the UI
        window.pricingApp.renderPricingTiers();
        window.pricingApp.updateProjections();
        
        // Show success notification
        window.pricingApp.showNotification(`Loaded shared model: ${modelData.name}`, 'success');
        
        // Clear URL parameters to avoid re-loading on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        console.error('Error loading shared model:', error);
        window.pricingApp.showNotification('Failed to load shared model', 'error');
    }
}

/**
 * Initialize mobile-specific optimizations
 */
function initializeMobileOptimizations() {
    // Add touch-friendly interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Improve touch scrolling on iOS
        document.querySelectorAll('.chart-container, .pricing-tiers-builder').forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
        });
    }

    // Handle viewport changes (orientation, keyboard)
    let viewportTimer;
    window.addEventListener('resize', () => {
        clearTimeout(viewportTimer);
        viewportTimer = setTimeout(() => {
            // Recalculate chart sizes
            if (window.pricingApp && window.pricingApp.chart) {
                window.pricingApp.updateProjections();
            }
        }, 300);
    });

    // Prevent zoom on double-tap for form inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('touchend', (e) => {
            e.preventDefault();
            input.focus();
        });
    });
}

/**
 * Initialize keyboard shortcuts for power users
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts if not typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        // Cmd/Ctrl + shortcuts
        if (e.metaKey || e.ctrlKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    if (window.pricingApp) {
                        window.pricingApp.saveModel();
                    }
                    break;
                    
                case 'e':
                    e.preventDefault();
                    if (window.pricingApp) {
                        window.pricingApp.exportToCSV();
                    }
                    break;
                    
                case 'n':
                    e.preventDefault();
                    if (window.pricingApp) {
                        window.pricingApp.addTier();
                    }
                    break;
                    
                case 'k':
                    e.preventDefault();
                    showKeyboardShortcuts();
                    break;
            }
        }

        // Number keys for quick goal selection
        if (e.key >= '1' && e.key <= '4' && !e.metaKey && !e.ctrlKey) {
            const goals = [10000, 50000, 100000, 1000000];
            const goalIndex = parseInt(e.key) - 1;
            
            if (goalIndex < goals.length && window.pricingApp) {
                window.pricingApp.setGoal(goals[goalIndex]);
                
                // Update button states
                document.querySelectorAll('.goal-btn').forEach((btn, index) => {
                    btn.classList.toggle('active', index === goalIndex);
                });
            }
        }
    });
}

/**
 * Show keyboard shortcuts help
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Ctrl/Cmd + S', action: 'Save model' },
        { key: 'Ctrl/Cmd + E', action: 'Export to CSV' },
        { key: 'Ctrl/Cmd + N', action: 'Add new tier' },
        { key: 'Ctrl/Cmd + K', action: 'Show shortcuts' },
        { key: '1-5', action: 'Quick goal selection' }
    ];

    let shortcutHTML = '<div class="keyboard-shortcuts-modal"><div class="shortcuts-content">';
    shortcutHTML += '<h3>Keyboard Shortcuts</h3><div class="shortcuts-list">';
    
    shortcuts.forEach(shortcut => {
        shortcutHTML += `
            <div class="shortcut-item">
                <kbd>${shortcut.key}</kbd>
                <span>${shortcut.action}</span>
            </div>
        `;
    });
    
    shortcutHTML += '</div><button onclick="closeShortcuts()">Close</button></div></div>';
    
    // Add to page
    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.innerHTML = shortcutHTML;
    document.body.appendChild(modal);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-shortcuts-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .shortcuts-content {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-xl);
            padding: var(--space-xl);
            max-width: 400px;
            width: 90%;
        }
        .shortcuts-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
            margin: var(--space-lg) 0;
        }
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        kbd {
            background: var(--color-bg-secondary);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-sm);
            padding: var(--space-xs) var(--space-sm);
            font-family: monospace;
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(style);

    // Close on escape or click outside
    document.addEventListener('keydown', closeOnEscape);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeShortcuts();
    });

    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeShortcuts();
            document.removeEventListener('keydown', closeOnEscape);
        }
    }
}

/**
 * Close keyboard shortcuts modal
 */
function closeShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Initialize auto-save functionality
 */
function initializeAutoSave() {
    let autoSaveTimer;
    
    // Auto-save every 30 seconds if there are changes
    const startAutoSave = () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            if (window.pricingApp && window.pricingApp.engine.currentModel) {
                const modelData = window.pricingApp.engine.exportModelData();
                localStorage.setItem('pricing_calculator_autosave', modelData);
                localStorage.setItem('pricing_calculator_autosave_timestamp', Date.now().toString());
            }
            startAutoSave(); // Continue auto-save cycle
        }, 30000);
    };

    // Start auto-save when app is ready
    if (window.pricingApp) {
        startAutoSave();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(startAutoSave, 1000);
        });
    }

    // Auto-save restoration disabled - was too annoying
    // If you want to restore a previous session, you can manually load it from saved models

    // Clear auto-save when user manually saves
    document.addEventListener('model-saved', () => {
        localStorage.removeItem('pricing_calculator_autosave');
        localStorage.removeItem('pricing_calculator_autosave_timestamp');
    });
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Utility function to format large numbers
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

/**
 * Performance monitoring
 */
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const loadTime = perf.loadEventEnd - perf.loadEventStart;
                
                console.log(`Page load time: ${loadTime}ms`);
                
                // Track large datasets performance
                if (window.pricingApp && window.pricingApp.engine.currentModel) {
                    const tierCount = window.pricingApp.engine.currentModel.tiers.length;
                    console.log(`Pricing tiers: ${tierCount}`);
                }
            }, 0);
        });
    }
}

// Initialize performance tracking
trackPerformance();

// Export utilities for global use
window.PricingUtils = {
    formatCurrency,
    formatNumber,
    showKeyboardShortcuts,
    loadSharedModel
};