import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Trash2,
  Info,
  Users,
  Building2,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { BrandConfig } from '@/components/templates/TemplateBrandingBar';
import { RiskAssessmentDiscoveryConfig, getCategoryWeightAdjustment } from '@/lib/riskAssessmentDiscoveryTransform';
import { CustomerSelector, Customer } from './CustomerSelector';
import { supabase } from '@/integrations/supabase/client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RiskAssessmentPrototypeProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
  discoveryData?: {
    industry?: string;
    employee_count?: string;
    responses?: Record<string, any>;
  };
  clientName?: string;
  clientId?: string;
  discoveryConfig?: RiskAssessmentDiscoveryConfig;
  onEditDiscovery?: () => void;
}

interface RiskIndicator {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  weight: number;
  description: string;
  trend: 'improving' | 'stable' | 'declining';
  actionItem?: string;
}

type ClientType = 'b2b_enterprise' | 'b2b_smb' | 'b2c';

// Risk indicators specific to B2B Enterprise clients
const B2B_ENTERPRISE_INDICATORS: RiskIndicator[] = [
  {
    id: 'contract_value_risk',
    name: 'Contract Value at Risk',
    category: 'Financial',
    currentValue: 85,
    targetValue: 100,
    weight: 20,
    description: 'Percentage of ARR with healthy renewal indicators',
    trend: 'stable',
    actionItem: 'Schedule QBR with key stakeholders',
  },
  {
    id: 'executive_engagement',
    name: 'Executive Sponsor Engagement',
    category: 'Relationship',
    currentValue: 60,
    targetValue: 100,
    weight: 15,
    description: 'Frequency and quality of executive touchpoints',
    trend: 'declining',
    actionItem: 'Request executive sponsor meeting',
  },
  {
    id: 'product_adoption',
    name: 'Product Adoption Rate',
    category: 'Adoption',
    currentValue: 72,
    targetValue: 100,
    weight: 15,
    description: 'Percentage of licensed users actively using the platform',
    trend: 'improving',
    actionItem: 'Launch internal adoption campaign',
  },
  {
    id: 'integration_health',
    name: 'Integration Health',
    category: 'Technical',
    currentValue: 90,
    targetValue: 100,
    weight: 10,
    description: 'API uptime and data sync reliability',
    trend: 'stable',
  },
  {
    id: 'support_satisfaction',
    name: 'Support Satisfaction',
    category: 'Operational',
    currentValue: 78,
    targetValue: 100,
    weight: 10,
    description: 'Average CSAT score from support interactions',
    trend: 'stable',
  },
  {
    id: 'nps_score',
    name: 'NPS Score',
    category: 'Relationship',
    currentValue: 45,
    targetValue: 100,
    weight: 10,
    description: 'Net Promoter Score from recent survey',
    trend: 'improving',
  },
  {
    id: 'feature_utilization',
    name: 'Feature Utilization',
    category: 'Adoption',
    currentValue: 55,
    targetValue: 100,
    weight: 10,
    description: 'Percentage of purchased features being used',
    trend: 'declining',
    actionItem: 'Schedule feature training session',
  },
  {
    id: 'time_to_value',
    name: 'Time to Value Achievement',
    category: 'Operational',
    currentValue: 80,
    targetValue: 100,
    weight: 10,
    description: 'Progress toward defined success milestones',
    trend: 'stable',
  },
];

