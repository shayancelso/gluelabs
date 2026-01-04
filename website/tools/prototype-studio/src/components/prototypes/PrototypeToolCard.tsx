import { useState } from 'react';
import { LucideIcon, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandConfig } from './PrototypeBrandingBar';
import glooWordmark from '@/assets/gloo-wordmark.png';
import louMascot from '@/assets/lou-mascot.png';

interface PrototypeToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  onBuild: (id: string) => void;
  brandConfig: BrandConfig;
}

export function PrototypeToolCard({
  id,
  name,
  description,
  icon: Icon,
  onBuild,
  brandConfig,
}: PrototypeToolCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isCustomBrand = brandConfig.companyName && brandConfig.companyName !== 'Gloo';

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:shadow-primary/5 flex flex-col h-full"
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${brandConfig.primaryColor}10 0%, ${brandConfig.secondaryColor}10 100%)`,
        }}
      />

      <CardHeader className="relative pb-2 p-3 md:p-6 md:pb-2 flex-1">
        {/* Icon/Logo container - centered with layered design */}
        <div className="flex justify-center mb-3 md:mb-4">
          <div className="relative">
            {/* Main icon container with gradient */}
            <div 
              className="flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-2xl md:rounded-3xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${brandConfig.primaryColor}20 0%, ${brandConfig.secondaryColor}20 100%)`,
                boxShadow: `0 4px 20px -4px ${brandConfig.primaryColor}30`,
              }}
            >
              <div
                className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
                }}
              >
                <Icon className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
            </div>

            {/* Company logo badge - show Lou for Gloo, company logo for custom brands */}
            <div 
              className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 h-7 w-7 md:h-10 md:w-10 rounded-full bg-background border-2 border-background shadow-lg flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform"
            >
              {isCustomBrand && brandConfig.logoUrl ? (
                <img 
                  src={brandConfig.logoUrl} 
                  alt={`${brandConfig.companyName} logo`}
                  className="h-5 w-5 md:h-7 md:w-7 object-contain"
                />
              ) : (
                <img 
                  src={louMascot} 
                  alt="Lou"
                  className="h-5 w-5 md:h-7 md:w-7 object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Company branding indicator - show Gloo wordmark or company name */}
        <div className="flex justify-center mb-2">
          {isCustomBrand ? (
            <span 
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${brandConfig.primaryColor}15`,
                color: brandConfig.primaryColor,
              }}
            >
              {brandConfig.companyName}
            </span>
          ) : (
            <img 
              src={glooWordmark} 
              alt="Gloo" 
              className="h-5 md:h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        <CardTitle className="text-sm md:text-lg text-center line-clamp-2 leading-tight">
          {name}
        </CardTitle>
        
        {/* Description with expand/collapse */}
        <div className="relative">
          <CardDescription 
            className={`text-xs md:text-sm leading-relaxed text-center transition-all ${
              isDescriptionExpanded ? '' : 'line-clamp-2 md:line-clamp-3'
            }`}
          >
            {description}
          </CardDescription>
          {description.length > 80 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDescriptionExpanded(!isDescriptionExpanded);
              }}
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto mt-1"
            >
              {isDescriptionExpanded ? (
                <>
                  <span>Less</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>More</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative pt-0 pb-3 md:pb-5 px-3 md:px-6 mt-auto">
        <Button
          size="sm"
          className="w-full group/btn text-xs md:text-sm h-8 md:h-9 transition-all duration-200"
          onClick={() => onBuild(id)}
          style={{
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
          }}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden md:inline">Build Now</span>
          <span className="md:hidden">Build</span>
        </Button>
      </CardContent>
    </Card>
  );
}
