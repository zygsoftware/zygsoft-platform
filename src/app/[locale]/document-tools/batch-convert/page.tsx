import BatchConvertPage from "@/app/[locale]/dashboard/tools/batch-convert/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicBatchConvertPage() {
    return (
        <PublicToolsShell compact>
            <BatchConvertPage />
        </PublicToolsShell>
    );
}
