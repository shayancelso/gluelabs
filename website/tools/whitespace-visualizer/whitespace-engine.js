/**
 * Whitespace Analysis Engine
 * Core data processing and analysis for revenue expansion opportunities
 */

class WhitespaceEngine {
    constructor() {
        this.accounts = [];
        this.products = [];
        this.adoptions = [];
        this.analysisResults = null;
    }

    // Data Schema Validation
    validateAccountsData(data) {
        const requiredFields = ['account_id', 'account_name', 'current_arr', 'industry'];
        const optionalFields = ['company_size', 'tier', 'account_manager'];
        
        return data.every(row => {
            return requiredFields.every(field => row.hasOwnProperty(field) && row[field] !== '');
        });
    }

    validateProductsData(data) {
        const requiredFields = ['product_id', 'product_name', 'list_price', 'category'];
        const optionalFields = ['target_segment', 'description'];
        
        return data.every(row => {
            return requiredFields.every(field => row.hasOwnProperty(field) && row[field] !== '');
        });
    }

    validateAdoptionsData(data) {
        const requiredFields = ['account_id', 'product_id', 'contract_value', 'start_date'];
        const optionalFields = ['end_date', 'status'];
        
        return data.every(row => {
            return requiredFields.every(field => row.hasOwnProperty(field) && row[field] !== '');
        });
    }