// Risk indicators specific to B2B SMB clients
const B2B_SMB_INDICATORS: RiskIndicator[] = [
  {
    id: 'champion_strength',
    name: 'Champion Strength',
    category: 'Relationship',
    currentValue: 70,
    targetValue: 100,
    weight: 15,
    description: 'Presence and engagement level of an internal advocate',
    trend: 'stable',
    actionItem: 'Identify and nurture potential champions',
  },
  {
    id: 'communication_frequency',
    name: 'Communication Frequency',
    category: 'Relationship',
    currentValue: 65,
    targetValue: 100,
    weight: 10,
    description: 'Regularity of touchpoints and responsiveness to outreach',
    trend: 'declining',
    actionItem: 'Schedule recurring check-in calls',
  },
  {
    id: 'executive_sentiment',
    name: 'Executive Sentiment',
    category: 'Relationship',
    currentValue: 75,
    targetValue: 100,
    weight: 10,
    description: 'Decision-maker perception and satisfaction with partnership',
    trend: 'stable',
  },
  {
    id: 'monthly_usage',
    name: 'Monthly Active Usage',
    category: 'Adoption',
    currentValue: 75,
    targetValue: 100,
    weight: 20,
    description: 'Frequency of product usage this month',
    trend: 'stable',
  },
  {
    id: 'payment_health',
    name: 'Payment Health',
    category: 'Financial',
    currentValue: 95,
    targetValue: 100,
    weight: 15,
    description: 'Payment success rate and billing status',
    trend: 'stable',
  },
  {
    id: 'onboarding_completion',
    name: 'Onboarding Completion',
    category: 'Operational',
    currentValue: 85,
    targetValue: 100,
    weight: 10,
    description: 'Percentage of onboarding steps completed',
    trend: 'stable',
  },
  {
    id: 'support_tickets',
    name: 'Support Ticket Trend',
    category: 'Operational',
    currentValue: 70,
    targetValue: 100,
    weight: 10,
    description: 'Support ticket volume relative to baseline',
    trend: 'improving',
  },
  {
    id: 'key_feature_adoption',
    name: 'Key Feature Adoption',
    category: 'Adoption',
    currentValue: 60,
    targetValue: 100,
    weight: 10,
    description: 'Usage of core product features',
    trend: 'declining',
    actionItem: 'Send targeted feature highlight email',
  },
];

// Risk indicators specific to B2C clients
const B2C_INDICATORS: RiskIndicator[] = [
  {
    id: 'monthly_logins',
    name: 'Monthly Logins',
    category: 'Adoption',
    currentValue: 72,
    targetValue: 100,
    weight: 20,
    description: 'Login frequency and consistency over the past month',
    trend: 'stable',
    actionItem: 'Send re-engagement notification',
  },
  {
    id: 'website_visits',
    name: 'Website Visits',
    category: 'Social',
    currentValue: 65,
    targetValue: 100,
    weight: 15,
    description: 'Frequency and depth of website engagement',
    trend: 'stable',
  },
  {
    id: 'social_media_engagement',
    name: 'Social Media Engagement',
    category: 'Social',
    currentValue: 55,
    targetValue: 100,
    weight: 15,
    description: 'Likes, shares, comments, and brand mentions',
    trend: 'improving',
    actionItem: 'Launch targeted social campaign',
  },
  {
    id: 'meeting_frequency',
    name: 'Meeting Frequency',
    category: 'Social',
    currentValue: 60,
    targetValue: 100,
    weight: 10,
    description: 'Frequency of scheduled interactions and touchpoints',
    trend: 'declining',
    actionItem: 'Schedule follow-up meeting',
  },
  {
    id: 'user_engagement',
    name: 'User Engagement Score',
    category: 'Engagement',
    currentValue: 68,
    targetValue: 100,
    weight: 15,
    description: 'Composite score of sessions, time spent, and actions',
    trend: 'stable',
  },
  {
    id: 'ltv_trajectory',
    name: 'LTV Trajectory',
    category: 'Financial',
    currentValue: 82,
    targetValue: 100,
    weight: 15,
    description: 'Customer lifetime value trend vs. cohort average',
    trend: 'stable',
  },
  {
    id: 'subscription_health',
    name: 'Subscription Health',
    category: 'Financial',
    currentValue: 90,
    targetValue: 100,
    weight: 10,
    description: 'Payment success and subscription continuity',
    trend: 'stable',
  },
];

function getHealthLevel(score: number): { 
  label: string; 
  color: string; 
  bgColor: string;
  textColor: string;
} {
  if (score >= 90) return { 
    label: 'Extremely High Risk', 
    color: 'hsl(0, 80%, 30%)', 
    bgColor: 'bg-red-900',
    textColor: 'text-red-100'
  };
  if (score >= 69) return { 
    label: 'High Risk', 
    color: 'hsl(0, 70%, 50%)', 
    bgColor: 'bg-red-600',
    textColor: 'text-red-50'
  };
  if (score >= 39) return { 
    label: 'Medium Risk', 
    color: 'hsl(45, 90%, 50%)', 
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-950'
  };
  if (score >= 20) return { 
    label: 'Healthy', 
    color: 'hsl(142, 60%, 45%)', 
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-50'
  };
  return { 
    label: 'Very Healthy', 
    color: 'hsl(142, 80%, 25%)', 
    bgColor: 'bg-emerald-800',
    textColor: 'text-emerald-100'
  };
}

