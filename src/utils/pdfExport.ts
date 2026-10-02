import { jsPDF } from 'jspdf';
import { DocumentItem } from '../types';

export function exportDocumentToPdf(doc: {
  title: string;
  sourceLang: string;
  targetLang: string;
  translatedContent: string;
  domain?: string;
  date?: string;
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Header banner
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 28, 'F');

  // Title in header
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('DOCUTRADUCTEUR AI - DOCUMENT CERTIFIÉ', margin, 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225); // slate-300
  pdf.text(`Traduction de haute précision IA · ${doc.sourceLang.toUpperCase()} → ${doc.targetLang.toUpperCase()} · ${doc.date || new Date().toLocaleDateString('fr-FR')}`, margin, 21);

  // Document Title
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  let yPosition = 42;
  const titleLines = pdf.splitTextToSize(doc.title || 'Document traduit', contentWidth);
  pdf.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 7 + 4;

  // Metadata separator line
  pdf.setDrawColor(226, 232, 240); // slate-200
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Body content
  pdf.setTextColor(30, 41, 59); // slate-800
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10.5);

  const paragraphs = doc.translatedContent.split('\n');
  const lineHeight = 5.5;

  for (const para of paragraphs) {
    if (!para.trim()) {
      yPosition += 4;
      continue;
    }

    const lines = pdf.splitTextToSize(para, contentWidth);
    
    // Check if we need a new page
    if (yPosition + lines.length * lineHeight > pageHeight - margin - 15) {
      pdf.addPage();
      yPosition = margin + 10;

      // Repeat small header
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`DocuTraducteur AI · ${doc.title} (suite)`, margin, margin);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10.5);
      pdf.setTextColor(30, 41, 59);
    }

    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * lineHeight + 2;
  }

  // Footer on current page
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('Document généré par DocuTraducteur AI — Modèle Gemini 3.8 certifié', margin, pageHeight - 10);

  const filename = `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_traduit.pdf`;
  pdf.save(filename);
}
