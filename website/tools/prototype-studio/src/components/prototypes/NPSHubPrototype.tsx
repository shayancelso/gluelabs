import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MessageSquare, Users, DollarSign, TrendingUp, TrendingDown, Minus, AlertTriangle, 
  Download, Plus, Trash2, RefreshCw, Search, Filter, ChevronDown, ChevronUp, 
  X, Eye, Edit3, Save, Check, FileText, Settings2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { OnboardingStep } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { LikeWhatYouSeeBanner, BannerState } from './LikeWhatYouSeeBanner';
import { ContactDialog } from './ContactDialog';
import type { BrandConfig } from './PrototypeBrandingBar';
import louMascot from '@/assets/lou-mascot.png';
import { exportToMultiPagePortraitPdf } from '@/lib/exportPdf';
import { getContrastColor, isLightColor, getDarkestColor } from '@/lib/colorUtils';
import { 
  DEMO_NPS_ACCOUNTS, 
  DEMO_OWNERS, 
  DEMO_NPS_TRENDS,
  calculateOverallNPS, 
  calculateCategoryPercentages, 
  calculateAtRiskARR,
  getFollowupRequired,
  getNPSCategory,
  getNPSTrend,
  type NPSAccount,
  type NPSOwner,
  type NPSTrend,
} from '@/lib/npsPrototypeDemoData';
import { NPSPdfPage1, NPSPdfPage2, NPSPdfPage3 } from './pdf/NPSPdfPages';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, Legend 
} from 'recharts';

interface NPSHubPrototypeProps {
  onClose: () => void;
  initialBrandConfig?: BrandConfig;
}

const DEFAULT_BRAND: BrandConfig = {
  logoUrl: null,
  primaryColor: 'hsl(270, 60%, 50%)',
  secondaryColor: 'hsl(330, 70%, 60%)',
  accentColor: 'hsl(290, 55%, 55%)',
  backgroundColor: 'hsl(0, 0%, 99%)',
  textColor: 'hsl(240, 10%, 10%)',
  companyName: 'Gloo',
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetSelector: '[data-onboarding="nps-header"]',
    title: 'Welcome to NPS Account Hub',
    description: 'Companies with the highest customer loyalty grow revenue 2.5x faster. Track and act on your NPS data to drive retention.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-header"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="nps-kpis"]',
    title: 'Key NPS Metrics',
    description: 'At a glance: overall NPS score, response counts, and category breakdowns.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-kpis"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="nps-distribution"]',
    title: 'NPS Distribution',
    description: 'See how your accounts break down across promoters, passives, and detractors.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-distribution"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="nps-trend"]',
    title: 'NPS Trend Over Time',
    description: 'Track how your NPS score changes month over month.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-trend"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="nps-analysis"]',
    title: 'Action-Focused Analysis',
    description: 'Review at-risk accounts, detractors, and declining scores to prioritize your follow-up actions.',
    position: 'top',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-analysis"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="nps-accounts"]',
    title: 'Account List',
    description: 'Filter and search through all accounts. Click any row to see details.',
    position: 'top',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-accounts"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="nps-configure"]',
    title: 'Configure Data',
    description: 'Switch to the Configure tab to customize demo data for your presentation.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="nps-configure"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
];

