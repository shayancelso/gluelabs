import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import louContact from '@/assets/lou-contact.png';

export type BannerState = 'hidden' | 'expanded' | 'minimized';

interface LikeWhatYouSeeBannerProps {
  state: BannerState;
  onContact: () => void;
  onMinimize: () => void;
  onExpand: () => void;
  companyName?: string;
}

export function LikeWhatYouSeeBanner({ 
  state, 
  onContact, 
  onMinimize, 
  onExpand, 
  companyName 
}: LikeWhatYouSeeBannerProps) {
  // Hidden - render nothing
  if (state === 'hidden') return null;

  // Minimized state - just Lou icon on the right side
  if (state === 'minimized') {
    return (
      <button
        onClick={onExpand}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl shadow-purple-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 animate-fade-in"
        aria-label="Open contact banner"
      >
        <img 
          src={louContact} 
          alt="Lou" 
          className="h-10 w-10 object-contain"
          style={{ animation: 'bounce 2s ease-in-out infinite' }}
        />
      </button>
    );
  }

  // Expanded state - full banner
  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 translate-y-0 opacity-100 animate-fade-in"
    >
      <div className="flex items-center gap-3 md:gap-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full px-4 md:px-6 py-2.5 md:py-3 shadow-xl shadow-purple-500/20 border border-white/20">
        {/* Lou mascot */}
        <div className="relative flex-shrink-0">
          <img 
            src={louContact} 
            alt="Lou" 
            className="h-10 w-10 md:h-12 md:w-12 object-contain animate-bounce"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Text */}
        <div className="text-white">
          <p className="font-semibold text-sm md:text-base whitespace-nowrap" style={{ color: '#ffffff' }}>Like what you see?</p>
          <p className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.8)' }}>Let's build something custom for {companyName || 'you'}</p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onContact}
          size="sm"
          className="bg-white text-purple-600 hover:bg-white/90 font-semibold text-xs md:text-sm px-3 md:px-4 h-8 md:h-9 whitespace-nowrap"
        >
          Get in Touch
        </Button>

        {/* Minimize button (X collapses to Lou bubble) */}
        <button
          onClick={onMinimize}
          className="text-white/70 hover:text-white transition-colors p-1"
          aria-label="Minimize"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
