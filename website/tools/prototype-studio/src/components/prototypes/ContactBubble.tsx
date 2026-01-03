import { useState } from 'react';
import { ContactDialog } from './ContactDialog';
import type { BrandConfig } from './PrototypeBrandingBar';
import louMascot from '@/assets/lou-mascot.png';

interface ContactBubbleProps {
  brandConfig: BrandConfig;
  toolName?: string;
  sessionId?: string;
}

export function ContactBubble({ brandConfig, toolName, sessionId }: ContactBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Contact us"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 opacity-60 blur-md group-hover:opacity-80 transition-opacity animate-pulse" />
        
        {/* Lou mascot container */}
        <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-200">
          <img 
            src={louMascot} 
            alt="Contact us" 
            className="h-11 w-11 md:h-13 md:w-13 object-contain"
          />
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Questions? Let's chat!
        </div>
      </button>

      <ContactDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        brandConfig={brandConfig}
        toolInterest={toolName}
        sessionId={sessionId}
      />
    </>
  );
}
