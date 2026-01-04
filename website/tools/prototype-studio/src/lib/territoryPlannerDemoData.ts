// Territory Planner Demo Data

export interface Rep {
  id: string;
  name: string;
  title: string;
  territory: string;
  segment: 'SMB' | 'Mid-Market' | 'Enterprise';
  photoUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  ownerId: string;
  currentArr: number;
  internalTam: number;
  healthScore: number;
  churnRisk: number;
  territory: string;
  segment: 'SMB' | 'Mid-Market' | 'Enterprise';
  productsOwned: string[];
  lifecycleStage: string;
}

export interface RepMetrics {
  repId: string;
  accounts: number;
  arr: number;
  capacityPercent: number;
  actionableWhitespace: number;
  atRiskArr: number;
  avgHealthScore: number;
  vsBenchmark: 'above' | 'at' | 'below';
}

export interface EquityScore {
  type: 'arr' | 'whitespace' | 'capacity' | 'risk';
  score: number;
  status: 'good' | 'warning' | 'critical';
  explanation: string;
  imbalanceContributors: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  reasoning: string;
  impactAreas: ('capacity' | 'equity' | 'risk')[];
  fromRepId?: string;
  toRepId?: string;
  accountIds?: string[];
}

export interface IndustryBenchmark {
  segment: 'SMB' | 'Mid-Market' | 'Enterprise';
  accountsPerRep: number;
  arrPerRep: number;
  healthyCapacityThreshold: number;
  atRiskArrThreshold: number;
}

export const DEMO_REPS: Rep[] = [
  { id: 'rep-1', name: 'Alex Chen', title: 'Senior CSM', territory: 'Northeast', segment: 'Enterprise' },
  { id: 'rep-2', name: 'Sam Martinez', title: 'CSM', territory: 'West', segment: 'Mid-Market' },
  { id: 'rep-3', name: 'Jordan Lee', title: 'CSM', territory: 'Central', segment: 'SMB' },
  { id: 'rep-4', name: 'Taylor Wong', title: 'Senior CSM', territory: 'Southeast', segment: 'Enterprise' },
  { id: 'rep-5', name: 'Morgan Davis', title: 'CSM', territory: 'West', segment: 'Mid-Market' },
];

