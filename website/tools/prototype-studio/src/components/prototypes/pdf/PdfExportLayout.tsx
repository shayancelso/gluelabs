import { forwardRef, ReactNode } from 'react';
import { PDF_WIDTH, PDF_HEIGHT, PDF_MARGIN } from '@/lib/exportPdf';
import { PdfHeader } from './PdfHeader';
import { PdfDisclaimer } from './PdfDisclaimer';
import { PdfMetrics } from './PdfMetrics';
import { PdfFooter } from './PdfFooter';
import { PdfSummary } from './PdfSummary';

interface MetricCard {
  label: string;
  value: string;
  color?: string;
}

interface PdfExportLayoutProps {
  // Header props
  logoUrl?: string;
  companyName: string;
  toolName: string;
  subtitle?: string;
  primaryColor: string;
  secondaryColor?: string;
  badges?: Array<{ label: string; value: string }>;
  
  // Content
  metrics: MetricCard[];
  visualization: ReactNode;
  summary: string;
}

export const PdfExportLayout = forwardRef<HTMLDivElement, PdfExportLayoutProps>(
  function PdfExportLayout(
    {
      logoUrl,
      companyName,
      toolName,
      subtitle,
      primaryColor,
      secondaryColor,
      badges,
      metrics,
      visualization,
      summary,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="fixed -left-[9999px] top-0 bg-white overflow-hidden"
        style={{
          width: PDF_WIDTH,
          height: PDF_HEIGHT,
          padding: PDF_MARGIN,
        }}
        aria-hidden="true"
      >
        <div className="flex flex-col h-full gap-3">
          {/* Header */}
          <PdfHeader
            logoUrl={logoUrl}
            companyName={companyName}
            toolName={toolName}
            subtitle={subtitle}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            badges={badges}
          />

          {/* Disclaimer */}
          <PdfDisclaimer primaryColor={primaryColor} />

          {/* Key Metrics */}
          <PdfMetrics metrics={metrics} primaryColor={primaryColor} />

          {/* Main Visualization - flex-1 to fill remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-gray-100">
            {visualization}
          </div>

          {/* Executive Summary */}
          <PdfSummary summary={summary} />

          {/* Footer */}
          <PdfFooter />
        </div>
      </div>
    );
  }
);
