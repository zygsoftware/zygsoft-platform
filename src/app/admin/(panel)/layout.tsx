import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}
