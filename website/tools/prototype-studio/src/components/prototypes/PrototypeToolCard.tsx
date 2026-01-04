import { LucideIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandConfig } from './PrototypeBrandingBar';

interface PrototypeToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  screenshot: string;
  onBuild: (id: string) => void;
  brandConfig: BrandConfig;
}

export function PrototypeToolCard({
  id,
  name,
  description,
  icon: Icon,
  screenshot,
  onBuild,
  brandConfig,
}: PrototypeToolCardProps) {
  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col h-full bg-white border-gray-200/80"
    >
      {/* Screenshot Preview */}
      <div className="relative overflow-hidden">
        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={screenshot}
            alt={`${name} preview`}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}40 0%, ${brandConfig.secondaryColor}40 100%)`,
          }}
        />

        {/* Icon badge */}
        <div
          className="absolute top-3 left-3 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
          }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        {/* Color dots indicator - right side */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <div
            className="h-3 w-3 rounded-full shadow-sm border border-white/50"
            style={{ backgroundColor: brandConfig.primaryColor }}
          />
          <div
            className="h-3 w-3 rounded-full shadow-sm border border-white/50"
            style={{ backgroundColor: brandConfig.secondaryColor }}
          />
          <div
            className="h-3 w-3 rounded-full shadow-sm border border-white/50"
            style={{ backgroundColor: brandConfig.accentColor }}
          />
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="flex flex-col flex-1 p-4 md:p-5">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {name}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
          {description}
        </p>

        <Button
          variant="ghost"
          className="w-full justify-between group/btn text-sm font-medium h-10 px-4 hover:bg-transparent"
          onClick={() => onBuild(id)}
          style={{
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
            color: 'white',
          }}
        >
          <span>Build Now</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
