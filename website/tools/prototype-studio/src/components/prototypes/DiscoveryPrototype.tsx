import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { X, FileDown, ClipboardList, Building2, Users, Wrench, Target, MessageSquare, ChevronDown, ChevronRight, Plus, Trash2, GripVertical, Check, Edit3, Eye, ArrowUp, ArrowDown, Settings2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { BrandConfig } from './PrototypeBrandingBar';
import { toast } from 'sonner';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { ContactDialog } from './ContactDialog';
import { LikeWhatYouSeeBanner } from './LikeWhatYouSeeBanner';
import { exportToMultiPagePdf, PDF_WIDTH, PDF_HEIGHT } from '@/lib/exportPdf';
import { PdfPage } from './pdf/PdfPage';
import { DiscoveryPdfSummary } from './pdf/DiscoveryPdfSummary';

interface DiscoveryPrototypeProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
}

type QuestionType = 'multi-select' | 'single-select' | 'short-text' | 'long-text' | 'number' | 'scale' | 'dropdown' | 'slider';
type ViewMode = 'edit' | 'preview' | 'completed';

interface QuestionOption {
  id: string;
  label: string;
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

interface Section {
  id: string;
  title: string;
  icon: 'building' | 'wrench' | 'users' | 'target' | 'message';
  questions: Question[];
  isOpen?: boolean;
}

interface ProcessFollowUp {
  processId: string;
  processName: string;
  questions: Question[];
}

// Industry-specific questions
const INDUSTRY_QUESTIONS: Record<string, Question[]> = {
  technology: [
    { id: 'tech-stack', type: 'multi-select', question: 'What is your primary tech stack?', options: [
      { id: 'cloud', label: 'Cloud-native (AWS/Azure/GCP)' },
      { id: 'on-prem', label: 'On-premise' },
      { id: 'hybrid', label: 'Hybrid' },
      { id: 'saas', label: 'SaaS-first' },
    ]},
    { id: 'dev-team-size', type: 'slider', question: 'How large is your engineering team?', min: 1, max: 500 },
  ],
  healthcare: [
    { id: 'hipaa', type: 'single-select', question: 'Is HIPAA compliance a requirement?', options: [
      { id: 'yes', label: 'Yes, required' },
      { id: 'preferred', label: 'Preferred but not required' },
      { id: 'no', label: 'Not applicable' },
    ]},
    { id: 'patient-volume', type: 'dropdown', question: 'What is your annual patient volume?', options: [
      { id: 'small', label: 'Under 10,000' },
      { id: 'medium', label: '10,000 - 100,000' },
      { id: 'large', label: '100,000 - 1M' },
      { id: 'enterprise', label: 'Over 1M' },
    ]},
  ],
  finance: [
    { id: 'regulatory', type: 'multi-select', question: 'Which regulatory frameworks apply to you?', options: [
      { id: 'sox', label: 'SOX' },
      { id: 'pci', label: 'PCI-DSS' },
      { id: 'gdpr', label: 'GDPR' },
      { id: 'ccpa', label: 'CCPA' },
    ]},
    { id: 'aum', type: 'dropdown', question: 'What is your assets under management?', options: [
      { id: 'small', label: 'Under $100M' },
      { id: 'medium', label: '$100M - $1B' },
      { id: 'large', label: '$1B - $10B' },
      { id: 'enterprise', label: 'Over $10B' },
    ]},
  ],
  manufacturing: [
    { id: 'facilities', type: 'slider', question: 'How many manufacturing facilities do you operate?', min: 1, max: 100 },
    { id: 'erp', type: 'single-select', question: 'What ERP system do you use?', options: [
      { id: 'sap', label: 'SAP' },
      { id: 'oracle', label: 'Oracle' },
      { id: 'microsoft', label: 'Microsoft Dynamics' },
      { id: 'other', label: 'Other' },
    ]},
  ],
  retail: [
    { id: 'channels', type: 'multi-select', question: 'What sales channels do you use?', options: [
      { id: 'physical', label: 'Physical Stores' },
      { id: 'ecommerce', label: 'E-commerce' },
      { id: 'marketplace', label: 'Marketplaces (Amazon, etc.)' },
      { id: 'social', label: 'Social Commerce' },
    ]},
    { id: 'sku-count', type: 'dropdown', question: 'How many SKUs do you manage?', options: [
      { id: 'small', label: 'Under 1,000' },
      { id: 'medium', label: '1,000 - 10,000' },
      { id: 'large', label: '10,000 - 100,000' },
      { id: 'enterprise', label: 'Over 100,000' },
    ]},
  ],
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single-select', label: 'Single Choice' },
  { value: 'multi-select', label: 'Multi Select' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'scale', label: 'Scale (1-10)' },
  { value: 'slider', label: 'Slider' },
];

// Initial sample data
const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'company',
    title: 'Company Overview',
    icon: 'building',
    isOpen: true,
    questions: [
      {
        id: 'company-size',
        type: 'single-select',
        question: 'What is your company size?',
        options: [
          { id: 'startup', label: 'Startup (1-50)' },
          { id: 'smb', label: 'SMB (51-200)' },
          { id: 'mid-market', label: 'Mid-Market (201-1000)' },
          { id: 'enterprise', label: 'Enterprise (1000+)' },
        ],
        required: true,
      },
      {
        id: 'industry',
        type: 'dropdown',
        question: 'What is your primary industry?',
        options: [
          { id: 'technology', label: 'Technology' },
          { id: 'healthcare', label: 'Healthcare' },
          { id: 'finance', label: 'Financial Services' },
          { id: 'manufacturing', label: 'Manufacturing' },
          { id: 'retail', label: 'Retail & E-commerce' },
          { id: 'other', label: 'Other' },
        ],
        required: true,
      },
      {
        id: 'team-size',
        type: 'slider',
        question: 'How many people are involved in this process?',
        min: 1,
        max: 100,
      },
    ],
  },
  {
    id: 'technology',
    title: 'Current Technology Stack',
    icon: 'wrench',
    isOpen: true,
    questions: [
      {
        id: 'current-tools',
        type: 'multi-select',
        question: 'What tools do you currently use?',
        options: [
          { id: 'crm', label: 'CRM (Salesforce, HubSpot)' },
          { id: 'marketing', label: 'Marketing Automation' },
          { id: 'analytics', label: 'Analytics & BI Tools' },
          { id: 'custom', label: 'Custom/In-house Solutions' },
          { id: 'spreadsheets', label: 'Spreadsheets' },
          { id: 'none', label: 'None' },
        ],
      },
      {
        id: 'satisfaction',
        type: 'scale',
        question: 'How satisfied are you with your current tools?',
        min: 1,
        max: 10,
      },
      {
        id: 'annual-spend',
        type: 'number',
        question: 'What is your approximate annual spend on existing tools?',
        placeholder: 'Enter amount in USD',
      },
    ],
  },
  {
    id: 'process',
    title: 'Process & People',
    icon: 'users',
    isOpen: true,
    questions: [
      {
        id: 'stakeholders',
        type: 'multi-select',
        question: 'Who are the key stakeholders in this initiative?',
        options: [
          { id: 'it', label: 'IT / Engineering' },
          { id: 'operations', label: 'Operations' },
          { id: 'sales', label: 'Sales' },
          { id: 'marketing', label: 'Marketing' },
          { id: 'finance', label: 'Finance' },
          { id: 'executive', label: 'Executive Team' },
        ],
      },
      {
        id: 'decision-maker',
        type: 'single-select',
        question: 'Who is the primary decision maker?',
        options: [
          { id: 'it', label: 'IT / Engineering' },
          { id: 'operations', label: 'Operations' },
          { id: 'sales', label: 'Sales' },
          { id: 'marketing', label: 'Marketing' },
          { id: 'finance', label: 'Finance' },
          { id: 'executive', label: 'Executive Team' },
        ],
      },
      {
        id: 'buying-cycle',
        type: 'single-select',
        question: "What's your typical buying cycle for solutions like this?",
        options: [
          { id: '1-2-weeks', label: '1-2 weeks' },
          { id: '1-month', label: '1 month' },
          { id: '3-months', label: '3 months' },
          { id: '6-months', label: '6+ months' },
        ],
      },
    ],
  },
  {
    id: 'goals',
    title: 'Pain Points & Goals',
    icon: 'target',
    isOpen: true,
    questions: [
      {
        id: 'challenges',
        type: 'multi-select',
        question: 'What are your biggest challenges today?',
        options: [
          { id: 'manual', label: 'Manual processes' },
          { id: 'silos', label: 'Data silos' },
          { id: 'visibility', label: 'Lack of visibility' },
          { id: 'time-to-value', label: 'Slow time to value' },
          { id: 'integration', label: 'Integration issues' },
          { id: 'scaling', label: 'Scaling challenges' },
        ],
      },
      {
        id: 'outcomes',
        type: 'multi-select',
        question: 'What outcomes matter most to you?',
        options: [
          { id: 'cost', label: 'Cost reduction' },
          { id: 'time', label: 'Time savings' },
          { id: 'revenue', label: 'Revenue growth' },
          { id: 'insights', label: 'Better insights' },
          { id: 'efficiency', label: 'Improved efficiency' },
        ],
      },
      {
        id: 'ideal-solution',
        type: 'long-text',
        question: 'Describe your ideal solution in a few sentences.',
        placeholder: 'What would success look like for your team?',
      },
    ],
  },
];

