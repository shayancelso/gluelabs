import glooWordmark from '@/assets/gloo-wordmark.png';

export function PdfFooter() {
  return (
    <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
      <img 
        src={glooWordmark} 
        alt="Gloo" 
        className="h-10 w-auto object-contain opacity-80"
      />
      <span className="text-sm text-gray-400">buildwithgloo.com</span>
    </div>
  );
}
