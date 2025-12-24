# Development Patterns & Optimization Guidelines

This document codifies the architectural patterns, coding standards, and optimization techniques established for the Glue platform.

## Architecture Patterns

### Tool Structure Pattern
Each tool follows a consistent directory and file structure:

```
tool-name/
├── index.html          # Main tool page
├── styles.css          # Tool-specific styles
├── app.js             # UI controller and main application logic
├── engine.js          # Business logic and calculations (if needed)
├── data.js            # Sample/mock data for demos (if needed)
└── script.js          # Page initialization (if needed)
```

### CSS Architecture Pattern
**Loading Order** (Critical for proper styling):
1. `../../styles.css` - Global variables and base styles
2. `../tools.css` - Shared tool components
3. `styles.css` - Tool-specific overrides

**Variable Usage**:
```css
/* Always use CSS variables for consistency */
:root {
    --color-primary: #6366f1;
    --space-md: 1rem;
    --radius-lg: 16px;
}

/* Good */
.button {
    background: var(--color-primary);
    padding: var(--space-md);
    border-radius: var(--radius-lg);
}

/* Avoid */
.button {
    background: #6366f1;
    padding: 16px;
    border-radius: 16px;
}
```

### JavaScript Class Pattern
**Main Application Class Structure**:
```javascript
class ToolApp {
    constructor() {
        this.data = [];
        this.currentView = 'default';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // DOM event binding
    }

    // Business logic methods
    processData(data) { }
    
    // UI update methods
    updateDisplay() { }
    
    // Utility methods
    formatCurrency(value) { }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.toolApp = new ToolApp();
});
```

### Navigation Integration Pattern
**Required Script Inclusion**:
```html
<!-- CRITICAL: Include main script for navigation behavior -->
<script src="../../script.js"></script>
<script src="tool-specific-files.js"></script>
```

**Top Spacing for Fixed Navigation**:
```css
.tool-hero,
.tool-interface {
    margin-top: 120px; /* Account for fixed navigation */
    padding-top: var(--space-xl);
}
```

## UI/UX Patterns

### Glassmorphism Design System
**Standard Glass Card**:
```css
.glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--glass-shadow);
}
```

### Data Visualization Patterns

#### Matrix/Table Layout (Proven Pattern)
**Use Flexbox Layout for Sticky Columns**:
```html
<div class="matrix-layout">
    <div class="matrix-accounts">     <!-- Fixed left column -->
        <div class="account-header">Account</div>
        <div class="account-name">Company A</div>
    </div>
    <div class="matrix-products">     <!-- Scrollable columns -->
        <div class="products-header">
            <div class="product-header">Product 1</div>
        </div>
        <div class="products-data">
            <div class="product-row">
                <div class="matrix-cell">Data</div>
            </div>
        </div>
    </div>
</div>
```

```css
.matrix-layout { display: flex; }
.matrix-accounts { 
    flex-shrink: 0; 
    width: 200px; 
    background: var(--color-bg);
    border-right: 2px solid var(--glass-border);
}
.matrix-products { 
    flex: 1; 
    overflow-x: auto; 
    -webkit-overflow-scrolling: touch;
}
```

#### Responsive Data Tables
**Mobile-First Approach**:
```css
/* Desktop: Table layout */
@media (min-width: 769px) {
    .data-table { display: table; }
}

/* Mobile: Card layout */
@media (max-width: 768px) {
    .data-table { display: block; }
    .data-row { 
        display: block;
        margin-bottom: var(--space-lg);
        padding: var(--space-md);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
    }
}
```

### Interactive Element Patterns

#### Button States and Feedback
```css
.btn {
    transition: all var(--transition-fast);
    cursor: pointer;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.3);
}

.btn:active {
    transform: translateY(0);
}

/* Loading state */
.btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
}
```

#### Form Input Validation
```javascript
class FormValidator {
    static validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            return `${fieldName} is required`;
        }
        return null;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    }
}
```

## Performance Optimization Patterns

### Data Handling Optimizations

#### CSV Processing Pattern
```javascript
class CSVProcessor {
    static parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1)
            .filter(line => line.trim()) // Remove empty lines
            .map(line => {
                const values = line.split(',');
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || '';
                });
                return row;
            });
    }

    // Use for large datasets
    static parseCSVLazy(csvText, batchSize = 1000) {
        // Implement batched processing for large files
    }
}
```

#### Memory-Efficient Data Structures
```javascript
// Good: Use Maps for frequent lookups
const accountLookup = new Map();
accounts.forEach(account => {
    accountLookup.set(account.id, account);
});

// Good: Use Sets for unique collections
const adoptedProducts = new Set(
    matrix.filter(cell => cell.status === 'adopted')
          .map(cell => cell.productId)
);

// Avoid: Large object iterations
// accounts.find(a => a.id === targetId) // O(n) lookup
```

### DOM Manipulation Optimizations

