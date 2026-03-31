import PdfToWordPage from "@/app/[locale]/dashboard/tools/pdf-to-word/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicPdfToWordPage() {
    return (
        <PublicToolsShell compact>
            <PdfToWordPage />
        </PublicToolsShell>
    );
}
