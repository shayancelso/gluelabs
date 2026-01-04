import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandConfig } from './PrototypeBrandingBar';

interface PrototypeToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  screenshot?: string;
  onBuild: (id: string) => void;
  brandConfig: BrandConfig;
}

export function PrototypeToolCard({
  id,
  name,
  description,
  screenshot,
  onBuild,
  brandConfig,
}: PrototypeToolCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200/80 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Screenshot Preview */}
      {screenshot && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 p-3">
          <div className="rounded-lg overflow-hidden border border-gray-200/50 shadow-sm">
            <img
              src={screenshot}
              alt={`${name} preview`}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1.5 text-base">
          {name}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* Button + Color Dots Row */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={() => onBuild(id)}
            className="rounded-full px-5 h-9 text-sm font-medium text-white"
            style={{
              background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
            }}
          >
            <ArrowRight className="h-4 w-4 mr-1.5" />
            Build Now
          </Button>

          {/* Color Dots */}
          <div className="flex gap-1.5 items-center">
            <div
              className="h-5 w-5 rounded-md shadow-sm border border-white/50"
              style={{ backgroundColor: brandConfig.primaryColor }}
            />
            <div
              className="h-5 w-5 rounded-full shadow-sm border border-white/50"
              style={{ backgroundColor: brandConfig.secondaryColor }}
            />
            <div
              className="h-5 w-5 rounded-full shadow-sm border border-white/50"
              style={{ backgroundColor: brandConfig.accentColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
