import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { 
  X, TrendingUp, TrendingDown, Minus, Users, AlertTriangle, 
  CheckCircle, Clock, BarChart3, MessageSquare, Target, 
  Filter, Upload, RefreshCw, ChevronRight, Calendar, DollarSign,
  User, Building2, ClipboardList, Search, MoreHorizontal, Bell,
  Download, FileSpreadsheet, PieChart, ArrowLeft, FileUp, Info, Settings,
  FileDown, Database, CalendarClock
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
import { useToast } from '@/hooks/use-toast';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  NPSHubConfig, 
  NPS_DEFAULTS, 
  shouldShowView, 
  shouldShowAttribute,
  shouldFlagAsRisk,
  getFollowupSlaDays 
} from '@/lib/npsDiscoveryTransform';
import { BrandConfig } from '@/components/templates/TemplateBrandingBar';
import { format, differenceInDays, addDays, subDays } from 'date-fns';

interface NPSAccountHubProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
  discoveryData?: NPSHubConfig;
  onEditDiscovery?: () => void;
  clientId?: string;
  sessionId?: string;
}

interface AccountNPSData {
  id: string;
  accountId: string;
  accountName: string;
  score: number;
  previousScore?: number;
  category: 'promoter' | 'passive' | 'detractor';
  trend: 'up' | 'flat' | 'down';
  responseDate: string;
  feedbackText?: string;
  contactName?: string;
  arr?: number;
  segment?: string;
  renewalDate?: string;
  accountOwner?: string;
  lifecycleStage?: string;
  product?: string;
  isFlagged: boolean;
  followupRequired: boolean;
  followupOwner?: string;
  followupDueDate?: string;
  followupCompletedAt?: string;
  recoveryStatus?: 'pending' | 'in_progress' | 'recovered' | 'not_recovered';
  sourceUrl?: string;
}

// Dashboard chart colors
const CHART_COLORS = {
  promoter: '#22c55e',
  passive: '#f59e0b',
  detractor: '#ef4444',
};

