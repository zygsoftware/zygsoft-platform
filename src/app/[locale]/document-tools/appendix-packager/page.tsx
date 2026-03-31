import AppendixPackagerPage from "@/app/[locale]/dashboard/tools/appendix-packager/page";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";

export default function PublicAppendixPackagerPage() {
    return (
        <PublicToolsShell compact>
            <AppendixPackagerPage />
        </PublicToolsShell>
    );
}
