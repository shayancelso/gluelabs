import { PdfPage } from './PdfPage';
import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { NPSAccount, NPSTrend } from '@/lib/npsPrototypeDemoData';
import { calculateOverallNPS, calculateCategoryPercentages, calculateAtRiskARR } from '@/lib/npsPrototypeDemoData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

interface NPSPdfPagesProps {
  accounts: NPSAccount[];
  trends: NPSTrend[];
  logoUrl?: string | null;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
}

// Page 1: Executive Summary (Portrait)
export const NPSPdfPage1 = forwardRef<HTMLDivElement, NPSPdfPagesProps>(
  function NPSPdfPage1({ accounts, trends, logoUrl, companyName, primaryColor, secondaryColor }, ref) {
    const overallNPS = calculateOverallNPS(accounts);
    const percentages = calculateCategoryPercentages(accounts);
    const atRiskARR = calculateAtRiskARR(accounts);
    const totalARR = accounts.reduce((sum, a) => sum + a.arr, 0);
    
    const pieData = [
      { name: 'Promoters', value: percentages.promoters, color: '#22c55e' },
      { name: 'Passives', value: percentages.passives, color: '#eab308' },
      { name: 'Detractors', value: percentages.detractors, color: '#ef4444' },
    ];

    return (
      <PdfPage
        ref={ref}
        logoUrl={logoUrl || undefined}
        companyName={companyName}
        toolName="NPS Account Hub"
        subtitle="Executive Summary"
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        benefitBlurb="Track customer sentiment, identify at-risk accounts, and drive proactive follow-up actions to improve retention."
        pageNumber={1}
        totalPages={3}
        orientation="portrait"
      >
        <div className="h-full flex flex-col gap-3">
          {/* KPI Cards - 2 rows of 3 for portrait */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              <div className="text-xl font-bold" style={{ color: overallNPS >= 50 ? '#22c55e' : overallNPS >= 0 ? '#eab308' : '#ef4444' }}>
                {overallNPS > 0 ? '+' : ''}{overallNPS}
              </div>
              <div className="text-[10px] text-gray-500">Overall NPS</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              <div className="text-xl font-bold text-gray-900">{accounts.length}</div>
              <div className="text-[10px] text-gray-500">Total Responses</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              <div className="text-xl font-bold text-green-600">{percentages.promoters}%</div>
              <div className="text-[10px] text-gray-500">Promoters</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              <div className="text-xl font-bold text-yellow-600">{percentages.passives}%</div>
              <div className="text-[10px] text-gray-500">Passives</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              <div className="text-xl font-bold text-red-600">{percentages.detractors}%</div>
              <div className="text-[10px] text-gray-500">Detractors</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              <div className="text-xl font-bold text-red-600">${(atRiskARR / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-gray-500">At-Risk ARR</div>
            </div>
          </div>

          {/* Distribution Pie */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold mb-1">NPS Distribution</h3>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Line */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold mb-1">NPS Trend (6 Months)</h3>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={[-100, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={primaryColor} 
                    strokeWidth={2}
                    dot={{ fill: primaryColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* At-Risk Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex-1">
            <h3 className="text-xs font-semibold mb-2">At-Risk Analysis</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-xs text-gray-600">At-Risk ARR</span>
                <span className="font-bold text-red-600 text-sm">${(atRiskARR / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-600">Total ARR</span>
                <span className="font-bold text-gray-900 text-sm">${(totalARR / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                <span className="text-xs text-gray-600">% At Risk</span>
                <span className="font-bold text-amber-600 text-sm">{((atRiskARR / totalARR) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-xs text-gray-600">Followups Needed</span>
                <span className="font-bold text-blue-600 text-sm">{accounts.filter(a => a.followupRequired && !a.followupCompleted).length}</span>
              </div>
            </div>
          </div>
        </div>
      </PdfPage>
    );
  }
);

// Page 2: Account Analysis (Portrait)
export const NPSPdfPage2 = forwardRef<HTMLDivElement, NPSPdfPagesProps>(
  function NPSPdfPage2({ accounts, logoUrl, companyName, primaryColor, secondaryColor }, ref) {
    const detractors = accounts.filter(a => a.category === 'detractor').sort((a, b) => b.arr - a.arr);
    const atRiskAccounts = accounts.filter(a => a.category !== 'promoter' && a.trend === 'down' && a.previousScore !== undefined);
    
    // Segment breakdown
    const segments = ['Enterprise', 'Mid-Market', 'SMB'] as const;
    const segmentData = segments.map(seg => {
      const segAccounts = accounts.filter(a => a.segment === seg);
      return {
        segment: seg,
        nps: calculateOverallNPS(segAccounts),
        count: segAccounts.length,
        arr: segAccounts.reduce((sum, a) => sum + a.arr, 0),
      };
    });

    return (
      <PdfPage
        ref={ref}
        logoUrl={logoUrl || undefined}
        companyName={companyName}
        toolName="NPS Account Hub"
        subtitle="Account Analysis"
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pageNumber={2}
        totalPages={3}
        minimalHeader
        orientation="portrait"
      >
        <div className="h-full flex flex-col gap-3">
          {/* Detractor Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              Detractor Accounts ({detractors.length})
            </h3>
            <div className="overflow-auto max-h-[200px]">
              <table className="w-full text-[10px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-1.5">Account</th>
                    <th className="text-center p-1.5">Score</th>
                    <th className="text-right p-1.5">ARR</th>
                    <th className="text-center p-1.5">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {detractors.slice(0, 10).map(account => (
                    <tr key={account.id} className="border-b border-gray-100">
                      <td className="p-1.5 font-medium">{account.name}</td>
                      <td className="p-1.5 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                          {account.score}
                        </span>
                      </td>
                      <td className="p-1.5 text-right">${(account.arr / 1000).toFixed(0)}K</td>
                      <td className="p-1.5 text-center">
                        {account.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 inline" />}
                        {account.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 inline" />}
                        {account.trend === 'flat' && <Minus className="h-3 w-3 text-gray-400 inline" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NPS by Segment */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold mb-2">NPS by Segment</h3>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentData} layout="vertical">
                  <XAxis type="number" domain={[-100, 100]} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="segment" tick={{ fontSize: 9 }} width={70} />
                  <Tooltip />
                  <Bar 
                    dataKey="nps" 
                    fill={primaryColor}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
              {segmentData.map(seg => (
                <div 
                  key={seg.segment} 
                  className="text-center p-1.5 rounded"
                  style={{ 
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor 
                  }}
                >
                  <div className="font-semibold">{seg.segment}</div>
                  <div style={{ color: '#666' }}>{seg.count} accounts</div>
                  <div style={{ color: '#666' }}>${(seg.arr / 1000).toFixed(0)}K ARR</div>
                </div>
              ))}
            </div>
          </div>

          {/* Declining Accounts */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex-1">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-amber-500" />
              Declining NPS Accounts ({atRiskAccounts.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {atRiskAccounts.slice(0, 6).map(account => (
                <div key={account.id} className="p-2 bg-amber-50 rounded border border-amber-100">
                  <div className="font-medium text-[10px] leading-tight break-words">{account.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      account.category === 'detractor' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {account.score}
                    </span>
                    <span className="text-[10px] text-gray-500">${(account.arr / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">
                    {account.previousScore && `↓ from ${account.previousScore}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PdfPage>
    );
  }
);

// Page 3: Detailed Data (Portrait)
export const NPSPdfPage3 = forwardRef<HTMLDivElement, NPSPdfPagesProps>(
  function NPSPdfPage3({ accounts, logoUrl, companyName, primaryColor, secondaryColor }, ref) {
    const sortedAccounts = [...accounts].sort((a, b) => b.arr - a.arr);

    return (
      <PdfPage
        ref={ref}
        logoUrl={logoUrl || undefined}
        companyName={companyName}
        toolName="NPS Account Hub"
        subtitle="Detailed Account Data"
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pageNumber={3}
        totalPages={3}
        minimalHeader
        orientation="portrait"
      >
        <div className="h-full">
          <div className="bg-white rounded-lg border border-gray-200 p-3 h-full overflow-hidden">
            <table className="w-full text-[10px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-1.5">Account</th>
                  <th className="text-center p-1.5">Score</th>
                  <th className="text-center p-1.5">Trend</th>
                  <th className="text-right p-1.5">ARR</th>
                  <th className="text-left p-1.5">Segment</th>
                  <th className="text-left p-1.5">Owner</th>
                  <th className="text-center p-1.5">Followup</th>
                </tr>
              </thead>
              <tbody>
                {sortedAccounts.slice(0, 20).map((account, idx) => (
                  <tr key={account.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="p-1.5 font-medium truncate max-w-[100px]">{account.name}</td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                        account.category === 'promoter' ? 'bg-green-100 text-green-700' :
                        account.category === 'passive' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {account.score}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      {account.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 inline" />}
                      {account.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 inline" />}
                      {account.trend === 'flat' && <Minus className="h-3 w-3 text-gray-400 inline" />}
                    </td>
                    <td className="p-1.5 text-right">${(account.arr / 1000).toFixed(0)}K</td>
                    <td className="p-1.5">
                      <span 
                        className="px-1.5 py-0.5 rounded text-[8px] font-medium whitespace-nowrap"
                        style={{ 
                          backgroundColor: primaryColor,
                          color: '#fff'
                        }}
                      >
                        {account.segment === 'Enterprise' ? 'Ent' : 
                         account.segment === 'Mid-Market' ? 'Mid' : 'SMB'}
                      </span>
                    </td>
                    <td className="p-1.5 text-gray-600 truncate max-w-[70px]">{account.owner}</td>
                    <td className="p-1.5 text-center">
                      {account.followupRequired ? (
                        account.followupCompleted ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">!</span>
                        )
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accounts.length > 20 && (
              <div className="text-center text-[10px] text-gray-400 mt-2">
                Showing 20 of {accounts.length} accounts (sorted by ARR)
              </div>
            )}
          </div>
        </div>
      </PdfPage>
    );
  }
);