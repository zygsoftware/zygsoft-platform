import PdfSplitPage from "@/app/[locale]/dashboard/tools/pdf-split/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicPdfSplitPage() {
    return (
        <PublicToolsShell compact>
            <PdfSplitPage />
        </PublicToolsShell>
    );
}
