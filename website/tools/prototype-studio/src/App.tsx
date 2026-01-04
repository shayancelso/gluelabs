import { useState, useEffect, useRef } from 'react';
import { Grid3X3, Calculator, Target, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrototypeBrandingBar, type BrandConfig } from '@/components/prototypes/PrototypeBrandingBar';
import { PrototypeToolCard } from '@/components/prototypes/PrototypeToolCard';
import { HeroMockup } from '@/components/prototypes/HeroMockup';
import { WhitespacePrototype } from '@/components/prototypes/WhitespacePrototype';
import { ROIPrototype } from '@/components/prototypes/ROIPrototype';
import { SuccessPlanPrototype } from '@/components/prototypes/SuccessPlanPrototype';
import { DiscoveryPrototype } from '@/components/prototypes/DiscoveryPrototype';
import { WelcomeDialog } from '@/components/prototypes/WelcomeDialog';
import { ContactDialog } from '@/components/prototypes/ContactDialog';
import louMascot from '@/assets/lou-mascot.png';
import louMagicWand from '@/assets/lou-magic-wand.png';
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
    description: 'Account-product opportunity matrix showing adoption and expansion opportunities across..',
    icon: Grid3X3,
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Interactive calculator to demostrate time savings, cost reduction, and new impact of...',
    icon: Calculator,
  },
  {
    id: 'success-plan',
    name: 'Mutual Success Plan',
    description: 'Work-back implementation planner with milestones, owners, and timelines for customer success..',
    icon: Target,
  },
  {
    id: 'discovery',
    name: 'Discovery Questionnaire',
    description: 'Guided discovery flow to understand customer needs and map solutions to their pain points...',
    icon: ClipboardList,
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

  const handleMagicify = () => {
    // Focus the input in the branding bar
    const input = document.querySelector('input[placeholder*="nike.com"]') as HTMLInputElement;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
        <div className="pt-6 md:pt-10 px-4 md:px-8 pb-8 md:pb-12 max-w-6xl mx-auto relative">
          {/* Hero Section - Centered Layout */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4 gradient-text animate-title-in font-display">
              Try Our Tools
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
              See Gloo tools in action with your own branding. Enter your company and personalize the preview.
            </p>
          </div>

          {/* Hero Section - Layered Layout */}
          <div className="relative mb-16 md:mb-24">
            {/* Floating Badges */}
            <div className="hidden md:block absolute -left-4 top-8 animate-float z-10">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                Expansion
              </div>
            </div>
            <div className="hidden md:block absolute -right-4 top-16 animate-float-delayed z-10">
              <div className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                Analyzed
              </div>
            </div>
            <div className="hidden md:block absolute left-8 bottom-24 animate-float z-10">
              <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                Whitespace
              </div>
            </div>
            <div className="hidden md:block absolute right-12 bottom-32 animate-float-delayed z-10">
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                $2.4M Pipeline
              </div>
            </div>

            {/* Layered Container */}
            <div className="relative max-w-3xl mx-auto">
              {/* Background: Browser Mockup with fade */}
              <div className="absolute inset-0 flex justify-end items-start pt-8 pr-0 md:pr-4">
                <div className="w-[320px] md:w-[400px] opacity-40 transform translate-x-16 md:translate-x-24">
                  <div
                    className="relative"
                    style={{
                      maskImage: 'linear-gradient(to left, transparent 0%, black 40%)',
                      WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 40%)',
                    }}
                  >
                    <HeroMockup onMagicify={handleMagicify} />
                  </div>
                </div>
              </div>

              {/* Lou peeking from behind the card */}
              <div className="absolute -right-4 md:right-8 bottom-4 md:bottom-8 z-30">
                <img
                  src={louMagicWand}
                  alt="Lou with magic wand"
                  className="h-28 w-28 md:h-40 md:w-40 object-contain drop-shadow-xl"
                />
                {/* Sparkle effects */}
                <div className="absolute top-1 left-2 animate-sparkle">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full opacity-80" />
                </div>
                <div className="absolute top-4 left-6 animate-sparkle-delayed">
                  <div className="w-1.5 h-1.5 bg-pink-300 rounded-full opacity-70" />
                </div>
              </div>

              {/* Foreground: Branding Input Card - STRETCHED WIDE */}
              <div className="relative z-20 w-full max-w-2xl mx-auto">
                <PrototypeBrandingBar
                  brandConfig={brandConfig}
                  onBrandChange={setBrandConfig}
                  onReset={handleResetBranding}
                  heroCard
                />
              </div>
            </div>
          </div>

          {/* Featured Tools Section */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
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
                <h3 className="text-lg md:text-xl font-bold mb-1">Questions about our tools?</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Let's chat about building custom tools for your team.
                </p>
              </div>
              <Button
                onClick={() => setShowContactDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 rounded-full"
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
