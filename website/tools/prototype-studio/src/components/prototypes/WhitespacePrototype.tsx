import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Grid3X3, 
  Plus, 
  Trash2, 
  Settings2, 
  Eye,
  CheckCircle2,
  Circle,
  TrendingUp,
  Building2,
  Package,
  Sparkles,
  X,
  Edit3,
  Save,
  Download,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  ArrowRight,
  TrendingDown,
  Activity,
  Star,
  Lightbulb,
  Factory,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { BrandConfig } from './PrototypeBrandingBar';
import { 
  getContrastColor, 
  getDarkestColor, 
  isLightColor, 
  getSmartTextColor,
  getScoreColor,
  getScoreBadge
} from '@/lib/colorUtils';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { ContactDialog } from './ContactDialog';
import { LikeWhatYouSeeBanner } from './LikeWhatYouSeeBanner';
import { exportToMultiPagePdf, formatPdfNumber, formatPdfPercent } from '@/lib/exportPdf';
import { PdfPage } from './pdf/PdfPage';
import { WhitespacePdfGrid } from './pdf/WhitespacePdfGrid';

// Onboarding steps will be defined inside the component to access setActiveTab

interface Customer {
  id: string;
  name: string;
  segment?: string;
  tier?: string;
  arr?: number;
  growthStage?: 'hypergrowth' | 'growing' | 'stable' | 'at-risk';
  relationshipStrength?: number;
  accountSize?: 'enterprise' | 'mid-market' | 'smb';
}

interface Product {
  id: string;
  name: string;
  category?: string;
  listPrice?: number;
  prerequisites?: string[];
  strategicValue?: 'core' | 'expansion' | 'premium';
}

interface Ownership {
  customerId: string;
  productId: string;
  status: 'adopted' | 'opportunity' | 'in_progress';
  notes?: string;
}

interface CellDetail {
  customer: Customer;
  product: Product;
  ownership?: Ownership;
}

interface WhitespacePrototypeProps {
  brandConfig: BrandConfig;
  onClose: () => void;
}

// Generate random ARR based on tier
const generateArr = (tier?: string): number => {
  if (tier === 'Tier 1') return Math.floor(Math.random() * 400000) + 200000;
  if (tier === 'Tier 2') return Math.floor(Math.random() * 150000) + 50000;
  return Math.floor(Math.random() * 40000) + 10000;
};

// Generate growth stage based on tier
const generateGrowthStage = (tier?: string): 'hypergrowth' | 'growing' | 'stable' | 'at-risk' => {
  const stages: ('hypergrowth' | 'growing' | 'stable' | 'at-risk')[] = ['hypergrowth', 'growing', 'stable', 'at-risk'];
  if (tier === 'Tier 1') return stages[Math.floor(Math.random() * 2)];
  if (tier === 'Tier 2') return stages[Math.floor(Math.random() * 3)];
  return stages[Math.floor(Math.random() * 4)];
};

// Default sample data with enhanced fields
const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'Customer A', segment: 'Enterprise', tier: 'Tier 1', arr: 245000, growthStage: 'hypergrowth', relationshipStrength: 85, accountSize: 'enterprise' },
  { id: 'c2', name: 'Customer B', segment: 'Mid-Market', tier: 'Tier 2', arr: 78000, growthStage: 'growing', relationshipStrength: 72, accountSize: 'mid-market' },
  { id: 'c3', name: 'Customer C', segment: 'Enterprise', tier: 'Tier 1', arr: 312000, growthStage: 'stable', relationshipStrength: 90, accountSize: 'enterprise' },
  { id: 'c4', name: 'Customer D', segment: 'SMB', tier: 'Tier 3', arr: 24000, growthStage: 'growing', relationshipStrength: 55, accountSize: 'smb' },
  { id: 'c5', name: 'Customer E', segment: 'Mid-Market', tier: 'Tier 2', arr: 95000, growthStage: 'hypergrowth', relationshipStrength: 78, accountSize: 'mid-market' },
  { id: 'c6', name: 'Customer F', segment: 'Enterprise', tier: 'Tier 1', arr: 187000, growthStage: 'stable', relationshipStrength: 88, accountSize: 'enterprise' },
];

const defaultProducts: Product[] = [
  { id: 'p1', name: 'Product X', category: 'Core', listPrice: 35000, strategicValue: 'core' },
  { id: 'p2', name: 'Product Y', category: 'Analytics', listPrice: 45000, prerequisites: ['p1'], strategicValue: 'expansion' },
  { id: 'p3', name: 'Product Z', category: 'Integration', listPrice: 25000, prerequisites: ['p1'], strategicValue: 'expansion' },
  { id: 'p4', name: 'Product W', category: 'Premium', listPrice: 85000, prerequisites: ['p1', 'p2'], strategicValue: 'premium' },
  { id: 'p5', name: 'Product V', category: 'Add-on', listPrice: 15000, strategicValue: 'expansion' },
];

