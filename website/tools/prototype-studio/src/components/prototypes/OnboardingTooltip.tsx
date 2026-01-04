import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onContactRequest?: () => void;
  isActive: boolean;
}

export function OnboardingTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onContactRequest,
  isActive,
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [isTargetFound, setIsTargetFound] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!isActive || !step.targetSelector) return;

    const updatePosition = () => {
      const target = document.querySelector(step.targetSelector);
      
      if (!target || !tooltipRef.current) {
        // Target not found - retry more times with longer delays for mode switches
        if (retryCountRef.current < 20) {
          retryCountRef.current++;
          setTimeout(updatePosition, 150);
          setIsTargetFound(false);
        }
        return;
      }

      setIsTargetFound(true);
      retryCountRef.current = 0;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 16;
      const arrowOffset = 12;

      let top = 0;
      let left = 0;
      let arrow: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

      // Calculate position based on preferred direction
      switch (step.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - arrowOffset;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrow = 'bottom';
          break;
        case 'bottom':
          top = targetRect.bottom + arrowOffset;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrow = 'top';
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - arrowOffset;
          arrow = 'right';
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + arrowOffset;
          arrow = 'left';
          break;
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < padding) left = padding;
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding;
      }

      setPosition({ top, left });
      setArrowPosition(arrow);

      // Add highlight to target element
      target.classList.add('onboarding-highlight');
    };

    // Reset retry count on step change
    retryCountRef.current = 0;
    
    // Initial delay to allow DOM to settle after actions
    const initialTimer = setTimeout(updatePosition, 50);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      
      // Remove highlight from all elements
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [isActive, step, currentStep]);

  if (!isActive) return null;

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const isLoading = !isTargetFound;

  return (
    <>
      {/* Backdrop overlay - clicking does NOT skip tour */}
      <div 
        className="fixed inset-0 bg-black/30 z-[9998] animate-fade-in"
        // Removed onClick={onSkip} to prevent accidental tour exits
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[9999] w-[320px] max-w-[calc(100vw-32px)] rounded-xl shadow-2xl animate-scale-in",
          "bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600",
          isLoading && "transition-all duration-300"
        )}
        style={{
          top: isLoading ? '50%' : position.top,
          left: isLoading ? '50%' : position.left,
          transform: isLoading ? 'translate(-50%, -50%)' : undefined,
        }}
      >
        {/* Arrow - only show when target is found */}
        {!isLoading && (
          <div
            className={cn(
              "absolute w-3 h-3 bg-pink-500 rotate-45",
              arrowPosition === 'top' && "top-[-6px] left-1/2 -translate-x-1/2",
              arrowPosition === 'bottom' && "bottom-[-6px] left-1/2 -translate-x-1/2 bg-purple-600",
              arrowPosition === 'left' && "left-[-6px] top-1/2 -translate-y-1/2",
              arrowPosition === 'right' && "right-[-6px] top-1/2 -translate-y-1/2"
            )}
          />
        )}

        {/* Content */}
        <div className="p-4 text-white">
          {/* Header with step indicator and close */}
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-white/70">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button 
              onClick={onSkip}
              className="p-1 hover:bg-white/20 rounded-full transition-colors -mr-1 -mt-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
          
          {/* Description */}
          <p className="text-sm text-white/90 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentStep 
                    ? "bg-white w-4" 
                    : "bg-white/30"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 text-xs"
            >
              {step.isFinalCTA ? 'Maybe later' : 'Skip tour'}
            </Button>
            
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrev}
                  className="text-white hover:bg-white/20 h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {step.isFinalCTA && onContactRequest ? (
                <Button
                  size="sm"
                  onClick={onContactRequest}
                  className="bg-white text-pink-600 hover:bg-white/90 h-8 px-4 font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Yes, contact us!
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onNext}
                  className="bg-white text-pink-600 hover:bg-white/90 h-8 px-4 font-medium"
                >
                  {isLastStep ? "Got it!" : "Next"}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global styles for highlighting */}
      <style>{`
        .onboarding-highlight {
          position: relative;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.4), 0 0 20px rgba(236, 72, 153, 0.3) !important;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}
