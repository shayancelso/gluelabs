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

        // Industry benchmarks by segment
        this.benchmarks = {
            'SMB': {
                accountsPerRep: { min: 50, max: 75, ideal: 60 },
                arrPerRep: { min: 1000000, max: 2000000, ideal: 1500000 },
                healthyCapacity: 85,
                atRiskThreshold: 15,
                avgHealthScore: 70
            },
            'Mid-Market': {
                accountsPerRep: { min: 25, max: 40, ideal: 32 },
                arrPerRep: { min: 2000000, max: 4000000, ideal: 3000000 },
                healthyCapacity: 80,
                atRiskThreshold: 12,
                avgHealthScore: 75
            },
            'Enterprise': {
                accountsPerRep: { min: 8, max: 15, ideal: 12 },
                arrPerRep: { min: 5000000, max: 10000000, ideal: 7000000 },
                healthyCapacity: 75,
                atRiskThreshold: 10,
                avgHealthScore: 80
            }
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
     * Calculate complexity score for an account
     */
    calculateComplexityScore(account) {
        let score = 1;

        // Higher ARR = more complexity
        if (account.current_arr > 500000) score += 0.5;
        else if (account.current_arr > 100000) score += 0.3;
        else if (account.current_arr > 50000) score += 0.1;

        // Unhealthy accounts require more attention
        if (account.health_score < 60) score += 0.4;
        else if (account.health_score < 80) score += 0.2;

        // At-risk accounts need intervention
        if (account.churn_risk > 0.3) score += 0.5;
        else if (account.churn_risk > 0.15) score += 0.25;

        // High whitespace = proactive expansion work
        if (account.actionable_whitespace > 100000) score += 0.3;
        else if (account.actionable_whitespace > 50000) score += 0.15;

        // Enterprise accounts are inherently more complex
        if (account.segment === 'Enterprise') score += 0.3;
        else if (account.segment === 'Mid-Market') score += 0.1;

        return score;
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
     * Calculate capacity scores for all reps
     */
    calculateCapacityScores() {
        const avgComplexity = this.reps.reduce((sum, r) => sum + r.totalComplexity, 0) / this.reps.length;

        this.reps.forEach(rep => {
            const benchmark = this.benchmarks[rep.primarySegment];

            // Base capacity from account count
            const accountCapacity = (rep.accountCount / benchmark.accountsPerRep.ideal) * 40;

            // ARR capacity component
            const arrCapacity = (rep.totalARR / benchmark.arrPerRep.ideal) * 30;

            // Complexity adjustment
            const complexityCapacity = (rep.totalComplexity / avgComplexity) * 30;

            rep.capacityScore = Math.min(150, Math.round(accountCapacity + arrCapacity + complexityCapacity));

            // Determine capacity status
            if (rep.capacityScore > 100) {
                rep.capacityStatus = 'critical';
            } else if (rep.capacityScore > benchmark.healthyCapacity) {
                rep.capacityStatus = 'warning';
            } else {
                rep.capacityStatus = 'healthy';
            }

            // Calculate benchmark comparison
            const arrPerRepBenchmark = (benchmark.arrPerRep.min + benchmark.arrPerRep.max) / 2;
            const accountsBenchmark = (benchmark.accountsPerRep.min + benchmark.accountsPerRep.max) / 2;

            rep.benchmarkComparison = {
                arrDiff: ((rep.totalARR / arrPerRepBenchmark) - 1) * 100,
                accountsDiff: ((rep.accountCount / accountsBenchmark) - 1) * 100
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
     * Calculate equity scores for different dimensions
     */
    calculateEquityScores() {
        if (this.reps.length < 2) {
            return {
                arr: 100,
                whitespace: 100,
                capacity: 100,
                risk: 100
            };
        }

        const calculateEquity = (values) => {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const cv = (stdDev / mean) * 100; // Coefficient of variation
            // Convert CV to equity score (lower CV = higher equity)
            return Math.max(0, Math.min(100, 100 - cv));
        };

        return {
            arr: Math.round(calculateEquity(this.reps.map(r => r.totalARR))),
            whitespace: Math.round(calculateEquity(this.reps.map(r => r.totalActionableWhitespace))),
            capacity: Math.round(calculateEquity(this.reps.map(r => r.capacityScore))),
            risk: Math.round(calculateEquity(this.reps.map(r => r.atRiskARR)))
        };
    }

    /**
     * Generate equity insights
     */
    getEquityInsights() {
        const insights = [];
        const summary = this.getSummaryMetrics();

        // Find imbalances
        const maxARRRep = this.reps.reduce((max, r) => r.totalARR > max.totalARR ? r : max);
        const minARRRep = this.reps.reduce((min, r) => r.totalARR < min.totalARR ? r : min);
        const arrRatio = maxARRRep.totalARR / minARRRep.totalARR;

        if (arrRatio > 2) {
            insights.push({
                type: 'warning',
                text: `${maxARRRep.name} manages ${arrRatio.toFixed(1)}x more ARR than ${minARRRep.name}. Consider rebalancing.`
            });
        }

        // Whitespace concentration
        const maxWSRep = this.reps.reduce((max, r) => r.totalActionableWhitespace > max.totalActionableWhitespace ? r : max);
        const wsShare = (maxWSRep.totalActionableWhitespace / summary.totalActionableWhitespace) * 100;

        if (wsShare > 40) {
            insights.push({
                type: 'info',
                text: `${wsShare.toFixed(0)}% of actionable whitespace is concentrated with ${maxWSRep.name}.`
            });
        }

        // Overloaded reps
        const overloadedReps = this.reps.filter(r => r.capacityScore > 100);
        if (overloadedReps.length > 0) {
            insights.push({
                type: 'warning',
                text: `${overloadedReps.length} team member(s) are over capacity: ${overloadedReps.map(r => r.name).join(', ')}.`
            });
        }

        // Risk concentration
        const highRiskReps = this.reps.filter(r => (r.atRiskARR / r.totalARR) > 0.2);
        if (highRiskReps.length > 0) {
            insights.push({
                type: 'warning',
                text: `${highRiskReps.length} team member(s) have >20% at-risk ARR: ${highRiskReps.map(r => r.name).join(', ')}.`
            });
        }

        // Success indicators
        const balancedReps = this.reps.filter(r => r.capacityScore >= 60 && r.capacityScore <= 85);
        if (balancedReps.length === this.reps.length) {
            insights.push({
                type: 'success',
                text: 'All team members are within healthy capacity range.'
            });
        }

        return insights;
    }

    /**
     * Calculate projections for hiring needs
     */
    calculateProjections(scenario = 'expected', capacityThreshold = 85) {
        const summary = this.getSummaryMetrics();
        const growthRate = this.growthScenarios[scenario];

        // Project 90 days out
        const projectedARR = summary.totalARR * (1 + growthRate);
        const expectedChurn = summary.totalAtRiskARR * 0.35; // Assume 35% of at-risk churns
        const netProjectedARR = projectedARR - expectedChurn;

        // Calculate required headcount based on current ARR/rep ratio
        const currentArrPerRep = summary.totalARR / summary.teamSize;
        const targetArrPerRep = currentArrPerRep * (capacityThreshold / summary.avgCapacity);
        const requiredHeadcount = netProjectedARR / targetArrPerRep;

        // Calculate projected capacity
        const projectedCapacity = (netProjectedARR / (summary.teamSize * targetArrPerRep)) * 100;

        // Hiring recommendation
        const hiringNeed = Math.max(0, Math.ceil(requiredHeadcount - summary.teamSize));

        // Calculate headroom
        const headroom = (summary.teamSize * targetArrPerRep) - summary.totalARR;

        return {
            current: {
                teamSize: summary.teamSize,
                totalARR: summary.totalARR,
                avgCapacity: summary.avgCapacity,
                headroom: Math.max(0, headroom)
            },
            projected: {
                totalARR: netProjectedARR,
                projectedCapacity: Math.round(projectedCapacity),
                requiredHeadcount: requiredHeadcount.toFixed(1),
                hiringNeed,
                expectedChurn
            },
            timeline: this.generateHiringTimeline(scenario, hiringNeed, capacityThreshold)
        };
    }

    /**
     * Generate hiring timeline
     */
    generateHiringTimeline(scenario, hiringNeed, capacityThreshold) {
        const timeline = [];
        const summary = this.getSummaryMetrics();
        const growthRate = this.growthScenarios[scenario];

        if (hiringNeed <= 0) {
            timeline.push({
                date: 'Current',
                action: 'No immediate hiring needed',
                reason: `Team capacity at ${summary.avgCapacity}%, below ${capacityThreshold}% threshold`
            });
            return timeline;
        }

        // Calculate when threshold will be hit
        const daysToThreshold = Math.round((capacityThreshold - summary.avgCapacity) / (growthRate / 90 * summary.avgCapacity));

        timeline.push({
            date: `Day ${Math.max(0, daysToThreshold - 45)}`,
            action: 'Start recruiting',
            reason: 'Allow 45 days for hiring process'
        });

        for (let i = 0; i < hiringNeed; i++) {
            const startDay = daysToThreshold + (i * 30);
            timeline.push({
                date: `Day ${startDay}`,
                action: `Hire CSM #${summary.teamSize + i + 1}`,
                reason: i === 0 ? 'Capacity threshold reached' : 'Continued growth'
            });
        }

        return timeline;
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
