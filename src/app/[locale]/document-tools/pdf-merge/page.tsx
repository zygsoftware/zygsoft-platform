import PdfMergePage from "@/app/[locale]/dashboard/tools/pdf-merge/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicPdfMergePage() {
    return (
        <PublicToolsShell compact>
            <PdfMergePage />
        </PublicToolsShell>
    );
}
