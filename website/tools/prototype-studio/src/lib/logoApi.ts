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

// Fetch logo using logo.dev API
// Supports both domain lookups (e.g., "shopify.com") and brand name searches (e.g., "Shopify")
export async function fetchLogoForDomain(input: string): Promise<string | null> {
  try {
    const trimmed = input.trim();
    let logoUrl: string;

    // Check if input looks like a domain (contains a dot)
    if (trimmed.includes('.')) {
      // Domain lookup
      const domain = extractDomain(trimmed);
      logoUrl = `https://img.logo.dev/${domain}?token=pk_EkJniMrxRz69M3yIqyxVuA`;
    } else {
      // Brand name lookup - URL encode the name
      const encodedName = encodeURIComponent(trimmed);
      logoUrl = `https://img.logo.dev/name/${encodedName}?token=pk_EkJniMrxRz69M3yIqyxVuA`;
    }

    // Test if the logo loads using an Image element (more reliable than fetch HEAD)
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(logoUrl);
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });
  } catch {
    return null;
  }
}
