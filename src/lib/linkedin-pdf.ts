import { jsPDF } from "jspdf";

const BG = "#050508";
const FG = "#F0F0F8";
const ACCENT = "#00FF9D";
const MUTED = "#6B6B7A";

/**
 * Parses a LinkedIn carousel script (with [SLIDE N] labels) into slides.
 * Falls back to splitting on blank lines if no labels found.
 */
function parseSlides(text: string): { header: string; body: string }[] {
  // Strip signature for slide content (it'll go on final slide already)
  const re = /\[SLIDE\s*(\d+)\][^\n]*\n?/gi;
  const matches = [...text.matchAll(re)];
  if (matches.length === 0) {
    return text.split(/\n\s*\n/).filter(Boolean).map((body, i) => ({
      header: `SLIDE ${i + 1}`,
      body: body.trim(),
    }));
  }
  const slides: { header: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    slides.push({
      header: `SLIDE ${m[1]}`,
      body: text.slice(start, end).trim(),
    });
  }
  return slides;
}

export function generateLinkedInPdf(linkedinText: string, filename = "relay-linkedin.pdf") {
  const doc = new jsPDF({ unit: "pt", format: [1080, 1080] });
  const slides = parseSlides(linkedinText);
  const W = 1080;
  const H = 1080;
  const PAD = 80;

  slides.forEach((slide, idx) => {
    if (idx > 0) doc.addPage([W, H], "p");

    // Background
    doc.setFillColor(BG);
    doc.rect(0, 0, W, H, "F");

    // Accent rule top-left
    doc.setFillColor(ACCENT);
    doc.rect(PAD, PAD, 48, 4, "F");

    // Slide label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(ACCENT);
    doc.text(slide.header, PAD, PAD + 40);

    // Body text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(idx === 0 ? 56 : 36);
    doc.setTextColor(FG);
    const wrapped = doc.splitTextToSize(slide.body, W - PAD * 2);
    doc.text(wrapped, PAD, PAD + 140, { lineHeightFactor: 1.25 });

    // Page counter
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(MUTED);
    doc.text(`${idx + 1} / ${slides.length}`, PAD, H - PAD);

    // Watermark bottom-right
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text("relay.app", W - PAD, H - PAD, { align: "right" });
  });

  doc.save(filename);
}
