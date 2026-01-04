/**
 * Territory Planner Engine
 * Business logic for capacity planning, equity analysis, and territory optimization
 */

class TerritoryEngine {
    constructor() {
        this.accounts = [];
        this.reps = [];
        this.originalState = null;
        this.scenarioState = null;
        this.pendingAccounts = [];

        // Industry benchmarks by segment (research-based: Gainsight, SaaStr, ChurnZero)
        this.benchmarks = {
            'SMB': {
                accountsPerRep: { min: 100, max: 250, ideal: 150 },
                arrPerRep: { min: 1000000, max: 2000000, ideal: 1500000 },
                avgDealSize: { min: 5000, max: 20000, ideal: 10000 },
                touchCadence: 'monthly',
                hoursPerAccount: 2, // baseline hours/month per account
                healthyCapacity: 85,
                atRiskThreshold: 15,
                avgHealthScore: 70
            },
            'Mid-Market': {
                accountsPerRep: { min: 30, max: 50, ideal: 40 },
                arrPerRep: { min: 1500000, max: 2500000, ideal: 2000000 },
                avgDealSize: { min: 25000, max: 100000, ideal: 50000 },
                touchCadence: 'bi-weekly',
                hoursPerAccount: 4,
                healthyCapacity: 80,
                atRiskThreshold: 12,
                avgHealthScore: 75
            },
            'Enterprise': {
                accountsPerRep: { min: 8, max: 20, ideal: 14 },
                arrPerRep: { min: 2600000, max: 5000000, ideal: 3500000 },
                avgDealSize: { min: 100000, max: 500000, ideal: 250000 },
                touchCadence: 'weekly',
                hoursPerAccount: 10,
                healthyCapacity: 75,
                atRiskThreshold: 10,
                avgHealthScore: 80
            },
            'Partners': {
                accountsPerRep: { min: 10, max: 25, ideal: 15 },
                arrPerRep: { min: 1500000, max: 3500000, ideal: 2500000 },
                avgDealSize: { min: 75000, max: 300000, ideal: 150000 },
                touchCadence: 'bi-weekly',
                hoursPerAccount: 6,
                healthyCapacity: 80,
                atRiskThreshold: 10,
                avgHealthScore: 78
            }
        };

        // Time-based capacity configuration
        this.capacityConfig = {
            monthlyHours: 160,
            productivityRate: 0.80, // 80% productive time
            productiveHours: 128,   // 160 * 0.80
            // Complexity multipliers for time calculation
            complexityFactors: {
                highValueARR: { threshold: 200000, multiplier: 0.3 },
                atRiskHealth: { threshold: 60, multiplier: 0.5 },
                highChurnRisk: { threshold: 0.20, multiplier: 0.4 },
                onboarding: { multiplier: 0.3 },
                expansionReady: { threshold: 0.5, multiplier: 0.2 }, // whitespace > 50% of TAM
                enterpriseSegment: { multiplier: 0.3 },
                midMarketSegment: { multiplier: 0.1 }
            }
        };

        // Projection configuration defaults
        this.projectionConfig = {
            newLogoGrowth: 0.15,
            expansionRate: 0.10,
            churnRate: 0.05,
            hiringLeadTime: 45,
            rampTime: 90,
            rampCurve: [0.25, 0.50, 0.75, 1.0],
            targetCapacity: 80,
            maxCapacity: 100,
            projectionMonths: 12
        };

        // Growth scenario multipliers
        this.growthScenarios = {
            conservative: 0.10,
            expected: 0.20,
            aggressive: 0.35
        };
    }

    /**
     * Parse CSV data and load accounts
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV must contain a header row and at least one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const requiredFields = ['account_name', 'owner', 'current_arr', 'internal_tam', 'health_score', 'churn_risk'];

        const missingFields = requiredFields.filter(f => !headers.includes(f));
        if (missingFields.length > 0) {
            throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
        }

        const accounts = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) continue;

            const account = {};
            headers.forEach((header, index) => {
                account[header] = values[index].trim().replace(/['"]/g, '');
            });

            // Parse numeric fields
            account.current_arr = parseFloat(account.current_arr) || 0;
            account.internal_tam = parseFloat(account.internal_tam) || 0;
            account.health_score = parseFloat(account.health_score) || 50;
            account.churn_risk = parseFloat(account.churn_risk) || 0;

            // Set defaults for optional fields
            account.territory = account.territory || 'Unassigned';
            account.segment = account.segment || 'Mid-Market';
            account.products_owned = account.products_owned || '';
            account.lifecycle_stage = account.lifecycle_stage || 'Adopting';

            // Calculate derived fields
            account.raw_whitespace = Math.max(0, account.internal_tam - account.current_arr);
            account.health_factor = this.calculateHealthFactor(account.health_score);
            account.retention_probability = 1 - account.churn_risk;
            account.actionable_whitespace = account.raw_whitespace * account.health_factor * account.retention_probability;
            account.is_at_risk = account.churn_risk >= 0.20 || account.health_score < 60;
            account.complexity_score = this.calculateComplexityScore(account);

            accounts.push(account);
        }

        this.accounts = accounts;
        this.aggregateRepData();
        this.saveOriginalState();

        return accounts;
    }

    /**
     * Parse a single CSV line, handling quoted values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    /**
     * Calculate health factor (0-1) from health score
     */
    calculateHealthFactor(healthScore) {
        if (healthScore >= 80) return 1.0;
        if (healthScore >= 60) return 0.7 + (healthScore - 60) * 0.015;
        if (healthScore >= 40) return 0.4 + (healthScore - 40) * 0.015;
        return 0.2 + (healthScore) * 0.005;
    }

    /**
     * Calculate complexity score for an account (used in weighted capacity)
     */
    calculateComplexityScore(account) {
        const factors = this.capacityConfig.complexityFactors;
        let multiplier = 1.0;

        // High-value ARR premium
        if (account.current_arr > factors.highValueARR.threshold) {
            multiplier += factors.highValueARR.multiplier;
        }

        // At-risk health attention
        if (account.health_score < factors.atRiskHealth.threshold) {
            multiplier += factors.atRiskHealth.multiplier;
        }

        // High churn risk effort
        if (account.churn_risk > factors.highChurnRisk.threshold) {
            multiplier += factors.highChurnRisk.multiplier;
        }

        // Onboarding support
        if (account.lifecycle_stage === 'Onboarding') {
            multiplier += factors.onboarding.multiplier;
        }

        // Expansion work (whitespace > 50% of TAM)
        const whitespaceRatio = account.internal_tam > 0
            ? account.raw_whitespace / account.internal_tam
            : 0;
        if (whitespaceRatio > factors.expansionReady.threshold) {
            multiplier += factors.expansionReady.multiplier;
        }

        // Segment complexity
        if (account.segment === 'Enterprise') {
            multiplier += factors.enterpriseSegment.multiplier;
        } else if (account.segment === 'Mid-Market') {
            multiplier += factors.midMarketSegment.multiplier;
        }

        return multiplier;
    }

