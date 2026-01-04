import { User } from 'lucide-react';

interface HeroMockupProps {
  onMagicify: () => void;
  brandLogo?: string | null;
}

export function HeroMockup({ onMagicify, brandLogo }: HeroMockupProps) {
  return (
    <div className="relative h-full">
      {/* Browser mockup */}
      <div className="relative bg-white rounded-2xl shadow-xl shadow-purple-500/15 border border-gray-200/60 overflow-hidden h-full">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b border-gray-200/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Browser content */}
        <div className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/30 min-h-[200px]">
          {/* Your Brand header */}
          <div className="flex items-center gap-2 mb-4">
            {brandLogo ? (
              <img src={brandLogo} alt="" className="h-6 w-6 rounded object-contain" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-purple-500" />
              </div>
            )}
            <span className="text-sm font-semibold text-purple-600">Your Brand</span>
          </div>

          {/* Simplified tool preview - color grid */}
          <div className="space-y-3">
            {/* Navigation bar mockup */}
            <div className="flex gap-2 mb-3">
              <div className="h-2 bg-gray-200 rounded w-12" />
              <div className="h-2 bg-gray-200 rounded w-16" />
              <div className="h-2 bg-gray-200 rounded w-10" />
            </div>

            {/* Color grid preview */}
            <div className="grid grid-cols-5 gap-1.5">
              {/* Header row */}
              <div className="col-span-1 h-6 bg-gray-100 rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={`header-${i}`} className="h-6 bg-gray-100 rounded" />
              ))}

              {/* Data rows with colorful cells */}
              {[...Array(3)].map((_, rowIdx) => (
                <>
                  <div key={`label-${rowIdx}`} className="h-8 bg-gray-50 rounded border border-gray-100" />
                  {[...Array(4)].map((_, colIdx) => {
                    const colors = [
                      'bg-gradient-to-br from-cyan-400 to-cyan-300',
                      'bg-gradient-to-br from-purple-400 to-purple-300',
                      'bg-gradient-to-br from-pink-400 to-pink-300',
                      'bg-gradient-to-br from-amber-400 to-yellow-300',
                    ];
                    return (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className={`h-8 rounded ${colors[(rowIdx + colIdx) % 4]} opacity-80`}
                      />
                    );
                  })}
                </>
              ))}
            </div>

            {/* Right sidebar preview */}
            <div className="flex justify-end">
              <div className="w-24 space-y-1.5">
                <div className="text-[8px] text-purple-500 font-medium">Your Brand</div>
                <div className="h-1.5 bg-purple-200 rounded w-full" />
                <div className="h-1.5 bg-purple-100 rounded w-4/5" />
                <div className="h-1.5 bg-purple-100 rounded w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
