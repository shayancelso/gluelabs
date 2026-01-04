import { useState, useEffect, useRef } from 'react';
import { Grid3X3, Calculator, Target, ClipboardList, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrototypeBrandingBar, type BrandConfig } from '@/components/prototypes/PrototypeBrandingBar';
import { PrototypeToolCard } from '@/components/prototypes/PrototypeToolCard';
import { WhitespacePrototype } from '@/components/prototypes/WhitespacePrototype';
import { ROIPrototype } from '@/components/prototypes/ROIPrototype';
import { SuccessPlanPrototype } from '@/components/prototypes/SuccessPlanPrototype';
import { DiscoveryPrototype } from '@/components/prototypes/DiscoveryPrototype';
import { WelcomeDialog } from '@/components/prototypes/WelcomeDialog';
import { ContactDialog } from '@/components/prototypes/ContactDialog';
import louMascot from '@/assets/lou-mascot.png';
import heroMockup from '@/assets/hero.png';
import whitespaceScreenshot from '@/assets/whitespace-visualizer.png';
import roiScreenshot from '@/assets/ROI-Calculator.png';
import successPlanScreenshot from '@/assets/mutual-success-plan.png';
import discoveryScreenshot from '@/assets/discovery-questionnaire.png';
import {
  startPrototypeSession,
  updateSessionBrand,
  trackToolView,
  updateSessionActivity
} from '@/lib/prototypeAnalytics';

const PROTOTYPE_TOOLS = [
  {
    id: 'whitespace',
    name: 'Whitespace Visualizer',
    description: 'Account-product opportunity matrix showing adoption and expansion opportunities across...',
    icon: Grid3X3,
    screenshot: whitespaceScreenshot,
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Interactive calculator to demonstrate time savings, cost reduction, and new impact of...',
    icon: Calculator,
    screenshot: roiScreenshot,
  },
  {
    id: 'success-plan',
    name: 'Mutual Success Plan',
    description: 'Work-back implementation planner with milestones, owners, and timelines for customer success..',
    icon: Target,
    screenshot: successPlanScreenshot,
  },
  {
    id: 'discovery',
    name: 'Discovery Questionnaire',
    description: 'Guided discovery flow to understand customer needs and map solutions to their pain points...',
    icon: ClipboardList,
    screenshot: discoveryScreenshot,
  },
];

// Default Gloo branding - matches main website colors
const DEFAULT_BRAND: BrandConfig = {
  logoUrl: null,
  primaryColor: '#6366f1',
  secondaryColor: '#ec4899',
  accentColor: '#8b5cf6',
  backgroundColor: '#fafafa',
  textColor: '#0f172a',
  companyName: 'Gloo',
};

