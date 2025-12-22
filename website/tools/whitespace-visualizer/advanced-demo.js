/**
 * Advanced Demo Integration
 * Main controller for enterprise whitespace analysis demo
 */

// Global state
let currentVisualizer = null;
let selectedAccount = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedDemo();
    setupAccountSelection();
    setupUseCaseTabs();
});

function initializeAdvancedDemo() {
    // Initialize the advanced visualizer (but don't show it yet)
    if (typeof WhitespaceVisualizer !== 'undefined') {
        const demoData = {
            PRODUCTS,
            BUYING_CENTERS,
            ENTERPRISE_ACCOUNTS,
            SCORING_ALGORITHMS,
            MARKET_DATA
        };
        
        // We'll create the visualizer when an account is selected
        console.log('Advanced demo initialized with enterprise data');
    } else {
        console.error('WhitespaceVisualizer class not found');
    }
}

function setupAccountSelection() {
    const accountCards = document.querySelectorAll('.account-card');
    
    accountCards.forEach(card => {
        card.addEventListener('click', function() {
            const accountId = this.dataset.account;
            selectAccount(accountId, this);
        });
    });
}

function selectAccount(accountId, cardElement) {
    // Update visual selection
    document.querySelectorAll('.account-card').forEach(card => {
        card.classList.remove('selected');
    });
    cardElement.classList.add('selected');
    
    selectedAccount = accountId;
    
    // Hide placeholder and show advanced visualizer
    showAdvancedVisualizer(accountId);
    
    // Add loading animation
    addLoadingEffect();
    
    // Simulate loading delay for dramatic effect
    setTimeout(() => {
        removeLoadingEffect();
        initializeVisualizerForAccount(accountId);
    }, 1500);
}

function showAdvancedVisualizer(accountId) {
    const container = document.getElementById('advanced-demo');
    const placeholder = container.querySelector('.demo-placeholder');
    
    // Create advanced visualizer container if it doesn't exist
    let vizContainer = container.querySelector('#whitespace-visualizer');
    if (!vizContainer) {
        vizContainer = document.createElement('div');
        vizContainer.id = 'whitespace-visualizer';
        vizContainer.className = 'whitespace-visualizer-container';
        container.appendChild(vizContainer);
    }
    
    // Hide placeholder
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    // Show visualizer
    vizContainer.style.display = 'block';
}

