import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// A4 landscape at 96 DPI = 1123 x 794px
export const PDF_WIDTH = 1123;
export const PDF_HEIGHT = 794;

// A4 portrait at 96 DPI = 794 x 1123px
export const PDF_PORTRAIT_WIDTH = 794;
export const PDF_PORTRAIT_HEIGHT = 1123;

export const PDF_MARGIN = 40;
export const PDF_CONTENT_WIDTH = PDF_WIDTH - (PDF_MARGIN * 2);
export const PDF_CONTENT_HEIGHT = PDF_HEIGHT - (PDF_MARGIN * 2);
export const PDF_PORTRAIT_CONTENT_WIDTH = PDF_PORTRAIT_WIDTH - (PDF_MARGIN * 2);
export const PDF_PORTRAIT_CONTENT_HEIGHT = PDF_PORTRAIT_HEIGHT - (PDF_MARGIN * 2);

export interface PdfExportConfig {
  toolName: string;
  accountName: string;
  element: HTMLElement;
}

export interface MultiPagePdfExportConfig {
  toolName: string;
  accountName: string;
  pages: HTMLElement[];
}

/**
 * Generate a clean filename from tool name and account name
 */
export function generatePdfFilename(toolName: string, accountName: string): string {
  const cleanToolName = toolName.trim() || 'Analysis';
  const cleanAccountName = accountName.trim() || 'Report';
  return `${cleanToolName} - ${cleanAccountName}.pdf`;
}

/**
 * Export an HTML element to a single-page PDF
 * The element should be sized to PDF_WIDTH x PDF_HEIGHT
 */
export async function exportToPdf(config: PdfExportConfig): Promise<void> {
  const { toolName, accountName, element } = config;

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 2x for crisp output
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: PDF_WIDTH,
    height: PDF_HEIGHT,
  });

  // Create PDF with A4 landscape dimensions
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [PDF_WIDTH, PDF_HEIGHT],
    hotfixes: ['px_scaling'],
  });

  // Add the canvas as an image
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, PDF_WIDTH, PDF_HEIGHT);

  // Generate filename and save
  const filename = generatePdfFilename(toolName, accountName);
  pdf.save(filename);
}

/**
 * Export an HTML element to a single-page portrait PDF
 */
export async function exportToPortraitPdf(config: PdfExportConfig): Promise<void> {
  const { toolName, accountName, element } = config;

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 2x for crisp output
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: PDF_PORTRAIT_WIDTH,
    height: PDF_PORTRAIT_HEIGHT,
  });

  // Create PDF with A4 portrait dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [PDF_PORTRAIT_WIDTH, PDF_PORTRAIT_HEIGHT],
    hotfixes: ['px_scaling'],
  });

  // Add the canvas as an image
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, PDF_PORTRAIT_WIDTH, PDF_PORTRAIT_HEIGHT);

  // Generate filename and save
  const filename = generatePdfFilename(toolName, accountName);
  pdf.save(filename);
}

/**
 * Export multiple HTML elements as pages in a single PDF
 * Each element should be sized to PDF_WIDTH x PDF_HEIGHT
 */
export async function exportToMultiPagePdf(config: MultiPagePdfExportConfig): Promise<void> {
  const { toolName, accountName, pages } = config;

  if (pages.length === 0) {
    throw new Error('No pages provided for PDF export');
  }

  // Create PDF with A4 landscape dimensions
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [PDF_WIDTH, PDF_HEIGHT],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < pages.length; i++) {
    const element = pages[i];

    // Add new page for all pages after the first
    if (i > 0) {
      pdf.addPage([PDF_WIDTH, PDF_HEIGHT], 'landscape');
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for crisp output
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
    });

    // Add the canvas as an image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, PDF_WIDTH, PDF_HEIGHT);
  }

  // Generate filename and save
  const filename = generatePdfFilename(toolName, accountName);
  pdf.save(filename);
}

/**
 * Export multiple HTML elements as pages in a single portrait PDF
 * Each element should be sized to PDF_PORTRAIT_WIDTH x PDF_PORTRAIT_HEIGHT
 */
export async function exportToMultiPagePortraitPdf(config: MultiPagePdfExportConfig): Promise<void> {
  const { toolName, accountName, pages } = config;

  if (pages.length === 0) {
    throw new Error('No pages provided for PDF export');
  }

  // Create PDF with A4 portrait dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [PDF_PORTRAIT_WIDTH, PDF_PORTRAIT_HEIGHT],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < pages.length; i++) {
    const element = pages[i];

    // Add new page for all pages after the first
    if (i > 0) {
      pdf.addPage([PDF_PORTRAIT_WIDTH, PDF_PORTRAIT_HEIGHT], 'portrait');
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for crisp output
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: PDF_PORTRAIT_WIDTH,
      height: PDF_PORTRAIT_HEIGHT,
    });

    // Add the canvas as an image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, PDF_PORTRAIT_WIDTH, PDF_PORTRAIT_HEIGHT);
  }

  // Generate filename and save
  const filename = generatePdfFilename(toolName, accountName);
  pdf.save(filename);
}

/**
 * Format large numbers for display
 */
export function formatPdfNumber(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Format percentage for display
 */
export function formatPdfPercent(value: number): string {
  return `${Math.round(value)}%`;
}