function App() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(DEFAULT_BRAND);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const hasShownWelcome = useRef(false);
  const activityInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize session tracking
  useEffect(() => {
    startPrototypeSession().then(id => {
      setSessionId(id);
    });

    // Update activity every 30 seconds
    activityInterval.current = setInterval(() => {
      if (sessionId) {
        updateSessionActivity(sessionId);
      }
    }, 30000);

    return () => {
      if (activityInterval.current) {
        clearInterval(activityInterval.current);
      }
    };
  }, []);

  // Track brand changes
  useEffect(() => {
    if (sessionId && brandConfig.companyName !== 'Gloo') {
      updateSessionBrand(sessionId, brandConfig);

      // Show welcome dialog when brand is first loaded (not on reset)
      if (!hasShownWelcome.current && brandConfig.companyName !== 'Gloo') {
        hasShownWelcome.current = true;
        setShowWelcome(true);
      }
    }
  }, [sessionId, brandConfig]);

  const handleResetBranding = () => {
    setBrandConfig(DEFAULT_BRAND);
    hasShownWelcome.current = false;
  };

  const handleBuildTool = (toolId: string) => {
    setActiveTool(toolId);
    if (sessionId) {
      trackToolView(sessionId, toolId);
    }
  };

  const handleCloseBuilder = () => {
    setActiveTool(null);
  };

  // Render the prototype builder for the selected tool
  if (activeTool === 'whitespace') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
        <div className="px-8 pb-8 pt-6 md:pt-8 max-w-[1600px] mx-auto">
          <WhitespacePrototype brandConfig={brandConfig} onClose={handleCloseBuilder} />
        </div>
      </div>
    );
  }

  if (activeTool === 'roi') {
    return (
      <ROIPrototype
        onClose={handleCloseBuilder}
        initialBrandConfig={brandConfig}
      />
    );
  }

  if (activeTool === 'success-plan') {
    return (
      <SuccessPlanPrototype
        onClose={handleCloseBuilder}
        initialBrandConfig={brandConfig}
      />
    );
  }

  if (activeTool === 'discovery') {
    return (
      <DiscoveryPrototype
        onClose={handleCloseBuilder}
        initialBrandConfig={brandConfig}
      />
    );
  }

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
        className="min-h-screen relative overflow-hidden noise-overlay"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 85% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 95% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse 40% 30% at 10% 90%, rgba(99, 102, 241, 0.06) 0%, transparent 40%),
            linear-gradient(180deg, #fafafa 0%, #f8f9fc 100%)
          `,
        }}
      >
        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(99, 102, 241, 0.08) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Main content */}
        <div className="pt-6 md:pt-10 px-4 md:px-8 pb-8 md:pb-12 max-w-6xl mx-auto">
          {/* Hero Section - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-16">
            {/* Left Side - Text + Branding Input */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4 gradient-text animate-title-in font-display">
                Try Our Tools
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg mb-6 md:mb-8 max-w-md">
                See Gloo tools in action with your own branding. Enter your company and personalize the preview.
              </p>

              {/* Compact Branding Input */}
              <PrototypeBrandingBar
                brandConfig={brandConfig}
                onBrandChange={setBrandConfig}
                onReset={handleResetBranding}
                compact
              />
            </div>

            {/* Right Side - Hero Mockup with Lou */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Lou mascot - positioned top right */}
              <img
                src={louMascot}
                alt="Lou"
                className="absolute -top-4 md:-top-8 right-4 md:right-0 h-20 w-20 md:h-28 md:w-28 object-contain z-10 drop-shadow-lg"
              />

              {/* Browser mockup */}
              <div className="relative">
                <img
                  src={heroMockup}
                  alt="Gloo tool preview"
                  className="w-full max-w-md rounded-xl shadow-2xl shadow-purple-500/20"
                />

                {/* Magicify button */}
                <Button
                  onClick={() => {
                    // Trigger the branding load if not already custom
                    if (brandConfig.companyName === 'Gloo') {
                      // Focus the input in the branding bar
                      const input = document.querySelector('input[placeholder*="nike.com"]') as HTMLInputElement;
                      if (input) input.focus();
                    }
                  }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 shadow-lg"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Magicify My Brand
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Tools Section */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              Featured Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {PROTOTYPE_TOOLS.map((tool) => (
                <PrototypeToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  icon={tool.icon}
                  screenshot={tool.screenshot}
                  onBuild={handleBuildTool}
                  brandConfig={brandConfig}
                />
              ))}
            </div>
          </div>

          {/* Contact Section with Lou */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-pink-500/5 border border-primary/10">
              <img
                src={louMascot}
                alt="Lou"
                className="h-20 w-20 md:h-24 md:w-24 object-contain"
              />
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-1">Questions about our tools?</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Let's chat about building custom tools for your team.
                </p>
              </div>
              <Button
                onClick={() => setShowContactDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-5 text-base"
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Dialog */}
      <WelcomeDialog
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        companyName={brandConfig.companyName}
        logoUrl={brandConfig.logoUrl}
      />

      {/* Contact Dialog */}
      <ContactDialog
        open={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        brandConfig={brandConfig}
        sessionId={sessionId}
        fromMainPage
      />
    </div>
  );
}

export default App;
