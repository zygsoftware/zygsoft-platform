import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "../[locale]/globals.css";
import { AdminProviders } from "@/components/admin/AdminProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Admin Panel | ZYGSOFT",
    description: "Zygsoft Admin Yönetim Paneli",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" className="scroll-smooth">
            <body className={`${inter.className} min-h-screen`}>
                <AdminProviders>
                    {children}
                    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                </AdminProviders>
            </body>
        </html>
    );
}
