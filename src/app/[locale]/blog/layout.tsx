import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog & İçgörüler | Zygsoft",
    description: "Yazılım, tasarım ve dijital dünyaya dair en güncel makaleler ve Zygsoft ekibinin profesyonel teknoloji içgörüleri.",
    openGraph: {
        title: "Blog & İçgörüler | Zygsoft",
        description: "Yazılım, tasarım ve dijital dünyaya dair en güncel makaleler.",
        type: "website",
    }
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
