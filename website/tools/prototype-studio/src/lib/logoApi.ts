// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

// Get company name from domain
export function getCompanyNameFromDomain(url: string): string {
  const domain = extractDomain(url);
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Helper to test if a logo URL loads
function testLogoUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Fetch logo using logo.dev API
// Supports both domain lookups (e.g., "shopify.com") and brand name searches (e.g., "Shopify", "Air Canada")
export async function fetchLogoForDomain(input: string): Promise<string | null> {
  try {
    const trimmed = input.trim();

    // Check if input looks like a domain (contains a dot)
    if (trimmed.includes('.')) {
      const domain = extractDomain(trimmed);
      const logoUrl = `https://img.logo.dev/${domain}?token=pk_EkJniMrxRz69M3yIqyxVuA`;
      return testLogoUrl(logoUrl);
    }

    // Brand name lookup - try multiple variations for better matching
    // logo.dev works best with lowercase + spaces (URL-encoded as %20)
    const variations = [
      trimmed.toLowerCase(),                      // "air canada" → "air%20canada" (best match)
      trimmed,                                    // "Air Canada" → "Air%20Canada"
      trimmed.replace(/\s+/g, ''),                // "AirCanada"
      trimmed.toLowerCase().replace(/\s+/g, ''),  // "aircanada"
    ];

    for (const name of variations) {
      const encodedName = encodeURIComponent(name);
      const logoUrl = `https://img.logo.dev/name/${encodedName}?token=pk_EkJniMrxRz69M3yIqyxVuA`;
      const result = await testLogoUrl(logoUrl);
      if (result) return result;
    }

    return null;
  } catch {
    return null;
  }
}
