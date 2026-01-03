import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
  companyName: string;
  logoUrl?: string | null;
}

export function WelcomeDialog({ open, onClose, companyName, logoUrl }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${companyName} logo`} 
                className="h-12 w-12 object-contain rounded-lg bg-white/20 p-1"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Welcome, {companyName}!
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm">
                Gloo Interactive Demo Site
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            We're excited for you to explore our <strong>interactive prototypes</strong>. 
            These are quick mock-ups to give you a taste of what's possible.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <Rocket className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Like what you see?</strong> We'd love to do a custom deep dive with you to build tools tailored exactly to how you interact with your customers.
              </p>
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Show me the tools
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