export function NPSAccountHub({
  onClose,
  initialBrandConfig,
  discoveryData,
  onEditDiscovery,
  clientId,
  sessionId,
}: NPSAccountHubProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const config = { ...NPS_DEFAULTS, ...discoveryData };
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountNPSData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [accounts, setAccounts] = useState<AccountNPSData[]>([]);
  const [allHistoricalResponses, setAllHistoricalResponses] = useState<any[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPreview, setImportPreview] = useState<AccountNPSData[]>([]);
  const [dashboardFilter, setDashboardFilter] = useState<{ type: string; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingMockData, setIsLoadingMockData] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load historical data from database on mount
  useEffect(() => {
    if (!clientId) return;
    
    const loadHistoricalData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('nps_responses')
          .select('*')
          .eq('client_id', clientId)
          .order('response_date', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAllHistoricalResponses(data);
          
          // Get the latest response for each account (most recent score is the "current" one)
          const latestByAccount = new Map<string, any>();
          const previousByAccount = new Map<string, number>();
          
          data.forEach(response => {
            const existing = latestByAccount.get(response.account_id);
            if (!existing) {
              latestByAccount.set(response.account_id, response);
            } else {
              // If this is older, it could be the previous score
              if (!previousByAccount.has(response.account_id)) {
                previousByAccount.set(response.account_id, response.score);
              }
            }
          });
          
          // Transform database records to AccountNPSData
          const accountsData: AccountNPSData[] = Array.from(latestByAccount.values()).map(r => {
            const previousScore = previousByAccount.get(r.account_id);
            const trend = previousScore !== undefined 
              ? (r.score > previousScore ? 'up' : r.score < previousScore ? 'down' : 'flat')
              : 'flat';
            
            return {
              id: r.id,
              accountId: r.account_id,
              accountName: r.account_name,
              score: r.score,
              previousScore,
              category: r.category as 'promoter' | 'passive' | 'detractor',
              trend: trend as 'up' | 'flat' | 'down',
              responseDate: r.response_date,
              feedbackText: r.feedback_text,
              contactName: r.contact_name,
              arr: r.arr,
              segment: r.segment,
              renewalDate: r.renewal_date,
              accountOwner: r.account_owner,
              lifecycleStage: r.lifecycle_stage,
              product: r.product,
              isFlagged: r.is_flagged || false,
              followupRequired: r.followup_required || false,
              followupOwner: r.followup_owner,
              followupDueDate: r.followup_due_date,
              followupCompletedAt: r.followup_completed_at,
              recoveryStatus: r.recovery_status as any,
            };
          });
          
          setAccounts(accountsData);
          setLastSyncTime(new Date());
        }
      } catch (err) {
        console.error('Error loading NPS data:', err);
        toast({
          title: 'Error loading data',
          description: 'Could not load historical NPS data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistoricalData();
  }, [clientId, toast]);

  // Calculate trend data from historical responses (aggregated by month)
  const trendData = useMemo(() => {
    if (allHistoricalResponses.length === 0) {
      return [
        { month: 'Aug', nps: 32 },
        { month: 'Sep', nps: 35 },
        { month: 'Oct', nps: 38 },
        { month: 'Nov', nps: 42 },
        { month: 'Dec', nps: 40 },
        { month: 'Jan', nps: 45 },
      ];
    }
    
    // Group responses by month and calculate NPS for each month
    const monthlyData: Record<string, { promoters: number; detractors: number; total: number }> = {};
    
    allHistoricalResponses.forEach(r => {
      const date = new Date(r.response_date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { promoters: 0, detractors: 0, total: 0, label: monthLabel } as any;
      }
      
      monthlyData[monthKey].total++;
      if (r.category === 'promoter') monthlyData[monthKey].promoters++;
      if (r.category === 'detractor') monthlyData[monthKey].detractors++;
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([key, data]) => ({
        month: format(new Date(key + '-01'), 'MMM'),
        nps: data.total > 0 
          ? Math.round(((data.promoters - data.detractors) / data.total) * 100) 
          : 0,
        responses: data.total,
      }));
  }, [allHistoricalResponses]);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    if (accounts.length === 0) {
      return { atRisk: 0, pendingFollowups: 0, overdueFollowups: 0, renewalAtRisk: 0, arrAtRisk: 0, npsScore: 0, promoters: 0, passives: 0, detractors: 0 };
    }
    
    const atRisk = accounts.filter(a => a.isFlagged).length;
    const pendingFollowups = accounts.filter(a => a.followupRequired && !a.followupCompletedAt).length;
    const overdueFollowups = accounts.filter(a => {
      if (!a.followupRequired || a.followupCompletedAt || !a.followupDueDate) return false;
      return new Date(a.followupDueDate) < new Date();
    }).length;
    const renewalAtRisk = accounts.filter(a => {
      if (!a.renewalDate) return false;
      const daysToRenewal = differenceInDays(new Date(a.renewalDate), new Date());
      return a.category === 'detractor' && daysToRenewal <= 90;
    }).length;
    const arrAtRisk = accounts
      .filter(a => a.isFlagged && a.arr)
      .reduce((sum, a) => sum + (a.arr || 0), 0);
    
    const promoters = accounts.filter(a => a.category === 'promoter').length;
    const passives = accounts.filter(a => a.category === 'passive').length;
    const detractors = accounts.filter(a => a.category === 'detractor').length;
    const npsScore = accounts.length > 0 
      ? Math.round(((promoters - detractors) / accounts.length) * 100)
      : 0;
    
    return { atRisk, pendingFollowups, overdueFollowups, renewalAtRisk, arrAtRisk, npsScore, promoters, passives, detractors };
  }, [accounts]);
  
  // Distribution data for pie chart
  const distributionData = useMemo(() => [
    { name: 'Promoters', value: metrics.promoters, color: CHART_COLORS.promoter },
    { name: 'Passives', value: metrics.passives, color: CHART_COLORS.passive },
    { name: 'Detractors', value: metrics.detractors, color: CHART_COLORS.detractor },
  ], [metrics]);
  
  // Segment data for bar chart
  const segmentData = useMemo(() => {
    if (accounts.length === 0) return [];
    
    const segments: Record<string, { total: number; sum: number }> = {};
    accounts.forEach(a => {
      const seg = a.segment || 'Unknown';
      if (!segments[seg]) segments[seg] = { total: 0, sum: 0 };
      segments[seg].total++;
      segments[seg].sum += a.score;
    });
    
    return Object.entries(segments).map(([name, data]) => ({
      name,
      avgScore: Math.round((data.sum / data.total) * 10) / 10,
      count: data.total,
    }));
  }, [accounts]);
  
  // Owner data for bar chart
  const ownerData = useMemo(() => {
    if (accounts.length === 0) return [];
    
    const owners: Record<string, { total: number; sum: number; arr: number }> = {};
    accounts.forEach(a => {
      const owner = a.accountOwner || 'Unassigned';
      if (!owners[owner]) owners[owner] = { total: 0, sum: 0, arr: 0 };
      owners[owner].total++;
      owners[owner].sum += a.score;
      owners[owner].arr += a.arr || 0;
    });
    
    return Object.entries(owners)
      .map(([name, data]) => ({
        name,
        avgScore: Math.round((data.sum / data.total) * 10) / 10,
        count: data.total,
        arr: data.arr,
      }))
      .sort((a, b) => a.avgScore - b.avgScore);
  }, [accounts]);
  
  // Filter accounts based on active tab, search, and dashboard filter
  const filteredAccounts = useMemo(() => {
    let filtered = accounts;
    
    // Apply dashboard filter first
    if (dashboardFilter) {
      switch (dashboardFilter.type) {
        case 'category':
          filtered = filtered.filter(a => a.category === dashboardFilter.value);
          break;
        case 'segment':
          filtered = filtered.filter(a => (a.segment || 'Unknown') === dashboardFilter.value);
          break;
        case 'owner':
          filtered = filtered.filter(a => (a.accountOwner || 'Unassigned') === dashboardFilter.value);
          break;
      }
    }
    
    // Filter by tab (when not on dashboard)
    if (activeTab !== 'dashboard') {
      switch (activeTab) {
        case 'at-risk':
          filtered = filtered.filter(a => a.isFlagged);
          break;
        case 'detractors':
          filtered = filtered.filter(a => a.category === 'detractor');
          break;
        case 'declining':
          filtered = filtered.filter(a => a.trend === 'down');
          break;
        case 'renewals':
          filtered = filtered.filter(a => {
            if (!a.renewalDate) return false;
            const daysToRenewal = differenceInDays(new Date(a.renewalDate), new Date());
            return a.category !== 'promoter' && daysToRenewal <= 90;
          });
          break;
        case 'promoters':
          filtered = filtered.filter(a => a.category === 'promoter');
          break;
      }
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.accountName.toLowerCase().includes(query) ||
        a.accountOwner?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activeTab, searchQuery, accounts, dashboardFilter]);
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'promoter': 
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Promoter</Badge>;
      case 'passive': 
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Passive</Badge>;
      case 'detractor': 
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Detractor</Badge>;
      default:
        return null;
    }
  };
  
  const getRecoveryBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-blue-600">In Progress</Badge>;
      case 'recovered':
        return <Badge variant="outline" className="text-green-600">Recovered</Badge>;
      case 'not_recovered':
        return <Badge variant="outline" className="text-red-600">Not Recovered</Badge>;
      default:
        return null;
    }
  };
  
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getDaysUntilRenewal = (renewalDate?: string) => {
    if (!renewalDate) return null;
    const days = differenceInDays(new Date(renewalDate), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };
  
  // Generate CSV template based on config
  const generateCSVTemplate = useCallback(() => {
    const columns = ['account_id', 'account_name', 'score', 'response_date', 'feedback_text', 'contact_name'];
    
    // Add optional columns based on visible attributes
    if (config.visibleAccountAttributes?.includes('ARR/contract value')) columns.push('arr');
    if (config.visibleAccountAttributes?.includes('Renewal date')) columns.push('renewal_date');
    if (config.visibleAccountAttributes?.includes('Account owner')) columns.push('account_owner');
    if (config.visibleAccountAttributes?.includes('Segment/tier')) columns.push('segment');
    if (config.visibleAccountAttributes?.includes('Lifecycle stage')) columns.push('lifecycle_stage');
    if (config.visibleAccountAttributes?.includes('Product')) columns.push('product');
    
    // Generate example rows
    const exampleRows = [
      {
        account_id: 'ACC-001',
        account_name: 'Acme Corporation',
        score: '9',
        response_date: format(new Date(), 'yyyy-MM-dd'),
        feedback_text: 'Great product, really helped our team productivity!',
        contact_name: 'John Smith',
        arr: '150000',
        renewal_date: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
        account_owner: 'Sarah Johnson',
        segment: 'Enterprise',
        lifecycle_stage: 'Mature',
        product: 'Pro Plan',
      },
      {
        account_id: 'ACC-002',
        account_name: 'TechStart Inc',
        score: '5',
        response_date: format(new Date(), 'yyyy-MM-dd'),
        feedback_text: 'Support response times could be better',
        contact_name: 'Emily Chen',
        arr: '45000',
        renewal_date: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
        account_owner: 'Mike Brown',
        segment: 'Mid-Market',
        lifecycle_stage: 'Growth',
        product: 'Standard Plan',
      },
      {
        account_id: 'ACC-003',
        account_name: 'Global Industries',
        score: '10',
        response_date: format(new Date(), 'yyyy-MM-dd'),
        feedback_text: 'Absolutely love it! Would recommend to anyone.',
        contact_name: 'Robert Miller',
        arr: '200000',
        renewal_date: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
        account_owner: 'Sarah Johnson',
        segment: 'Enterprise',
        lifecycle_stage: 'Champion',
        product: 'Enterprise Plan',
      },
    ];
    
    // Build CSV content
    const header = columns.join(',');
    const rows = exampleRows.map(row => 
      columns.map(col => {
        const value = row[col as keyof typeof row] || '';
        // Escape values with commas or quotes
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [header, ...rows].join('\n');
  }, [config]);
  
  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nps_import_template_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Template downloaded',
      description: 'Fill in your NPS data and use Import Data to upload.',
    });
  };
  
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast({ title: 'Invalid file', description: 'CSV must have headers and at least one data row', variant: 'destructive' });
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const dataRows = lines.slice(1);
      
      const parsed: AccountNPSData[] = dataRows.map((line, idx) => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        
        const score = parseInt(row.score) || 0;
        const category: 'promoter' | 'passive' | 'detractor' = 
          score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';
        
        return {
          id: `imported-${idx}`,
          accountId: row.account_id || `ACC-${idx + 1}`,
          accountName: row.account_name || 'Unknown',
          score,
          category,
          trend: 'flat' as const,
          responseDate: row.response_date || format(new Date(), 'yyyy-MM-dd'),
          feedbackText: row.feedback_text,
          contactName: row.contact_name,
          arr: row.arr ? parseInt(row.arr) : undefined,
          segment: row.segment,
          renewalDate: row.renewal_date,
          accountOwner: row.account_owner,
          lifecycleStage: row.lifecycle_stage,
          product: row.product,
          isFlagged: category === 'detractor',
          followupRequired: category === 'detractor',
          followupOwner: row.account_owner,
          followupDueDate: category === 'detractor' 
            ? format(addDays(new Date(), getFollowupSlaDays(config)), 'yyyy-MM-dd') 
            : undefined,
        };
      });
      
      setImportPreview(parsed);
      setShowImportDialog(true);
    };
    reader.readAsText(file);
  }, [config, toast]);

  const handleInputFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
    event.target.value = '';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  // Separate dropzone for the Import Data button
  const { 
    getRootProps: getButtonDropzoneProps, 
    getInputProps: getButtonInputProps, 
    isDragActive: isButtonDragActive 
  } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    noDragEventsBubbling: true,
  });
  
  const confirmImport = async () => {
    if (!clientId) {
      // No client ID, just use local state
      setAccounts(importPreview);
      setShowImportDialog(false);
      setImportPreview([]);
      setActiveTab('at-risk');
      toast({
        title: 'Data imported',
        description: `Successfully imported ${importPreview.length} NPS responses.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare records for database insertion
      const recordsToInsert = importPreview.map(account => ({
        client_id: clientId,
        account_id: account.accountId,
        account_name: account.accountName,
        score: account.score,
        previous_score: account.previousScore,
        category: account.category,
        trend: account.trend,
        response_date: account.responseDate,
        feedback_text: account.feedbackText,
        contact_name: account.contactName,
        arr: account.arr,
        segment: account.segment,
        renewal_date: account.renewalDate,
        account_owner: account.accountOwner,
        lifecycle_stage: account.lifecycleStage,
        product: account.product,
        is_flagged: account.isFlagged,
        followup_required: account.followupRequired,
        followup_owner: account.followupOwner,
        followup_due_date: account.followupDueDate,
        recovery_status: account.recoveryStatus,
      }));

      // Insert new responses (they accumulate over time)
      const { data: insertedData, error } = await supabase
        .from('nps_responses')
        .insert(recordsToInsert)
        .select();

      if (error) throw error;

      // Reload all data to get updated trends and accounts
      const { data: allData, error: fetchError } = await supabase
        .from('nps_responses')
        .select('*')
        .eq('client_id', clientId)
        .order('response_date', { ascending: false });

      if (fetchError) throw fetchError;

      if (allData) {
        setAllHistoricalResponses(allData);
        
        // Get the latest response for each account
        const latestByAccount = new Map<string, any>();
        const previousByAccount = new Map<string, number>();
        
        allData.forEach(response => {
          const existing = latestByAccount.get(response.account_id);
          if (!existing) {
            latestByAccount.set(response.account_id, response);
          } else {
            if (!previousByAccount.has(response.account_id)) {
              previousByAccount.set(response.account_id, response.score);
            }
          }
        });
        
        // Transform to AccountNPSData
        const accountsData: AccountNPSData[] = Array.from(latestByAccount.values()).map(r => {
          const previousScore = previousByAccount.get(r.account_id);
          const trend = previousScore !== undefined 
            ? (r.score > previousScore ? 'up' : r.score < previousScore ? 'down' : 'flat')
            : 'flat';
          
          return {
            id: r.id,
            accountId: r.account_id,
            accountName: r.account_name,
            score: r.score,
            previousScore,
            category: r.category as 'promoter' | 'passive' | 'detractor',
            trend: trend as 'up' | 'flat' | 'down',
            responseDate: r.response_date,
            feedbackText: r.feedback_text,
            contactName: r.contact_name,
            arr: r.arr,
            segment: r.segment,
            renewalDate: r.renewal_date,
            accountOwner: r.account_owner,
            lifecycleStage: r.lifecycle_stage,
            product: r.product,
            isFlagged: r.is_flagged || false,
            followupRequired: r.followup_required || false,
            followupOwner: r.followup_owner,
            followupDueDate: r.followup_due_date,
            followupCompletedAt: r.followup_completed_at,
            recoveryStatus: r.recovery_status as any,
          };
        });
        
        setAccounts(accountsData);
      }

      setShowImportDialog(false);
      setImportPreview([]);
      setActiveTab('at-risk');
      setLastSyncTime(new Date());
      
      toast({
        title: 'Data imported & saved',
        description: `Successfully imported ${importPreview.length} NPS responses. Historical data is now being tracked.`,
      });
    } catch (err) {
      console.error('Error saving NPS data:', err);
      toast({
        title: 'Import failed',
        description: 'Could not save data to database. Data loaded locally only.',
        variant: 'destructive',
      });
      // Fallback to local state
      setAccounts(prev => [...prev, ...importPreview]);
      setShowImportDialog(false);
      setImportPreview([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDrillDown = (type: string, value: string) => {
    setDashboardFilter({ type, value });
    setActiveTab('at-risk'); // Switch to list view to show filtered results
  };
  
  const clearFilter = () => {
    setDashboardFilter(null);
  };

  // Handle PDF export
  const handleExportPdf = async () => {
    if (!contentRef.current || isExporting) return;
    
    setIsExporting(true);
    toast({
      title: 'Generating PDF...',
      description: 'Please wait while we prepare your export.',
    });
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) => el.classList?.contains('no-print'),
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${initialBrandConfig.companyName || 'NPS'}-Account-Hub.pdf`);
      
      toast({
        title: 'PDF exported successfully!',
        description: 'Your file has been downloaded.',
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: 'Failed to export PDF',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Load mock data for demo purposes
  const handleLoadMockData = async () => {
    setIsLoadingMockData(true);
    
    const mockAccounts: AccountNPSData[] = [
      { id: 'mock-1', accountId: 'ACC-001', accountName: 'Acme Corporation', score: 9, previousScore: 8, category: 'promoter', trend: 'up', responseDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'), feedbackText: 'Great product! Really helped our team productivity.', contactName: 'John Smith', arr: 150000, segment: 'Enterprise', renewalDate: format(addDays(new Date(), 45), 'yyyy-MM-dd'), accountOwner: 'Sarah Johnson', lifecycleStage: 'Mature', product: 'Pro Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-2', accountId: 'ACC-002', accountName: 'TechStart Inc', score: 4, previousScore: 6, category: 'detractor', trend: 'down', responseDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'), feedbackText: 'Support response times have been disappointing lately.', contactName: 'Emily Chen', arr: 45000, segment: 'Mid-Market', renewalDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'), accountOwner: 'Mike Brown', lifecycleStage: 'Growth', product: 'Standard Plan', isFlagged: true, followupRequired: true, followupDueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'), followupOwner: 'Mike Brown', recoveryStatus: 'pending' },
      { id: 'mock-3', accountId: 'ACC-003', accountName: 'Global Industries', score: 10, previousScore: 10, category: 'promoter', trend: 'flat', responseDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'), feedbackText: 'Absolutely love it! Would recommend to anyone.', contactName: 'Robert Miller', arr: 250000, segment: 'Enterprise', renewalDate: format(addDays(new Date(), 180), 'yyyy-MM-dd'), accountOwner: 'Sarah Johnson', lifecycleStage: 'Champion', product: 'Enterprise Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-4', accountId: 'ACC-004', accountName: 'StartupHub', score: 7, previousScore: 7, category: 'passive', trend: 'flat', responseDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'), feedbackText: 'Good product but could use more features.', contactName: 'Lisa Park', arr: 25000, segment: 'SMB', renewalDate: format(addDays(new Date(), 60), 'yyyy-MM-dd'), accountOwner: 'James Wilson', lifecycleStage: 'Onboarding', product: 'Basic Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-5', accountId: 'ACC-005', accountName: 'FinanceFlow', score: 3, previousScore: 5, category: 'detractor', trend: 'down', responseDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'), feedbackText: 'Had major issues with the billing module.', contactName: 'David Lee', arr: 85000, segment: 'Mid-Market', renewalDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'), accountOwner: 'Mike Brown', lifecycleStage: 'At Risk', product: 'Pro Plan', isFlagged: true, followupRequired: true, followupDueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'), followupOwner: 'Mike Brown', recoveryStatus: 'in_progress' },
      { id: 'mock-6', accountId: 'ACC-006', accountName: 'RetailMax', score: 8, previousScore: 6, category: 'passive', trend: 'up', responseDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'), feedbackText: 'Nice improvements in the latest update.', contactName: 'Amanda Foster', arr: 120000, segment: 'Enterprise', renewalDate: format(addDays(new Date(), 90), 'yyyy-MM-dd'), accountOwner: 'Sarah Johnson', lifecycleStage: 'Mature', product: 'Enterprise Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-7', accountId: 'ACC-007', accountName: 'HealthCare Plus', score: 9, previousScore: 9, category: 'promoter', trend: 'flat', responseDate: format(subDays(new Date(), 20), 'yyyy-MM-dd'), feedbackText: 'Essential for our daily operations.', contactName: 'Dr. Karen White', arr: 180000, segment: 'Enterprise', renewalDate: format(addDays(new Date(), 120), 'yyyy-MM-dd'), accountOwner: 'James Wilson', lifecycleStage: 'Champion', product: 'Enterprise Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-8', accountId: 'ACC-008', accountName: 'EduTech Solutions', score: 5, previousScore: 7, category: 'detractor', trend: 'down', responseDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'), feedbackText: 'Pricing has become too high for our budget.', contactName: 'Prof. Mark Davis', arr: 35000, segment: 'SMB', renewalDate: format(addDays(new Date(), 25), 'yyyy-MM-dd'), accountOwner: 'James Wilson', lifecycleStage: 'At Risk', product: 'Standard Plan', isFlagged: true, followupRequired: true, followupDueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'), followupOwner: 'James Wilson', recoveryStatus: 'pending' },
      { id: 'mock-9', accountId: 'ACC-009', accountName: 'MediaWorks', score: 10, previousScore: 8, category: 'promoter', trend: 'up', responseDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'), feedbackText: 'Best in class! Our team loves it.', contactName: 'Chris Taylor', arr: 95000, segment: 'Mid-Market', renewalDate: format(addDays(new Date(), 200), 'yyyy-MM-dd'), accountOwner: 'Sarah Johnson', lifecycleStage: 'Mature', product: 'Pro Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-10', accountId: 'ACC-010', accountName: 'LogiTrans', score: 6, previousScore: 6, category: 'detractor', trend: 'flat', responseDate: format(subDays(new Date(), 12), 'yyyy-MM-dd'), feedbackText: 'Okay but not great. Missing key integrations.', contactName: 'Tom Anderson', arr: 55000, segment: 'Mid-Market', renewalDate: format(addDays(new Date(), 75), 'yyyy-MM-dd'), accountOwner: 'Mike Brown', lifecycleStage: 'Growth', product: 'Standard Plan', isFlagged: true, followupRequired: true, followupDueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'), followupOwner: 'Mike Brown', recoveryStatus: 'pending' },
      { id: 'mock-11', accountId: 'ACC-011', accountName: 'CloudNine Systems', score: 9, previousScore: 7, category: 'promoter', trend: 'up', responseDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'), feedbackText: 'Excellent customer support and product quality.', contactName: 'Nancy Green', arr: 140000, segment: 'Enterprise', renewalDate: format(addDays(new Date(), 150), 'yyyy-MM-dd'), accountOwner: 'Sarah Johnson', lifecycleStage: 'Champion', product: 'Enterprise Plan', isFlagged: false, followupRequired: false },
      { id: 'mock-12', accountId: 'ACC-012', accountName: 'FoodChain Co', score: 2, previousScore: 4, category: 'detractor', trend: 'down', responseDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'), feedbackText: 'Multiple outages this month. Very frustrated.', contactName: 'Chef Marco', arr: 75000, segment: 'Mid-Market', renewalDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'), accountOwner: 'Mike Brown', lifecycleStage: 'At Risk', product: 'Pro Plan', isFlagged: true, followupRequired: true, followupDueDate: format(new Date(), 'yyyy-MM-dd'), followupOwner: 'Mike Brown', recoveryStatus: 'in_progress' },
    ];
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setAccounts(mockAccounts);
    setAllHistoricalResponses(mockAccounts.map(a => ({
      ...a,
      client_id: clientId,
      account_id: a.accountId,
      account_name: a.accountName,
      response_date: a.responseDate,
    })));
    setLastSyncTime(new Date());
    setIsLoadingMockData(false);
    
    toast({
      title: 'Mock data loaded',
      description: `Loaded ${mockAccounts.length} sample NPS responses for demo.`,
    });
  };

  return (
    <div 
      ref={contentRef}
      className="min-h-screen w-full"
      style={{
        '--hub-primary': initialBrandConfig.primaryColor,
        '--hub-secondary': initialBrandConfig.secondaryColor,
        background: `linear-gradient(135deg, ${initialBrandConfig.backgroundColor} 0%, hsl(220, 20%, 97%) 100%)`,
      } as React.CSSProperties}
    >
      {/* Sticky Nav Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
                <X className="h-4 w-4" />
                <span className="hidden md:inline">Exit</span>
              </Button>
              <p className="text-xs text-muted-foreground hidden md:block">
                {isLoading ? 'Loading...' : (
                  <>
                    {accounts.length > 0 ? `${accounts.length} accounts` : 'No data'}
                    {allHistoricalResponses.length > 0 && ` • ${allHistoricalResponses.length} responses`}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoadMockData} 
                disabled={isLoadingMockData}
                className="gap-2"
              >
                <Database className="h-3.5 w-3.5" />
                <span className="hidden md:inline">
                  {isLoadingMockData ? 'Loading...' : 'Load Mock Data'}
                </span>
              </Button>
              {/* Edit Discovery button moved to branded header */}
            </div>
          </div>
        </div>
      </div>

      {/* Branded Header Banner */}
      <div className="px-4 md:px-8 pt-4 max-w-7xl mx-auto">
        <div 
          className="rounded-xl md:rounded-2xl p-4 md:p-6"
          style={{
            background: `linear-gradient(135deg, ${initialBrandConfig.primaryColor}, ${initialBrandConfig.secondaryColor})`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              {initialBrandConfig.logoUrl ? (
                <div className="bg-white/20 p-1.5 md:p-2 rounded-lg md:rounded-xl backdrop-blur-sm shrink-0">
                  <img src={initialBrandConfig.logoUrl} alt="Logo" className="h-6 md:h-10 w-auto object-contain" />
                </div>
              ) : (
                <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm shrink-0">
                  <BarChart3 className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-sm md:text-xl font-bold text-white flex items-center gap-1 md:gap-2">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 shrink-0 hidden md:block" />
                    <span className="truncate">{initialBrandConfig.companyName || 'Company'} NPS Tracker</span>
                  </h1>
                  {onEditDiscovery && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={onEditDiscovery} 
                      className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0 shrink-0"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Edit Discovery</span>
                    </Button>
                  )}
                </div>
                <p className="text-white/80 text-xs md:text-sm truncate">
                  Last Updated: {format(lastSyncTime, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <div 
                {...getButtonDropzoneProps()} 
                className={`relative ${isButtonDragActive ? 'ring-2 ring-white ring-offset-2 rounded-md' : ''}`}
              >
                <input {...getButtonInputProps()} />
                <Button 
                  size="sm" 
                  className={`gap-2 cursor-pointer transition-all bg-white/20 hover:bg-white/30 text-white border-white/30 ${isButtonDragActive ? 'scale-105' : ''}`}
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {isButtonDragActive ? 'Drop file' : 'Import Data'}
                  </span>
                </Button>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleExportPdf}
                disabled={isExporting}
                className="gap-1 md:gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 no-print h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <FileDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Filter indicator */}
        {dashboardFilter && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              Filtered by {dashboardFilter.type}: {dashboardFilter.value}
              <button onClick={clearFilter} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => { clearFilter(); setActiveTab('dashboard'); }}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Dashboard
            </Button>
          </div>
        )}
        
        {/* Always show the dashboard - when no data, show blank template structure */}
        <>
          {/* Key Metrics Row - shows zeros when no data */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setDashboardFilter(null); setActiveTab('at-risk'); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">At-Risk Accounts</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.atRisk}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500/20" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(metrics.arrAtRisk)} ARR at risk
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Follow-ups</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.pendingFollowups}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500/20" />
                </div>
                {metrics.overdueFollowups > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {metrics.overdueFollowups} overdue
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setDashboardFilter(null); setActiveTab('renewals'); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Renewals at Risk</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.renewalAtRisk}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500/20" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Within 90 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current NPS</p>
                    <p className="text-2xl font-bold" style={{ color: metrics.npsScore >= 0 ? '#22c55e' : '#ef4444' }}>
                      {accounts.length > 0 ? metrics.npsScore : '--'}
                    </p>
                  </div>
                  {metrics.npsScore >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500/20" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500/20" />
                  )}
                </div>
                {accounts.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+5 vs last month</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setDashboardFilter(null); setActiveTab('promoters'); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Promoters</p>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.promoters}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500/20" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready for expansion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts or owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard" className="gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="at-risk" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">At-Risk</span>
                {metrics.atRisk > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{metrics.atRisk}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="detractors" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                <span className="hidden sm:inline">Detractors</span>
              </TabsTrigger>
              <TabsTrigger value="declining" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Declining</span>
              </TabsTrigger>
              {shouldShowView('Promoters ready for expansion', config) && (
                <TabsTrigger value="promoters" className="gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Promoters</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="data-import" className="gap-2">
                <FileUp className="h-4 w-4" />
                <span className="hidden sm:inline">Data Import</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Header with Title & Description */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {activeTab === 'dashboard' && <><PieChart className="h-5 w-5" /> Dashboard</>}
                  {activeTab === 'at-risk' && <><AlertTriangle className="h-5 w-5" /> At-Risk Accounts</>}
                  {activeTab === 'detractors' && <><TrendingDown className="h-5 w-5" /> Detractors</>}
                  {activeTab === 'declining' && <><BarChart3 className="h-5 w-5" /> Declining Scores</>}
                  {activeTab === 'promoters' && <><Target className="h-5 w-5" /> Promoters</>}
                  {activeTab === 'data-import' && <><FileUp className="h-5 w-5" /> Data Import</>}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'dashboard' && 'Visual overview of NPS trends, distribution by segment, and owner performance'}
                  {activeTab === 'at-risk' && (
                    <span>
                      At-risk accounts are scores of{' '}
                      <button 
                        onClick={onEditDiscovery} 
                        className="font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        0-{config.atRiskThreshold ?? 6}
                      </button>
                      {' '}• Accounts with upcoming renewals are highlighted
                    </span>
                  )}
                  {activeTab === 'detractors' && (
                    <span>
                      All accounts with NPS scores{' '}
                      <button 
                        onClick={onEditDiscovery} 
                        className="font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        0-{config.atRiskThreshold ?? 6}
                      </button>
                      {' '}that require follow-up outreach
                    </span>
                  )}
                  {activeTab === 'declining' && 'Accounts showing a downward trend in NPS scores over time'}
                  {activeTab === 'promoters' && (
                    <span>
                      Scores{' '}
                      <button 
                        onClick={onEditDiscovery} 
                        className="font-semibold text-green-600 hover:underline cursor-pointer"
                      >
                        {config.healthyMinThreshold ?? 9}-10
                      </button>
                      {' '}— ideal candidates for case studies, referrals, and expansion
                    </span>
                  )}
                  {activeTab === 'data-import' && 'Download a CSV template and import your NPS data to populate the tracker'}
                </p>
              </div>
              {/* Edit Discovery button is in branded header */}
            </div>

            {/* Data Import Tab */}
            <TabsContent value="data-import" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Download Template Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Download CSV Template
                    </CardTitle>
                    <CardDescription>
                      Get the template file with example data based on your configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      The template includes all required columns plus optional fields based on your discovery questionnaire responses. 
                      Example rows show the expected format for each field.
                    </p>
                    <Button onClick={handleDownloadTemplate} className="w-full gap-2" variant="outline">
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>

                {/* Import Data Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Import NPS Data
                    </CardTitle>
                    <CardDescription>
                      Upload your CSV file to populate the tracker
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      {isDragActive ? (
                        <p className="text-sm font-medium text-primary">Drop your CSV file here...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium mb-1">Drag & drop your CSV file here</p>
                          <p className="text-xs text-muted-foreground">or click to browse</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>Accepts .csv files only</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Data Status */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${accounts.length > 0 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                      <span className="text-sm">
                        {accounts.length > 0 
                          ? `${accounts.length} NPS responses loaded`
                          : 'No data imported yet'
                        }
                      </span>
                    </div>
                    {accounts.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('dashboard')}
                        className="gap-2"
                      >
                        View Dashboard
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">NPS Trend</CardTitle>
                        <UITooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button type="button" className="rounded-full p-0.5 hover:bg-muted">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Shows how your overall NPS score has changed month-over-month. Upward trends indicate improving customer satisfaction.</p>
                          </TooltipContent>
                        </UITooltip>
                      </div>
                      <CardDescription>Last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="nps" 
                              stroke={initialBrandConfig.primaryColor}
                              strokeWidth={2}
                              dot={{ fill: initialBrandConfig.primaryColor }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">NPS Distribution</CardTitle>
                        <UITooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button type="button" className="rounded-full p-0.5 hover:bg-muted">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>Breakdown of responses: Promoters (9-10), Passives (7-8), and Detractors (0-6). Click any segment to see those accounts.</p>
                          </TooltipContent>
                        </UITooltip>
                      </div>
                      <CardDescription>Click a segment to drill down</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={distributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              onClick={(data) => handleDrillDown('category', data.name.toLowerCase().slice(0, -1))}
                              style={{ cursor: 'pointer' }}
                            >
                              {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }} 
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {segmentData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Average NPS by Segment</CardTitle>
                          <UITooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-0.5 hover:bg-muted">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Compare average NPS across customer segments (e.g., Enterprise, Mid-Market). Helps identify which segments need the most attention.</p>
                            </TooltipContent>
                          </UITooltip>
                        </div>
                        <CardDescription>Click a bar to filter</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={segmentData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} stroke="hsl(var(--muted-foreground))" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--background))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }} 
                              />
                              <Bar 
                                dataKey="avgScore" 
                                fill={initialBrandConfig.primaryColor}
                                radius={[0, 4, 4, 0]}
                                onClick={(data) => handleDrillDown('segment', data.name)}
                                style={{ cursor: 'pointer' }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {ownerData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Average NPS by Owner</CardTitle>
                          <UITooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <button type="button" className="rounded-full p-0.5 hover:bg-muted">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>See which account owners have the highest and lowest average NPS. Useful for coaching and identifying best practices.</p>
                            </TooltipContent>
                          </UITooltip>
                        </div>
                        <CardDescription>Click to view owner's accounts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ownerData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} stroke="hsl(var(--muted-foreground))" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--background))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }} 
                                formatter={(value: number, name: string) => [value.toFixed(1), 'Avg NPS']}
                              />
                              <Bar 
                                dataKey="avgScore" 
                                fill={initialBrandConfig.secondaryColor}
                                radius={[0, 4, 4, 0]}
                                onClick={(data) => handleDrillDown('owner', data.name)}
                                style={{ cursor: 'pointer' }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Account List for other tabs */}
              {['at-risk', 'detractors', 'declining', 'renewals', 'promoters'].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-3">
                  {filteredAccounts.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No accounts found matching your criteria.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredAccounts.map(account => (
                      <Card 
                        key={account.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold truncate">{account.accountName}</h3>
                                {getCategoryBadge(account.category)}
                                {account.isFlagged && (
                                  <Badge variant="destructive" className="gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    At Risk
                                  </Badge>
                                )}
                                {/* Renewal Warning for At-Risk tab */}
                                {activeTab === 'at-risk' && account.renewalDate && (() => {
                                  const daysToRenewal = differenceInDays(new Date(account.renewalDate), new Date());
                                  if (daysToRenewal <= 90 && daysToRenewal >= 0) {
                                    return (
                                      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                                        <CalendarClock className="h-3 w-3" />
                                        Renewal {format(new Date(account.renewalDate), 'MMM d')}
                                      </Badge>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {shouldShowAttribute('account_owner', config) && account.accountOwner && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    {account.accountOwner}
                                  </div>
                                )}
                                {shouldShowAttribute('arr', config) && account.arr && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3.5 w-3.5" />
                                    {formatCurrency(account.arr)}
                                  </div>
                                )}
                                {shouldShowAttribute('renewal_date', config) && account.renewalDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Renewal in {getDaysUntilRenewal(account.renewalDate)}
                                  </div>
                                )}
                                {shouldShowAttribute('segment', config) && account.segment && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {account.segment}
                                  </div>
                                )}
                              </div>
                              
                              {account.feedbackText && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                                  "{account.feedbackText}"
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="flex items-center gap-1">
                                  <span 
                                    className="text-2xl font-bold"
                                    style={{ 
                                      color: account.category === 'promoter' ? '#22c55e' : 
                                             account.category === 'passive' ? '#f59e0b' : '#ef4444' 
                                    }}
                                  >
                                    {account.score}
                                  </span>
                                  {getTrendIcon(account.trend)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {account.previousScore !== undefined && `was ${account.previousScore}`}
                                </p>
                              </div>
                              
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          
                          {account.followupRequired && !account.followupCompletedAt && (
                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span>
                                  Follow-up {account.followupDueDate && new Date(account.followupDueDate) < new Date() 
                                    ? <span className="text-red-600 font-medium">overdue</span>
                                    : <>due {account.followupDueDate && format(new Date(account.followupDueDate), 'MMM d')}</>
                                  }
                                </span>
                                {account.followupOwner && (
                                  <span className="text-muted-foreground">• {account.followupOwner}</span>
                                )}
                              </div>
                              <Button size="sm" variant="outline" className="gap-1" onClick={(e) => e.stopPropagation()}>
                                <CheckCircle className="h-3.5 w-3.5" />
                                Complete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      </div>

      {/* Account Detail Sheet */}
      <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedAccount && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      {selectedAccount.accountName}
                      {getCategoryBadge(selectedAccount.category)}
                    </SheetTitle>
                    <SheetDescription>
                      {selectedAccount.accountId} • Last response {format(new Date(selectedAccount.responseDate), 'MMM d, yyyy')}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* NPS Summary */}
                <div>
                  <h4 className="text-sm font-medium mb-3">NPS Summary</h4>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                            style={{ 
                              backgroundColor: selectedAccount.category === 'promoter' ? '#22c55e' : 
                                             selectedAccount.category === 'passive' ? '#f59e0b' : '#ef4444' 
                            }}
                          >
                            {selectedAccount.score}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(selectedAccount.trend)}
                              <span className="text-sm">
                                {selectedAccount.trend === 'up' ? 'Improving' : 
                                 selectedAccount.trend === 'down' ? 'Declining' : 'Stable'}
                              </span>
                            </div>
                            {selectedAccount.previousScore !== undefined && (
                              <p className="text-sm text-muted-foreground">
                                Previous score: {selectedAccount.previousScore}
                              </p>
                            )}
                          </div>
                        </div>
                        {config.trackRecovery && selectedAccount.recoveryStatus && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Recovery Status</p>
                            {getRecoveryBadge(selectedAccount.recoveryStatus)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Feedback */}
                {selectedAccount.feedbackText && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Recent Feedback</h4>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm italic">"{selectedAccount.feedbackText}"</p>
                        {selectedAccount.contactName && (
                          <p className="text-xs text-muted-foreground mt-2">
                            — {selectedAccount.contactName}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Account Context */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Account Context</h4>
                  <Card>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                      {shouldShowAttribute('account_owner', config) && (
                        <div>
                          <p className="text-xs text-muted-foreground">Account Owner</p>
                          <p className="text-sm font-medium">{selectedAccount.accountOwner || '-'}</p>
                        </div>
                      )}
                      {shouldShowAttribute('arr', config) && (
                        <div>
                          <p className="text-xs text-muted-foreground">ARR</p>
                          <p className="text-sm font-medium">{formatCurrency(selectedAccount.arr)}</p>
                        </div>
                      )}
                      {shouldShowAttribute('renewal_date', config) && (
                        <div>
                          <p className="text-xs text-muted-foreground">Renewal Date</p>
                          <p className="text-sm font-medium">
                            {selectedAccount.renewalDate 
                              ? format(new Date(selectedAccount.renewalDate), 'MMM d, yyyy')
                              : '-'
                            }
                          </p>
                        </div>
                      )}
                      {shouldShowAttribute('segment', config) && (
                        <div>
                          <p className="text-xs text-muted-foreground">Segment</p>
                          <p className="text-sm font-medium">{selectedAccount.segment || '-'}</p>
                        </div>
                      )}
                      {shouldShowAttribute('lifecycle_stage', config) && (
                        <div>
                          <p className="text-xs text-muted-foreground">Lifecycle Stage</p>
                          <p className="text-sm font-medium">{selectedAccount.lifecycleStage || '-'}</p>
                        </div>
                      )}
                      {shouldShowAttribute('product', config) && (
                        <div>
                          <p className="text-xs text-muted-foreground">Product</p>
                          <p className="text-sm font-medium">{selectedAccount.product || '-'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Follow-up Section */}
                {selectedAccount.followupRequired && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Follow-up Status</h4>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium">
                              {selectedAccount.followupCompletedAt ? 'Completed' : 'Pending Follow-up'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedAccount.followupCompletedAt 
                                ? `Completed on ${format(new Date(selectedAccount.followupCompletedAt), 'MMM d, yyyy')}`
                                : selectedAccount.followupDueDate 
                                  ? `Due ${format(new Date(selectedAccount.followupDueDate), 'MMM d, yyyy')}`
                                  : 'No due date set'
                              }
                            </p>
                          </div>
                          {!selectedAccount.followupCompletedAt && (
                            <Button size="sm" className="gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                        {selectedAccount.followupOwner && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            Assigned to {selectedAccount.followupOwner}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Follow-up Actions */}
                {selectedAccount.category === 'detractor' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Follow-up Actions</h4>
                    </div>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        {/* Display configured actions based on detractorAction setting */}
                        {(config.detractorAction === 'All of the above' || config.detractorAction === 'Create a follow-up task') && (
                          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Create follow-up task</p>
                              <p className="text-xs text-muted-foreground">
                                SLA: {config.followupSla || '2 business days'}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Create Task
                            </Button>
                          </div>
                        )}
                        
                        {(config.detractorAction === 'All of the above' || config.detractorAction === 'Notify account owner') && (
                          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Notify account owner</p>
                              <p className="text-xs text-muted-foreground">
                                Owner: {selectedAccount.accountOwner || config.followupOwner || 'Unassigned'}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Send Alert
                            </Button>
                          </div>
                        )}
                        
                        {(config.detractorAction === 'All of the above' || config.detractorAction === 'Escalate to manager') && (
                          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Escalate to manager</p>
                              <p className="text-xs text-muted-foreground">
                                High priority escalation
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Escalate
                            </Button>
                          </div>
                        )}
                        
                        {config.trackRecovery && (
                          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Track recovery</p>
                              <p className="text-xs text-muted-foreground">
                                Monitor score improvements over time
                              </p>
                            </div>
                            {selectedAccount.recoveryStatus && getRecoveryBadge(selectedAccount.recoveryStatus)}
                          </div>
                        )}
                        
                        {!config.detractorAction && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No follow-up actions configured.{' '}
                            {onEditDiscovery && (
                              <button 
                                onClick={onEditDiscovery}
                                className="text-primary hover:underline"
                              >
                                Configure in questionnaire
                              </button>
                            )}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Log Note
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Bell className="h-4 w-4" />
                      Set Reminder
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Import Preview Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the data before importing. {importPreview.length} records found.
              {allHistoricalResponses.length > 0 && (
                <span className="block mt-1 text-primary">
                  These will be added to your existing {allHistoricalResponses.length} historical responses.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-green-600 font-bold text-xl">
                    {importPreview.filter(a => a.category === 'promoter').length}
                  </p>
                  <p className="text-muted-foreground text-xs">Promoters</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-yellow-600 font-bold text-xl">
                    {importPreview.filter(a => a.category === 'passive').length}
                  </p>
                  <p className="text-muted-foreground text-xs">Passives</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-red-600 font-bold text-xl">
                    {importPreview.filter(a => a.category === 'detractor').length}
                  </p>
                  <p className="text-muted-foreground text-xs">Detractors</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Account</th>
                    <th className="px-3 py-2 text-left">Score</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.slice(0, 10).map(account => (
                    <tr key={account.id} className="border-t">
                      <td className="px-3 py-2">{account.accountName}</td>
                      <td className="px-3 py-2">{account.score}</td>
                      <td className="px-3 py-2">{getCategoryBadge(account.category)}</td>
                      <td className="px-3 py-2">{account.accountOwner || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importPreview.length > 10 && (
                <p className="text-xs text-muted-foreground p-2 bg-muted">
                  ...and {importPreview.length - 10} more records
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={confirmImport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${importPreview.length} Records`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