export function NPSHubPrototype({ onClose, initialBrandConfig }: NPSHubPrototypeProps) {
  const brandConfig = initialBrandConfig || DEFAULT_BRAND;
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [accounts, setAccounts] = useState<NPSAccount[]>(DEMO_NPS_ACCOUNTS);
  const [owners, setOwners] = useState<NPSOwner[]>(DEMO_OWNERS);
  const [trends, setTrends] = useState<NPSTrend[]>(DEMO_NPS_TRENDS);
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('arr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showCsvReference, setShowCsvReference] = useState(false);
  
  // Account detail sheet
  const [selectedAccount, setSelectedAccount] = useState<NPSAccount | null>(null);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  
  // Config tab editing
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  
  // PDF refs
  const pdfPage1Ref = useRef<HTMLDivElement>(null);
  const pdfPage2Ref = useRef<HTMLDivElement>(null);
  const pdfPage3Ref = useRef<HTMLDivElement>(null);
  
  // Brand colors
  const brandColors = useMemo(() => [
    brandConfig.primaryColor,
    brandConfig.secondaryColor,
    brandConfig.accentColor,
  ], [brandConfig]);
  const darkestBrandColor = useMemo(() => getDarkestColor(brandColors), [brandColors]);
  
  // Onboarding
  const {
    isActive: isOnboardingActive,
    currentStep,
    currentStepData,
    nextStep,
    prevStep,
    skipTour,
    totalSteps,
  } = useOnboarding({
    toolId: 'nps-hub',
    steps: ONBOARDING_STEPS,
    onComplete: () => setBannerState('expanded'),
    onContactRequest: () => setShowContactDialog(true),
  });

  // Show banner after 30 seconds if not shown via onboarding
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bannerState === 'hidden') {
        setBannerState('expanded');
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [bannerState]);
  
  // Calculations
  const overallNPS = useMemo(() => calculateOverallNPS(accounts), [accounts]);
  const percentages = useMemo(() => calculateCategoryPercentages(accounts), [accounts]);
  const atRiskARR = useMemo(() => calculateAtRiskARR(accounts), [accounts]);
  const totalARR = useMemo(() => accounts.reduce((sum, a) => sum + a.arr, 0), [accounts]);
  const followupRequired = useMemo(() => getFollowupRequired(accounts).length, [accounts]);
  
  // Filtered and sorted accounts
  const filteredAccounts = useMemo(() => {
    let result = accounts;
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.owner.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(a => a.category === categoryFilter);
    }
    
    // Segment filter
    if (segmentFilter !== 'all') {
      result = result.filter(a => a.segment === segmentFilter);
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      
      switch (sortColumn) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'score': aVal = a.score; bVal = b.score; break;
        case 'arr': aVal = a.arr; bVal = b.arr; break;
        case 'segment': aVal = a.segment; bVal = b.segment; break;
        case 'owner': aVal = a.owner; bVal = b.owner; break;
        case 'renewalDate': aVal = new Date(a.renewalDate).getTime(); bVal = new Date(b.renewalDate).getTime(); break;
      }
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string) 
          : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
    });
    
    return result;
  }, [accounts, searchQuery, categoryFilter, segmentFilter, sortColumn, sortDirection]);
  
  // Chart data
  const pieData = [
    { name: 'Promoters', value: percentages.promoters, color: '#22c55e' },
    { name: 'Passives', value: percentages.passives, color: '#eab308' },
    { name: 'Detractors', value: percentages.detractors, color: '#ef4444' },
  ];
  
  const segmentData = useMemo(() => {
    const segments = ['Enterprise', 'Mid-Market', 'SMB'] as const;
    return segments.map(seg => {
      const segAccounts = accounts.filter(a => a.segment === seg);
      return {
        segment: seg,
        nps: calculateOverallNPS(segAccounts),
        count: segAccounts.length,
      };
    });
  }, [accounts]);
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  const handleAccountClick = (account: NPSAccount) => {
    setSelectedAccount(account);
    setShowAccountSheet(true);
  };
  
  const handleExportPdf = async () => {
    if (!pdfPage1Ref.current || !pdfPage2Ref.current || !pdfPage3Ref.current || isExporting) return;
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      await exportToMultiPagePortraitPdf({
        toolName: 'NPS Account Hub',
        accountName: brandConfig.companyName || 'Analysis',
        pages: [pdfPage1Ref.current, pdfPage2Ref.current, pdfPage3Ref.current],
      });
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleResetData = () => {
    setAccounts(DEMO_NPS_ACCOUNTS);
    setOwners(DEMO_OWNERS);
    setTrends(DEMO_NPS_TRENDS);
    toast.success('Data reset to defaults');
  };
  
  const handleAddAccount = () => {
    const newAccount: NPSAccount = {
      id: `acc-new-${Date.now()}`,
      name: `New Account ${accounts.length + 1}`,
      score: 7,
      category: 'passive',
      trend: 'flat',
      arr: 50000,
      segment: 'Mid-Market',
      owner: owners[0]?.name || 'Unassigned',
      renewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      responseDate: new Date().toISOString().split('T')[0],
      followupRequired: false,
      followupCompleted: false,
    };
    setAccounts(prev => [...prev, newAccount]);
    setEditingAccountId(newAccount.id);
  };
  
  const handleUpdateAccount = (id: string, updates: Partial<NPSAccount>) => {
    setAccounts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, ...updates };
      // Recalculate category and trend
      if ('score' in updates) {
        updated.category = getNPSCategory(updated.score);
        updated.trend = getNPSTrend(updated.score, a.previousScore);
      }
      return updated;
    }));
  };
  
  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };
  
  const handleAddOwner = () => {
    const newOwner: NPSOwner = {
      id: `owner-new-${Date.now()}`,
      name: `New Owner ${owners.length + 1}`,
    };
    setOwners(prev => [...prev, newOwner]);
  };
  
  const handleUpdateOwner = (id: string, name: string) => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, name } : o));
  };
  
  const handleDeleteOwner = (id: string) => {
    setOwners(prev => prev.filter(o => o.id !== id));
  };
  
  // Category badge styling
  const getCategoryBadge = (category: 'promoter' | 'passive' | 'detractor') => {
    switch (category) {
      case 'promoter': return 'bg-green-100 text-green-700 border-green-200';
      case 'passive': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'detractor': return 'bg-red-100 text-red-700 border-red-200';
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Branded Header */}
        <div 
          data-onboarding="nps-header"
          className="rounded-xl p-4 md:p-6 mb-6 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})` 
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {brandConfig.logoUrl && (
                <img 
                  src={brandConfig.logoUrl} 
                  alt={`${brandConfig.companyName} logo`}
                  className="h-10 md:h-12 w-auto object-contain bg-white/90 rounded-lg p-1.5"
                />
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{ color: '#ffffff' }}>
                  {brandConfig.companyName} NPS Account Hub
                </h1>
                <p className="text-white/80 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Track NPS scores, identify at-risk accounts, and manage follow-up actions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6" data-onboarding="nps-configure">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="configure">Configure Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
              data-onboarding="nps-kpis"
            >
              <Card className="border-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${brandConfig.primaryColor}10, ${brandConfig.secondaryColor}10)` }}>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl md:text-3xl font-bold ${overallNPS >= 50 ? 'text-green-600' : overallNPS >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {overallNPS > 0 ? '+' : ''}{overallNPS}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Overall NPS</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold">{accounts.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Responses</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{percentages.promoters}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Promoters (9-10)</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-600">{percentages.passives}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Passives (7-8)</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-red-600">{percentages.detractors}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Detractors (0-6)</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-red-600">${(atRiskARR / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground mt-1">At-Risk ARR</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Distribution Pie */}
              <Card className="border-0 shadow-sm" data-onboarding="nps-distribution">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">NPS Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Trend Line */}
              <Card className="border-0 shadow-sm" data-onboarding="nps-trend">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">NPS Trend (6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[-100, 100]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke={brandConfig.primaryColor} 
                          strokeWidth={3}
                          dot={{ fill: brandConfig.primaryColor, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Segment Bar */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">NPS by Segment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={segmentData} layout="vertical">
                        <XAxis type="number" domain={[-100, 100]} tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="segment" tick={{ fontSize: 12 }} width={85} />
                        <Tooltip />
                        <Bar 
                          dataKey="nps" 
                          fill={brandConfig.primaryColor}
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Analysis Row - At-Risk, Detractors, Declining */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6" data-onboarding="nps-analysis">
              {/* At-Risk Analysis */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    At-Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-red-50">
                      <span className="text-sm text-muted-foreground">At-Risk ARR</span>
                      <span className="font-bold text-red-600">${(atRiskARR / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm text-muted-foreground">Total ARR</span>
                      <span className="font-bold">${(totalARR / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-amber-50">
                      <span className="text-sm text-muted-foreground">% At Risk</span>
                      <span className="font-bold text-amber-600">{((atRiskARR / totalARR) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                      <span className="text-sm text-muted-foreground">Followups Needed</span>
                      <span className="font-bold text-blue-600">{followupRequired}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detractor Accounts */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-600">
                    Detractor Accounts ({accounts.filter(a => a.category === 'detractor').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-2">
                      {accounts
                        .filter(a => a.category === 'detractor')
                        .sort((a, b) => b.arr - a.arr)
                        .slice(0, 6)
                        .map(account => (
                          <div 
                            key={account.id} 
                            className="flex items-center justify-between p-2 rounded bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                            onClick={() => handleAccountClick(account)}
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
                                {account.score}
                              </Badge>
                              <span className="text-sm font-medium truncate max-w-[100px]">{account.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">${(account.arr / 1000).toFixed(0)}K</span>
                              {account.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                              {account.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                              {account.trend === 'flat' && <Minus className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Declining NPS Accounts */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                    <TrendingDown className="h-4 w-4" />
                    Declining Accounts ({accounts.filter(a => a.category !== 'promoter' && a.trend === 'down' && a.previousScore !== undefined).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <div className="grid grid-cols-2 gap-2">
                      {accounts
                        .filter(a => a.category !== 'promoter' && a.trend === 'down' && a.previousScore !== undefined)
                        .sort((a, b) => b.arr - a.arr)
                        .slice(0, 6)
                        .map(account => (
                          <div 
                            key={account.id} 
                            className="p-2 rounded bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors border border-amber-100"
                            onClick={() => handleAccountClick(account)}
                          >
                            <div className="text-xs font-medium truncate">{account.name}</div>
                            <div className="flex items-center justify-between mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${account.category === 'detractor' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}
                              >
                                {account.score}
                              </Badge>
                              <span className="text-xs text-muted-foreground">${(account.arr / 1000).toFixed(0)}K</span>
                            </div>
                            {account.previousScore && (
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3 text-red-500" />
                                from {account.previousScore}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-sm" data-onboarding="nps-accounts">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <CardTitle className="text-base">All Accounts</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search accounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-[180px] h-8 text-sm"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[120px] h-8 text-sm">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="promoter">Promoters</SelectItem>
                        <SelectItem value="passive">Passives</SelectItem>
                        <SelectItem value="detractor">Detractors</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                      <SelectTrigger className="w-[120px] h-8 text-sm">
                        <SelectValue placeholder="Segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Segments</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                        <SelectItem value="SMB">SMB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                          Account {sortColumn === 'name' && (sortDirection === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => handleSort('score')}>
                          Score {sortColumn === 'score' && (sortDirection === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                        </TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50 text-right" onClick={() => handleSort('arr')}>
                          ARR {sortColumn === 'arr' && (sortDirection === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('segment')}>
                          Segment {sortColumn === 'segment' && (sortDirection === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('owner')}>
                          Owner {sortColumn === 'owner' && (sortDirection === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('renewalDate')}>
                          Renewal {sortColumn === 'renewalDate' && (sortDirection === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                        </TableHead>
                        <TableHead className="text-center">Followup</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map(account => (
                        <TableRow 
                          key={account.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleAccountClick(account)}
                        >
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={getCategoryBadge(account.category)}>
                              {account.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {account.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500 inline" />}
                            {account.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500 inline" />}
                            {account.trend === 'flat' && <Minus className="h-4 w-4 text-muted-foreground inline" />}
                          </TableCell>
                          <TableCell className="text-right">${(account.arr / 1000).toFixed(0)}K</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className="text-xs border"
                              style={{ 
                                backgroundColor: brandConfig.primaryColor,
                                color: getContrastColor(brandConfig.primaryColor),
                                borderColor: `${brandConfig.primaryColor}80`
                              }}
                            >
                              {account.segment}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{account.owner}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(account.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-center">
                            {account.followupRequired ? (
                              account.followupCompleted ? (
                                <Check className="h-4 w-4 text-green-500 inline" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500 inline" />
                              )
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="configure" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configure Demo Data</h2>
              <Button variant="outline" size="sm" onClick={handleResetData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>

            {/* Accounts Grid */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Accounts ({accounts.length})</CardTitle>
                  <Button size="sm" onClick={handleAddAccount}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead className="text-center w-[80px]">Score</TableHead>
                        <TableHead className="text-right w-[100px]">ARR</TableHead>
                        <TableHead className="w-[100px]">Segment</TableHead>
                        <TableHead className="w-[120px]">Owner</TableHead>
                        <TableHead className="w-[120px]">Renewal Date</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map(account => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <Input
                              value={account.name}
                              onChange={(e) => handleUpdateAccount(account.id, { name: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={account.score}
                              onChange={(e) => handleUpdateAccount(account.id, { score: parseInt(e.target.value) || 0 })}
                              className="h-8 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={account.arr}
                              onChange={(e) => handleUpdateAccount(account.id, { arr: parseInt(e.target.value) || 0 })}
                              className="h-8 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={account.segment} 
                              onValueChange={(v) => handleUpdateAccount(account.id, { segment: v as NPSAccount['segment'] })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SMB">SMB</SelectItem>
                                <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                                <SelectItem value="Enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={account.owner} 
                              onValueChange={(v) => handleUpdateAccount(account.id, { owner: v })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {owners.map(o => (
                                  <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={account.renewalDate}
                              onChange={(e) => handleUpdateAccount(account.id, { renewalDate: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Owners Grid */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Account Owners ({owners.length})</CardTitle>
                  <Button size="sm" onClick={handleAddOwner}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Owner
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {owners.map(owner => (
                    <div key={owner.id} className="flex items-center gap-2">
                      <Input
                        value={owner.name}
                        onChange={(e) => handleUpdateOwner(owner.id, e.target.value)}
                        className="h-8"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Import/Export Reference - accordion style */}
            <Collapsible open={showCsvReference} onOpenChange={setShowCsvReference}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Import/Export Reference</CardTitle>
                      {showCsvReference ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect to your NPS system (Delighted, Medallia, Qualtrics, etc.) or import from CSV with these fields:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Account Fields</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">account_name</li>
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">score</li>
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded text-amber-600 font-medium">previous_score</li>
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">arr</li>
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">segment</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Context Fields</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">owner</li>
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">renewal_date</li>
                          <li className="font-mono text-xs bg-muted px-2 py-1 rounded">feedback</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-4">
                      Include <span className="text-amber-600 font-medium">previous_score</span> to enable trend tracking and identify declining accounts.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Account Detail Sheet */}
      <Sheet open={showAccountSheet} onOpenChange={setShowAccountSheet}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedAccount && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedAccount.name}</SheetTitle>
                <SheetDescription>
                  {selectedAccount.segment} • ${(selectedAccount.arr / 1000).toFixed(0)}K ARR
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Score Card */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="text-sm text-muted-foreground">NPS Score</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-3xl font-bold ${
                        selectedAccount.category === 'promoter' ? 'text-green-600' :
                        selectedAccount.category === 'passive' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedAccount.score}
                      </span>
                      {selectedAccount.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {selectedAccount.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
                      {selectedAccount.trend === 'flat' && <Minus className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                  <Badge className={getCategoryBadge(selectedAccount.category)}>
                    {selectedAccount.category.charAt(0).toUpperCase() + selectedAccount.category.slice(1)}
                  </Badge>
                </div>
                
                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium">{selectedAccount.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renewal Date</span>
                    <span className="font-medium">
                      {new Date(selectedAccount.renewalDate).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Date</span>
                    <span className="font-medium">
                      {new Date(selectedAccount.responseDate).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}
                    </span>
                  </div>
                  {selectedAccount.previousScore && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous Score</span>
                      <span className="font-medium">{selectedAccount.previousScore}</span>
                    </div>
                  )}
                  {selectedAccount.surveyType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Survey Type</span>
                      <span className="font-medium capitalize">{selectedAccount.surveyType}</span>
                    </div>
                  )}
                  {selectedAccount.product && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium">{selectedAccount.product}</span>
                    </div>
                  )}
                </div>
                
                {/* Feedback */}
                {selectedAccount.feedbackText && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-2">Customer Feedback</div>
                    <p className="text-sm italic">"{selectedAccount.feedbackText}"</p>
                  </div>
                )}
                
                {/* Followup Status */}
                {selectedAccount.followupRequired && (
                  <div className={`p-4 rounded-lg ${selectedAccount.followupCompleted ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <div className="flex items-center gap-2">
                      {selectedAccount.followupCompleted ? (
                        <>
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">Followup Completed</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <span className="font-medium text-amber-700">Followup Required</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      
      {/* PDF Pages (hidden) */}
      <NPSPdfPage1
        ref={pdfPage1Ref}
        accounts={accounts}
        trends={trends}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName}
        primaryColor={brandConfig.primaryColor}
        secondaryColor={brandConfig.secondaryColor}
      />
      <NPSPdfPage2
        ref={pdfPage2Ref}
        accounts={accounts}
        trends={trends}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName}
        primaryColor={brandConfig.primaryColor}
        secondaryColor={brandConfig.secondaryColor}
      />
      <NPSPdfPage3
        ref={pdfPage3Ref}
        accounts={accounts}
        trends={trends}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName}
        primaryColor={brandConfig.primaryColor}
        secondaryColor={brandConfig.secondaryColor}
      />
      
      {/* Onboarding Tooltip */}
      {isOnboardingActive && currentStepData && (
        <OnboardingTooltip
          step={currentStepData}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          isActive={isOnboardingActive}
        />
      )}
      
      {/* Like What You See Banner */}
      <LikeWhatYouSeeBanner
        state={bannerState}
        onContact={() => setShowContactDialog(true)}
        onMinimize={() => setBannerState('minimized')}
        onExpand={() => setBannerState('expanded')}
        companyName={brandConfig.companyName}
      />
      
      {/* Contact Dialog */}
      <ContactDialog
        open={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        brandConfig={brandConfig}
        toolInterest="nps-tracker"
      />
    </div>
  );
}
