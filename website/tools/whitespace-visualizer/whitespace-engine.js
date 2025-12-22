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
            { id: 'P001', name: 'Core Platform', listPrice: 50000, category: 'Platform', targetSegment: 'All' },
            { id: 'P002', name: 'Advanced Analytics', listPrice: 30000, category: 'Analytics', targetSegment: 'Enterprise' },
            { id: 'P003', name: 'Mobile App Suite', listPrice: 20000, category: 'Mobile', targetSegment: 'All' },
            { id: 'P004', name: 'API Integration Pack', listPrice: 25000, category: 'Integration', targetSegment: 'Enterprise' },
            { id: 'P005', name: 'Security Module', listPrice: 40000, category: 'Security', targetSegment: 'Enterprise' },
            { id: 'P006', name: 'Reporting Dashboard', listPrice: 15000, category: 'Reporting', targetSegment: 'All' }
        ];

        // Sample Accounts with enhanced whitespace calculations
        this.accounts = [
            {
                id: 'A001', name: 'TechCorp Solutions', currentARR: 125000,
                totalMarketPotential: 320000, whitespaceValue: 195000, penetrationRate: '39.1',
                industry: 'Technology', companySize: 'Enterprise', tier: 'Platinum',
                employeeCount: 1200, revenueSize: 150000000, growthStage: 'growth',
                accountManager: 'Sarah Johnson'
            },
            {
                id: 'A002', name: 'FinanceFirst LLC', currentARR: 85000,
                totalMarketPotential: 180000, whitespaceValue: 95000, penetrationRate: '47.2',
                industry: 'Financial Services', companySize: 'Mid-Market', tier: 'Gold',
                employeeCount: 300, revenueSize: 30000000, growthStage: 'growth',
                accountManager: 'Mike Chen'
            },
            {
                id: 'A003', name: 'HealthPlus Systems', currentARR: 200000,
                totalMarketPotential: 280000, whitespaceValue: 80000, penetrationRate: '71.4',
                industry: 'Healthcare', companySize: 'Enterprise', tier: 'Platinum',
                employeeCount: 800, revenueSize: 75000000, growthStage: 'mature',
                accountManager: 'Lisa Rodriguez'
            },
            {
                id: 'A004', name: 'RetailMax Inc', currentARR: 45000,
                totalMarketPotential: 85000, whitespaceValue: 40000, penetrationRate: '52.9',
                industry: 'Retail', companySize: 'SMB', tier: 'Standard',
                employeeCount: 75, revenueSize: 8000000, growthStage: 'growth',
                accountManager: 'David Park'
            },
            {
                id: 'A005', name: 'ManufacturingPro', currentARR: 150000,
                totalMarketPotential: 240000, whitespaceValue: 90000, penetrationRate: '62.5',
                industry: 'Manufacturing', companySize: 'Enterprise', tier: 'Gold',
                employeeCount: 1500, revenueSize: 200000000, growthStage: 'growth',
                accountManager: 'Jennifer Walsh'
            }
        ];

        // Sample Adoptions
        this.adoptions = [
            { accountId: 'A001', productId: 'P001', contractValue: 50000, startDate: new Date('2023-01-15'), status: 'active' },
            { accountId: 'A001', productId: 'P003', contractValue: 20000, startDate: new Date('2023-06-01'), status: 'active' },
            { accountId: 'A002', productId: 'P001', contractValue: 50000, startDate: new Date('2023-03-01'), status: 'active' },
            { accountId: 'A002', productId: 'P006', contractValue: 15000, startDate: new Date('2023-08-15'), status: 'active' },
            { accountId: 'A003', productId: 'P001', contractValue: 50000, startDate: new Date('2022-11-01'), status: 'active' },
            { accountId: 'A003', productId: 'P002', contractValue: 30000, startDate: new Date('2023-02-15'), status: 'active' },
            { accountId: 'A003', productId: 'P005', contractValue: 40000, startDate: new Date('2023-09-01'), status: 'active' },
            { accountId: 'A004', productId: 'P001', contractValue: 25000, startDate: new Date('2023-07-01'), status: 'active' },
            { accountId: 'A005', productId: 'P001', contractValue: 50000, startDate: new Date('2023-04-15'), status: 'active' },
            { accountId: 'A005', productId: 'P004', contractValue: 25000, startDate: new Date('2023-10-01'), status: 'active' }
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
        
        if (readinessScore >= 80 && penetration < 50) {
            return 'aggressive-expansion';
        } else if (readinessScore >= 60 && growthStage === 'growth') {
            return 'strategic-growth';
        } else if (companySize === 'Enterprise' && penetration > 70) {
            return 'platform-deepening';
        } else if (readinessScore < 40) {
            return 'relationship-building';
        } else if (account.tier === 'Standard') {
            return 'trust-establishment';
        } else {
            return 'tactical-expansion';
        }
    }

    getPlaybookTitle(type, account) {
        const titles = {
            'aggressive-expansion': `High-Velocity Expansion Strategy: ${account.name}`,
            'strategic-growth': `Strategic Growth Partnership: ${account.name}`,
            'platform-deepening': `Platform Integration & Deepening: ${account.name}`,
            'relationship-building': `Foundation Building & Development: ${account.name}`,
            'trust-establishment': `Trust & Value Demonstration: ${account.name}`,
            'tactical-expansion': `Tactical Expansion Roadmap: ${account.name}`
        };
        return titles[type];
    }

    getPlaybookDescription(type, account) {
        const descriptions = {
            'aggressive-expansion': `High-confidence, rapid expansion strategy for ${account.name}. This account shows exceptional readiness with significant whitespace remaining. Execute multiple opportunities simultaneously with dedicated resources.`,
            'strategic-growth': `Long-term partnership development with ${account.name}. Focus on becoming their strategic technology partner through careful relationship nurturing and value demonstration.`,
            'platform-deepening': `Maximize platform adoption and integration depth at ${account.name}. Transform existing relationship into comprehensive platform dependency with adjacent product adoption.`,
            'relationship-building': `Foundational relationship development with ${account.name}. Build trust, demonstrate value, and establish expansion prerequisites before pursuing major opportunities.`,
            'trust-establishment': `Prove value and establish credibility with ${account.name}. Focus on quick wins and relationship building to elevate partnership tier and unlock expansion potential.`,
            'tactical-expansion': `Balanced approach to expansion at ${account.name}. Pursue selective opportunities while building stronger foundation for future growth.`
        };
        return descriptions[type];
    }

    generatePlaybookPhases(type, account, opportunities) {
        const phases = {
            'aggressive-expansion': [
                {
                    phase: 1,
                    title: 'Opportunity Prioritization',
                    duration: '2 weeks',
                    activities: [
                        'Validate top 3 expansion opportunities',
                        'Confirm stakeholder alignment and budget',
                        'Prepare detailed ROI presentations'
                    ]
                },
                {
                    phase: 2,
                    title: 'Parallel Execution',
                    duration: '6-8 weeks',
                    activities: [
                        'Launch multiple opportunity discussions simultaneously',
                        'Leverage existing relationship strength',
                        'Fast-track technical and legal processes'
                    ]
                },
                {
                    phase: 3,
                    title: 'Momentum Capture',
                    duration: '4 weeks',
                    activities: [
                        'Close multiple deals in succession',
                        'Plan additional expansion opportunities',
                        'Strengthen strategic partnership positioning'
                    ]
                }
            ],
            'strategic-growth': [
                {
                    phase: 1,
                    title: 'Strategic Alignment',
                    duration: '4 weeks',
                    activities: [
                        'Conduct comprehensive business review',
                        'Map account growth strategy to our solutions',
                        'Identify executive sponsors and champions'
                    ]
                },
                {
                    phase: 2,
                    title: 'Value Co-Creation',
                    duration: '8-12 weeks',
                    activities: [
                        'Develop joint value proposition',
                        'Create custom success metrics and KPIs',
                        'Design phased expansion roadmap'
                    ]
                },
                {
                    phase: 3,
                    title: 'Partnership Execution',
                    duration: '6 months',
                    activities: [
                        'Execute planned expansion initiatives',
                        'Regular business reviews and optimization',
                        'Explore additional strategic opportunities'
                    ]
                }
            ],
            'platform-deepening': [
                {
                    phase: 1,
                    title: 'Usage Analysis',
                    duration: '3 weeks',
                    activities: [
                        'Analyze current platform utilization',
                        'Identify underutilized features and capabilities',
                        'Map additional use cases and departments'
                    ]
                },
                {
                    phase: 2,
                    title: 'Integration Expansion',
                    duration: '6-10 weeks',
                    activities: [
                        'Propose adjacent product integrations',
                        'Demonstrate platform ecosystem value',
                        'Pilot advanced features with power users'
                    ]
                },
                {
                    phase: 3,
                    title: 'Ecosystem Lock-in',
                    duration: '8 weeks',
                    activities: [
                        'Finalize comprehensive platform adoption',
                        'Establish center of excellence partnership',
                        'Plan long-term strategic initiatives'
                    ]
                }
            ],
            'relationship-building': [
                {
                    phase: 1,
                    title: 'Relationship Mapping',
                    duration: '4 weeks',
                    activities: [
                        'Map organizational structure and decision makers',
                        'Identify current pain points and priorities',
                        'Establish regular touchpoints and meetings'
                    ]
                },
                {
                    phase: 2,
                    title: 'Value Demonstration',
                    duration: '8-12 weeks',
                    activities: [
                        'Deliver quick wins and valuable insights',
                        'Provide industry expertise and best practices',
                        'Build trust through consistent value delivery'
                    ]
                },
                {
                    phase: 3,
                    title: 'Expansion Foundation',
                    duration: '6 weeks',
                    activities: [
                        'Present expansion opportunities with strong ROI',
                        'Leverage improved relationship for larger discussions',
                        'Establish preferred vendor status'
                    ]
                }
            ]
        };
        
        return phases[type] || phases['tactical-expansion'];
    }

    generatePlaybookTimeline(type, opportunities) {
        const timelines = {
            'aggressive-expansion': {
                'Month 1': 'Opportunity validation and stakeholder alignment',
                'Month 2': 'Multi-track negotiation and execution',
                'Month 3': 'Deal closure and momentum capture',
                'Month 4+': 'Strategic partnership expansion'
            },
            'strategic-growth': {
                'Month 1-2': 'Strategic assessment and alignment',
                'Month 3-4': 'Joint planning and roadmap development',
                'Month 5-8': 'Phased expansion execution',
                'Month 9-12': 'Partnership optimization and growth'
            },
            'platform-deepening': {
                'Month 1': 'Platform usage analysis and opportunity mapping',
                'Month 2-3': 'Integration pilots and value demonstration',
                'Month 4-5': 'Ecosystem expansion and adoption',
                'Month 6+': 'Strategic platform partnership'
            },
            'relationship-building': {
                'Month 1-2': 'Relationship mapping and trust building',
                'Month 3-5': 'Value delivery and credibility establishment',
                'Month 6-8': 'Expansion discussions and execution',
                'Month 9+': 'Strategic partnership development'
            }
        };
        
        return timelines[type] || timelines['strategic-growth'];
    }

    identifyKeyStakeholders(account, playbookType) {
        const baseStakeholders = [
            { role: 'Account Executive', responsibility: 'Overall relationship and deal execution' },
            { role: 'Customer Success Manager', responsibility: 'Value delivery and expansion identification' },
            { role: 'Solutions Engineer', responsibility: 'Technical validation and demonstration' }
        ];
        
        const additionalStakeholders = {
            'aggressive-expansion': [
                { role: 'Sales Director', responsibility: 'Strategic oversight and resource allocation' },
                { role: 'Legal Team', responsibility: 'Contract acceleration and terms negotiation' }
            ],
            'strategic-growth': [
                { role: 'VP of Sales', responsibility: 'Executive relationship and strategic alignment' },
                { role: 'Product Management', responsibility: 'Roadmap alignment and customization' }
            ],
            'platform-deepening': [
                { role: 'Technical Account Manager', responsibility: 'Deep integration and optimization' },
                { role: 'Professional Services', responsibility: 'Implementation and training' }
            ]
        };
        
        return [
            ...baseStakeholders,
            ...(additionalStakeholders[playbookType] || [])
        ];
    }

    getRequiredResources(playbookType, account) {
        const resources = {
            'aggressive-expansion': [
                'Dedicated account team with executive support',
                'Technical resources for rapid implementation',
                'Legal support for contract acceleration',
                'Marketing materials for multi-product positioning'
            ],
            'strategic-growth': [
                'Senior account executive with C-level access',
                'Custom ROI modeling and business case development',
                'Executive briefing center access',
                'Industry-specific use case documentation'
            ],
            'platform-deepening': [
                'Technical account management resources',
                'Professional services for integration',
                'Product training and certification programs',
                'Platform optimization consulting'
            ],
            'relationship-building': [
                'Consistent account team assignment',
                'Industry expertise and thought leadership content',
                'Executive relationship building programs',
                'Quick win identification and delivery resources'
            ]
        };
        
        return resources[playbookType] || resources['strategic-growth'];
    }

    defineSuccessMetrics(playbookType, account, opportunities) {
        const baseMetrics = {
            'Primary ARR Target': `$${this.formatCurrency(opportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0))}`,
            'Account Penetration': `Increase from ${account.penetrationRate}% to 80%+`,
            'Relationship Tier': 'Advance to next tier level'
        };
        
        const specificMetrics = {
            'aggressive-expansion': {
                'Time to Close': 'Average 45 days per opportunity',
                'Deal Velocity': '3+ opportunities in parallel',
                'Win Rate': '85%+ for identified opportunities'
            },
            'strategic-growth': {
                'Partnership Depth Score': 'Achieve strategic partner status',
                'Executive Engagement': 'C-level sponsor identified',
                'Long-term Pipeline': '$500K+ future opportunity pipeline'
            },
            'platform-deepening': {
                'Platform Utilization': 'Increase feature adoption by 60%',
                'Integration Depth': 'Connect to 3+ enterprise systems',
                'User Growth': 'Expand user base by 100%+'
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
            'aggressive-expansion': [
                {
                    risk: 'Resource overallocation leading to poor implementation',
                    likelihood: 'Medium',
                    impact: 'High',
                    mitigation: 'Ensure adequate support resources and staged rollouts'
                }
            ],
            'relationship-building': [
                {
                    risk: 'Extended timeline without visible progress',
                    likelihood: 'High',
                    impact: 'Medium',
                    mitigation: 'Define clear milestones and quick wins to demonstrate progress'
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