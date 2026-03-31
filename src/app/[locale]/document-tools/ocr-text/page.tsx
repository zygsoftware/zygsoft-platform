import OcrTextPage from "@/app/[locale]/dashboard/tools/ocr-text/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicOcrTextPage() {
    return (
        <PublicToolsShell compact>
            <OcrTextPage />
        </PublicToolsShell>
    );
}
