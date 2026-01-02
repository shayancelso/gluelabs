// Color utility functions for ensuring readability and contrast

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle HSL format (e.g., "hsl(270, 60%, 50%)")
  if (hex.startsWith('hsl')) {
    const hslMatch = hex.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360;
      const s = parseInt(hslMatch[2]) / 100;
      const l = parseInt(hslMatch[3]) / 100;
      return hslToRgb(h, s, l);
    }
  }

  // Handle hex format
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const sRGB = v / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if a color is light (luminance > threshold)
 */
export function isLightColor(hex: string, threshold = 0.5): boolean {
  return getLuminance(hex) > threshold;
}

/**
 * Get the darkest color from an array of colors
 */
export function getDarkestColor(colors: string[]): string {
  if (colors.length === 0) return '#000000';

  let darkest = colors[0];
  let minLuminance = getLuminance(colors[0]);

  for (const color of colors) {
    const luminance = getLuminance(color);
    if (luminance < minLuminance) {
      minLuminance = luminance;
      darkest = color;
    }
  }

  return darkest;
}

/**
 * Get the lightest color from an array of colors
 */
export function getLightestColor(colors: string[]): string {
  if (colors.length === 0) return '#ffffff';

  let lightest = colors[0];
  let maxLuminance = getLuminance(colors[0]);

  for (const color of colors) {
    const luminance = getLuminance(color);
    if (luminance > maxLuminance) {
      maxLuminance = luminance;
      lightest = color;
    }
  }

  return lightest;
}

/**
 * Get a contrasting text color (black or white) for a given background
 */
export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor, 0.5) ? '#000000' : '#ffffff';
}

/**
 * Get smart text color - returns white or the darkest brand color for light backgrounds
 */
export function getSmartTextColor(
  backgroundColor: string,
  brandColors: string[]
): string {
  if (!isLightColor(backgroundColor, 0.6)) {
    return '#ffffff';
  }

  const darkest = getDarkestColor(brandColors);
  // If darkest brand color is still too light, use black
  if (isLightColor(darkest, 0.4)) {
    return '#1a1a1a';
  }

  return darkest;
}

/**
 * Calculate a score color (green to red gradient based on score 0-100)
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'; // green-500
  if (score >= 50) return '#eab308'; // yellow-500
  if (score >= 30) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

/**
 * Get score badge styling
 */
export function getScoreBadge(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 70) {
    return { label: 'HIGH PROBABILITY', color: '#166534', bgColor: '#dcfce7' };
  }
  if (score >= 50) {
    return { label: 'MEDIUM PROBABILITY', color: '#854d0e', bgColor: '#fef9c3' };
  }
  if (score >= 30) {
    return { label: 'LOW PROBABILITY', color: '#9a3412', bgColor: '#ffedd5' };
  }
  return { label: 'VERY LOW', color: '#991b1b', bgColor: '#fee2e2' };
}
