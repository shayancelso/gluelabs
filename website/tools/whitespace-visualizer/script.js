/**
 * Whitespace Visualizer Interactive Demo
 */

// Demo data for different accounts and filters
const demoData = {
    accounts: {
        acme: {
            name: 'Acme Corp',
            value: '$245K',
            data: {
                product: {
                    title: 'Acme Corp — Product Whitespace Analysis',
                    totalWhitespace: '$245K',
                    coverage: '40%',
                    priority: '#1 of 4',
                    grid: [
                        'adopted', 'opportunity', 'none', 'adopted', 'none', 'opportunity', 'opportunity', 'adopted',
                        'adopted', 'opportunity', 'none', 'none', 'opportunity', 'adopted', 'opportunity', 'none',
                        'none', 'adopted', 'opportunity', 'adopted', 'none', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'none', 'adopted', 'opportunity', 'adopted', 'none', 'opportunity', 'adopted',
                        'adopted', 'opportunity', 'none', 'adopted', 'opportunity', 'none', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'none', 'adopted', 'opportunity', 'none', 'adopted'
                    ]
                },
                region: {
                    title: 'Acme Corp — Regional Whitespace Analysis',
                    totalWhitespace: '$180K',
                    coverage: '65%',
                    priority: '#2 of 4',
                    grid: [
                        'adopted', 'adopted', 'opportunity', 'adopted', 'none', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'opportunity', 'adopted',
                        'opportunity', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted'
                    ]
                },
                segment: {
                    title: 'Acme Corp — Segment Whitespace Analysis',
                    totalWhitespace: '$320K',
                    coverage: '35%',
                    priority: '#1 of 4',
                    grid: [
                        'opportunity', 'opportunity', 'none', 'opportunity', 'none', 'opportunity', 'opportunity', 'opportunity',
                        'adopted', 'opportunity', 'none', 'none', 'opportunity', 'opportunity', 'opportunity', 'none',
                        'none', 'adopted', 'opportunity', 'opportunity', 'none', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'none', 'opportunity', 'opportunity', 'adopted', 'none', 'opportunity', 'opportunity',
                        'opportunity', 'opportunity', 'none', 'adopted', 'opportunity', 'none', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'none', 'opportunity', 'opportunity', 'none', 'adopted'
                    ]
                }
            }
        },
        techstart: {
            name: 'TechStart Inc',
            value: '$180K',
            data: {
                product: {
                    title: 'TechStart Inc — Product Whitespace Analysis',
                    totalWhitespace: '$180K',
                    coverage: '55%',
                    priority: '#2 of 4',
                    grid: [
                        'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'opportunity',
                        'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted'
                    ]
                },
                region: {
                    title: 'TechStart Inc — Regional Whitespace Analysis',
                    totalWhitespace: '$125K',
                    coverage: '70%',
                    priority: '#3 of 4',
                    grid: [
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'adopted',
                        'opportunity', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted'
                    ]
                },
                segment: {
                    title: 'TechStart Inc — Segment Whitespace Analysis',
                    totalWhitespace: '$200K',
                    coverage: '45%',
                    priority: '#2 of 4',
                    grid: [
                        'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity',
                        'adopted', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity',
                        'adopted', 'opportunity', 'adopted', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'opportunity'
                    ]
                }
            }
        },
        globalco: {
            name: 'GlobalCo',
            value: '$320K',
            data: {
                product: {
                    title: 'GlobalCo — Product Whitespace Analysis',
                    totalWhitespace: '$320K',
                    coverage: '30%',
                    priority: '#1 of 4',
                    grid: [
                        'opportunity', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'opportunity', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity',
                        'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'adopted'
                    ]
                },
                region: {
                    title: 'GlobalCo — Regional Whitespace Analysis',
                    totalWhitespace: '$280K',
                    coverage: '45%',
                    priority: '#1 of 4',
                    grid: [
                        'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'opportunity', 'adopted', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity',
                        'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted', 'opportunity', 'opportunity', 'adopted'
                    ]
                },
                segment: {
                    title: 'GlobalCo — Segment Whitespace Analysis',
                    totalWhitespace: '$420K',
                    coverage: '25%',
                    priority: '#1 of 4',
                    grid: [
                        'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity',
                        'opportunity', 'adopted', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'adopted'
                    ]
                }
            }
        },
        fastgrow: {
            name: 'FastGrow LLC',
            value: '$95K',
            data: {
                product: {
                    title: 'FastGrow LLC — Product Whitespace Analysis',
                    totalWhitespace: '$95K',
                    coverage: '75%',
                    priority: '#4 of 4',
                    grid: [
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted'
                    ]
                },
                region: {
                    title: 'FastGrow LLC — Regional Whitespace Analysis',
                    totalWhitespace: '$65K',
                    coverage: '85%',
                    priority: '#4 of 4',
                    grid: [
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted'
                    ]
                },
                segment: {
                    title: 'FastGrow LLC — Segment Whitespace Analysis',
                    totalWhitespace: '$115K',
                    coverage: '65%',
                    priority: '#3 of 4',
                    grid: [
                        'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'opportunity', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'adopted',
                        'adopted', 'adopted', 'adopted', 'adopted', 'adopted', 'opportunity', 'adopted', 'adopted'
                    ]
                }
            }
        }
    }
};

