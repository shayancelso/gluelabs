import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  X,
  FileDown,
  Building2,
  ClipboardList
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BrandConfig } from "./PrototypeBrandingBar";
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { ContactDialog } from './ContactDialog';
import { LikeWhatYouSeeBanner } from './LikeWhatYouSeeBanner';
import { exportToPortraitPdf, formatPdfNumber } from '@/lib/exportPdf';
import { PdfPage } from './pdf/PdfPage';
import { ROIPdfChart } from './pdf/ROIPdfChart';

// Scroll action for toggles section
const scrollToToggles = () => {
  const target = document.querySelector('[data-onboarding="toggles-section"]');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const ROI_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetSelector: '[data-onboarding="roi-header"]',
    title: 'Welcome to ROI Calculator',
    description: '74% of B2B buyers say demonstrating clear ROI is the most important factor in their purchase decision. Deals with quantified value propositions close 50% faster. Let\'s build your business case.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-onboarding="investment-section"]',
    title: 'Set Investment Details',
    description: 'Enter the upfront cost and monthly fee for your solution.',
    position: 'right',
  },
  {
    targetSelector: '[data-onboarding="roles-section"]',
    title: 'Add Team Roles',
    description: 'Add roles that will benefit from time savings. Adjust hourly rates and hours saved per week.',
    position: 'right',
  },
  {
    targetSelector: '[data-onboarding="toggles-section"]',
    title: 'Customize Value Drivers',
    description: 'Toggle Incremental Revenue and Tool Replacement sections on or off to customize the ROI calculation for your specific use case.',
    position: 'right',
    action: scrollToToggles,
  },
  {
    targetSelector: '[data-onboarding="scenario-buttons"]',
    title: 'Choose a Scenario',
    description: 'Toggle between Conservative, Realistic, and Aggressive projections.',
    position: 'right',
  },
  {
    targetSelector: '[data-onboarding="roi-chart"]',
    title: 'See the Results',
    description: 'The ROI updates instantly. Export to PDF to share with your prospect.',
    position: 'left',
  },
];

interface Role {
  id: string;
  name: string;
  hourlyRate: number;
  headcount: number;
  hoursSavedPerWeek: number;
}

interface RevenueItem {
  id: string;
  name: string;
  monthlyAmount: number;
}

interface ToolReplacement {
  id: string;
  toolName: string;
  currentMonthlyCost: number;
}

export interface ROIDiscoveryConfig {
  // Investment
  upfrontCost?: number;
  monthlyFee?: number;
  calculationPeriod?: number;
  defaultScenario?: 'conservative' | 'realistic' | 'aggressive';
  
  // Roles
  roles?: Array<{
    name: string;
    hourlyRate: number;
    headcount: number;
    hoursSavedPerWeek: number;
  }>;
  
  // Benefits
  timeSavingsEnabled?: boolean;
  revenueEnabled?: boolean;
  revenueItems?: Array<{ name: string; monthlyAmount: number }>;
  toolReplacementEnabled?: boolean;
  toolReplacements?: Array<{ toolName: string; currentMonthlyCost: number }>;
}

interface ROIPrototypeProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
  discoveryData?: ROIDiscoveryConfig;
  onEditDiscovery?: () => void;
}

// Helper function to determine if a color is light or dark
const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
};

