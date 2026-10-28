// Shrinks a PDF in the browser: each page is drawn to a JPEG at a fixed width and the pages are rebuilt into a new PDF.
// Pages become pictures, so text in the output cannot be selected or searched.
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PDFDocument } from "pdf-lib";

const PAGE_WIDTH_PX = 1200;
const JPEG_QUALITY = 0.72;
const COVER_WIDTH_PX = 600;

let workerSet = false;

async function openPdf(file: File): Promise<PDFDocumentProxy> {
  if (!workerSet) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    workerSet = true;
  }
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data }).promise;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not make a picture of a page."))),
      "image/jpeg",
      quality,
    ),
  );
}

async function drawPage(doc: PDFDocumentProxy, pageNo: number, widthPx: number) {
  const page = await doc.getPage(pageNo);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: widthPx / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw the PDF.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  page.cleanup();
  return { canvas, width: base.width, height: base.height };
}

/** A small JPEG of page 1, used as the default cover. */
export async function renderCover(file: File): Promise<Blob> {
  const doc = await openPdf(file);
  try {
    const { canvas } = await drawPage(doc, 1, COVER_WIDTH_PX);
    const blob = await canvasToJpeg(canvas, 0.85);
    canvas.width = 0;
    canvas.height = 0;
    return blob;
  } finally {
    await doc.destroy();
  }
}

/** Rebuilds the PDF with every page as a compressed JPEG. */
export async function compressPdf(file: File, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const doc = await openPdf(file);
  try {
    const out = await PDFDocument.create();
    for (let i = 1; i <= doc.numPages; i++) {
      const { canvas, width, height } = await drawPage(doc, i, PAGE_WIDTH_PX);
      const jpg = new Uint8Array(await (await canvasToJpeg(canvas, JPEG_QUALITY)).arrayBuffer());
      canvas.width = 0;
      canvas.height = 0;
      const image = await out.embedJpg(jpg);
      const pdfPage = out.addPage([width, height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width, height });
      onProgress?.(i, doc.numPages);
    }
    const bytes = await out.save({ useObjectStreams: true });
    return new Blob([bytes as BlobPart], { type: "application/pdf" });
  } finally {
    await doc.destroy();
  }
}
