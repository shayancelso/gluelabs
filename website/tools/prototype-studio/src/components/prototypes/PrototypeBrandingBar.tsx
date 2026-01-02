import { useState, useRef, useEffect } from 'react';
import { Upload, Globe, RotateCcw, Palette, Pipette, AlertTriangle, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { isLightColor } from '@/lib/colorUtils';
import { fetchLogoForDomain, getCompanyNameFromDomain, extractDomain } from '@/lib/logoApi';

export interface BrandConfig {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  companyName: string;
  // Extended fields for enhanced prototypes
  industry?: string;
  employeeCount?: string;
  headquarters?: string;
  companyDescription?: string;
}

interface PrototypeBrandingBarProps {
  brandConfig: BrandConfig;
  onBrandChange: (config: BrandConfig) => void;
  onReset: () => void;
}

// HSV to RGB conversion
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// RGB to HSV conversion
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  
  return [h, s, v];
}

// Hex to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shortResult) {
      return [
        parseInt(shortResult[1] + shortResult[1], 16),
        parseInt(shortResult[2] + shortResult[2], 16),
        parseInt(shortResult[3] + shortResult[3], 16)
      ];
    }
    return null;
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

// RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

// Color picker component with full picker
function ColorSwatch({ 
  color, 
  label, 
  onChange 
}: { 
  color: string; 
  label: string; 
  onChange: (color: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [isDraggingPicker, setIsDraggingPicker] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  
  const isLight = isLightColor(color, 0.85);
  const isBlackOrWhite = isLight || color === '#000000' || color === '#000' || 
    color.toLowerCase() === 'black' || color.toLowerCase() === 'white' ||
    color === '#ffffff' || color === '#fff';

  // Initialize HSV from color
  useEffect(() => {
    setInputValue(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
      setHue(h);
      setSaturation(s);
      setBrightness(v);
    }
  }, [color]);

  const updateColorFromHsv = (h: number, s: number, v: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    setInputValue(hex);
    onChange(hex);
  };

  const handlePickerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingPicker(true);
    handlePickerMove(e);
  };

  const handlePickerMove = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!pickerRef.current) return;
    const rect = pickerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setSaturation(x);
    setBrightness(1 - y);
    updateColorFromHsv(hue, x, 1 - y);
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingHue(true);
    handleHueMove(e);
  };

  const handleHueMove = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 360;
    setHue(newHue);
    updateColorFromHsv(newHue, saturation, brightness);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPicker) handlePickerMove(e);
      if (isDraggingHue) handleHueMove(e);
    };
    const handleMouseUp = () => {
      setIsDraggingPicker(false);
      setIsDraggingHue(false);
    };

    if (isDraggingPicker || isDraggingHue) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPicker, isDraggingHue, hue, saturation, brightness]);

  const handleColorChange = (newColor: string) => {
    setInputValue(newColor);
    if (newColor.match(/^#[0-9A-Fa-f]{6}$/) || newColor.match(/^#[0-9A-Fa-f]{3}$/)) {
      onChange(newColor);
      const rgb = hexToRgb(newColor);
      if (rgb) {
        const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setHue(h);
        setSaturation(s);
        setBrightness(v);
      }
    }
  };

  const [pureHueR, pureHueG, pureHueB] = hsvToRgb(hue, 1, 1);
  const pureHueColor = rgbToHex(pureHueR, pureHueG, pureHueB);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className="relative w-7 h-7 rounded-full border-2 border-border hover:border-primary transition-all hover:scale-110 cursor-pointer group"
                style={{ backgroundColor: color }}
              >
                {isBlackOrWhite && (
                  <AlertTriangle className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500 bg-background rounded-full" />
                )}
                <Pipette className="h-3 w-3 absolute inset-0 m-auto opacity-0 group-hover:opacity-70 transition-opacity" 
                  style={{ color: isLight ? '#000' : '#fff' }}
                />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>{label}</p>
            {isBlackOrWhite && <p className="text-yellow-500">Consider changing</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-64 p-3" align="center">
        <div className="space-y-3">
          <Label className="text-xs font-medium">{label}</Label>
          
          {/* 2D Saturation/Brightness Picker */}
          <div
            ref={pickerRef}
            className="relative w-full h-36 rounded-lg cursor-crosshair select-none"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureHueColor})`
            }}
            onMouseDown={handlePickerMouseDown}
          >
            {/* Picker indicator */}
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none"
              style={{
                left: `calc(${saturation * 100}% - 8px)`,
                top: `calc(${(1 - brightness) * 100}% - 8px)`,
                backgroundColor: inputValue,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          </div>

          {/* Hue Rainbow Slider */}
          <div
            ref={hueRef}
            className="relative w-full h-4 rounded-lg cursor-pointer select-none"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
            }}
            onMouseDown={handleHueMouseDown}
          >
            {/* Hue indicator */}
            <div
              className="absolute w-3 h-6 border-2 border-white rounded-sm shadow-md pointer-events-none -top-1"
              style={{
                left: `calc(${(hue / 360) * 100}% - 6px)`,
                backgroundColor: pureHueColor,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          </div>

          {/* Color preview and hex input */}
          <div className="flex gap-2 items-center">
            <div 
              className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
              style={{ backgroundColor: inputValue }}
            />
            <Input
              value={inputValue}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#8B5CF6"
              className="flex-1 h-8 text-xs font-mono"
            />
          </div>

          {isBlackOrWhite && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Black/white colors may not show well
            </p>
          )}

          {/* Quick color presets */}
          <div className="grid grid-cols-8 gap-1">
            {['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6',
              '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'].map(preset => (
              <button
                key={preset}
                className="w-5 h-5 rounded border border-border/50 hover:scale-125 transition-transform"
                style={{ backgroundColor: preset }}
                onClick={() => {
                  handleColorChange(preset);
                }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Score a color for brand-worthiness (prefer saturated, mid-tone colors)
function scoreBrandColor(r: number, g: number, b: number): number {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const saturation = max === 0 ? 0 : (max - min) / max;
  
  // Penalize very dark or very light colors
  let luminanceScore = 1;
  if (luminance < 0.15) luminanceScore = 0.3;
  else if (luminance > 0.85) luminanceScore = 0.4;
  else if (luminance >= 0.25 && luminance <= 0.75) luminanceScore = 1.3; // Prefer mid-tones
  
  // Prefer medium-high saturation (typical for brand colors)
  let saturationScore = 1;
  if (saturation < 0.15) saturationScore = 0.2; // Gray-ish
  else if (saturation >= 0.25 && saturation <= 0.85) saturationScore = 1.5; // Sweet spot
  else if (saturation > 0.85) saturationScore = 1.2; // Very saturated is good too
  
  return saturationScore * luminanceScore;
}

// Color distance using weighted Euclidean distance
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    2 * Math.pow(r1 - r2, 2) + 
    4 * Math.pow(g1 - g2, 2) + 
    3 * Math.pow(b1 - b2, 2)
  );
}

// Extract colors from an image using canvas
async function extractColorsFromImage(imageUrl: string): Promise<{ primary: string; secondary: string; accent: string } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Sample at a reasonable size
      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      try {
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;

        // Collect all colors with their frequency and brand score
        const colorCounts: Map<string, { count: number; r: number; g: number; b: number; score: number }> = new Map();

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip near-black and near-white pixels (widened threshold)
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          if (luminance < 15 || luminance > 245) continue;

          // Skip very desaturated colors (grays) with lowered threshold
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          if (saturation < 0.08) continue;

          // Quantize to reduce color variations
          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;
          const key = `${qr},${qg},${qb}`;

          const brandScore = scoreBrandColor(r, g, b);

          const existing = colorCounts.get(key);
          if (existing) {
            existing.count++;
            existing.score = Math.max(existing.score, brandScore);
          } else {
            colorCounts.set(key, { count: 1, r: qr, g: qg, b: qb, score: brandScore });
          }
        }

        // Sort by weighted score (frequency * brand score)
        const sortedColors = Array.from(colorCounts.values())
          .map(c => ({ ...c, weightedScore: c.count * c.score }))
          .sort((a, b) => b.weightedScore - a.weightedScore)
          .slice(0, 15);

        if (sortedColors.length === 0) {
          resolve(null);
          return;
        }

        // Function to convert RGB to hex
        const toHex = (r: number, g: number, b: number) => 
          '#' + [r, g, b].map(x => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0')).join('');

        // Pick distinct colors for primary, secondary, accent
        const primary = sortedColors[0];
        
        // Find secondary that's different enough from primary (increased threshold)
        let secondary = sortedColors[1] || primary;
        for (const color of sortedColors.slice(1)) {
          const diff = colorDistance(color.r, color.g, color.b, primary.r, primary.g, primary.b);
          if (diff > 80) {
            secondary = color;
            break;
          }
        }

        // Find accent that's different from both (increased threshold)
        let accent = sortedColors[2] || secondary;
        for (const color of sortedColors.slice(2)) {
          const diffP = colorDistance(color.r, color.g, color.b, primary.r, primary.g, primary.b);
          const diffS = colorDistance(color.r, color.g, color.b, secondary.r, secondary.g, secondary.b);
          if (diffP > 60 && diffS > 60) {
            accent = color;
            break;
          }
        }

        resolve({
          primary: toHex(primary.r, primary.g, primary.b),
          secondary: toHex(secondary.r, secondary.g, secondary.b),
          accent: toHex(accent.r, accent.g, accent.b),
        });
      } catch (e) {
        console.error('Error extracting colors:', e);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = imageUrl;
  });
}

export function PrototypeBrandingBar({ brandConfig, onBrandChange, onReset }: PrototypeBrandingBarProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [isLoadingLogoUrl, setIsLoadingLogoUrl] = useState(false);
  const [isEyeDropperActive, setIsEyeDropperActive] = useState(false);
  const [eyeDropperTarget, setEyeDropperTarget] = useState<'primary' | 'secondary' | 'accent' | null>(null);

  // Check if EyeDropper API is available
  const isEyeDropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  // Handle eyedropper color pick
  const handleEyeDropper = async (target: 'primary' | 'secondary' | 'accent') => {
    if (!isEyeDropperSupported) {
      toast({
        title: 'Not supported',
        description: 'The eyedropper tool is not supported in your browser. Try Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    setIsEyeDropperActive(true);
    setEyeDropperTarget(target);

    try {
      // @ts-ignore - EyeDropper API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      const colorField = target === 'primary' ? 'primaryColor' : 
                        target === 'secondary' ? 'secondaryColor' : 'accentColor';
      
      onBrandChange({ ...brandConfig, [colorField]: result.sRGBHex });
      
      toast({
        title: 'Color picked',
        description: `${target.charAt(0).toUpperCase() + target.slice(1)} color set to ${result.sRGBHex}`,
      });
    } catch (e) {
      // User cancelled or error
      console.log('EyeDropper cancelled or error:', e);
    } finally {
      setIsEyeDropperActive(false);
      setEyeDropperTarget(null);
    }
  };

  // Handle logo URL submission
  const handleLogoUrlSubmit = async () => {
    if (!logoUrlInput.trim()) return;
    
    setIsLoadingLogoUrl(true);
    
    // Format URL
    let url = logoUrlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // First, verify the image can be loaded by creating a test image
    const testImage = new Image();
    testImage.crossOrigin = 'anonymous';
    
    const imageLoaded = await new Promise<boolean>((resolve) => {
      testImage.onload = () => resolve(true);
      testImage.onerror = () => resolve(false);
      testImage.src = url;
    });

    if (!imageLoaded) {
      // Image failed to load with CORS, try without crossOrigin
      const testImageNoCors = new Image();
      const imageLoadedNoCors = await new Promise<boolean>((resolve) => {
        testImageNoCors.onload = () => resolve(true);
        testImageNoCors.onerror = () => resolve(false);
        testImageNoCors.src = url;
      });

      if (!imageLoadedNoCors) {
        setIsLoadingLogoUrl(false);
        toast({
          title: 'Failed to load logo',
          description: 'Could not load image from that URL. Check the URL is correct.',
          variant: 'destructive',
        });
        return;
      }

      // Image loads but CORS blocked - still use it, just can't extract colors
      onBrandChange({ ...brandConfig, logoUrl: url });
      setIsLoadingLogoUrl(false);
      toast({
        title: 'Logo loaded',
        description: 'Logo applied. Colors could not be extracted due to CORS restrictions.',
      });
      return;
    }

    // Image loaded successfully with CORS, try to extract colors
    try {
      const extractedColors = await extractColorsFromImage(url);
      
      if (extractedColors) {
        onBrandChange({ 
          ...brandConfig, 
          logoUrl: url,
          primaryColor: extractedColors.primary,
          secondaryColor: extractedColors.secondary,
          accentColor: extractedColors.accent,
        });
        
        toast({
          title: 'Logo loaded & colors extracted',
          description: 'Colors were automatically extracted from the logo.',
        });
      } else {
        onBrandChange({ ...brandConfig, logoUrl: url });
        
        toast({
          title: 'Logo loaded',
          description: 'Could not extract colors. Click the color circles to set them manually.',
        });
      }
    } catch (error) {
      // Still apply the logo even if color extraction fails
      onBrandChange({ ...brandConfig, logoUrl: url });
      toast({
        title: 'Logo loaded',
        description: 'Logo applied but color extraction failed.',
      });
    } finally {
      setIsLoadingLogoUrl(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a temporary URL for preview
    const url = URL.createObjectURL(file);
    
    // Try to extract colors from the logo
    const extractedColors = await extractColorsFromImage(url);
    
    if (extractedColors) {
      onBrandChange({ 
        ...brandConfig, 
        logoUrl: url,
        primaryColor: extractedColors.primary,
        secondaryColor: extractedColors.secondary,
        accentColor: extractedColors.accent,
      });
      
      toast({
        title: 'Logo uploaded & colors extracted',
        description: 'Colors were automatically extracted from your logo. Click the color circles to adjust.',
      });
    } else {
      onBrandChange({ ...brandConfig, logoUrl: url });
      
      toast({
        title: 'Logo uploaded',
        description: 'Could not extract colors (logo may be black/white). Click the color circles to set them manually.',
        variant: 'default',
      });
    }
  };

  const handleExtractBranding = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: 'Enter a website URL',
        description: 'Please enter a valid website URL to extract branding.',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      toast({
        title: 'Extracting branding...',
        description: 'Fetching logo and analyzing brand colors.',
      });

      // Format the URL
      let formattedUrl = websiteUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      const domain = extractDomain(formattedUrl);
      const companyNameFromUrl = getCompanyNameFromDomain(formattedUrl);

      // First, try to fetch logo from logo.dev API
      const logoDevUrl = await fetchLogoForDomain(formattedUrl);
      
      let logoUrl = logoDevUrl;
      let extractedColors = null;

      // If logo.dev found a logo, use it and extract colors
      if (logoDevUrl) {
        try {
          extractedColors = await extractColorsFromImage(logoDevUrl);
        } catch (e) {
          console.error('Error extracting colors from logo.dev logo:', e);
        }
      }

      // Update brand config with extracted data
      onBrandChange({
        ...brandConfig,
        companyName: companyNameFromUrl,
        logoUrl: logoUrl || brandConfig.logoUrl,
        primaryColor: extractedColors?.primary || brandConfig.primaryColor,
        secondaryColor: extractedColors?.secondary || brandConfig.secondaryColor,
        accentColor: extractedColors?.accent || brandConfig.accentColor,
      });

      if (logoUrl && extractedColors) {
        toast({
          title: 'Branding extracted',
          description: 'Logo and brand colors have been applied automatically.',
        });
      } else if (logoUrl) {
        toast({
          title: 'Logo found',
          description: 'Logo applied. Click color circles to adjust brand colors.',
        });
      } else {
        toast({
          title: 'Company info extracted',
          description: 'Company name extracted. Upload a logo to auto-detect colors.',
        });
      }
    } catch (error) {
      // Fallback: at least extract company name from URL
      try {
        const companyName = getCompanyNameFromDomain(websiteUrl);
        
        onBrandChange({
          ...brandConfig,
          companyName: companyName || brandConfig.companyName,
        });
        
        toast({
          title: 'Partial extraction',
          description: 'Could not fetch full branding. Company name extracted from URL.',
        });
      } catch (urlError) {
        toast({
          title: 'Extraction failed',
          description: 'Could not extract branding from that URL.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    onBrandChange({ ...brandConfig, [field]: value });
  };

  return (
    <Card className="p-4 md:p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Palette className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        <h3 className="font-semibold text-sm md:text-base">Prospect Branding</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Logo Upload or URL */}
        <div className="space-y-2">
          <Label className="text-xs md:text-sm text-muted-foreground">Logo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <div className="flex gap-2">
            <Input
              placeholder="https://company.com/logo.png"
              value={logoUrlInput}
              onChange={(e) => setLogoUrlInput(e.target.value)}
              className="flex-1 h-9 md:h-10 text-sm"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleLogoUrlSubmit}
              disabled={!logoUrlInput.trim() || isLoadingLogoUrl}
              title="Load from URL"
              className="h-9 w-9 md:h-10 md:w-10"
            >
              <Globe className={`h-4 w-4 ${isLoadingLogoUrl ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file"
              className="h-9 w-9 md:h-10 md:w-10"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {brandConfig.logoUrl && (
            <div className="mt-2 p-2 bg-muted rounded-lg flex items-center justify-center">
              <img 
                src={brandConfig.logoUrl} 
                alt="Logo preview" 
                className="max-h-8 md:max-h-10 object-contain"
              />
            </div>
          )}
        </div>

        {/* Website URL Extraction */}
        <div className="space-y-2">
          <Label className="text-xs md:text-sm text-muted-foreground">Extract from Website</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://company.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1 h-9 md:h-10 text-sm"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleExtractBranding}
              disabled={isExtracting}
              className="h-9 w-9 md:h-10 md:w-10"
            >
              <Globe className={`h-4 w-4 ${isExtracting ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

      </div>

      {/* Brand Preview & Reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 md:mt-6 pt-4 border-t border-border/50 gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">Preview:</span>
          <div className="flex items-center gap-2">
            {brandConfig.logoUrl && (
              <img src={brandConfig.logoUrl} alt="Logo" className="h-5 md:h-6 object-contain" />
            )}
            <span className="font-medium text-sm md:text-base">{brandConfig.companyName}</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <ColorSwatch 
              color={brandConfig.primaryColor} 
              label="Primary Color"
              onChange={(color) => handleColorChange('primaryColor', color)}
            />
            <ColorSwatch 
              color={brandConfig.secondaryColor} 
              label="Secondary Color"
              onChange={(color) => handleColorChange('secondaryColor', color)}
            />
            <ColorSwatch 
              color={brandConfig.accentColor} 
              label="Accent Color"
              onChange={(color) => handleColorChange('accentColor', color)}
            />
          </div>
          
          {/* Eyedropper buttons - hidden on mobile */}
          {isEyeDropperSupported && (
            <div className="hidden md:flex gap-1 items-center ml-2 pl-2 border-l border-border/50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEyeDropper('primary')}
                      disabled={isEyeDropperActive}
                      className={`h-7 w-7 p-0 ${eyeDropperTarget === 'primary' ? 'ring-2 ring-primary' : ''}`}
                    >
                      <Crosshair className="h-4 w-4" style={{ color: brandConfig.primaryColor }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Pick Primary Color
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEyeDropper('secondary')}
                      disabled={isEyeDropperActive}
                      className={`h-7 w-7 p-0 ${eyeDropperTarget === 'secondary' ? 'ring-2 ring-primary' : ''}`}
                    >
                      <Crosshair className="h-4 w-4" style={{ color: brandConfig.secondaryColor }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Pick Secondary Color
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEyeDropper('accent')}
                      disabled={isEyeDropperActive}
                      className={`h-7 w-7 p-0 ${eyeDropperTarget === 'accent' ? 'ring-2 ring-primary' : ''}`}
                    >
                      <Crosshair className="h-4 w-4" style={{ color: brandConfig.accentColor }} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Pick Accent Color
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 md:gap-2 text-xs md:text-sm self-end md:self-auto">
          <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden md:inline">Reset to Gloo</span>
          <span className="md:hidden">Reset</span>
        </Button>
      </div>
    </Card>
  );
}
