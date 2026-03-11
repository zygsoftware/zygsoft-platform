import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(blob: Blob): Promise<number> {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        return pdfDoc.getPageCount();
    } catch {
        return 0;
    }
}
