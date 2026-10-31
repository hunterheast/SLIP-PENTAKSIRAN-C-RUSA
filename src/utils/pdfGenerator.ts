import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Download a single student slip element as a crisp A4 PDF document
 */
export async function downloadSlipPdf(element: HTMLElement, fileName: string): Promise<boolean> {
  try {
    if (!element || !element.isConnected) {
      console.error('Target element is not connected to DOM');
      return false;
    }

    // Hide screen-only buttons inside the element during capture
    const noPrintElements = element.querySelectorAll<HTMLElement>('.no-print');
    noPrintElements.forEach((el) => {
      el.style.display = 'none';
    });

    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for sharp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    // Restore hidden elements
    noPrintElements.forEach((el) => {
      el.style.display = '';
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Center vertically if it fits within A4 page height
    const yPos = imgHeight < pageHeight - margin * 2 ? margin + (pageHeight - margin * 2 - imgHeight) / 4 : margin;

    pdf.addImage(imgData, 'JPEG', margin, yPos, contentWidth, Math.min(imgHeight, pageHeight - margin * 2));
    pdf.save(`${fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

/**
 * Download multiple student slips into a single multi-page A4 PDF document using stable element IDs
 */
export async function downloadBulkSlipsPdf(
  elementIds: string[],
  fileName: string,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  try {
    if (elementIds.length === 0) return false;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    let pageCount = 0;

    for (let i = 0; i < elementIds.length; i++) {
      const id = elementIds[i];
      if (onProgress) onProgress(i + 1, elementIds.length);

      // Brief delay to allow React DOM updates to settle
      await new Promise((resolve) => setTimeout(resolve, 80));

      const el = document.getElementById(id);
      if (!el || !el.isConnected) {
        console.warn(`Element #${id} not found or disconnected from DOM, skipping`);
        continue;
      }

      const noPrintElements = el.querySelectorAll<HTMLElement>('.no-print');
      noPrintElements.forEach((e) => {
        e.style.display = 'none';
      });

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      noPrintElements.forEach((e) => {
        e.style.display = '';
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const yPos = imgHeight < pageHeight - margin * 2 ? margin + (pageHeight - margin * 2 - imgHeight) / 4 : margin;

      if (pageCount > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', margin, yPos, contentWidth, Math.min(imgHeight, pageHeight - margin * 2));
      pageCount++;
    }

    if (pageCount === 0) {
      console.error('No valid pages found to export');
      return false;
    }

    pdf.save(`${fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating bulk PDF:', error);
    return false;
  }
}