export function ROIPrototype({ onClose, initialBrandConfig, discoveryData, onEditDiscovery }: ROIPrototypeProps) {
  const [brandConfig] = useState(initialBrandConfig);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [bannerState, setBannerState] = useState<'hidden' | 'expanded' | 'minimized'>('hidden');
  
  // Onboarding
  const onboarding = useOnboarding({
    toolId: 'roi',
    steps: ROI_ONBOARDING_STEPS,
    onComplete: () => {
      if (bannerState === 'hidden') {
        setTimeout(() => setBannerState('expanded'), 500);
      }
    },
  });

  // Show banner after 30 seconds if not already shown
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bannerState === 'hidden' && !onboarding.isActive) {
        setBannerState('expanded');
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [bannerState, onboarding.isActive]);
  
  // Initialize state from discovery data or use defaults
  const getInitialRoles = (): Role[] => {
    if (discoveryData?.roles && discoveryData.roles.length > 0) {
      return discoveryData.roles.map((role, index) => ({
        id: String(index + 1),
        name: role.name,
        hourlyRate: role.hourlyRate,
        headcount: role.headcount,
        hoursSavedPerWeek: role.hoursSavedPerWeek,
      }));
    }
    return [
      { id: '1', name: 'Sales Rep', hourlyRate: 50, headcount: 10, hoursSavedPerWeek: 5 },
      { id: '2', name: 'Account Manager', hourlyRate: 60, headcount: 5, hoursSavedPerWeek: 3 },
      { id: '3', name: 'Customer Success', hourlyRate: 55, headcount: 8, hoursSavedPerWeek: 4 },
    ];
  };

  const getInitialRevenueItems = (): RevenueItem[] => {
    if (discoveryData?.revenueItems && discoveryData.revenueItems.length > 0) {
      return discoveryData.revenueItems.map((item, index) => ({
        id: String(index + 1),
        name: item.name,
        monthlyAmount: item.monthlyAmount,
      }));
    }
    return [{ id: '1', name: 'Additional Deals Closed', monthlyAmount: 5000 }];
  };

  const getInitialToolReplacements = (): ToolReplacement[] => {
    if (discoveryData?.toolReplacements && discoveryData.toolReplacements.length > 0) {
      return discoveryData.toolReplacements.map((tool, index) => ({
        id: String(index + 1),
        toolName: tool.toolName,
        currentMonthlyCost: tool.currentMonthlyCost,
      }));
    }
    return [{ id: '1', toolName: 'Legacy CRM', currentMonthlyCost: 500 }];
  };
  
  // ROI Configuration State
  const [roles, setRoles] = useState<Role[]>(getInitialRoles);
  const [upfrontCost, setUpfrontCost] = useState(discoveryData?.upfrontCost ?? 50000);
  const [monthlyFee, setMonthlyFee] = useState(discoveryData?.monthlyFee ?? 2500);
  const [calculationPeriod, setCalculationPeriod] = useState(discoveryData?.calculationPeriod ?? 36);
  const [scenario, setScenario] = useState<'conservative' | 'realistic' | 'aggressive'>(discoveryData?.defaultScenario ?? 'realistic');
  const [prospectName, setProspectName] = useState('');
  
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>(getInitialRevenueItems);
  const [toolReplacements, setToolReplacements] = useState<ToolReplacement[]>(getInitialToolReplacements);
  
  const [benefitsEnabled, setBenefitsEnabled] = useState({
    timeSavings: discoveryData?.timeSavingsEnabled ?? true,
    revenue: discoveryData?.revenueEnabled ?? false,
    toolReplacement: discoveryData?.toolReplacementEnabled ?? false,
  });

  const [expandedSections, setExpandedSections] = useState({
    revenue: false,
    toolReplacement: false,
  });

  // Handle PDF export using new system
  const handleExportPdf = async () => {
    if (!pdfExportRef.current || isExporting) return;
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      await exportToPortraitPdf({
        toolName: 'ROI Calculator',
        accountName: brandConfig.companyName || 'Analysis',
        element: pdfExportRef.current,
      });
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const scenarioMultiplier = scenario === 'conservative' ? 0.7 : scenario === 'aggressive' ? 1.4 : 1.0;

  const calculations = useMemo(() => {
    const annualTimeSavings = benefitsEnabled.timeSavings 
      ? roles.reduce((total, role) => {
          const annualHours = role.hoursSavedPerWeek * 52 * role.headcount * scenarioMultiplier;
          return total + (annualHours * role.hourlyRate);
        }, 0)
      : 0;

    const annualRevenue = benefitsEnabled.revenue
      ? revenueItems.reduce((total, item) => total + (item.monthlyAmount * 12 * scenarioMultiplier), 0)
      : 0;

    const annualToolSavings = benefitsEnabled.toolReplacement
      ? toolReplacements.reduce((total, tool) => total + (tool.currentMonthlyCost * 12), 0)
      : 0;

    const totalAnnualBenefits = annualTimeSavings + annualRevenue + annualToolSavings;
    const totalPeriodBenefits = totalAnnualBenefits * (calculationPeriod / 12);
    
    const totalInvestment = upfrontCost + (monthlyFee * calculationPeriod);
    const netBenefit = totalPeriodBenefits - totalInvestment;
    const roi = totalInvestment > 0 ? ((netBenefit / totalInvestment) * 100) : 0;

    let breakevenMonth = 0;
    let cumulativeInvestment = upfrontCost;
    let cumulativeBenefits = 0;
    const monthlyBenefits = totalAnnualBenefits / 12;

    for (let month = 1; month <= calculationPeriod; month++) {
      cumulativeInvestment += monthlyFee;
      cumulativeBenefits += monthlyBenefits;
      if (cumulativeBenefits >= cumulativeInvestment && breakevenMonth === 0) {
        breakevenMonth = month;
      }
    }

    const chartData = [];
    let cumInv = upfrontCost;
    let cumBen = 0;
    
    for (let month = 0; month <= calculationPeriod; month++) {
      if (month > 0) {
        cumInv += monthlyFee;
        cumBen += monthlyBenefits;
      }
      chartData.push({
        month,
        investment: Math.round(cumInv),
        benefits: Math.round(cumBen),
        netValue: Math.round(cumBen - cumInv),
      });
    }

    return {
      annualTimeSavings,
      annualRevenue,
      annualToolSavings,
      totalAnnualBenefits,
      totalPeriodBenefits,
      totalInvestment,
      netBenefit,
      roi,
      breakevenMonth,
      chartData,
    };
  }, [roles, upfrontCost, monthlyFee, calculationPeriod, benefitsEnabled, revenueItems, toolReplacements, scenarioMultiplier]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // Generate executive summary for PDF
  const pdfSummary = useMemo(() => {
    const totalHeadcount = roles.reduce((sum, r) => sum + r.headcount, 0);
    const totalHours = roles.reduce((sum, r) => sum + (r.hoursSavedPerWeek * r.headcount), 0);
    return `Based on ${totalHeadcount} team members across ${roles.length} roles saving ${totalHours.toLocaleString()} hours per week, this solution delivers ${calculations.roi.toFixed(0)}% ROI over ${calculationPeriod} months. With a net benefit of ${formatCurrency(calculations.netBenefit)}, breakeven is achieved at month ${calculations.breakevenMonth}.`;
  }, [roles, calculations, calculationPeriod, formatCurrency]);

  // PDF metrics
  const pdfMetrics = useMemo(() => [
    { label: 'Investment', value: formatCurrency(calculations.totalInvestment) },
    { label: 'Total Benefits', value: formatCurrency(calculations.totalPeriodBenefits), color: brandConfig.primaryColor },
    { label: 'Net Value', value: formatCurrency(calculations.netBenefit), color: calculations.netBenefit >= 0 ? '#22c55e' : '#ef4444' },
    { label: 'ROI', value: `${calculations.roi.toFixed(0)}%`, color: brandConfig.primaryColor },
    { label: 'Breakeven', value: calculations.breakevenMonth > 0 ? `Month ${calculations.breakevenMonth}` : 'N/A' },
  ], [calculations, brandConfig.primaryColor, formatCurrency]);

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      name: 'New Role',
      hourlyRate: 45,
      headcount: 5,
      hoursSavedPerWeek: 3,
    }]);
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    setRoles(roles.map(role => role.id === id ? { ...role, ...updates } : role));
  };

  const deleteRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const addRevenueItem = () => {
    setRevenueItems([...revenueItems, {
      id: Date.now().toString(),
      name: 'New Revenue Source',
      monthlyAmount: 1000,
    }]);
  };

  const updateRevenueItem = (id: string, updates: Partial<RevenueItem>) => {
    setRevenueItems(revenueItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteRevenueItem = (id: string) => {
    setRevenueItems(revenueItems.filter(item => item.id !== id));
  };

  const addToolReplacement = () => {
    setToolReplacements([...toolReplacements, {
      id: Date.now().toString(),
      toolName: 'New Tool',
      currentMonthlyCost: 100,
    }]);
  };

  const updateToolReplacement = (id: string, updates: Partial<ToolReplacement>) => {
    setToolReplacements(toolReplacements.map(tool => tool.id === id ? { ...tool, ...updates } : tool));
  };

  const deleteToolReplacement = (id: string) => {
    setToolReplacements(toolReplacements.filter(tool => tool.id !== id));
  };

  // Force white text on gradient headers for better visibility
  const textColor = '#ffffff';

  return (
    <div
      ref={contentRef}
      className="min-h-screen px-4 pb-4 pt-6 md:px-6 md:pb-6 md:pt-8"
      style={{
        backgroundImage: `radial-gradient(circle, ${brandConfig.primaryColor}08 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        {/* Clean Branded Header - Matching Whitespace Style */}
        <div 
          data-onboarding="roi-header"
          className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor || brandConfig.primaryColor})`,
            color: textColor,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              {brandConfig.logoUrl && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl p-1.5 md:p-2">
                  <img 
                    src={brandConfig.logoUrl} 
                    alt={`${brandConfig.companyName} logo`}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-white">
                  <Calculator className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                  <span className="truncate">{brandConfig.companyName} ROI</span>
                </h1>
                <p className="opacity-80 text-xs md:text-sm flex items-center gap-2 mt-0.5 md:mt-1 text-white">
                  {brandConfig.industry && (
                    <>
                      <Building2 className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                      <span className="truncate">{brandConfig.industry} •</span>
                    </>
                  )}
                  <span className="hidden md:inline">Calculate time savings and investment returns</span>
                  <span className="md:hidden">Investment returns</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 self-end md:self-auto">
              {onEditDiscovery && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onEditDiscovery}
                  className="bg-white/20 hover:bg-white/30 border-0 no-print h-8 md:h-9 text-xs md:text-sm"
                  style={{ color: textColor }}
                >
                  <ClipboardList className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Edit Discovery</span>
                  <span className="md:hidden">Discovery</span>
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="bg-white/20 hover:bg-white/30 border-0 no-print h-8 md:h-9 text-xs md:text-sm"
                style={{ color: textColor }}
              >
                <FileDown className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                <span className="md:hidden">{isExporting ? '...' : 'PDF'}</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 border-0 h-8 md:h-9"
                style={{ color: textColor }}
              >
                <X className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Close</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Side-by-Side Layout - Stacked on Mobile */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Left: Configuration Panel */}
          <div className="w-full md:w-[380px] md:shrink-0">
            <ScrollArea className="md:h-[calc(100vh-220px)]">
              <div className="space-y-3 md:space-y-4 md:pr-4">
                {/* Prospect Name */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 md:pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" style={{ color: brandConfig.primaryColor }} />
                      Prospect Name
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0 md:pt-0">
                    <Input
                      value={prospectName}
                      onChange={(e) => setProspectName(e.target.value)}
                      placeholder="Enter prospect company name"
                      className="h-8 md:h-9 text-xs md:text-sm"
                    />
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      The company evaluating this ROI analysis
                    </p>
                  </CardContent>
                </Card>

                {/* Scenario Selection */}
                <Card data-onboarding="scenario-buttons" className="border-border/50">
                  <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 md:pt-4">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 md:h-4 md:w-4" style={{ color: brandConfig.primaryColor }} />
                      Scenario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0 md:pt-0">
                    <div className="flex gap-1.5 md:gap-2">
                      {(['conservative', 'realistic', 'aggressive'] as const).map((s) => (
                        <Button
                          key={s}
                          variant={scenario === s ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setScenario(s)}
                          className="flex-1 capitalize text-[10px] md:text-xs h-7 md:h-8 whitespace-nowrap"
                          style={scenario === s ? { 
                            backgroundColor: brandConfig.primaryColor,
                            color: textColor,
                          } : {}}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {scenario === 'conservative' ? '70% of estimated benefits' :
                       scenario === 'aggressive' ? '140% of estimated benefits' :
                       '100% of estimated benefits'}
                    </p>
                  </CardContent>
                </Card>

                {/* Investment Configuration */}
                <Card data-onboarding="investment-section" className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" style={{ color: brandConfig.primaryColor }} />
                      Investment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Upfront Cost</Label>
                        <span className="text-xs font-medium">{formatCurrency(upfrontCost)}</span>
                      </div>
                      <div className="roi-slider">
                        <Slider
                          value={[upfrontCost]}
                          onValueChange={([val]) => setUpfrontCost(val)}
                          max={200000}
                          step={5000}
                          className="[&_[role=slider]]:border-2 [&>span:first-child]:h-2 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Monthly Fee</Label>
                        <span className="text-xs font-medium">{formatCurrency(monthlyFee)}</span>
                      </div>
                      <div className="roi-slider">
                        <Slider
                          value={[monthlyFee]}
                          onValueChange={([val]) => setMonthlyFee(val)}
                          max={10000}
                          step={100}
                          className="[&_[role=slider]]:border-2 [&>span:first-child]:h-2 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Calculation Period</Label>
                        <span className="text-xs font-medium">{calculationPeriod} months</span>
                      </div>
                      <div className="roi-slider">
                        <Slider
                          value={[calculationPeriod]}
                          onValueChange={([val]) => setCalculationPeriod(val)}
                          min={12}
                          max={60}
                          step={12}
                          className="[&_[role=slider]]:border-2 [&>span:first-child]:h-2 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Roles Configuration */}
                <Card data-onboarding="roles-section" className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" style={{ color: brandConfig.primaryColor }} />
                        Roles
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addRole}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {roles.map((role) => (
                      <div 
                        key={role.id} 
                        className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Input
                            value={role.name}
                            onChange={(e) => updateRole(role.id, { name: e.target.value })}
                            className="h-7 text-sm font-medium bg-transparent border-0 p-0 focus-visible:ring-0"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRole(role.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Rate/hr</Label>
                            <Input
                              type="number"
                              value={role.hourlyRate}
                              onChange={(e) => updateRole(role.id, { hourlyRate: Number(e.target.value) })}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Headcount</Label>
                            <Input
                              type="number"
                              value={role.headcount}
                              onChange={(e) => updateRole(role.id, { headcount: Number(e.target.value) })}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Hrs/week</Label>
                            <Input
                              type="number"
                              value={role.hoursSavedPerWeek}
                              onChange={(e) => updateRole(role.id, { hoursSavedPerWeek: Number(e.target.value) })}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Benefits Configuration */}
                <Card data-onboarding="toggles-section" className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" style={{ color: brandConfig.primaryColor }} />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Time Savings Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Time Savings</span>
                      </div>
                      <Switch
                        checked={benefitsEnabled.timeSavings}
                        onCheckedChange={(checked) => 
                          setBenefitsEnabled({ ...benefitsEnabled, timeSavings: checked })
                        }
                        className="roi-switch"
                      />
                    </div>

                    {/* Incremental Revenue Toggle */}
                    <Collapsible 
                      open={expandedSections.revenue}
                      onOpenChange={(open) => setExpandedSections({ ...expandedSections, revenue: open })}
                    >
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger className="flex items-center gap-2">
                          {expandedSections.revenue ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Incremental Revenue</span>
                        </CollapsibleTrigger>
                        <Switch
                          checked={benefitsEnabled.revenue}
                          onCheckedChange={(checked) => {
                            setBenefitsEnabled({ ...benefitsEnabled, revenue: checked });
                            if (checked) setExpandedSections({ ...expandedSections, revenue: true });
                          }}
                          className="roi-switch"
                        />
                      </div>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {revenueItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 pl-6">
                            <Input
                              value={item.name}
                              onChange={(e) => updateRevenueItem(item.id, { name: e.target.value })}
                              className="h-7 text-xs flex-1"
                              placeholder="Revenue source"
                            />
                            <Input
                              type="number"
                              value={item.monthlyAmount}
                              onChange={(e) => updateRevenueItem(item.id, { monthlyAmount: Number(e.target.value) })}
                              className="h-7 text-xs w-24"
                              placeholder="$/month"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRevenueItem(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addRevenueItem}
                          className="h-7 text-xs ml-6"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Revenue
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Tool Replacement Toggle */}
                    <Collapsible
                      open={expandedSections.toolReplacement}
                      onOpenChange={(open) => setExpandedSections({ ...expandedSections, toolReplacement: open })}
                    >
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger className="flex items-center gap-2">
                          {expandedSections.toolReplacement ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Tool Replacement</span>
                        </CollapsibleTrigger>
                        <Switch
                          checked={benefitsEnabled.toolReplacement}
                          onCheckedChange={(checked) => {
                            setBenefitsEnabled({ ...benefitsEnabled, toolReplacement: checked });
                            if (checked) setExpandedSections({ ...expandedSections, toolReplacement: true });
                          }}
                          className="roi-switch"
                        />
                      </div>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {toolReplacements.map((tool) => (
                          <div key={tool.id} className="flex items-center gap-2 pl-6">
                            <Input
                              value={tool.toolName}
                              onChange={(e) => updateToolReplacement(tool.id, { toolName: e.target.value })}
                              className="h-7 text-xs flex-1"
                              placeholder="Tool name"
                            />
                            <Input
                              type="number"
                              value={tool.currentMonthlyCost}
                              onChange={(e) => updateToolReplacement(tool.id, { currentMonthlyCost: Number(e.target.value) })}
                              className="h-7 text-xs w-24"
                              placeholder="$/month"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteToolReplacement(tool.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addToolReplacement}
                          className="h-7 text-xs ml-6"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Tool
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Live Preview */}
          <div data-onboarding="roi-chart" className="flex-1 space-y-4 md:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <Card className="border-border/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1 md:mb-2">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs">Investment</span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold" style={{ color: brandConfig.primaryColor }}>
                    {formatCurrency(calculations.totalInvestment)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    over {calculationPeriod}mo
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1 md:mb-2">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs">Benefits</span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    {formatCurrency(calculations.totalPeriodBenefits)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {formatCurrency(calculations.totalAnnualBenefits)}/yr
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1 md:mb-2">
                    <Zap className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs">Net</span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold" style={{ color: calculations.netBenefit >= 0 ? brandConfig.accentColor : '#dc2626' }}>
                    {calculations.netBenefit >= 0 ? '+' : ''}{formatCurrency(calculations.netBenefit)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {calculations.roi >= 0 ? '+' : ''}{calculations.roi.toFixed(0)}% ROI
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1 md:mb-2">
                    <Target className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-[10px] md:text-xs">Breakeven</span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold" style={{ color: brandConfig.primaryColor }}>
                    {calculations.breakevenMonth > 0 ? `M${calculations.breakevenMonth}` : 'N/A'}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {calculations.breakevenMonth > 0 
                      ? `${(calculations.breakevenMonth / 12).toFixed(1)} yrs`
                      : 'No breakeven'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 p-3 md:p-6 md:pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Cumulative Value Over Time</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
                <div className="h-[180px] md:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={calculations.chartData}>
                      <defs>
                        <linearGradient id="benefitsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={brandConfig.accentColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={brandConfig.accentColor} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={brandConfig.primaryColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={brandConfig.primaryColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => `M${value}`}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => formatCurrency(value)}
                        width={50}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const investmentValue = payload.find(p => p.dataKey === 'investment')?.value as number || 0;
                          const benefitsValue = payload.find(p => p.dataKey === 'benefits')?.value as number || 0;
                          const netValue = benefitsValue - investmentValue;
                          const currentRoi = investmentValue > 0 ? ((netValue / investmentValue) * 100) : 0;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
                              <p className="font-medium mb-2">Month {label}</p>
                              <p className="text-muted-foreground">
                                Investment: <span style={{ color: brandConfig.primaryColor }} className="font-medium">{formatCurrency(investmentValue)}</span>
                              </p>
                              <p className="text-muted-foreground">
                                Benefits: <span style={{ color: brandConfig.accentColor }} className="font-medium">{formatCurrency(benefitsValue)}</span>
                              </p>
                              <p className="text-muted-foreground mt-1 pt-1 border-t border-border">
                                ROI: <span className={`font-medium ${currentRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currentRoi >= 0 ? '+' : ''}{currentRoi.toFixed(0)}%</span>
                              </p>
                            </div>
                          );
                        }}
                      />
                      {calculations.breakevenMonth > 0 && (
                        <ReferenceLine 
                          x={calculations.breakevenMonth} 
                          stroke={brandConfig.primaryColor}
                          strokeDasharray="5 5"
                          label={{ value: 'Breakeven', position: 'top', fontSize: 9 }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="investment"
                        stroke={brandConfig.primaryColor}
                        fill="url(#investmentGradient)"
                        strokeWidth={2}
                        name="Investment"
                      />
                      <Area
                        type="monotone"
                        dataKey="benefits"
                        stroke={brandConfig.accentColor}
                        fill="url(#benefitsGradient)"
                        strokeWidth={2}
                        name="Benefits"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Role Breakdown Table - Hidden on mobile, show simplified version */}
            <Card className="border-border/50 hidden md:block">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Role Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs text-right">Headcount</TableHead>
                      <TableHead className="text-xs text-right">Hours/Week</TableHead>
                      <TableHead className="text-xs text-right">Annual Hours Saved</TableHead>
                      <TableHead className="text-xs text-right">Annual Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => {
                      const annualHours = role.hoursSavedPerWeek * 52 * role.headcount * scenarioMultiplier;
                      const annualValue = annualHours * role.hourlyRate;
                      return (
                        <TableRow key={role.id}>
                          <TableCell className="text-sm font-medium">{role.name}</TableCell>
                          <TableCell className="text-sm text-right">{role.headcount}</TableCell>
                          <TableCell className="text-sm text-right">{role.hoursSavedPerWeek}</TableCell>
                          <TableCell className="text-sm text-right">{formatNumber(annualHours)}</TableCell>
                          <TableCell className="text-sm text-right font-medium" style={{ color: brandConfig.primaryColor }}>
                            {formatCurrency(annualValue)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="border-t-2">
                      <TableCell className="text-sm font-bold">Total</TableCell>
                      <TableCell className="text-sm text-right font-bold">
                        {roles.reduce((sum, r) => sum + r.headcount, 0)}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-sm text-right font-bold">
                        {formatNumber(roles.reduce((sum, r) => 
                          sum + (r.hoursSavedPerWeek * 52 * r.headcount * scenarioMultiplier), 0
                        ))}
                      </TableCell>
                      <TableCell className="text-sm text-right font-bold" style={{ color: brandConfig.primaryColor }}>
                        {formatCurrency(calculations.annualTimeSavings)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-border/50" style={{ borderColor: `${brandConfig.primaryColor}30` }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${brandConfig.primaryColor}15` }}
                  >
                    <Zap className="h-5 w-5" style={{ color: brandConfig.primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">Next Steps</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on this analysis, by investing in{' '}
                      <span className="font-medium" style={{ color: brandConfig.primaryColor }}>
                        {brandConfig.companyName}
                      </span>
                      {prospectName && (
                        <span>, <span className="font-medium">{prospectName}</span></span>
                      )}
                      {' '}can expect a{' '}
                      <span className="font-medium" style={{ color: brandConfig.accentColor }}>
                        {calculations.roi.toFixed(0)}% return
                      </span>{' '}
                      on their investment over {calculationPeriod / 12} year{calculationPeriod > 12 ? 's' : ''}, 
                      saving{' '}
                      <span className="font-medium text-green-600">
                        {formatCurrency(calculations.netBenefit)}
                      </span>{' '}
                      with breakeven expected {calculations.breakevenMonth > 0 
                        ? `in month ${calculations.breakevenMonth}` 
                        : 'beyond the calculation period'}.
                      Schedule a call to discuss implementation timeline and next steps.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom Slider and Switch Styles with Brand Colors */}
      <style>{`
        .roi-slider [data-orientation="horizontal"] > span:first-child {
          background-color: ${brandConfig.primaryColor}20 !important;
          height: 8px !important;
        }
        .roi-slider [data-orientation="horizontal"] > span:first-child > span {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.accentColor || brandConfig.secondaryColor}) !important;
        }
        .roi-slider [role="slider"] {
          border-color: ${brandConfig.primaryColor} !important;
          background-color: white !important;
          border-width: 2px !important;
        }
        .roi-slider span[data-radix-slider-track] {
          background-color: ${brandConfig.primaryColor}20 !important;
        }
        .roi-slider span[data-radix-slider-range] {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.accentColor || brandConfig.secondaryColor}) !important;
        }
        .roi-slider span[data-radix-slider-thumb] {
          border-color: ${brandConfig.primaryColor} !important;
          background-color: white !important;
          border-width: 2px !important;
        }
        .roi-switch[data-state="checked"] {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor}) !important;
        }
        .roi-switch[data-state="unchecked"] {
          background-color: ${brandConfig.primaryColor}30 !important;
        }
        @media print {
          .roi-slider, .roi-slider * {
            display: block !important;
            visibility: visible !important;
          }
        }
      `}</style>

      {/* Onboarding Tooltip */}
      {onboarding.isActive && onboarding.currentStepData && (
        <OnboardingTooltip
          step={onboarding.currentStepData}
          currentStep={onboarding.currentStep}
          totalSteps={onboarding.totalSteps}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onSkip={onboarding.skipTour}
          onContactRequest={onboarding.requestContact}
          isActive={onboarding.isActive}
        />
      )}

      {/* Like What You See Banner */}
      <LikeWhatYouSeeBanner
        state={bannerState}
        companyName={brandConfig.companyName}
        onContact={() => {
          setBannerState('minimized');
          setShowContactDialog(true);
        }}
        onMinimize={() => setBannerState('minimized')}
        onExpand={() => setBannerState('expanded')}
      />

      {/* Contact Dialog */}
      <ContactDialog
        open={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        brandConfig={brandConfig}
        toolInterest="roi"
      />

      {/* Hidden PDF Export - Portrait Single Page */}
      <PdfPage
        ref={pdfExportRef}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName}
        toolName="ROI Calculator"
        subtitle={`${calculationPeriod}-Month Value Analysis`}
        primaryColor={brandConfig.primaryColor}
        secondaryColor={brandConfig.secondaryColor}
        badges={[
          { label: 'Scenario', value: scenario.charAt(0).toUpperCase() + scenario.slice(1) },
        ]}
        benefitBlurb="This analysis helps quantify the financial impact of our solution, showing projected savings, ROI timeline, and breakeven point to support your business case."
        orientation="portrait"
      >
        <div className="flex flex-col h-full gap-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-5 gap-3">
            {pdfMetrics.map((metric, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                <div className="text-lg font-bold" style={{ color: metric.color || '#1a1a2e' }}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Benefits Breakdown - show enabled benefits */}
          {(benefitsEnabled.timeSavings || benefitsEnabled.revenue || benefitsEnabled.toolReplacement) && (
            <div className="border border-gray-100 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Value Drivers
              </div>
              <div className="grid grid-cols-3 gap-3">
                {benefitsEnabled.timeSavings && (
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="h-3 w-3" />
                      Time Savings
                    </div>
                    <div className="text-sm font-semibold" style={{ color: brandConfig.primaryColor }}>
                      {formatCurrency(calculations.annualTimeSavings)}/yr
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {roles.length} roles, {roles.reduce((s, r) => s + r.headcount, 0)} people
                    </div>
                  </div>
                )}
                {benefitsEnabled.revenue && revenueItems.length > 0 && (
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      Incremental Revenue
                    </div>
                    <div className="text-sm font-semibold" style={{ color: brandConfig.primaryColor }}>
                      {formatCurrency(calculations.annualRevenue)}/yr
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {revenueItems.map(r => r.name).join(', ')}
                    </div>
                  </div>
                )}
                {benefitsEnabled.toolReplacement && toolReplacements.length > 0 && (
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <DollarSign className="h-3 w-3" />
                      Tool Replacement
                    </div>
                    <div className="text-sm font-semibold" style={{ color: brandConfig.primaryColor }}>
                      {formatCurrency(calculations.annualToolSavings)}/yr
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {toolReplacements.map(t => t.toolName).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Chart and breakdown */}
          <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
            <ROIPdfChart
              chartData={calculations.chartData}
              breakevenMonth={calculations.breakevenMonth}
              primaryColor={brandConfig.primaryColor}
              secondaryColor={brandConfig.secondaryColor || brandConfig.primaryColor}
              roles={roles}
              scenarioMultiplier={scenarioMultiplier}
            />
          </div>
          
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
              Executive Summary
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {pdfSummary}
            </p>
          </div>
        </div>
      </PdfPage>
    </div>
  );
}
