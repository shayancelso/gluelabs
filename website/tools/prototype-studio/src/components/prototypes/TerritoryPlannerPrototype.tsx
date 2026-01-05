import { useState, useEffect, useMemo, useRef } from 'react';
import { Map, Users, DollarSign, Gauge, TrendingUp, AlertTriangle, Heart, Sparkles, Download, ChevronDown, ChevronUp, Plus, Minus, RefreshCw, UserPlus, UserMinus, Shuffle, Zap, Info, Check, X, Settings2, Eye, Edit3, Save, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { OnboardingStep } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { LikeWhatYouSeeBanner, BannerState } from './LikeWhatYouSeeBanner';
import { ContactDialog } from './ContactDialog';
import type { BrandConfig } from './PrototypeBrandingBar';
import louMascot from '@/assets/lou-mascot.png';
import { exportToMultiPagePdf, formatPdfNumber } from '@/lib/exportPdf';
import { PdfPage } from './pdf/PdfPage';
import { getContrastColor, isLightColor, getDarkestColor } from '@/lib/colorUtils';
import {
  DEMO_REPS,
  DEMO_ACCOUNTS,
  INDUSTRY_BENCHMARKS,
  calculateRepMetrics,
  calculateEquityScores,
  generateRecommendations,
  SAMPLE_CSV,
  Rep,
  Account,
  RepMetrics,
  EquityScore,
  Recommendation,
  IndustryBenchmark,
} from '@/lib/territoryPlannerDemoData';

interface TerritoryPlannerPrototypeProps {
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
    targetSelector: '[data-onboarding="territory-header"]',
    title: 'Welcome to Territory Planner',
    description: 'Balanced territories can improve sales performance by up to 15%. Explore how this tool helps optimize your team coverage.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="territory-header"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="team-capacity"]',
    title: 'Team Capacity Overview',
    description: 'This shows how work and revenue are distributed across the team, including capacity, whitespace, risk, and health.',
    position: 'top',
    action: () => {
      const el = document.querySelector('[data-onboarding="team-capacity"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="equity-section"]',
    title: 'Equity Analysis',
    description: 'Equity scores measure fairness of distribution across ARR, whitespace, capacity, and churn risk.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="equity-section"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="recommendations-section"]',
    title: 'Smart Recommendations',
    description: 'AI-generated suggestions to rebalance territories and improve equity and capacity.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="recommendations-section"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="projection-section"]',
    title: 'Projection Engine',
    description: 'Model future growth, churn, and hiring needs based on your inputs.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="projection-section"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="scenario-section"]',
    title: 'Scenario Planner & New Account Allocator',
    description: 'A sandbox to test reassignments, headcount changes, and routing new accounts.',
    position: 'bottom',
    action: () => {
      const el = document.querySelector('[data-onboarding="scenario-section"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
];

export function TerritoryPlannerPrototype({ onClose, initialBrandConfig }: TerritoryPlannerPrototypeProps) {
  // State
  const brandConfig = initialBrandConfig || DEFAULT_BRAND;
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [reps, setReps] = useState<Rep[]>(DEMO_REPS);
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const [accounts, setAccounts] = useState<Account[]>(DEMO_ACCOUNTS);
  const [selectedSegment, setSelectedSegment] = useState<'SMB' | 'Mid-Market' | 'Enterprise'>('Mid-Market');
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null);
  const [showRepDrawer, setShowRepDrawer] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showCsvReference, setShowCsvReference] = useState(false);
  const [showAddRepDialog, setShowAddRepDialog] = useState(false);
  const [showRemoveRepDialog, setShowRemoveRepDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('arr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isExporting, setIsExporting] = useState(false);
  
  // Configure data editing state
  const [editingRep, setEditingRep] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  
  // PDF refs
  const pdfPage1Ref = useRef<HTMLDivElement>(null);
  const pdfPage2Ref = useRef<HTMLDivElement>(null);
  const pdfPage3Ref = useRef<HTMLDivElement>(null);
  
  // Projection inputs
  const [newLogoGrowth, setNewLogoGrowth] = useState(15);
  const [expansionRate, setExpansionRate] = useState(10);
  const [churnRate, setChurnRate] = useState(8);
  const [hiringLeadTime, setHiringLeadTime] = useState(60);
  const [rampTime, setRampTime] = useState(90);
  const [targetCapacity, setTargetCapacity] = useState(85);
  
  // Scenario state
  const [scenarioReps, setScenarioReps] = useState<Rep[]>(DEMO_REPS);
  const [scenarioAccounts, setScenarioAccounts] = useState<Account[]>(DEMO_ACCOUNTS);
  const [scenarioChanges, setScenarioChanges] = useState<string[]>([]);
  
  // New account form
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountArr, setNewAccountArr] = useState('');
  const [newAccountTam, setNewAccountTam] = useState('');
  const [newAccountTerritory, setNewAccountTerritory] = useState('');
  const [newAccountSegment, setNewAccountSegment] = useState<'SMB' | 'Mid-Market' | 'Enterprise'>('Mid-Market');
  const [pendingAccounts, setPendingAccounts] = useState<Partial<Account>[]>([]);
  
  // Reassign dialog state
  const [reassignFromRep, setReassignFromRep] = useState('');
  const [reassignToRep, setReassignToRep] = useState('');
  const [reassignAccountIds, setReassignAccountIds] = useState<string[]>([]);
  
  // New rep form
  const [newRepName, setNewRepName] = useState('');
  const [newRepSegment, setNewRepSegment] = useState<'SMB' | 'Mid-Market' | 'Enterprise'>('Mid-Market');
  const [newRepTerritory, setNewRepTerritory] = useState('');
  
  // Brand colors
  const brandColors = useMemo(() => [
    brandConfig.primaryColor,
    brandConfig.secondaryColor,
    brandConfig.accentColor,
  ], [brandConfig]);
  const darkestBrandColor = useMemo(() => getDarkestColor(brandColors), [brandColors]);
  
  // Sync reps/accounts with scenario when edited in configure tab
  useEffect(() => {
    setScenarioReps(reps);
  }, [reps]);
  
  useEffect(() => {
    setScenarioAccounts(accounts);
  }, [accounts]);
  
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
    toolId: 'territory-planner',
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
  const benchmarks = INDUSTRY_BENCHMARKS;
  const currentBenchmark = benchmarks.find(b => b.segment === selectedSegment) || benchmarks[1];
  
  const repMetrics = useMemo(() => {
    return scenarioReps.map(r => calculateRepMetrics(r, scenarioAccounts, benchmarks));
  }, [scenarioReps, scenarioAccounts]);
  
  const equityScores = useMemo(() => {
    return calculateEquityScores(scenarioReps, scenarioAccounts, benchmarks);
  }, [scenarioReps, scenarioAccounts]);
  
  const recommendations = useMemo(() => {
    return generateRecommendations(scenarioReps, scenarioAccounts, benchmarks);
  }, [scenarioReps, scenarioAccounts]);
  
  // KPIs
  const totalArr = repMetrics.reduce((sum, m) => sum + m.arr, 0);
  const avgCapacity = repMetrics.length > 0 ? repMetrics.reduce((sum, m) => sum + m.capacityPercent, 0) / repMetrics.length : 0;
  const totalWhitespace = repMetrics.reduce((sum, m) => sum + m.actionableWhitespace, 0);
  const totalAtRisk = repMetrics.reduce((sum, m) => sum + m.atRiskArr, 0);
  const avgHealth = repMetrics.length > 0 ? repMetrics.reduce((sum, m) => sum + m.avgHealthScore, 0) / repMetrics.length : 0;
  
  // Projections
  const projectedArr = totalArr * (1 + (newLogoGrowth + expansionRate - churnRate) / 100);
  const projectedCapacity = (projectedArr / totalArr) * avgCapacity;
  const requiredHeadcount = Math.ceil(projectedArr / currentBenchmark.arrPerRep);
  const hiringNeed = requiredHeadcount > scenarioReps.length;
  const capacityHeadroom = Math.max(0, 100 - avgCapacity);
  
  // Sorting
  const sortedMetrics = useMemo(() => {
    const sorted = [...repMetrics].sort((a, b) => {
      const aVal = a[sortColumn as keyof RepMetrics] as number;
      const bVal = b[sortColumn as keyof RepMetrics] as number;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [repMetrics, sortColumn, sortDirection]);
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  const handleRepClick = (repId: string) => {
    const rep = scenarioReps.find(r => r.id === repId);
    if (rep) {
      setSelectedRep(rep);
      setShowRepDrawer(true);
    }
  };
  
  const handleApplyRecommendation = (rec: Recommendation) => {
    if (rec.accountIds && rec.fromRepId && rec.toRepId) {
      setScenarioAccounts(prev => prev.map(a => 
        rec.accountIds?.includes(a.id) ? { ...a, ownerId: rec.toRepId! } : a
      ));
      setScenarioChanges(prev => [...prev, rec.title]);
      toast.success('Recommendation applied to scenario');
    } else if (rec.id === 'rec-hire') {
      setShowAddRepDialog(true);
    } else {
      toast.info('Preview applied to scenario');
      setScenarioChanges(prev => [...prev, rec.title]);
    }
  };
  
  const handleResetScenario = () => {
    setScenarioReps(reps);
    setScenarioAccounts(accounts);
    setScenarioChanges([]);
    toast.success('Scenario reset to original');
  };
  
  const handleAddRep = () => {
    if (!newRepName.trim()) return;
    const newRep: Rep = {
      id: `rep-new-${Date.now()}`,
      name: newRepName,
      title: 'CSM',
      territory: newRepTerritory || 'Unassigned',
      segment: newRepSegment,
    };
    setScenarioReps(prev => [...prev, newRep]);
    setScenarioChanges(prev => [...prev, `Added team member: ${newRepName}`]);
    setShowAddRepDialog(false);
    setNewRepName('');
    toast.success('Team member added to scenario');
  };
  
  const handleRemoveRep = (repId: string) => {
    const rep = scenarioReps.find(r => r.id === repId);
    if (!rep) return;
    
    // Redistribute accounts to other reps
    const repAccounts = scenarioAccounts.filter(a => a.ownerId === repId);
    const otherReps = scenarioReps.filter(r => r.id !== repId);
    
    let updatedAccounts = [...scenarioAccounts];
    repAccounts.forEach((acc, i) => {
      const targetRep = otherReps[i % otherReps.length];
      updatedAccounts = updatedAccounts.map(a => 
        a.id === acc.id ? { ...a, ownerId: targetRep.id } : a
      );
    });
    
    setScenarioAccounts(updatedAccounts);
    setScenarioReps(prev => prev.filter(r => r.id !== repId));
    setScenarioChanges(prev => [...prev, `Removed team member: ${rep.name} (${repAccounts.length} accounts redistributed)`]);
    setShowRemoveRepDialog(false);
    toast.success('Team member removed from scenario');
  };
  
  const handleReassign = () => {
    if (!reassignFromRep || !reassignToRep || reassignAccountIds.length === 0) return;
    
    setScenarioAccounts(prev => prev.map(a => 
      reassignAccountIds.includes(a.id) ? { ...a, ownerId: reassignToRep } : a
    ));
    
    const fromRep = scenarioReps.find(r => r.id === reassignFromRep);
    const toRep = scenarioReps.find(r => r.id === reassignToRep);
    setScenarioChanges(prev => [...prev, `Reassigned ${reassignAccountIds.length} accounts from ${fromRep?.name} to ${toRep?.name}`]);
    
    setShowReassignDialog(false);
    setReassignFromRep('');
    setReassignToRep('');
    setReassignAccountIds([]);
    toast.success('Accounts reassigned in scenario');
  };
  
  const handleAddPendingAccount = () => {
    if (!newAccountName.trim() || !newAccountArr) return;
    
    const account: Partial<Account> = {
      id: `pending-${Date.now()}`,
      name: newAccountName,
      currentArr: parseFloat(newAccountArr),
      internalTam: parseFloat(newAccountTam) || parseFloat(newAccountArr) * 2,
      territory: newAccountTerritory || 'Unassigned',
      segment: newAccountSegment,
      healthScore: 80,
      churnRisk: 0.1,
    };
    
    setPendingAccounts(prev => [...prev, account]);
    setNewAccountName('');
    setNewAccountArr('');
    setNewAccountTam('');
    setNewAccountTerritory('');
    toast.success('Account added to pending assignments');
  };
  
  const getRecommendedRepsForAccount = (account: Partial<Account>) => {
    const metrics = scenarioReps.map(r => ({ 
      ...calculateRepMetrics(r, scenarioAccounts, benchmarks), 
      rep: r 
    }));
    
    return metrics
      .filter(m => m.capacityPercent < 100)
      .sort((a, b) => a.capacityPercent - b.capacityPercent)
      .slice(0, 3)
      .map(m => ({
        rep: m.rep,
        reason: m.capacityPercent < 70 
          ? 'Has significant capacity headroom' 
          : m.rep.segment === account.segment 
            ? 'Matches account segment' 
            : 'Balanced workload',
        fit: m.capacityPercent < 70 ? 'excellent' : m.capacityPercent < 90 ? 'good' : 'fair',
      }));
  };
  
  const handleApplyAllPendingAccounts = () => {
    const newAccounts = pendingAccounts.map(pa => {
      const recommended = getRecommendedRepsForAccount(pa);
      const assignedRep = recommended[0]?.rep || scenarioReps[0];
      return {
        ...pa,
        id: `acc-new-${Date.now()}-${Math.random()}`,
        ownerId: assignedRep.id,
        productsOwned: ['Platform'],
        lifecycleStage: 'Onboarding',
      } as Account;
    });
    
    setScenarioAccounts(prev => [...prev, ...newAccounts]);
    setScenarioChanges(prev => [...prev, `Added ${newAccounts.length} new accounts`]);
    setPendingAccounts([]);
    setShowAddAccountDialog(false);
    toast.success('All pending accounts assigned');
  };
  
  // PDF Export
  const handleExportPdf = async () => {
    if (!pdfPage1Ref.current || !pdfPage2Ref.current || isExporting) return;
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      const pages = [pdfPage1Ref.current, pdfPage2Ref.current];
      if (pdfPage3Ref.current) pages.push(pdfPage3Ref.current);
      
      await exportToMultiPagePdf({
        toolName: 'Territory Planner',
        accountName: brandConfig.companyName || 'Analysis',
        pages,
      });
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'territory_planner_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample CSV downloaded');
  };
  
  // Configure Data handlers
  const addConfigRep = () => {
    const newRep: Rep = {
      id: `rep-${Date.now()}`,
      name: `New Rep ${reps.length + 1}`,
      title: 'CSM',
      territory: 'Unassigned',
      segment: 'Mid-Market',
    };
    setReps(prev => [...prev, newRep]);
    setEditingRep(newRep.id);
  };
  
  const updateConfigRep = (id: string, updates: Partial<Rep>) => {
    setReps(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  
  const deleteConfigRep = (id: string) => {
    setReps(prev => prev.filter(r => r.id !== id));
    // Reassign accounts to first available rep
    const remainingReps = reps.filter(r => r.id !== id);
    if (remainingReps.length > 0) {
      setAccounts(prev => prev.map(a => a.ownerId === id ? { ...a, ownerId: remainingReps[0].id } : a));
    }
  };
  
  const addConfigAccount = () => {
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      name: `New Account ${accounts.length + 1}`,
      ownerId: reps[0]?.id || '',
      currentArr: 50000,
      internalTam: 100000,
      healthScore: 75,
      churnRisk: 0.1,
      territory: 'Unassigned',
      segment: 'Mid-Market',
      productsOwned: ['Platform'],
      lifecycleStage: 'Onboarding',
    };
    setAccounts(prev => [...prev, newAccount]);
    setEditingAccount(newAccount.id);
  };
  
  const updateConfigAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  
  const deleteConfigAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };
  
  const getEquityColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };
  
  const getEquityBg = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-500/10 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'bg-red-500/10 border-red-500/20';
    }
  };
  
  const getHealthStatus = (metrics: RepMetrics) => {
    if (metrics.capacityPercent > 110 || metrics.atRiskArr > 400000) return 'critical';
    if (metrics.capacityPercent > 95 || metrics.atRiskArr > 200000 || metrics.avgHealthScore < 70) return 'warning';
    return 'good';
  };

  // PDF summary
  const pdfSummary = useMemo(() => {
    return `This territory analysis evaluates ${scenarioReps.length} team members managing ${formatPdfNumber(totalArr)} in ARR across ${scenarioAccounts.length} accounts. Current average capacity is ${Math.round(avgCapacity)}% with ${formatPdfNumber(totalWhitespace)} in expansion opportunities. ${hiringNeed ? `Hiring ${requiredHeadcount - scenarioReps.length} additional team member(s) is recommended to maintain target capacity.` : 'Current team size is adequate for projected growth.'}`;
  }, [scenarioReps.length, totalArr, scenarioAccounts.length, avgCapacity, totalWhitespace, hiringNeed, requiredHeadcount]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header with gradient branding */}
        <div className="container max-w-7xl mx-auto px-4 pt-6">
          <div 
            data-onboarding="territory-header"
            className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
              <div className="flex items-center gap-3 md:gap-4">
                {brandConfig.logoUrl && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <img src={brandConfig.logoUrl} alt="Logo" className="h-8 md:h-10 object-contain max-w-[120px]" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 
                    className="text-lg md:text-2xl font-bold flex items-center gap-2"
                    style={{ color: getContrastColor(brandConfig.primaryColor) }}
                  >
                    <Map className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                    <span className="truncate">{brandConfig.companyName} Territory Planner</span>
                  </h1>
                  <p 
                    className="text-xs md:text-sm mt-1"
                    style={{ color: `${getContrastColor(brandConfig.primaryColor)}CC` }}
                  >
                    Capacity, equity, and hiring needs analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-xs md:text-sm h-8 md:h-9"
                  style={{ color: getContrastColor(brandConfig.primaryColor) }}
                >
                  <Download className="h-4 w-4 mr-1.5 md:mr-2" />
                  <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                  <span className="md:hidden">{isExporting ? '...' : 'PDF'}</span>
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onClose} 
                  className="bg-white/20 hover:bg-white/30 border-white/30 h-8 md:h-9"
                  style={{ color: getContrastColor(brandConfig.primaryColor) }}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Close</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-6">
          {/* Tabs for Preview / Configure Data */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Territory View
              </TabsTrigger>
              <TabsTrigger value="configure" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Configure Data
              </TabsTrigger>
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-8">
              {/* KPI Summary */}
              <section>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Card 
                    className="border"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandConfig.primaryColor}15, ${brandConfig.primaryColor}08)`,
                      borderColor: `${brandConfig.primaryColor}30`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1" style={{ color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor }}>
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">Team Members</span>
                      </div>
                      <div className="text-2xl font-bold">{scenarioReps.length}</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandConfig.secondaryColor}15, ${brandConfig.secondaryColor}08)`,
                      borderColor: `${brandConfig.secondaryColor}30`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1" style={{ color: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor }}>
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Total ARR</span>
                      </div>
                      <div className="text-2xl font-bold">${(totalArr / 1000000).toFixed(2)}M</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandConfig.accentColor}15, ${brandConfig.accentColor}08)`,
                      borderColor: `${brandConfig.accentColor}30`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1" style={{ color: isLightColor(brandConfig.accentColor, 0.7) ? darkestBrandColor : brandConfig.accentColor }}>
                        <Gauge className="h-4 w-4" />
                        <span className="text-xs font-medium">Avg Capacity</span>
                      </div>
                      <div className="text-2xl font-bold">{Math.round(avgCapacity)}%</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandConfig.primaryColor}15, ${brandConfig.secondaryColor}08)`,
                      borderColor: `${brandConfig.primaryColor}30`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1" style={{ color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor }}>
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Whitespace</span>
                      </div>
                      <div className="text-2xl font-bold">${(totalWhitespace / 1000000).toFixed(2)}M</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-orange-500 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">At-Risk ARR</span>
                      </div>
                      <div className="text-2xl font-bold">${(totalAtRisk / 1000).toFixed(0)}K</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandConfig.secondaryColor}15, ${brandConfig.accentColor}08)`,
                      borderColor: `${brandConfig.secondaryColor}30`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1" style={{ color: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor }}>
                        <Heart className="h-4 w-4" />
                        <span className="text-xs font-medium">Avg Health</span>
                      </div>
                      <div className="text-2xl font-bold">{Math.round(avgHealth)}</div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Rep Table */}
              <section>
                <Card data-onboarding="team-capacity">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Capacity
                    </CardTitle>
                    <CardDescription>Click a rep to view their account details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('repId')}>Rep Name</TableHead>
                            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('accounts')}>Accounts</TableHead>
                            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('arr')}>ARR</TableHead>
                            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('capacityPercent')}>Capacity</TableHead>
                            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('actionableWhitespace')}>Whitespace</TableHead>
                            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('atRiskArr')}>At-Risk</TableHead>
                            <TableHead className="cursor-pointer text-right" onClick={() => handleSort('avgHealthScore')}>Health</TableHead>
                            <TableHead className="text-center">vs Benchmark</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedMetrics.map(m => {
                            const rep = scenarioReps.find(r => r.id === m.repId);
                            if (!rep) return null;
                            return (
                              <TableRow 
                                key={m.repId} 
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleRepClick(m.repId)}
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{rep.name}</div>
                                    <div className="text-xs text-muted-foreground">{rep.territory} · {rep.segment}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{m.accounts}</TableCell>
                                <TableCell className="text-right">${(m.arr / 1000).toFixed(0)}K</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Progress 
                                      value={Math.min(m.capacityPercent, 100)} 
                                      className="w-16 h-2"
                                      indicatorStyle={{ backgroundColor: brandConfig.primaryColor }}
                                    />
                                    <span className={m.capacityPercent > 100 ? 'text-red-500 font-medium' : ''}>{m.capacityPercent}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">${(m.actionableWhitespace / 1000).toFixed(0)}K</TableCell>
                                <TableCell className="text-right">
                                  <span className={m.atRiskArr > 300000 ? 'text-red-500 font-medium' : ''}>${(m.atRiskArr / 1000).toFixed(0)}K</span>
                                </TableCell>
                                <TableCell className="text-right">{m.avgHealthScore}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={m.vsBenchmark === 'above' ? 'destructive' : m.vsBenchmark === 'below' ? 'secondary' : 'default'}>
                                    {m.vsBenchmark === 'above' ? 'Over' : m.vsBenchmark === 'below' ? 'Under' : 'At Target'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Equity Analysis */}
              <section data-onboarding="equity-section">
                <h2 className="text-lg font-semibold mb-4">Equity Analysis</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {equityScores.map(eq => (
                    <Card key={eq.type} className={`${getEquityBg(eq.status)} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{eq.type} Equity</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{eq.explanation}</p>
                              {eq.imbalanceContributors.length > 0 && (
                                <p className="mt-1 text-xs">
                                  Imbalance drivers: {eq.imbalanceContributors.map(id => scenarioReps.find(r => r.id === id)?.name).join(', ')}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className={`text-3xl font-bold`} style={{ color: brandConfig.primaryColor }}>{eq.score}</div>
                        <Progress value={eq.score} className="mt-2 h-2" indicatorStyle={{ backgroundColor: brandConfig.primaryColor }} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Smart Recommendations */}
              <section data-onboarding="recommendations-section">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" style={{ color: isLightColor(brandConfig.accentColor, 0.7) ? darkestBrandColor : brandConfig.accentColor }} />
                      Smart Recommendations
                    </CardTitle>
                    <CardDescription>AI-powered actions to optimize your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.map(rec => (
                        <div key={rec.id} className="flex items-start justify-between p-4 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <div className="font-medium">{rec.title}</div>
                            <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>
                            <div className="flex gap-2 mt-2">
                              {rec.impactAreas.map(area => (
                                <Badge key={area} variant="outline" className="text-xs capitalize">{area}</Badge>
                              ))}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleApplyRecommendation(rec)}>
                            Apply
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Book of Business Health */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Book of Business Health</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {repMetrics.map(m => {
                    const rep = scenarioReps.find(r => r.id === m.repId);
                    const status = getHealthStatus(m);
                    if (!rep) return null;
                    return (
                      <Card key={m.repId} className={`${status === 'critical' ? 'border-red-500/50' : status === 'warning' ? 'border-yellow-500/50' : 'border-green-500/50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rep.name}</span>
                            <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'} className="text-xs">
                              {status === 'critical' ? 'At Risk' : status === 'warning' ? 'Watch' : 'Healthy'}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capacity</span>
                              <span className={m.capacityPercent > 100 ? 'text-red-500' : ''}>{m.capacityPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">At-Risk</span>
                              <span>${(m.atRiskArr / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Health</span>
                              <span>{m.avgHealthScore}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* Projection Engine */}
              <section data-onboarding="projection-section">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Projection Engine
                    </CardTitle>
                    <CardDescription>Model future growth and hiring needs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Inputs */}
                      <div className="space-y-6">
                        <h3 className="font-medium">Inputs</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>New Logo Growth (Annual)</Label>
                              <span className="text-sm font-medium">{newLogoGrowth}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                            >
                              <Slider value={[newLogoGrowth]} onValueChange={([v]) => setNewLogoGrowth(v)} min={0} max={50} step={1} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>Expansion Rate (Annual)</Label>
                              <span className="text-sm font-medium">{expansionRate}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.secondaryColor } as React.CSSProperties}
                            >
                              <Slider value={[expansionRate]} onValueChange={([v]) => setExpansionRate(v)} min={0} max={30} step={1} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>Expected Churn Rate</Label>
                              <span className="text-sm font-medium">{churnRate}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.accentColor } as React.CSSProperties}
                            >
                              <Slider value={[churnRate]} onValueChange={([v]) => setChurnRate(v)} min={0} max={25} step={1} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>Hiring Lead Time (Days)</Label>
                              <span className="text-sm font-medium">{hiringLeadTime}</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                            >
                              <Slider value={[hiringLeadTime]} onValueChange={([v]) => setHiringLeadTime(v)} min={30} max={180} step={5} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>New Hire Ramp Time (Days)</Label>
                              <span className="text-sm font-medium">{rampTime}</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.secondaryColor } as React.CSSProperties}
                            >
                              <Slider value={[rampTime]} onValueChange={([v]) => setRampTime(v)} min={30} max={180} step={5} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>Target Capacity Threshold</Label>
                              <span className="text-sm font-medium">{targetCapacity}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.accentColor } as React.CSSProperties}
                            >
                              <Slider value={[targetCapacity]} onValueChange={([v]) => setTargetCapacity(v)} min={70} max={100} step={5} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Outputs */}
                      <div className="space-y-6">
                        <h3 className="font-medium">Projections (12 Months)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Current Team Size</div>
                            <div className="text-2xl font-bold">{scenarioReps.length}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Projected ARR</div>
                            <div className="text-2xl font-bold">${(projectedArr / 1000000).toFixed(2)}M</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Current Capacity</div>
                            <div className="text-2xl font-bold">{Math.round(avgCapacity)}%</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Projected Capacity</div>
                            <div className={`text-2xl font-bold ${projectedCapacity > 100 ? 'text-red-500' : ''}`}>{Math.round(projectedCapacity)}%</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Capacity Headroom</div>
                            <div className="text-2xl font-bold">{Math.round(capacityHeadroom)}%</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Required Headcount</div>
                            <div className="text-2xl font-bold">{requiredHeadcount}</div>
                          </div>
                        </div>
                        
                        {hiringNeed && (
                          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <div className="flex items-center gap-2 text-orange-500 font-medium">
                              <AlertTriangle className="h-4 w-4" />
                              Hiring Needed
                            </div>
                            <p className="text-sm mt-1 text-muted-foreground">
                              You'll need to hire {requiredHeadcount - scenarioReps.length} additional team member{requiredHeadcount - scenarioReps.length > 1 ? 's' : ''} within the next {Math.round(12 - (hiringLeadTime + rampTime) / 30)} months to maintain target capacity.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Scenario Planner */}
              <section data-onboarding="scenario-section">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shuffle className="h-5 w-5" />
                      Scenario Planner
                    </CardTitle>
                    <CardDescription>Test reassignments and headcount changes in a sandbox</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => setShowAddRepDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowRemoveRepDialog(true)}>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Team Member
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowReassignDialog(true)}>
                        <Shuffle className="h-4 w-4 mr-2" />
                        Reassign Accounts
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowAddAccountDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Accounts
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleResetScenario}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset to Original
                      </Button>
                    </div>
                    
                    {scenarioChanges.length > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="font-medium mb-2">Scenario Changes ({scenarioChanges.length})</div>
                        <ul className="space-y-1 text-sm">
                          {scenarioChanges.map((change, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Industry Benchmarks */}
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle>Industry Benchmarks</CardTitle>
                    <CardDescription>Compare your team against industry standards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedSegment} onValueChange={(v) => setSelectedSegment(v as any)}>
                      <TabsList>
                        <TabsTrigger value="SMB">SMB</TabsTrigger>
                        <TabsTrigger value="Mid-Market">Mid-Market</TabsTrigger>
                        <TabsTrigger value="Enterprise">Enterprise</TabsTrigger>
                      </TabsList>
                      <TabsContent value={selectedSegment} className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Accounts per Rep</div>
                            <div className="text-2xl font-bold">{currentBenchmark.accountsPerRep}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">ARR per Rep</div>
                            <div className="text-2xl font-bold">${(currentBenchmark.arrPerRep / 1000000).toFixed(1)}M</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Healthy Capacity</div>
                            <div className="text-2xl font-bold">{currentBenchmark.healthyCapacityThreshold}%</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">At-Risk Threshold</div>
                            <div className="text-2xl font-bold">${(currentBenchmark.atRiskArrThreshold / 1000).toFixed(0)}K</div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </section>

            </TabsContent>

            {/* Configure Data Tab */}
            <TabsContent value="configure" className="space-y-6">
              {/* Info Banner */}
              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Demo Data Mode</p>
                    <p className="text-sm text-muted-foreground">
                      This prototype is loaded with sample data. Feel free to edit names, territories, ARR values, and team structure to match your organization. In a production tool, this would sync with your CRM via CSV upload or direct integration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Team Members */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" style={{ color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor }} />
                          Team Members
                        </CardTitle>
                        <CardDescription>Add or edit team members</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={addConfigRep}
                        style={{ 
                          backgroundColor: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor,
                          color: getContrastColor(isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-2">
                      <div className="space-y-2">
                        {reps.map(rep => (
                          <div 
                            key={rep.id} 
                            className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            {editingRep === rep.id ? (
                              <>
                                <Input
                                  value={rep.name}
                                  onChange={(e) => updateConfigRep(rep.id, { name: e.target.value })}
                                  className="flex-1 h-8"
                                  autoFocus
                                />
                                <Select value={rep.segment} onValueChange={(v) => updateConfigRep(rep.id, { segment: v as any })}>
                                  <SelectTrigger className="w-28 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SMB">SMB</SelectItem>
                                    <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={rep.territory || ''}
                                  onChange={(e) => updateConfigRep(rep.id, { territory: e.target.value })}
                                  placeholder="Territory"
                                  className="w-24 h-8"
                                />
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => setEditingRep(null)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm truncate block">{rep.name}</span>
                                  <div className="flex gap-1 mt-0.5">
                                    {rep.segment && (
                                      <Badge variant="outline" className="text-[10px]">{rep.segment}</Badge>
                                    )}
                                    {rep.territory && (
                                      <Badge variant="secondary" className="text-[10px]">{rep.territory}</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => setEditingRep(rep.id)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => deleteConfigRep(rep.id)}
                                  disabled={reps.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Accounts */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" style={{ color: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor }} />
                          Accounts
                        </CardTitle>
                        <CardDescription>Add or edit accounts</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={addConfigAccount}
                        style={{ 
                          backgroundColor: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor,
                          color: getContrastColor(isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-2">
                      <div className="space-y-2">
                        {accounts.map(account => {
                          const ownerRep = reps.find(r => r.id === account.ownerId);
                          return (
                            <div 
                              key={account.id} 
                              className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              {editingAccount === account.id ? (
                                <>
                                  <Input
                                    value={account.name}
                                    onChange={(e) => updateConfigAccount(account.id, { name: e.target.value })}
                                    className="flex-1 h-8"
                                    autoFocus
                                  />
                                  <Input
                                    type="number"
                                    value={account.currentArr}
                                    onChange={(e) => updateConfigAccount(account.id, { currentArr: parseFloat(e.target.value) || 0 })}
                                    className="w-24 h-8"
                                    placeholder="ARR"
                                  />
                                  <Select value={account.ownerId} onValueChange={(v) => updateConfigAccount(account.id, { ownerId: v })}>
                                    <SelectTrigger className="w-28 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {reps.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8"
                                    onClick={() => setEditingAccount(null)}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-sm truncate block">{account.name}</span>
                                    <div className="flex gap-1 mt-0.5 flex-wrap">
                                      <Badge variant="outline" className="text-[10px]">${(account.currentArr / 1000).toFixed(0)}K</Badge>
                                      {ownerRep && (
                                        <Badge variant="secondary" className="text-[10px]">{ownerRep.name}</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8"
                                    onClick={() => setEditingAccount(account.id)}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => deleteConfigAccount(account.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* CSV Reference */}
              <Collapsible open={showCsvReference} onOpenChange={setShowCsvReference}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">CSV Format Reference</CardTitle>
                        {showCsvReference ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        In production, you would upload a CSV with the following format:
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Required Columns</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">account_name</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">owner</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">current_arr</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">internal_tam</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">health_score (0-100)</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">churn_risk (0-1)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Optional Columns</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">territory</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">segment</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">products_owned</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">lifecycle_stage</li>
                          </ul>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4" onClick={handleDownloadSample}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Sample CSV
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hidden PDF Pages */}
        <div className="fixed left-[-9999px] top-0">
          {/* Page 1: Overview & Team Capacity */}
          <PdfPage
            ref={pdfPage1Ref}
            logoUrl={brandConfig.logoUrl || undefined}
            companyName={brandConfig.companyName || 'Gloo'}
            toolName="Territory Planner"
            primaryColor={brandConfig.primaryColor}
            secondaryColor={brandConfig.secondaryColor}
            pageNumber={1}
            totalPages={3}
            benefitBlurb={pdfSummary}
          >
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-6 gap-3">
                <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.primaryColor}15`, borderColor: `${brandConfig.primaryColor}30` }}>
                  <div className="text-xs font-medium" style={{ color: brandConfig.primaryColor }}>Team Members</div>
                  <div className="text-xl font-bold">{scenarioReps.length}</div>
                </div>
                <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.secondaryColor}15`, borderColor: `${brandConfig.secondaryColor}30` }}>
                  <div className="text-xs font-medium" style={{ color: brandConfig.secondaryColor }}>Total ARR</div>
                  <div className="text-xl font-bold">${(totalArr / 1000000).toFixed(2)}M</div>
                </div>
                <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.accentColor}15`, borderColor: `${brandConfig.accentColor}30` }}>
                  <div className="text-xs font-medium" style={{ color: brandConfig.accentColor }}>Avg Capacity</div>
                  <div className="text-xl font-bold">{Math.round(avgCapacity)}%</div>
                </div>
                <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.primaryColor}15`, borderColor: `${brandConfig.primaryColor}30` }}>
                  <div className="text-xs font-medium" style={{ color: brandConfig.primaryColor }}>Whitespace</div>
                  <div className="text-xl font-bold">${(totalWhitespace / 1000000).toFixed(2)}M</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-xs text-orange-600 font-medium">At-Risk ARR</div>
                  <div className="text-xl font-bold">${(totalAtRisk / 1000).toFixed(0)}K</div>
                </div>
                <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.secondaryColor}15`, borderColor: `${brandConfig.secondaryColor}30` }}>
                  <div className="text-xs font-medium" style={{ color: brandConfig.secondaryColor }}>Avg Health</div>
                  <div className="text-xl font-bold">{Math.round(avgHealth)}</div>
                </div>
              </div>

              {/* Team Capacity Table */}
              <div>
                <h3 className="font-semibold mb-2">Team Capacity Overview</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Rep Name</th>
                      <th className="text-right p-2 border">Accounts</th>
                      <th className="text-right p-2 border">ARR</th>
                      <th className="text-right p-2 border">Capacity</th>
                      <th className="text-right p-2 border">Whitespace</th>
                      <th className="text-right p-2 border">At-Risk</th>
                      <th className="text-right p-2 border">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMetrics.map(m => {
                      const rep = scenarioReps.find(r => r.id === m.repId);
                      if (!rep) return null;
                      return (
                        <tr key={m.repId}>
                          <td className="p-2 border font-medium">{rep.name}</td>
                          <td className="p-2 border text-right">{m.accounts}</td>
                          <td className="p-2 border text-right">${(m.arr / 1000).toFixed(0)}K</td>
                          <td className={`p-2 border text-right ${m.capacityPercent > 100 ? 'text-red-500' : ''}`}>{m.capacityPercent}%</td>
                          <td className="p-2 border text-right">${(m.actionableWhitespace / 1000).toFixed(0)}K</td>
                          <td className={`p-2 border text-right ${m.atRiskArr > 300000 ? 'text-red-500' : ''}`}>${(m.atRiskArr / 1000).toFixed(0)}K</td>
                          <td className="p-2 border text-right">{m.avgHealthScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </PdfPage>

          {/* Page 2: Equity & Recommendations */}
          <PdfPage
            ref={pdfPage2Ref}
            logoUrl={brandConfig.logoUrl || undefined}
            companyName={brandConfig.companyName || 'Gloo'}
            toolName="Territory Planner"
            primaryColor={brandConfig.primaryColor}
            secondaryColor={brandConfig.secondaryColor}
            pageNumber={2}
            totalPages={3}
            minimalHeader
          >
            <div className="space-y-6">
              {/* Equity Scores */}
              <div>
                <h3 className="font-semibold mb-3">Equity Analysis</h3>
                <div className="grid grid-cols-4 gap-3">
                  {equityScores.map(eq => (
                    <div key={eq.type} className={`p-3 rounded-lg border ${getEquityBg(eq.status)}`}>
                      <div className="text-sm font-medium capitalize">{eq.type} Equity</div>
                      <div className={`text-2xl font-bold ${getEquityColor(eq.status)}`}>{eq.score}</div>
                      <div className="text-xs text-muted-foreground mt-1">{eq.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold mb-3">Smart Recommendations</h3>
                <div className="space-y-2">
                  {recommendations.slice(0, 4).map(rec => (
                    <div key={rec.id} className="p-3 rounded-lg border bg-muted/30">
                      <div className="font-medium text-sm">{rec.title}</div>
                      <p className="text-xs text-muted-foreground mt-1">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book of Business Health */}
              <div>
                <h3 className="font-semibold mb-3">Book of Business Health</h3>
                <div className="grid grid-cols-5 gap-2">
                  {repMetrics.map(m => {
                    const rep = scenarioReps.find(r => r.id === m.repId);
                    const status = getHealthStatus(m);
                    if (!rep) return null;
                    return (
                      <div key={m.repId} className={`p-2 rounded-lg border ${status === 'critical' ? 'border-red-500/50 bg-red-500/5' : status === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
                        <div className="font-medium text-xs">{rep.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {m.capacityPercent}% cap · {m.avgHealthScore} health
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </PdfPage>

          {/* Page 3: Projections & Benchmarks */}
          <PdfPage
            ref={pdfPage3Ref}
            logoUrl={brandConfig.logoUrl || undefined}
            companyName={brandConfig.companyName || 'Gloo'}
            toolName="Territory Planner"
            primaryColor={brandConfig.primaryColor}
            secondaryColor={brandConfig.secondaryColor}
            pageNumber={3}
            totalPages={3}
            minimalHeader
          >
            <div className="space-y-6">
              {/* Projections */}
              <div>
                <h3 className="font-semibold mb-3">12-Month Projections</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Current State</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between"><span>Team Size:</span><span className="font-bold">{scenarioReps.length}</span></div>
                      <div className="flex justify-between"><span>Total ARR:</span><span className="font-bold">${(totalArr / 1000000).toFixed(2)}M</span></div>
                      <div className="flex justify-between"><span>Avg Capacity:</span><span className="font-bold">{Math.round(avgCapacity)}%</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Projected</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between"><span>Projected ARR:</span><span className="font-bold">${(projectedArr / 1000000).toFixed(2)}M</span></div>
                      <div className="flex justify-between"><span>Projected Capacity:</span><span className={`font-bold ${projectedCapacity > 100 ? 'text-red-500' : ''}`}>{Math.round(projectedCapacity)}%</span></div>
                      <div className="flex justify-between"><span>Required Headcount:</span><span className="font-bold">{requiredHeadcount}</span></div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${hiringNeed ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                    <div className="text-sm font-medium">{hiringNeed ? 'Hiring Recommended' : 'Team Size Adequate'}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {hiringNeed 
                        ? `Hire ${requiredHeadcount - scenarioReps.length} additional team member(s) to maintain target capacity.`
                        : 'Current team size is sufficient for projected growth.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry Benchmarks */}
              <div>
                <h3 className="font-semibold mb-3">Industry Benchmarks ({selectedSegment})</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Accounts per Rep</div>
                    <div className="text-xl font-bold">{currentBenchmark.accountsPerRep}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">ARR per Rep</div>
                    <div className="text-xl font-bold">${(currentBenchmark.arrPerRep / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Healthy Capacity</div>
                    <div className="text-xl font-bold">{currentBenchmark.healthyCapacityThreshold}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">At-Risk Threshold</div>
                    <div className="text-xl font-bold">${(currentBenchmark.atRiskArrThreshold / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>

              {/* Gloo Footer */}
              <div className="mt-auto pt-8 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <img src="/assets/gloo-logo.png" alt="Gloo" className="h-6" />
                    <span>Powered by Gloo</span>
                  </div>
                  <span>www.usegloo.com</span>
                </div>
              </div>
            </div>
          </PdfPage>
        </div>

        {/* Rep Detail Drawer */}
        <Sheet open={showRepDrawer} onOpenChange={setShowRepDrawer}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            {selectedRep && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedRep.name}</SheetTitle>
                  <SheetDescription>{selectedRep.title} · {selectedRep.territory} · {selectedRep.segment}</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                  <div className="space-y-4">
                    {scenarioAccounts.filter(a => a.ownerId === selectedRep.id).map(account => (
                      <div key={account.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{account.name}</span>
                          <Badge variant={account.churnRisk > 0.3 ? 'destructive' : account.churnRisk > 0.15 ? 'secondary' : 'default'}>
                            {account.churnRisk > 0.3 ? 'High Risk' : account.churnRisk > 0.15 ? 'Medium Risk' : 'Low Risk'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">ARR:</span> ${(account.currentArr / 1000).toFixed(0)}K
                          </div>
                          <div>
                            <span className="text-muted-foreground">Health:</span> {account.healthScore}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Whitespace:</span> ${((account.internalTam - account.currentArr) / 1000).toFixed(0)}K
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stage:</span> {account.lifecycleStage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Add Rep Dialog */}
        <Dialog open={showAddRepDialog} onOpenChange={setShowAddRepDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Add a new team member to your scenario</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={newRepName} onChange={(e) => setNewRepName(e.target.value)} placeholder="e.g. Casey Smith" />
              </div>
              <div>
                <Label>Segment</Label>
                <Select value={newRepSegment} onValueChange={(v) => setNewRepSegment(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMB">SMB</SelectItem>
                    <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Territory</Label>
                <Input value={newRepTerritory} onChange={(e) => setNewRepTerritory(e.target.value)} placeholder="e.g. West" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRepDialog(false)}>Cancel</Button>
              <Button onClick={handleAddRep}>Add Team Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Rep Dialog */}
        <Dialog open={showRemoveRepDialog} onOpenChange={setShowRemoveRepDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Team Member</DialogTitle>
              <DialogDescription>Select a team member to remove. Their accounts will be redistributed.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {scenarioReps.map(rep => {
                const metrics = repMetrics.find(m => m.repId === rep.id);
                return (
                  <div 
                    key={rep.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRemoveRep(rep.id)}
                  >
                    <div>
                      <div className="font-medium">{rep.name}</div>
                      <div className="text-sm text-muted-foreground">{metrics?.accounts || 0} accounts · ${((metrics?.arr || 0) / 1000).toFixed(0)}K ARR</div>
                    </div>
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Reassign Dialog */}
        <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Reassign Accounts</DialogTitle>
              <DialogDescription>Move accounts between team members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>From Rep</Label>
                <Select value={reassignFromRep} onValueChange={setReassignFromRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioReps.map(rep => (
                      <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {reassignFromRep && (
                <div>
                  <Label>Select Accounts</Label>
                  <div className="max-h-40 overflow-y-auto space-y-1 mt-2">
                    {scenarioAccounts.filter(a => a.ownerId === reassignFromRep).map(acc => (
                      <label key={acc.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={reassignAccountIds.includes(acc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReassignAccountIds(prev => [...prev, acc.id]);
                            } else {
                              setReassignAccountIds(prev => prev.filter(id => id !== acc.id));
                            }
                          }}
                        />
                        <span>{acc.name}</span>
                        <span className="text-sm text-muted-foreground ml-auto">${(acc.currentArr / 1000).toFixed(0)}K</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>To Rep</Label>
                <Select value={reassignToRep} onValueChange={setReassignToRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioReps.filter(r => r.id !== reassignFromRep).map(rep => (
                      <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReassignDialog(false)}>Cancel</Button>
              <Button onClick={handleReassign} disabled={!reassignFromRep || !reassignToRep || reassignAccountIds.length === 0}>
                Reassign {reassignAccountIds.length} Account{reassignAccountIds.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Account Dialog */}
        <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Account Allocator</DialogTitle>
              <DialogDescription>Add new accounts and see recommended assignments</DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Add Account</h4>
                <div>
                  <Label>Account Name</Label>
                  <Input value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <Label>ARR ($)</Label>
                  <Input type="number" value={newAccountArr} onChange={(e) => setNewAccountArr(e.target.value)} placeholder="e.g. 100000" />
                </div>
                <div>
                  <Label>Internal TAM ($)</Label>
                  <Input type="number" value={newAccountTam} onChange={(e) => setNewAccountTam(e.target.value)} placeholder="e.g. 200000" />
                </div>
                <div>
                  <Label>Territory</Label>
                  <Input value={newAccountTerritory} onChange={(e) => setNewAccountTerritory(e.target.value)} placeholder="e.g. West" />
                </div>
                <div>
                  <Label>Segment</Label>
                  <Select value={newAccountSegment} onValueChange={(v) => setNewAccountSegment(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMB">SMB</SelectItem>
                      <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddPendingAccount} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-4">Pending Assignments ({pendingAccounts.length})</h4>
                {pendingAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending accounts. Add accounts to see recommendations.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingAccounts.map((acc, i) => {
                      const recs = getRecommendedRepsForAccount(acc);
                      return (
                        <div key={i} className="p-3 rounded-lg border">
                          <div className="font-medium">{acc.name}</div>
                          <div className="text-sm text-muted-foreground">${((acc.currentArr || 0) / 1000).toFixed(0)}K ARR · {acc.segment}</div>
                          <div className="mt-2 space-y-1">
                            {recs.map((r, j) => (
                              <div key={j} className="flex items-center justify-between text-sm">
                                <span>{r.rep.name}</span>
                                <Badge variant={r.fit === 'excellent' ? 'default' : 'secondary'} className="text-xs">{r.fit}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <Button onClick={handleApplyAllPendingAccounts} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Apply All Recommendations
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <ContactDialog
          open={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          brandConfig={brandConfig}
          toolInterest="e6fef09a-ac05-4f2f-bfd7-557691d8b2ae"
        />

        {/* Onboarding */}
        {isOnboardingActive && currentStepData && (
          <OnboardingTooltip
            step={currentStepData}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            onContactRequest={() => setShowContactDialog(true)}
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

        {/* Dynamic Slider Styles with Brand Colors */}
        <style>{`
          .branded-slider [data-orientation="horizontal"] > span:first-child {
            background-color: ${brandConfig.primaryColor}20 !important;
            height: 8px !important;
          }
          .branded-slider [data-orientation="horizontal"] > span:first-child > span {
            background: linear-gradient(90deg, var(--slider-brand-color), var(--slider-brand-color)) !important;
          }
          .branded-slider [role="slider"] {
            border-color: var(--slider-brand-color) !important;
            background-color: white !important;
            border-width: 2px !important;
          }
          .branded-slider span[data-radix-slider-track] {
            background-color: ${brandConfig.primaryColor}15 !important;
          }
          .branded-slider span[data-radix-slider-range] {
            background: var(--slider-brand-color) !important;
          }
          .branded-slider span[data-radix-slider-thumb] {
            border-color: var(--slider-brand-color) !important;
            background-color: white !important;
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
