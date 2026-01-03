interface PdfHeaderProps {
  logoUrl?: string;
  companyName: string;
  toolName: string;
  subtitle?: string;
  primaryColor: string;
  secondaryColor?: string;
  badges?: Array<{ label: string; value: string }>;
}

export function PdfHeader({
  logoUrl,
  companyName,
  toolName,
  subtitle,
  primaryColor,
  secondaryColor,
  badges = [],
}: PdfHeaderProps) {
  return (
    <div 
      className="flex items-center justify-between rounded-xl px-6 py-4"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})`,
      }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {logoUrl && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 shrink-0">
            <img 
              src={logoUrl} 
              alt={`${companyName} logo`}
              className="h-14 w-auto object-contain"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-white break-words">
            {companyName} {toolName}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-sm mt-0.5 break-words whitespace-normal">{subtitle}</p>
          )}
        </div>
      </div>
      
      {badges.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-end shrink-0 ml-4">
          {badges.map((badge, i) => (
            <div 
              key={i}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm whitespace-nowrap"
            >
              <span className="opacity-70">{badge.label}:</span>{' '}
              <span className="font-medium">{badge.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
