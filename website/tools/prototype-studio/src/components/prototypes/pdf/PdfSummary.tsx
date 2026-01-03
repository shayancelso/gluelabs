interface PdfSummaryProps {
  summary: string;
}

export function PdfSummary({ summary }: PdfSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
        Executive Summary
      </div>
      <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-normal">
        {summary}
      </p>
    </div>
  );
}
