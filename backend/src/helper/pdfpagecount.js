import fs from "fs";
import { PDFDocument } from "pdf-lib";

export const getPdfPageCount = async (filePath) => {
  const existingPdfBytes = await fs.promises.readFile(filePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc.getPageCount(); // Instant for metadata only
};
