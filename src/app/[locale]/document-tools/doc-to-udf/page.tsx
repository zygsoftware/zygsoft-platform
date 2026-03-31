import DocToUdfTool from "@/app/[locale]/dashboard/tools/doc-to-udf/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicDocToUdfToolPage() {
    return (
        <PublicToolsShell compact>
            <DocToUdfTool />
        </PublicToolsShell>
    );
}
