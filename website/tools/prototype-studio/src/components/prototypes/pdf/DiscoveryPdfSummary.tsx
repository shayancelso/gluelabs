interface Section {
  id: string;
  title: string;
  icon: string;
  questions: Question[];
}

interface Question {
  id: string;
  type: string;
  question: string;
  options?: Array<{ id: string; label: string }>;
}

interface DiscoveryPdfSummaryProps {
  sections: Section[];
  responses: Record<string, any>;
  primaryColor: string;
  pageNumber?: number;
  totalSectionsPerPage?: number; // How many sections this page should show
  startSectionIndex?: number; // Which section index to start from
}

export function DiscoveryPdfSummary({
  sections,
  responses,
  primaryColor,
  pageNumber = 1,
  totalSectionsPerPage = 2,
  startSectionIndex = 0,
}: DiscoveryPdfSummaryProps) {
  const getResponseDisplay = (question: Question, response: any): string => {
    if (!response) return '';
    
    if (Array.isArray(response)) {
      // Multi-select - find labels from options
      if (question.options) {
        const labels = response.map(id => 
          question.options?.find(o => o.id === id)?.label || id
        );
        return labels.join(', ');
      }
      return response.join(', ');
    }
    
    if (typeof response === 'object' && response.id) {
      // Single select with object
      return question.options?.find(o => o.id === response.id)?.label || response.id;
    }
    
    if (question.options && typeof response === 'string') {
      // Single select string
      const option = question.options.find(o => o.id === response);
      return option?.label || response;
    }
    
    return String(response);
  };

  // Build set of valid question IDs from sections
  const validQuestionIds = new Set<string>();
  sections.forEach(section => {
    section.questions.forEach(q => validQuestionIds.add(q.id));
  });

  const totalQuestions = validQuestionIds.size;
  // Only count answers for valid question IDs
  const answeredQuestions = [...validQuestionIds].filter(id => 
    responses[id] !== undefined && responses[id] !== ''
  ).length;
  // Guaranteed to never exceed 100%
  const completionPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Page 1: Section overview cards with sample questions
  // Pages 2+: Detailed responses - 2 sections per page, FULL content (no truncation)
  const isOverviewPage = pageNumber === 1;

  // For page 1, show section overview cards
  if (isOverviewPage) {
    return (
      <div className="h-full flex flex-col p-4 overflow-hidden">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Discovery Sections Overview
        </div>
        
        {/* Section cards in 2x2 grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {sections.map(section => {
            const answeredInSection = section.questions.filter(
              q => responses[q.id] !== undefined && responses[q.id] !== ''
            ).length;
            const sectionPercent = section.questions.length > 0 
              ? Math.round((answeredInSection / section.questions.length) * 100) 
              : 0;

            // Get sample answered questions for this section
            const sampleQuestions = section.questions
              .filter(q => responses[q.id] !== undefined && responses[q.id] !== '')
              .slice(0, 2);

            return (
              <div 
                key={section.id} 
                className="border border-gray-200 rounded-lg p-3 flex flex-col"
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 
                    className="text-sm font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {section.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {answeredInSection}/{section.questions.length}
                    </span>
                    <div 
                      className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${sectionPercent}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Sample responses */}
                <div className="flex-1 space-y-2">
                  {sampleQuestions.length > 0 ? (
                    sampleQuestions.map(question => {
                      const display = getResponseDisplay(question, responses[question.id]);
                      return (
                        <div key={question.id} className="text-xs">
                          <div className="text-gray-500 leading-tight mb-0.5">
                            {question.question.replace(/\?$/, '')}
                          </div>
                          <div className="font-medium text-gray-700 leading-tight">
                            {display}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      No responses yet
                    </div>
                  )}
                </div>
                
                {/* Question topics preview */}
                {answeredInSection < section.questions.length && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-[10px] text-gray-400">
                      Topics: {section.questions.slice(0, 3).map(q => 
                        q.question.split(' ').slice(0, 3).join(' ')
                      ).join(' • ')}
                      {section.questions.length > 3 && '...'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Pages 2+: Show 2 sections per page with FULL responses (no truncation)
  const sectionsWithResponses = sections.map(section => ({
    ...section,
    answeredQuestions: section.questions.filter(
      q => responses[q.id] !== undefined && responses[q.id] !== ''
    ),
  })).filter(s => s.answeredQuestions.length > 0);

  // Get the sections for this page
  const pageSections = sectionsWithResponses.slice(startSectionIndex, startSectionIndex + totalSectionsPerPage);

  if (pageSections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">Discovery In Progress</div>
          <div className="text-gray-300 text-xs">
            Responses will appear here once collected
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Collected Responses
      </div>
      
      {/* Sections stacked vertically - 2 per page, full height split */}
      <div className="flex-1 flex flex-col gap-4">
        {pageSections.map(section => (
          <div 
            key={section.id}
            className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col"
          >
            {/* Section header */}
            <div 
              className="px-4 py-2 text-sm font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {section.title}
              <span className="ml-2 opacity-70 font-normal">
                ({section.answeredQuestions.length} responses)
              </span>
            </div>
            
            {/* All responses - no truncation, full text */}
            <div className="flex-1 p-4 space-y-3 overflow-hidden">
              {section.answeredQuestions.map(question => {
                const display = getResponseDisplay(question, responses[question.id]);
                return (
                  <div key={question.id} className="text-xs">
                    <div className="text-gray-500 leading-relaxed mb-0.5">
                      {question.question}
                    </div>
                    <div className="font-medium text-gray-800 leading-relaxed">
                      {display}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