const defaultOwnership: Ownership[] = [
  { customerId: 'c1', productId: 'p1', status: 'adopted' },
  { customerId: 'c1', productId: 'p2', status: 'adopted' },
  { customerId: 'c1', productId: 'p3', status: 'in_progress' },
  { customerId: 'c2', productId: 'p1', status: 'adopted' },
  { customerId: 'c2', productId: 'p4', status: 'opportunity' },
  { customerId: 'c3', productId: 'p1', status: 'adopted' },
  { customerId: 'c3', productId: 'p2', status: 'adopted' },
  { customerId: 'c3', productId: 'p3', status: 'adopted' },
  { customerId: 'c3', productId: 'p4', status: 'in_progress' },
  { customerId: 'c4', productId: 'p1', status: 'adopted' },
  { customerId: 'c5', productId: 'p1', status: 'adopted' },
  { customerId: 'c5', productId: 'p2', status: 'opportunity' },
  { customerId: 'c6', productId: 'p1', status: 'adopted' },
  { customerId: 'c6', productId: 'p2', status: 'adopted' },
  { customerId: 'c6', productId: 'p5', status: 'in_progress' },
];

export function WhitespacePrototype({ brandConfig, onClose }: WhitespacePrototypeProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'configure'>('preview');
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [ownership, setOwnership] = useState<Ownership[]>(defaultOwnership);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfPage1Ref = useRef<HTMLDivElement>(null);
  const pdfPage2Ref = useRef<HTMLDivElement>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [bannerState, setBannerState] = useState<'hidden' | 'expanded' | 'minimized'>('hidden');
  const [showCsvReference, setShowCsvReference] = useState(false);
  // Define onboarding steps with tab navigation and scroll
  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      targetSelector: '[data-onboarding="whitespace-header"]',
      title: 'Welcome to Whitespace Analyzer',
      description: 'Cross-sell and upsell opportunities represent 60-70% of revenue growth potential. Companies using structured whitespace analysis see 25-30% higher expansion revenue. Let\'s explore how it works.',
      position: 'bottom',
      action: () => {
        setActiveTab('preview');
        setTimeout(() => {
          const el = document.querySelector('[data-onboarding="whitespace-header"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    },
    {
      targetSelector: '[data-onboarding="customer-column"]',
      title: 'Your Customer Base',
      description: 'Add your customers here. Click the + button to add new ones, or click a name to edit.',
      position: 'right',
      action: () => {
        setActiveTab('preview');
        setTimeout(() => {
          const el = document.querySelector('[data-onboarding="customer-column"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    },
    {
      targetSelector: '[data-onboarding="product-row"]',
      title: 'Your Product Catalog',
      description: 'Define your products along the top. Click a product header to see details like price and category.',
      position: 'bottom',
      action: () => {
        setActiveTab('preview');
        setTimeout(() => {
          const el = document.querySelector('[data-onboarding="product-row"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    },
    {
      targetSelector: '[data-onboarding="grid-cell"]',
      title: 'Click for Details',
      description: 'Click any cell to see detailed analysis including opportunity score, growth drivers, and next best action.',
      position: 'bottom',
      action: () => {
        setActiveTab('preview');
        setTimeout(() => {
          const el = document.querySelector('[data-onboarding="grid-cell"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    },
    {
      targetSelector: '[data-onboarding="configure-tab"]',
      title: 'Configure Your Data',
      description: 'Switch to Configure to add your own customers and products. In a full implementation, this syncs with your CRM automatically. For now, enter sample data to see the tool in action.',
      position: 'bottom',
      action: () => {
        setActiveTab('configure');
        setTimeout(() => {
          const el = document.querySelector('[data-onboarding="configure-tab"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    },
    {
      targetSelector: '[data-onboarding="stats-cards"]',
      title: 'Export Your Analysis',
      description: 'These metrics update in real-time. Export to PDF when ready to share with your team.',
      position: 'bottom',
      action: () => {
        setActiveTab('preview');
        setTimeout(() => {
          const el = document.querySelector('[data-onboarding="stats-cards"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    },
  ], []);
  
  // Onboarding
  const onboarding = useOnboarding({
    toolId: 'whitespace',
    steps: onboardingSteps,
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
  
  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);
  
  // Edit mode state
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Get brand colors array for contrast calculations
  const brandColors = useMemo(() => [
    brandConfig.primaryColor,
    brandConfig.secondaryColor,
    brandConfig.accentColor,
  ], [brandConfig]);

  const darkestBrandColor = useMemo(() => getDarkestColor(brandColors), [brandColors]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCells = customers.length * products.length;
    const adopted = ownership.filter(o => o.status === 'adopted').length;
    const inProgress = ownership.filter(o => o.status === 'in_progress').length;
    const opportunities = totalCells - adopted - inProgress;
    const whitespacePercent = totalCells > 0 ? Math.round((opportunities / totalCells) * 100) : 0;
    const totalArr = customers.reduce((sum, c) => sum + (c.arr || 0), 0);
    const totalPotential = customers.length * products.reduce((sum, p) => sum + (p.listPrice || 0), 0);
    const whitespaceValue = opportunities * (products.reduce((sum, p) => sum + (p.listPrice || 0), 0) / products.length);
    
    return { totalCells, adopted, inProgress, opportunities, whitespacePercent, totalArr, totalPotential, whitespaceValue };
  }, [customers, products, ownership]);

  const getOwnership = useCallback((customerId: string, productId: string) => {
    return ownership.find(o => o.customerId === customerId && o.productId === productId);
  }, [ownership]);

  // Calculate opportunity score for a cell
  const calculateOpportunityScore = useCallback((customer: Customer, product: Product): number => {
    let score = 0;
    
    // Market penetration factor (low = high opportunity)
    const customerOwned = ownership.filter(o => o.customerId === customer.id && o.status === 'adopted').length;
    const penetration = customerOwned / products.length;
    score += (1 - penetration) * 25;
    
    // Growth stage factor
    if (customer.growthStage === 'hypergrowth') score += 25;
    else if (customer.growthStage === 'growing') score += 20;
    else if (customer.growthStage === 'stable') score += 10;
    else score += 5;
    
    // Prerequisites factor
    if (product.prerequisites && product.prerequisites.length > 0) {
      const hasAll = product.prerequisites.every(prereq => 
        ownership.some(o => o.customerId === customer.id && o.productId === prereq && o.status === 'adopted')
      );
      score += hasAll ? 25 : 5;
    } else {
      score += 15;
    }
    
    // Strategic fit factor
    if (product.strategicValue === 'core') score += 15;
    else if (product.strategicValue === 'expansion') score += 20;
    else score += 25;
    
    // Relationship strength
    score += ((customer.relationshipStrength || 50) / 100) * 10;
    
    return Math.min(100, Math.round(score));
  }, [ownership, products]);

  // Generate growth drivers based on context
  const getGrowthDrivers = useCallback((customer: Customer, product: Product): string[] => {
    const drivers: string[] = [];
    
    const customerOwned = ownership.filter(o => o.customerId === customer.id && o.status === 'adopted').length;
    if (customerOwned < products.length / 2) {
      drivers.push('Significant whitespace remaining');
    }
    
    if ((customer.relationshipStrength || 50) > 70) {
      drivers.push('Strong existing relationship');
    }
    
    if (customer.growthStage === 'hypergrowth' || customer.growthStage === 'growing') {
      drivers.push(`${brandConfig.industry || 'Tech'} sector adoption momentum`);
    }
    
    if (product.strategicValue === 'premium') {
      drivers.push('Premium solution indicates maturity');
    }
    
    if (customer.accountSize === 'enterprise') {
      drivers.push('Enterprise buying power available');
    }
    
    if (product.prerequisites?.every(prereq => 
      ownership.some(o => o.customerId === customer.id && o.productId === prereq && o.status === 'adopted')
    )) {
      drivers.push('All prerequisites already adopted');
    }
    
    return drivers.slice(0, 3);
  }, [ownership, products, brandConfig.industry]);

  // Get next best action based on context
  const getNextBestAction = useCallback((customer: Customer, product: Product, score: number): string => {
    if (score >= 70) {
      return `Schedule demo of ${product.name} with ${customer.name} stakeholders`;
    }
    if (score >= 50) {
      return `Build relationship foundation before pursuing ${product.name}`;
    }
    if (score >= 30) {
      return `Address prerequisite products first, then revisit ${product.name}`;
    }
    return `Focus on strengthening core product adoption before expansion`;
  }, []);

  const handleCellClick = (customer: Customer, product: Product) => {
    const own = getOwnership(customer.id, product.id);
    setSelectedCell({ customer, product, ownership: own });
    setDetailOpen(true);
  };

  const handleStatusToggle = (customerId: string, productId: string) => {
    const existing = getOwnership(customerId, productId);
    
    if (!existing) {
      setOwnership([...ownership, { customerId, productId, status: 'in_progress' }]);
    } else if (existing.status === 'opportunity') {
      setOwnership(ownership.map(o => 
        o.customerId === customerId && o.productId === productId 
          ? { ...o, status: 'in_progress' } 
          : o
      ));
    } else if (existing.status === 'in_progress') {
      setOwnership(ownership.map(o => 
        o.customerId === customerId && o.productId === productId 
          ? { ...o, status: 'adopted' } 
          : o
      ));
    } else {
      setOwnership(ownership.filter(o => 
        !(o.customerId === customerId && o.productId === productId)
      ));
    }
  };

  const addCustomer = () => {
    const newId = `c${Date.now()}`;
    const newName = `Customer ${String.fromCharCode(65 + customers.length)}`;
    const tier = 'Tier 2';
    setCustomers([...customers, { 
      id: newId, 
      name: newName, 
      segment: 'Mid-Market', 
      tier,
      arr: generateArr(tier),
      growthStage: generateGrowthStage(tier),
      relationshipStrength: Math.floor(Math.random() * 40) + 50,
      accountSize: 'mid-market'
    }]);
  };

  const removeCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    setOwnership(ownership.filter(o => o.customerId !== id));
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addProduct = () => {
    const newId = `p${Date.now()}`;
    const letters = ['X', 'Y', 'Z', 'W', 'V', 'U', 'T', 'S', 'R', 'Q'];
    const newName = `Product ${letters[products.length % letters.length]}${products.length >= letters.length ? products.length - letters.length + 1 : ''}`;
    setProducts([...products, { 
      id: newId, 
      name: newName, 
      category: 'Add-on',
      listPrice: Math.floor(Math.random() * 40000) + 10000,
      strategicValue: 'expansion'
    }]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setOwnership(ownership.filter(o => o.productId !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Smart cell styling with contrast handling
  const getCellStyle = (status?: 'adopted' | 'opportunity' | 'in_progress') => {
    if (status === 'adopted') {
      const bgColor = isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor;
      return {
        backgroundColor: bgColor,
        color: getContrastColor(bgColor),
      };
    }
    if (status === 'in_progress') {
      const bgColor = isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor;
      return {
        backgroundColor: bgColor,
        color: getContrastColor(bgColor),
      };
    }
    return {
      backgroundColor: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
    };
  };

  // Get smart stat card text color
  const getStatTextColor = (color: string) => {
    return isLightColor(color, 0.7) ? darkestBrandColor : color;
  };

  // Handle PDF export using new multi-page system
  const handleExportPdf = async () => {
    if (!pdfPage1Ref.current || !pdfPage2Ref.current || isExporting) return;
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      await exportToMultiPagePdf({
        toolName: 'Whitespace Analysis',
        accountName: brandConfig.companyName || 'Analysis',
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

  // Generate executive summary for PDF
  const pdfSummary = useMemo(() => {
    const whitespaceValue = formatPdfNumber(stats.whitespaceValue);
    return `This whitespace analysis identifies ${stats.opportunities} expansion opportunities across ${customers.length} customers and ${products.length} products. With ${stats.whitespacePercent}% of the grid representing untapped potential worth approximately ${whitespaceValue} in annual value, prioritizing high-fit accounts could significantly accelerate revenue growth.`;
  }, [stats, customers.length, products.length]);

  // PDF metrics
  const pdfMetrics = useMemo(() => [
    { label: 'Customers', value: customers.length.toString() },
    { label: 'Products', value: products.length.toString() },
    { label: 'Adopted', value: stats.adopted.toString(), color: brandConfig.primaryColor },
    { label: 'Opportunities', value: stats.opportunities.toString() },
    { label: 'Whitespace', value: `${stats.whitespacePercent}%`, color: '#ef4444' },
    { label: 'Potential Value', value: formatPdfNumber(stats.whitespaceValue) },
  ], [customers.length, products.length, stats, brandConfig.primaryColor]);

  // Calculate readiness score for selected cell
  const getReadinessScore = useCallback((customer: Customer): number => {
    let score = 0;
    
    // Growth stage
    if (customer.growthStage === 'hypergrowth') score += 10;
    else if (customer.growthStage === 'growing') score += 15;
    else if (customer.growthStage === 'stable') score += 25;
    else score += 5;
    
    // Market penetration
    const customerOwned = ownership.filter(o => o.customerId === customer.id && o.status === 'adopted').length;
    const penetration = customerOwned / products.length;
    score += (1 - penetration) * 25;
    
    // Relationship
    score += ((customer.relationshipStrength || 50) / 100) * 15;
    
    // Account size
    if (customer.accountSize === 'enterprise') score += 10;
    else if (customer.accountSize === 'mid-market') score += 15;
    else score += 5;
    
    // Whitespace value
    score += 10;
    
    return Math.min(100, Math.round(score));
  }, [ownership, products]);

  return (
    <TooltipProvider>
      <div ref={contentRef} className="space-y-6 animate-fade-in print:space-y-4">
        {/* Print styles */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-break { break-inside: avoid; }
            .print-header { display: block !important; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        `}</style>

        {/* Header with branding */}
        <div
          data-onboarding="whitespace-header"
          className="rounded-xl md:rounded-2xl p-4 md:p-6 print:rounded-none print:p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-3 md:gap-4">
              {brandConfig.logoUrl && (
                <img src={brandConfig.logoUrl} alt="Logo" className="h-8 md:h-10 object-contain bg-white/20 rounded-lg p-1" />
              )}
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
                  <Grid3X3 className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                  <span className="truncate">{brandConfig.companyName} Whitespace</span>
                </h1>
                <p className="opacity-80 text-xs md:text-sm flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {brandConfig.industry && (
                    <>
                      <Factory className="h-3 w-3 shrink-0" />
                      <span className="truncate">{brandConfig.industry}</span>
                      <span className="opacity-50">•</span>
                    </>
                  )}
                  <span className="hidden md:inline">Identify expansion opportunities across your customer base</span>
                  <span className="md:hidden">Expansion opportunities</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 no-print self-end md:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="bg-white/20 hover:bg-white/30 border-0 text-xs md:text-sm h-8 md:h-9 text-white"
              >
                <Download className="h-4 w-4 mr-1.5 md:mr-2" />
                <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                <span className="md:hidden">{isExporting ? '...' : 'PDF'}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 border-0 h-8 md:h-9 text-white"
              >
                <X className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Close</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards with smart contrast */}
        <div data-onboarding="stats-cards" className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 print:grid-cols-5 print:gap-2">
          <Card className="border-border/50 print-break">
            <CardContent className="p-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <Building2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Customers</span>
              </div>
              <div className="text-lg md:text-2xl font-bold" style={{ color: getStatTextColor(brandConfig.primaryColor) }}>
                {customers.length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 print-break">
            <CardContent className="p-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <Package className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Products</span>
              </div>
              <div className="text-lg md:text-2xl font-bold" style={{ color: getStatTextColor(brandConfig.primaryColor) }}>
                {products.length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 print-break">
            <CardContent className="p-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Adopted</span>
              </div>
              <div className="text-lg md:text-2xl font-bold" style={{ color: getStatTextColor(brandConfig.primaryColor) }}>
                {stats.adopted}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 print-break">
            <CardContent className="p-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">In Progress</span>
              </div>
              <div className="text-lg md:text-2xl font-bold" style={{ color: getStatTextColor(brandConfig.secondaryColor) }}>
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 print-break">
            <CardContent className="p-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Opps</span>
              </div>
              <div className="text-lg md:text-2xl font-bold" style={{ color: getStatTextColor(brandConfig.accentColor) }}>
                {stats.opportunities}
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-0 print-break"
            style={{ background: `linear-gradient(135deg, ${brandConfig.primaryColor}15, ${brandConfig.secondaryColor}15)` }}
          >
            <CardContent className="p-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[10px] md:text-xs">Whitespace</span>
              </div>
              <div className="text-lg md:text-2xl font-bold" style={{ color: getStatTextColor(brandConfig.primaryColor) }}>
                {stats.whitespacePercent}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'configure')}>
          <TabsList className="bg-muted/50 no-print h-9 md:h-10">
            <TabsTrigger value="preview" className="gap-1.5 md:gap-2 text-xs md:text-sm">
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">Preview Grid</span>
              <span className="md:hidden">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="configure" data-onboarding="configure-tab" className="gap-1.5 md:gap-2 text-xs md:text-sm">
              <Settings2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">Configure Data</span>
              <span className="md:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4 md:mt-6">
            {/* Legend with smart contrast */}
            <div className="flex items-center gap-3 md:gap-6 mb-4 text-xs md:text-sm flex-wrap">
              <span className="text-muted-foreground hidden md:inline">Legend:</span>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div 
                  className="w-4 h-4 md:w-5 md:h-5 rounded border border-border" 
                  style={{ 
                    backgroundColor: isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor 
                  }} 
                />
                <span>Adopted</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div 
                  className="w-4 h-4 md:w-5 md:h-5 rounded border border-border" 
                  style={{ 
                    backgroundColor: isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor 
                  }} 
                />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-muted border border-border" />
                <span>Opportunity</span>
              </div>
              <span className="text-muted-foreground text-[10px] md:text-xs ml-auto no-print hidden md:inline">Click any cell to toggle status or view details</span>
            </div>

            {/* Grid */}
            <Card className="border-border/50 overflow-hidden print-break">
              <ScrollArea className="w-full">
                <div className="min-w-max">
                  {/* Header Row */}
                  <div data-onboarding="product-row" className="flex border-b bg-muted/30">
                    <div data-onboarding="customer-column" className="w-48 shrink-0 p-3 font-semibold text-sm border-r sticky left-0 bg-muted/30 z-10">
                      Customer / Product
                    </div>
                    {products.map(product => (
                      <div key={product.id} className="w-28 shrink-0 p-3 text-center border-r">
                        <div className="text-sm font-medium truncate">{product.name}</div>
                        {product.category && (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                    <div className="w-20 shrink-0 p-3 text-center font-semibold text-sm">
                      Gaps
                    </div>
                  </div>

                  {/* Customer Rows */}
                  {customers.map((customer, idx) => {
                    const adoptedCount = products.filter(p => 
                      getOwnership(customer.id, p.id)?.status === 'adopted'
                    ).length;
                    const gapCount = products.length - adoptedCount;

                    return (
                      <div 
                        key={customer.id} 
                        className={`flex border-b transition-colors hover:bg-muted/10 ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}
                      >
                        <div className="w-48 shrink-0 p-3 border-r sticky left-0 bg-inherit z-10">
                          <div className="font-medium text-sm">{customer.name}</div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {customer.segment && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{customer.segment}</Badge>
                            )}
                            {customer.tier && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{customer.tier}</Badge>
                            )}
                          </div>
                        </div>
                        {products.map(product => {
                          const own = getOwnership(customer.id, product.id);
                          const status = own?.status;
                          
                          return (
                            <div key={product.id} className="w-28 shrink-0 p-2 border-r flex items-center justify-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    data-onboarding={idx === 0 && products.indexOf(product) === 0 ? "grid-cell" : undefined}
                                    onClick={() => handleCellClick(customer, product)}
                                    onDoubleClick={() => handleStatusToggle(customer.id, product.id)}
                                    className="w-full h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-md cursor-pointer no-print"
                                    style={getCellStyle(status)}
                                  >
                                    {status === 'adopted' && <CheckCircle2 className="h-5 w-5" />}
                                    {status === 'in_progress' && <Sparkles className="h-5 w-5" />}
                                    {!status && <Circle className="h-5 w-5 opacity-30" />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover text-popover-foreground border">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.name} • {status ? status.replace('_', ' ') : 'Opportunity'}
                                  </p>
                                  <p className="text-xs mt-1">Click for details, double-click to toggle</p>
                                </TooltipContent>
                              </Tooltip>
                              {/* Print-only static cell */}
                              <div 
                                className="hidden print:flex w-full h-8 rounded items-center justify-center text-xs font-medium"
                                style={getCellStyle(status)}
                              >
                                {status === 'adopted' ? '✓' : status === 'in_progress' ? '◐' : '○'}
                              </div>
                            </div>
                          );
                        })}
                        <div className="w-20 shrink-0 p-2 flex items-center justify-center">
                          <Badge 
                            variant={gapCount > 3 ? "destructive" : gapCount > 1 ? "secondary" : "outline"}
                            className="font-bold"
                          >
                            {gapCount}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="configure" className="mt-6 no-print">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customers Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5" style={{ color: getStatTextColor(brandConfig.primaryColor) }} />
                        Customers
                      </CardTitle>
                      <CardDescription>Add or edit customer accounts</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={addCustomer} 
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
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {customers.map(customer => (
                      <div 
                        key={customer.id} 
                        className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        {editingCustomer === customer.id ? (
                          <>
                            <Input
                              value={customer.name}
                              onChange={(e) => updateCustomer(customer.id, { name: e.target.value })}
                              className="flex-1 h-8"
                              autoFocus
                            />
                            <Input
                              value={customer.segment || ''}
                              onChange={(e) => updateCustomer(customer.id, { segment: e.target.value })}
                              placeholder="Segment"
                              className="w-24 h-8"
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => setEditingCustomer(null)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{customer.name}</span>
                              {customer.segment && (
                                <Badge variant="outline" className="ml-2 text-[10px]">{customer.segment}</Badge>
                              )}
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => setEditingCustomer(customer.id)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Products Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" style={{ color: getStatTextColor(brandConfig.secondaryColor) }} />
                        Products
                      </CardTitle>
                      <CardDescription>Add or edit product offerings</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={addProduct} 
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
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {products.map(product => (
                      <div 
                        key={product.id} 
                        className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        {editingProduct === product.id ? (
                          <>
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                              className="flex-1 h-8"
                              autoFocus
                            />
                            <Input
                              value={product.category || ''}
                              onChange={(e) => updateProduct(product.id, { category: e.target.value })}
                              placeholder="Category"
                              className="w-24 h-8"
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => setEditingProduct(null)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{product.name}</span>
                              {product.category && (
                                <Badge variant="outline" className="ml-2 text-[10px]">{product.category}</Badge>
                              )}
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => setEditingProduct(product.id)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
                        Connect to your CRM (Salesforce, HubSpot, etc.) or import from CSV with these fields:
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Customer Fields</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">customer_name</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">segment</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">tier</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">arr</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">growth_stage</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Product Fields</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">product_name</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">category</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded">list_price</li>
                            <li className="font-mono text-xs bg-muted px-2 py-1 rounded text-amber-600 font-medium">status</li>
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic mt-4">
                        Include <span className="text-amber-600 font-medium">status</span> (adopted, in_progress, opportunity) to pre-populate ownership data.
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Cell Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${brandConfig.primaryColor}20`, color: getStatTextColor(brandConfig.primaryColor) }}
                >
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Whitespace Analysis</DialogTitle>
                  <DialogDescription>
                    {selectedCell?.customer.name} × {selectedCell?.product.name}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedCell && (() => {
              const score = calculateOpportunityScore(selectedCell.customer, selectedCell.product);
              const scoreBadge = getScoreBadge(score);
              const readiness = getReadinessScore(selectedCell.customer);
              const drivers = getGrowthDrivers(selectedCell.customer, selectedCell.product);
              const nextAction = getNextBestAction(selectedCell.customer, selectedCell.product, score);
              const customerOwned = ownership.filter(o => o.customerId === selectedCell.customer.id && o.status === 'adopted').length;
              const penetration = Math.round((customerOwned / products.length) * 100);
              const totalPotential = products.reduce((sum, p) => sum + (p.listPrice || 0), 0);
              const currentValue = products.filter(p => 
                ownership.some(o => o.customerId === selectedCell.customer.id && o.productId === p.id && o.status === 'adopted')
              ).reduce((sum, p) => sum + (p.listPrice || 0), 0);
              const whitespaceValue = totalPotential - currentValue;

              return (
                <div className="space-y-5 pt-2">
                  {/* Account Overview */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" style={{ color: getStatTextColor(brandConfig.primaryColor) }} />
                        Account Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Account Name</p>
                          <p className="font-semibold">{selectedCell.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current ARR</p>
                          <p className="font-semibold text-green-600">${(selectedCell.customer.arr || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Market Potential</p>
                          <p className="font-semibold">${totalPotential.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Whitespace Value</p>
                          <p className="font-semibold" style={{ color: getStatTextColor(brandConfig.accentColor) }}>${whitespaceValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Market Penetration</p>
                          <p className="font-semibold">{penetration}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Growth Stage</p>
                          <Badge variant="outline" className="mt-0.5 capitalize">{selectedCell.customer.growthStage || 'stable'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Details */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" style={{ color: getStatTextColor(brandConfig.secondaryColor) }} />
                        Product Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Product Name</p>
                          <p className="font-semibold">{selectedCell.product.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <Badge variant="secondary" className="mt-0.5">{selectedCell.product.category || 'General'}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">List Price</p>
                          <p className="font-semibold">${(selectedCell.product.listPrice || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Opportunity Analysis */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" style={{ color: getStatTextColor(brandConfig.primaryColor) }} />
                        Opportunity Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Opportunity Score</p>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>{score}</span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <Badge 
                          className="h-7 px-3 font-semibold"
                          style={{ backgroundColor: scoreBadge.bgColor, color: scoreBadge.color }}
                        >
                          🟢 {scoreBadge.label}
                        </Badge>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Why this score?
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 mt-0.5">Market</Badge>
                            <span className="text-muted-foreground">
                              {penetration < 30 ? 'Low penetration rate indicates significant expansion opportunity' : 
                               penetration < 60 ? 'Moderate penetration with room for growth' : 
                               'High penetration may limit expansion potential'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 mt-0.5">Growth</Badge>
                            <span className="text-muted-foreground">
                              {selectedCell.customer.growthStage === 'hypergrowth' ? 'Hypergrowth account ready for rapid expansion' :
                               selectedCell.customer.growthStage === 'growing' ? 'Growing account with healthy expansion trajectory' :
                               selectedCell.customer.growthStage === 'stable' ? 'Account maturity may impact expansion timing' :
                               'At-risk account requires stabilization first'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 mt-0.5">Prerequisites</Badge>
                            <span className="text-muted-foreground">
                              {(!selectedCell.product.prerequisites || selectedCell.product.prerequisites.length === 0) ? 
                                'No prerequisites required, ready for immediate implementation' :
                                selectedCell.product.prerequisites.every(prereq => 
                                  ownership.some(o => o.customerId === selectedCell.customer.id && o.productId === prereq && o.status === 'adopted')
                                ) ? 'All prerequisite products are adopted, ready for immediate implementation' :
                                'Some prerequisite products still needed before this expansion'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 mt-0.5">Strategic</Badge>
                            <span className="text-muted-foreground">
                              {selectedCell.product.strategicValue === 'core' ? 'Core product establishes platform foundation' :
                               selectedCell.product.strategicValue === 'expansion' ? 'Expansion product enhances overall platform value' :
                               'Premium solution indicates account maturity and budget'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Intelligence */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" style={{ color: getStatTextColor(brandConfig.primaryColor) }} />
                        Account Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted-foreground">Expansion Readiness</p>
                            <span className="text-sm font-semibold">{readiness}/100</span>
                          </div>
                          <Progress value={readiness} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {readiness >= 70 ? 'High Readiness' : readiness >= 40 ? 'Medium Readiness' : 'Low Readiness'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Growth Trajectory</p>
                          <div className="flex items-center gap-2">
                            {selectedCell.customer.growthStage === 'hypergrowth' && <TrendingUp className="h-5 w-5 text-green-500" />}
                            {selectedCell.customer.growthStage === 'growing' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                            {selectedCell.customer.growthStage === 'stable' && <Activity className="h-5 w-5 text-yellow-500" />}
                            {selectedCell.customer.growthStage === 'at-risk' && <TrendingDown className="h-5 w-5 text-red-500" />}
                            <span className="font-medium capitalize">{selectedCell.customer.growthStage || 'Stable'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-3">Readiness Factors</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Growth Stage</span>
                            <span className="font-medium">{selectedCell.customer.growthStage === 'hypergrowth' ? '10pts' : selectedCell.customer.growthStage === 'growing' ? '15pts' : '10pts'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Market Penetration</span>
                            <span className="font-medium">{Math.round((1 - penetration/100) * 25)}pts</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Relationship Strength</span>
                            <span className="font-medium">{Math.round((selectedCell.customer.relationshipStrength || 50) / 100 * 15)}pts</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Account Size</span>
                            <span className="font-medium">{selectedCell.customer.accountSize === 'enterprise' ? '10pts' : selectedCell.customer.accountSize === 'mid-market' ? '15pts' : '5pts'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Best Action */}
                  <div 
                    className="rounded-xl p-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${brandConfig.primaryColor}15, ${brandConfig.secondaryColor}15)`,
                      borderLeft: `4px solid ${getStatTextColor(brandConfig.primaryColor)}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4" style={{ color: getStatTextColor(brandConfig.primaryColor) }} />
                      <span className="text-sm font-semibold">Next Best Action</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{nextAction}</p>
                  </div>

                  {/* Growth Drivers */}
                  {drivers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Growth Drivers
                      </p>
                      <ul className="space-y-1">
                        {drivers.map((driver, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ArrowRight className="h-3 w-3" style={{ color: getStatTextColor(brandConfig.primaryColor) }} />
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Status Toggle */}
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Change Status</Label>
                    <div className="flex gap-2">
                      {(['adopted', 'in_progress', 'opportunity'] as const).map((status) => {
                        const isActive = selectedCell.ownership?.status === status || (!selectedCell.ownership && status === 'opportunity');
                        const btnColor = status === 'adopted' 
                          ? (isLightColor(brandConfig.primaryColor, 0.7) ? darkestBrandColor : brandConfig.primaryColor)
                          : status === 'in_progress' 
                            ? (isLightColor(brandConfig.secondaryColor, 0.7) ? darkestBrandColor : brandConfig.secondaryColor)
                            : undefined;
                        
                        return (
                          <Button
                            key={status}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            style={isActive && btnColor ? { 
                              backgroundColor: btnColor,
                              color: getContrastColor(btnColor)
                            } : undefined}
                            onClick={() => {
                              if (status === 'opportunity') {
                                setOwnership(ownership.filter(o => 
                                  !(o.customerId === selectedCell.customer.id && o.productId === selectedCell.product.id)
                                ));
                              } else {
                                const existing = getOwnership(selectedCell.customer.id, selectedCell.product.id);
                                if (existing) {
                                  setOwnership(ownership.map(o => 
                                    o.customerId === selectedCell.customer.id && o.productId === selectedCell.product.id
                                      ? { ...o, status }
                                      : o
                                  ));
                                } else {
                                  setOwnership([...ownership, { 
                                    customerId: selectedCell.customer.id, 
                                    productId: selectedCell.product.id, 
                                    status 
                                  }]);
                                }
                              }
                              setSelectedCell({
                                ...selectedCell,
                                ownership: status === 'opportunity' ? undefined : { 
                                  customerId: selectedCell.customer.id, 
                                  productId: selectedCell.product.id, 
                                  status 
                                }
                              });
                            }}
                          >
                            {status === 'adopted' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                            {status === 'in_progress' && <Sparkles className="h-4 w-4 mr-1" />}
                            {status === 'opportunity' && <Circle className="h-4 w-4 mr-1" />}
                            {status.replace('_', ' ')}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Notes</Label>
                    <Textarea 
                      placeholder="Add notes about this opportunity..."
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={() => setDetailOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

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
          toolInterest="whitespace"
        />

        {/* Hidden PDF Export - Page 1: Summary with KPIs */}
        <PdfPage
          ref={pdfPage1Ref}
          logoUrl={brandConfig.logoUrl}
          companyName={brandConfig.companyName}
          toolName="Whitespace Analysis"
          subtitle={brandConfig.industry ? `${brandConfig.industry} • Expansion Opportunity Analysis` : 'Expansion Opportunity Analysis'}
          primaryColor={brandConfig.primaryColor}
          secondaryColor={brandConfig.secondaryColor}
          badges={brandConfig.industry ? [{ label: 'Industry', value: brandConfig.industry }] : []}
          pageNumber={1}
          totalPages={2}
          benefitBlurb="This analysis identifies expansion opportunities across your customer base, revealing gaps in product adoption and potential revenue that can be captured through targeted cross-sell and upsell efforts."
        >
          <div className="flex flex-col h-full gap-3">
            {/* Key Metrics */}
            <div className="grid grid-cols-6 gap-3">
              {pdfMetrics.map((metric, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                  <div className="text-lg font-bold" style={{ color: metric.color || '#1a1a2e' }}>
                    {metric.value}
                  </div>
                </div>
              ))}
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
            
            {/* Compact Grid Preview */}
            <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
              <WhitespacePdfGrid
                customers={customers}
                products={products}
                ownership={ownership}
                primaryColor={brandConfig.primaryColor}
                secondaryColor={brandConfig.secondaryColor}
                isDetailPage={false}
              />
            </div>
          </div>
        </PdfPage>
        
        {/* Hidden PDF Export - Page 2: Full Grid Detail */}
        <PdfPage
          ref={pdfPage2Ref}
          logoUrl={brandConfig.logoUrl}
          companyName={brandConfig.companyName}
          toolName="Whitespace Analysis"
          subtitle="Full Grid Detail"
          primaryColor={brandConfig.primaryColor}
          secondaryColor={brandConfig.secondaryColor}
          pageNumber={2}
          totalPages={2}
          minimalHeader
        >
          <div className="h-full border border-gray-100 rounded-lg overflow-hidden">
            <WhitespacePdfGrid
              customers={customers}
              products={products}
              ownership={ownership}
              primaryColor={brandConfig.primaryColor}
              secondaryColor={brandConfig.secondaryColor}
              isDetailPage={true}
            />
          </div>
        </PdfPage>
      </div>
    </TooltipProvider>
  );
}
