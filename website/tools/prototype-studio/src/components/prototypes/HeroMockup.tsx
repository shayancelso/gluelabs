import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import louMascot from '@/assets/lou-mascot.png';

interface HeroMockupProps {
  onMagicify: () => void;
}

export function HeroMockup({ onMagicify }: HeroMockupProps) {
  return (
    <div className="relative">
      {/* Lou mascot - positioned top right of mockup */}
      <img
        src={louMascot}
        alt="Lou"
        className="absolute -top-8 -right-4 md:-top-12 md:-right-6 h-24 w-24 md:h-32 md:w-32 object-contain z-10 drop-shadow-lg"
      />

      {/* Sparkle decorations */}
      <div className="absolute -top-4 left-1/4 text-yellow-400">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="absolute top-8 -right-8 text-purple-400">
        <Sparkles className="h-4 w-4" />
      </div>

      {/* Browser mockup */}
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-purple-500/20 border border-gray-200/50 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 border border-gray-200/80 max-w-[200px]">
              <span className="truncate">app.buildwithgloo.com</span>
            </div>
          </div>
        </div>

        {/* Browser content - Tool preview */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white min-h-[280px]">
          {/* Header bar inside mockup */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">gloo</span>
              <span className="text-xs text-gray-400">Your Brand</span>
            </div>
            <div className="flex gap-1">
              <div className="w-6 h-2 bg-gray-200 rounded" />
              <div className="w-6 h-2 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Mockup content - simplified whitespace preview */}
          <div className="flex gap-3">
            {/* Left sidebar */}
            <div className="w-1/4 space-y-2">
              <div className="h-3 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded w-full" />
              <div className="h-3 bg-gradient-to-r from-purple-400 to-purple-300 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>

            {/* Main content area */}
            <div className="flex-1">
              {/* Title */}
              <div className="text-[10px] text-gray-500 mb-2">StartConUnion</div>

              {/* Grid preview */}
              <div className="grid grid-cols-6 gap-1 mb-3">
                {/* Header row */}
                <div className="col-span-2 h-4 bg-gray-100 rounded text-[6px] text-gray-400 flex items-center px-1">Acct Top Aceg</div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded" />
                ))}

                {/* Data rows */}
                {[...Array(3)].map((_, rowIdx) => (
                  <>
                    <div key={`label-${rowIdx}`} className="col-span-2 h-6 bg-white rounded flex items-center">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-400 to-purple-400 mr-1" />
                      <span className="text-[6px] text-gray-500">Account</span>
                    </div>
                    {[...Array(4)].map((_, colIdx) => {
                      const colors = [
                        'from-green-400 to-emerald-400',
                        'from-purple-400 to-indigo-400',
                        'from-pink-400 to-rose-400',
                        'from-amber-300 to-yellow-300',
                      ];
                      return (
                        <div
                          key={`cell-${rowIdx}-${colIdx}`}
                          className={`h-6 rounded bg-gradient-to-br ${colors[(rowIdx + colIdx) % 4]} opacity-80`}
                        />
                      );
                    })}
                  </>
                ))}
              </div>

              {/* Stats cards */}
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-lg p-2 border border-gray-100">
                  <div className="text-[8px] text-gray-400">Active Accounts</div>
                  <div className="text-sm font-bold text-gray-700">847</div>
                </div>
                <div className="flex-1 bg-white rounded-lg p-2 border border-gray-100">
                  <div className="text-[8px] text-gray-400">Total Pipeline</div>
                  <div className="text-sm font-bold text-green-600">$2.4M</div>
                </div>
              </div>
            </div>

            {/* Right sidebar with text */}
            <div className="w-1/4 space-y-2 text-[7px] text-gray-400">
              <div className="font-medium text-gray-600 text-[8px]">Recommendation-specification</div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-100 rounded w-full" />
                <div className="h-2 bg-gray-100 rounded w-5/6" />
                <div className="h-2 bg-gray-100 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Magicify My Brand button */}
      <Button
        onClick={onMagicify}
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-5 py-2 rounded-full shadow-lg shadow-purple-500/30 text-sm font-medium"
      >
        <Sparkles className="h-4 w-4 mr-1.5" />
        Magicify My Brand
        <Sparkles className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  );
}
