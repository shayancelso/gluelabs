interface MetricCard {
  label: string;
  value: string;
  color?: string;
}

interface PdfMetricsProps {
  metrics: MetricCard[];
  primaryColor: string;
}

export function PdfMetrics({ metrics, primaryColor }: PdfMetricsProps) {
  return (
    <div className="flex items-stretch gap-3">
      {metrics.map((metric, i) => (
        <div 
          key={i}
          className="flex-1 bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3 text-center"
        >
          <div 
            className="text-xl font-bold"
            style={{ color: metric.color || primaryColor }}
          >
            {metric.value}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}
