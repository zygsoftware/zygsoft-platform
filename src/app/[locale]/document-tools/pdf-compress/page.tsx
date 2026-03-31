import PdfCompressPage from "@/app/[locale]/dashboard/tools/pdf-compress/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicPdfCompressPage() {
    return (
        <PublicToolsShell compact>
            <PdfCompressPage />
        </PublicToolsShell>
    );
}
