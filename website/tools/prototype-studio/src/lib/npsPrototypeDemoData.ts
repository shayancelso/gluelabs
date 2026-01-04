// NPS Prototype Demo Data - mock data for the NPS Account Hub prototype

export interface NPSAccount {
  id: string;
  name: string;
  score: number;
  previousScore?: number;
  category: 'promoter' | 'passive' | 'detractor';
  trend: 'up' | 'down' | 'flat';
  arr: number;
  segment: 'SMB' | 'Mid-Market' | 'Enterprise';
  owner: string;
  renewalDate: string;
  responseDate: string;
  feedbackText?: string;
  followupRequired: boolean;
  followupCompleted: boolean;
  surveyType?: 'relationship' | 'transactional';
  product?: string;
}

export interface NPSOwner {
  id: string;
  name: string;
}

export interface NPSTrend {
  month: string;
  score: number;
  responses: number;
}

// Get NPS category based on score
export function getNPSCategory(score: number): 'promoter' | 'passive' | 'detractor' {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

// Get trend based on previous score
export function getNPSTrend(score: number, previousScore?: number): 'up' | 'down' | 'flat' {
  if (!previousScore) return 'flat';
  if (score > previousScore) return 'up';
  if (score < previousScore) return 'down';
  return 'flat';
}

// Demo owners/reps
export const DEMO_OWNERS: NPSOwner[] = [
  { id: 'owner-1', name: 'Sarah Chen' },
  { id: 'owner-2', name: 'Michael Torres' },
  { id: 'owner-3', name: 'Emily Johnson' },
  { id: 'owner-4', name: 'David Kim' },
];

// Demo accounts with NPS data
export const DEMO_NPS_ACCOUNTS: NPSAccount[] = [
  {
    id: 'acc-1',
    name: 'Acme Corporation',
    score: 10,
    previousScore: 9,
    category: 'promoter',
    trend: 'up',
    arr: 125000,
    segment: 'Enterprise',
    owner: 'Sarah Chen',
    renewalDate: '2025-06-15',
    responseDate: '2025-01-02',
    feedbackText: 'The product has transformed our workflow. Support team is exceptional!',
    followupRequired: false,
    followupCompleted: true,
    surveyType: 'relationship',
    product: 'Platform Pro',
  },
  {
    id: 'acc-2',
    name: 'TechStart Inc',
    score: 9,
    previousScore: 8,
    category: 'promoter',
    trend: 'up',
    arr: 48000,
    segment: 'Mid-Market',
    owner: 'Michael Torres',
    renewalDate: '2025-04-20',
    responseDate: '2025-01-03',
    feedbackText: 'Great value for the price. Would recommend to peers.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Standard',
  },
  {
    id: 'acc-3',
    name: 'Global Dynamics',
    score: 6,
    previousScore: 8,
    category: 'detractor',
    trend: 'down',
    arr: 250000,
    segment: 'Enterprise',
    owner: 'Sarah Chen',
    renewalDate: '2025-03-01',
    responseDate: '2024-12-28',
    feedbackText: 'Recent updates have caused issues. Need more reliable releases.',
    followupRequired: true,
    followupCompleted: false,
    surveyType: 'transactional',
    product: 'Platform Enterprise',
  },
  {
    id: 'acc-4',
    name: 'Velocity Labs',
    score: 8,
    previousScore: 7,
    category: 'passive',
    trend: 'up',
    arr: 36000,
    segment: 'SMB',
    owner: 'Emily Johnson',
    renewalDate: '2025-07-10',
    responseDate: '2025-01-01',
    feedbackText: 'Good product overall. Would like more integrations.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Standard',
  },
  {
    id: 'acc-5',
    name: 'Pinnacle Solutions',
    score: 4,
    previousScore: 6,
    category: 'detractor',
    trend: 'down',
    arr: 95000,
    segment: 'Mid-Market',
    owner: 'David Kim',
    renewalDate: '2025-02-15',
    responseDate: '2024-12-20',
    feedbackText: 'Support response times are too slow. Considering alternatives.',
    followupRequired: true,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Pro',
  },
  {
    id: 'acc-6',
    name: 'Summit Holdings',
    score: 10,
    previousScore: 10,
    category: 'promoter',
    trend: 'flat',
    arr: 180000,
    segment: 'Enterprise',
    owner: 'Michael Torres',
    renewalDate: '2025-09-01',
    responseDate: '2025-01-02',
    feedbackText: 'Best-in-class solution. Already referred two companies.',
    followupRequired: false,
    followupCompleted: true,
    surveyType: 'relationship',
    product: 'Platform Enterprise',
  },
  {
    id: 'acc-7',
    name: 'Horizon Tech',
    score: 7,
    previousScore: 7,
    category: 'passive',
    trend: 'flat',
    arr: 24000,
    segment: 'SMB',
    owner: 'Emily Johnson',
    renewalDate: '2025-05-22',
    responseDate: '2024-12-30',
    feedbackText: 'Does what we need. Nothing exceptional.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'transactional',
    product: 'Platform Standard',
  },
  {
    id: 'acc-8',
    name: 'NextGen Systems',
    score: 9,
    previousScore: 7,
    category: 'promoter',
    trend: 'up',
    arr: 72000,
    segment: 'Mid-Market',
    owner: 'Sarah Chen',
    renewalDate: '2025-08-15',
    responseDate: '2025-01-03',
    feedbackText: 'Huge improvement after the last update. Love the new features!',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Pro',
  },
  {
    id: 'acc-9',
    name: 'Core Industries',
    score: 5,
    previousScore: 7,
    category: 'detractor',
    trend: 'down',
    arr: 150000,
    segment: 'Enterprise',
    owner: 'David Kim',
    renewalDate: '2025-04-01',
    responseDate: '2024-12-18',
    feedbackText: 'Implementation took longer than expected. Still having issues.',
    followupRequired: true,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Enterprise',
  },
  {
    id: 'acc-10',
    name: 'Bright Ideas Co',
    score: 8,
    previousScore: 9,
    category: 'passive',
    trend: 'down',
    arr: 18000,
    segment: 'SMB',
    owner: 'Michael Torres',
    renewalDate: '2025-06-30',
    responseDate: '2025-01-01',
    feedbackText: 'Prices went up but value stayed the same.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'transactional',
    product: 'Platform Standard',
  },
  {
    id: 'acc-11',
    name: 'Atlas Manufacturing',
    score: 10,
    previousScore: 9,
    category: 'promoter',
    trend: 'up',
    arr: 320000,
    segment: 'Enterprise',
    owner: 'Sarah Chen',
    renewalDate: '2025-11-15',
    responseDate: '2025-01-02',
    feedbackText: 'Mission critical for our operations. Excellent reliability.',
    followupRequired: false,
    followupCompleted: true,
    surveyType: 'relationship',
    product: 'Platform Enterprise',
  },
  {
    id: 'acc-12',
    name: 'Spark Innovations',
    score: 3,
    previousScore: 5,
    category: 'detractor',
    trend: 'down',
    arr: 42000,
    segment: 'Mid-Market',
    owner: 'Emily Johnson',
    renewalDate: '2025-02-28',
    responseDate: '2024-12-15',
    feedbackText: 'Major bug caused data loss. Very disappointed.',
    followupRequired: true,
    followupCompleted: false,
    surveyType: 'transactional',
    product: 'Platform Pro',
  },
  {
    id: 'acc-13',
    name: 'Metro Solutions',
    score: 9,
    previousScore: 8,
    category: 'promoter',
    trend: 'up',
    arr: 55000,
    segment: 'Mid-Market',
    owner: 'David Kim',
    renewalDate: '2025-07-20',
    responseDate: '2025-01-03',
    feedbackText: 'Customer success team is fantastic. Always helpful.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Pro',
  },
  {
    id: 'acc-14',
    name: 'CloudFirst Ltd',
    score: 7,
    previousScore: 6,
    category: 'passive',
    trend: 'up',
    arr: 28000,
    segment: 'SMB',
    owner: 'Michael Torres',
    renewalDate: '2025-10-01',
    responseDate: '2024-12-28',
    feedbackText: 'Good improvements recently. Keep it up.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Standard',
  },
  {
    id: 'acc-15',
    name: 'Quantum Dynamics',
    score: 10,
    previousScore: 10,
    category: 'promoter',
    trend: 'flat',
    arr: 210000,
    segment: 'Enterprise',
    owner: 'Sarah Chen',
    renewalDate: '2025-12-01',
    responseDate: '2025-01-01',
    feedbackText: 'Consistently exceeds expectations. A true partner.',
    followupRequired: false,
    followupCompleted: true,
    surveyType: 'relationship',
    product: 'Platform Enterprise',
  },
  {
    id: 'acc-16',
    name: 'DataFlow Systems',
    score: 8,
    previousScore: 8,
    category: 'passive',
    trend: 'flat',
    arr: 65000,
    segment: 'Mid-Market',
    owner: 'Emily Johnson',
    renewalDate: '2025-05-15',
    responseDate: '2024-12-22',
    feedbackText: 'Reliable but looking for more innovation.',
    followupRequired: false,
    followupCompleted: false,
    surveyType: 'relationship',
    product: 'Platform Pro',
  },
];

// Demo trend data (last 6 months)
export const DEMO_NPS_TRENDS: NPSTrend[] = [
  { month: 'Aug', score: 42, responses: 45 },
  { month: 'Sep', score: 38, responses: 52 },
  { month: 'Oct', score: 45, responses: 48 },
  { month: 'Nov', score: 41, responses: 55 },
  { month: 'Dec', score: 48, responses: 62 },
  { month: 'Jan', score: 52, responses: 58 },
];

// Calculate overall NPS score from accounts
export function calculateOverallNPS(accounts: NPSAccount[]): number {
  if (accounts.length === 0) return 0;
  
  const promoters = accounts.filter(a => a.category === 'promoter').length;
  const detractors = accounts.filter(a => a.category === 'detractor').length;
  
  return Math.round(((promoters - detractors) / accounts.length) * 100);
}

// Calculate category percentages
export function calculateCategoryPercentages(accounts: NPSAccount[]): {
  promoters: number;
  passives: number;
  detractors: number;
} {
  if (accounts.length === 0) return { promoters: 0, passives: 0, detractors: 0 };
  
  const promoters = accounts.filter(a => a.category === 'promoter').length;
  const passives = accounts.filter(a => a.category === 'passive').length;
  const detractors = accounts.filter(a => a.category === 'detractor').length;
  
  return {
    promoters: Math.round((promoters / accounts.length) * 100),
    passives: Math.round((passives / accounts.length) * 100),
    detractors: Math.round((detractors / accounts.length) * 100),
  };
}

// Calculate at-risk ARR (detractors + upcoming renewals with passive/detractor)
export function calculateAtRiskARR(accounts: NPSAccount[]): number {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  return accounts
    .filter(a => {
      const renewalDate = new Date(a.renewalDate);
      const isUpcomingRenewal = renewalDate <= threeMonthsFromNow;
      const isAtRisk = a.category === 'detractor' || (a.category === 'passive' && isUpcomingRenewal);
      return isAtRisk;
    })
    .reduce((sum, a) => sum + a.arr, 0);
}

// Get accounts needing followup
export function getFollowupRequired(accounts: NPSAccount[]): NPSAccount[] {
  return accounts.filter(a => a.followupRequired && !a.followupCompleted);
}

// Sample CSV template content
export const SAMPLE_NPS_CSV = `account_name,score,previous_score,arr,segment,owner,renewal_date,feedback
"Example Corp",9,8,100000,Enterprise,Sarah Chen,2025-06-15,"Great product!"
"Startup Inc",7,,24000,SMB,Emily Johnson,2025-04-20,"Good but needs work"
"Big Co",4,7,200000,Enterprise,David Kim,2025-03-01,"Not satisfied"`;
