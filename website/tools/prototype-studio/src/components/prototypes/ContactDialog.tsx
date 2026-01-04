import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, CheckCircle2, Plus, X } from 'lucide-react';
// Formspree form ID for Prototype Studio leads
import { toast } from 'sonner';
import type { BrandConfig } from './PrototypeBrandingBar';
import louMascot from '@/assets/lou-mascot.png';

// Categorized tools grouped by business function
const TOOL_CATEGORIES = [
  {
    key: 'discovery',
    label: 'Discovery & Qualification',
    tools: [
      { id: 'discovery', name: 'Discovery Questionnaire' },
      { id: 'intake-forms', name: 'Intake Forms' },
      { id: 'qualification-scorecard', name: 'Qualification Scorecard' },
    ],
  },
  {
    key: 'new-logo',
    label: 'New Logo / Sales',
    tools: [
      { id: 'roi', name: 'ROI Calculator' },
      { id: 'success-plan', name: 'Mutual Success Plan' },
      { id: 'business-case', name: 'Business Case Builder' },
      { id: 'competitive-battle-cards', name: 'Competitive Battle Cards' },
    ],
  },
  {
    key: 'expansion',
    label: 'Expansion & Cross-sell',
    tools: [
      { id: 'whitespace', name: 'Whitespace Visualizer' },
      { id: 'adoption-tracker', name: 'Adoption Tracker' },
      { id: 'upsell-playbook', name: 'Upsell Playbook' },
    ],
  },
  {
    key: 'risk-health',
    label: 'Risk & Health',
    tools: [
      { id: 'risk-assessment', name: 'Risk Assessment' },
      { id: 'health-scorecard', name: 'Health Scorecard' },
      { id: 'nps-tracker', name: 'NPS Account Hub' },
      { id: 'sentiment-analyzer', name: 'Sentiment Analyzer' },
    ],
  },
  {
    key: 'renewal',
    label: 'Renewal & Retention',
    tools: [
      { id: 'renewal-tracker', name: 'Renewal Tracker' },
      { id: 'churn-predictor', name: 'Churn Predictor' },
      { id: 'save-playbook', name: 'Save Playbook' },
    ],
  },
  {
    key: 'onboarding',
    label: 'Onboarding & Adoption',
    tools: [
      { id: 'onboarding-tracker', name: 'Onboarding Tracker' },
      { id: 'implementation-plan', name: 'Implementation Plan' },
      { id: 'kickoff-deck', name: 'Kickoff Deck Generator' },
    ],
  },
  {
    key: 'executive',
    label: 'Executive Alignment',
    tools: [
      { id: 'qbr', name: 'Quarterly Business Review (QBR)' },
      { id: 'ebr', name: 'Executive Business Review' },
      { id: 'value-realization', name: 'Value Realization Report' },
    ],
  },
  {
    key: 'solutions',
    label: 'Solutions & Resources',
    tools: [
      { id: 'resource-calculator', name: 'Resource Calculator' },
      { id: 'solution-mapper', name: 'Solution Mapper' },
      { id: 'use-case-library', name: 'Use Case Library' },
    ],
  },
];

// Flatten for lookup
const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => cat.tools);

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  brandConfig: BrandConfig;
  toolInterest?: string;
  sessionId?: string;
  fromMainPage?: boolean;
}

export function ContactDialog({ open, onClose, brandConfig, toolInterest, sessionId, fromMainPage }: ContactDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState('');
  const [customTools, setCustomTools] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [formData, setFormData] = useState({
    contactName: '',
    email: '',
    companyName: brandConfig.companyName || '',
    role: '',
    message: '',
  });

  // When dialog opens, ensure the current tool is selected
  useEffect(() => {
    if (open && toolInterest) {
      setSelectedTools(prev => 
        prev.includes(toolInterest) ? prev : [...prev, toolInterest]
      );
    }
  }, [open, toolInterest]);

  // Update company name when brandConfig changes
  useEffect(() => {
    if (brandConfig.companyName && brandConfig.companyName !== 'Gloo') {
      setFormData(prev => ({ ...prev, companyName: brandConfig.companyName || prev.companyName }));
    }
  }, [brandConfig.companyName]);

  const handleToolToggle = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  };

  const handleAddCustomTool = () => {
    if (customTool.trim()) {
      setCustomTools(prev => [...prev, customTool.trim()]);
      setCustomTool('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustomTool = (tool: string) => {
    setCustomTools(prev => prev.filter(t => t !== tool));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactName || !formData.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine selected tools and custom tools
      const allTools = [
        ...selectedTools.map(id => ALL_TOOLS.find(t => t.id === id)?.name || id),
        ...customTools
      ];

      const response = await fetch('https://formspree.io/f/xdakygya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.contactName,
          email: formData.email,
          company: formData.companyName || brandConfig.companyName,
          role: formData.role,
          tools_of_interest: allTools.join(', ') || toolInterest,
          message: formData.message,
          _subject: `Prototype Studio Lead: ${formData.companyName || brandConfig.companyName}`,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setIsSuccess(true);
      toast.success('Thank you! Our team will be in touch soon.');

      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          contactName: '',
          email: '',
          companyName: brandConfig.companyName || '',
          role: '',
          message: '',
        });
        setSelectedTools([]);
        setCustomTools([]);
      }, 2000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
            <p className="text-muted-foreground">
              Our team will reach out to you shortly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start gap-3">
          <img src={louMascot} alt="" className="h-12 w-12 object-contain" />
          <div>
            <DialogTitle className="text-xl">Like what you see?</DialogTitle>
            <DialogDescription>
              Let's chat about building custom tools for {brandConfig.companyName || 'your team'}.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                placeholder="Jane Smith"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                placeholder="Acme Inc"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                placeholder="VP of Sales"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
          </div>

          {/* Categorized Tools of Interest */}
          <div className="space-y-3">
            <Label>Tools of Interest</Label>
            <ScrollArea className="h-[200px] rounded-lg border p-3">
              <div className="space-y-4 pr-2">
                {TOOL_CATEGORIES.map((category) => (
                  <div key={category.key}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {category.label}
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {category.tools.map((tool) => (
                        <label
                          key={tool.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                            selectedTools.includes(tool.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-primary/50'
                          }`}
                        >
                          <Checkbox
                            checked={selectedTools.includes(tool.id)}
                            onCheckedChange={() => handleToolToggle(tool.id)}
                          />
                          <span className="text-xs">{tool.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Custom tools */}
            {customTools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customTools.map((tool, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs">
                    <span>{tool}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCustomTool(tool)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom tool */}
            {showCustomInput ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter custom tool idea..."
                  value={customTool}
                  onChange={(e) => setCustomTool(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTool())}
                  className="text-sm h-8"
                />
                <Button type="button" size="sm" onClick={handleAddCustomTool} className="h-8">
                  Add
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowCustomInput(false)} className="h-8">
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add a custom tool idea
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your use case..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Sending...' : 'Get in Touch'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