export const DEMO_ACCOUNTS: Account[] = [
  // Alex Chen's accounts (overloaded - 8 accounts, high ARR)
  { id: 'acc-1', name: 'TechCorp Global', ownerId: 'rep-1', currentArr: 450000, internalTam: 800000, healthScore: 78, churnRisk: 0.15, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform', 'Analytics'], lifecycleStage: 'Mature' },
  { id: 'acc-2', name: 'Innovate Systems', ownerId: 'rep-1', currentArr: 320000, internalTam: 550000, healthScore: 65, churnRisk: 0.35, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'Growth' },
  { id: 'acc-3', name: 'DataFlow Inc', ownerId: 'rep-1', currentArr: 280000, internalTam: 450000, healthScore: 82, churnRisk: 0.10, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform', 'Analytics', 'API'], lifecycleStage: 'Mature' },
  { id: 'acc-4', name: 'CloudFirst', ownerId: 'rep-1', currentArr: 195000, internalTam: 380000, healthScore: 71, churnRisk: 0.22, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'Growth' },
  { id: 'acc-5', name: 'Enterprise Solutions', ownerId: 'rep-1', currentArr: 410000, internalTam: 650000, healthScore: 88, churnRisk: 0.08, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform', 'Analytics'], lifecycleStage: 'Mature' },
  { id: 'acc-6', name: 'Nexus Corp', ownerId: 'rep-1', currentArr: 175000, internalTam: 320000, healthScore: 58, churnRisk: 0.42, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'At Risk' },
  { id: 'acc-7', name: 'Pinnacle Tech', ownerId: 'rep-1', currentArr: 225000, internalTam: 400000, healthScore: 74, churnRisk: 0.18, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Analytics'], lifecycleStage: 'Growth' },
  { id: 'acc-8', name: 'Summit Industries', ownerId: 'rep-1', currentArr: 160000, internalTam: 290000, healthScore: 69, churnRisk: 0.28, territory: 'Northeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'Growth' },

  // Sam Martinez's accounts (balanced - 5 accounts)
  { id: 'acc-9', name: 'Velocity Partners', ownerId: 'rep-2', currentArr: 85000, internalTam: 180000, healthScore: 79, churnRisk: 0.12, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform', 'Analytics'], lifecycleStage: 'Mature' },
  { id: 'acc-10', name: 'Apex Solutions', ownerId: 'rep-2', currentArr: 72000, internalTam: 145000, healthScore: 85, churnRisk: 0.08, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform'], lifecycleStage: 'Growth' },
  { id: 'acc-11', name: 'Horizon Group', ownerId: 'rep-2', currentArr: 95000, internalTam: 200000, healthScore: 76, churnRisk: 0.15, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform', 'API'], lifecycleStage: 'Mature' },
  { id: 'acc-12', name: 'Quantum Dynamics', ownerId: 'rep-2', currentArr: 68000, internalTam: 140000, healthScore: 82, churnRisk: 0.10, territory: 'West', segment: 'Mid-Market', productsOwned: ['Analytics'], lifecycleStage: 'Growth' },
  { id: 'acc-13', name: 'Catalyst Tech', ownerId: 'rep-2', currentArr: 110000, internalTam: 220000, healthScore: 88, churnRisk: 0.06, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform', 'Analytics'], lifecycleStage: 'Mature' },

  // Jordan Lee's accounts (underloaded - 3 accounts, low ARR)
  { id: 'acc-14', name: 'StartUp Labs', ownerId: 'rep-3', currentArr: 18000, internalTam: 45000, healthScore: 91, churnRisk: 0.05, territory: 'Central', segment: 'SMB', productsOwned: ['Platform'], lifecycleStage: 'Onboarding' },
  { id: 'acc-15', name: 'Micro Solutions', ownerId: 'rep-3', currentArr: 24000, internalTam: 60000, healthScore: 78, churnRisk: 0.12, territory: 'Central', segment: 'SMB', productsOwned: ['Platform'], lifecycleStage: 'Growth' },
  { id: 'acc-16', name: 'Agile Works', ownerId: 'rep-3', currentArr: 15000, internalTam: 40000, healthScore: 85, churnRisk: 0.08, territory: 'Central', segment: 'SMB', productsOwned: ['Platform'], lifecycleStage: 'Growth' },

  // Taylor Wong's accounts (balanced enterprise - 5 accounts, high risk concentration)
  { id: 'acc-17', name: 'Global Enterprises', ownerId: 'rep-4', currentArr: 380000, internalTam: 600000, healthScore: 72, churnRisk: 0.25, territory: 'Southeast', segment: 'Enterprise', productsOwned: ['Platform', 'Analytics'], lifecycleStage: 'Mature' },
  { id: 'acc-18', name: 'Titan Industries', ownerId: 'rep-4', currentArr: 290000, internalTam: 500000, healthScore: 55, churnRisk: 0.45, territory: 'Southeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'At Risk' },
  { id: 'acc-19', name: 'Meridian Corp', ownerId: 'rep-4', currentArr: 245000, internalTam: 420000, healthScore: 68, churnRisk: 0.32, territory: 'Southeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'Growth' },
  { id: 'acc-20', name: 'Sterling Partners', ownerId: 'rep-4', currentArr: 310000, internalTam: 480000, healthScore: 81, churnRisk: 0.12, territory: 'Southeast', segment: 'Enterprise', productsOwned: ['Platform', 'Analytics', 'API'], lifecycleStage: 'Mature' },
  { id: 'acc-21', name: 'Pacific Holdings', ownerId: 'rep-4', currentArr: 195000, internalTam: 350000, healthScore: 62, churnRisk: 0.38, territory: 'Southeast', segment: 'Enterprise', productsOwned: ['Platform'], lifecycleStage: 'At Risk' },

  // Morgan Davis's accounts (balanced mid-market - 5 accounts)
  { id: 'acc-22', name: 'Bridge Solutions', ownerId: 'rep-5', currentArr: 78000, internalTam: 160000, healthScore: 83, churnRisk: 0.09, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform', 'Analytics'], lifecycleStage: 'Mature' },
  { id: 'acc-23', name: 'Vector Group', ownerId: 'rep-5', currentArr: 92000, internalTam: 185000, healthScore: 77, churnRisk: 0.14, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform'], lifecycleStage: 'Growth' },
  { id: 'acc-24', name: 'Prism Technologies', ownerId: 'rep-5', currentArr: 65000, internalTam: 130000, healthScore: 89, churnRisk: 0.06, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform', 'API'], lifecycleStage: 'Mature' },
  { id: 'acc-25', name: 'Elevation Inc', ownerId: 'rep-5', currentArr: 105000, internalTam: 210000, healthScore: 75, churnRisk: 0.16, territory: 'West', segment: 'Mid-Market', productsOwned: ['Analytics'], lifecycleStage: 'Growth' },
  { id: 'acc-26', name: 'Frontier Partners', ownerId: 'rep-5', currentArr: 88000, internalTam: 175000, healthScore: 80, churnRisk: 0.11, territory: 'West', segment: 'Mid-Market', productsOwned: ['Platform'], lifecycleStage: 'Mature' },
];

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  { segment: 'SMB', accountsPerRep: 25, arrPerRep: 400000, healthyCapacityThreshold: 85, atRiskArrThreshold: 50000 },
  { segment: 'Mid-Market', accountsPerRep: 12, arrPerRep: 600000, healthyCapacityThreshold: 90, atRiskArrThreshold: 100000 },
  { segment: 'Enterprise', accountsPerRep: 6, arrPerRep: 1500000, healthyCapacityThreshold: 95, atRiskArrThreshold: 300000 },
];

export function calculateRepMetrics(rep: Rep, accounts: Account[], benchmarks: IndustryBenchmark[]): RepMetrics {
  const repAccounts = accounts.filter(a => a.ownerId === rep.id);
  const benchmark = benchmarks.find(b => b.segment === rep.segment) || benchmarks[1];
  
  const arr = repAccounts.reduce((sum, a) => sum + a.currentArr, 0);
  const actionableWhitespace = repAccounts.reduce((sum, a) => sum + (a.internalTam - a.currentArr), 0);
  const atRiskArr = repAccounts.filter(a => a.churnRisk > 0.25).reduce((sum, a) => sum + a.currentArr, 0);
  const avgHealthScore = repAccounts.length > 0 
    ? repAccounts.reduce((sum, a) => sum + a.healthScore, 0) / repAccounts.length 
    : 0;
  
  const capacityPercent = (repAccounts.length / benchmark.accountsPerRep) * 100;
  
  let vsBenchmark: 'above' | 'at' | 'below' = 'at';
  if (capacityPercent > 110) vsBenchmark = 'above';
  else if (capacityPercent < 70) vsBenchmark = 'below';
  
  return {
    repId: rep.id,
    accounts: repAccounts.length,
    arr,
    capacityPercent: Math.round(capacityPercent),
    actionableWhitespace,
    atRiskArr,
    avgHealthScore: Math.round(avgHealthScore),
    vsBenchmark,
  };
}

export function calculateEquityScores(reps: Rep[], accounts: Account[], benchmarks: IndustryBenchmark[]): EquityScore[] {
  const metrics = reps.map(r => calculateRepMetrics(r, accounts, benchmarks));
  
  // ARR Equity
  const arrValues = metrics.map(m => m.arr);
  const arrMean = arrValues.reduce((a, b) => a + b, 0) / arrValues.length;
  const arrStdDev = Math.sqrt(arrValues.reduce((sum, val) => sum + Math.pow(val - arrMean, 2), 0) / arrValues.length);
  const arrCv = arrMean > 0 ? (arrStdDev / arrMean) * 100 : 0;
  const arrScore = Math.max(0, Math.min(100, 100 - arrCv));
  const arrContributors = metrics.filter(m => Math.abs(m.arr - arrMean) > arrStdDev).map(m => m.repId);
  
  // Whitespace Equity
  const wsValues = metrics.map(m => m.actionableWhitespace);
  const wsMean = wsValues.reduce((a, b) => a + b, 0) / wsValues.length;
  const wsStdDev = Math.sqrt(wsValues.reduce((sum, val) => sum + Math.pow(val - wsMean, 2), 0) / wsValues.length);
  const wsCv = wsMean > 0 ? (wsStdDev / wsMean) * 100 : 0;
  const wsScore = Math.max(0, Math.min(100, 100 - wsCv));
  const wsContributors = metrics.filter(m => Math.abs(m.actionableWhitespace - wsMean) > wsStdDev).map(m => m.repId);
  
  // Capacity Equity
  const capValues = metrics.map(m => m.capacityPercent);
  const capMean = capValues.reduce((a, b) => a + b, 0) / capValues.length;
  const capStdDev = Math.sqrt(capValues.reduce((sum, val) => sum + Math.pow(val - capMean, 2), 0) / capValues.length);
  const capScore = Math.max(0, Math.min(100, 100 - capStdDev));
  const capContributors = metrics.filter(m => Math.abs(m.capacityPercent - capMean) > capStdDev).map(m => m.repId);
  
  // Risk Equity
  const riskValues = metrics.map(m => m.atRiskArr);
  const riskMean = riskValues.reduce((a, b) => a + b, 0) / riskValues.length;
  const riskStdDev = Math.sqrt(riskValues.reduce((sum, val) => sum + Math.pow(val - riskMean, 2), 0) / riskValues.length);
  const riskCv = riskMean > 0 ? (riskStdDev / riskMean) * 100 : 0;
  const riskScore = Math.max(0, Math.min(100, 100 - riskCv));
  const riskContributors = metrics.filter(m => Math.abs(m.atRiskArr - riskMean) > riskStdDev).map(m => m.repId);
  
  const getStatus = (score: number): 'good' | 'warning' | 'critical' => {
    if (score >= 75) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  };
  
  return [
    { type: 'arr', score: Math.round(arrScore), status: getStatus(arrScore), explanation: 'Measures how evenly ARR is distributed across reps', imbalanceContributors: arrContributors },
    { type: 'whitespace', score: Math.round(wsScore), status: getStatus(wsScore), explanation: 'Measures fairness of expansion opportunity distribution', imbalanceContributors: wsContributors },
    { type: 'capacity', score: Math.round(capScore), status: getStatus(capScore), explanation: 'Measures workload balance across the team', imbalanceContributors: capContributors },
    { type: 'risk', score: Math.round(riskScore), status: getStatus(riskScore), explanation: 'Measures how evenly churn risk is spread', imbalanceContributors: riskContributors },
  ];
}

export function generateRecommendations(reps: Rep[], accounts: Account[], benchmarks: IndustryBenchmark[]): Recommendation[] {
  const metrics = reps.map(r => ({ ...calculateRepMetrics(r, accounts, benchmarks), rep: r }));
  const recommendations: Recommendation[] = [];
  
  // Find overloaded and underloaded reps
  const overloaded = metrics.filter(m => m.capacityPercent > 110);
  const underloaded = metrics.filter(m => m.capacityPercent < 70);
  
  // Generate reassignment recommendations
  overloaded.forEach(over => {
    underloaded.forEach(under => {
      if (over.rep.segment === under.rep.segment || under.rep.segment === 'Mid-Market') {
        const accountsToMove = accounts
          .filter(a => a.ownerId === over.repId)
          .filter(a => a.churnRisk < 0.3 && a.healthScore > 70)
          .slice(0, 2);
        
        if (accountsToMove.length > 0) {
          recommendations.push({
            id: `rec-${over.repId}-${under.repId}`,
            title: `Shift ${accountsToMove.length} account${accountsToMove.length > 1 ? 's' : ''} from ${over.rep.name} to ${under.rep.name}`,
            reasoning: `${over.rep.name} is at ${over.capacityPercent}% capacity while ${under.rep.name} is at ${under.capacityPercent}%. Moving healthy accounts will improve balance.`,
            impactAreas: ['capacity', 'equity'],
            fromRepId: over.repId,
            toRepId: under.repId,
            accountIds: accountsToMove.map(a => a.id),
          });
        }
      }
    });
  });
  
  // Find the most underutilized rep to give an additional reassignment
  const alreadyRecommended = recommendations.flatMap(r => r.accountIds || []);
  const mostUnderloaded = [...underloaded].sort((a, b) => a.capacityPercent - b.capacityPercent)[0];
  if (mostUnderloaded && overloaded.length > 0) {
    const overloadedRep = overloaded[0];
    const availableAccounts = accounts
      .filter(a => a.ownerId === overloadedRep.repId)
      .filter(a => !alreadyRecommended.includes(a.id))
      .filter(a => a.churnRisk < 0.3 && a.healthScore > 70)
      .slice(0, 2);
    
    if (availableAccounts.length > 0) {
      recommendations.push({
        id: `rec-${overloadedRep.repId}-${mostUnderloaded.repId}`,
        title: `Shift ${availableAccounts.length} account${availableAccounts.length > 1 ? 's' : ''} from ${overloadedRep.rep.name} to ${mostUnderloaded.rep.name}`,
        reasoning: `${mostUnderloaded.rep.name} is significantly underutilized at ${mostUnderloaded.capacityPercent}% capacity. Moving healthy accounts from ${overloadedRep.rep.name} will improve team balance.`,
        impactAreas: ['capacity', 'equity'],
        fromRepId: overloadedRep.repId,
        toRepId: mostUnderloaded.repId,
        accountIds: availableAccounts.map(a => a.id),
      });
    }
  }
  
  // Suggest hiring if average capacity is high
  const avgCapacity = metrics.reduce((sum, m) => sum + m.capacityPercent, 0) / metrics.length;
  if (avgCapacity > 90) {
    recommendations.push({
      id: 'rec-hire',
      title: 'Consider hiring an additional team member',
      reasoning: `Team average capacity is ${Math.round(avgCapacity)}%. Adding headcount will reduce burnout risk and provide room for growth.`,
      impactAreas: ['capacity'],
    });
  }
  
  return recommendations.slice(0, 5);
}

export const SAMPLE_CSV = `account_name,owner,current_arr,internal_tam,health_score,churn_risk,territory,segment
"Acme Corp","Alex Chen",250000,400000,78,0.15,"Northeast","Enterprise"
"Beta Inc","Sam Martinez",85000,150000,82,0.10,"West","Mid-Market"
"StartUp Co","Jordan Lee",15000,40000,90,0.05,"Central","SMB"`;