function addLoadingEffect() {
    const container = document.getElementById('advanced-demo');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h4>Analyzing Account Data</h4>
            <div class="loading-steps">
                <div class="loading-step active">
                    <span class="step-icon">📊</span>
                    <span>Processing revenue data...</span>
                </div>
                <div class="loading-step">
                    <span class="step-icon">🤖</span>
                    <span>Running AI analysis...</span>
                </div>
                <div class="loading-step">
                    <span class="step-icon">👥</span>
                    <span>Mapping stakeholder network...</span>
                </div>
                <div class="loading-step">
                    <span class="step-icon">📈</span>
                    <span>Generating recommendations...</span>
                </div>
            </div>
        </div>
    `;
    container.appendChild(loadingOverlay);
    
    // Animate loading steps
    animateLoadingSteps();
}

function animateLoadingSteps() {
    const steps = document.querySelectorAll('.loading-step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        // Remove active from previous step
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove('active');
            steps[currentStep - 1].classList.add('completed');
        }
        
        // Add active to current step
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 300);
}

function removeLoadingEffect() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    }
}

function initializeVisualizerForAccount(accountId) {
    if (!window.WhitespaceVisualizer) {
        console.error('WhitespaceVisualizer not available');
        return;
    }
    
    const demoData = {
        PRODUCTS,
        BUYING_CENTERS,
        ENTERPRISE_ACCOUNTS,
        SCORING_ALGORITHMS,
        MARKET_DATA
    };
    
    // Create new visualizer instance
    currentVisualizer = new WhitespaceVisualizer('whitespace-visualizer', demoData);
    
    // Load the selected account
    currentVisualizer.loadAccount(accountId);
    
    // Add entrance animation
    const container = document.getElementById('whitespace-visualizer');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
    
    // Track demo engagement
    trackDemoEngagement(accountId);
}

function trackDemoEngagement(accountId) {
    // Simulate analytics tracking
    console.log(`Demo engagement started for account: ${accountId}`);
    
    // Track time spent in demo
    const startTime = Date.now();
    
    // Track interactions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.matrix-cell, .view-btn, .filter-slider')) {
            console.log('Demo interaction:', e.target.className);
        }
    });
    
    // Track when user leaves demo area
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        console.log(`Demo session duration: ${timeSpent} seconds`);
    });
}

// Enhanced use case tab functionality
function setupUseCaseTabs() {
    const useCaseTabs = document.querySelectorAll('.use-case-tab');
    const useCasePanels = document.querySelectorAll('.use-case-panel');
    
    useCaseTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const role = this.dataset.role;
            
            // Update active tab with smooth transition
            useCaseTabs.forEach(t => {
                t.classList.remove('active');
                t.style.transform = 'translateY(0)';
            });
            this.classList.add('active');
            this.style.transform = 'translateY(-2px)';
            
            // Update active panel with fade effect
            useCasePanels.forEach(panel => {
                if (panel.classList.contains('active')) {
                    panel.style.opacity = '0';
                    setTimeout(() => {
                        panel.classList.remove('active');
                        panel.style.display = 'none';
                    }, 150);
                }
            });
            
            setTimeout(() => {
                const targetPanel = document.getElementById(role);
                if (targetPanel) {
                    targetPanel.style.display = 'block';
                    targetPanel.classList.add('active');
                    setTimeout(() => {
                        targetPanel.style.opacity = '1';
                    }, 50);
                }
            }, 150);
        });
    });
}

// Enhanced smooth scrolling with demo reset
document.addEventListener('DOMContentLoaded', function() {
    const demoLinks = document.querySelectorAll('a[href="#live-demo"]');
    demoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const demoSection = document.getElementById('live-demo');
            if (demoSection) {
                demoSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // If this is a "Try Demo Again" link, reset the demo
                if (link.textContent.includes('Try Demo Again')) {
                    setTimeout(() => {
                        resetDemo();
                    }, 1000);
                }
            }
        });
    });
});

function resetDemo() {
    // Reset account selection
    document.querySelectorAll('.account-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Hide visualizer and show placeholder
    const container = document.getElementById('advanced-demo');
    const vizContainer = container.querySelector('#whitespace-visualizer');
    const placeholder = container.querySelector('.demo-placeholder');
    
    if (vizContainer) {
        vizContainer.style.opacity = '0';
        setTimeout(() => {
            vizContainer.style.display = 'none';
            if (placeholder) {
                placeholder.style.display = 'flex';
                placeholder.style.opacity = '0';
                setTimeout(() => {
                    placeholder.style.opacity = '1';
                }, 100);
            }
        }, 300);
    }
    
    // Reset visualizer instance
    currentVisualizer = null;
    selectedAccount = null;
    
    console.log('Demo reset completed');
}

// Add loading animation styles if not already present
if (!document.querySelector('style[data-loading-styles]')) {
    const loadingStyles = document.createElement('style');
    loadingStyles.setAttribute('data-loading-styles', 'true');
    loadingStyles.textContent = `
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            transition: opacity 0.3s ease;
        }
        
        .loading-content {
            text-align: center;
            max-width: 400px;
            padding: var(--space-2xl);
        }
        
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(99, 102, 241, 0.3);
            border-top: 3px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto var(--space-lg);
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-content h4 {
            color: white;
            font-weight: 600;
            margin-bottom: var(--space-xl);
        }
        
        .loading-steps {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            text-align: left;
        }
        
        .loading-step {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm);
            border-radius: var(--radius-md);
            color: rgba(255, 255, 255, 0.6);
            transition: all 0.3s ease;
        }
        
        .loading-step.active {
            background: rgba(99, 102, 241, 0.2);
            color: white;
            transform: translateX(10px);
        }
        
        .loading-step.completed {
            color: rgba(34, 197, 94, 0.8);
        }
        
        .step-icon {
            font-size: 1.2rem;
        }
        
        .whitespace-visualizer-container {
            display: none;
            min-height: 800px;
            transition: all 0.6s ease;
        }
        
        /* Enhanced account card animations */
        .account-card {
            transform: translateY(0);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .account-card:hover {
            transform: translateY(-8px) scale(1.02);
        }
        
        .account-card.selected {
            transform: translateY(-4px);
            animation: selectedPulse 2s infinite;
        }
        
        @keyframes selectedPulse {
            0%, 100% { 
                box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
            }
            50% { 
                box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
            }
        }
    `;
    document.head.appendChild(loadingStyles);
}

// Export functions for global access
window.advancedDemo = {
    resetDemo,
    selectAccount,
    trackDemoEngagement
};