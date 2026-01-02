import { useState } from 'react';
import { X, Grid3X3, Calculator, Target, ClipboardList, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrototypeBrandingBar, type BrandConfig } from '@/components/prototypes/PrototypeBrandingBar';
import { PrototypeToolCard } from '@/components/prototypes/PrototypeToolCard';
import { WhitespacePrototype } from '@/components/prototypes/WhitespacePrototype';
import { ROIPrototype } from '@/components/prototypes/ROIPrototype';
import { SuccessPlanPrototype } from '@/components/prototypes/SuccessPlanPrototype';
import { DiscoveryPrototype } from '@/components/prototypes/DiscoveryPrototype';

const PROTOTYPE_TOOLS = [
  {
    id: 'whitespace',
    name: 'Whitespace Visualizer',
    description: 'Account-product opportunity matrix showing adoption and expansion opportunities across your customer base.',
    icon: Grid3X3,
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Interactive calculator to demonstrate time savings, cost reduction, and revenue impact of your solution.',
    icon: Calculator,
  },
  {
    id: 'success-plan',
    name: 'Mutual Success Plan',
    description: 'Work-back implementation planner with milestones, owners, and timeline for customer success.',
    icon: Target,
  },
  {
    id: 'discovery',
    name: 'Discovery Questionnaire',
    description: 'Guided discovery flow to understand prospect needs and map solutions to their pain points.',
    icon: ClipboardList,
  },
];

// Default Gloo branding
const DEFAULT_BRAND: BrandConfig = {
  logoUrl: null,
  primaryColor: 'hsl(270, 60%, 50%)',
  secondaryColor: 'hsl(330, 70%, 60%)',
  accentColor: 'hsl(290, 55%, 55%)',
  backgroundColor: 'hsl(0, 0%, 99%)',
  textColor: 'hsl(240, 10%, 10%)',
  companyName: 'Gloo',
};

function App() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(DEFAULT_BRAND);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleExit = () => {
    // Navigate back to tools page
    window.location.href = '/tools/';
  };

  const handleResetBranding = () => {
    setBrandConfig(DEFAULT_BRAND);
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleBuildPrototype = () => {
    if (selectedTool) {
      setIsBuilding(true);
    }
  };

  const handleCloseBuilder = () => {
    setIsBuilding(false);
  };

  const handleBackToSelection = () => {
    setSelectedTool(null);
  };

  // Render the prototype builder for the selected tool
  if (isBuilding && selectedTool === 'whitespace') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
        <div className="p-8 max-w-[1600px] mx-auto">
          <WhitespacePrototype brandConfig={brandConfig} onClose={handleCloseBuilder} />
        </div>
      </div>
    );
  }

  // Render ROI prototype builder
  if (isBuilding && selectedTool === 'roi') {
    return (
      <ROIPrototype
        onClose={handleCloseBuilder}
        initialBrandConfig={brandConfig}
      />
    );
  }

  // Render Success Plan prototype builder
  if (isBuilding && selectedTool === 'success-plan') {
    return (
      <SuccessPlanPrototype
        onClose={handleCloseBuilder}
        initialBrandConfig={brandConfig}
      />
    );
  }

  // Render Discovery prototype builder
  if (isBuilding && selectedTool === 'discovery') {
    return (
      <DiscoveryPrototype
        onClose={handleCloseBuilder}
        initialBrandConfig={brandConfig}
      />
    );
  }

  const isToolAvailable = (toolId: string) => toolId === 'whitespace' || toolId === 'roi' || toolId === 'success-plan' || toolId === 'discovery';

  const getToolDescription = (toolId: string) => {
    if (toolId === 'whitespace') {
      return 'Configure your customer-product matrix with sample data and branding.';
    }
    if (toolId === 'roi') {
      return 'Configure roles, hourly rates, and time savings to calculate ROI for prospects.';
    }
    if (toolId === 'success-plan') {
      return 'Build a visual workback timeline with stages, owners, and a target sign date.';
    }
    if (toolId === 'discovery') {
      return 'Create a guided discovery questionnaire with multiple question types to understand prospect needs.';
    }
    return 'This prototype builder is coming soon.';
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        '--prototype-primary': brandConfig.primaryColor,
        '--prototype-secondary': brandConfig.secondaryColor,
        '--prototype-accent': brandConfig.accentColor,
        '--prototype-bg': brandConfig.backgroundColor,
        '--prototype-text': brandConfig.textColor,
      } as React.CSSProperties}
    >
      {/* Full-screen container with gradient + dot grid background */}
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 85% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 95% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse 40% 30% at 10% 90%, rgba(168, 85, 247, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, #fafafa 0%, #f8f7fc 100%)
          `,
        }}
      >
        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(120, 100, 140, 0.12) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        {/* Exit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="fixed top-3 left-3 md:top-4 md:left-4 z-50 gap-1.5 md:gap-2 bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all text-xs md:text-sm px-2.5 md:px-3"
        >
          <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Exit Prototypes</span>
          <span className="sm:hidden">Exit</span>
        </Button>

        {/* Main content */}
        <div className="pt-14 md:pt-20 px-4 md:px-8 pb-8 md:pb-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-10">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Sales Demo Builder
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 md:mb-3 gradient-text">
              Prototype Studio
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-2">
              Create branded, interactive demos of Gloo tools customized for your prospects.
              <span className="hidden md:inline"> Upload their branding and configure sample data to showcase value.</span>
            </p>
          </div>

          {/* Branding Configuration Bar */}
          <PrototypeBrandingBar
            brandConfig={brandConfig}
            onBrandChange={setBrandConfig}
            onReset={handleResetBranding}
          />

          {/* Tool Selection Grid */}
          <div className="mt-6 md:mt-10">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <span className="h-6 md:h-8 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
              Select a Tool
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {PROTOTYPE_TOOLS.map((tool) => (
                <PrototypeToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  icon={tool.icon}
                  isSelected={selectedTool === tool.id}
                  onSelect={handleToolSelect}
                  brandConfig={brandConfig}
                />
              ))}
            </div>
          </div>

          {/* Selected Tool Action Area */}
          {selectedTool && (
            <div className="mt-6 md:mt-10 p-4 md:p-8 rounded-xl md:rounded-2xl border border-border bg-card/80 backdrop-blur-sm animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 truncate">
                    {PROTOTYPE_TOOLS.find(t => t.id === selectedTool)?.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-none">
                    {getToolDescription(selectedTool)}
                  </p>
                </div>
                <div className="flex gap-2 md:gap-3 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleBackToSelection} className="flex-1 md:flex-none">
                    <ArrowLeft className="h-4 w-4 mr-1.5 md:mr-2" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBuildPrototype}
                    disabled={!isToolAvailable(selectedTool)}
                    className="flex-1 md:flex-none"
                    style={isToolAvailable(selectedTool) ? {
                      background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`
                    } : undefined}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 md:mr-2" />
                    {isToolAvailable(selectedTool) ? 'Build' : 'Soon'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
