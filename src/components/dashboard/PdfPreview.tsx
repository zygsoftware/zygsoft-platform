"use client";

interface PdfPreviewProps {
    url: string;
    className?: string;
}

export function PdfPreview({ url, className = "" }: PdfPreviewProps) {
    return (
        <iframe
            src={url}
            title="PDF Preview"
            className={`w-full h-[400px] min-h-[300px] border-0 ${className}`}
        />
    );
}
