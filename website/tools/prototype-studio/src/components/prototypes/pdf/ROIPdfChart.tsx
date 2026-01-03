import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface ChartDataPoint {
  month: number;
  investment: number;
  benefits: number;
  netValue: number;
}

interface Role {
  id: string;
  name: string;
  hourlyRate: number;
  headcount: number;
  hoursSavedPerWeek: number;
}

interface ROIPdfChartProps {
  chartData: ChartDataPoint[];
  breakevenMonth: number;
  primaryColor: string;
  secondaryColor: string;
  roles: Role[];
  scenarioMultiplier: number;
}

export function ROIPdfChart({
  chartData,
  breakevenMonth,
  primaryColor,
  secondaryColor,
  roles,
  scenarioMultiplier,
}: ROIPdfChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Calculate totals
  const totalHeadcount = roles.reduce((sum, r) => sum + r.headcount, 0);
  const totalHoursPerWeek = roles.reduce((sum, r) => sum + (r.hoursSavedPerWeek * r.headcount), 0);
  const totalAnnualValue = roles.reduce((sum, r) => {
    return sum + (r.hoursSavedPerWeek * 52 * r.headcount * r.hourlyRate * scenarioMultiplier);
  }, 0);

  // Fixed dimensions for portrait PDF - chart area is ~714px wide
  // Height is reduced to 280px to accommodate value drivers section
  const chartWidth = 714;
  const chartHeight = 280;

  return (
    <div className="h-full flex flex-col p-3">
      {/* Chart - takes most of the space */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Cumulative Value Over Time
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: primaryColor }} />
              <span className="text-gray-600">Benefits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: secondaryColor }} />
              <span className="text-gray-600">Investment</span>
            </div>
          </div>
        </div>
        
        {/* Fixed size chart for PDF rendering */}
        <div style={{ width: chartWidth, height: chartHeight }}>
          <AreaChart 
            width={chartWidth} 
            height={chartHeight} 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <defs>
              <linearGradient id="pdfBenefitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="pdfInvestmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value) => `M${value}`}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={formatCurrency}
              width={70}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <Area
              type="monotone"
              dataKey="benefits"
              stroke={primaryColor}
              strokeWidth={2.5}
              fill="url(#pdfBenefitsGradient)"
              name="Benefits"
            />
            <Area
              type="monotone"
              dataKey="investment"
              stroke={secondaryColor}
              strokeWidth={2.5}
              fill="url(#pdfInvestmentGradient)"
              name="Investment"
            />
            {breakevenMonth > 0 && (
              <ReferenceLine
                x={breakevenMonth}
                stroke="#22c55e"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Breakeven: Month ${breakevenMonth}`,
                  position: 'top',
                  fontSize: 12,
                  fill: '#22c55e',
                  fontWeight: 600,
                }}
              />
            )}
          </AreaChart>
        </div>
      </div>

      {/* Role breakdown table - compact */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Time Savings by Role
        </div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1 font-semibold text-gray-600">Role</th>
              <th className="text-right py-1 font-semibold text-gray-600">Team Size</th>
              <th className="text-right py-1 font-semibold text-gray-600">Hrs/Wk</th>
              <th className="text-right py-1 font-semibold text-gray-600">Rate</th>
              <th className="text-right py-1 font-semibold text-gray-600">Annual Value</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const annualValue = role.hoursSavedPerWeek * 52 * role.headcount * role.hourlyRate * scenarioMultiplier;
              return (
                <tr key={role.id} className="border-b border-gray-100">
                  <td className="py-1 text-gray-700">{role.name}</td>
                  <td className="text-right py-1 text-gray-600">{role.headcount}</td>
                  <td className="text-right py-1 text-gray-600">{role.hoursSavedPerWeek}</td>
                  <td className="text-right py-1 text-gray-600">${role.hourlyRate}</td>
                  <td className="text-right py-1 font-semibold" style={{ color: primaryColor }}>
                    {formatCurrency(annualValue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td className="py-1 font-bold text-gray-700">Total</td>
              <td className="text-right py-1 font-bold text-gray-700">{totalHeadcount}</td>
              <td className="text-right py-1 font-bold text-gray-700">{totalHoursPerWeek}</td>
              <td className="text-right py-1 text-gray-400">—</td>
              <td className="text-right py-1 font-bold" style={{ color: primaryColor }}>
                {formatCurrency(totalAnnualValue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
