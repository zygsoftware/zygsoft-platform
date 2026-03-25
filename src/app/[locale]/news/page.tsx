import { redirect } from "next/navigation";

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function NewsPageRedirect({ params }: Props) {
    const { locale } = await params;
    redirect(locale === "en" ? "/en/blog" : "/blog-haberler");
}
