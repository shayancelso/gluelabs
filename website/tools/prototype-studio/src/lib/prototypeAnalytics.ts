import type { BrandConfig } from '@/components/prototypes/PrototypeBrandingBar';

// Stubbed analytics for standalone website (no Supabase)
// Tracking is done via Microsoft Clarity instead

function generateSessionId(): string {
  const existing = sessionStorage.getItem('gloo_prototype_session_id');
  if (existing) return existing;

  const newId = `ps_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem('gloo_prototype_session_id', newId);
  return newId;
}

export async function startPrototypeSession(): Promise<string> {
  return generateSessionId();
}

export async function updateSessionBrand(sessionId: string, brandConfig: BrandConfig): Promise<void> {
  // No-op for standalone - Clarity tracks this via session recordings
  console.log('[Analytics] Brand updated:', brandConfig.companyName);
}

export async function trackToolView(sessionId: string, toolId: string): Promise<void> {
  // No-op for standalone - Clarity tracks this via session recordings
  console.log('[Analytics] Tool viewed:', toolId);
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  // No-op for standalone
}

export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} sec` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
