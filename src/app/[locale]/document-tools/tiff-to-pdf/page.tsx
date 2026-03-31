import TiffToPdfPage from "@/app/[locale]/dashboard/tools/tiff-to-pdf/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicTiffToPdfPage() {
    return (
        <PublicToolsShell compact>
            <TiffToPdfPage />
        </PublicToolsShell>
    );
}
