import { Grid3X3, TrendingUp, Users, DollarSign, Sparkles } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px]">
      {/* Main browser window mockup */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] max-w-[600px]">
        {/* Browser chrome */}
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-white/50 backdrop-blur-sm bg-white/80">
          {/* Browser header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white/80 rounded-lg px-4 py-1.5 text-xs text-gray-400 border border-gray-200/50 max-w-[280px]">
                app.buildwithgloo.com/whitespace
              </div>
            </div>
          </div>

          {/* Browser content - Whitespace visualizer preview */}
          <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-white min-h-[300px]">
            {/* Tool header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Whitespace Visualizer</h3>
                <p className="text-xs text-gray-500">Account expansion opportunities</p>
              </div>
            </div>

            {/* Mini data grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Accounts', value: '847', color: 'from-indigo-500 to-indigo-600' },
                { label: 'Products', value: '12', color: 'from-purple-500 to-purple-600' },
                { label: 'Whitespace', value: '$2.4M', color: 'from-pink-500 to-pink-600' },
                { label: 'Adoption', value: '67%', color: 'from-violet-500 to-violet-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                  <div className={`text-xs font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mini matrix preview */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="grid grid-cols-5 gap-1">
                {/* Header row */}
                <div className="text-[8px] text-gray-400 font-medium p-1">Account</div>
                {['Pro', 'Team', 'API', 'Analytics'].map((p, i) => (
                  <div key={i} className="text-[8px] text-gray-400 font-medium p-1 text-center">{p}</div>
                ))}
                {/* Data rows */}
                {['Acme Corp', 'TechStart', 'GlobalFin'].map((account, rowIdx) => (
                  <>
                    <div key={`name-${rowIdx}`} className="text-[9px] text-gray-600 p-1 truncate">{account}</div>
                    {[0, 1, 2, 3].map((colIdx) => {
                      const isActive = Math.random() > 0.4;
                      const isOpportunity = !isActive && Math.random() > 0.5;
                      return (
                        <div
                          key={`cell-${rowIdx}-${colIdx}`}
                          className={`h-4 rounded ${
                            isActive
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                              : isOpportunity
                              ? 'bg-gradient-to-br from-amber-300 to-orange-400'
                              : 'bg-gray-100'
                          }`}
                        />
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating card - Top right */}
      <div
        className="absolute top-8 right-4 md:right-8 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl shadow-purple-500/10 border border-white/50 animate-float"
        style={{ animationDelay: '0s' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900">+$847K</div>
            <div className="text-[10px] text-gray-500">Expansion Found</div>
          </div>
        </div>
      </div>

      {/* Floating card - Bottom left */}
      <div
        className="absolute bottom-16 left-4 md:left-0 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl shadow-pink-500/10 border border-white/50 animate-float"
        style={{ animationDelay: '1s' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900">847 Accounts</div>
            <div className="text-[10px] text-gray-500">Analyzed</div>
          </div>
        </div>
      </div>

      {/* Floating card - Middle right */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl shadow-indigo-500/10 border border-white/50 animate-float hidden lg:block"
        style={{ animationDelay: '0.5s' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900">$2.4M ARR</div>
            <div className="text-[10px] text-gray-500">Whitespace</div>
          </div>
        </div>
      </div>

      {/* Sparkle decorations */}
      <div className="absolute top-4 left-1/4 text-purple-400/40 animate-pulse">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="absolute bottom-8 right-1/4 text-pink-400/40 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="absolute top-1/3 right-8 text-indigo-400/40 animate-pulse" style={{ animationDelay: '1s' }}>
        <Sparkles className="h-3 w-3" />
      </div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl" />
    </div>
  );
}
