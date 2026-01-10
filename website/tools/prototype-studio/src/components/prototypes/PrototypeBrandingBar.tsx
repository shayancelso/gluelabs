import { useState, useRef, useEffect } from 'react';
import { Upload, RotateCcw, Palette, Pipette, AlertTriangle, Crosshair, Loader2, Search, Check, Sparkles, User } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

export interface BrandConfig {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  companyName: string;
  industry?: string;
  employeeCount?: string;
  headquarters?: string;
  companyDescription?: string;
}

interface PrototypeBrandingBarProps {
  brandConfig: BrandConfig;
  onBrandChange: (config: BrandConfig) => void;
  onReset: () => void;
  compact?: boolean;
  heroCard?: boolean;
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

// Color picker component with eyedropper inside popup (matching Template Studio)
function ColorSwatch({ 
  color, 
  label, 
  onChange 
}: { 
  color: string; 
  label: string; 
  onChange: (color: string) => void;
}) {
  const { toast } = useToast();
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

  const handleEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Eyedropper is only available in Chrome/Edge browsers.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // @ts-ignore - EyeDropper API types may not be available
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const pickedColor = result.sRGBHex;
      
      handleColorChange(pickedColor);
      toast({
        title: 'Color Picked',
        description: `Selected ${pickedColor}`,
      });
    } catch (e) {
      console.log('Eyedropper cancelled or error:', e);
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
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">{label}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEyedropper}
              className="h-7 px-2 gap-1.5 text-xs"
              title="Pick color from screen"
            >
              <Crosshair className="h-3.5 w-3.5" />
              Pick
            </Button>
          </div>
          
          {/* 2D Saturation/Brightness Picker */}
          <div
            ref={pickerRef}
            className="relative w-full h-36 rounded-lg cursor-crosshair select-none"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureHueColor})`
            }}
            onMouseDown={handlePickerMouseDown}
          >
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
                onClick={() => handleColorChange(preset)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Score a color for brand-worthiness
function scoreBrandColor(r: number, g: number, b: number): number {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const saturation = max === 0 ? 0 : (max - min) / max;
  
  let luminanceScore = 1;
  if (luminance < 0.15) luminanceScore = 0.3;
  else if (luminance > 0.85) luminanceScore = 0.4;
  else if (luminance >= 0.25 && luminance <= 0.75) luminanceScore = 1.3;
  
  let saturationScore = 1;
  if (saturation < 0.15) saturationScore = 0.2;
  else if (saturation >= 0.25 && saturation <= 0.85) saturationScore = 1.5;
  else if (saturation > 0.85) saturationScore = 1.2;
  
  return saturationScore * luminanceScore;
}

// Color distance
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    2 * Math.pow(r1 - r2, 2) +
    4 * Math.pow(g1 - g2, 2) +
    3 * Math.pow(b1 - b2, 2)
  );
}

// Generate a sophisticated neutral palette for monochrome logos
function generateMonochromePalette(dominantLuminance: number): {
  primary: string;
  secondary: string;
  accent: string;
} {
  const isLightDominant = dominantLuminance > 128;

  if (isLightDominant) {
    // White/light dominant - use high contrast range
    return {
      primary: '#0f172a',      // Very dark slate
      secondary: '#475569',    // Medium slate
      accent: '#94a3b8',       // Light slate for charts
    };
  } else {
    // Black/dark dominant - use distinct grays with more spread
    return {
      primary: '#0a0a0a',      // Near black
      secondary: '#3f3f46',    // Medium zinc
      accent: '#a1a1aa',       // Light zinc for visibility
    };
  }
}

// Generate harmony colors from a single chromatic color
function generateHarmonyColors(baseHex: string): {
  primary: string;
  secondary: string;
  accent: string
} {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return { primary: baseHex, secondary: baseHex, accent: baseHex };

  const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);

  const secondaryV = Math.max(0.15, v - 0.25);
  const secondaryS = Math.min(1, s + 0.1);
  const [sr, sg, sb] = hsvToRgb(h, secondaryS, secondaryV);

  const accentV = Math.min(1, v + 0.15);
  const accentS = Math.max(0.2, s - 0.2);
  const [ar, ag, ab] = hsvToRgb(h, accentS, accentV);

  return {
    primary: baseHex,
    secondary: rgbToHex(sr, sg, sb),
    accent: rgbToHex(ar, ag, ab),
  };
}

// Extract colors from an image
async function extractColorsFromImage(imageUrl: string): Promise<{
  primary: string;
  secondary: string;
  accent: string;
  isMonochrome?: boolean;
} | null> {
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

      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      try {
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;

        const colorCounts: Map<string, { count: number; r: number; g: number; b: number; score: number }> = new Map();

        let achromaticCount = 0;
        let achromaticLuminanceSum = 0;
        let totalPixelsProcessed = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a < 128) continue;
          totalPixelsProcessed++;

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;

          if (saturation < 0.08 || luminance < 15 || luminance > 245) {
            achromaticCount++;
            achromaticLuminanceSum += luminance;
            continue;
          }

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

        const sortedColors = Array.from(colorCounts.values())
          .map(c => ({ ...c, weightedScore: c.count * c.score }))
          .sort((a, b) => b.weightedScore - a.weightedScore)
          .slice(0, 15);

        const achromaticRatio = totalPixelsProcessed > 0
          ? achromaticCount / totalPixelsProcessed
          : 0;

        // Handle monochrome logos (>85% achromatic pixels)
        if (sortedColors.length === 0 || achromaticRatio > 0.85) {
          const avgLuminance = achromaticCount > 0
            ? achromaticLuminanceSum / achromaticCount
            : 128;

          const palette = generateMonochromePalette(avgLuminance);
          resolve({
            ...palette,
            isMonochrome: true,
          });
          return;
        }

        // Handle single-color logos
        if (sortedColors.length === 1) {
          const toHex = (r: number, g: number, b: number) =>
            '#' + [r, g, b].map(x => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0')).join('');
          const baseColor = toHex(sortedColors[0].r, sortedColors[0].g, sortedColors[0].b);
          const harmony = generateHarmonyColors(baseColor);
          resolve({
            ...harmony,
            isMonochrome: false,
          });
          return;
        }

        const toHex = (r: number, g: number, b: number) =>
          '#' + [r, g, b].map(x => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0')).join('');

        const primary = sortedColors[0];

        let secondary = sortedColors[1] || primary;
        for (const color of sortedColors.slice(1)) {
          const diff = colorDistance(color.r, color.g, color.b, primary.r, primary.g, primary.b);
          if (diff > 80) {
            secondary = color;
            break;
          }
        }

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
          isMonochrome: false,
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

export function PrototypeBrandingBar({ brandConfig, onBrandChange, onReset, compact = false, heroCard = false }: PrototypeBrandingBarProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companyInput, setCompanyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle company lookup
  const handleCompanyLookup = async () => {
    if (!companyInput.trim()) {
      toast({
        title: 'Enter a company',
        description: 'Please enter a company name or website URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format the input
      const inputTrimmed = companyInput.trim();
      let formattedUrl = inputTrimmed;
      let domain = '';
      let companyName = inputTrimmed;

      const looksLikeDomain = inputTrimmed.includes('.') || inputTrimmed.startsWith('http');

      if (looksLikeDomain) {
        domain = extractDomain(inputTrimmed);
        companyName = getCompanyNameFromDomain(domain);
      } else {
        const companySlug = inputTrimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
        formattedUrl = `https://${companySlug}.com`;
        domain = companySlug + '.com';
      }

      let logoUrl: string | null = null;
      let brandColors: { primary: string | null; secondary: string | null; accent: string | null } | null = null;
      let companyData: { company_name?: string; description?: string; industry?: string } | null = null;
      let brandSource: 'brandfetch' | 'extracted' | null = null;

      // Step 1: Try BrandFetch API first for official brand colors
      try {
        const { data: brandfetchData, error: brandfetchError } = await supabase.functions.invoke('brandfetch-lookup', {
          body: { domain: domain || formattedUrl }
        });

        if (!brandfetchError && brandfetchData && !brandfetchData.fallback) {
          console.log('Brandfetch returned data:', brandfetchData);

          if (brandfetchData.colors?.primary || brandfetchData.colors?.secondary) {
            brandColors = {
              primary: brandfetchData.colors.primary,
              secondary: brandfetchData.colors.secondary,
              accent: brandfetchData.colors.accent,
            };
            brandSource = 'brandfetch';
          }

          if (brandfetchData.logo_url) {
            logoUrl = brandfetchData.logo_url;
          }

          if (brandfetchData.company_name || brandfetchData.description) {
            companyData = {
              company_name: brandfetchData.company_name,
              description: brandfetchData.description,
            };
          }
        }
      } catch (e) {
        console.error('Brandfetch lookup error (will fallback):', e);
      }

      // Step 2: Fallback to logo.dev if no logo from BrandFetch
      if (!logoUrl) {
        const logoDevUrl = await fetchLogoForDomain(domain || formattedUrl);
        if (logoDevUrl) {
          logoUrl = logoDevUrl;
        }
      }

      // Step 3: If no BrandFetch colors, extract from logo pixels
      if (!brandColors && logoUrl) {
        try {
          const extractedColors = await extractColorsFromImage(logoUrl);
          if (extractedColors) {
            brandColors = {
              primary: extractedColors.primary,
              secondary: extractedColors.secondary,
              accent: extractedColors.accent,
            };
            brandSource = 'extracted';

            if (extractedColors.isMonochrome) {
              toast({
                title: 'Monochrome logo detected',
                description: 'A professional neutral palette has been generated.',
              });
            }
          }
        } catch (e) {
          console.error('Error extracting colors from logo:', e);
        }
      }

      // Step 4: Also try company-research for additional metadata (if not from BrandFetch)
      if (!companyData) {
        try {
          const { data, error } = await supabase.functions.invoke('company-research', {
            body: { companyName: companyName, website: formattedUrl }
          });

          if (!error && data) {
            companyData = {
              company_name: data.company_name,
              description: data.description,
              industry: data.industry,
            };
            // Use research logo if still no logo
            if (!logoUrl && data.logo_url) {
              logoUrl = data.logo_url;
            }
          }
        } catch (e) {
          console.error('Company research error (non-fatal):', e);
        }
      }

      // Update brand config
      onBrandChange({
        ...brandConfig,
        companyName: companyData?.company_name || companyName,
        logoUrl: logoUrl || brandConfig.logoUrl,
        industry: companyData?.industry || brandConfig.industry,
        companyDescription: companyData?.description || brandConfig.companyDescription,
        primaryColor: brandColors?.primary || brandConfig.primaryColor,
        secondaryColor: brandColors?.secondary || brandConfig.secondaryColor,
        accentColor: brandColors?.accent || brandConfig.accentColor,
      });

      // Show appropriate toast based on source
      if (brandColors && brandSource === 'brandfetch') {
        toast({
          title: 'Official branding loaded!',
          description: `Brand colors from ${companyData?.company_name || companyName}.`,
        });
      } else if (logoUrl && brandColors && brandSource === 'extracted') {
        toast({
          title: 'Branding extracted',
          description: 'Colors extracted from logo. Adjust as needed.',
        });
      } else if (logoUrl) {
        toast({
          title: 'Logo found',
          description: 'Logo applied. Set colors manually.',
        });
      } else {
        toast({
          title: 'Company not found',
          description: 'Upload a logo to auto-detect brand colors.',
        });
      }
    } catch (error) {
      // Fallback
      onBrandChange({
        ...brandConfig,
        companyName: companyInput.trim(),
      });
      toast({
        title: 'Partial match',
        description: 'Company name extracted. Upload a logo for brand colors.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const extractedColors = await extractColorsFromImage(url);

    if (extractedColors) {
      onBrandChange({
        ...brandConfig,
        logoUrl: url,
        primaryColor: extractedColors.primary,
        secondaryColor: extractedColors.secondary,
        accentColor: extractedColors.accent,
      });

      if (extractedColors.isMonochrome) {
        toast({
          title: 'Monochrome logo detected',
          description: 'A professional neutral palette has been generated. Adjust colors as needed.',
        });
      } else {
        toast({
          title: 'Logo uploaded & colors extracted',
          description: 'Colors were automatically extracted from your logo.',
        });
      }
    } else {
      onBrandChange({ ...brandConfig, logoUrl: url });

      toast({
        title: 'Logo uploaded',
        description: 'Could not extract colors. Set them manually below.',
      });
    }
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' | 'textColor', value: string) => {
    onBrandChange({ ...brandConfig, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCompanyLookup();
    }
  };

  // Hero card mode - playful design with big Magicify button
  if (heroCard) {
    const hasLoadedBrand = brandConfig.companyName !== 'Gloo';

    return (
      <Card className="p-6 md:p-8 bg-white/95 backdrop-blur-sm border-border/40 shadow-2xl rounded-3xl h-full">
        {/* Header with icon or brand logo */}
        <div className="flex items-center gap-3 mb-6">
          {brandConfig.logoUrl ? (
            <img
              src={brandConfig.logoUrl}
              alt={brandConfig.companyName}
              className="h-10 w-10 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
          )}
          <span className="font-bold text-base md:text-lg text-gray-800 uppercase tracking-wide">Branding as Inputs</span>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="nike.com"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 text-base md:text-lg rounded-2xl border-gray-200 bg-gray-50/50 font-medium"
          />
        </div>

        {/* Color Swatches Row with check indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${hasLoadedBrand ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <Check className={`h-5 w-5 ${hasLoadedBrand ? 'text-green-600' : 'text-gray-300'}`} />
          </div>
          <div className="flex gap-2 items-center">
            <ColorSwatch
              color={brandConfig.primaryColor}
              label="Primary"
              onChange={(color) => handleColorChange('primaryColor', color)}
            />
            <ColorSwatch
              color={brandConfig.secondaryColor}
              label="Secondary"
              onChange={(color) => handleColorChange('secondaryColor', color)}
            />
            <ColorSwatch
              color={brandConfig.accentColor}
              label="Accent"
              onChange={(color) => handleColorChange('accentColor', color)}
            />
            <ColorSwatch
              color={brandConfig.backgroundColor}
              label="Background"
              onChange={(color) => handleColorChange('backgroundColor', color)}
            />
            <ColorSwatch
              color={brandConfig.textColor}
              label="Text"
              onChange={(color) => handleColorChange('textColor', color)}
            />
          </div>
        </div>

        {/* Big Magicify Button */}
        <Button
          onClick={handleCompanyLookup}
          disabled={!companyInput.trim() || isLoading}
          className="w-full h-14 md:h-16 rounded-2xl text-lg md:text-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #d8b4fe, #c084fc)',
          }}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Magicify My Brand
              <Sparkles className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </Card>
    );
  }

  // Compact mode for hero section
  if (compact) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Preview with your branding</span>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="e.g. nike.com or Acme Inc"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Company Name + Color Swatches Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <RotateCcw
              className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex-shrink-0"
              onClick={onReset}
            />
            <span className="font-medium text-sm truncate">{brandConfig.companyName}</span>
          </div>

          {/* Color Swatches */}
          <div className="flex gap-1.5 items-center ml-auto">
            <ColorSwatch
              color={brandConfig.primaryColor}
              label="Primary"
              onChange={(color) => handleColorChange('primaryColor', color)}
            />
            <ColorSwatch
              color={brandConfig.secondaryColor}
              label="Secondary"
              onChange={(color) => handleColorChange('secondaryColor', color)}
            />
            <ColorSwatch
              color={brandConfig.accentColor}
              label="Accent"
              onChange={(color) => handleColorChange('accentColor', color)}
            />
            <ColorSwatch
              color={brandConfig.backgroundColor}
              label="Background"
              onChange={(color) => handleColorChange('backgroundColor', color)}
            />
            <ColorSwatch
              color={brandConfig.textColor}
              label="Text"
              onChange={(color) => handleColorChange('textColor', color)}
            />
          </div>
        </div>
      </Card>
    );
  }

  // Full mode (original)
  return (
    <Card className="p-4 md:p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Palette className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        <h3 className="font-semibold text-sm md:text-base">Preview with your branding</h3>
      </div>

      {/* Single company input row */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Company Input */}
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Company name or website</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. nike.com or Acme Inc"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9 h-10 text-sm"
                />
              </div>
              <Button
                onClick={handleCompanyLookup}
                disabled={!companyInput.trim() || isLoading}
                className="h-10 px-4"
                style={{ 
                  background: `linear-gradient(135deg, ${brandConfig.primaryColor}, ${brandConfig.secondaryColor})` 
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load'
                )}
              </Button>
            </div>
          </div>

          {/* Logo Upload Button */}
          <div className="flex-shrink-0">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Or upload logo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </div>
        </div>

        {/* Brand Preview & Colors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-border/50 gap-3 md:gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Logo & Company Name Preview */}
            <div className="flex items-center gap-2 min-w-0">
              {brandConfig.logoUrl ? (
                <img src={brandConfig.logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded bg-muted p-0.5" />
              ) : (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium text-sm truncate max-w-[150px]">{brandConfig.companyName}</span>
            </div>

            {/* 5 Color Swatches */}
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
              <ColorSwatch 
                color={brandConfig.backgroundColor} 
                label="Background Color"
                onChange={(color) => handleColorChange('backgroundColor', color)}
              />
              <ColorSwatch 
                color={brandConfig.textColor} 
                label="Text Color"
                onChange={(color) => handleColorChange('textColor', color)}
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-xs self-end md:self-auto">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