    /**
     * Calculate time-based hours required for an account
     */
    calculateAccountHours(account) {
        const benchmark = this.benchmarks[account.segment] || this.benchmarks['Mid-Market'];
        const baseHours = benchmark.hoursPerAccount;
        const complexityMultiplier = this.calculateComplexityScore(account);
        return baseHours * complexityMultiplier;
    }

    /**
     * Calculate time-based capacity for a rep
     */
    calculateTimeBasedCapacity(rep) {
        const totalHoursRequired = rep.accounts.reduce((sum, account) => {
            return sum + this.calculateAccountHours(account);
        }, 0);

        const productiveHours = this.capacityConfig.productiveHours;
        const capacityScore = (totalHoursRequired / productiveHours) * 100;

        // Calculate time allocation breakdown
        const atRiskHours = rep.accounts
            .filter(a => a.is_at_risk)
            .reduce((sum, a) => sum + this.calculateAccountHours(a), 0);

        const expansionHours = rep.accounts
            .filter(a => a.actionable_whitespace > 50000 && !a.is_at_risk)
            .reduce((sum, a) => sum + this.calculateAccountHours(a), 0);

        const renewalHours = rep.accounts
            .filter(a => a.lifecycle_stage === 'Renewing')
            .reduce((sum, a) => sum + this.calculateAccountHours(a), 0);

        const maintenanceHours = totalHoursRequired - atRiskHours - expansionHours - renewalHours;

        return {
            totalHoursRequired: Math.round(totalHoursRequired * 10) / 10,
            productiveHours,
            capacityScore: Math.round(capacityScore),
            capacityStatus: capacityScore > 100 ? 'critical' :
                           capacityScore > 85 ? 'warning' : 'healthy',
            headroomHours: Math.max(0, productiveHours - totalHoursRequired),
            allocation: {
                atRisk: Math.round((atRiskHours / totalHoursRequired) * 100) || 0,
                expansion: Math.round((expansionHours / totalHoursRequired) * 100) || 0,
                renewal: Math.round((renewalHours / totalHoursRequired) * 100) || 0,
                maintenance: Math.round((maintenanceHours / totalHoursRequired) * 100) || 0
            }
        };
    }