    // CSV Processing
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }
        
        return data;
    }

    // Single File Loading Method (simplified)
    loadSingleFile(csvData) {
        try {
            const data = this.parseCSV(csvData);
            if (data.length === 0) {
                throw new Error('CSV file appears to be empty');
            }
            
            // Validate required columns
            const firstRow = data[0];
            const requiredColumns = ['account_name', 'current_arr', 'industry', 'products_adopted', 'available_products'];
            const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
            
            if (missingColumns.length > 0) {
                throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
            }
            
            // Extract unique products from all rows
            const allProductsSet = new Set();
            data.forEach(row => {
                if (row.available_products) {
                    row.available_products.split(',').forEach(product => {
                        allProductsSet.add(product.trim());
                    });
                }
            });
            
            // Create products array
            this.products = Array.from(allProductsSet).map((product, index) => ({
                id: `P${String(index + 1).padStart(3, '0')}`,
                name: product,
                listPrice: 25000, // Default price
                category: 'Product',
                targetSegment: 'All',
                description: ''
            }));
            
            // Create accounts array with market potential calculation
            this.accounts = data.map((row, index) => {
                const currentARR = parseFloat(row.current_arr) || 0;
                const totalMarketPotential = this.calculateTotalMarketPotential(row, allProductsSet);
                
                return {
                    id: `A${String(index + 1).padStart(3, '0')}`,
                    name: row.account_name,
                    currentARR: currentARR,
                    totalMarketPotential: totalMarketPotential,
                    whitespaceValue: totalMarketPotential - currentARR,
                    penetrationRate: totalMarketPotential > 0 ? (currentARR / totalMarketPotential * 100).toFixed(1) : 0,
                    industry: row.industry || 'Unknown',
                    companySize: row.company_size || 'Unknown',
                    tier: row.tier || 'Standard',
                    accountManager: row.account_manager || 'Unassigned',
                    // Enhanced fields for whitespace analysis
                    employeeCount: parseInt(row.employee_count) || this.estimateEmployeeCount(row.company_size),
                    revenueSize: parseFloat(row.annual_revenue) || this.estimateAnnualRevenue(row.company_size),
                    growthStage: row.growth_stage || this.determineGrowthStage(currentARR, row.company_size)
                };
            });
            
            // Create adoptions array
            this.adoptions = [];
            data.forEach((row, accountIndex) => {
                if (row.products_adopted) {
                    const adoptedProducts = row.products_adopted.split(',').map(p => p.trim());
                    adoptedProducts.forEach(productName => {
                        const product = this.products.find(p => p.name === productName);
                        if (product) {
                            this.adoptions.push({
                                accountId: `A${String(accountIndex + 1).padStart(3, '0')}`,
                                productId: product.id,
                                contractValue: product.listPrice,
                                startDate: new Date(),
                                endDate: null,
                                status: 'active'
                            });
                        }
                    });
                }
            });
            
            return { 
                success: true, 
                accounts: this.accounts.length,
                products: this.products.length,
                adoptions: this.adoptions.length
            };
            
        } catch (error) {
            throw new Error(`Failed to process file: ${error.message}`);
        }
    }

    // Market Potential and Whitespace Analysis
    calculateTotalMarketPotential(accountRow, availableProducts) {
        let totalPotential = 0;
        const companySize = accountRow.company_size || 'Unknown';
        const industry = accountRow.industry || 'Unknown';
        
        // Calculate potential based on company characteristics
        availableProducts.forEach(productName => {
            const productPotential = this.calculateProductPotential(productName, companySize, industry);
            totalPotential += productPotential;
        });
        
        // Apply industry and size multipliers
        const industryMultiplier = this.getIndustryMultiplier(industry);
        const sizeMultiplier = this.getSizeMultiplier(companySize);
        
        return Math.round(totalPotential * industryMultiplier * sizeMultiplier);
    }

    calculateProductPotential(productName, companySize, industry) {
        // Base product values by category/type
        const baseValues = {
            'platform': 50000,
            'analytics': 30000,
            'security': 40000,
            'mobile': 20000,
            'integration': 25000,
            'reporting': 15000
        };
        
        // Determine product category from name
        const category = this.categorizeProduct(productName);
        const baseValue = baseValues[category] || 25000;
        
        // Adjust for company size
        const sizeMultiplier = {
            'Enterprise': 1.5,
            'Mid-Market': 1.0,
            'SMB': 0.6,
            'Unknown': 0.8
        };
        
        return baseValue * (sizeMultiplier[companySize] || 0.8);
    }

    categorizeProduct(productName) {
        const name = productName.toLowerCase();
        if (name.includes('platform') || name.includes('core')) return 'platform';
        if (name.includes('analytics') || name.includes('reporting')) return 'analytics';
        if (name.includes('security') || name.includes('auth')) return 'security';
        if (name.includes('mobile') || name.includes('app')) return 'mobile';
        if (name.includes('api') || name.includes('integration')) return 'integration';
        if (name.includes('dashboard') || name.includes('report')) return 'reporting';
        return 'platform'; // default
    }

    getIndustryMultiplier(industry) {
        const multipliers = {
            'Technology': 1.3,
            'Financial Services': 1.2,
            'Healthcare': 1.1,
            'Manufacturing': 1.0,
            'Retail': 0.9,
            'Unknown': 1.0
        };
        return multipliers[industry] || 1.0;
    }

    getSizeMultiplier(companySize) {
        const multipliers = {
            'Enterprise': 1.0,
            'Mid-Market': 0.7,
            'SMB': 0.4,
            'Unknown': 0.6
        };
        return multipliers[companySize] || 0.6;
    }

    estimateEmployeeCount(companySize) {
        const estimates = {
            'Enterprise': 1000,
            'Mid-Market': 250,
            'SMB': 50,
            'Unknown': 100
        };
        return estimates[companySize] || 100;
    }

    estimateAnnualRevenue(companySize) {
        const estimates = {
            'Enterprise': 100000000,
            'Mid-Market': 25000000,
            'SMB': 5000000,
            'Unknown': 10000000
        };
        return estimates[companySize] || 10000000;
    }

    determineGrowthStage(currentARR, companySize) {
        const arrThresholds = {
            'Enterprise': { mature: 200000, growth: 100000 },
            'Mid-Market': { mature: 100000, growth: 50000 },
            'SMB': { mature: 50000, growth: 25000 },
            'Unknown': { mature: 75000, growth: 35000 }
        };
        
        const thresholds = arrThresholds[companySize] || arrThresholds['Unknown'];
        
        if (currentARR >= thresholds.mature) return 'mature';
        if (currentARR >= thresholds.growth) return 'growth';
        return 'early';
    }

    // Data Loading Methods
    loadAccounts(csvData) {
        try {
            const data = this.parseCSV(csvData);
            if (!this.validateAccountsData(data)) {
                throw new Error('Invalid accounts data format');
            }
            
            this.accounts = data.map(row => ({
                id: row.account_id,
                name: row.account_name,
                currentARR: parseFloat(row.current_arr) || 0,
                industry: row.industry,
                companySize: row.company_size || 'Unknown',
                tier: row.tier || 'Standard',
                accountManager: row.account_manager || 'Unassigned'
            }));
            
            return { success: true, count: this.accounts.length };
        } catch (error) {
            throw new Error(`Failed to load accounts: ${error.message}`);
        }
    }

    loadProducts(csvData) {
        try {
            const data = this.parseCSV(csvData);
            if (!this.validateProductsData(data)) {
                throw new Error('Invalid products data format');
            }
            
            this.products = data.map(row => ({
                id: row.product_id,
                name: row.product_name,
                listPrice: parseFloat(row.list_price) || 0,
                category: row.category,
                targetSegment: row.target_segment || 'General',
                description: row.description || ''
            }));
            
            return { success: true, count: this.products.length };
        } catch (error) {
            throw new Error(`Failed to load products: ${error.message}`);
        }
    }

    loadAdoptions(csvData) {
        try {
            const data = this.parseCSV(csvData);
            if (!this.validateAdoptionsData(data)) {
                throw new Error('Invalid adoptions data format');
            }
            
            this.adoptions = data.map(row => ({
                accountId: row.account_id,
                productId: row.product_id,
                contractValue: parseFloat(row.contract_value) || 0,
                startDate: new Date(row.start_date),
                endDate: row.end_date ? new Date(row.end_date) : null,
                status: row.status || 'active'
            }));
            
            return { success: true, count: this.adoptions.length };
        } catch (error) {
            throw new Error(`Failed to load adoptions: ${error.message}`);
        }
    }

    // Sample Data Generation
    loadSampleData() {
        // Sample Products first (needed for market potential calculation)
        this.products = [
            { id: 'P001', name: 'Core Platform', listPrice: 120000, category: 'Platform', targetSegment: 'All' },
            { id: 'P002', name: 'Advanced Analytics', listPrice: 85000, category: 'Analytics', targetSegment: 'Enterprise' },
            { id: 'P003', name: 'Mobile App Suite', listPrice: 45000, category: 'Mobile', targetSegment: 'All' },
            { id: 'P004', name: 'API Integration Pack', listPrice: 65000, category: 'Integration', targetSegment: 'Enterprise' },
            { id: 'P005', name: 'Security Module', listPrice: 95000, category: 'Security', targetSegment: 'Enterprise' },
            { id: 'P006', name: 'Reporting Dashboard', listPrice: 35000, category: 'Reporting', targetSegment: 'All' },
            { id: 'P007', name: 'AI Automation Suite', listPrice: 150000, category: 'AI/ML', targetSegment: 'Enterprise' },
            { id: 'P008', name: 'Compliance Manager', listPrice: 75000, category: 'Compliance', targetSegment: 'Enterprise' }
        ];

        // Sample Accounts with enhanced whitespace calculations
        this.accounts = [
            {
                id: 'A001', name: 'TechCorp Solutions', currentARR: 285000,
                totalMarketPotential: 745000, whitespaceValue: 460000, penetrationRate: '38.2',
                industry: 'Technology', companySize: 'Enterprise', tier: 'Platinum',
                employeeCount: 3500, revenueSize: 450000000, growthStage: 'growth',
                accountManager: 'Sarah Johnson'
            },
            {
                id: 'A002', name: 'Global Finance Partners', currentARR: 165000,
                totalMarketPotential: 520000, whitespaceValue: 355000, penetrationRate: '31.7',
                industry: 'Financial Services', companySize: 'Enterprise', tier: 'Platinum',
                employeeCount: 2200, revenueSize: 320000000, growthStage: 'growth',
                accountManager: 'Mike Chen'
            },
            {
                id: 'A003', name: 'HealthTech Innovations', currentARR: 370000,
                totalMarketPotential: 670000, whitespaceValue: 300000, penetrationRate: '55.2',
                industry: 'Healthcare', companySize: 'Enterprise', tier: 'Platinum',
                employeeCount: 1800, revenueSize: 275000000, growthStage: 'mature',
                accountManager: 'Lisa Rodriguez'
            },
            {
                id: 'A004', name: 'RetailMax Corporation', currentARR: 120000,
                totalMarketPotential: 445000, whitespaceValue: 325000, penetrationRate: '27.0',
                industry: 'Retail', companySize: 'Mid-Market', tier: 'Gold',
                employeeCount: 850, revenueSize: 125000000, growthStage: 'growth',
                accountManager: 'David Park'
            },
            {
                id: 'A005', name: 'Industrial Manufacturing Co', currentARR: 235000,
                totalMarketPotential: 595000, whitespaceValue: 360000, penetrationRate: '39.5',
                industry: 'Manufacturing', companySize: 'Enterprise', tier: 'Gold',
                employeeCount: 2800, revenueSize: 380000000, growthStage: 'growth',
                accountManager: 'Jennifer Walsh'
            },
            {
                id: 'A006', name: 'Cloud Solutions Inc', currentARR: 95000,
                totalMarketPotential: 485000, whitespaceValue: 390000, penetrationRate: '19.6',
                industry: 'Technology', companySize: 'Mid-Market', tier: 'Gold',
                employeeCount: 650, revenueSize: 85000000, growthStage: 'hypergrowth',
                accountManager: 'Tom Harrison'
            },
            {
                id: 'A007', name: 'Digital Media Group', currentARR: 155000,
                totalMarketPotential: 410000, whitespaceValue: 255000, penetrationRate: '37.8',
                industry: 'Media', companySize: 'Mid-Market', tier: 'Gold',
                employeeCount: 480, revenueSize: 65000000, growthStage: 'growth',
                accountManager: 'Rachel Kim'
            },
            {
                id: 'A008', name: 'Pharma Solutions Ltd', currentARR: 320000,
                totalMarketPotential: 520000, whitespaceValue: 200000, penetrationRate: '61.5',
                industry: 'Healthcare', companySize: 'Enterprise', tier: 'Platinum',
                employeeCount: 1600, revenueSize: 220000000, growthStage: 'mature',
                accountManager: 'Sarah Johnson'
            }
        ];

        // Sample Adoptions - strategically placed to show massive whitespace opportunities
        this.adoptions = [
            // TechCorp Solutions - only has 2 of 8 products
            { accountId: 'A001', productId: 'P001', contractValue: 120000, startDate: new Date('2023-01-15'), status: 'active' },
            { accountId: 'A001', productId: 'P003', contractValue: 45000, startDate: new Date('2023-06-01'), status: 'active' },
            { accountId: 'A001', productId: 'P007', contractValue: 120000, startDate: new Date('2024-02-01'), status: 'active' },
            
            // Global Finance Partners - only has 2 of 8 products
            { accountId: 'A002', productId: 'P001', contractValue: 120000, startDate: new Date('2023-03-01'), status: 'active' },
            { accountId: 'A002', productId: 'P006', contractValue: 45000, startDate: new Date('2023-08-15'), status: 'active' },
            
            // HealthTech Innovations - has 4 of 8 products
            { accountId: 'A003', productId: 'P001', contractValue: 120000, startDate: new Date('2022-11-01'), status: 'active' },
            { accountId: 'A003', productId: 'P002', contractValue: 85000, startDate: new Date('2023-02-15'), status: 'active' },
            { accountId: 'A003', productId: 'P005', contractValue: 95000, startDate: new Date('2023-09-01'), status: 'active' },
            { accountId: 'A003', productId: 'P008', contractValue: 70000, startDate: new Date('2024-01-10'), status: 'active' },
            
            // RetailMax Corporation - only has 2 of 8 products
            { accountId: 'A004', productId: 'P001', contractValue: 85000, startDate: new Date('2023-07-01'), status: 'active' },
            { accountId: 'A004', productId: 'P006', contractValue: 35000, startDate: new Date('2023-10-15'), status: 'active' },
            
            // Industrial Manufacturing Co - has 3 of 8 products
            { accountId: 'A005', productId: 'P001', contractValue: 120000, startDate: new Date('2023-04-15'), status: 'active' },
            { accountId: 'A005', productId: 'P004', contractValue: 65000, startDate: new Date('2023-10-01'), status: 'active' },
            { accountId: 'A005', productId: 'P003', contractValue: 50000, startDate: new Date('2024-03-01'), status: 'active' },
            
            // Cloud Solutions Inc - only has 1 of 8 products (huge opportunity!)
            { accountId: 'A006', productId: 'P001', contractValue: 95000, startDate: new Date('2023-11-01'), status: 'active' },
            
            // Digital Media Group - has 2 of 8 products
            { accountId: 'A007', productId: 'P001', contractValue: 100000, startDate: new Date('2023-05-15'), status: 'active' },
            { accountId: 'A007', productId: 'P002', contractValue: 55000, startDate: new Date('2023-12-01'), status: 'active' },
            
            // Pharma Solutions Ltd - has 3 of 8 products
            { accountId: 'A008', productId: 'P001', contractValue: 120000, startDate: new Date('2023-01-20'), status: 'active' },
            { accountId: 'A008', productId: 'P005', contractValue: 95000, startDate: new Date('2023-06-15'), status: 'active' },
            { accountId: 'A008', productId: 'P008', contractValue: 105000, startDate: new Date('2023-09-01'), status: 'active' }
        ];

        return { success: true, message: 'Sample data loaded successfully' };
    }

    // Analysis Engine
    generateAnalysis() {
        if (this.accounts.length === 0 || this.products.length === 0) {
            throw new Error('Missing required data. Please upload accounts and products data.');
        }

        const matrix = this.generateMatrix();
        const opportunities = this.identifyOpportunities();
        const stats = this.calculateStats(opportunities);

        this.analysisResults = {
            matrix,
            opportunities,
            stats,
            timestamp: new Date()
        };

        return this.analysisResults;
    }

    generateMatrix() {
        const matrix = {};
        
        this.accounts.forEach(account => {
            matrix[account.id] = {};
            
            this.products.forEach(product => {
                const hasAdoption = this.adoptions.some(
                    adoption => adoption.accountId === account.id && adoption.productId === product.id
                );
                
                const isApplicable = this.isProductApplicable(account, product);
                
                matrix[account.id][product.id] = {
                    status: hasAdoption ? 'adopted' : (isApplicable ? 'opportunity' : 'not-applicable'),
                    account: account,
                    product: product,
                    opportunityValue: hasAdoption ? 0 : (isApplicable ? product.listPrice : 0)
                };
            });
        });
        
        return matrix;
    }

    isProductApplicable(account, product) {
        // Business logic to determine if a product is applicable for an account
        if (product.targetSegment === 'All') return true;
        if (product.targetSegment === 'Enterprise' && account.companySize === 'Enterprise') return true;
        if (product.targetSegment === 'SMB' && account.companySize === 'SMB') return true;
        return false;
    }

    identifyOpportunities() {
        const opportunities = [];
        const matrix = this.analysisResults?.matrix || this.generateMatrix();
        
        Object.keys(matrix).forEach(accountId => {
            Object.keys(matrix[accountId]).forEach(productId => {
                const cell = matrix[accountId][productId];
                if (cell.status === 'opportunity') {
                    opportunities.push({
                        accountId,
                        productId,
                        account: cell.account,
                        product: cell.product,
                        opportunityValue: cell.opportunityValue,
                        score: this.calculateOpportunityScore(cell.account, cell.product)
                    });
                }
            });
        });
        
        return opportunities.sort((a, b) => b.score - a.score);
    }

    calculateOpportunityScore(account, product) {
        let score = 0;
        
        // Whitespace Analysis Factors (50% of score)
        const whitespaceScore = this.calculateWhitespaceScore(account, product);
        score += whitespaceScore * 0.5;
        
        // Account Readiness Factors (30% of score)
        const readinessScore = this.calculateAccountReadiness(account, product);
        score += readinessScore * 0.3;
        
        // Strategic Value Factors (20% of score)
        const strategicScore = this.calculateStrategicValue(account, product);
        score += strategicScore * 0.2;
        
        return Math.round(Math.min(100, Math.max(0, score)));
    }

    calculateWhitespaceScore(account, product) {
        let whitespaceScore = 0;
        
        // Market penetration (lower penetration = higher opportunity)
        const penetrationRate = parseFloat(account.penetrationRate);
        if (penetrationRate < 30) whitespaceScore += 40;
        else if (penetrationRate < 50) whitespaceScore += 30;
        else if (penetrationRate < 70) whitespaceScore += 20;
        else whitespaceScore += 10;
        
        // Absolute whitespace value
        if (account.whitespaceValue > 150000) whitespaceScore += 30;
        else if (account.whitespaceValue > 100000) whitespaceScore += 25;
        else if (account.whitespaceValue > 50000) whitespaceScore += 20;
        else whitespaceScore += 10;
        
        // Product fit for remaining market
        const productPotential = this.calculateProductPotential(product.name, account.companySize, account.industry);
        if (productPotential >= product.listPrice) whitespaceScore += 30;
        else whitespaceScore += 15;
        
        return Math.min(100, whitespaceScore);
    }

    calculateAccountReadiness(account, product) {
        let readinessScore = 0;
        
        // Growth stage readiness
        if (account.growthStage === 'growth') readinessScore += 40;
        else if (account.growthStage === 'early') readinessScore += 25;
        else readinessScore += 15; // mature accounts are harder to expand
        
        // Tier relationship strength
        if (account.tier === 'Platinum') readinessScore += 25;
        else if (account.tier === 'Gold') readinessScore += 20;
        else readinessScore += 10;
        
        // Product prerequisite analysis
        const hasPrerequisites = this.checkProductPrerequisites(account, product);
        if (hasPrerequisites) readinessScore += 35;
        else readinessScore += 5;
        
        return Math.min(100, readinessScore);
    }

    calculateStrategicValue(account, product) {
        let strategicScore = 0;
        
        // Product strategic importance
        if (product.category === 'Platform') strategicScore += 30; // Foundation products
        else if (product.category === 'Security') strategicScore += 25; // High priority
        else if (product.category === 'Analytics') strategicScore += 20; // Growth products
        else strategicScore += 15;
        
        // Account strategic value
        if (account.companySize === 'Enterprise') strategicScore += 30;
        else if (account.companySize === 'Mid-Market') strategicScore += 20;
        else strategicScore += 10;
        
        // Industry alignment
        const industryMultiplier = this.getIndustryMultiplier(account.industry);
        strategicScore += (industryMultiplier - 1) * 40; // Convert multiplier to score
        
        return Math.min(100, strategicScore);
    }

    checkProductPrerequisites(account, product) {
        // Define prerequisite relationships
        const prerequisites = {
            'Advanced Analytics': ['Core Platform'],
            'API Integration Pack': ['Core Platform'],
            'Security Module': ['Core Platform'],
            'Reporting Dashboard': ['Core Platform']
        };
        
        const requiredProducts = prerequisites[product.name];
        if (!requiredProducts) return true; // No prerequisites
        
        // Check if account has adopted required products
        return requiredProducts.every(reqProduct => {
            return this.adoptions.some(adoption => 
                adoption.accountId === account.id && 
                this.products.find(p => p.id === adoption.productId && p.name === reqProduct)
            );
        });
    }

    calculateStats(opportunities) {
        const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0);
        const totalCurrentARR = this.accounts.reduce((sum, account) => sum + account.currentARR, 0);
        
        const opportunitiesByProduct = {};
        const opportunitiesByAccount = {};
        
        opportunities.forEach(opp => {
            if (!opportunitiesByProduct[opp.product.name]) {
                opportunitiesByProduct[opp.product.name] = { count: 0, value: 0 };
            }
            if (!opportunitiesByAccount[opp.account.name]) {
                opportunitiesByAccount[opp.account.name] = { count: 0, value: 0 };
            }
            
            opportunitiesByProduct[opp.product.name].count++;
            opportunitiesByProduct[opp.product.name].value += opp.opportunityValue;
            
            opportunitiesByAccount[opp.account.name].count++;
            opportunitiesByAccount[opp.account.name].value += opp.opportunityValue;
        });
        
        // Generate revenue projections
        const revenueProjections = this.calculateRevenueProjections(opportunities, totalCurrentARR);
        
        // Calculate whitespace-specific metrics
        const whitespaceMetrics = this.calculateWhitespaceMetrics();
        
        return {
            totalAccounts: this.accounts.length,
            totalProducts: this.products.length,
            totalOpportunities: opportunities.length,
            totalOpportunityValue,
            totalCurrentARR,
            potentialLift: totalCurrentARR > 0 ? ((totalOpportunityValue / totalCurrentARR) * 100).toFixed(1) : 0,
            opportunitiesByProduct,
            opportunitiesByAccount,
            revenueProjections,
            whitespaceMetrics
        };
    }

    calculateWhitespaceMetrics() {
        const totalMarketPotential = this.accounts.reduce((sum, account) => sum + account.totalMarketPotential, 0);
        const totalWhitespaceValue = this.accounts.reduce((sum, account) => sum + account.whitespaceValue, 0);
        const totalCurrentARR = this.accounts.reduce((sum, account) => sum + account.currentARR, 0);
        
        const avgPenetrationRate = this.accounts.reduce((sum, account) => 
            sum + parseFloat(account.penetrationRate), 0) / this.accounts.length;
        
        // Account penetration distribution
        const penetrationDistribution = {
            low: this.accounts.filter(acc => parseFloat(acc.penetrationRate) < 30).length,
            medium: this.accounts.filter(acc => parseFloat(acc.penetrationRate) >= 30 && parseFloat(acc.penetrationRate) < 70).length,
            high: this.accounts.filter(acc => parseFloat(acc.penetrationRate) >= 70).length
        };
        
        // Top whitespace accounts
        const topWhitespaceAccounts = [...this.accounts]
            .sort((a, b) => b.whitespaceValue - a.whitespaceValue)
            .slice(0, 3);
        
        return {
            totalMarketPotential,
            totalWhitespaceValue,
            avgPenetrationRate: avgPenetrationRate.toFixed(1),
            marketCaptureRate: ((totalCurrentARR / totalMarketPotential) * 100).toFixed(1),
            penetrationDistribution,
            topWhitespaceAccounts
        };
    }

    // Transparent Revenue Projection Calculations
    calculateRevenueProjections(opportunities, currentARR) {
        // Assign opportunities to quarters based on transparent logic
        const quarterlyOpportunities = this.assignOpportunitiesToQuarters(opportunities);
        
        // Calculate projections with detailed breakdowns
        const projections = {
            current: currentARR,
            quarters: {},
            yearEnd: {},
            confidence: {},
            roi: {},
            methodology: this.getProjectionMethodology()
        };
        
        let cumulativeNewARR = 0;
        
        // Calculate each quarter with detailed breakdowns
        ['q1', 'q2', 'q3', 'q4'].forEach((quarter, index) => {
            const quarterOpps = quarterlyOpportunities[quarter];
            const quarterProjection = this.calculateQuarterProjection(quarterOpps);
            
            cumulativeNewARR += quarterProjection.totalValue;
            
            projections.quarters[quarter] = {
                opportunities: quarterOpps,
                newARR: quarterProjection.totalValue,
                totalARR: currentARR + cumulativeNewARR,
                growth: ((cumulativeNewARR / currentARR) * 100).toFixed(1),
                confidenceLevel: this.getQuarterConfidenceLevel(quarter),
                breakdown: quarterProjection.breakdown
            };
        });
        
        // Year-end summary
        projections.yearEnd = {
            totalNewARR: cumulativeNewARR,
            totalARR: currentARR + cumulativeNewARR,
            totalGrowth: ((cumulativeNewARR / currentARR) * 100).toFixed(1)
        };
        
        // Confidence scenarios
        projections.confidence = {
            conservative: Math.round(cumulativeNewARR * 0.65),
            expected: Math.round(cumulativeNewARR),
            optimistic: Math.round(cumulativeNewARR * 1.4)
        };
        
        // ROI Analysis
        projections.roi = this.calculateExpansionROI(cumulativeNewARR);
        
        return projections;
    }

    assignOpportunitiesToQuarters(opportunities) {
        const quarters = { q1: [], q2: [], q3: [], q4: [] };
        
        opportunities.forEach(opp => {
            const quarter = this.determineOpportunityQuarter(opp);
            quarters[quarter].push({
                ...opp,
                projectedValue: this.calculateProjectedValue(opp, quarter),
                reasoning: this.getQuarterAssignmentReasoning(opp, quarter)
            });
        });
        
        return quarters;
    }

    determineOpportunityQuarter(opportunity) {
        const score = opportunity.score;
        const account = opportunity.account;
        const product = opportunity.product;
        
        // High-confidence opportunities (Score 80+) - Q1
        if (score >= 80) return 'q1';
        
        // Good opportunities with prerequisites met (Score 65+) - Q1-Q2  
        if (score >= 65 && this.checkProductPrerequisites(account, product)) {
            return 'q1';
        }
        
        // Medium opportunities (Score 50-64) - Q2-Q3
        if (score >= 50) {
            return account.growthStage === 'growth' ? 'q2' : 'q3';
        }
        
        // Lower confidence opportunities (Score 35-49) - Q3-Q4
        if (score >= 35) {
            return 'q3';
        }
        
        // Speculative opportunities (Score < 35) - Q4
        return 'q4';
    }

    calculateProjectedValue(opportunity, quarter) {
        const baseValue = opportunity.opportunityValue;
        const score = opportunity.score;
        const confidenceMultiplier = this.getQuarterConfidenceLevel(quarter) / 100;
        
        // Probability based on score
        let probability;
        if (score >= 80) probability = 0.85;
        else if (score >= 65) probability = 0.70;
        else if (score >= 50) probability = 0.55;
        else if (score >= 35) probability = 0.40;
        else probability = 0.25;
        
        return Math.round(baseValue * probability * confidenceMultiplier);
    }

    getQuarterConfidenceLevel(quarter) {
        const confidenceLevels = {
            'q1': 85, // High confidence - proven opportunities
            'q2': 70, // Good confidence - clear pipeline 
            'q3': 55, // Medium confidence - needs development
            'q4': 40  // Lower confidence - speculative
        };
        return confidenceLevels[quarter];
    }

    calculateQuarterProjection(opportunities) {
        let totalValue = 0;
        const breakdown = [];
        
        opportunities.forEach(opp => {
            totalValue += opp.projectedValue;
            breakdown.push({
                account: opp.account.name,
                product: opp.product.name,
                opportunityValue: opp.opportunityValue,
                projectedValue: opp.projectedValue,
                score: opp.score,
                reasoning: opp.reasoning,
                calculation: this.getCalculationFormula(opp)
            });
        });
        
        // Sort by projected value (highest first)
        breakdown.sort((a, b) => b.projectedValue - a.projectedValue);
        
        return { totalValue, breakdown };
    }

    getCalculationFormula(opportunity) {
        const baseValue = opportunity.opportunityValue;
        const score = opportunity.score;
        const projectedValue = opportunity.projectedValue;
        const probability = (projectedValue / baseValue).toFixed(2);
        
        return `$${baseValue.toLocaleString()} × ${score}/100 score × ${(probability * 100).toFixed(0)}% probability = $${projectedValue.toLocaleString()}`;
    }

    getQuarterAssignmentReasoning(opportunity, quarter) {
        const score = opportunity.score;
        const account = opportunity.account;
        const product = opportunity.product;
        const hasPrereqs = this.checkProductPrerequisites(account, product);
        
        if (quarter === 'q1') {
            if (score >= 80) return `High score (${score}) + strong account relationship`;
            if (score >= 65 && hasPrereqs) return `Good score (${score}) + prerequisites met`;
            return `Ready for immediate expansion`;
        } else if (quarter === 'q2') {
            return `Growth stage account + medium confidence (${score})`;
        } else if (quarter === 'q3') {
            return `Requires nurturing + account development`;
        } else {
            return `Speculative opportunity + long-term potential`;
        }
    }

    getProjectionMethodology() {
        return {
            q1: "High-confidence opportunities (Score 80+) or ready opportunities (65+ with prerequisites)",
            q2: "Medium opportunities in growth-stage accounts (Score 50-64)",  
            q3: "Developing opportunities requiring nurturing (Score 35-49)",
            q4: "Speculative opportunities with long-term potential (Score <35)",
            calculation: "Projected Value = Opportunity Value × Score-Based Probability × Quarter Confidence"
        };
    }

    calculateExpansionROI(projectedNewARR) {
        // Assume 20% cost of expansion (sales, implementation, support)
        const expansionCost = projectedNewARR * 0.2;
        const netGain = projectedNewARR - expansionCost;
        const roi = ((netGain / expansionCost) * 100).toFixed(1);
        
        return {
            projectedRevenue: projectedNewARR,
            estimatedCost: expansionCost,
            netGain: netGain,
            roi: roi,
            paybackMonths: Math.ceil(expansionCost / (projectedNewARR / 12))
        };
    }

    // Account Intelligence Features
    generateAccountIntelligence() {
        return this.accounts.map(account => {
            const accountOpportunities = this.getAccountOpportunities(account);
            const expansionReadiness = this.calculateExpansionReadiness(account);
            const growthTrajectory = this.analyzeGrowthTrajectory(account);
            const riskFactors = this.identifyRiskFactors(account);
            const recommendedActions = this.generateRecommendedActions(account, accountOpportunities);
            
            return {
                ...account,
                intelligence: {
                    expansionReadiness,
                    growthTrajectory,
                    riskFactors,
                    recommendedActions,
                    priorityScore: this.calculateAccountPriorityScore(account, accountOpportunities),
                    nextBestAction: this.getNextBestAction(account, accountOpportunities),
                    timeline: this.getExpansionTimeline(account, accountOpportunities)
                }
            };
        });
    }

    getAccountOpportunities(account) {
        return this.analysisResults?.opportunities?.filter(opp => opp.accountId === account.id) || [];
    }

    calculateExpansionReadiness(account) {
        let readinessScore = 0;
        const factors = [];
        
        // Growth stage factor
        if (account.growthStage === 'growth') {
            readinessScore += 30;
            factors.push({ factor: 'Growth Stage', score: 30, note: 'Account in active growth phase' });
        } else if (account.growthStage === 'early') {
            readinessScore += 20;
            factors.push({ factor: 'Growth Stage', score: 20, note: 'Early stage with expansion potential' });
        } else {
            readinessScore += 10;
            factors.push({ factor: 'Growth Stage', score: 10, note: 'Mature account - expansion requires strategic approach' });
        }
        
        // Penetration rate factor
        const penetration = parseFloat(account.penetrationRate);
        if (penetration < 30) {
            readinessScore += 25;
            factors.push({ factor: 'Market Penetration', score: 25, note: 'Low penetration = high expansion opportunity' });
        } else if (penetration < 60) {
            readinessScore += 15;
            factors.push({ factor: 'Market Penetration', score: 15, note: 'Medium penetration with room to grow' });
        } else {
            readinessScore += 5;
            factors.push({ factor: 'Market Penetration', score: 5, note: 'High penetration - limited upside remaining' });
        }
        
        // Relationship strength (tier-based)
        if (account.tier === 'Platinum') {
            readinessScore += 20;
            factors.push({ factor: 'Relationship Strength', score: 20, note: 'Strong strategic partnership' });
        } else if (account.tier === 'Gold') {
            readinessScore += 15;
            factors.push({ factor: 'Relationship Strength', score: 15, note: 'Good working relationship' });
        } else {
            readinessScore += 5;
            factors.push({ factor: 'Relationship Strength', score: 5, note: 'Relationship building needed' });
        }
        
        // Size and strategic value
        if (account.companySize === 'Enterprise') {
            readinessScore += 15;
            factors.push({ factor: 'Account Size', score: 15, note: 'Enterprise scale enables large expansions' });
        } else if (account.companySize === 'Mid-Market') {
            readinessScore += 10;
            factors.push({ factor: 'Account Size', score: 10, note: 'Mid-market with good expansion potential' });
        } else {
            readinessScore += 5;
            factors.push({ factor: 'Account Size', score: 5, note: 'SMB - focus on high-value, focused expansions' });
        }
        
        // Whitespace value factor
        if (account.whitespaceValue > 100000) {
            readinessScore += 10;
            factors.push({ factor: 'Whitespace Value', score: 10, note: 'Significant untapped potential' });
        } else if (account.whitespaceValue > 50000) {
            readinessScore += 5;
            factors.push({ factor: 'Whitespace Value', score: 5, note: 'Moderate expansion opportunity' });
        }
        
        return {
            score: Math.min(100, readinessScore),
            level: readinessScore >= 80 ? 'High' : readinessScore >= 60 ? 'Medium' : 'Low',
            factors: factors
        };
    }

    analyzeGrowthTrajectory(account) {
        // Simulate growth analysis based on current metrics
        const currentARR = account.currentARR;
        const penetration = parseFloat(account.penetrationRate);
        const growthStage = account.growthStage;
        
        let trajectory = 'Stable';
        let projectedGrowth = 0;
        let confidence = 'Medium';
        
        if (growthStage === 'growth' && penetration < 50) {
            trajectory = 'Accelerating';
            projectedGrowth = 25;
            confidence = 'High';
        } else if (growthStage === 'growth') {
            trajectory = 'Growing';
            projectedGrowth = 15;
            confidence = 'High';
        } else if (growthStage === 'early' && currentARR > 50000) {
            trajectory = 'Emerging';
            projectedGrowth = 35;
            confidence = 'Medium';
        } else if (penetration > 80) {
            trajectory = 'Mature';
            projectedGrowth = 5;
            confidence = 'High';
        }
        
        return {
            trajectory,
            projectedGrowth,
            confidence,
            timeframe: '12 months',
            keyDrivers: this.getGrowthDrivers(account)
        };
    }

    getGrowthDrivers(account) {
        const drivers = [];
        
        if (parseFloat(account.penetrationRate) < 50) {
            drivers.push('Significant whitespace remaining');
        }
        
        if (account.growthStage === 'growth') {
            drivers.push('Company in active growth phase');
        }
        
        if (account.tier === 'Platinum' || account.tier === 'Gold') {
            drivers.push('Strong existing relationship');
        }
        
        if (account.companySize === 'Enterprise') {
            drivers.push('Enterprise scale and budget');
        }
        
        // Add industry-specific drivers
        if (account.industry === 'Technology') {
            drivers.push('Tech sector adoption momentum');
        } else if (account.industry === 'Financial Services') {
            drivers.push('Regulatory compliance requirements');
        }
        
        return drivers.length > 0 ? drivers : ['Market dynamics', 'Product evolution'];
    }

    identifyRiskFactors(account) {
        const risks = [];
        
        if (parseFloat(account.penetrationRate) > 75) {
            risks.push({
                risk: 'High Penetration',
                severity: 'Medium',
                mitigation: 'Focus on adjacent products and deeper platform integration'
            });
        }
        
        if (account.growthStage === 'mature') {
            risks.push({
                risk: 'Mature Account',
                severity: 'Medium', 
                mitigation: 'Require strategic value proposition and executive sponsorship'
            });
        }
        
        if (account.tier === 'Standard') {
            risks.push({
                risk: 'Limited Relationship Depth',
                severity: 'High',
                mitigation: 'Invest in relationship building before major expansion attempts'
            });
        }
        
        if (account.companySize === 'SMB') {
            risks.push({
                risk: 'Budget Constraints',
                severity: 'Medium',
                mitigation: 'Focus on ROI-driven, phased implementations'
            });
        }
        
        return risks;
    }

    generateRecommendedActions(account, opportunities) {
        const actions = [];
        const topOpps = opportunities.slice(0, 3);
        
        if (topOpps.length === 0) {
            return [{ action: 'Account Assessment', priority: 'Medium', description: 'Conduct comprehensive account review to identify new opportunities' }];
        }
        
        const readiness = this.calculateExpansionReadiness(account);
        
        if (readiness.score >= 80) {
            actions.push({
                action: 'Immediate Expansion',
                priority: 'High',
                description: `Execute top opportunity: ${topOpps[0].product.name} (Score: ${topOpps[0].score})`
            });
        } else if (readiness.score >= 60) {
            actions.push({
                action: 'Relationship Development',
                priority: 'High',
                description: 'Strengthen relationships before expansion execution'
            });
        } else {
            actions.push({
                action: 'Foundation Building',
                priority: 'Medium',
                description: 'Build account foundation before major expansion efforts'
            });
        }
        
        // Add opportunity-specific actions
        topOpps.forEach((opp, index) => {
            if (index < 2) { // Top 2 opportunities
                const hasPrereqs = this.checkProductPrerequisites(account, opp.product);
                if (!hasPrereqs) {
                    actions.push({
                        action: 'Prerequisites Setup',
                        priority: 'Medium',
                        description: `Establish foundation products before ${opp.product.name}`
                    });
                }
            }
        });
        
        return actions;
    }

    calculateAccountPriorityScore(account, opportunities) {
        const whitespaceWeight = 0.3;
        const readinessWeight = 0.4;
        const opportunityWeight = 0.3;
        
        const whitespaceScore = (account.whitespaceValue / 200000) * 100; // Normalize to 200k max
        const readinessScore = this.calculateExpansionReadiness(account).score;
        const opportunityScore = opportunities.length > 0 ? 
            opportunities.reduce((sum, opp) => sum + opp.score, 0) / opportunities.length : 0;
        
        return Math.round(
            (whitespaceScore * whitespaceWeight) +
            (readinessScore * readinessWeight) +
            (opportunityScore * opportunityWeight)
        );
    }

    getNextBestAction(account, opportunities) {
        const readiness = this.calculateExpansionReadiness(account);
        
        if (opportunities.length === 0) {
            return 'Conduct opportunity assessment to identify expansion potential';
        }
        
        const topOpp = opportunities[0];
        
        if (readiness.score >= 80) {
            return `Initiate ${topOpp.product.name} expansion discussion (High readiness, Score: ${topOpp.score})`;
        } else if (readiness.score >= 60) {
            return `Build relationship foundation before pursuing ${topOpp.product.name}`;
        } else {
            return `Strengthen account engagement before expansion efforts`;
        }
    }

    getExpansionTimeline(account, opportunities) {
        const readiness = this.calculateExpansionReadiness(account);
        const timeline = {};
        
        if (opportunities.length === 0) {
            timeline['Q1'] = 'Opportunity assessment and planning';
            timeline['Q2-Q3'] = 'Foundation building and relationship development';
            timeline['Q4'] = 'Initial expansion initiatives';
            return timeline;
        }
        
        const sortedOpps = [...opportunities].sort((a, b) => b.score - a.score);
        
        if (readiness.score >= 80) {
            timeline['Q1'] = `Execute ${sortedOpps[0].product.name} expansion`;
            if (sortedOpps.length > 1) {
                timeline['Q2'] = `Pursue ${sortedOpps[1].product.name}`;
            }
            if (sortedOpps.length > 2) {
                timeline['Q3-Q4'] = 'Additional product expansions';
            }
        } else if (readiness.score >= 60) {
            timeline['Q1'] = 'Relationship strengthening and foundation building';
            timeline['Q2'] = `Begin ${sortedOpps[0].product.name} expansion process`;
            timeline['Q3-Q4'] = 'Execute expansion and assess additional opportunities';
        } else {
            timeline['Q1-Q2'] = 'Account relationship development';
            timeline['Q3'] = 'Readiness assessment and planning';
            timeline['Q4'] = 'Initial expansion discussions';
        }
        
        return timeline;
    }

    // Expansion Playbooks
    generateExpansionPlaybooks() {
        return this.accounts.map(account => {
            const accountOpportunities = this.getAccountOpportunities(account);
            const expansionReadiness = this.calculateExpansionReadiness(account);
            const playbook = this.createAccountPlaybook(account, accountOpportunities, expansionReadiness);
            
            return {
                accountId: account.id,
                accountName: account.name,
                playbookType: playbook.type,
                playbook: playbook
            };
        });
    }

    createAccountPlaybook(account, opportunities, readiness) {
        const playbookType = this.determinePlaybookType(account, readiness);
        const playbook = {
            type: playbookType,
            title: this.getPlaybookTitle(playbookType, account),
            description: this.getPlaybookDescription(playbookType, account),
            phases: this.generatePlaybookPhases(playbookType, account, opportunities),
            timeline: this.generatePlaybookTimeline(playbookType, opportunities),
            stakeholders: this.identifyKeyStakeholders(account, playbookType),
            resources: this.getRequiredResources(playbookType, account),
            successMetrics: this.defineSuccessMetrics(playbookType, account, opportunities),
            competitiveInsights: this.generateCompetitiveInsights(account),
            riskMitigation: this.generateRiskMitigation(account, playbookType)
        };
        
        return playbook;
    }

    determinePlaybookType(account, readiness) {
        const penetration = parseFloat(account.penetrationRate);
        const growthStage = account.growthStage;
        const companySize = account.companySize;
        const readinessScore = readiness.score;
        const whitespaceValue = account.whitespaceValue;
        const opportunities = this.getAccountOpportunities(account);
        const adoptedProductCount = this.getAdoptedProductCount(account);
        
        // High-Velocity Product Expansion (PLG-driven, usage-based triggers)
        if (readinessScore >= 85 && penetration < 40 && growthStage === 'hypergrowth' && whitespaceValue > 300000) {
            return 'high-velocity-expansion';
        }
        
        // Strategic Partnership Development (executive relationship focus)
        else if (companySize === 'Enterprise' && account.tier === 'Platinum' && readinessScore >= 70 && whitespaceValue > 250000) {
            return 'strategic-partnership';
        }
        
        // Platform Ecosystem Expansion (integration-led growth)
        else if (adoptedProductCount >= 3 && penetration > 50 && this.hasIntegrationOpportunities(account)) {
            return 'platform-ecosystem';
        }
        
        // Usage-Based Scaling (consumption-driven expansion)
        else if (this.hasUsageScalingOpportunity(account) && readinessScore >= 60) {
            return 'usage-based-scaling';
        }
        
        // Multi-Product Cross-Sell (adjacent product opportunities)
        else if (adoptedProductCount <= 2 && opportunities.length >= 4 && readinessScore >= 65) {
            return 'multi-product-cross-sell';
        }
        
        // Geographic/Departmental Expansion (horizontal growth)
        else if (companySize === 'Enterprise' && this.hasHorizontalExpansionOpportunity(account)) {
            return 'geographic-departmental';
        }
        
        // Feature Adoption Deepening (maximizing platform value)
        else if (penetration > 60 && this.hasUnderutilizedFeatures(account)) {
            return 'feature-adoption-deepening';
        }
        
        // Renewal+ Strategy (retention with expansion focus)
        else {
            return 'renewal-plus';
        }
    }

    // Helper methods for modern playbook determination
    getAdoptedProductCount(account) {
        return this.adoptions.filter(adoption => adoption.accountId === account.id).length;
    }

    hasIntegrationOpportunities(account) {
        // Check if account has API Integration Pack or could benefit from platform integrations
        const hasApiProduct = this.adoptions.some(adoption => 
            adoption.accountId === account.id && 
            this.products.find(p => p.id === adoption.productId)?.category === 'Integration'
        );
        return !hasApiProduct && account.companySize === 'Enterprise';
    }

    hasUsageScalingOpportunity(account) {
        // Simulate usage-based scaling opportunities (normally would be from usage data)
        const adoptedProducts = this.getAdoptedProductCount(account);
        return adoptedProducts >= 2 && account.employeeCount > 500;
    }

    hasHorizontalExpansionOpportunity(account) {
        // Check for geographic or departmental expansion potential
        return account.employeeCount > 1000 && account.revenueSize > 100000000;
    }

    hasUnderutilizedFeatures(account) {
        // Simulate feature utilization analysis (normally would be from product analytics)
        const adoptedCount = this.getAdoptedProductCount(account);
        const penetration = parseFloat(account.penetrationRate);
        return adoptedCount >= 3 && penetration > 60 && penetration < 90;
    }

    getPlaybookTitle(type, account) {
        const titles = {
            'high-velocity-expansion': `High-Velocity Product Expansion: ${account.name}`,
            'strategic-partnership': `Strategic Partnership Development: ${account.name}`,
            'platform-ecosystem': `Platform Ecosystem Expansion: ${account.name}`,
            'usage-based-scaling': `Usage-Based Scaling Strategy: ${account.name}`,
            'multi-product-cross-sell': `Multi-Product Cross-Sell Initiative: ${account.name}`,
            'geographic-departmental': `Geographic & Departmental Expansion: ${account.name}`,
            'feature-adoption-deepening': `Feature Adoption Deepening: ${account.name}`,
            'renewal-plus': `Renewal+ Expansion Strategy: ${account.name}`
        };
        return titles[type] || `Expansion Strategy: ${account.name}`;
    }

    getPlaybookDescription(type, account) {
        const descriptions = {
            'high-velocity-expansion': `Product-led growth expansion for ${account.name} leveraging usage signals and hypergrowth momentum. Deploy rapid-fire product adoption with data-driven triggers, self-serve onboarding, and consumption-based expansion. Target 3-5 product additions within 90 days using PLG methodology.`,
            'strategic-partnership': `Executive-level partnership development with ${account.name} focusing on multi-year strategic alignment. Engage C-suite stakeholders, co-create business outcomes, establish joint success metrics, and position as strategic technology partner. Build enterprise-wide platform dependency over 6-12 months.`,
            'platform-ecosystem': `Integration-led expansion maximizing ecosystem value at ${account.name}. Leverage existing 3+ product foundation to drive API integrations, workflow automation, and platform consolidation. Focus on becoming the central hub for their tech stack with advanced platform features.`,
            'usage-based-scaling': `Consumption-driven expansion targeting increased usage across existing products at ${account.name}. Analyze utilization patterns, identify scaling opportunities, and implement tier-based upgrades. Drive revenue growth through feature adoption and usage-based billing optimization.`,
            'multi-product-cross-sell': `Adjacent product strategy targeting 4+ expansion opportunities at ${account.name}. Systematic cross-sell approach leveraging product synergies, departmental use cases, and workflow integrations. Execute coordinated multi-product demos and bundled value propositions.`,
            'geographic-departmental': `Horizontal expansion strategy targeting new divisions, geographic regions, or business units within ${account.name}. Leverage existing success stories as proof points, identify departmental champions, and replicate deployment models across the organization.`,
            'feature-adoption-deepening': `Advanced feature utilization strategy to maximize platform value at ${account.name}. Focus on unlocking premium capabilities, advanced workflows, and power-user features. Drive deeper engagement through training, consulting, and feature-specific success programs.`,
            'renewal-plus': `Retention-first expansion approach combining renewal security with strategic growth opportunities at ${account.name}. Ensure contract renewal while identifying selective expansion opportunities. Balance risk mitigation with growth through value-first relationship building.`
        };
        return descriptions[type];
    }

    generatePlaybookPhases(type, account, opportunities) {
        const phases = {
            'high-velocity-expansion': [
                {
                    phase: 1,
                    title: 'PLG Trigger Analysis & Rapid Setup',
                    duration: '1-2 weeks',
                    activities: [
                        'Analyze usage data and identify expansion triggers',
                        'Deploy self-serve onboarding for 3-5 target products',
                        'Configure consumption-based pricing and tracking',
                        'Set up automated usage alerts and expansion signals'
                    ]
                },
                {
                    phase: 2,
                    title: 'High-Velocity Product Rollout',
                    duration: '4-6 weeks',
                    activities: [
                        'Launch parallel product trials with usage incentives',
                        'Execute rapid onboarding workshops for each product',
                        'Monitor adoption metrics and optimize conversion funnels',
                        'Scale successful products and pause underperformers'
                    ]
                },
                {
                    phase: 3,
                    title: 'Momentum Scaling & Optimization',
                    duration: '3-4 weeks',
                    activities: [
                        'Convert high-usage trials to paid subscriptions',
                        'Implement usage-based upselling automation',
                        'Establish product champion network for viral adoption',
                        'Plan next-wave expansion with advanced features'
                    ]
                }
            ],
            'strategic-partnership': [
                {
                    phase: 1,
                    title: 'C-Suite Engagement & Strategic Planning',
                    duration: '4-6 weeks',
                    activities: [
                        'Schedule executive business review with C-suite',
                        'Conduct joint strategic planning session',
                        'Map multi-year technology roadmap alignment',
                        'Establish executive sponsor and steering committee'
                    ]
                },
                {
                    phase: 2,
                    title: 'Partnership Framework Development',
                    duration: '6-8 weeks',
                    activities: [
                        'Co-create business outcomes and success metrics',
                        'Design enterprise-wide deployment plan',
                        'Establish preferred vendor agreements and SLAs',
                        'Create joint marketing and thought leadership plan'
                    ]
                },
                {
                    phase: 3,
                    title: 'Strategic Platform Expansion',
                    duration: '8-12 weeks',
                    activities: [
                        'Execute enterprise platform rollout across divisions',
                        'Implement advanced integration and automation',
                        'Establish center of excellence and training programs',
                        'Plan strategic innovation initiatives and partnerships'
                    ]
                }
            ],
            'platform-ecosystem': [
                {
                    phase: 1,
                    title: 'Integration Architecture Assessment',
                    duration: '2-3 weeks',
                    activities: [
                        'Audit current tech stack and integration points',
                        'Map API opportunities and data flow requirements',
                        'Identify workflow automation and consolidation opportunities',
                        'Design comprehensive platform ecosystem blueprint'
                    ]
                },
                {
                    phase: 2,
                    title: 'API & Workflow Integration Launch',
                    duration: '6-8 weeks',
                    activities: [
                        'Deploy API integration pack and connectivity suite',
                        'Implement advanced workflow automation features',
                        'Connect existing products for seamless data flow',
                        'Pilot advanced platform features with power users'
                    ]
                },
                {
                    phase: 3,
                    title: 'Ecosystem Consolidation & Enhancement',
                    duration: '4-6 weeks',
                    activities: [
                        'Complete platform consolidation and optimization',
                        'Deploy advanced analytics and insights capabilities',
                        'Establish platform governance and best practices',
                        'Plan future ecosystem expansion and innovation'
                    ]
                }
            ],
            'usage-based-scaling': [
                {
                    phase: 1,
                    title: 'Usage Analytics & Scaling Opportunity Mapping',
                    duration: '2-3 weeks',
                    activities: [
                        'Deploy advanced usage analytics and monitoring',
                        'Analyze consumption patterns and scaling opportunities',
                        'Identify feature adoption gaps and optimization areas',
                        'Map tier-based upgrade paths and pricing optimization'
                    ]
                },
                {
                    phase: 2,
                    title: 'Consumption-Driven Expansion Execution',
                    duration: '4-6 weeks',
                    activities: [
                        'Implement usage-based billing and tier upgrades',
                        'Deploy automated scaling recommendations and alerts',
                        'Launch power user training and feature adoption programs',
                        'Optimize pricing tiers based on usage patterns'
                    ]
                },
                {
                    phase: 3,
                    title: 'Revenue Growth Optimization',
                    duration: '4-5 weeks',
                    activities: [
                        'Scale successful usage-based revenue streams',
                        'Implement predictive scaling and growth automation',
                        'Establish usage-based success metrics and reporting',
                        'Plan advanced feature rollout based on consumption data'
                    ]
                }
            ],
            'multi-product-cross-sell': [
                {
                    phase: 1,
                    title: 'Product Synergy Mapping & Opportunity Prioritization',
                    duration: '2-3 weeks',
                    activities: [
                        'Map product synergies and workflow integrations',
                        'Prioritize 4+ expansion opportunities by value and readiness',
                        'Identify departmental use cases and stakeholders',
                        'Design coordinated multi-product demo strategy'
                    ]
                },
                {
                    phase: 2,
                    title: 'Coordinated Cross-Sell Campaign',
                    duration: '6-8 weeks',
                    activities: [
                        'Execute multi-product demos and value presentations',
                        'Leverage product synergies for bundled value propositions',
                        'Coordinate parallel opportunity development tracks',
                        'Implement cross-product success stories and case studies'
                    ]
                },
                {
                    phase: 3,
                    title: 'Portfolio Optimization & Expansion',
                    duration: '4-6 weeks',
                    activities: [
                        'Complete multi-product deals and implementation',
                        'Optimize product mix and integration workflows',
                        'Establish comprehensive customer success programs',
                        'Plan additional product expansion opportunities'
                    ]
                }
            ],
            'geographic-departmental': [
                {
                    phase: 1,
                    title: 'Horizontal Expansion Mapping',
                    duration: '3-4 weeks',
                    activities: [
                        'Map organizational structure and expansion opportunities',
                        'Identify geographic regions and departments for expansion',
                        'Document current success stories and proof points',
                        'Develop departmental champion identification strategy'
                    ]
                },
                {
                    phase: 2,
                    title: 'Systematic Horizontal Rollout',
                    duration: '6-10 weeks',
                    activities: [
                        'Launch pilot programs in target departments/regions',
                        'Leverage existing success stories for social proof',
                        'Execute department-specific value demonstrations',
                        'Replicate successful deployment models across units'
                    ]
                },
                {
                    phase: 3,
                    title: 'Organization-Wide Scaling',
                    duration: '4-6 weeks',
                    activities: [
                        'Complete enterprise-wide deployment and training',
                        'Establish governance and best practices across units',
                        'Implement organization-wide success metrics and reporting',
                        'Plan strategic initiatives for continued expansion'
                    ]
                }
            ],
            'feature-adoption-deepening': [
                {
                    phase: 1,
                    title: 'Advanced Feature Utilization Assessment',
                    duration: '2-3 weeks',
                    activities: [
                        'Audit current feature adoption and utilization rates',
                        'Identify premium capabilities and advanced workflows',
                        'Map power-user opportunities and training needs',
                        'Design feature-specific success and adoption programs'
                    ]
                },
                {
                    phase: 2,
                    title: 'Power User Enablement & Training',
                    duration: '4-6 weeks',
                    activities: [
                        'Launch advanced feature training and certification programs',
                        'Deploy power-user workshops and best practices sessions',
                        'Implement consulting-led optimization initiatives',
                        'Create internal champions and feature expertise centers'
                    ]
                },
                {
                    phase: 3,
                    title: 'Platform Mastery & Optimization',
                    duration: '4-6 weeks',
                    activities: [
                        'Achieve advanced platform utilization and optimization',
                        'Establish ongoing consulting and optimization partnerships',
                        'Implement advanced automation and custom workflows',
                        'Plan strategic innovation and custom development initiatives'
                    ]
                }
            ],
            'renewal-plus': [
                {
                    phase: 1,
                    title: 'Renewal Security & Relationship Strengthening',
                    duration: '4-6 weeks',
                    activities: [
                        'Conduct comprehensive renewal risk assessment',
                        'Execute value-first relationship building initiatives',
                        'Document and communicate ROI and business outcomes',
                        'Secure renewal commitment and baseline relationship health'
                    ]
                },
                {
                    phase: 2,
                    title: 'Selective Expansion Identification',
                    duration: '3-4 weeks',
                    activities: [
                        'Identify low-risk, high-value expansion opportunities',
                        'Focus on adjacent products with proven ROI alignment',
                        'Present conservative expansion options with clear benefits',
                        'Balance growth initiatives with renewal security priorities'
                    ]
                },
                {
                    phase: 3,
                    title: 'Value-Driven Growth Execution',
                    duration: '3-4 weeks',
                    activities: [
                        'Execute approved expansion initiatives with proven value',
                        'Implement success-based growth and payment structures',
                        'Establish ongoing value monitoring and optimization',
                        'Plan future expansion as relationship strength increases'
                    ]
                }
            ]
        };
        
        return phases[type] || phases['renewal-plus'];
    }

    generatePlaybookTimeline(type, opportunities) {
        const timelines = {
            'high-velocity-expansion': {
                'Week 1-2': 'PLG trigger analysis and rapid setup',
                'Week 3-8': 'High-velocity product rollout and trials',
                'Week 9-12': 'Momentum scaling and optimization',
                'Month 4+': 'Next-wave expansion with advanced features'
            },
            'strategic-partnership': {
                'Month 1-2': 'C-suite engagement and strategic planning',
                'Month 3-4': 'Partnership framework development',
                'Month 5-8': 'Strategic platform expansion execution',
                'Month 9-12': 'Partnership optimization and innovation'
            },
            'platform-ecosystem': {
                'Week 1-3': 'Integration architecture assessment',
                'Week 4-11': 'API and workflow integration launch',
                'Week 12-17': 'Ecosystem consolidation and enhancement',
                'Month 5+': 'Future ecosystem expansion and innovation'
            },
            'usage-based-scaling': {
                'Week 1-3': 'Usage analytics and scaling opportunity mapping',
                'Week 4-9': 'Consumption-driven expansion execution',
                'Week 10-14': 'Revenue growth optimization',
                'Month 4+': 'Predictive scaling and advanced features'
            },
            'multi-product-cross-sell': {
                'Week 1-3': 'Product synergy mapping and prioritization',
                'Week 4-11': 'Coordinated cross-sell campaign execution',
                'Week 12-17': 'Portfolio optimization and expansion',
                'Month 5+': 'Additional product expansion opportunities'
            },
            'geographic-departmental': {
                'Week 1-4': 'Horizontal expansion mapping',
                'Week 5-14': 'Systematic horizontal rollout',
                'Week 15-20': 'Organization-wide scaling',
                'Month 6+': 'Strategic initiatives for continued expansion'
            },
            'feature-adoption-deepening': {
                'Week 1-3': 'Advanced feature utilization assessment',
                'Week 4-9': 'Power user enablement and training',
                'Week 10-15': 'Platform mastery and optimization',
                'Month 4+': 'Strategic innovation and custom development'
            },
            'renewal-plus': {
                'Month 1-2': 'Renewal security and relationship strengthening',
                'Month 3': 'Selective expansion identification',
                'Month 4': 'Value-driven growth execution',
                'Month 5+': 'Future expansion as relationship strength increases'
            }
        };
        
        return timelines[type] || timelines['renewal-plus'];
    }

    identifyKeyStakeholders(account, playbookType) {
        const baseStakeholders = [
            { role: 'Account Executive', responsibility: 'Overall relationship and deal execution' },
            { role: 'Customer Success Manager', responsibility: 'Value delivery and expansion identification' },
            { role: 'Solutions Engineer', responsibility: 'Technical validation and demonstration' }
        ];
        
        const additionalStakeholders = {
            'high-velocity-expansion': [
                { role: 'Product Led Growth Manager', responsibility: 'Usage analytics and PLG optimization' },
                { role: 'Sales Development Rep', responsibility: 'Rapid trial setup and conversion tracking' }
            ],
            'strategic-partnership': [
                { role: 'VP of Sales', responsibility: 'Executive relationship and strategic alignment' },
                { role: 'Executive Sponsor', responsibility: 'C-level engagement and partnership development' }
            ],
            'platform-ecosystem': [
                { role: 'Technical Account Manager', responsibility: 'API integration and platform optimization' },
                { role: 'Platform Architect', responsibility: 'Ecosystem design and implementation' }
            ],
            'usage-based-scaling': [
                { role: 'Customer Success Engineer', responsibility: 'Usage optimization and scaling strategy' },
                { role: 'Product Analytics Specialist', responsibility: 'Consumption pattern analysis' }
            ],
            'multi-product-cross-sell': [
                { role: 'Portfolio Account Manager', responsibility: 'Multi-product coordination and strategy' },
                { role: 'Sales Engineer', responsibility: 'Product demonstration and technical validation' }
            ],
            'geographic-departmental': [
                { role: 'Enterprise Account Executive', responsibility: 'Organization-wide expansion strategy' },
                { role: 'Implementation Manager', responsibility: 'Deployment scaling and coordination' }
            ],
            'feature-adoption-deepening': [
                { role: 'Customer Success Specialist', responsibility: 'Feature adoption and training programs' },
                { role: 'Professional Services', responsibility: 'Advanced consulting and optimization' }
            ],
            'renewal-plus': [
                { role: 'Renewal Specialist', responsibility: 'Contract renewal security and risk mitigation' },
                { role: 'Account Strategist', responsibility: 'Conservative expansion planning' }
            ]
        };
        
        return [
            ...baseStakeholders,
            ...(additionalStakeholders[playbookType] || [])
        ];
    }

    getRequiredResources(playbookType, account) {
        const resources = {
            'high-velocity-expansion': [
                'PLG analytics platform and usage tracking tools',
                'Self-serve onboarding and trial automation systems',
                'Rapid deployment technical resources',
                'Consumption-based billing and pricing infrastructure'
            ],
            'strategic-partnership': [
                'Executive briefing center access and C-suite materials',
                'Strategic account planning and roadmap tools',
                'Custom ROI modeling and business case development',
                'Partnership framework templates and agreements'
            ],
            'platform-ecosystem': [
                'API development and integration engineering resources',
                'Platform architecture and workflow automation tools',
                'Technical account management and consulting services',
                'Integration documentation and developer resources'
            ],
            'usage-based-scaling': [
                'Advanced product analytics and usage monitoring platforms',
                'Tier-based pricing optimization and billing systems',
                'Customer success engineering and optimization resources',
                'Feature adoption tracking and recommendation engines'
            ],
            'multi-product-cross-sell': [
                'Portfolio management and cross-sell coordination tools',
                'Multi-product demo environments and integration showcases',
                'Bundled pricing and value proposition development resources',
                'Cross-product success story and case study materials'
            ],
            'geographic-departmental': [
                'Enterprise deployment and scaling methodology',
                'Organizational mapping and stakeholder analysis tools',
                'Change management and training program resources',
                'Regional/departmental customization and rollout planning'
            ],
            'feature-adoption-deepening': [
                'Advanced training and certification program development',
                'Power-user workshops and consulting engagement resources',
                'Feature utilization analytics and optimization tools',
                'Custom workflow and automation development capabilities'
            ],
            'renewal-plus': [
                'Renewal risk assessment and monitoring tools',
                'Conservative expansion planning and ROI validation resources',
                'Relationship health tracking and engagement programs',
                'Success-based expansion and value demonstration materials'
            ]
        };
        
        return resources[playbookType] || resources['renewal-plus'];
    }

    defineSuccessMetrics(playbookType, account, opportunities) {
        const baseMetrics = {
            'Primary ARR Target': `$${this.formatCurrency(opportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0))}`,
            'Account Penetration': `Increase from ${account.penetrationRate}% to 80%+`,
            'Relationship Tier': 'Advance to next tier level'
        };
        
        const specificMetrics = {
            'high-velocity-expansion': {
                'Time to Value': 'Average 2 weeks trial-to-paid conversion',
                'Product Adoption Rate': '3-5 products adopted within 90 days',
                'Usage Growth': '200%+ consumption increase per quarter'
            },
            'strategic-partnership': {
                'Partnership Depth Score': 'Achieve strategic partner status',
                'Executive Engagement': 'C-level sponsor and steering committee',
                'Enterprise Footprint': '80%+ business unit coverage'
            },
            'platform-ecosystem': {
                'Integration Depth': 'Connect to 5+ enterprise systems',
                'API Utilization': '90%+ of available endpoints activated',
                'Workflow Automation': '15+ automated business processes'
            },
            'usage-based-scaling': {
                'Consumption Growth': '150%+ usage increase within 6 months',
                'Tier Progression': 'Advance 2+ pricing tiers per product',
                'Feature Adoption': '80%+ of premium features utilized'
            },
            'multi-product-cross-sell': {
                'Product Portfolio Size': '6+ products adopted',
                'Cross-Sell Win Rate': '75%+ for identified opportunities',
                'Bundle Optimization': '25%+ discount efficiency through bundling'
            },
            'geographic-departmental': {
                'Organizational Coverage': '70%+ departments/regions adopted',
                'User Base Expansion': '300%+ seat count increase',
                'Deployment Velocity': 'Average 4 weeks per business unit'
            },
            'feature-adoption-deepening': {
                'Power User Growth': '50%+ advanced feature utilization',
                'Training Completion': '90%+ certification program completion',
                'Custom Workflow Implementation': '10+ advanced automations deployed'
            },
            'renewal-plus': {
                'Renewal Security': '100% contract renewal confirmation',
                'Expansion Success': '15%+ ARR growth through selective expansion',
                'Risk Mitigation': 'Zero churn risk factors identified'
            }
        };
        
        return {
            ...baseMetrics,
            ...(specificMetrics[playbookType] || {})
        };
    }

    generateCompetitiveInsights(account) {
        // Simulate competitive analysis based on industry and company size
        const industry = account.industry;
        const companySize = account.companySize;
        
        const competitiveThreats = {
            'Technology': ['Microsoft', 'Salesforce', 'AWS'],
            'Financial Services': ['Oracle', 'IBM', 'SAP'],
            'Healthcare': ['Epic', 'Cerner', 'Allscripts'],
            'Manufacturing': ['SAP', 'Oracle', 'Siemens'],
            'Retail': ['Shopify', 'Adobe', 'SAP']
        };
        
        const threats = competitiveThreats[industry] || ['Microsoft', 'Salesforce', 'Oracle'];
        
        return {
            primaryCompetitors: threats.slice(0, 2),
            competitiveAdvantages: [
                'Superior integration capabilities',
                'Better pricing flexibility',
                'Faster implementation timeline',
                'Industry-specific expertise'
            ],
            competitiveRisks: [
                `${threats[0]} enterprise relationship`,
                'Budget allocation to existing vendors',
                'Change management resistance'
            ],
            counterStrategies: [
                'Emphasize ROI and quick time-to-value',
                'Leverage existing relationship strength',
                'Demonstrate differentiated capabilities',
                'Offer pilot programs to reduce risk'
            ]
        };
    }

    generateRiskMitigation(account, playbookType) {
        const commonRisks = [
            {
                risk: 'Budget constraints or delays',
                likelihood: 'Medium',
                impact: 'High',
                mitigation: 'Present phased implementation with clear ROI at each stage'
            },
            {
                risk: 'Internal competing priorities',
                likelihood: 'High',
                impact: 'Medium',
                mitigation: 'Align expansion with business critical initiatives and goals'
            }
        ];
        
        const playbookSpecificRisks = {
            'high-velocity-expansion': [
                {
                    risk: 'Over-rapid expansion without proper onboarding support',
                    likelihood: 'Medium',
                    impact: 'High',
                    mitigation: 'Implement automated onboarding and scale customer success resources'
                }
            ],
            'strategic-partnership': [
                {
                    risk: 'Executive sponsor changes or organizational restructuring',
                    likelihood: 'Medium',
                    impact: 'High',
                    mitigation: 'Establish relationships with multiple executive stakeholders'
                }
            ],
            'platform-ecosystem': [
                {
                    risk: 'Integration complexity leading to implementation delays',
                    likelihood: 'Medium',
                    impact: 'Medium',
                    mitigation: 'Conduct thorough technical assessment and phased integration approach'
                }
            ],
            'usage-based-scaling': [
                {
                    risk: 'Usage growth stagnation due to feature adoption barriers',
                    likelihood: 'Medium',
                    impact: 'Medium',
                    mitigation: 'Implement proactive training and feature adoption programs'
                }
            ],
            'multi-product-cross-sell': [
                {
                    risk: 'Product portfolio complexity overwhelming customer',
                    likelihood: 'Medium',
                    impact: 'Medium',
                    mitigation: 'Focus on product synergies and staged rollout approach'
                }
            ],
            'geographic-departmental': [
                {
                    risk: 'Organizational silos and inconsistent adoption',
                    likelihood: 'High',
                    impact: 'Medium',
                    mitigation: 'Establish cross-departmental governance and standardized processes'
                }
            ],
            'feature-adoption-deepening': [
                {
                    risk: 'Advanced features proving too complex for end users',
                    likelihood: 'Medium',
                    impact: 'Low',
                    mitigation: 'Implement comprehensive training and ongoing support programs'
                }
            ],
            'renewal-plus': [
                {
                    risk: 'Renewal uncertainty affecting expansion confidence',
                    likelihood: 'Low',
                    impact: 'High',
                    mitigation: 'Secure renewal commitment before pursuing expansion initiatives'
                }
            ]
        };
        
        return [
            ...commonRisks,
            ...(playbookSpecificRisks[playbookType] || [])
        ];
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Export functionality
    exportResults() {
        if (!this.analysisResults) {
            throw new Error('No analysis results to export. Please run analysis first.');
        }
        
        return {
            summary: this.analysisResults.stats,
            opportunities: this.analysisResults.opportunities,
            accountIntelligence: this.generateAccountIntelligence(),
            expansionPlaybooks: this.generateExpansionPlaybooks(),
            timestamp: this.analysisResults.timestamp
        };
    }
}

// Global instance
window.whitespaceEngine = new WhitespaceEngine();