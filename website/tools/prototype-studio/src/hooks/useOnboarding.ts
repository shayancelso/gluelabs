import { useState, useCallback, useEffect, useRef } from 'react';

export interface OnboardingStep {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Optional action to execute when step is shown (e.g., switch tabs)
  isFinalCTA?: boolean; // Mark as final "Like what you see?" step - DEPRECATED, use LikeWhatYouSeeBanner instead
}

interface UseOnboardingOptions {
  toolId: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  onContactRequest?: () => void; // Called when user clicks "Contact us" on final step
}

export function useOnboarding({ toolId, steps, onComplete, onContactRequest }: UseOnboardingOptions) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  
  // Use ref to store steps to avoid re-triggering effects when steps array recreates
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // Always auto-start the tour (no localStorage persistence)
  useEffect(() => {
    // Small delay to let the UI render first
    const timer = setTimeout(() => {
      setIsActive(true);
      setCurrentStep(0);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Execute step action when step changes - use ref to avoid dependency issues
  useEffect(() => {
    if (isActive && stepsRef.current[currentStep]?.action) {
      // Longer delay to ensure UI is stable after view mode changes, etc.
      const timer = setTimeout(() => {
        stepsRef.current[currentStep].action?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive]);


  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setHasCompletedTour(false);
  }, []);

  const nextStep = useCallback(() => {
    const totalSteps = stepsRef.current.length;

    setCurrentStep(prev => {
      if (prev < totalSteps - 1) return prev + 1;

      // Complete the tour
      setIsActive(false);
      setHasCompletedTour(true);
      onComplete?.();
      return prev;
    });
  }, [onComplete]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    onComplete?.();
  }, [onComplete]);

  const resetTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setHasCompletedTour(false);
  }, []);

  const requestContact = useCallback(() => {
    setIsActive(false);
    onContactRequest?.();
  }, [onContactRequest]);

  return {
    isActive,
    currentStep,
    totalSteps: stepsRef.current.length,
    currentStepData: stepsRef.current[currentStep],
    hasCompleted: hasCompletedTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    resetTour,
    requestContact,
  };
}