// Current state
let currentAccount = 'acme';
let currentFilter = 'product';

// Initialize the demo when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDemo();
    initializeUseCaseTabs();
});

function initializeDemo() {
    // Set up filter button event listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            switchFilter(filter);
        });
    });

    // Set up account item event listeners
    const accountItems = document.querySelectorAll('.account-item');
    accountItems.forEach(item => {
        item.addEventListener('click', function() {
            const account = this.dataset.account;
            switchAccount(account);
        });
    });

    // Initialize with default account and filter
    updateVisualization();
}

function switchFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    updateVisualization();
}

function switchAccount(account) {
    currentAccount = account;
    
    // Update active account item
    document.querySelectorAll('.account-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-account="${account}"]`).classList.add('selected');
    
    updateVisualization();
}

function updateVisualization() {
    const accountData = demoData.accounts[currentAccount];
    const filterData = accountData.data[currentFilter];
    
    // Update title
    document.getElementById('viz-title').textContent = filterData.title;
    
    // Update summary cards
    document.getElementById('total-whitespace').textContent = filterData.totalWhitespace;
    document.getElementById('coverage-score').textContent = filterData.coverage;
    document.getElementById('priority-rank').textContent = filterData.priority;
    
    // Update grid
    updateGrid(filterData.grid);
}

function updateGrid(gridData) {
    const gridContainer = document.getElementById('viz-grid');
    gridContainer.innerHTML = '';
    
    gridData.forEach((cellType, index) => {
        const cell = document.createElement('div');
        cell.className = `viz-cell ${cellType}`;
        
        // Add hover tooltip
        let tooltipText = '';
        switch(cellType) {
            case 'adopted':
                tooltipText = 'Currently adopted';
                break;
            case 'opportunity':
                tooltipText = 'High-value expansion opportunity';
                break;
            case 'none':
                tooltipText = 'Not applicable for this account';
                break;
        }
        cell.title = tooltipText;
        
        // Add staggered animation
        cell.style.animationDelay = `${index * 0.02}s`;
        cell.classList.add('fade-in');
        
        gridContainer.appendChild(cell);
    });
}

function initializeUseCaseTabs() {
    const useCaseTabs = document.querySelectorAll('.use-case-tab');
    const useCasePanels = document.querySelectorAll('.use-case-panel');
    
    useCaseTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const role = this.dataset.role;
            
            // Update active tab
            useCaseTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active panel
            useCasePanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === role) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// Smooth scrolling for demo CTA
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
                
                // If this is the "Try Demo Again" link, reset demo
                if (link.textContent.includes('Try Demo Again')) {
                    setTimeout(() => {
                        currentAccount = 'acme';
                        currentFilter = 'product';
                        
                        // Update UI
                        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                        document.querySelector('[data-filter="product"]').classList.add('active');
                        
                        document.querySelectorAll('.account-item').forEach(item => item.classList.remove('selected'));
                        document.querySelector('[data-account="acme"]').classList.add('selected');
                        
                        updateVisualization();
                    }, 500);
                }
            }
        });
    });
});

// Add CSS for animations if not already present
if (!document.querySelector('style[data-whitespace-viz]')) {
    const style = document.createElement('style');
    style.setAttribute('data-whitespace-viz', 'true');
    style.textContent = `
        .viz-cell.fade-in {
            animation: fadeInScale 0.5s ease-out forwards;
            opacity: 0;
            transform: scale(0.8);
        }
        
        @keyframes fadeInScale {
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .viz-cell:hover::after {
            content: attr(title);
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
        }
        
        .viz-cell {
            position: relative;
        }
        
        /* Enhanced hover effects */
        .account-item:hover {
            transform: translateX(4px);
        }
        
        .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .use-case-tab:hover {
            transform: translateY(-2px);
        }
        
        .matrix-cell:hover {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Add some interactive feedback for matrix cells
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const matrixCells = document.querySelectorAll('.matrix-cell');
        matrixCells.forEach((cell, index) => {
            cell.addEventListener('click', function() {
                // Add a ripple effect
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    pointer-events: none;
                    width: 20px;
                    height: 20px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    animation: ripple 0.6s ease-out forwards;
                `;
                
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Add ripple animation if not exists
        if (!document.querySelector('style[data-ripple]')) {
            const rippleStyle = document.createElement('style');
            rippleStyle.setAttribute('data-ripple', 'true');
            rippleStyle.textContent = `
                @keyframes ripple {
                    to {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(rippleStyle);
        }
    }, 1000);
});