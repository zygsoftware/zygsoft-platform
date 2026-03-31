import ImageToPdfPage from "@/app/[locale]/dashboard/tools/image-to-pdf/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicImageToPdfPage() {
    return (
        <PublicToolsShell compact>
            <ImageToPdfPage />
        </PublicToolsShell>
    );
}
