import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, Download, DollarSign, TrendingUp, Calculator, Users, Clock,
  Plus, Trash2, Edit3, Save, Info, Eye, Settings2, ChevronDown, ChevronUp, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { toast } from 'sonner';
import { type BrandConfig } from './PrototypeBrandingBar';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { LikeWhatYouSeeBanner, BannerState } from './LikeWhatYouSeeBanner';
import { ContactDialog } from './ContactDialog';
import { PdfPage } from './pdf/PdfPage';
import { exportToMultiPagePdf, formatPdfNumber } from '@/lib/exportPdf';
import { getContrastColor, isLightColor, getDarkestColor } from '@/lib/colorUtils';
import louMascot from '@/assets/lou-mascot.png';

interface SaaSPricingPrototypeProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
}

interface PricingTier {
  id: string;
  name: string;
  pricePerMonth: number;
  customerDistribution: number;
  conversionRate: number;
  features: string[];
}

interface BusinessMetrics {
  monthlyChurnRate: number;
  cac: number;
  monthlyGrowthRate: number;
  grossMargin: number;
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    id: '1',
    name: 'Starter',
    pricePerMonth: 29,
    customerDistribution: 50,
    conversionRate: 8,
    features: ['Basic features', '1 user seat', 'Email support', 'Community access'],
  },
  {
    id: '2',
    name: 'Professional',
    pricePerMonth: 99,
    customerDistribution: 35,
    conversionRate: 5,
    features: ['All Starter features', '5 user seats', 'Priority support', 'API access', 'Integrations'],
  },
  {
    id: '3',
    name: 'Enterprise',
    pricePerMonth: 299,
    customerDistribution: 15,
    conversionRate: 2,
    features: ['All Pro features', 'Unlimited users', 'Dedicated CSM', 'SLA guarantee', 'Custom onboarding'],
  },
];

const ARR_TARGETS = [
  { value: 10000, label: '$10K (Early traction)' },
  { value: 50000, label: '$50K' },
  { value: 100000, label: '$100K (Product-market fit)' },
  { value: 1000000, label: '$1M (Scale stage)' },
];

const DEFAULT_METRICS: BusinessMetrics = {
  monthlyChurnRate: 5,
  cac: 150,
  monthlyGrowthRate: 10,
  grossMargin: 80,
};

