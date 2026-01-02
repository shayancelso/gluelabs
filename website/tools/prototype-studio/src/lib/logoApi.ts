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
export async function fetchLogoForDomain(url: string): Promise<string | null> {
  try {
    const domain = extractDomain(url);
    // logo.dev provides free logos for domains
    const logoUrl = `https://img.logo.dev/${domain}?token=pk_EkJniMrxRz69M3yIqyxVuA`;

    // Test if the logo loads
    const response = await fetch(logoUrl, { method: 'HEAD' });
    if (response.ok) {
      return logoUrl;
    }
    return null;
  } catch {
    return null;
  }
}
