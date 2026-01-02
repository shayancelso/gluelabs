import { LucideIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandConfig } from './PrototypeBrandingBar';

interface PrototypeToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onSelect: (id: string) => void;
  brandConfig: BrandConfig;
}

export function PrototypeToolCard({
  id,
  name,
  description,
  icon: Icon,
  isSelected,
  onSelect,
  brandConfig,
}: PrototypeToolCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-primary shadow-lg shadow-primary/10' 
          : 'hover:border-primary/50 hover:shadow-primary/5'
      }`}
      onClick={() => onSelect(id)}
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${brandConfig.primaryColor}10 0%, ${brandConfig.secondaryColor}10 100%)`,
        }}
      />

      {/* Selected indicator */}
      {isSelected && (
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
          }}
        />
      )}

      <CardHeader className="relative pb-2 p-3 md:p-6 md:pb-2">
        <div 
          className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl transition-all duration-300"
          style={{
            backgroundColor: `${brandConfig.primaryColor}15`,
            color: brandConfig.primaryColor,
          }}
        >
          <Icon className="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <CardTitle className="text-sm md:text-lg mt-2 md:mt-4 line-clamp-1">{name}</CardTitle>
        <CardDescription className="line-clamp-2 md:line-clamp-3 text-xs md:text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative pt-0 pb-3 md:pb-5 px-3 md:px-6">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          className="w-full group/btn text-xs md:text-sm h-8 md:h-9"
          style={isSelected ? {
            background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
          } : undefined}
        >
          <span className="hidden md:inline">{isSelected ? 'Selected' : 'Build Prototype'}</span>
          <span className="md:hidden">{isSelected ? 'Selected' : 'Build'}</span>
          <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