const DEFAULT_PROCESSES: ProcessFollowUp[] = [
  {
    processId: 'process-a',
    processName: 'Sales Automation',
    questions: [
      {
        id: 'process-a-q1',
        type: 'single-select',
        question: 'What is your current maturity level for this process?',
        options: [
          { id: 'nascent', label: 'Nascent - Just getting started' },
          { id: 'developing', label: 'Developing - Some progress' },
          { id: 'established', label: 'Established - Working well' },
          { id: 'optimized', label: 'Optimized - Best in class' },
        ],
      },
      {
        id: 'process-a-q2',
        type: 'short-text',
        question: 'What is your primary source system for this data?',
        placeholder: 'e.g., Salesforce, SAP, custom database',
      },
    ],
  },
  {
    processId: 'process-b',
    processName: 'Customer Onboarding',
    questions: [
      {
        id: 'process-b-q1',
        type: 'multi-select',
        question: 'Which teams are currently involved?',
        options: [
          { id: 'sales', label: 'Sales' },
          { id: 'marketing', label: 'Marketing' },
          { id: 'customer-success', label: 'Customer Success' },
          { id: 'product', label: 'Product' },
        ],
      },
      {
        id: 'process-b-q2',
        type: 'scale',
        question: 'How automated is your current workflow?',
        min: 1,
        max: 10,
      },
    ],
  },
  {
    processId: 'process-c',
    processName: 'Data Analytics',
    questions: [
      {
        id: 'process-c-q1',
        type: 'dropdown',
        question: 'What is your primary goal for improvement?',
        options: [
          { id: 'speed', label: 'Increase speed' },
          { id: 'accuracy', label: 'Improve accuracy' },
          { id: 'cost', label: 'Reduce cost' },
          { id: 'visibility', label: 'Gain visibility' },
        ],
      },
      {
        id: 'process-c-q2',
        type: 'long-text',
        question: 'Describe your current workflow.',
        placeholder: 'Walk us through the steps involved...',
      },
    ],
  },
];

