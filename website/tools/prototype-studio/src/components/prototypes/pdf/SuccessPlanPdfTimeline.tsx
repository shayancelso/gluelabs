import { format, differenceInDays, addDays } from 'date-fns';

interface Person {
  id: string;
  name: string;
  title?: string;
  side: 'seller' | 'buyer';
}

interface StageWithDates {
  id: string;
  name: string;
  durationDays: number;
  owners: string[];
  order: number;
  startDate: Date;
  endDate: Date;
}

interface SuccessPlanPdfTimelineProps {
  stagesWithDates: StageWithDates[];
  people: Person[];
  targetDate: Date;
  primaryColor: string;
  secondaryColor: string;
}

export function SuccessPlanPdfTimeline({
  stagesWithDates,
  people,
  targetDate,
  primaryColor,
  secondaryColor,
}: SuccessPlanPdfTimelineProps) {
  if (stagesWithDates.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400">No stages configured</div>;
  }

  const timelineStart = stagesWithDates[0].startDate;
  const timelineEnd = stagesWithDates[stagesWithDates.length - 1].endDate;
  const totalDays = Math.max(differenceInDays(timelineEnd, timelineStart), 1);

  // Generate week markers
  const weeks: { weekNum: number; startDay: number }[] = [];
  const totalWeeks = Math.ceil(totalDays / 7);
  for (let i = 0; i <= totalWeeks; i++) {
    weeks.push({ weekNum: i + 1, startDay: i * 7 });
  }

  const getStagePosition = (stage: StageWithDates) => {
    const startOffset = differenceInDays(stage.startDate, timelineStart);
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (stage.durationDays / totalDays) * 100;
    return { left: `${Math.max(0, leftPercent)}%`, width: `${Math.max(3, widthPercent)}%` };
  };

  const getStageStyle = (stage: StageWithDates) => {
    const stageOwners = people.filter(p => stage.owners.includes(p.id));
    const hasSeller = stageOwners.some(p => p.side === 'seller');
    const hasBuyer = stageOwners.some(p => p.side === 'buyer');
    
    if (hasSeller && hasBuyer) {
      return {
        background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor} 50%, ${secondaryColor} 50%, ${secondaryColor} 100%)`,
      };
    } else if (hasSeller) {
      return { backgroundColor: primaryColor };
    } else if (hasBuyer) {
      return { backgroundColor: secondaryColor };
    }
    return { backgroundColor: primaryColor };
  };

  const getOwnerLabel = (stage: StageWithDates) => {
    const stageOwners = people.filter(p => stage.owners.includes(p.id));
    if (stageOwners.length === 0) return 'TBD';
    if (stageOwners.length === 1) return stageOwners[0].name || stageOwners[0].side;
    return stageOwners.map(o => o.name || o.side).join(', ');
  };

  // Fixed dimensions for portrait PDF - taller layout allows more vertical space
  const stageCount = stagesWithDates.length;
  const rowHeight = stageCount > 10 ? 36 : stageCount > 7 ? 42 : 48;
  const fontSize = stageCount > 10 ? '10px' : stageCount > 7 ? '11px' : '12px';
  const ganttAreaWidth = 400; // Fixed width for Gantt bars in portrait

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header with legend and target date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-sm shadow-sm"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-gray-600 font-medium">Sales Team</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-sm shadow-sm"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-gray-600 font-medium">Buyer Team</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-sm shadow-sm"
              style={{
                background: `linear-gradient(90deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
              }}
            />
            <span className="text-gray-600 font-medium">Shared</span>
          </div>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Target: {format(targetDate, 'MMM d, yyyy')}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 flex flex-col">
        {/* Week header */}
        <div className="flex border-b-2 border-gray-200 mb-2">
          <div className="w-[140px] shrink-0 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Stage
          </div>
          <div className="flex-1 relative h-6">
            {weeks.slice(0, Math.min(weeks.length, 16)).map((week) => {
              const leftPercent = (week.startDay / totalDays) * 100;
              if (leftPercent > 100) return null;
              return (
                <div 
                  key={week.weekNum}
                  className="absolute top-0 text-xs text-gray-400 font-medium"
                  style={{ 
                    left: `${leftPercent}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  W{week.weekNum}
                </div>
              );
            })}
          </div>
          <div className="w-[100px] shrink-0 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
            Owner
          </div>
        </div>

        {/* Stage rows with Gantt bars */}
        <div className="flex-1 overflow-hidden">
          {stagesWithDates.map((stage, idx) => (
            <div 
              key={stage.id}
              className={`flex items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
              style={{ height: rowHeight }}
            >
              {/* Stage name */}
              <div 
                className="w-[140px] shrink-0 px-2 font-medium text-gray-700 leading-tight"
                style={{ fontSize }}
              >
                {stage.name}
              </div>
              
              {/* Gantt bar area - fixed width for consistent rendering */}
              <div className="relative h-full mx-1" style={{ width: ganttAreaWidth }}>
                {/* Background grid lines for weeks */}
                {weeks.slice(0, Math.min(weeks.length, 16)).map((week) => {
                  const leftPercent = (week.startDay / totalDays) * 100;
                  if (leftPercent > 100) return null;
                  return (
                    <div
                      key={week.weekNum}
                      className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: `${leftPercent}%` }}
                    />
                  );
                })}
                
                {/* The Gantt bar - use fixed pixel positioning */}
                {(() => {
                  const startOffset = differenceInDays(stage.startDate, timelineStart);
                  const leftPx = (startOffset / totalDays) * ganttAreaWidth;
                  const widthPx = Math.max(20, (stage.durationDays / totalDays) * ganttAreaWidth);
                  
                  return (
                    <div 
                      className="absolute top-1 rounded shadow-sm flex items-center justify-center text-white font-semibold overflow-hidden"
                      style={{
                        left: leftPx,
                        width: widthPx,
                        height: rowHeight - 12,
                        ...getStageStyle(stage),
                        fontSize: '10px',
                      }}
                    >
                      <span className="px-1 whitespace-nowrap">{stage.durationDays}d</span>
                    </div>
                  );
                })()}
              </div>
              
              {/* Owner */}
              <div 
                className="w-[100px] shrink-0 px-2 text-gray-600 text-right leading-tight"
                style={{ fontSize }}
              >
                {getOwnerLabel(stage)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline summary */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>
          Start: {format(timelineStart, 'MMM d, yyyy')}
        </span>
        <span className="font-medium text-gray-700">
          {stagesWithDates.length} stages • {totalDays} days total
        </span>
        <span>
          End: {format(timelineEnd, 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
}
