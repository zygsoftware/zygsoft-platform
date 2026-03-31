import PdfToImagePage from "@/app/[locale]/dashboard/tools/pdf-to-image/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicPdfToImagePage() {
    return (
        <PublicToolsShell compact>
            <PdfToImagePage />
        </PublicToolsShell>
    );
}