#### Batch DOM Updates
```javascript
// Good: Batch updates
function updateMatrix(data) {
    const fragment = document.createDocumentFragment();
    
    data.forEach(item => {
        const element = createElement(item);
        fragment.appendChild(element);
    });
    
    container.appendChild(fragment); // Single DOM operation
}

// Avoid: Individual DOM updates in loops
data.forEach(item => {
    container.appendChild(createElement(item)); // Multiple DOM operations
});
```

#### Virtual Scrolling for Large Datasets
```javascript
class VirtualScroller {
    constructor(container, itemHeight, totalItems) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.totalItems = totalItems;
        this.visibleItems = Math.ceil(container.offsetHeight / itemHeight) + 2;
    }

    updateView(scrollTop) {
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleItems, this.totalItems);
        
        // Only render visible items
        this.renderItems(startIndex, endIndex);
    }
}
```

## Error Handling Patterns

### Graceful Degradation
```javascript
class DataProcessor {
    async processFile(file) {
        try {
            const data = await this.parseFile(file);
            return this.validateData(data);
        } catch (error) {
            console.error('File processing failed:', error);
            
            // Show user-friendly error
            this.showError('Unable to process file. Please check the format and try again.');
            
            // Fallback to sample data
            return this.getSampleData();
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}
```

### Input Validation Pattern
```javascript
class InputValidator {
    static validateAndSanitize(input, type) {
        switch (type) {
            case 'currency':
                // Remove non-numeric characters except decimal
                const cleaned = input.replace(/[^0-9.]/g, '');
                const number = parseFloat(cleaned);
                return isNaN(number) ? 0 : Math.max(0, number);
                
            case 'email':
                return input.trim().toLowerCase();
                
            case 'text':
                // Prevent XSS
                return input.replace(/[<>]/g, '').trim();
                
            default:
                return input.trim();
        }
    }
}
```

## Mobile Optimization Patterns

### Touch-Friendly Interactions
```css
/* Minimum touch target size */
.btn, .clickable-element {
    min-height: 44px;
    min-width: 44px;
    padding: 12px;
}

/* Touch feedback */
.clickable-element {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

.clickable-element:active {
    background: rgba(var(--color-primary-rgb), 0.1);
}
```

### Responsive Typography
```css
/* Fluid typography */
h1 { font-size: clamp(1.75rem, 4vw, 3rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
body { font-size: clamp(0.875rem, 2vw, 1rem); }

/* Improve readability on mobile */
@media (max-width: 768px) {
    body {
        line-height: 1.6;
        letter-spacing: 0.01em;
    }
}
```

## Security & Privacy Patterns

### Client-Side Data Protection
```javascript
class SecureDataHandler {
    static sanitizeForDisplay(data) {
        // Remove or mask sensitive information
        const sanitized = { ...data };
        
        if (sanitized.email) {
            sanitized.email = this.maskEmail(sanitized.email);
        }
        
        return sanitized;
    }
    
    static maskEmail(email) {
        const [username, domain] = email.split('@');
        const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
        return `${maskedUsername}@${domain}`;
    }
    
    // Never log sensitive data
    static log(message, data = {}) {
        const sanitizedData = this.sanitizeForDisplay(data);
        console.log(message, sanitizedData);
    }
}
```

### Input Sanitization
```javascript
// Prevent XSS attacks
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Use textContent instead of innerHTML when possible
element.textContent = userInput; // Safe
element.innerHTML = sanitizeHTML(userInput); // If HTML needed
```

## Testing Patterns

### Component Testing Structure
```javascript
class ToolTester {
    static async testDataProcessing() {
        const testData = this.generateTestData();
        const processor = new DataProcessor();
        
        try {
            const result = await processor.process(testData);
            console.assert(result.length > 0, 'Should process data');
            console.assert(result[0].hasOwnProperty('id'), 'Should have ID field');
            return true;
        } catch (error) {
            console.error('Data processing test failed:', error);
            return false;
        }
    }
    
    static generateTestData() {
        return [
            { id: 1, name: 'Test Account', value: 1000 },
            { id: 2, name: 'Another Account', value: 2000 }
        ];
    }
}

// Run tests in development
if (window.location.hostname === 'localhost') {
    ToolTester.testDataProcessing();
}
```

## Deployment Patterns

### Environment Configuration
```javascript
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:3000',
        DEBUG: true,
        ANALYTICS_ENABLED: false
    },
    production: {
        API_BASE_URL: 'https://api.glue.com',
        DEBUG: false,
        ANALYTICS_ENABLED: true
    }
};

const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const config = CONFIG[ENV];
```

### Performance Monitoring
```javascript
class PerformanceMonitor {
    static measureFunction(fn, name) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        if (config.DEBUG) {
            console.log(`${name} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
    }
    
    static measureAsync(asyncFn, name) {
        const start = performance.now();
        return asyncFn().finally(() => {
            const duration = performance.now() - start;
            if (config.DEBUG) {
                console.log(`${name} took ${duration.toFixed(2)}ms`);
            }
        });
    }
}
```

---

*These patterns should be followed consistently across all tools to maintain code quality, performance, and user experience standards.*