const ICON_MAP = {
  building: Building2,
  wrench: Wrench,
  users: Users,
  target: Target,
  message: MessageSquare,
};

export function DiscoveryPrototype({ onClose, initialBrandConfig }: DiscoveryPrototypeProps) {
  const [brandConfig] = useState<BrandConfig>(initialBrandConfig);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfPage1Ref = useRef<HTMLDivElement>(null);
  const pdfPage2Ref = useRef<HTMLDivElement>(null);
  const pdfPage3Ref = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [processes, setProcesses] = useState<ProcessFollowUp[]>(DEFAULT_PROCESSES);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [bannerState, setBannerState] = useState<'hidden' | 'expanded' | 'minimized'>('hidden');

  // Define onboarding steps with tab navigation - use useCallback for stable actions
  const switchToEdit = useCallback(() => {
    setViewMode('edit');
    // Give the UI more time to render edit mode, then scroll to make sections visible
    setTimeout(() => {
      const sectionsNav = document.querySelector('[data-onboarding="sections-nav"]');
      if (sectionsNav) {
        sectionsNav.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }, []);
  
  const switchToPreview = useCallback(() => setViewMode('preview'), []);

  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      targetSelector: '[data-onboarding="discovery-header"]',
      title: 'Welcome to Discovery Questionnaire',
      description:
        'Reps following structured discovery are 40% more likely to hit quota, with 2x higher win rates. Standardize your discovery so every rep uncovers pain points and needs consistently.',
      position: 'bottom',
    },
    {
      targetSelector: '[data-onboarding="mode-toggle"]',
      title: 'Edit vs Live Preview',
      description:
        'Use Live Preview to see the prospect experience, and Edit Questions to customize the questionnaire. Click Next to jump into Edit mode.',
      position: 'bottom',
      action: switchToEdit,
    },
    {
      targetSelector: '[data-onboarding="sections-nav"]',
      title: 'Organize with Sections',
      description:
        'Group related questions into sections. Click the pencil icon to rename, or + to add new sections.',
      position: 'right',
    },
    {
      targetSelector: '[data-onboarding="question-area"]',
      title: 'Add & Edit Questions',
      description:
        'Click any question to edit it. Choose from multiple types: dropdowns, sliders, text fields, and more.',
      position: 'left',
    },
    {
      targetSelector: '[data-onboarding="question-options"]',
      title: 'Configure Options',
      description:
        'For choice-based questions, add or edit available options with the + button.',
      position: 'left',
    },
    {
      targetSelector: '[data-onboarding="mode-toggle"]',
      title: 'Preview Your Work',
      description:
        'Switch to Preview to see exactly what your prospect will experience.',
      position: 'bottom',
      action: switchToPreview,
    },
  ], [switchToEdit, switchToPreview]);

  // Onboarding
  const onboarding = useOnboarding({
    toolId: 'discovery',
    steps: onboardingSteps,
    onComplete: () => {
      // Show banner after onboarding completes
      if (bannerState === 'hidden') {
        setTimeout(() => setBannerState('expanded'), 500);
      }
    },
  });

  // Also show banner after 30 seconds if not already shown
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bannerState === 'hidden' && !onboarding.isActive) {
        setBannerState('expanded');
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [bannerState, onboarding.isActive]);

  // Handle PDF export using html2canvas/jsPDF for auto-download
  const handleExportPdf = async () => {
    if (isExporting) return;
    if (!pdfPage1Ref.current || !pdfPage2Ref.current || !pdfPage3Ref.current) {
      toast.error('PDF content not ready');
      return;
    }
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      await exportToMultiPagePdf({
        toolName: 'Discovery Summary',
        accountName: brandConfig.companyName || 'Client',
        pages: [pdfPage1Ref.current, pdfPage2Ref.current, pdfPage3Ref.current],
      });
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Get selected industry for dynamic questions
  const selectedIndustry = responses['industry'] as string | undefined;
  const industryQuestions = selectedIndustry && INDUSTRY_QUESTIONS[selectedIndustry] ? INDUSTRY_QUESTIONS[selectedIndustry] : [];

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title: newTitle } : s
    ));
  };

  const updateQuestionText = (sectionId: string, questionId: string, newText: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, question: newText } : q) }
        : s
    ));
  };

  const updateQuestionType = (sectionId: string, questionId: string, newType: QuestionType) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.map(q => {
            if (q.id !== questionId) return q;
            const updated: Question = { ...q, type: newType };
            // Add default options for option-based types
            if (['multi-select', 'single-select', 'dropdown'].includes(newType) && !updated.options) {
              updated.options = [
                { id: 'option-1', label: 'Option 1' },
                { id: 'option-2', label: 'Option 2' },
              ];
            }
            // Add default min/max for scale/slider
            if (['scale', 'slider'].includes(newType)) {
              updated.min = updated.min || 1;
              updated.max = updated.max || (newType === 'slider' ? 100 : 10);
            }
            return updated;
          })}
        : s
    ));
  };

  const updateQuestionOption = (sectionId: string, questionId: string, optionId: string, newLabel: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.map(q => 
            q.id === questionId && q.options
              ? { ...q, options: q.options.map(o => o.id === optionId ? { ...o, label: newLabel } : o) }
              : q
          )}
        : s
    ));
  };

  const addQuestionOption = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.map(q => 
            q.id === questionId && q.options
              ? { ...q, options: [...q.options, { id: `option-${Date.now()}`, label: 'New Option' }] }
              : q
          )}
        : s
    ));
  };

  const removeQuestionOption = (sectionId: string, questionId: string, optionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, questions: s.questions.map(q => 
            q.id === questionId && q.options
              ? { ...q, options: q.options.filter(o => o.id !== optionId) }
              : q
          )}
        : s
    ));
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short-text',
      question: 'New Question',
      placeholder: 'Enter your answer',
    };
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s
    ));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, questions: s.questions.filter(q => q.id !== questionId) } : s
    ));
  };

  const moveQuestion = (sectionId: string, questionId: string, direction: 'up' | 'down') => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      const idx = s.questions.findIndex(q => q.id === questionId);
      if (idx === -1) return s;
      if (direction === 'up' && idx === 0) return s;
      if (direction === 'down' && idx === s.questions.length - 1) return s;
      const newQuestions = [...s.questions];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newQuestions[idx], newQuestions[swapIdx]] = [newQuestions[swapIdx], newQuestions[idx]];
      return { ...s, questions: newQuestions };
    }));
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      icon: 'message',
      isOpen: true,
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;
    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections);
  };

  const updateProcessName = (processId: string, newName: string) => {
    setProcesses(processes.map(p => 
      p.processId === processId ? { ...p, processName: newName } : p
    ));
  };

  const updateResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const toggleMultiSelect = (questionId: string, optionId: string) => {
    const current = responses[questionId] || [];
    const updated = current.includes(optionId)
      ? current.filter((id: string) => id !== optionId)
      : [...current, optionId];
    updateResponse(questionId, updated);
  };

  const completedQuestions = Object.keys(responses).filter(k => {
    const val = responses[k];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== '' && val !== null;
  }).length;

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0) + 
    industryQuestions.length +
    (selectedProcess ? processes.find(p => p.processId === selectedProcess)?.questions.length || 0 : 0);

  const progressPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  const getAnswerDisplay = (question: Question): string => {
    const response = responses[question.id];
    if (response === undefined || response === null || response === '') return 'Not answered';
    
    if (question.type === 'multi-select' && Array.isArray(response)) {
      if (response.length === 0) return 'Not answered';
      return response.map(id => question.options?.find(o => o.id === id)?.label || id).join(', ');
    }
    
    if (['single-select', 'dropdown'].includes(question.type) && question.options) {
      return question.options.find(o => o.id === response)?.label || response;
    }
    
    if (question.type === 'scale') {
      return `${response} / ${question.max || 10}`;
    }
    
    if (question.type === 'slider') {
      return `${response} people`;
    }
    
    if (question.type === 'number') {
      return `$${Number(response).toLocaleString()}`;
    }
    
    return String(response);
  };

  const renderQuestion = (question: Question, sectionId?: string, isIndustryQuestion?: boolean) => {
    return (
      <div key={question.id} className="space-y-2 md:space-y-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-card/50 border border-border/30">
        <div className="flex items-start gap-2">
          <Label className="text-xs md:text-sm font-medium flex-1">
            {question.question}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {isIndustryQuestion && (
            <Badge variant="outline" className="text-[8px] md:text-[10px] shrink-0" style={{ borderColor: brandConfig.accentColor, color: brandConfig.accentColor }}>
              <span className="hidden sm:inline">Industry-specific</span><span className="sm:hidden">Industry</span>
            </Badge>
          )}
        </div>

        {question.type === 'multi-select' && question.options && (
          <div data-onboarding="question-options" className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2">
            {question.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 p-2 md:p-2.5 rounded-lg border cursor-pointer transition-all ${
                  (responses[question.id] || []).includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleMultiSelect(question.id, option.id)}
                style={(responses[question.id] || []).includes(option.id) ? { borderColor: brandConfig.primaryColor, backgroundColor: brandConfig.primaryColor + '10' } : undefined}
              >
                <Checkbox 
                  checked={(responses[question.id] || []).includes(option.id)}
                  className="pointer-events-none"
                />
                <span className="text-xs md:text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {question.type === 'single-select' && question.options && (
          <RadioGroup
            value={responses[question.id] || ''}
            onValueChange={(value) => updateResponse(question.id, value)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2"
          >
            {question.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 p-2 md:p-2.5 rounded-lg border cursor-pointer transition-all ${
                  responses[question.id] === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => updateResponse(question.id, option.id)}
                style={responses[question.id] === option.id ? { borderColor: brandConfig.primaryColor, backgroundColor: brandConfig.primaryColor + '10' } : undefined}
              >
                <RadioGroupItem value={option.id} className="pointer-events-none" />
                <span className="text-xs md:text-sm">{option.label}</span>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'dropdown' && question.options && (
          <Select
            value={responses[question.id] || ''}
            onValueChange={(value) => updateResponse(question.id, value)}
          >
            <SelectTrigger className="bg-background h-8 md:h-10 text-xs md:text-sm" style={{ borderColor: responses[question.id] ? brandConfig.primaryColor + '60' : undefined }}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {question.options.map((option) => (
                <SelectItem key={option.id} value={option.id} className="text-xs md:text-sm">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === 'short-text' && (
          <Input
            value={responses[question.id] || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="bg-background h-8 md:h-10 text-xs md:text-sm"
            style={{ borderColor: responses[question.id] ? brandConfig.primaryColor + '60' : undefined }}
          />
        )}

        {question.type === 'long-text' && (
          <Textarea
            value={responses[question.id] || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={2}
            className="bg-background text-xs md:text-sm"
            style={{ borderColor: responses[question.id] ? brandConfig.primaryColor + '60' : undefined }}
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            className="bg-background h-8 md:h-10 text-xs md:text-sm"
            style={{ borderColor: responses[question.id] ? brandConfig.primaryColor + '60' : undefined }}
          />
        )}

        {(question.type === 'scale' || question.type === 'slider') && (
          <div className="space-y-2 md:space-y-3 pt-1 md:pt-2">
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-[10px] md:text-xs text-muted-foreground w-6 md:w-8 text-right">{question.min || 1}</span>
              <div className="flex-1 discovery-slider">
                <Slider
                  value={[responses[question.id] || Math.round(((question.min || 1) + (question.max || 10)) / 2)]}
                  onValueChange={(value) => updateResponse(question.id, value[0])}
                  min={question.min || 1}
                  max={question.max || 10}
                  step={1}
                />
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground w-6 md:w-8">{question.max || 10}</span>
            </div>
            <div className="text-center">
              <Badge 
                variant="outline" 
                className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1"
                style={{ borderColor: brandConfig.primaryColor, color: brandConfig.primaryColor }}
              >
                {responses[question.id] || Math.round(((question.min || 1) + (question.max || 10)) / 2)} {question.type === 'slider' ? 'people' : `/ ${question.max || 10}`}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEditableQuestion = (question: Question, sectionId: string, idx: number, totalCount: number) => {
    return (
      <div 
        key={question.id} 
        className="p-3 rounded-lg border border-border/50 bg-card/30 space-y-3"
        data-onboarding={idx === 0 ? "question-area" : undefined}
      >
        <div className="flex items-start gap-2">
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => moveQuestion(sectionId, question.id, 'up')}
              disabled={idx === 0}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => moveQuestion(sectionId, question.id, 'down')}
              disabled={idx === totalCount - 1}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <Input
              value={question.question}
              onChange={(e) => updateQuestionText(sectionId, question.id, e.target.value)}
              className="text-sm font-medium h-8"
              placeholder="Question text..."
            />
            <div className="flex items-center gap-2">
              <Select
                value={question.type}
                onValueChange={(value) => updateQuestionType(sectionId, question.id, value as QuestionType)}
              >
                <SelectTrigger className="h-7 text-xs w-[140px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Checkbox 
                  id={`required-${question.id}`}
                  checked={question.required || false}
                  onCheckedChange={(checked) => {
                    setSections(sections.map(s => 
                      s.id === sectionId 
                        ? { ...s, questions: s.questions.map(q => q.id === question.id ? { ...q, required: !!checked } : q) }
                        : s
                    ));
                  }}
                />
                <Label htmlFor={`required-${question.id}`} className="text-xs text-muted-foreground">Required</Label>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => deleteQuestion(sectionId, question.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Option editor for select types */}
        {['multi-select', 'single-select', 'dropdown'].includes(question.type) && question.options && (
          <div className="pl-8 space-y-2" data-onboarding="question-options">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <Input
                  value={option.label}
                  onChange={(e) => updateQuestionOption(sectionId, question.id, option.id, e.target.value)}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeQuestionOption(sectionId, question.id, option.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => addQuestionOption(sectionId, question.id)}
            >
              <Plus className="h-3 w-3" />
              Add Option
            </Button>
          </div>
        )}

        {/* Range editor for scale/slider */}
        {['scale', 'slider'].includes(question.type) && (
          <div className="pl-8 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground">Min:</Label>
              <Input
                type="number"
                value={question.min || 1}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === sectionId 
                      ? { ...s, questions: s.questions.map(q => q.id === question.id ? { ...q, min: parseInt(e.target.value) || 1 } : q) }
                      : s
                  ));
                }}
                className="h-7 w-16 text-xs"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground">Max:</Label>
              <Input
                type="number"
                value={question.max || 10}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === sectionId 
                      ? { ...s, questions: s.questions.map(q => q.id === question.id ? { ...q, max: parseInt(e.target.value) || 10 } : q) }
                      : s
                  ));
                }}
                className="h-7 w-16 text-xs"
              />
            </div>
          </div>
        )}

        {/* Placeholder editor for text types */}
        {['short-text', 'long-text', 'number'].includes(question.type) && (
          <div className="pl-8">
            <Input
              value={question.placeholder || ''}
              onChange={(e) => {
                setSections(sections.map(s => 
                  s.id === sectionId 
                    ? { ...s, questions: s.questions.map(q => q.id === question.id ? { ...q, placeholder: e.target.value } : q) }
                    : s
                ));
              }}
              placeholder="Placeholder text..."
              className="h-7 text-xs"
            />
          </div>
        )}
      </div>
    );
  };

  // Common background style
  const backgroundStyle = {
    background: `
      radial-gradient(ellipse 80% 60% at 85% 80%, ${brandConfig.primaryColor}15 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 95% 20%, ${brandConfig.secondaryColor}10 0%, transparent 40%),
      linear-gradient(180deg, #fafafa 0%, #f8f7fc 100%)
    `,
  };

  const dotGridStyle = {
    backgroundImage: `radial-gradient(circle, rgba(120, 100, 140, 0.08) 1px, transparent 1px)`,
    backgroundSize: '28px 28px',
  };

  // =====================
  // SINGLE RETURN - Conditional rendering inside
  // This keeps OnboardingTooltip mounted across all view modes
  // =====================
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={backgroundStyle}
    >
      {/* Dot grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={dotGridStyle}
      />

      {/* ==================== COMPLETED VIEW ==================== */}
      {viewMode === 'completed' && (
        <>
          {/* Header */}
          <div className="relative z-10 p-6 pb-0">
            <div 
              className="rounded-2xl p-6"
              style={{
                background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {brandConfig.logoUrl ? (
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                      <img src={brandConfig.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                    </div>
                  ) : (
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Discovery Document
                    </h1>
                    <p className="text-white/80 text-sm">
                      {brandConfig.companyName || 'Company'} • Completed {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 no-print"
                  >
                    <FileDown className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => setViewMode('preview')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Survey
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 border-0 text-white"
                  >
                    <X className="h-4 w-4" />
                    <span className="ml-2">Close</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Stats */}
          <div className="relative z-10 px-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="text-2xl font-bold" style={{ color: brandConfig.primaryColor }}>{completedQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="text-2xl font-bold" style={{ color: brandConfig.secondaryColor }}>{sections.length}</div>
                <div className="text-sm text-muted-foreground">Sections Completed</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <div className="text-2xl font-bold" style={{ color: brandConfig.accentColor }}>{progressPercent}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <ScrollArea className="relative z-10 flex-1 px-6 pb-6">
            <div ref={contentRef} className="bg-card rounded-2xl border border-border/50 p-8 space-y-8">
              {sections.map((section) => {
                const Icon = ICON_MAP[section.icon];

                return (
                  <div key={section.id} className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${brandConfig.primaryColor}20, ${brandConfig.secondaryColor}20)` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: brandConfig.primaryColor }} />
                      </div>
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    <div className="grid gap-4">
                      {section.questions.map((question) => {
                        const answer = getAnswerDisplay(question);
                        const hasAnswer = answer !== 'Not answered';
                        
                        return (
                          <div 
                            key={question.id} 
                            className={`p-4 rounded-xl border ${hasAnswer ? 'bg-card border-border/50' : 'bg-muted/30 border-border/30'}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-sm text-muted-foreground mb-1">{question.question}</div>
                                <div className={`font-medium ${hasAnswer ? '' : 'text-muted-foreground italic'}`}>
                                  {answer}
                                </div>
                              </div>
                              {hasAnswer && (
                                <Check className="h-5 w-5 shrink-0 mt-1" style={{ color: brandConfig.accentColor }} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Industry-specific questions */}
              {industryQuestions.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${brandConfig.accentColor}20, ${brandConfig.primaryColor}20)` }}
                    >
                      <Building2 className="h-5 w-5" style={{ color: brandConfig.accentColor }} />
                    </div>
                    <h2 className="text-xl font-semibold">Industry-Specific Insights</h2>
                  </div>
                  <div className="grid gap-4">
                    {industryQuestions.map((question) => {
                      const answer = getAnswerDisplay(question);
                      const hasAnswer = answer !== 'Not answered';
                      
                      return (
                        <div 
                          key={question.id} 
                          className={`p-4 rounded-xl border ${hasAnswer ? 'bg-card border-border/50' : 'bg-muted/30 border-border/30'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground mb-1">{question.question}</div>
                              <div className={`font-medium ${hasAnswer ? '' : 'text-muted-foreground italic'}`}>
                                {answer}
                              </div>
                            </div>
                            {hasAnswer && (
                              <Check className="h-5 w-5 shrink-0 mt-1" style={{ color: brandConfig.accentColor }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Process-specific questions */}
              {selectedProcess && (
                <div className="space-y-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${brandConfig.secondaryColor}20, ${brandConfig.accentColor}20)` }}
                    >
                      <Target className="h-5 w-5" style={{ color: brandConfig.secondaryColor }} />
                    </div>
                    <h2 className="text-xl font-semibold">
                      {processes.find(p => p.processId === selectedProcess)?.processName}
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    {processes
                      .find(p => p.processId === selectedProcess)
                      ?.questions.map((question) => {
                        const answer = getAnswerDisplay(question);
                        const hasAnswer = answer !== 'Not answered';
                        
                        return (
                          <div 
                            key={question.id} 
                            className={`p-4 rounded-xl border ${hasAnswer ? 'bg-card border-border/50' : 'bg-muted/30 border-border/30'}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-sm text-muted-foreground mb-1">{question.question}</div>
                                <div className={`font-medium ${hasAnswer ? '' : 'text-muted-foreground italic'}`}>
                                  {answer}
                                </div>
                              </div>
                              {hasAnswer && (
                                <Check className="h-5 w-5 shrink-0 mt-1" style={{ color: brandConfig.accentColor }} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {/* ==================== EDIT VIEW ==================== */}
      {viewMode === 'edit' && (
        <>
          {/* Header */}
          <div className="relative z-10 p-6 pb-0">
            <div 
              data-onboarding="discovery-header"
              className="rounded-2xl p-6"
              style={{
                background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {brandConfig.logoUrl ? (
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                      <img src={brandConfig.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                    </div>
                  ) : (
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      <Edit3 className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      Edit Questionnaire
                    </h1>
                    <p className="text-white/80 text-sm">
                      Configure sections, questions, and options
                    </p>
                  </div>
                </div>
                <div data-onboarding="mode-toggle" className="flex items-center gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 border-0 text-white"
                  >
                    <X className="h-4 w-4" />
                    <span className="ml-2">Close</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Content */}
          <ScrollArea className="relative z-10 flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-4" data-onboarding="sections-nav">
              {sections.map((section, sectionIdx) => {
                const Icon = ICON_MAP[section.icon];
                
                return (
                  <div 
                    key={section.id}
                    className="rounded-xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/30">
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={sectionIdx === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={sectionIdx === sections.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: brandConfig.primaryColor + '15' }}
                      >
                        <Icon className="h-5 w-5" style={{ color: brandConfig.primaryColor }} />
                      </div>
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        className="flex-1 text-lg font-semibold h-10 bg-background"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-3">
                      {section.questions.map((q, idx) => renderEditableQuestion(q, section.id, idx, section.questions.length))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 border-dashed"
                        onClick={() => addQuestion(section.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="outline"
                className="w-full gap-2 h-14 border-dashed text-muted-foreground hover:text-foreground"
                onClick={addSection}
              >
                <Plus className="h-5 w-5" />
                Add New Section
              </Button>

              {/* Process Editor */}
              <div className="rounded-xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm mt-6">
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" style={{ color: brandConfig.secondaryColor }} />
                    Process Follow-up Questions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure additional questions based on selected process
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {processes.map((process) => (
                    <div key={process.processId} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                      <Input
                        value={process.processName}
                        onChange={(e) => updateProcessName(process.processId, e.target.value)}
                        className="font-medium mb-2 h-8"
                      />
                      <p className="text-xs text-muted-foreground">
                        {process.questions.length} follow-up questions
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </>
      )}

      {/* ==================== PREVIEW VIEW (default) ==================== */}
      {viewMode === 'preview' && (
        <>
          {/* Header */}
          <div className="relative z-10 p-3 md:p-6 pb-0">
            <div 
              data-onboarding="discovery-header"
              className="rounded-xl md:rounded-2xl p-3 md:p-6"
              style={{
                background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                  {brandConfig.logoUrl ? (
                    <div className="bg-white/20 p-1.5 md:p-2 rounded-lg md:rounded-xl backdrop-blur-sm shrink-0">
                      <img src={brandConfig.logoUrl} alt="Logo" className="h-6 md:h-10 w-auto object-contain" />
                    </div>
                  ) : (
                    <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm shrink-0">
                      <ClipboardList className="h-5 w-5 md:h-8 md:w-8 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-sm md:text-xl font-bold text-white flex items-center gap-1 md:gap-2">
                      <ClipboardList className="h-4 w-4 md:h-5 md:w-5 shrink-0 hidden md:block" />
                      <span className="truncate">{brandConfig.companyName || 'Company'} Discovery</span>
                    </h1>
                    <p className="text-white/80 text-xs md:text-sm truncate hidden sm:block">
                      Help us understand your needs
                    </p>
                  </div>
                </div>
                <div data-onboarding="mode-toggle" className="flex items-center gap-1.5 md:gap-3 shrink-0">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="gap-1 md:gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 px-2 md:px-3 text-xs md:text-sm"
                    onClick={() => setViewMode('edit')}
                  >
                    <Edit3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Edit Questions</span><span className="md:hidden">Edit</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="gap-1 md:gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 no-print h-8 px-2 md:px-3 text-xs md:text-sm"
                  >
                    <FileDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{isExporting ? '...' : 'PDF'}</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 border-0 h-8 text-white"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden md:inline ml-2">Close</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 px-3 md:px-6 py-2 md:py-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <span className="text-xs md:text-sm text-muted-foreground">Progress</span>
              <span className="text-xs md:text-sm font-medium" style={{ color: brandConfig.primaryColor }}>
                {progressPercent}%
              </span>
            </div>
            <div className="h-1.5 md:h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})`,
                }}
              />
            </div>
          </div>

          {/* Main content */}
          <div ref={contentRef} className="relative z-10 flex-1 flex flex-col md:flex-row gap-3 md:gap-6 px-3 md:px-6 pb-3 md:pb-6 overflow-hidden">
            {/* Mobile Section Navigation */}
            <div className="md:hidden">
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {sections.map((section) => {
                    const Icon = ICON_MAP[section.icon];
                    const answeredInSection = section.questions.filter(q => {
                      const val = responses[q.id];
                      if (Array.isArray(val)) return val.length > 0;
                      return val !== undefined && val !== '' && val !== null;
                    }).length;
                    const isComplete = answeredInSection === section.questions.length && section.questions.length > 0;
                    
                    return (
                      <Button
                        key={section.id}
                        variant={section.isOpen ? 'default' : 'outline'}
                        size="sm"
                        className="gap-1 shrink-0 h-8"
                        onClick={() => {
                          setSections(sections.map(s => ({ ...s, isOpen: s.id === section.id })));
                        }}
                        style={section.isOpen ? { backgroundColor: brandConfig.primaryColor } : undefined}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="text-xs truncate max-w-[80px]">{section.title}</span>
                        {isComplete && <Check className="h-3 w-3" />}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Desktop Section Navigation */}
            <div data-onboarding="sections-nav" className="hidden md:flex flex-col w-64 shrink-0 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 overflow-hidden">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" style={{ color: brandConfig.primaryColor }} />
                Sections
              </h3>
              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = ICON_MAP[section.icon];
                    const answeredInSection = section.questions.filter(q => {
                      const val = responses[q.id];
                      if (Array.isArray(val)) return val.length > 0;
                      return val !== undefined && val !== '' && val !== null;
                    }).length;
                    const isComplete = answeredInSection === section.questions.length && section.questions.length > 0;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          section.isOpen 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        style={section.isOpen ? { backgroundColor: brandConfig.primaryColor + '15', borderColor: brandConfig.primaryColor + '30' } : undefined}
                      >
                        <div 
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: section.isOpen ? brandConfig.primaryColor + '20' : 'transparent' }}
                        >
                          <Icon className="h-4 w-4" style={{ color: section.isOpen ? brandConfig.primaryColor : 'hsl(var(--muted-foreground))' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{section.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {answeredInSection} / {section.questions.length}
                          </div>
                        </div>
                        {isComplete && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: brandConfig.accentColor }} />
                        )}
                      </button>
                    );
                  })}

                  {/* Process selection (desktop) */}
                  <div className="pt-4 mt-4 border-t border-border/50">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Focus Area</h4>
                    {processes.map((process) => (
                      <button
                        key={process.processId}
                        onClick={() => setSelectedProcess(selectedProcess === process.processId ? null : process.processId)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          selectedProcess === process.processId 
                            ? 'bg-secondary/10 border border-secondary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        style={selectedProcess === process.processId ? { backgroundColor: brandConfig.secondaryColor + '15', borderColor: brandConfig.secondaryColor + '30' } : undefined}
                      >
                        <Target className="h-4 w-4" style={{ color: selectedProcess === process.processId ? brandConfig.secondaryColor : 'hsl(var(--muted-foreground))' }} />
                        <span className="text-sm truncate">{process.processName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Questions Area */}
            <ScrollArea className="flex-1 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
              <div data-onboarding="question-area" className="p-3 md:p-6 space-y-4 md:space-y-6">
                {/* Current section questions */}
                {sections.filter(s => s.isOpen).map((section) => {
                  const Icon = ICON_MAP[section.icon];
                  return (
                    <div key={section.id} className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div 
                          className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `linear-gradient(135deg, ${brandConfig.primaryColor}20, ${brandConfig.secondaryColor}20)` }}
                        >
                          <Icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: brandConfig.primaryColor }} />
                        </div>
                        <h3 className="text-base md:text-lg font-semibold">{section.title}</h3>
                      </div>
                      <div className="space-y-3 md:space-y-4 md:pl-13">
                        {section.questions.map((q) => renderQuestion(q, section.id))}
                      </div>
                    </div>
                  );
                })}

                {/* Industry-specific questions (show if industry selected and section open) */}
                {industryQuestions.length > 0 && sections.find(s => s.id === 'company')?.isOpen && (
                  <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div 
                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${brandConfig.accentColor}20, ${brandConfig.primaryColor}20)` }}
                      >
                        <Building2 className="h-4 w-4 md:h-5 md:w-5" style={{ color: brandConfig.accentColor }} />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold">Industry-Specific Questions</h3>
                    </div>
                    <div className="space-y-3 md:space-y-4 md:pl-13">
                      {industryQuestions.map((q) => renderQuestion(q, undefined, true))}
                    </div>
                  </div>
                )}

                {/* Process follow-up questions */}
                {selectedProcess && (
                  <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div 
                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${brandConfig.secondaryColor}20, ${brandConfig.accentColor}20)` }}
                      >
                        <Target className="h-4 w-4 md:h-5 md:w-5" style={{ color: brandConfig.secondaryColor }} />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold">
                        {processes.find(p => p.processId === selectedProcess)?.processName} Questions
                      </h3>
                    </div>
                    <div className="space-y-3 md:space-y-4 md:pl-13">
                      {processes
                        .find(p => p.processId === selectedProcess)
                        ?.questions.map((q) => renderQuestion(q))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Custom slider styling - no square borders */}
      <style>{`
        .discovery-slider [data-orientation="horizontal"] {
          background: ${brandConfig.primaryColor}20;
          height: 8px;
          border-radius: 9999px;
        }
        .discovery-slider [data-orientation="horizontal"] > span {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.accentColor});
          border-radius: 9999px;
        }
        .discovery-slider [role="slider"] {
          border: 2px solid ${brandConfig.accentColor};
          background-color: #ffffff;
          height: 20px;
          width: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          outline: none;
        }
        .discovery-slider [role="slider"]:focus {
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* ==================== ALWAYS MOUNTED: Onboarding + Banner + Dialog ==================== */}
      
      {/* Onboarding Tooltip - always rendered so it persists across view mode changes */}
      {onboarding.isActive && onboarding.currentStepData && (
        <OnboardingTooltip
          step={onboarding.currentStepData}
          currentStep={onboarding.currentStep}
          totalSteps={onboarding.totalSteps}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onSkip={onboarding.skipTour}
          onContactRequest={onboarding.requestContact}
          isActive={onboarding.isActive}
        />
      )}

      {/* Like What You See Banner */}
      <LikeWhatYouSeeBanner
        state={bannerState}
        companyName={initialBrandConfig.companyName}
        onContact={() => {
          setBannerState('minimized');
          setShowContactDialog(true);
        }}
        onMinimize={() => setBannerState('minimized')}
        onExpand={() => setBannerState('expanded')}
      />

      {/* Contact Dialog */}
      <ContactDialog
        open={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        brandConfig={initialBrandConfig}
        toolInterest="discovery"
      />

      {/* Hidden PDF Pages for Export - 3 pages: overview + 2 sections each on pages 2 & 3 */}
      <PdfPage
        ref={pdfPage1Ref}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName || 'Company'}
        toolName="Discovery Summary"
        subtitle="Client Discovery Questionnaire"
        primaryColor={brandConfig.primaryColor || '#3b82f6'}
        secondaryColor={brandConfig.secondaryColor}
        badges={brandConfig.industry ? [{ label: 'Industry', value: brandConfig.industry }] : undefined}
        benefitBlurb="Comprehensive discovery helps identify key challenges, goals, and requirements to deliver tailored solutions."
      >
        <DiscoveryPdfSummary
          sections={sections}
          responses={responses}
          primaryColor={brandConfig.primaryColor || '#3b82f6'}
          pageNumber={1}
        />
      </PdfPage>
      
      {/* Page 2: First 2 sections with responses */}
      <PdfPage
        ref={pdfPage2Ref}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName || 'Company'}
        toolName="Discovery Summary"
        subtitle="Collected Responses"
        primaryColor={brandConfig.primaryColor || '#3b82f6'}
        secondaryColor={brandConfig.secondaryColor}
        pageNumber={2}
        totalPages={3}
        minimalHeader
      >
        <DiscoveryPdfSummary
          sections={sections}
          responses={responses}
          primaryColor={brandConfig.primaryColor || '#3b82f6'}
          pageNumber={2}
          startSectionIndex={0}
          totalSectionsPerPage={2}
        />
      </PdfPage>

      {/* Page 3: Next 2 sections with responses */}
      <PdfPage
        ref={pdfPage3Ref}
        logoUrl={brandConfig.logoUrl}
        companyName={brandConfig.companyName || 'Company'}
        toolName="Discovery Summary"
        subtitle="Collected Responses"
        primaryColor={brandConfig.primaryColor || '#3b82f6'}
        secondaryColor={brandConfig.secondaryColor}
        pageNumber={3}
        totalPages={3}
        minimalHeader
      >
        <DiscoveryPdfSummary
          sections={sections}
          responses={responses}
          primaryColor={brandConfig.primaryColor || '#3b82f6'}
          pageNumber={3}
          startSectionIndex={2}
          totalSectionsPerPage={2}
        />
      </PdfPage>
    </div>
  );
}
