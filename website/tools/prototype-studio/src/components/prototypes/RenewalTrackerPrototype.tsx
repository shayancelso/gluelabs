import React, { useState, useMemo, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // Not used in standalone prototype
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { 
  X, TrendingUp, TrendingDown, Minus, Users, AlertTriangle, 
  CheckCircle, Clock, BarChart3, Calendar as CalendarIcon, DollarSign,
  User, Building2, ClipboardList, Search, MoreHorizontal,
  Download, FileSpreadsheet, ArrowLeft, FileUp, Settings,
  Target, RefreshCw, ChevronRight, Filter, Kanban, List,
  PieChart, CalendarClock, ArrowUpRight, AlertCircle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  RenewalTrackerConfig, 
  RENEWAL_DEFAULTS,
  getRenewalStage,
  shouldFlagAsRisk,
  getOutcomeColor,
  getRenewalMilestones,
} from '@/lib/renewalDiscoveryTransform';
import { BrandConfig } from './PrototypeBrandingBar';
import { format, differenceInDays, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface RenewalTrackerProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
  discoveryData?: RenewalTrackerConfig;
  onEditDiscovery?: () => void;
  clientId?: string;
  sessionId?: string;
}

interface RenewalAccount {
  id: string;
  accountId: string;
  accountName: string;
  arr: number;
  contractEndDate: string;
  renewalOwner?: string;
  segment?: string;
  products?: string[];
  healthScore?: number;
  riskScore: number;
  riskFactors?: string[];
  renewalStage: string;
  outcome?: string;
  outcomeDate?: string;
  expansionArr?: number;
  notes?: string;
  lastContactDate?: string;
  nextAction?: string;
  nextActionDate?: string;
  daysToRenewal: number;
}

// Chart colors
const CHART_COLORS = {
  renewed: '#22c55e',
  expanded: '#3b82f6',
  churned: '#ef4444',
  atRisk: '#f59e0b',
  healthy: '#10b981',
};

// Mock data generator
const generateMockAccounts = (config: RenewalTrackerConfig): RenewalAccount[] => {
  const segments = ['Enterprise', 'Mid-Market', 'SMB'];
  const owners = ['Sarah Johnson', 'Mike Chen', 'Lisa Park', 'James Wilson'];
  const products = ['Pro Plan', 'Enterprise Suite', 'Starter', 'Custom'];
  
  const accounts: RenewalAccount[] = [];
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const daysToRenewal = Math.floor(Math.random() * 150) - 20;
    const contractEndDate = addDays(now, daysToRenewal);
    const riskScore = Math.floor(Math.random() * 100);
    const healthScore = Math.floor(Math.random() * 100);
    
    let outcome: string | undefined;
    if (daysToRenewal < -10) {
      outcome = ['Renewed (same value)', 'Expanded (upsell)', 'Churned (full)', 'Downgraded (contraction)'][Math.floor(Math.random() * 4)];
    }
    
    accounts.push({
      id: `acc-${i}`,
      accountId: `ACC-${String(i + 1001).padStart(4, '0')}`,
      accountName: [
        'Acme Corporation', 'TechStart Inc', 'GlobalTech Solutions', 'Innovate Labs',
        'DataDriven Co', 'CloudFirst Ltd', 'Synergy Systems', 'NextGen Digital',
        'Alpha Dynamics', 'Beta Industries', 'Gamma Solutions', 'Delta Corp',
        'Epsilon Tech', 'Zeta Innovations', 'Theta Group', 'Iota Partners',
        'Kappa Holdings', 'Lambda Software', 'Mu Enterprises', 'Nu Technologies',
        'Xi Consulting', 'Omicron Inc', 'Pi Services', 'Rho Analytics', 'Sigma Labs'
      ][i],
      arr: [150000, 75000, 250000, 45000, 180000, 320000, 95000, 420000, 65000, 210000,
            135000, 88000, 175000, 290000, 55000, 125000, 195000, 380000, 72000, 160000,
            110000, 240000, 68000, 145000, 310000][i],
      contractEndDate: format(contractEndDate, 'yyyy-MM-dd'),
      renewalOwner: owners[Math.floor(Math.random() * owners.length)],
      segment: segments[Math.floor(Math.random() * segments.length)],
      products: [products[Math.floor(Math.random() * products.length)]],
      healthScore,
      riskScore,
      riskFactors: riskScore > 50 ? 
        (config.riskFactors || []).slice(0, Math.floor(Math.random() * 3) + 1) : [],
      renewalStage: getRenewalStage(daysToRenewal, config),
      outcome,
      expansionArr: Math.random() > 0.7 ? Math.floor(Math.random() * 50000) : undefined,
      daysToRenewal,
      lastContactDate: format(addDays(now, -Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
      nextAction: daysToRenewal > 0 ? ['Schedule QBR', 'Send proposal', 'Follow up call', 'Contract review'][Math.floor(Math.random() * 4)] : undefined,
      nextActionDate: daysToRenewal > 0 ? format(addDays(now, Math.floor(Math.random() * 14)), 'yyyy-MM-dd') : undefined,
    });
  }
  
  return accounts;
};

export function RenewalTrackerPrototype({
  onClose,
  initialBrandConfig,
  discoveryData,
  onEditDiscovery,
  clientId,
  sessionId,
}: RenewalTrackerProps) {
  // const navigate = useNavigate(); // Not used in standalone prototype
  const { toast } = useToast();
  const config = { ...RENEWAL_DEFAULTS, ...discoveryData };
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<RenewalAccount | null>(null);
  const [accounts, setAccounts] = useState<RenewalAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  // Generate sample data handler
  const handleGenerateSampleData = useCallback(() => {
    setAccounts(generateMockAccounts(config));
    toast({
      title: 'Sample Data Generated',
      description: '25 sample renewal accounts have been added',
    });
  }, [config, toast]);

  // Renewals by date for calendar view
  const renewalsByDate = useMemo(() => {
    const map = new Map<string, RenewalAccount[]>();
    accounts.filter(a => !a.outcome).forEach(account => {
      const dateKey = account.contractEndDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(account);
    });
    return map;
  }, [accounts]);

  // Selected day's renewals
  const selectedDayRenewals = useMemo(() => {
    if (!calendarDate) return [];
    const dateKey = format(calendarDate, 'yyyy-MM-dd');
    return renewalsByDate.get(dateKey) || [];
  }, [calendarDate, renewalsByDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (accounts.length === 0) {
      return { 
        totalARR: 0, renewingARR: 0, atRiskARR: 0, atRiskCount: 0,
        grr: 0, nrr: 0, logoRetention: 0, renewedCount: 0, churnedCount: 0,
        upcomingCount: 0, criticalCount: 0, expansionARR: 0
      };
    }
    
    const renewingAccounts = accounts.filter(a => a.daysToRenewal > 0 && a.daysToRenewal <= (config.renewalPipelineDays || 90));
    const atRiskAccounts = accounts.filter(a => shouldFlagAsRisk(a.riskScore, config) && !a.outcome);
    const completedAccounts = accounts.filter(a => a.outcome);
    const renewedAccounts = completedAccounts.filter(a => 
      a.outcome?.includes('Renewed') || a.outcome?.includes('Expanded')
    );
    const churnedAccounts = completedAccounts.filter(a => a.outcome?.includes('Churned'));
    const criticalAccounts = accounts.filter(a => a.renewalStage === 'critical' && !a.outcome);
    const expandedAccounts = accounts.filter(a => a.outcome?.includes('Expanded'));
    
    const totalARR = accounts.reduce((sum, a) => sum + a.arr, 0);
    const renewingARR = renewingAccounts.reduce((sum, a) => sum + a.arr, 0);
    const atRiskARR = atRiskAccounts.reduce((sum, a) => sum + a.arr, 0);
    const renewedARR = renewedAccounts.reduce((sum, a) => sum + a.arr, 0);
    const churnedARR = churnedAccounts.reduce((sum, a) => sum + a.arr, 0);
    const expansionARR = expandedAccounts.reduce((sum, a) => sum + (a.expansionArr || 0), 0);
    
    const completedARR = renewedARR + churnedARR;
    const grr = completedARR > 0 ? Math.round((renewedARR / (renewedARR + churnedARR)) * 100) : 100;
    const nrr = completedARR > 0 ? Math.round(((renewedARR + expansionARR) / (renewedARR + churnedARR)) * 100) : 100;
    const logoRetention = completedAccounts.length > 0 
      ? Math.round((renewedAccounts.length / completedAccounts.length) * 100) 
      : 100;
    
    return { 
      totalARR, renewingARR, atRiskARR, atRiskCount: atRiskAccounts.length,
      grr, nrr, logoRetention, 
      renewedCount: renewedAccounts.length, 
      churnedCount: churnedAccounts.length,
      upcomingCount: renewingAccounts.length,
      criticalCount: criticalAccounts.length,
      expansionARR
    };
  }, [accounts, config]);

  // Pipeline data for chart
  const pipelineData = useMemo(() => {
    const now = new Date();
    const months: Record<string, { name: string; renewing: number; atRisk: number }> = {};
    
    for (let i = 0; i < 6; i++) {
      const date = addDays(now, i * 30);
      const monthKey = format(date, 'MMM');
      months[monthKey] = { name: monthKey, renewing: 0, atRisk: 0 };
    }
    
    accounts.filter(a => !a.outcome && a.daysToRenewal > 0).forEach(account => {
      const monthKey = format(new Date(account.contractEndDate), 'MMM');
      if (months[monthKey]) {
        months[monthKey].renewing += account.arr;
        if (shouldFlagAsRisk(account.riskScore, config)) {
          months[monthKey].atRisk += account.arr;
        }
      }
    });
    
    return Object.values(months);
  }, [accounts, config]);

  // Outcome distribution
  const outcomeData = useMemo(() => {
    const completed = accounts.filter(a => a.outcome);
    const renewed = completed.filter(a => a.outcome?.includes('Renewed')).length;
    const expanded = completed.filter(a => a.outcome?.includes('Expanded')).length;
    const churned = completed.filter(a => a.outcome?.includes('Churned')).length;
    const other = completed.length - renewed - expanded - churned;
    
    return [
      { name: 'Renewed', value: renewed, color: CHART_COLORS.renewed },
      { name: 'Expanded', value: expanded, color: CHART_COLORS.expanded },
      { name: 'Churned', value: churned, color: CHART_COLORS.churned },
      { name: 'Other', value: other, color: '#94a3b8' },
    ].filter(d => d.value > 0);
  }, [accounts]);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;
    
    switch (activeTab) {
      case 'at-risk':
        filtered = filtered.filter(a => shouldFlagAsRisk(a.riskScore, config) && !a.outcome);
        break;
      case 'upcoming':
        filtered = filtered.filter(a => !a.outcome && a.daysToRenewal > 0 && a.daysToRenewal <= (config.renewalPipelineDays || 90));
        break;
      case 'completed':
        filtered = filtered.filter(a => a.outcome);
        break;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.accountName.toLowerCase().includes(query) ||
        a.renewalOwner?.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => a.daysToRenewal - b.daysToRenewal);
  }, [activeTab, searchQuery, accounts, config]);

  // Kanban columns
  const kanbanColumns = useMemo(() => {
    const activeAccounts = accounts.filter(a => !a.outcome);
    return [
      { id: 'future', title: 'Future', accounts: activeAccounts.filter(a => a.renewalStage === 'future') },
      { id: 'upcoming', title: 'Upcoming (60-90d)', accounts: activeAccounts.filter(a => a.renewalStage === 'upcoming') },
      { id: 'active', title: 'Active (30-60d)', accounts: activeAccounts.filter(a => a.renewalStage === 'active') },
      { id: 'critical', title: 'Critical (<30d)', accounts: activeAccounts.filter(a => a.renewalStage === 'critical') },
      { id: 'overdue', title: 'Overdue', accounts: activeAccounts.filter(a => a.renewalStage === 'overdue') },
    ];
  }, [accounts]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      case 'active':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Upcoming</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Overdue</Badge>;
      default:
        return <Badge variant="outline">Future</Badge>;
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">High Risk</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium Risk</Badge>;
    return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Low Risk</Badge>;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    toast({
      title: 'CSV Import',
      description: `Processing ${acceptedFiles[0]?.name}...`,
    });
    setShowImportDialog(false);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline">Exit</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">Renewal Tracker</h1>
                <p className="text-xs text-muted-foreground">Manage and forecast customer renewals</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEditDiscovery && (
                <Button variant="outline" size="sm" onClick={onEditDiscovery} className="gap-2">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Edit Discovery</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleGenerateSampleData} className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sample Data</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="gap-2">
                <FileUp className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Import</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="gap-2">
                <List className="h-4 w-4" />
                Pipeline
                {metrics.upcomingCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{metrics.upcomingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="at-risk" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                At Risk
                {metrics.atRiskCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">{metrics.atRiskCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </TabsTrigger>
            </TabsList>

            {activeTab !== 'dashboard' && activeTab !== 'calendar' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="rounded-l-none"
                  >
                    <Kanban className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {accounts.length === 0 ? (
              <Card className="py-16">
                <CardContent className="text-center">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Renewal Data Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Import your renewal accounts or generate sample data to get started with renewal tracking.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
                      <FileUp className="h-4 w-4" />
                      Import CSV
                    </Button>
                    <Button onClick={handleGenerateSampleData} className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Generate Sample Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Retention</p>
                      <p className="text-2xl font-bold">{metrics.grr}%</p>
                    </div>
                    <div className={`p-2 rounded-full ${metrics.grr >= 90 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <Target className={`h-5 w-5 ${metrics.grr >= 90 ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Retention</p>
                      <p className="text-2xl font-bold">{metrics.nrr}%</p>
                    </div>
                    <div className={`p-2 rounded-full ${metrics.nrr >= 100 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                      <TrendingUp className={`h-5 w-5 ${metrics.nrr >= 100 ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">At-Risk ARR</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.atRiskARR)}</p>
                    </div>
                    <div className="p-2 rounded-full bg-red-500/10">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metrics.atRiskCount} accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Critical Renewals</p>
                      <p className="text-2xl font-bold">{metrics.criticalCount}</p>
                    </div>
                    <div className="p-2 rounded-full bg-orange-500/10">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Renewal Pipeline by Month</CardTitle>
                  <CardDescription>ARR up for renewal in next 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipelineData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), '']}
                          contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Bar dataKey="renewing" name="Renewing ARR" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="atRisk" name="At-Risk ARR" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Renewal Outcomes</CardTitle>
                  <CardDescription>Distribution of completed renewals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={outcomeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {outcomeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Upcoming Renewals</CardTitle>
                    <CardDescription>Accounts requiring attention</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('upcoming')}>
                    View all <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accounts
                    .filter(a => !a.outcome && a.daysToRenewal > 0 && a.daysToRenewal <= 60)
                    .slice(0, 5)
                    .map(account => (
                      <div 
                        key={account.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.renewalOwner}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right w-20">
                            <p className="font-medium">{formatCurrency(account.arr)}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(account.contractEndDate), 'MMM d')}
                            </p>
                          </div>
                          <div className="w-20">{getStageBadge(account.renewalStage)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          {/* Pipeline/Upcoming Tab */}
          <TabsContent value="upcoming">
            {viewMode === 'kanban' ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {kanbanColumns.slice(1).map(column => (
                  <div key={column.id} className="flex-shrink-0 w-72">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">{column.title}</h3>
                        <Badge variant="secondary">{column.accounts.length}</Badge>
                      </div>
                      <div className="space-y-2 min-h-[200px]">
                        {column.accounts.map(account => (
                          <Card 
                            key={account.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedAccount(account)}
                          >
                            <CardContent className="p-3">
                              <p className="font-medium text-sm truncate">{account.accountName}</p>
                              <p className="text-xs text-muted-foreground">{account.renewalOwner}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-medium">{formatCurrency(account.arr)}</span>
                                {shouldFlagAsRisk(account.riskScore, config) && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredAccounts.map(account => (
                      <div 
                        key={account.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.renewalOwner}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block w-20">
                            <p className="text-sm text-muted-foreground">ARR</p>
                            <p className="font-medium">{formatCurrency(account.arr)}</p>
                          </div>
                          <div className="text-right hidden md:block w-24">
                            <p className="text-sm text-muted-foreground">Renewal Date</p>
                            <p className="font-medium">{format(new Date(account.contractEndDate), 'MMM d, yyyy')}</p>
                          </div>
                          <div className="flex items-center gap-2 w-40 justify-end">
                            {getStageBadge(account.renewalStage)}
                            {shouldFlagAsRisk(account.riskScore, config) && getRiskBadge(account.riskScore)}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="grid md:grid-cols-[350px_1fr] gap-6">
              <Card>
                <CardContent className="pt-4">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={setCalendarDate}
                    className="rounded-md border-0"
                    modifiers={{
                      hasRenewal: (date) => {
                        const dateKey = format(date, 'yyyy-MM-dd');
                        return renewalsByDate.has(dateKey);
                      },
                      hasCritical: (date) => {
                        const dateKey = format(date, 'yyyy-MM-dd');
                        const renewals = renewalsByDate.get(dateKey) || [];
                        return renewals.some(r => r.renewalStage === 'critical' || shouldFlagAsRisk(r.riskScore, config));
                      },
                    }}
                    modifiersStyles={{
                      hasRenewal: { 
                        fontWeight: 'bold',
                        backgroundColor: 'hsl(var(--primary) / 0.1)',
                      },
                      hasCritical: { 
                        fontWeight: 'bold',
                        backgroundColor: 'hsl(var(--destructive) / 0.1)',
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {calendarDate ? format(calendarDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                  </CardTitle>
                  <CardDescription>
                    {selectedDayRenewals.length} renewal{selectedDayRenewals.length !== 1 ? 's' : ''} on this day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDayRenewals.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayRenewals.map(account => (
                        <div 
                          key={account.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedAccount(account)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              shouldFlagAsRisk(account.riskScore, config) ? 'bg-red-500/10' : 'bg-primary/10'
                            }`}>
                              <Building2 className={`h-5 w-5 ${
                                shouldFlagAsRisk(account.riskScore, config) ? 'text-red-600' : 'text-primary'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{account.accountName}</p>
                              <p className="text-sm text-muted-foreground">{account.renewalOwner}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(account.arr)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {getStageBadge(account.renewalStage)}
                              {shouldFlagAsRisk(account.riskScore, config) && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No renewals on this date</p>
                      <p className="text-sm mt-1">Select a highlighted date to see renewals</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* At Risk Tab */}
          <TabsContent value="at-risk">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredAccounts.map(account => (
                    <div 
                      key={account.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{account.accountName}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {account.riskFactors?.slice(0, 2).map((factor, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block w-20">
                          <p className="text-sm text-muted-foreground">ARR at Risk</p>
                          <p className="font-medium text-red-600">{formatCurrency(account.arr)}</p>
                        </div>
                        <div className="text-right hidden md:block w-16">
                          <p className="text-sm text-muted-foreground">Risk</p>
                          <p className="font-medium">{account.riskScore}%</p>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-sm text-muted-foreground">Renewal Date</p>
                          <p className="font-medium">{format(new Date(account.contractEndDate), 'MMM d, yyyy')}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No at-risk accounts found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredAccounts.map(account => {
                    const outcomeColors = getOutcomeColor(account.outcome || '');
                    return (
                      <div 
                        key={account.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.renewalOwner}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                            <p className="text-sm text-muted-foreground">ARR</p>
                            <p className="font-medium">{formatCurrency(account.arr)}</p>
                          </div>
                          {account.expansionArr && account.expansionArr > 0 && (
                            <div className="text-right hidden md:block">
                              <p className="text-sm text-muted-foreground">Expansion</p>
                              <p className="font-medium text-green-600">+{formatCurrency(account.expansionArr)}</p>
                            </div>
                          )}
                          <Badge className={`${outcomeColors.bg} ${outcomeColors.text} ${outcomeColors.border}`}>
                            {account.outcome}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Account Detail Sheet */}
      <Sheet open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedAccount?.accountName}</SheetTitle>
            <SheetDescription>Renewal details and actions</SheetDescription>
          </SheetHeader>
          
          {selectedAccount && (
            <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">ARR</p>
                      <p className="text-xl font-bold">{formatCurrency(selectedAccount.arr)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Days to Renewal</p>
                      <p className="text-xl font-bold">{selectedAccount.daysToRenewal}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <h4 className="font-medium">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {getStageBadge(selectedAccount.renewalStage)}
                    {getRiskBadge(selectedAccount.riskScore)}
                    {selectedAccount.outcome && (
                      <Badge className={`${getOutcomeColor(selectedAccount.outcome).bg} ${getOutcomeColor(selectedAccount.outcome).text}`}>
                        {selectedAccount.outcome}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-3">
                  <h4 className="font-medium">Account Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p>{selectedAccount.renewalOwner || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Segment</p>
                      <p>{selectedAccount.segment || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contract End</p>
                      <p>{format(new Date(selectedAccount.contractEndDate), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Health Score</p>
                      <p>{selectedAccount.healthScore ?? '-'}%</p>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {selectedAccount.riskFactors && selectedAccount.riskFactors.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium text-red-600">Risk Factors</h4>
                      <div className="space-y-2">
                        {selectedAccount.riskFactors.map((factor, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Next Action */}
                {selectedAccount.nextAction && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Next Action</h4>
                      <Card className="bg-primary/5">
                        <CardContent className="pt-4">
                          <p className="font-medium">{selectedAccount.nextAction}</p>
                          {selectedAccount.nextActionDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Due: {format(new Date(selectedAccount.nextActionDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {/* Milestones */}
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Renewal Milestones</h4>
                  <div className="space-y-2">
                    {getRenewalMilestones(config).map((milestone, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i < 2 ? 'bg-green-500' : 'bg-muted'}`}>
                          {i < 2 ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>
                        <span className={`text-sm ${i < 2 ? 'text-muted-foreground line-through' : ''}`}>
                          {milestone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Renewal Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your renewal account data
            </DialogDescription>
          </DialogHeader>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>Drop the CSV file here...</p>
            ) : (
              <>
                <p className="font-medium">Drag and drop a CSV file</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
