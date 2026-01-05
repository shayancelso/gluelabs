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
import louContact from '@/assets/lou-contact.png';

// Categorized tools grouped by business function
// IMPORTANT: This list is synced with the CRM's tool_catalog table
// See /CRM_INTEGRATION.md for sync instructions
const TOOL_CATEGORIES = [
  {
    key: 'A',
    label: 'Sales & New Logo',
    tools: [
      { id: 'a-01', name: 'Discovery Question Builder' },
      { id: 'a-02', name: 'Qualification Framework Builder' },
      { id: 'a-03', name: 'Stakeholder & Buying Committee Mapper' },
      { id: 'a-04', name: 'Use Case Prioritization Tool' },
      { id: 'a-05', name: 'Value Hypothesis Builder' },
      { id: 'a-06', name: 'ROI & Business Case Calculator' },
      { id: 'a-07', name: 'Mutual Action Plan for Sales' },
      { id: 'a-08', name: 'Deal Close & Workback Planner' },
    ],
  },
  {
    key: 'B',
    label: 'Onboarding & Implementation',
    tools: [
      { id: 'b-01', name: 'Implementation Success Plan' },
      { id: 'b-02', name: 'Onboarding Timeline & Gantt Builder' },
      { id: 'b-03', name: 'RACI & Ownership Matrix' },
      { id: 'b-04', name: 'Data & Integration Readiness Checklist' },
      { id: 'b-05', name: 'Risk & Escalation Tracker' },
      { id: 'b-06', name: 'Go-Live Criteria Builder' },
      { id: 'b-07', name: 'Adoption Milestone Tracker' },
    ],
  },
  {
    key: 'C',
    label: 'Account Management',
    tools: [
      { id: 'c-01', name: 'Account Plan Builder' },
      { id: 'c-02', name: 'Account Health Scorecard' },
      { id: 'c-03', name: 'Relationship & Influence Map' },
      { id: 'c-04', name: 'White Space Analysis Grid' },
      { id: 'c-05', name: 'Use Case Maturity Model' },
      { id: 'c-06', name: 'Value Realization Tracker' },
      { id: 'c-07', name: 'Risk & Save Plan Builder' },
      { id: 'c-08', name: 'Touchpoint & Cadence Planner' },
    ],
  },
  {
    key: 'D',
    label: 'Expansion & Growth',
    tools: [
      { id: 'd-01', name: 'Expansion Opportunity Identifier' },
      { id: 'd-02', name: 'Cross-Sell & Upsell Mapper' },
      { id: 'd-03', name: 'Departmental Penetration Map' },
      { id: 'd-04', name: 'Expansion Readiness Score' },
      { id: 'd-05', name: 'Expansion Mutual Success Plan' },
      { id: 'd-06', name: 'Incremental ROI Calculator' },
      { id: 'd-07', name: 'Executive Expansion Business Case' },
    ],
  },
  {
    key: 'E',
    label: 'Renewal & Retention',
    tools: [
      { id: 'e-01', name: 'Renewal Readiness Scorecard' },
      { id: 'e-02', name: 'Renewal Workback Plan' },
      { id: 'e-03', name: 'Value Delivered Summary' },
      { id: 'e-04', name: 'Contract & Entitlement Tracker' },
      { id: 'e-05', name: 'Competitive Risk Assessment' },
      { id: 'e-06', name: 'Save & Mitigation Planner' },
      { id: 'e-07', name: 'Renewal QBR Generator' },
    ],
  },
  {
    key: 'F',
    label: 'Business Reviews',
    tools: [
      { id: 'f-01', name: 'QBR & EBR Generator' },
      { id: 'f-02', name: 'Executive Narrative Builder' },
      { id: 'f-03', name: 'KPI & Outcome Storytelling Tool' },
      { id: 'f-04', name: 'Roadmap Alignment Visualizer' },
      { id: 'f-05', name: 'Multi-Year Value Roadmap' },
      { id: 'f-06', name: 'Benchmarking & Peer Comparison' },
    ],
  },
  {
    key: 'G',
    label: 'RevOps & Leadership',
    tools: [
      { id: 'g-01', name: 'Forecast Confidence Dashboard' },
      { id: 'g-02', name: 'Expansion & Renewal Pipeline Tracker' },
      { id: 'g-03', name: 'Scenario & ARR Modeling' },
      { id: 'g-04', name: 'AM Capacity & Coverage Planner' },
      { id: 'g-05', name: 'Account Load Balancing Tool' },
      { id: 'g-06', name: 'Coaching Insights Dashboard' },
    ],
  },
  {
    key: 'H',
    label: 'AI-Powered Tools',
    tools: [
      { id: 'h-01', name: 'AI Account Summary Generator' },
      { id: 'h-02', name: 'Meeting Insight Extraction' },
      { id: 'h-03', name: 'Sentiment & Risk Detection' },
      { id: 'h-04', name: 'Opportunity Signal Detection' },
      { id: 'h-05', name: 'Next Best Action Recommendations' },
      { id: 'h-06', name: 'Value Leakage Alerts' },
      { id: 'h-07', name: 'Churn Early Warning System' },
    ],
  },
  {
    key: 'I',
    label: 'GTM Leadership',
    tools: [
      { id: 'i-01', name: 'Territory Planning & Assignment' },
      { id: 'i-02', name: 'Forecast Builder & Scenario Planner' },
      { id: 'i-03', name: 'Quota & Capacity Planning' },
      { id: 'i-04', name: 'Pipeline Health Dashboard' },
      { id: 'i-05', name: 'Team Performance Scorecard' },
      { id: 'i-06', name: 'Compensation & Commission Modeling' },
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-t-lg">
          <div className="flex flex-row items-start gap-3">
            <img src={louContact} alt="" className="h-12 w-12 object-contain" />
            <div>
              <DialogTitle className="text-xl text-white">Like what you see?</DialogTitle>
              <DialogDescription className="text-white/80">
                Let's chat about building custom tools for {brandConfig.companyName || 'your team'}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
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

            {/* Selected tools as purple bubbles */}
            {selectedTools.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground w-full mb-1">Selected:</span>
                {selectedTools.map((toolId) => {
                  const tool = ALL_TOOLS.find(t => t.id === toolId);
                  return tool ? (
                    <div
                      key={toolId}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      <span>{tool.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToolToggle(toolId)}
                        className="hover:text-purple-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

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
