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

    // Revenue Projection Calculations
    calculateRevenueProjections(opportunities, currentARR) {
        // Categorize opportunities by probability and timeline
        const highProbability = opportunities.filter(opp => opp.score >= 70);
        const mediumProbability = opportunities.filter(opp => opp.score >= 40 && opp.score < 70);
        const lowProbability = opportunities.filter(opp => opp.score < 40);
        
        // Calculate projected values with probability weighting
        const q1Projection = this.calculateQuarterlyProjection(highProbability, 0.8, 0.6); // 80% of high prob, 60% close rate
        const q2Projection = this.calculateQuarterlyProjection(
            [...highProbability, ...mediumProbability.slice(0, 3)], 0.7, 0.5
        );
        const q3Projection = this.calculateQuarterlyProjection(
            [...highProbability, ...mediumProbability], 0.6, 0.4
        );
        const q4Projection = this.calculateQuarterlyProjection(opportunities, 0.5, 0.35);
        
        // Calculate cumulative projections
        const projections = {
            current: currentARR,
            q1: {
                newARR: q1Projection,
                totalARR: currentARR + q1Projection,
                growth: ((q1Projection / currentARR) * 100).toFixed(1)
            },
            q2: {
                newARR: q2Projection - q1Projection,
                totalARR: currentARR + q2Projection,
                growth: ((q2Projection / currentARR) * 100).toFixed(1)
            },
            q3: {
                newARR: q3Projection - q2Projection,
                totalARR: currentARR + q3Projection,
                growth: ((q3Projection / currentARR) * 100).toFixed(1)
            },
            q4: {
                newARR: q4Projection - q3Projection,
                totalARR: currentARR + q4Projection,
                growth: ((q4Projection / currentARR) * 100).toFixed(1)
            },
            yearEnd: {
                totalNewARR: q4Projection,
                totalARR: currentARR + q4Projection,
                totalGrowth: ((q4Projection / currentARR) * 100).toFixed(1)
            }
        };
        
        // Calculate confidence intervals
        projections.confidence = {
            conservative: Math.round(q4Projection * 0.7),
            expected: Math.round(q4Projection),
            optimistic: Math.round(q4Projection * 1.3)
        };
        
        // ROI Analysis
        projections.roi = this.calculateExpansionROI(q4Projection);
        
        return projections;
    }

    calculateQuarterlyProjection(opportunities, probability, closeRate) {
        return opportunities.reduce((sum, opp) => {
            return sum + (opp.opportunityValue * probability * closeRate);
        }, 0);
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

    // Export functionality
    exportResults() {
        if (!this.analysisResults) {
            throw new Error('No analysis results to export. Please run analysis first.');
        }
        
        return {
            summary: this.analysisResults.stats,
            opportunities: this.analysisResults.opportunities,
            timestamp: this.analysisResults.timestamp
        };
    }
}

// Global instance
window.whitespaceEngine = new WhitespaceEngine();