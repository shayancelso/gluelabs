import { forwardRef, ReactNode } from 'react';
import { PDF_WIDTH, PDF_HEIGHT, PDF_PORTRAIT_WIDTH, PDF_PORTRAIT_HEIGHT, PDF_MARGIN } from '@/lib/exportPdf';
import { PdfHeader } from './PdfHeader';
import { PdfFooter } from './PdfFooter';

interface PdfPageProps {
  // Header props
  logoUrl?: string;
  companyName: string;
  toolName: string;
  subtitle?: string;
  primaryColor: string;
  secondaryColor?: string;
  badges?: Array<{ label: string; value: string }>;
  
  // Content
  children: ReactNode;
  
  // Benefit blurb - explains the value proposition
  benefitBlurb?: string;
  
  // Page number for multi-page exports
  pageNumber?: number;
  totalPages?: number;
  
  // Whether to show full header or minimal
  minimalHeader?: boolean;
  
  // Orientation - portrait or landscape (default)
  orientation?: 'portrait' | 'landscape';
}

export const PdfPage = forwardRef<HTMLDivElement, PdfPageProps>(
  function PdfPage(
    {
      logoUrl,
      companyName,
      toolName,
      subtitle,
      primaryColor,
      secondaryColor,
      badges,
      children,
      benefitBlurb,
      pageNumber,
      totalPages,
      minimalHeader = false,
      orientation = 'landscape',
    },
    ref
  ) {
    const isPortrait = orientation === 'portrait';
    const width = isPortrait ? PDF_PORTRAIT_WIDTH : PDF_WIDTH;
    const height = isPortrait ? PDF_PORTRAIT_HEIGHT : PDF_HEIGHT;
    
    return (
      <div
        ref={ref}
        className="fixed -left-[9999px] top-0 bg-white overflow-hidden"
        style={{
          width,
          height,
          padding: PDF_MARGIN,
        }}
        aria-hidden="true"
      >
        <div className="flex flex-col h-full gap-3">
          {/* Header - full or minimal */}
          {minimalHeader ? (
            <div 
              className="flex items-center justify-between rounded-lg px-4 py-2"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})`,
              }}
            >
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt={`${companyName} logo`}
                    className="h-8 w-auto object-contain"
                  />
                )}
                <span className="text-white font-medium text-sm">
                  {companyName} {toolName} {subtitle ? `- ${subtitle}` : ''}
                </span>
              </div>
              {pageNumber && totalPages && (
                <span className="text-white/70 text-sm">
                  Page {pageNumber} of {totalPages}
                </span>
              )}
            </div>
          ) : (
            <PdfHeader
              logoUrl={logoUrl}
              companyName={companyName}
              toolName={toolName}
              subtitle={subtitle}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              badges={badges}
            />
          )}

          {/* Benefit Blurb - explains value proposition */}
          {benefitBlurb && !minimalHeader && (
            <div 
              className="rounded-lg px-4 py-3 text-sm border-l-4"
              style={{ 
                backgroundColor: `${primaryColor}08`,
                borderLeftColor: primaryColor,
              }}
            >
              <p className="text-gray-700 leading-relaxed">
                {benefitBlurb}
              </p>
            </div>
          )}

          {/* Main content - flex-1 to fill remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>

          {/* Footer with wordmark and URL */}
          <PdfFooter />
        </div>
      </div>
    );
  }
);