const ONBOARDING_STEPS = [
  {
    targetSelector: '[data-onboarding="saas-pricing-header"]',
    title: 'Welcome to the SaaS Pricing Calculator',
    description: 'Optimized pricing strategies can increase revenue by 12-40%. Use this tool to model your pricing tiers and forecast growth.',
    position: 'bottom' as const,
    action: () => {
      const el = document.querySelector('[data-onboarding="saas-pricing-header"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="pricing-tiers"]',
    title: 'Pricing Model',
    description: 'Define your pricing tiers and customer distribution. Each tier shows price, features, and expected customer split.',
    position: 'right' as const,
    action: () => {
      const el = document.querySelector('[data-onboarding="pricing-tiers"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="revenue-inputs"]',
    title: 'Revenue & Business Inputs',
    description: 'Set your ARR target and key business metrics like churn, CAC, and growth rate. These drive your projections.',
    position: 'right' as const,
    action: () => {
      const el = document.querySelector('[data-onboarding="revenue-inputs"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="projections-chart"]',
    title: 'Revenue Projections',
    description: 'See how your revenue grows over time based on your pricing and metrics. The chart updates live as you make changes.',
    position: 'left' as const,
    action: () => {
      const el = document.querySelector('[data-onboarding="projections-chart"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
  {
    targetSelector: '[data-onboarding="outputs-panel"]',
    title: 'Outputs & Exports',
    description: 'View time-to-goal, LTV:CAC ratio, and other key metrics. Export your model as a PDF to share with stakeholders.',
    position: 'left' as const,
    action: () => {
      const el = document.querySelector('[data-onboarding="outputs-panel"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
];

export function SaaSPricingPrototype({ onClose, initialBrandConfig }: SaaSPricingPrototypeProps) {
  const [brandConfig] = useState<BrandConfig>(initialBrandConfig);
  const [tiers, setTiers] = useState<PricingTier[]>(DEFAULT_TIERS);
  const [metrics, setMetrics] = useState<BusinessMetrics>(DEFAULT_METRICS);
  const [targetARR, setTargetARR] = useState(100000);
  const [customARR, setCustomARR] = useState('');
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('calculator');
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [showCsvReference, setShowCsvReference] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [bannerState, setBannerState] = useState<BannerState>('hidden');

  // PDF refs
  const pdfPage1Ref = useRef<HTMLDivElement>(null);
  const pdfPage2Ref = useRef<HTMLDivElement>(null);

  // Onboarding
  const onboarding = useOnboarding({
    toolId: 'saas-pricing',
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

  // Dark brand color for light backgrounds
  const darkestBrandColor = useMemo(() => 
    getDarkestColor([brandConfig.primaryColor, brandConfig.secondaryColor, brandConfig.accentColor]),
    [brandConfig]
  );

  // Calculations
  const calculations = useMemo(() => {
    // Average Revenue Per User (ARPU)
    const arpu = tiers.reduce((sum, tier) => 
      sum + (tier.pricePerMonth * tier.customerDistribution / 100), 0);

    // Monthly Recurring Revenue needed
    const targetMRR = targetARR / 12;

    // Total customers required - use user input or calculate from target
    const customersRequired = totalCustomers !== null 
      ? totalCustomers 
      : Math.ceil(targetMRR / arpu);

    // Customers per tier
    const customersByTier = tiers.map(tier => ({
      ...tier,
      customerCount: Math.round(customersRequired * tier.customerDistribution / 100),
      mrrContribution: tier.pricePerMonth * Math.round(customersRequired * tier.customerDistribution / 100),
    }));

    // Customer Lifetime Value
    const avgLifetimeMonths = metrics.monthlyChurnRate > 0 ? 1 / (metrics.monthlyChurnRate / 100) : 120;
    const clv = arpu * avgLifetimeMonths;

    // LTV:CAC Ratio
    const ltvCacRatio = metrics.cac > 0 ? clv / metrics.cac : 0;

    // Net monthly growth rate
    const netGrowthRate = (metrics.monthlyGrowthRate - metrics.monthlyChurnRate) / 100;
    
    // Time to target (months) using compound growth formula
    const newCustomersPerMonth = Math.max(1, Math.ceil(customersRequired * (metrics.monthlyGrowthRate / 100)));
    const monthsToTarget = netGrowthRate > 0 
      ? Math.ceil(Math.log(targetARR / (arpu * 12 * 10)) / Math.log(1 + netGrowthRate))
      : 24;

    // Revenue projection data (24 months) - CUMULATIVE UPWARD GROWTH
    const startingCustomers = Math.max(10, Math.ceil(customersRequired * 0.05)); // Start with 5% of goal or 10 customers
    const startingARR = startingCustomers * arpu * 12;
    
    const projectionData = Array.from({ length: 24 }, (_, i) => {
      const month = i + 1;
      // Compound growth: ARR grows at net growth rate each month
      const compoundFactor = Math.pow(1 + netGrowthRate, month);
      const arr = startingARR * compoundFactor;
      const mrr = arr / 12;
      const customers = Math.round(mrr / arpu);
      
      return {
        month,
        label: `M${month}`,
        customers,
        mrr,
        arr: Math.round(arr),
      };
    });

    // Payback period (CAC / monthly revenue per customer)
    const paybackMonths = arpu > 0 ? metrics.cac / arpu : 0;

    // Gross profit per customer
    const grossProfitPerCustomer = arpu * (metrics.grossMargin / 100);

    return {
      arpu,
      targetMRR,
      customersRequired,
      customersByTier,
      clv,
      ltvCacRatio,
      monthsToTarget: Math.max(1, Math.min(monthsToTarget, 60)),
      projectionData,
      newCustomersPerMonth,
      paybackMonths,
      grossProfitPerCustomer,
    };
  }, [tiers, metrics, targetARR, totalCustomers]);

  // Handle tier updates
  const updateTier = (id: string, updates: Partial<PricingTier>) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Auto-balance distributions when one changes
  const updateDistribution = (id: string, newValue: number) => {
    const other = tiers.filter(t => t.id !== id);
    const remaining = 100 - newValue;
    const otherTotal = other.reduce((sum, t) => sum + t.customerDistribution, 0);
    
    setTiers(prev => prev.map(t => {
      if (t.id === id) return { ...t, customerDistribution: newValue };
      // Proportionally distribute remaining
      const proportion = otherTotal > 0 ? t.customerDistribution / otherTotal : 1 / other.length;
      return { ...t, customerDistribution: Math.round(remaining * proportion) };
    }));
  };

  // Add new tier
  const addTier = () => {
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: `Tier ${tiers.length + 1}`,
      pricePerMonth: 49,
      customerDistribution: 0,
      conversionRate: 3,
      features: ['Feature 1', 'Feature 2'],
    };
    setTiers(prev => [...prev, newTier]);
  };

  // Delete tier
  const deleteTier = (id: string) => {
    if (tiers.length <= 1) return;
    const remaining = tiers.filter(t => t.id !== id);
    const deletedDistribution = tiers.find(t => t.id === id)?.customerDistribution || 0;
    // Redistribute
    const total = remaining.reduce((sum, t) => sum + t.customerDistribution, 0);
    setTiers(remaining.map(t => ({
      ...t,
      customerDistribution: Math.round(t.customerDistribution + deletedDistribution * (t.customerDistribution / total))
    })));
  };

  // Handle ARR target change
  const handleARRChange = (value: string) => {
    if (value === 'custom') {
      // Keep current value but switch to custom mode
    } else {
      setTargetARR(parseInt(value));
      setCustomARR('');
    }
  };

  // Handle custom ARR
  const handleCustomARR = (value: string) => {
    setCustomARR(value);
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      setTargetARR(parsed);
    }
  };

  // PDF Export
  const handleExportPdf = async () => {
    if (!pdfPage1Ref.current || !pdfPage2Ref.current || isExporting) return;
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      await exportToMultiPagePdf({
        toolName: 'SaaS Pricing Calculator',
        accountName: brandConfig.companyName || 'Pricing Model',
        pages: [pdfPage1Ref.current, pdfPage2Ref.current],
      });
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // PDF Summary
  const pdfSummary = useMemo(() => {
    return `This pricing model analyzes ${tiers.length} tiers with an average revenue of ${formatPdfNumber(calculations.arpu * 12)}/year per customer. To reach ${formatPdfNumber(targetARR)} ARR, you'll need approximately ${calculations.customersRequired} customers. With current metrics, this could take ${calculations.monthsToTarget} months. LTV:CAC ratio is ${calculations.ltvCacRatio.toFixed(1)}x.`;
  }, [tiers.length, calculations, targetARR]);

  // LTV:CAC color indicator
  const getLtvCacColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-600';
    if (ratio >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLtvCacStatus = (ratio: number) => {
    if (ratio >= 3) return 'Healthy';
    if (ratio >= 2) return 'Acceptable';
    return 'Needs Improvement';
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="container max-w-7xl mx-auto px-4 pt-6">
          <div 
            data-onboarding="saas-pricing-header"
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
                  <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-white" style={{ color: '#ffffff' }}>
                    <Calculator className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                    <span className="truncate">{brandConfig.companyName} SaaS Pricing Calculator</span>
                  </h1>
                  <p className="text-xs md:text-sm mt-1 text-white/80" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Strategic Revenue Modeling
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-xs md:text-sm h-8 md:h-9 text-white"
                >
                  <Download className="h-4 w-4 mr-1.5 md:mr-2" />
                  <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                  <span className="md:hidden">{isExporting ? '...' : 'PDF'}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 border-white/30 h-8 md:h-9 text-white"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Close</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Calculator View
              </TabsTrigger>
              <TabsTrigger value="configure" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Configure Data
              </TabsTrigger>
            </TabsList>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column: Inputs */}
                <div className="space-y-6">
                  {/* Pricing Tiers */}
                  <section data-onboarding="pricing-tiers">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" style={{ color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor }} />
                          Pricing Tiers
                        </CardTitle>
                        <CardDescription>Define your pricing structure and customer distribution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tiers.map((tier, index) => (
                          <div 
                            key={tier.id} 
                            className="p-4 rounded-lg border"
                            style={{ 
                              background: index === 0 
                                ? `${brandConfig.primaryColor}08` 
                                : index === 1 
                                  ? `${brandConfig.secondaryColor}08`
                                  : `${brandConfig.accentColor}08`,
                              borderColor: index === 0 
                                ? `${brandConfig.primaryColor}30` 
                                : index === 1 
                                  ? `${brandConfig.secondaryColor}30`
                                  : `${brandConfig.accentColor}30`
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{tier.name}</span>
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    borderColor: brandConfig.primaryColor,
                                    color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor
                                  }}
                                >
                                  ${tier.pricePerMonth}/mo
                                </Badge>
                              </div>
                              <Badge variant="secondary">{tier.customerDistribution}% of customers</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <Label className="text-xs">Price/month</Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">$</span>
                                  <Input 
                                    type="number"
                                    value={tier.pricePerMonth}
                                    onChange={(e) => updateTier(tier.id, { pricePerMonth: parseInt(e.target.value) || 0 })}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Distribution %</Label>
                                <div 
                                  className="branded-slider"
                                  style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                                >
                                  <Slider 
                                    value={[tier.customerDistribution]}
                                    onValueChange={([v]) => updateDistribution(tier.id, v)}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Est. {calculations.customersByTier.find(c => c.id === tier.id)?.customerCount || 0} customers → {formatPdfNumber(calculations.customersByTier.find(c => c.id === tier.id)?.mrrContribution || 0)}/mo
                            </div>
                          </div>
                        ))}
                        
                        <Button variant="outline" size="sm" onClick={addTier} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tier
                        </Button>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Revenue Goals & Business Metrics */}
                  <section data-onboarding="revenue-inputs">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" style={{ color: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor }} />
                          Revenue Goals & Business Metrics
                        </CardTitle>
                        <CardDescription>Set your ARR target and key business assumptions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* ARR Target */}
                        <div>
                          <Label className="mb-3 block">ARR Target</Label>
                          <RadioGroup 
                            value={ARR_TARGETS.find(t => t.value === targetARR) ? targetARR.toString() : 'custom'}
                            onValueChange={handleARRChange}
                            className="grid grid-cols-2 gap-2"
                          >
                            {ARR_TARGETS.map(target => (
                              <div key={target.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={target.value.toString()} id={`arr-${target.value}`} />
                                <Label htmlFor={`arr-${target.value}`} className="text-sm cursor-pointer">
                                  {target.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          <div className="mt-3">
                            <Label className="text-xs text-muted-foreground">Custom ARR</Label>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-muted-foreground">$</span>
                              <Input 
                                value={customARR}
                                onChange={(e) => handleCustomARR(e.target.value)}
                                placeholder="Enter custom ARR"
                                className="h-8"
                              />
                            </div>
                          </div>

                          {/* Total Customers Input */}
                          <div>
                            <Label className="flex items-center gap-1 mb-2">
                              Total Customers (Base)
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Set your current or target customer base. Leave empty to auto-calculate from ARR target.</TooltipContent>
                              </Tooltip>
                            </Label>
                            <Input 
                              type="number"
                              value={totalCustomers || ''}
                              onChange={(e) => setTotalCustomers(e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="Auto-calculated from ARR"
                              className="h-8"
                            />
                          </div>
                        </div>

                        {/* Business Metrics */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <Label className="flex items-center gap-1">
                                Monthly Churn Rate
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>Percentage of customers who cancel each month</TooltipContent>
                                </Tooltip>
                              </Label>
                              <span className="text-sm font-medium">{metrics.monthlyChurnRate}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                            >
                              <Slider 
                                value={[metrics.monthlyChurnRate]}
                                onValueChange={([v]) => setMetrics(m => ({ ...m, monthlyChurnRate: v }))}
                                min={0}
                                max={20}
                                step={0.5}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <Label className="flex items-center gap-1">
                                Customer Acquisition Cost
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>Average cost to acquire one customer</TooltipContent>
                                </Tooltip>
                              </Label>
                              <span className="text-sm font-medium">${metrics.cac}</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.secondaryColor } as React.CSSProperties}
                            >
                              <Slider 
                                value={[metrics.cac]}
                                onValueChange={([v]) => setMetrics(m => ({ ...m, cac: v }))}
                                min={0}
                                max={1000}
                                step={25}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <Label className="flex items-center gap-1">
                                Monthly Growth Rate
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>Expected month-over-month customer growth</TooltipContent>
                                </Tooltip>
                              </Label>
                              <span className="text-sm font-medium">{metrics.monthlyGrowthRate}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.accentColor } as React.CSSProperties}
                            >
                              <Slider 
                                value={[metrics.monthlyGrowthRate]}
                                onValueChange={([v]) => setMetrics(m => ({ ...m, monthlyGrowthRate: v }))}
                                min={0}
                                max={30}
                                step={1}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <Label className="flex items-center gap-1">
                                Gross Margin
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>Revenue minus cost of goods sold</TooltipContent>
                                </Tooltip>
                              </Label>
                              <span className="text-sm font-medium">{metrics.grossMargin}%</span>
                            </div>
                            <div 
                              className="branded-slider"
                              style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                            >
                              <Slider 
                                value={[metrics.grossMargin]}
                                onValueChange={([v]) => setMetrics(m => ({ ...m, grossMargin: v }))}
                                min={0}
                                max={100}
                                step={5}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                </div>

                {/* Right Column: Outputs */}
                <div className="space-y-6">
                  {/* Revenue Projections Chart */}
                  <section data-onboarding="projections-chart">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" style={{ color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor }} />
                          Revenue Projections
                        </CardTitle>
                        <CardDescription>24-month ARR growth trajectory</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={calculations.projectionData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="label" 
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                                tickLine={false}
                              />
                              <ReferenceLine 
                                y={targetARR} 
                                stroke={brandConfig.secondaryColor}
                                strokeDasharray="5 5"
                                label={{ 
                                  value: `Target: ${formatPdfNumber(targetARR)}`, 
                                  position: 'right',
                                  fontSize: 10,
                                  fill: brandConfig.secondaryColor
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="arr" 
                                fill={`${brandConfig.primaryColor}20`}
                                stroke="none"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="arr" 
                                stroke={brandConfig.primaryColor}
                                strokeWidth={3}
                                dot={false}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Time-to-Goal Panel */}
                  <section data-onboarding="outputs-panel">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" style={{ color: isLightColor(brandConfig.accentColor, 0.7) ? darkestBrandColor : brandConfig.accentColor }} />
                          Time-to-Goal Analysis
                        </CardTitle>
                        <CardDescription>Key metrics to reach {formatPdfNumber(targetARR)} ARR</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div 
                            className="p-4 rounded-lg"
                            style={{ background: `${brandConfig.primaryColor}10` }}
                          >
                            <div className="text-sm text-muted-foreground">Time to Target</div>
                            <div className="text-2xl font-bold">{calculations.monthsToTarget} months</div>
                          </div>
                          <div 
                            className="p-4 rounded-lg"
                            style={{ background: `${brandConfig.secondaryColor}10` }}
                          >
                            <div className="text-sm text-muted-foreground">Customers Required</div>
                            <div className="text-2xl font-bold">{calculations.customersRequired.toLocaleString()}</div>
                          </div>
                          <div 
                            className="p-4 rounded-lg"
                            style={{ background: `${brandConfig.accentColor}10` }}
                          >
                            <div className="text-sm text-muted-foreground">New Customers/Month</div>
                            <div className="text-2xl font-bold">{calculations.newCustomersPerMonth}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Avg ARPU</div>
                            <div className="text-2xl font-bold">${calculations.arpu.toFixed(0)}/mo</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Customer LTV</div>
                            <div className="text-2xl font-bold">{formatPdfNumber(calculations.clv)}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              LTV:CAC Ratio
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3" />
                                </TooltipTrigger>
                                <TooltipContent>Healthy SaaS businesses target 3:1 or higher</TooltipContent>
                              </Tooltip>
                            </div>
                            <div className={`text-2xl font-bold ${getLtvCacColor(calculations.ltvCacRatio)}`}>
                              {calculations.ltvCacRatio.toFixed(1)}x
                            </div>
                            <div className={`text-xs ${getLtvCacColor(calculations.ltvCacRatio)}`}>
                              {getLtvCacStatus(calculations.ltvCacRatio)}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">CAC Payback</div>
                            <div className="text-2xl font-bold">{calculations.paybackMonths.toFixed(1)} mo</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Gross Margin</div>
                            <div className="text-2xl font-bold">{metrics.grossMargin}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                </div>
              </div>

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
                      This prototype is loaded with sample pricing tiers. Feel free to edit names, prices, features, and distribution to match your product. All changes update the calculator in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Pricing Tiers */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5" style={{ color: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor }} />
                          Pricing Tiers
                        </CardTitle>
                        <CardDescription>Configure your pricing structure</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={addTier}
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
                      <div className="space-y-3">
                        {tiers.map(tier => (
                          <div 
                            key={tier.id} 
                            className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            {editingTier === tier.id ? (
                              <div className="space-y-3">
                                <Input
                                  value={tier.name}
                                  onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                                  placeholder="Tier name"
                                  autoFocus
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Price/mo</Label>
                                    <Input
                                      type="number"
                                      value={tier.pricePerMonth}
                                      onChange={(e) => updateTier(tier.id, { pricePerMonth: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Distribution %</Label>
                                    <Input
                                      type="number"
                                      value={tier.customerDistribution}
                                      onChange={(e) => updateDistribution(tier.id, parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs">Features (comma-separated)</Label>
                                  <Input
                                    value={tier.features.join(', ')}
                                    onChange={(e) => updateTier(tier.id, { features: e.target.value.split(',').map(f => f.trim()) })}
                                  />
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => setEditingTier(null)}
                                  className="w-full"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{tier.name}</span>
                                    <Badge variant="outline">${tier.pricePerMonth}/mo</Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8"
                                      onClick={() => setEditingTier(tier.id)}
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => deleteTier(tier.id)}
                                      disabled={tiers.length <= 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="secondary">{tier.customerDistribution}% customers</Badge>
                                  <span>·</span>
                                  <span>{tier.features.length} features</span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Business Metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" style={{ color: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor }} />
                        Business Metrics
                      </CardTitle>
                      <CardDescription>Configure key assumptions</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex justify-between mb-2">
                          <Label>Monthly Churn Rate</Label>
                          <span className="font-medium">{metrics.monthlyChurnRate}%</span>
                        </div>
                        <div 
                          className="branded-slider"
                          style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                        >
                          <Slider 
                            value={[metrics.monthlyChurnRate]}
                            onValueChange={([v]) => setMetrics(m => ({ ...m, monthlyChurnRate: v }))}
                            min={0}
                            max={20}
                            step={0.5}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex justify-between mb-2">
                          <Label>Customer Acquisition Cost</Label>
                          <span className="font-medium">${metrics.cac}</span>
                        </div>
                        <div 
                          className="branded-slider"
                          style={{ '--slider-brand-color': brandConfig.secondaryColor } as React.CSSProperties}
                        >
                          <Slider 
                            value={[metrics.cac]}
                            onValueChange={([v]) => setMetrics(m => ({ ...m, cac: v }))}
                            min={0}
                            max={1000}
                            step={25}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex justify-between mb-2">
                          <Label>Monthly Growth Rate</Label>
                          <span className="font-medium">{metrics.monthlyGrowthRate}%</span>
                        </div>
                        <div 
                          className="branded-slider"
                          style={{ '--slider-brand-color': brandConfig.accentColor } as React.CSSProperties}
                        >
                          <Slider 
                            value={[metrics.monthlyGrowthRate]}
                            onValueChange={([v]) => setMetrics(m => ({ ...m, monthlyGrowthRate: v }))}
                            min={0}
                            max={30}
                            step={1}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex justify-between mb-2">
                          <Label>Gross Margin</Label>
                          <span className="font-medium">{metrics.grossMargin}%</span>
                        </div>
                        <div 
                          className="branded-slider"
                          style={{ '--slider-brand-color': brandConfig.primaryColor } as React.CSSProperties}
                        >
                          <Slider 
                            value={[metrics.grossMargin]}
                            onValueChange={([v]) => setMetrics(m => ({ ...m, grossMargin: v }))}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CSV Reference */}
              <Collapsible open={showCsvReference} onOpenChange={setShowCsvReference}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Import/Export Reference</CardTitle>
                        {showCsvReference ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        In production, you could import pricing data from a CSV or integrate with your billing system.
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Pricing Tier Fields</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">tier_name</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">price_per_month</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">customer_distribution</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">features (comma-separated)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Business Metrics</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">monthly_churn_rate</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">cac</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">monthly_growth_rate</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">gross_margin</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hidden PDF Pages */}
        <div className="fixed left-[-9999px] top-0">
          {/* Page 1: Pricing Model & Goals */}
          <PdfPage
            ref={pdfPage1Ref}
            logoUrl={brandConfig.logoUrl || undefined}
            companyName={brandConfig.companyName || 'Gloo'}
            toolName="SaaS Pricing Calculator"
            primaryColor={brandConfig.primaryColor}
            secondaryColor={brandConfig.secondaryColor}
            pageNumber={1}
            totalPages={2}
            benefitBlurb={pdfSummary}
          >
            <div className="space-y-6">
              {/* Pricing Tiers Table */}
              <div>
                <h3 className="font-semibold mb-3">Pricing Tiers</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Tier</th>
                      <th className="text-right p-2 border">Price/Mo</th>
                      <th className="text-right p-2 border">Distribution</th>
                      <th className="text-right p-2 border">Est. Customers</th>
                      <th className="text-right p-2 border">MRR Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.customersByTier.map(tier => (
                      <tr key={tier.id}>
                        <td className="p-2 border font-medium">{tier.name}</td>
                        <td className="p-2 border text-right">${tier.pricePerMonth}</td>
                        <td className="p-2 border text-right">{tier.customerDistribution}%</td>
                        <td className="p-2 border text-right">{tier.customerCount.toLocaleString()}</td>
                        <td className="p-2 border text-right">{formatPdfNumber(tier.mrrContribution)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Key Assumptions</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.primaryColor}10` }}>
                    <div className="text-xs text-muted-foreground">Target ARR</div>
                    <div className="text-lg font-bold">{formatPdfNumber(targetARR)}</div>
                  </div>
                  <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.secondaryColor}10` }}>
                    <div className="text-xs text-muted-foreground">Monthly Churn</div>
                    <div className="text-lg font-bold">{metrics.monthlyChurnRate}%</div>
                  </div>
                  <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.accentColor}10` }}>
                    <div className="text-xs text-muted-foreground">CAC</div>
                    <div className="text-lg font-bold">${metrics.cac}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="text-xs text-muted-foreground">Growth Rate</div>
                    <div className="text-lg font-bold">{metrics.monthlyGrowthRate}%/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </PdfPage>

          {/* Page 2: Revenue Projections Chart & Analysis */}
          <PdfPage
            ref={pdfPage2Ref}
            logoUrl={brandConfig.logoUrl || undefined}
            companyName={brandConfig.companyName || 'Gloo'}
            toolName="SaaS Pricing Calculator"
            primaryColor={brandConfig.primaryColor}
            secondaryColor={brandConfig.secondaryColor}
            pageNumber={2}
            totalPages={2}
            minimalHeader
          >
            <div className="space-y-5">
              {/* Revenue Projections Chart */}
              <div>
                <h3 className="font-semibold mb-3">24-Month Revenue Projections</h3>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={calculations.projectionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        interval={2}
                      />
                      <YAxis 
                        tick={{ fontSize: 9 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        tickLine={false}
                      />
                      <ReferenceLine 
                        y={targetARR} 
                        stroke={brandConfig.secondaryColor}
                        strokeDasharray="5 5"
                        label={{ 
                          value: `Target: ${formatPdfNumber(targetARR)}`, 
                          position: 'right',
                          fontSize: 8,
                          fill: brandConfig.secondaryColor
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="arr" 
                        fill={`${brandConfig.primaryColor}20`}
                        stroke="none"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="arr" 
                        stroke={brandConfig.primaryColor}
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time-to-Goal Analysis */}
              <div>
                <h3 className="font-semibold mb-3">Time-to-Goal Analysis</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.primaryColor}10` }}>
                    <div className="text-xs text-muted-foreground">Time to Target</div>
                    <div className="text-lg font-bold">{calculations.monthsToTarget} months</div>
                  </div>
                  <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.secondaryColor}10` }}>
                    <div className="text-xs text-muted-foreground">Customers Required</div>
                    <div className="text-lg font-bold">{calculations.customersRequired.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-lg border" style={{ background: `${brandConfig.accentColor}10` }}>
                    <div className="text-xs text-muted-foreground">Avg ARPU</div>
                    <div className="text-lg font-bold">${calculations.arpu.toFixed(0)}/mo</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="text-xs text-muted-foreground">Customer LTV</div>
                    <div className="text-lg font-bold">{formatPdfNumber(calculations.clv)}</div>
                  </div>
                </div>
              </div>

              {/* Unit Economics */}
              <div>
                <h3 className="font-semibold mb-3">Unit Economics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="text-sm text-muted-foreground">LTV:CAC Ratio</div>
                    <div className={`text-xl font-bold ${getLtvCacColor(calculations.ltvCacRatio)}`}>
                      {calculations.ltvCacRatio.toFixed(1)}x
                    </div>
                    <div className={`text-xs ${getLtvCacColor(calculations.ltvCacRatio)}`}>
                      {getLtvCacStatus(calculations.ltvCacRatio)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="text-sm text-muted-foreground">CAC Payback Period</div>
                    <div className="text-xl font-bold">{calculations.paybackMonths.toFixed(1)} months</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="text-sm text-muted-foreground">Gross Margin</div>
                    <div className="text-xl font-bold">{metrics.grossMargin}%</div>
                  </div>
                </div>
              </div>

            </div>
          </PdfPage>
        </div>

        {/* Onboarding Tooltip */}
        {onboarding.isActive && ONBOARDING_STEPS[onboarding.currentStep] && (
          <OnboardingTooltip
            isActive={onboarding.isActive}
            currentStep={onboarding.currentStep}
            totalSteps={ONBOARDING_STEPS.length}
            step={ONBOARDING_STEPS[onboarding.currentStep]}
            onNext={onboarding.nextStep}
            onPrev={onboarding.prevStep}
            onSkip={onboarding.skipTour}
            onContactRequest={() => setShowContactDialog(true)}
          />
        )}

        {/* Contact Dialog */}
        <ContactDialog
          open={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          brandConfig={brandConfig}
          toolInterest="c666ae0e-d432-44a3-a308-e407dc7d51e6"
        />

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