    /**
     * Aggregate data by rep
     */
    aggregateRepData() {
        const repMap = new Map();

        this.accounts.forEach(account => {
            const owner = account.owner;
            if (!repMap.has(owner)) {
                repMap.set(owner, {
                    name: owner,
                    accounts: [],
                    territories: new Set(),
                    segments: new Set()
                });
            }

            const rep = repMap.get(owner);
            rep.accounts.push(account);
            rep.territories.add(account.territory);
            rep.segments.add(account.segment);
        });

        this.reps = Array.from(repMap.values()).map(rep => {
            const accountCount = rep.accounts.length;
            const totalARR = rep.accounts.reduce((sum, a) => sum + a.current_arr, 0);
            const totalRawWhitespace = rep.accounts.reduce((sum, a) => sum + a.raw_whitespace, 0);
            const totalActionableWhitespace = rep.accounts.reduce((sum, a) => sum + a.actionable_whitespace, 0);
            const atRiskARR = rep.accounts.filter(a => a.is_at_risk).reduce((sum, a) => sum + a.current_arr, 0);
            const avgHealth = rep.accounts.reduce((sum, a) => sum + a.health_score, 0) / accountCount;
            const totalComplexity = rep.accounts.reduce((sum, a) => sum + a.complexity_score, 0);

            // Determine primary segment for benchmarking
            const segmentCounts = {};
            rep.accounts.forEach(a => {
                segmentCounts[a.segment] = (segmentCounts[a.segment] || 0) + 1;
            });
            const primarySegment = Object.entries(segmentCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mid-Market';

            return {
                name: rep.name,
                accountCount,
                totalARR,
                totalRawWhitespace,
                totalActionableWhitespace,
                atRiskARR,
                avgHealth: Math.round(avgHealth),
                totalComplexity,
                territories: Array.from(rep.territories),
                segments: Array.from(rep.segments),
                primarySegment,
                accounts: rep.accounts
            };
        });

        // Calculate capacity scores
        this.calculateCapacityScores();
    }

    /**
     * Calculate capacity scores for all reps (time-based model)
     */
    calculateCapacityScores() {
        this.reps.forEach(rep => {
            const benchmark = this.benchmarks[rep.primarySegment];

            // Use time-based capacity calculation
            const timeCapacity = this.calculateTimeBasedCapacity(rep);

            rep.capacityScore = timeCapacity.capacityScore;
            rep.capacityStatus = timeCapacity.capacityStatus;
            rep.hoursRequired = timeCapacity.totalHoursRequired;
            rep.headroomHours = timeCapacity.headroomHours;
            rep.timeAllocation = timeCapacity.allocation;

            // Calculate benchmark comparison
            const arrPerRepBenchmark = benchmark.arrPerRep.ideal;
            const accountsBenchmark = benchmark.accountsPerRep.ideal;

            rep.benchmarkComparison = {
                arrDiff: ((rep.totalARR / arrPerRepBenchmark) - 1) * 100,
                accountsDiff: ((rep.accountCount / accountsBenchmark) - 1) * 100,
                arrIdeal: arrPerRepBenchmark,
                accountsIdeal: accountsBenchmark
            };

            // Calculate how far over/under capacity (in accounts and ARR)
            const productiveHours = this.capacityConfig.productiveHours;
            const avgHoursPerAccount = rep.accountCount > 0
                ? rep.hoursRequired / rep.accountCount
                : benchmark.hoursPerAccount;
            const capacityInAccounts = Math.round(productiveHours / avgHoursPerAccount);

            rep.capacityHeadroom = {
                accounts: capacityInAccounts - rep.accountCount,
                hoursRemaining: timeCapacity.headroomHours,
                arrCapacity: Math.round((timeCapacity.headroomHours / rep.hoursRequired) * rep.totalARR) || 0
            };
        });
    }

    /**
     * Save original state for scenario comparison
     */
    saveOriginalState() {
        this.originalState = {
            reps: JSON.parse(JSON.stringify(this.reps)),
            accounts: JSON.parse(JSON.stringify(this.accounts)),
            summary: this.getSummaryMetrics()
        };
        this.scenarioState = JSON.parse(JSON.stringify(this.originalState));
    }

    /**
     * Reset to original state
     */
    resetToOriginal() {
        if (this.originalState) {
            this.reps = JSON.parse(JSON.stringify(this.originalState.reps));
            this.accounts = JSON.parse(JSON.stringify(this.originalState.accounts));
            this.scenarioState = JSON.parse(JSON.stringify(this.originalState));
        }
    }

    /**
     * Get summary metrics for the entire team
     */
    getSummaryMetrics() {
        const totalARR = this.reps.reduce((sum, r) => sum + r.totalARR, 0);
        const totalAccounts = this.reps.reduce((sum, r) => sum + r.accountCount, 0);
        const totalActionableWhitespace = this.reps.reduce((sum, r) => sum + r.totalActionableWhitespace, 0);
        const totalAtRiskARR = this.reps.reduce((sum, r) => sum + r.atRiskARR, 0);
        const avgCapacity = this.reps.reduce((sum, r) => sum + r.capacityScore, 0) / this.reps.length;
        const avgHealth = this.reps.reduce((sum, r) => sum + r.avgHealth, 0) / this.reps.length;

        return {
            teamSize: this.reps.length,
            totalARR,
            totalAccounts,
            totalActionableWhitespace,
            totalAtRiskARR,
            atRiskPercentage: (totalAtRiskARR / totalARR) * 100,
            avgCapacity: Math.round(avgCapacity),
            avgHealth: Math.round(avgHealth),
            avgARRPerRep: totalARR / this.reps.length,
            avgAccountsPerRep: totalAccounts / this.reps.length
        };
    }

    /**
     * Calculate Gini coefficient (0 = perfect equality, 1 = perfect inequality)
     */
    calculateGiniCoefficient(values) {
        if (values.length < 2) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;
        const totalSum = sorted.reduce((a, b) => a + b, 0);
        if (totalSum === 0) return 0;

        let numerator = 0;
        sorted.forEach((val, i) => {
            numerator += (2 * (i + 1) - n - 1) * val;
        });

        return numerator / (n * totalSum);
    }

    /**
     * Calculate equity scores for different dimensions with dollar disparities
     */
    calculateEquityScores() {
        if (this.reps.length < 2) {
            return {
                arr: { score: 100, gini: 0, max: null, min: null, gap: 0, ratio: 1 },
                whitespace: { score: 100, gini: 0, max: null, min: null, gap: 0, ratio: 1 },
                capacity: { score: 100, gini: 0, max: null, min: null, gap: 0, ratio: 1 },
                risk: { score: 100, gini: 0, max: null, min: null, gap: 0, ratio: 1 }
            };
        }

        const calculateEquityDetail = (values, reps, metric) => {
            // Calculate basic stats
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const cv = mean !== 0 ? (stdDev / mean) * 100 : 0;

            // Calculate Gini coefficient
            const gini = this.calculateGiniCoefficient(values);

            // Find max and min
            let maxIdx = 0, minIdx = 0;
            values.forEach((val, i) => {
                if (val > values[maxIdx]) maxIdx = i;
                if (val < values[minIdx]) minIdx = i;
            });

            const maxVal = values[maxIdx];
            const minVal = values[minIdx];
            const gap = maxVal - minVal;
            const ratio = minVal !== 0 ? maxVal / minVal : maxVal > 0 ? Infinity : 1;

            return {
                score: Math.max(0, Math.min(100, 100 - cv)),
                gini: Math.round(gini * 100) / 100,
                max: { rep: reps[maxIdx].name, value: maxVal },
                min: { rep: reps[minIdx].name, value: minVal },
                gap,
                ratio: Math.round(ratio * 100) / 100,
                mean: Math.round(mean),
                stdDev: Math.round(stdDev)
            };
        };

        return {
            arr: calculateEquityDetail(this.reps.map(r => r.totalARR), this.reps, 'arr'),
            whitespace: calculateEquityDetail(this.reps.map(r => r.totalActionableWhitespace), this.reps, 'whitespace'),
            capacity: calculateEquityDetail(this.reps.map(r => r.capacityScore), this.reps, 'capacity'),
            risk: calculateEquityDetail(this.reps.map(r => r.atRiskARR), this.reps, 'risk')
        };
    }

    /**
     * Generate specific rebalancing recommendations
     */
    generateRebalancingRecommendations() {
        const recommendations = [];
        const equity = this.calculateEquityScores();

        // Find overloaded and underutilized reps
        const overloaded = this.reps.filter(r => r.capacityScore > 100)
            .sort((a, b) => b.capacityScore - a.capacityScore);
        const underutilized = this.reps.filter(r => r.capacityScore < 70)
            .sort((a, b) => a.capacityScore - b.capacityScore);

        // Generate account move recommendations for overloaded reps
        overloaded.forEach(rep => {
            // Find accounts that could be moved (not at-risk, mid-sized ARR)
            const moveableAccounts = rep.accounts
                .filter(a => !a.is_at_risk && a.current_arr < 200000)
                .sort((a, b) => a.current_arr - b.current_arr);

            if (moveableAccounts.length > 0 && underutilized.length > 0) {
                // Calculate how many hours need to be offloaded
                const excessHours = rep.hoursRequired - this.capacityConfig.productiveHours;
                let hoursToMove = excessHours;
                let accountsToMove = [];

                for (const account of moveableAccounts) {
                    if (hoursToMove <= 0) break;
                    const accountHours = this.calculateAccountHours(account);
                    accountsToMove.push(account);
                    hoursToMove -= accountHours;
                }

                // Find best target rep
                const bestTarget = underutilized[0];
                const totalMoveARR = accountsToMove.reduce((sum, a) => sum + a.current_arr, 0);

                if (accountsToMove.length > 0) {
                    recommendations.push({
                        priority: 'high',
                        type: 'rebalance',
                        fromRep: rep.name,
                        toRep: bestTarget.name,
                        accounts: accountsToMove.map(a => a.account_name),
                        accountCount: accountsToMove.length,
                        arrImpact: totalMoveARR,
                        action: `Move ${accountsToMove.length} account${accountsToMove.length > 1 ? 's' : ''} (${this.formatCurrency(totalMoveARR)} ARR) from ${rep.name} to ${bestTarget.name}`,
                        impact: `${rep.name} capacity: ${rep.capacityScore}% → ~${Math.round(rep.capacityScore - (excessHours / this.capacityConfig.productiveHours * 100))}%, ${bestTarget.name} capacity: ${bestTarget.capacityScore}% → ~${Math.round(bestTarget.capacityScore + ((excessHours - hoursToMove) / this.capacityConfig.productiveHours * 100))}%`,
                        reason: `${rep.name} is ${rep.capacityScore - 100} points over capacity`
                    });
                }
            }
        });

        // ARR equity recommendations
        if (equity.arr.ratio > 1.5 && equity.arr.gap > 500000) {
            const targetMove = Math.round(equity.arr.gap / 2);
            recommendations.push({
                priority: 'medium',
                type: 'arr_equity',
                fromRep: equity.arr.max.rep,
                toRep: equity.arr.min.rep,
                action: `Consider moving ~${this.formatCurrency(targetMove)} ARR from ${equity.arr.max.rep} to ${equity.arr.min.rep}`,
                impact: `Would improve ARR equity from ${Math.round(equity.arr.score)}% to ~${Math.round(equity.arr.score + 15)}%`,
                reason: `${equity.arr.max.rep} has ${equity.arr.ratio.toFixed(1)}x more ARR than ${equity.arr.min.rep} (${this.formatCurrency(equity.arr.gap)} gap)`
            });
        }

        // Whitespace concentration warning
        if (equity.whitespace.ratio > 2) {
            recommendations.push({
                priority: 'medium',
                type: 'whitespace_equity',
                action: `Whitespace is concentrated with ${equity.whitespace.max.rep} (${this.formatCurrency(equity.whitespace.max.value)})`,
                impact: `Expansion opportunities are not evenly distributed`,
                reason: `${equity.whitespace.max.rep} has ${equity.whitespace.ratio.toFixed(1)}x more whitespace than ${equity.whitespace.min.rep}`
            });
        }

        // Risk concentration warning
        const highRiskReps = this.reps.filter(r => (r.atRiskARR / r.totalARR) > 0.25);
        highRiskReps.forEach(rep => {
            const riskPct = Math.round((rep.atRiskARR / rep.totalARR) * 100);
            recommendations.push({
                priority: 'high',
                type: 'risk_concentration',
                rep: rep.name,
                action: `${rep.name} should focus on at-risk accounts (${this.formatCurrency(rep.atRiskARR)} at risk)`,
                impact: `Reduce churn risk of ${riskPct}% of their book`,
                reason: `${rep.name} has ${riskPct}% of their ARR at risk (target: <15%)`
            });
        });

        return recommendations;
    }

    /**
     * Generate equity insights with dollar-value details
     */
    getEquityInsights() {
        const insights = [];
        const summary = this.getSummaryMetrics();
        const equity = this.calculateEquityScores();

        // ARR imbalance with dollar amounts
        if (equity.arr.ratio > 1.5 && equity.arr.gap > 300000) {
            insights.push({
                type: 'warning',
                metric: 'arr',
                text: `${equity.arr.max.rep} manages ${equity.arr.ratio.toFixed(1)}x more ARR than ${equity.arr.min.rep}`,
                detail: `Gap: ${this.formatCurrency(equity.arr.gap)} | ${equity.arr.max.rep}: ${this.formatCurrency(equity.arr.max.value)} vs ${equity.arr.min.rep}: ${this.formatCurrency(equity.arr.min.value)}`
            });
        }

        // Whitespace concentration with dollar amounts
        if (equity.whitespace.ratio > 2 && equity.whitespace.gap > 200000) {
            const wsShare = summary.totalActionableWhitespace > 0
                ? Math.round((equity.whitespace.max.value / summary.totalActionableWhitespace) * 100)
                : 0;
            insights.push({
                type: 'info',
                metric: 'whitespace',
                text: `${wsShare}% of whitespace concentrated with ${equity.whitespace.max.rep}`,
                detail: `${equity.whitespace.max.rep}: ${this.formatCurrency(equity.whitespace.max.value)} | Team avg: ${this.formatCurrency(equity.whitespace.mean)}`
            });
        }

        // Capacity imbalance
        const overloadedReps = this.reps.filter(r => r.capacityScore > 100);
        const underutilizedReps = this.reps.filter(r => r.capacityScore < 60);

        if (overloadedReps.length > 0) {
            const totalOverHours = overloadedReps.reduce((sum, r) =>
                sum + (r.hoursRequired - this.capacityConfig.productiveHours), 0);
            insights.push({
                type: 'warning',
                metric: 'capacity',
                text: `${overloadedReps.length} team member(s) over capacity: ${overloadedReps.map(r => `${r.name} (${r.capacityScore}%)`).join(', ')}`,
                detail: `Total excess: ${Math.round(totalOverHours)} hours/month that need redistribution`
            });
        }

        if (underutilizedReps.length > 0) {
            const totalHeadroom = underutilizedReps.reduce((sum, r) => sum + r.headroomHours, 0);
            insights.push({
                type: 'info',
                metric: 'capacity',
                text: `${underutilizedReps.length} team member(s) have significant capacity: ${underutilizedReps.map(r => `${r.name} (${r.capacityScore}%)`).join(', ')}`,
                detail: `Available: ${Math.round(totalHeadroom)} hours/month for new accounts`
            });
        }

        // Risk concentration
        const highRiskReps = this.reps.filter(r => r.totalARR > 0 && (r.atRiskARR / r.totalARR) > 0.20);
        if (highRiskReps.length > 0) {
            const totalRiskARR = highRiskReps.reduce((sum, r) => sum + r.atRiskARR, 0);
            insights.push({
                type: 'warning',
                metric: 'risk',
                text: `${highRiskReps.length} team member(s) have >20% at-risk ARR`,
                detail: `Total at-risk: ${this.formatCurrency(totalRiskARR)} across ${highRiskReps.map(r => r.name).join(', ')}`
            });
        }

        // Success indicators
        const healthyReps = this.reps.filter(r => r.capacityScore >= 60 && r.capacityScore <= 85);
        if (healthyReps.length === this.reps.length) {
            insights.push({
                type: 'success',
                metric: 'capacity',
                text: 'All team members are within healthy capacity range (60-85%)',
                detail: `Team avg: ${summary.avgCapacity}% capacity`
            });
        }

        // Overall equity health
        const avgEquityScore = (equity.arr.score + equity.whitespace.score + equity.capacity.score) / 3;
        if (avgEquityScore >= 80) {
            insights.push({
                type: 'success',
                metric: 'equity',
                text: 'Overall team equity is healthy',
                detail: `ARR: ${Math.round(equity.arr.score)}% | Whitespace: ${Math.round(equity.whitespace.score)}% | Capacity: ${Math.round(equity.capacity.score)}%`
            });
        }

        return insights;
    }

    /**
     * Calculate book of business health for each rep
     */
    calculateBookHealth(rep) {
        if (!rep || rep.accountCount === 0) {
            return { score: 0, issues: ['No accounts assigned'] };
        }

        const issues = [];
        const warnings = [];
        let score = 100;

        // Segment mix analysis
        const segmentCounts = { SMB: 0, 'Mid-Market': 0, Enterprise: 0 };
        const segmentARR = { SMB: 0, 'Mid-Market': 0, Enterprise: 0 };
        rep.accounts.forEach(a => {
            segmentCounts[a.segment] = (segmentCounts[a.segment] || 0) + 1;
            segmentARR[a.segment] = (segmentARR[a.segment] || 0) + a.current_arr;
        });

        // Check for segment concentration (>70% ARR in one segment)
        const maxSegmentARR = Math.max(...Object.values(segmentARR));
        const maxSegmentPct = rep.totalARR > 0 ? (maxSegmentARR / rep.totalARR) * 100 : 0;
        if (maxSegmentPct > 70) {
            warnings.push(`${Math.round(maxSegmentPct)}% ARR concentrated in one segment`);
            score -= 10;
        }

        // Lifecycle mix analysis
        const lifecycleCounts = { Onboarding: 0, Adopting: 0, Renewing: 0, Mature: 0 };
        rep.accounts.forEach(a => {
            lifecycleCounts[a.lifecycle_stage] = (lifecycleCounts[a.lifecycle_stage] || 0) + 1;
        });

        // Check for lifecycle bottleneck (>40% in one stage)
        const maxLifecyclePct = rep.accountCount > 0
            ? (Math.max(...Object.values(lifecycleCounts)) / rep.accountCount) * 100
            : 0;
        if (maxLifecyclePct > 40) {
            warnings.push(`${Math.round(maxLifecyclePct)}% accounts in single lifecycle stage`);
            score -= 5;
        }

        // Risk concentration
        const riskPct = rep.totalARR > 0 ? (rep.atRiskARR / rep.totalARR) * 100 : 0;
        if (riskPct > 25) {
            issues.push(`High risk concentration: ${Math.round(riskPct)}% ARR at risk`);
            score -= 20;
        } else if (riskPct > 15) {
            warnings.push(`${Math.round(riskPct)}% ARR at risk`);
            score -= 10;
        }

        // Capacity assessment
        if (rep.capacityScore > 100) {
            issues.push(`Over capacity: ${rep.capacityScore}%`);
            score -= 15;
        } else if (rep.capacityScore > 90) {
            warnings.push(`Near capacity limit: ${rep.capacityScore}%`);
            score -= 5;
        }

        // Expansion potential
        const penetrationRate = rep.accounts.reduce((sum, a) => sum + a.internal_tam, 0);
        const currentPenetration = penetrationRate > 0 ? (rep.totalARR / penetrationRate) * 100 : 0;
        const expansionReady = rep.accounts.filter(a =>
            a.health_score >= 80 && a.actionable_whitespace > 50000
        ).length;

        if (expansionReady === 0 && rep.accountCount > 5) {
            warnings.push('No expansion-ready accounts (healthy + whitespace)');
            score -= 5;
        }

        // Health score distribution
        const lowHealthAccounts = rep.accounts.filter(a => a.health_score < 60).length;
        const lowHealthPct = rep.accountCount > 0 ? (lowHealthAccounts / rep.accountCount) * 100 : 0;
        if (lowHealthPct > 30) {
            issues.push(`${Math.round(lowHealthPct)}% accounts need health intervention`);
            score -= 15;
        }

        return {
            score: Math.max(0, score),
            segmentMix: segmentCounts,
            segmentARR,
            lifecycleMix: lifecycleCounts,
            riskPct: Math.round(riskPct),
            penetrationRate: Math.round(currentPenetration),
            expansionReady,
            lowHealthAccounts,
            issues,
            warnings
        };
    }

    /**
     * Get team-wide book health summary
     */
    getTeamBookHealth() {
        const repHealthScores = this.reps.map(rep => ({
            rep: rep.name,
            ...this.calculateBookHealth(rep)
        }));

        const avgScore = repHealthScores.reduce((sum, r) => sum + r.score, 0) / this.reps.length;
        const criticalReps = repHealthScores.filter(r => r.score < 60);
        const healthyReps = repHealthScores.filter(r => r.score >= 80);

        return {
            avgScore: Math.round(avgScore),
            repScores: repHealthScores,
            criticalReps,
            healthyReps,
            overallStatus: avgScore >= 80 ? 'healthy' : avgScore >= 60 ? 'warning' : 'critical'
        };
    }

    /**
     * Update projection configuration
     */
    updateProjectionConfig(newConfig) {
        this.projectionConfig = { ...this.projectionConfig, ...newConfig };
    }

    /**
     * Calculate projections for hiring needs with configurable levers
     */
    calculateProjections(config = {}) {
        const projConfig = { ...this.projectionConfig, ...config };
        const summary = this.getSummaryMetrics();

        // Current state
        const currentTotalHours = this.reps.reduce((sum, r) => sum + (r.hoursRequired || 0), 0);
        const currentCapacity = (currentTotalHours / (this.reps.length * this.capacityConfig.productiveHours)) * 100;
        const currentHeadroomHours = (this.reps.length * this.capacityConfig.productiveHours) - currentTotalHours;

        // Generate 12-month projections
        const monthlyProjections = this.generateMonthlyProjection(projConfig);

        // Find when capacity threshold is hit
        const thresholdMonth = monthlyProjections.find(m => m.capacity > projConfig.targetCapacity);

        // Calculate total hiring need
        const finalMonth = monthlyProjections[monthlyProjections.length - 1];
        const hiringNeed = Math.max(0, Math.ceil(finalMonth.requiredHeadcount - summary.teamSize));

        // Calculate capacity runway (months until threshold)
        const capacityRunway = thresholdMonth
            ? monthlyProjections.indexOf(thresholdMonth)
            : projConfig.projectionMonths;

        return {
            current: {
                teamSize: summary.teamSize,
                totalARR: summary.totalARR,
                avgCapacity: Math.round(currentCapacity),
                headroomHours: Math.round(currentHeadroomHours),
                headroomARR: this.estimateARRFromHours(currentHeadroomHours)
            },
            projected: {
                totalARR: finalMonth.arr,
                projectedCapacity: Math.round(finalMonth.capacity),
                requiredHeadcount: finalMonth.requiredHeadcount.toFixed(1),
                hiringNeed,
                expectedChurn: monthlyProjections.reduce((sum, m) => sum + m.churn, 0),
                expectedExpansion: monthlyProjections.reduce((sum, m) => sum + m.expansion, 0),
                expectedNewLogos: monthlyProjections.reduce((sum, m) => sum + m.newLogos, 0)
            },
            capacityRunway,
            thresholdMonth: thresholdMonth ? thresholdMonth.month : null,
            monthlyProjections,
            config: projConfig,
            timeline: this.generateHiringTimeline(projConfig, hiringNeed, capacityRunway)
        };
    }

    /**
     * Estimate ARR capacity from available hours
     */
    estimateARRFromHours(hours) {
        if (this.reps.length === 0 || hours <= 0) return 0;
        const avgARRPerHour = this.reps.reduce((sum, r) =>
            sum + (r.hoursRequired > 0 ? r.totalARR / r.hoursRequired : 0), 0) / this.reps.length;
        return Math.round(hours * avgARRPerHour);
    }

    /**
     * Generate month-by-month projection data
     */
    generateMonthlyProjection(config) {
        const summary = this.getSummaryMetrics();
        const projections = [];

        let currentARR = summary.totalARR;
        let currentTeamSize = summary.teamSize;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const startMonth = new Date().getMonth();

        // Calculate monthly rates
        const monthlyNewLogoRate = config.newLogoGrowth / 12;
        const monthlyExpansionRate = config.expansionRate / 12;
        const monthlyChurnRate = config.churnRate / 12;

        // Track new hires and their ramp
        let newHires = [];

        for (let i = 0; i < config.projectionMonths; i++) {
            const monthIdx = (startMonth + i) % 12;
            const monthName = monthNames[monthIdx];

            // Calculate ARR changes
            const newLogos = currentARR * monthlyNewLogoRate;
            const expansion = currentARR * monthlyExpansionRate;
            const churn = currentARR * monthlyChurnRate;
            const netChange = newLogos + expansion - churn;

            currentARR += netChange;

            // Estimate hours required for new ARR
            const avgARRPerHour = summary.totalARR / (summary.teamSize * this.capacityConfig.productiveHours) || 1000;
            const totalHoursRequired = currentARR / avgARRPerHour;

            // Calculate effective team capacity (accounting for ramping hires)
            let effectiveCapacity = currentTeamSize * this.capacityConfig.productiveHours;

            // Add ramped capacity from previous hires
            newHires.forEach((hire, idx) => {
                const monthsSinceHire = i - hire.month;
                if (monthsSinceHire >= 0 && monthsSinceHire < config.rampCurve.length) {
                    effectiveCapacity += this.capacityConfig.productiveHours * config.rampCurve[monthsSinceHire];
                } else if (monthsSinceHire >= config.rampCurve.length) {
                    effectiveCapacity += this.capacityConfig.productiveHours;
                }
            });

            const capacity = (totalHoursRequired / effectiveCapacity) * 100;
            const requiredHeadcount = totalHoursRequired / this.capacityConfig.productiveHours;

            // Determine if hiring is triggered
            let hireTriggered = false;
            if (capacity > config.targetCapacity && i > 0) {
                // Hire to bring capacity back to target
                const newHireNeeded = Math.ceil((capacity - config.targetCapacity) / 100 * currentTeamSize);
                if (newHireNeeded > newHires.filter(h => h.month === i).length) {
                    newHires.push({ month: i, rampStart: i + Math.ceil(config.hiringLeadTime / 30) });
                    hireTriggered = true;
                }
            }

            // Calculate headroom
            const headroomHours = Math.max(0, effectiveCapacity - totalHoursRequired);
            const headroomARR = headroomHours * avgARRPerHour;

            projections.push({
                month: monthName,
                monthIndex: i,
                arr: Math.round(currentARR),
                newLogos: Math.round(newLogos),
                expansion: Math.round(expansion),
                churn: Math.round(churn),
                capacity: Math.round(capacity),
                requiredHeadcount,
                effectiveTeamSize: currentTeamSize + newHires.filter(h => h.rampStart <= i).length,
                headroomHours: Math.round(headroomHours),
                headroomARR: Math.round(headroomARR),
                hireTriggered,
                isOverCapacity: capacity > config.targetCapacity,
                isCritical: capacity > config.maxCapacity
            });
        }

        return projections;
    }

    /**
     * Generate hiring timeline with new config system
     */
    generateHiringTimeline(config, hiringNeed, capacityRunway) {
        const timeline = [];
        const summary = this.getSummaryMetrics();

        if (hiringNeed <= 0) {
            timeline.push({
                date: 'Now',
                type: 'status',
                action: 'No immediate hiring needed',
                reason: `Team capacity at ${summary.avgCapacity}%, with ${capacityRunway}+ months runway`,
                urgency: 'low'
            });
            return timeline;
        }

        // Add recruiting start milestone
        const recruitStartMonth = Math.max(0, capacityRunway - Math.ceil(config.hiringLeadTime / 30));
        if (recruitStartMonth <= 1) {
            timeline.push({
                date: 'Now',
                type: 'urgent',
                action: 'Start recruiting immediately',
                reason: `Capacity threshold will be reached in ${capacityRunway} month(s)`,
                urgency: 'high'
            });
        } else {
            timeline.push({
                date: `Month ${recruitStartMonth}`,
                type: 'action',
                action: 'Begin recruiting process',
                reason: `Allow ${config.hiringLeadTime} days for hiring process`,
                urgency: 'medium'
            });
        }

        // Add hiring milestones
        for (let i = 0; i < Math.min(hiringNeed, 5); i++) {
            const hireMonth = capacityRunway + i;
            timeline.push({
                date: `Month ${hireMonth}`,
                type: 'hire',
                action: `Hire CSM #${summary.teamSize + i + 1}`,
                reason: i === 0 ? 'Capacity threshold reached' : 'Continued growth absorption',
                urgency: i === 0 ? 'high' : 'medium'
            });

            // Add ramp milestone
            const rampCompleteMonth = hireMonth + Math.ceil(config.rampTime / 30);
            timeline.push({
                date: `Month ${rampCompleteMonth}`,
                type: 'milestone',
                action: `CSM #${summary.teamSize + i + 1} fully ramped`,
                reason: `${config.rampTime}-day ramp period complete`,
                urgency: 'low'
            });
        }

        if (hiringNeed > 5) {
            timeline.push({
                date: `Month ${capacityRunway + 5}+`,
                type: 'info',
                action: `${hiringNeed - 5} additional hires needed`,
                reason: 'Based on projected growth trajectory',
                urgency: 'low'
            });
        }

        return timeline;
    }

    /**
     * Generate smart recommendations based on current state
     */
    generateSmartRecommendations() {
        const recommendations = [];
        const summary = this.getSummaryMetrics();
        const projections = this.calculateProjections();
        const equity = this.calculateEquityScores();
        const rebalancing = this.generateRebalancingRecommendations();

        // Add rebalancing recommendations
        recommendations.push(...rebalancing);

        // Hiring recommendations based on projections
        if (projections.capacityRunway <= 2) {
            recommendations.push({
                priority: 'high',
                type: 'hire',
                action: `Start recruiting now - capacity threshold in ${projections.capacityRunway} month(s)`,
                impact: `Prevents capacity crisis and burnout`,
                reason: `Current capacity ${summary.avgCapacity}%, runway only ${projections.capacityRunway} months`
            });
        } else if (projections.capacityRunway <= 4) {
            recommendations.push({
                priority: 'medium',
                type: 'hire',
                action: `Plan hiring for Month ${projections.capacityRunway - 2}`,
                impact: `${projections.projected.hiringNeed} hire(s) needed over 12 months`,
                reason: `Growth projection shows ${projections.capacityRunway} months until capacity threshold`
            });
        }

        // Expansion opportunity recommendations
        const expansionReady = this.accounts.filter(a =>
            a.health_score >= 80 && a.actionable_whitespace > 50000
        );
        if (expansionReady.length > 0) {
            const totalExpansion = expansionReady.reduce((sum, a) => sum + a.actionable_whitespace, 0);
            recommendations.push({
                priority: 'medium',
                type: 'expansion',
                action: `${expansionReady.length} accounts ready for expansion (${this.formatCurrency(totalExpansion)} potential)`,
                impact: `Could accelerate NRR by ${Math.round((totalExpansion / summary.totalARR) * 100)}%`,
                reason: 'Healthy accounts with significant whitespace',
                accounts: expansionReady.slice(0, 5).map(a => a.account_name)
            });
        }

        // At-risk focus recommendations
        const criticalRisk = this.accounts.filter(a =>
            a.churn_risk > 0.3 || (a.health_score < 50 && a.current_arr > 50000)
        );
        if (criticalRisk.length > 0) {
            const riskARR = criticalRisk.reduce((sum, a) => sum + a.current_arr, 0);
            recommendations.push({
                priority: 'high',
                type: 'risk',
                action: `${criticalRisk.length} critical accounts need immediate attention (${this.formatCurrency(riskARR)} ARR)`,
                impact: `Prevent potential ${this.formatCurrency(riskARR * 0.4)} in churn`,
                reason: 'High churn risk or very low health score',
                accounts: criticalRisk.slice(0, 5).map(a => a.account_name)
            });
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations;
    }

    /**
     * Get recommended assignments for new accounts
     */
    getAccountRecommendations(newAccounts) {
        const recommendations = [];

        newAccounts.forEach(account => {
            // Score each rep for this account
            const scoredReps = this.reps.map(rep => {
                let score = 0;
                const reasons = [];

                // Capacity availability (higher is better)
                const capacityRoom = 100 - rep.capacityScore;
                score += capacityRoom * 0.4;
                if (capacityRoom > 20) {
                    reasons.push('Has capacity headroom');
                }

                // Territory match
                if (rep.territories.includes(account.territory)) {
                    score += 20;
                    reasons.push('Territory match');
                }

                // Segment match
                if (rep.segments.has(account.segment)) {
                    score += 15;
                    reasons.push('Segment expertise');
                }

                // Whitespace balance (favor reps with less whitespace)
                const avgWS = this.reps.reduce((sum, r) => sum + r.totalActionableWhitespace, 0) / this.reps.length;
                if (rep.totalActionableWhitespace < avgWS) {
                    score += 10;
                    reasons.push('Balances whitespace');
                }

                return {
                    rep,
                    score,
                    reasons
                };
            });

            // Sort by score and get best match
            scoredReps.sort((a, b) => b.score - a.score);
            const bestMatch = scoredReps[0];

            recommendations.push({
                account,
                recommendedRep: bestMatch.rep.name,
                score: bestMatch.score,
                reasons: bestMatch.reasons,
                alternatives: scoredReps.slice(1, 3).map(s => ({
                    name: s.rep.name,
                    score: s.score
                }))
            });
        });

        return recommendations;
    }

    /**
     * Simulate adding a new rep
     */
    simulateAddRep(repName) {
        const newRep = {
            name: repName,
            accountCount: 0,
            totalARR: 0,
            totalRawWhitespace: 0,
            totalActionableWhitespace: 0,
            atRiskARR: 0,
            avgHealth: 100,
            totalComplexity: 0,
            territories: [],
            segments: [],
            primarySegment: 'Mid-Market',
            accounts: [],
            capacityScore: 0,
            capacityStatus: 'healthy'
        };

        this.reps.push(newRep);
        this.calculateCapacityScores();
        this.updateScenarioState();

        return this.getScenarioComparison();
    }

    /**
     * Simulate removing a rep
     */
    simulateRemoveRep(repName) {
        const repIndex = this.reps.findIndex(r => r.name === repName);
        if (repIndex === -1) return null;

        const removedRep = this.reps.splice(repIndex, 1)[0];

        // Mark accounts as unassigned
        removedRep.accounts.forEach(account => {
            account.owner = 'Unassigned';
        });

        this.calculateCapacityScores();
        this.updateScenarioState();

        return this.getScenarioComparison();
    }

    /**
     * Simulate reassigning accounts
     */
    simulateReassignment(accountNames, toRepName) {
        const toRep = this.reps.find(r => r.name === toRepName);
        if (!toRep) return null;

        accountNames.forEach(accountName => {
            const account = this.accounts.find(a => a.account_name === accountName);
            if (!account) return;

            // Remove from current rep
            const fromRep = this.reps.find(r => r.name === account.owner);
            if (fromRep) {
                fromRep.accounts = fromRep.accounts.filter(a => a.account_name !== accountName);
            }

            // Add to new rep
            account.owner = toRepName;
            toRep.accounts.push(account);
        });

        this.aggregateRepData();
        this.updateScenarioState();

        return this.getScenarioComparison();
    }

    /**
     * Simulate churn of at-risk accounts
     */
    simulateChurn(percentage = 0.35) {
        const atRiskAccounts = this.accounts.filter(a => a.is_at_risk);
        const churnCount = Math.round(atRiskAccounts.length * percentage);
        const churnedAccounts = atRiskAccounts.slice(0, churnCount);

        churnedAccounts.forEach(account => {
            const repIndex = this.reps.findIndex(r => r.name === account.owner);
            if (repIndex !== -1) {
                this.reps[repIndex].accounts = this.reps[repIndex].accounts.filter(
                    a => a.account_name !== account.account_name
                );
            }

            const accountIndex = this.accounts.findIndex(a => a.account_name === account.account_name);
            if (accountIndex !== -1) {
                this.accounts.splice(accountIndex, 1);
            }
        });

        this.aggregateRepData();
        this.updateScenarioState();

        return this.getScenarioComparison();
    }

    /**
     * Update scenario state
     */
    updateScenarioState() {
        this.scenarioState = {
            reps: JSON.parse(JSON.stringify(this.reps)),
            accounts: JSON.parse(JSON.stringify(this.accounts)),
            summary: this.getSummaryMetrics()
        };
    }

    /**
     * Get comparison between original and scenario state
     */
    getScenarioComparison() {
        const original = this.originalState.summary;
        const scenario = this.scenarioState.summary;

        const calculateImpact = (original, scenario) => {
            const diff = scenario - original;
            const pctChange = original !== 0 ? (diff / original) * 100 : 0;
            return {
                original,
                scenario,
                diff,
                pctChange,
                direction: diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'
            };
        };

        return {
            teamSize: calculateImpact(original.teamSize, scenario.teamSize),
            totalARR: calculateImpact(original.totalARR, scenario.totalARR),
            avgCapacity: calculateImpact(original.avgCapacity, scenario.avgCapacity),
            totalActionableWhitespace: calculateImpact(original.totalActionableWhitespace, scenario.totalActionableWhitespace),
            totalAtRiskARR: calculateImpact(original.totalAtRiskARR, scenario.totalAtRiskARR),
            avgHealth: calculateImpact(original.avgHealth, scenario.avgHealth)
        };
    }

    /**
     * Get benchmark comparison for a specific segment
     */
    getBenchmarkComparison(segment = 'Mid-Market') {
        const benchmark = this.benchmarks[segment];
        const summary = this.getSummaryMetrics();

        const avgAccountsPerRep = summary.avgAccountsPerRep;
        const avgARRPerRep = summary.avgARRPerRep;
        const atRiskPct = summary.atRiskPercentage;

        return {
            accounts: {
                yourValue: Math.round(avgAccountsPerRep),
                benchmarkRange: `${benchmark.accountsPerRep.min}-${benchmark.accountsPerRep.max}`,
                status: avgAccountsPerRep > benchmark.accountsPerRep.max ? 'over' :
                        avgAccountsPerRep < benchmark.accountsPerRep.min ? 'under' : 'good',
                percentage: Math.min(100, (avgAccountsPerRep / benchmark.accountsPerRep.max) * 100)
            },
            arr: {
                yourValue: avgARRPerRep,
                benchmarkRange: `$${(benchmark.arrPerRep.min / 1000000).toFixed(0)}-${(benchmark.arrPerRep.max / 1000000).toFixed(0)}M`,
                status: avgARRPerRep > benchmark.arrPerRep.max ? 'over' :
                        avgARRPerRep < benchmark.arrPerRep.min ? 'under' : 'good',
                percentage: Math.min(100, (avgARRPerRep / benchmark.arrPerRep.max) * 100)
            },
            capacity: {
                yourValue: summary.avgCapacity,
                benchmarkTarget: `<${benchmark.healthyCapacity}%`,
                status: summary.avgCapacity > benchmark.healthyCapacity ? 'over' : 'good',
                percentage: Math.min(100, (summary.avgCapacity / 100) * 100)
            },
            risk: {
                yourValue: Math.round(atRiskPct),
                benchmarkTarget: `<${benchmark.atRiskThreshold}%`,
                status: atRiskPct > benchmark.atRiskThreshold ? 'over' : 'good',
                percentage: Math.min(100, (atRiskPct / 25) * 100)
            }
        };
    }

    /**
     * Get all unique territories from accounts
     */
    getTerritories() {
        const territories = new Set();
        this.accounts.forEach(a => territories.add(a.territory));
        return Array.from(territories);
    }

    /**
     * Add pending account for allocation
     */
    addPendingAccount(account) {
        this.pendingAccounts.push({
            ...account,
            id: Date.now().toString()
        });
        return this.pendingAccounts;
    }

    /**
     * Remove pending account
     */
    removePendingAccount(id) {
        this.pendingAccounts = this.pendingAccounts.filter(a => a.id !== id);
        return this.pendingAccounts;
    }

    /**
     * Apply recommended assignments
     */
    applyRecommendations(recommendations) {
        recommendations.forEach(rec => {
            const account = {
                account_name: rec.account.account_name || rec.account.name,
                owner: rec.recommendedRep,
                current_arr: rec.account.current_arr || rec.account.arr,
                internal_tam: rec.account.internal_tam || rec.account.tam,
                health_score: 80, // New accounts start healthy
                churn_risk: 0.05,
                territory: rec.account.territory || 'Unassigned',
                segment: rec.account.segment || 'Mid-Market',
                products_owned: '',
                lifecycle_stage: 'Onboarding'
            };

            // Calculate derived fields
            account.raw_whitespace = Math.max(0, account.internal_tam - account.current_arr);
            account.health_factor = this.calculateHealthFactor(account.health_score);
            account.retention_probability = 1 - account.churn_risk;
            account.actionable_whitespace = account.raw_whitespace * account.health_factor * account.retention_probability;
            account.is_at_risk = false;
            account.complexity_score = this.calculateComplexityScore(account);

            this.accounts.push(account);
        });

        this.pendingAccounts = [];
        this.aggregateRepData();
        this.updateScenarioState();
    }

    /**
     * Format currency value
     */
    formatCurrency(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'K';
        }
        return '$' + value.toFixed(0);
    }
}

// Export as global for browser use
window.TerritoryEngine = TerritoryEngine;
window.territoryEngine = new TerritoryEngine();