function TrendIcon({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

// Indicator color matches risk scale: higher value = higher risk
function getIndicatorColor(riskValue: number): string {
  if (riskValue >= 90) return 'bg-red-900';
  if (riskValue >= 69) return 'bg-red-600';
  if (riskValue >= 39) return 'bg-amber-500';
  if (riskValue >= 20) return 'bg-emerald-500';
  return 'bg-emerald-800';
}

function getIndicatorTextColor(riskValue: number): string {
  if (riskValue >= 90) return 'text-red-400';
  if (riskValue >= 69) return 'text-red-500';
  if (riskValue >= 39) return 'text-amber-500';
  if (riskValue >= 20) return 'text-emerald-500';
  return 'text-emerald-600';
}

function detectClientType(discoveryData?: RiskAssessmentPrototypeProps['discoveryData']): ClientType {
  if (!discoveryData) return 'b2b_enterprise';
  
  const industry = discoveryData.industry?.toLowerCase() || '';
  const employeeCount = discoveryData.employee_count?.toLowerCase() || '';
  
  // B2C indicators
  const b2cIndustries = ['retail', 'consumer', 'e-commerce', 'media', 'gaming', 'entertainment'];
  if (b2cIndustries.some(i => industry.includes(i))) {
    return 'b2c';
  }
  
  // Check employee count for SMB vs Enterprise
  const smallCounts = ['1-10', '11-50', '51-200', 'under', 'small'];
  if (smallCounts.some(s => employeeCount.includes(s))) {
    return 'b2b_smb';
  }
  
  return 'b2b_enterprise';
}

export function RiskAssessmentPrototype({ 
  onClose, 
  initialBrandConfig,
  discoveryData,
  clientName,
  clientId,
  discoveryConfig,
  onEditDiscovery
}: RiskAssessmentPrototypeProps) {
  // Determine client type from discovery config first, then fall back to detection
  const detectedClientType = discoveryConfig?.clientType || detectClientType(discoveryData);
  const [clientType, setClientType] = useState<ClientType>(detectedClientType);
  
  // Customer selection state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch customers for this client
  useEffect(() => {
    if (!clientId) return;
    
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const { data, error } = await supabase
          .from('client_customers')
          .select('*')
          .eq('client_id', clientId)
          .order('name');
        
        if (error) throw error;
        
        const customerList: Customer[] = (data || []).map(d => ({
          id: d.id,
          name: d.name,
          arr: d.arr || 0,
          segment: d.segment,
          account_owner: d.account_owner,
          renewal_date: d.renewal_date,
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    
    fetchCustomers();
  }, [clientId]);
  
  // Apply category weight adjustments from discovery config
  const applyWeightAdjustments = (baseIndicators: RiskIndicator[]): RiskIndicator[] => {
    if (!discoveryConfig) return baseIndicators;
    
    return baseIndicators.map(indicator => {
      const categoryMultiplier = getCategoryWeightAdjustment(discoveryConfig, indicator.category);
      return {
        ...indicator,
        weight: Math.round(indicator.weight * categoryMultiplier),
      };
    });
  };
  
  const defaultIndicators = useMemo(() => {
    let base: RiskIndicator[];
    switch (clientType) {
      case 'b2c': base = B2C_INDICATORS; break;
      case 'b2b_smb': base = B2B_SMB_INDICATORS; break;
      default: base = B2B_ENTERPRISE_INDICATORS;
    }
    return applyWeightAdjustments(base);
  }, [clientType, discoveryConfig]);

  const [indicators, setIndicators] = useState<RiskIndicator[]>(defaultIndicators);
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set());

  // Update indicators when discovery config changes
  useEffect(() => {
    if (discoveryConfig) {
      // Update client type from config
      setClientType(discoveryConfig.clientType);
      
      // Apply new weight adjustments
      let base: RiskIndicator[];
      switch (discoveryConfig.clientType) {
        case 'b2c': base = B2C_INDICATORS; break;
        case 'b2b_smb': base = B2B_SMB_INDICATORS; break;
        default: base = B2B_ENTERPRISE_INDICATORS;
      }
      setIndicators(applyWeightAdjustments(base));
    }
  }, [discoveryConfig]);

  // Recalculate when client type changes manually
  const handleClientTypeChange = (newType: ClientType) => {
    setClientType(newType);
    let base: RiskIndicator[];
    switch (newType) {
      case 'b2c': base = B2C_INDICATORS; break;
      case 'b2b_smb': base = B2B_SMB_INDICATORS; break;
      default: base = B2B_ENTERPRISE_INDICATORS;
    }
    setIndicators(applyWeightAdjustments(base));
  };

  const toggleExpanded = (id: string) => {
    setExpandedIndicators(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateIndicator = (id: string, updates: Partial<RiskIndicator>) => {
    setIndicators(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteIndicator = (id: string) => {
    setIndicators(prev => prev.filter(i => i.id !== id));
  };

  const addIndicator = () => {
    const newIndicator: RiskIndicator = {
      id: Date.now().toString(),
      name: 'New Indicator',
      category: 'Custom',
      currentValue: 50,
      targetValue: 100,
      weight: 10,
      description: 'Describe this indicator...',
      trend: 'stable',
    };
    setIndicators(prev => [...prev, newIndicator]);
    setExpandedIndicators(prev => new Set([...prev, newIndicator.id]));
  };

  // Calculate overall risk score (0-100, where 100 is highest risk)
  const riskScore = useMemo(() => {
    const totalWeight = indicators.reduce((sum, i) => sum + i.weight, 0);
    if (totalWeight === 0) return 50;
    
    const weightedHealthSum = indicators.reduce((sum, i) => {
      const healthPercent = (i.currentValue / i.targetValue) * 100;
      return sum + (healthPercent * i.weight);
    }, 0);
    
    // Invert: high health = low risk
    const avgHealth = weightedHealthSum / totalWeight;
    return Math.max(0, Math.min(100, 100 - avgHealth));
  }, [indicators]);

  const healthLevel = getHealthLevel(riskScore);

  // Group indicators by category
  const groupedIndicators = useMemo(() => {
    return indicators.reduce((acc, indicator) => {
      if (!acc[indicator.category]) acc[indicator.category] = [];
      acc[indicator.category].push(indicator);
      return acc;
    }, {} as Record<string, RiskIndicator[]>);
  }, [indicators]);

  const primaryColor = initialBrandConfig.primaryColor || '#6366f1';

  const clientTypeLabels: Record<ClientType, { label: string; icon: typeof Building2 }> = {
    b2b_enterprise: { label: 'B2B Enterprise', icon: Building2 },
    b2b_smb: { label: 'B2B SMB', icon: Users },
    b2c: { label: 'B2C', icon: ShoppingCart },
  };

  return (
    <div className="min-h-[600px] bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {initialBrandConfig.logoUrl && (
              <img 
                src={initialBrandConfig.logoUrl} 
                alt="Logo" 
                className="h-8 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                Customer Risk Assessment
              </h1>
              {clientName && (
                <p className="text-sm text-muted-foreground">
                  Powered by {clientName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEditDiscovery && (
              <Button variant="outline" size="sm" onClick={onEditDiscovery}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Edit Discovery
              </Button>
            )}
            <Select value={clientType} onValueChange={(v) => handleClientTypeChange(v as ClientType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b2b_enterprise">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    B2B Enterprise
                  </div>
                </SelectItem>
                <SelectItem value="b2b_smb">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    B2B SMB
                  </div>
                </SelectItem>
                <SelectItem value="b2c">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    B2C
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-muted-foreground">
          Assess your customer health using {clientTypeLabels[clientType].label} metrics
        </p>
      </div>

      {/* Customer Selector */}
      {clientId && (
        <CustomerSelector
          clientId={clientId}
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          onCustomersChange={setCustomers}
        />
      )}

      {/* Main Risk Score - Hero Section */}
      <Card className="mb-6 overflow-hidden">
        <div 
          className={`${healthLevel.bgColor} p-8 text-center transition-colors duration-300`}
        >
          <div className="text-sm font-medium mb-2 opacity-80" style={{ color: 'inherit' }}>
            <span className={healthLevel.textColor}>OVERALL RISK LEVEL</span>
          </div>
          <div className={`text-7xl font-bold mb-2 ${healthLevel.textColor}`}>
            {Math.round(riskScore)}
          </div>
          <div className={`text-xl font-semibold ${healthLevel.textColor}`}>
            {healthLevel.label}
          </div>
        </div>
        <CardContent className="pt-4">
          {/* Risk Scale */}
          <div className="relative pt-2 pb-6">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="flex-1 bg-emerald-800" />
              <div className="flex-1 bg-emerald-500" />
              <div className="flex-1 bg-amber-500" />
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-red-900" />
            </div>
            {/* Score indicator */}
            <div 
              className="absolute top-0 w-0.5 h-6 bg-foreground"
              style={{ left: `${riskScore}%`, transform: 'translateX(-50%)' }}
            />
            <div 
              className="absolute top-7 text-xs font-medium"
              style={{ left: `${riskScore}%`, transform: 'translateX(-50%)' }}
            >
              {Math.round(riskScore)}
            </div>
            {/* Scale labels */}
            <div className="absolute -bottom-1 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="ml-[15%]">Very Healthy</span>
              <span className="ml-[5%]">Healthy</span>
              <span>Medium</span>
              <span>High</span>
              <span>Extreme</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="h-3 w-3 rounded-full bg-emerald-800" />
                    <span>0-19</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Very Healthy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>20-38</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Healthy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span>39-68</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Medium Risk</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="h-3 w-3 rounded-full bg-red-600" />
                    <span>69-89</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>High Risk</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="h-3 w-3 rounded-full bg-red-900" />
                    <span>90-100</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Extremely High Risk</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Key Risk Indicators by Category */}
      <div className="space-y-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Key Risk Indicators</h3>
          <Button variant="outline" size="sm" onClick={addIndicator}>
            <Plus className="h-4 w-4 mr-1" />
            Add Indicator
          </Button>
        </div>

        {Object.entries(groupedIndicators).map(([category, categoryIndicators]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {category}
                <Badge variant="outline" className="ml-auto">
                  {categoryIndicators.length} indicator{categoryIndicators.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryIndicators.map(indicator => {
                const isExpanded = expandedIndicators.has(indicator.id);
                // Convert health value to risk value: higher health = lower risk
                const riskValue = Math.round(100 - (indicator.currentValue / indicator.targetValue) * 100);
                
                return (
                  <Collapsible 
                    key={indicator.id} 
                    open={isExpanded} 
                    onOpenChange={() => toggleExpanded(indicator.id)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <div className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{indicator.name}</span>
                                  <TrendIcon trend={indicator.trend} />
                                  {indicator.actionItem && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Action needed: {indicator.actionItem}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[200px]">
                                    <div 
                                      className={`h-full ${getIndicatorColor(riskValue)} transition-all`}
                                      style={{ width: `${riskValue}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-medium ${getIndicatorTextColor(riskValue)}`}>
                                    Risk: {riskValue}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {indicator.weight}%
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0 border-t space-y-3">
                          <p className="text-sm text-muted-foreground pt-3">
                            {indicator.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium mb-1 block">
                                Current Value: {indicator.currentValue}
                              </label>
                              <Slider
                                value={[indicator.currentValue]}
                                onValueChange={([v]) => updateIndicator(indicator.id, { currentValue: v })}
                                min={0}
                                max={indicator.targetValue}
                                step={1}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block">
                                Weight: {indicator.weight}%
                              </label>
                              <Slider
                                value={[indicator.weight]}
                                onValueChange={([v]) => updateIndicator(indicator.id, { weight: v })}
                                min={1}
                                max={50}
                                step={1}
                              />
                            </div>
                          </div>
                          {indicator.actionItem && (
                            <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                              <div>
                                <span className="text-xs font-medium">Recommended Action</span>
                                <p className="text-sm">{indicator.actionItem}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteIndicator(indicator.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button style={{ backgroundColor: primaryColor }}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
