import { useState, useMemo, useRef, useEffect } from 'react';
import { format, subDays, differenceInDays, addDays } from 'date-fns';
import { 
  X, FileDown, Calendar, Plus, Trash2, GripVertical, 
  Building2, User, Target, Clock, ClipboardList 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { type BrandConfig } from './PrototypeBrandingBar';
import { toast } from 'sonner';
import { MSPDiscoveryConfig, Person, MSPStage } from '@/lib/mspDiscoveryTransform';

interface Stage {
  id: string;
  name: string;
  durationDays: number;
  owners: string[]; // Array of person IDs
  order: number;
}

interface StageWithDates extends Stage {
  startDate: Date;
  endDate: Date;
}

interface SuccessPlanPrototypeProps {
  onClose: () => void;
  initialBrandConfig: BrandConfig;
  discoveryData?: MSPDiscoveryConfig;
  onEditDiscovery?: () => void;
}

const defaultPeople: Person[] = [
  { id: 'seller-1', name: 'You', title: 'Sales Rep', side: 'seller' },
  { id: 'buyer-1', name: 'Prospect', title: 'Decision Maker', side: 'buyer' },
];

const defaultStages: Stage[] = [
  { id: 's1', name: 'Discovery Call', durationDays: 3, owners: ['seller-1'], order: 1 },
  { id: 's2', name: 'Demo & Presentation', durationDays: 5, owners: ['seller-1'], order: 2 },
  { id: 's3', name: 'Technical Evaluation', durationDays: 7, owners: ['buyer-1'], order: 3 },
  { id: 's4', name: 'Pricing & Proposal', durationDays: 4, owners: ['seller-1'], order: 4 },
  { id: 's5', name: 'Legal Review', durationDays: 7, owners: ['buyer-1'], order: 5 },
  { id: 's6', name: 'Executive Approval', durationDays: 5, owners: ['buyer-1'], order: 6 },
  { id: 's7', name: 'Contract Signature', durationDays: 2, owners: ['buyer-1'], order: 7 },
];

const CYCLE_OPTIONS = [
  { label: '4 weeks', days: 28 },
  { label: '6 weeks', days: 42 },
  { label: '8 weeks', days: 56 },
  { label: '12 weeks', days: 84 },
];

export function SuccessPlanPrototype({ onClose, initialBrandConfig, discoveryData, onEditDiscovery }: SuccessPlanPrototypeProps) {
  const [brandConfig] = useState<BrandConfig>(initialBrandConfig);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [targetDate, setTargetDate] = useState<Date>(() => {
    return addDays(new Date(), 42);
  });
  const [stages, setStages] = useState<Stage[]>(defaultStages);
  const [people, setPeople] = useState<Person[]>(defaultPeople);
  const [selectedCycle, setSelectedCycle] = useState<string>('42');

  // Apply discovery data on mount
  useEffect(() => {
    if (discoveryData) {
      // Set stages from discovery if available
      if (discoveryData.stages && discoveryData.stages.length > 0) {
        setStages(discoveryData.stages);
      }
      // Set people from discovery if available
      if (discoveryData.people && discoveryData.people.length > 0) {
        setPeople(discoveryData.people);
      }
      // Set sales cycle from discovery
      if (discoveryData.salesCycleWeeks) {
        const days = discoveryData.salesCycleWeeks * 7;
        setSelectedCycle(days.toString());
        setTargetDate(addDays(new Date(), days));
      }
      // Set buyer name from discovery (legacy support)
      if (discoveryData.buyerName && !discoveryData.people) {
        setPeople(prev => prev.map(p => 
          p.side === 'buyer' ? { ...p, name: discoveryData.buyerName! } : p
        ));
      }
    }
  }, [discoveryData]);

  // Get people by side
  const sellers = useMemo(() => people.filter(p => p.side === 'seller'), [people]);
  const buyers = useMemo(() => people.filter(p => p.side === 'buyer'), [people]);

  // Handle PDF export
  const handleExportPdf = async () => {
    if (!contentRef.current || isExporting) return;
    
    setIsExporting(true);
    toast.info('Generating PDF...');
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) => el.classList?.contains('no-print'),
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${brandConfig.companyName || 'Success'}-Plan.pdf`);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate workback dates from target date
  const stagesWithDates = useMemo((): StageWithDates[] => {
    let currentDate = new Date(targetDate);
    const results: StageWithDates[] = [];
    
    const sortedStages = [...stages].sort((a, b) => b.order - a.order);
    
    for (const stage of sortedStages) {
      const endDate = new Date(currentDate);
      const startDate = subDays(endDate, stage.durationDays);
      
      results.unshift({
        ...stage,
        startDate,
        endDate,
      });
      
      currentDate = startDate;
    }
    
    return results;
  }, [stages, targetDate]);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    if (stagesWithDates.length === 0) {
      return { start: new Date(), end: new Date(), totalDays: 0 };
    }
    const start = stagesWithDates[0].startDate;
    const end = stagesWithDates[stagesWithDates.length - 1].endDate;
    return {
      start,
      end,
      totalDays: differenceInDays(end, start),
    };
  }, [stagesWithDates]);

  // Calculate weeks for the timeline header
  const weeks = useMemo(() => {
    const result: { weekNum: number; startDate: Date }[] = [];
    let current = new Date(timelineBounds.start);
    let weekNum = 1;
    
    while (current <= timelineBounds.end) {
      result.push({ weekNum, startDate: new Date(current) });
      current = addDays(current, 7);
      weekNum++;
    }
    
    return result;
  }, [timelineBounds]);

  const handleUpdateStage = (id: string, updates: Partial<Stage>) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteStage = (id: string) => {
    setStages(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return filtered.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleAddStage = () => {
    const newId = `s${Date.now()}`;
    setStages(prev => [
      ...prev,
      {
        id: newId,
        name: 'New Stage',
        durationDays: 3,
        owners: [sellers[0]?.id || 'seller-1'],
        order: prev.length + 1,
      },
    ]);
  };

  const handleAddPerson = (side: 'seller' | 'buyer') => {
    const newId = `${side}-${Date.now()}`;
    setPeople(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        title: '',
        side,
      },
    ]);
  };

  const handleUpdatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeletePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    // Remove this person from any stage owners
    setStages(prev => prev.map(s => ({
      ...s,
      owners: s.owners.filter(ownerId => ownerId !== id),
    })));
  };

  const handleToggleStageOwner = (stageId: string, personId: string) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      const hasOwner = s.owners.includes(personId);
      return {
        ...s,
        owners: hasOwner 
          ? s.owners.filter(id => id !== personId)
          : [...s.owners, personId],
      };
    }));
  };

  const handleCycleChange = (days: string) => {
    setSelectedCycle(days);
    setTargetDate(addDays(new Date(), parseInt(days)));
  };

  // Stats
  const totalDays = stages.reduce((sum, s) => sum + s.durationDays, 0);

  // Get stage position and width for Gantt chart
  const getStagePosition = (stage: StageWithDates) => {
    const startOffset = differenceInDays(stage.startDate, timelineBounds.start);
    const width = stage.durationDays;
    const leftPercent = (startOffset / timelineBounds.totalDays) * 100;
    const widthPercent = (width / timelineBounds.totalDays) * 100;
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  // Get stage color based on owners - split if both sides
  const getStageStyle = (stage: Stage) => {
    const stageOwners = people.filter(p => stage.owners.includes(p.id));
    const hasSeller = stageOwners.some(p => p.side === 'seller');
    const hasBuyer = stageOwners.some(p => p.side === 'buyer');
    
    if (hasSeller && hasBuyer) {
      // Split gradient for shared accountability
      return {
        background: `linear-gradient(90deg, 
          ${brandConfig.primaryColor} 0%, 
          ${brandConfig.primaryColor} 50%, 
          ${brandConfig.secondaryColor} 50%, 
          ${brandConfig.secondaryColor} 100%)`,
      };
    } else if (hasSeller) {
      return { backgroundColor: brandConfig.primaryColor };
    } else if (hasBuyer) {
      return { backgroundColor: brandConfig.secondaryColor };
    }
    return { backgroundColor: brandConfig.primaryColor };
  };

  // Get owner label for a stage
  const getOwnerLabel = (stage: Stage) => {
    const stageOwners = people.filter(p => stage.owners.includes(p.id));
    if (stageOwners.length === 0) return 'Unassigned';
    if (stageOwners.length === 1) return stageOwners[0].name || stageOwners[0].side;
    return `${stageOwners.length} owners`;
  };

  // Check if stage has mixed ownership
  const hasSharedOwnership = (stage: Stage) => {
    const stageOwners = people.filter(p => stage.owners.includes(p.id));
    const hasSeller = stageOwners.some(p => p.side === 'seller');
    const hasBuyer = stageOwners.some(p => p.side === 'buyer');
    return hasSeller && hasBuyer;
  };

  return (
    <div 
      ref={contentRef}
      className="flex flex-col min-h-[600px] max-h-[80vh] relative"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 85% 80%, ${brandConfig.accentColor}15 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 95% 20%, ${brandConfig.secondaryColor}10 0%, transparent 40%),
          linear-gradient(180deg, #fafafa 0%, #f8f7fc 100%)
        `,
      }}
    >
      {/* Dot grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${brandConfig.primaryColor}15 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-3 md:p-6 pb-0">
        <div 
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
                  <Target className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-white flex items-center gap-1 md:gap-2">
                  <Target className="h-4 w-4 md:h-5 md:w-5 shrink-0 hidden md:block" />
                  <span className="truncate">{brandConfig.companyName || 'Company'} <span className="hidden sm:inline">Mutual </span>Success Plan</span>
                </h1>
                <p className="text-white/80 text-xs md:text-sm truncate">
                  Target: {format(targetDate, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleExportPdf}
                disabled={isExporting}
                className="gap-1 md:gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 no-print h-8 px-2 md:px-3 text-xs md:text-sm"
              >
                <FileDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - side by side on desktop, stacked on mobile */}
      <div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-hidden px-3 md:px-6 py-2 md:py-4 gap-3 md:gap-0">
        {/* Left Panel - Configuration */}
        <div className="md:w-[420px] border-b md:border-b-0 md:border-r border-border/50 bg-background/60 backdrop-blur-sm rounded-xl md:rounded-l-xl md:rounded-r-none flex flex-col max-h-[350px] md:max-h-none overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              {/* Team Members Configuration */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Sales Team */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" style={{ color: brandConfig.primaryColor }} />
                      Sales Team
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddPerson('seller')}
                      className="h-5 w-5 p-0"
                      style={{ color: brandConfig.primaryColor }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {sellers.map((person) => (
                      <div key={person.id} className="flex items-center gap-1 bg-muted/30 rounded p-1.5">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <Input
                            value={person.name}
                            onChange={(e) => handleUpdatePerson(person.id, { name: e.target.value })}
                            placeholder="Name"
                            className="h-6 text-[10px] md:text-xs border-none bg-transparent p-0 focus-visible:ring-0"
                          />
                          <Input
                            value={person.title}
                            onChange={(e) => handleUpdatePerson(person.id, { title: e.target.value })}
                            placeholder="Title"
                            className="h-5 text-[9px] md:text-[10px] border-none bg-transparent p-0 focus-visible:ring-0 text-muted-foreground"
                          />
                        </div>
                        {sellers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePerson(person.id)}
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prospect Team */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" style={{ color: brandConfig.secondaryColor }} />
                      Prospect Team
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddPerson('buyer')}
                      className="h-5 w-5 p-0"
                      style={{ color: brandConfig.secondaryColor }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {buyers.map((person) => (
                      <div key={person.id} className="flex items-center gap-1 bg-muted/30 rounded p-1.5">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <Input
                            value={person.name}
                            onChange={(e) => handleUpdatePerson(person.id, { name: e.target.value })}
                            placeholder="Name"
                            className="h-6 text-[10px] md:text-xs border-none bg-transparent p-0 focus-visible:ring-0"
                          />
                          <Input
                            value={person.title}
                            onChange={(e) => handleUpdatePerson(person.id, { title: e.target.value })}
                            placeholder="Title"
                            className="h-5 text-[9px] md:text-[10px] border-none bg-transparent p-0 focus-visible:ring-0 text-muted-foreground"
                          />
                        </div>
                        {buyers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePerson(person.id)}
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-xs md:text-sm font-medium flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 md:h-4 md:w-4" style={{ color: brandConfig.primaryColor }} />
                  Target Sign Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-8 md:h-10 text-xs md:text-sm"
                    >
                      <Calendar className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                      {format(targetDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={targetDate}
                      onSelect={(date) => date && setTargetDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {differenceInDays(targetDate, new Date())} days until target
                </p>
              </div>

              {/* Sales Cycle Length */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-xs md:text-sm font-medium flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" style={{ color: brandConfig.primaryColor }} />
                  Sales Cycle
                </Label>
                <Select value={selectedCycle} onValueChange={handleCycleChange}>
                  <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_OPTIONS.map((option) => (
                      <SelectItem key={option.days} value={option.days.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stages */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs md:text-sm font-medium">Stages</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAddStage}
                    className="h-7 md:h-8 gap-1 text-[10px] md:text-xs px-2"
                    style={{ color: brandConfig.primaryColor }}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="hidden sm:inline">Add Stage</span><span className="sm:hidden">Add</span>
                  </Button>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {stages.map((stage) => (
                    <div 
                      key={stage.id} 
                      className="p-2 md:p-3 rounded-lg space-y-2 md:space-y-3 bg-muted/20"
                    >
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <GripVertical className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/50 cursor-grab shrink-0" />
                        <div 
                          className="w-2 h-2 rounded-full shrink-0"
                          style={getStageStyle(stage)}
                        />
                        <Input
                          value={stage.name}
                          onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                          className="h-7 md:h-8 text-xs md:text-sm flex-1 border-none bg-transparent p-0 focus-visible:ring-0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStage(stage.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground mb-1">
                            <span>Duration</span>
                            <span>{stage.durationDays}d</span>
                          </div>
                          <Slider
                            value={[stage.durationDays]}
                            onValueChange={([value]) => handleUpdateStage(stage.id, { durationDays: value })}
                            min={1}
                            max={14}
                            step={1}
                            className={`success-plan-slider ${hasSharedOwnership(stage) ? 'success-plan-slider-shared' : stage.owners.some(id => people.find(p => p.id === id)?.side === 'buyer') ? 'success-plan-slider-buyer' : 'success-plan-slider-seller'}`}
                          />
                        </div>
                      </div>

                      {/* Multi-person owner selection */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] md:text-xs text-muted-foreground">Owners:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {people.map((person) => (
                            <label
                              key={person.id}
                              className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] cursor-pointer transition-colors",
                                stage.owners.includes(person.id)
                                  ? "text-white"
                                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                              )}
                              style={stage.owners.includes(person.id) ? {
                                backgroundColor: person.side === 'seller' ? brandConfig.primaryColor : brandConfig.secondaryColor,
                              } : undefined}
                            >
                              <Checkbox
                                checked={stage.owners.includes(person.id)}
                                onCheckedChange={() => handleToggleStageOwner(stage.id, person.id)}
                                className="h-3 w-3 border-current"
                              />
                              <span className="truncate max-w-[60px]">{person.name || (person.side === 'seller' ? 'Sales' : 'Buyer')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Gantt Chart Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/80 backdrop-blur-sm rounded-xl md:rounded-l-none md:rounded-r-xl">
          <ScrollArea className="flex-1">
            <div className="p-3 md:p-8">
              {/* Timeline Header */}
              <div className="mb-3 md:mb-6">
                <h2 className="text-sm md:text-lg font-semibold mb-0.5 md:mb-1" style={{ color: brandConfig.textColor }}>
                  Timeline
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {format(timelineBounds.start, 'MMM d')} – {format(timelineBounds.end, 'MMM d')} • {totalDays}d
                </p>
              </div>

              {/* Gantt Chart */}
              <div className="bg-background/80 rounded-lg md:rounded-xl border border-border/50 p-3 md:p-6 mb-3 md:mb-6">
                {/* Week headers */}
                <div className="hidden sm:flex mb-2 md:mb-4 border-b border-border/30 pb-2 overflow-x-auto">
                  <div className="w-20 sm:w-24 md:w-40 shrink-0" />
                  <div className="flex-1 flex min-w-0">
                    {weeks.map((week) => (
                      <div 
                        key={week.weekNum} 
                        className="flex-1 text-[9px] md:text-xs text-muted-foreground text-center min-w-[30px] md:min-w-0"
                      >
                        <span className="hidden md:inline">Week </span>W{week.weekNum}
                        <div className="text-[8px] md:text-[10px] hidden md:block">{format(week.startDate, 'MMM d')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gantt bars */}
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {stagesWithDates.map((stage) => {
                    const position = getStagePosition(stage);
                    const stageStyle = getStageStyle(stage);
                    const isShared = hasSharedOwnership(stage);
                    
                    return (
                      <div key={stage.id} className="flex items-center">
                        {/* Stage name */}
                        <div className="w-16 sm:w-24 md:w-40 shrink-0 pr-1 sm:pr-2 md:pr-4">
                          <div className="text-[10px] sm:text-xs md:text-sm font-medium truncate" style={{ color: brandConfig.textColor }}>
                            {stage.name}
                          </div>
                          <div className="text-[8px] sm:text-[9px] md:text-xs text-muted-foreground hidden sm:block md:block">
                            {format(stage.startDate, 'MMM d')} – {format(stage.endDate, 'MMM d')}
                          </div>
                        </div>
                        {/* Gantt bar */}
                        <div className="flex-1 h-6 sm:h-7 md:h-10 relative bg-muted/30 rounded">
                          <div
                            className="absolute h-full rounded flex items-center justify-between px-1 sm:px-1.5 md:px-3 text-white text-[9px] sm:text-[10px] md:text-xs font-medium transition-all"
                            style={{
                              left: position.left,
                              width: position.width,
                              ...stageStyle,
                              minWidth: '32px',
                            }}
                          >
                            <span className="truncate">{stage.durationDays}d</span>
                            {isShared ? (
                              <div className="flex -space-x-1">
                                <User className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 shrink-0" />
                                <Building2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 shrink-0" />
                              </div>
                            ) : stage.owners.some(id => people.find(p => p.id === id)?.side === 'buyer') ? (
                              <Building2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 shrink-0" />
                            ) : (
                              <User className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage List Summary */}
              <div className="bg-background/80 rounded-lg md:rounded-xl border border-border/50 p-3 md:p-6">
                <h3 className="font-semibold mb-2 md:mb-4 text-xs md:text-base" style={{ color: brandConfig.textColor }}>
                  Stage Details
                </h3>
                <div className="grid gap-1.5 md:gap-2">
                  {stagesWithDates.map((stage) => {
                    const stageStyle = getStageStyle(stage);
                    const isShared = hasSharedOwnership(stage);
                    return (
                      <div 
                        key={stage.id}
                        className="flex items-center justify-between py-1.5 md:py-2 px-2 md:px-3 rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <div 
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0"
                            style={stageStyle}
                          />
                          <span className="font-medium text-xs md:text-sm truncate">{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-4 text-[10px] md:text-sm text-muted-foreground shrink-0">
                          <span className="hidden md:inline">{format(stage.startDate, 'MMM d')} – {format(stage.endDate, 'MMM d')}</span>
                          <span 
                            className="px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-xs text-white"
                            style={stageStyle}
                          >
                            {isShared ? 'Shared' : getOwnerLabel(stage)}
                          </span>
                          <span className="w-8 md:w-16 text-right">{stage.durationDays}d</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-3 md:mt-6 grid grid-cols-4 gap-1.5 md:gap-4">
                <div className="bg-background/80 rounded-lg md:rounded-xl border border-border/50 p-2 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold" style={{ color: brandConfig.accentColor }}>
                    {Math.ceil(totalDays / 7)}
                  </div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Weeks</div>
                </div>
                <div className="bg-background/80 rounded-lg md:rounded-xl border border-border/50 p-2 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold" style={{ color: brandConfig.primaryColor }}>
                    {stages.length}
                  </div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Stages</div>
                </div>
                <div className="bg-background/80 rounded-lg md:rounded-xl border border-border/50 p-2 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold" style={{ color: brandConfig.primaryColor }}>
                    {sellers.length}
                  </div>
                  <div className="text-[9px] md:text-xs text-muted-foreground truncate">Sales</div>
                </div>
                <div className="bg-background/80 rounded-lg md:rounded-xl border border-border/50 p-2 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold" style={{ color: brandConfig.secondaryColor }}>
                    {buyers.length}
                  </div>
                  <div className="text-[9px] md:text-xs text-muted-foreground truncate">Buyers</div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Custom slider styling with brand colors */}
      <style>{`
        .success-plan-slider [data-orientation="horizontal"] {
          background: ${brandConfig.primaryColor}20;
          height: 8px;
          border-radius: 9999px;
        }
        .success-plan-slider [data-orientation="horizontal"] > span {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.accentColor});
          border-radius: 9999px;
        }
        .success-plan-slider [role="slider"] {
          border: 2px solid ${brandConfig.accentColor};
          background-color: #ffffff;
          height: 20px;
          width: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          outline: none;
        }
        .success-plan-slider [role="slider"]:focus {
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .success-plan-slider-seller [data-orientation="horizontal"] {
          background: ${brandConfig.primaryColor}20;
        }
        .success-plan-slider-seller [data-orientation="horizontal"] > span {
          background: ${brandConfig.primaryColor};
        }
        .success-plan-slider-seller [role="slider"] {
          border-color: ${brandConfig.primaryColor};
          background-color: #ffffff;
        }
        .success-plan-slider-buyer [data-orientation="horizontal"] {
          background: ${brandConfig.secondaryColor}20;
        }
        .success-plan-slider-buyer [data-orientation="horizontal"] > span {
          background: ${brandConfig.secondaryColor};
        }
        .success-plan-slider-buyer [role="slider"] {
          border-color: ${brandConfig.secondaryColor};
          background-color: #ffffff;
        }
        .success-plan-slider-shared [data-orientation="horizontal"] {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}20 50%, ${brandConfig.secondaryColor}20 50%);
        }
        .success-plan-slider-shared [data-orientation="horizontal"] > span {
          background: linear-gradient(90deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor});
        }
        .success-plan-slider-shared [role="slider"] {
          border-color: ${brandConfig.accentColor};
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
}
