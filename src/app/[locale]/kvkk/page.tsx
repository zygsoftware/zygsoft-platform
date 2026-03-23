"use client";

import { Shield } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

const sectionsTr = [
    {
        title: "1. Veri Sorumlusu",
        body: `Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca hazırlanmıştır. Veri sorumlusu sıfatıyla ZYGSOFT Yazılım & Danışmanlık ("Zygsoft"), Antalya, Türkiye adresinde mukim olup kişisel verilerinizi işlemektedir.`,
    },
    {
        title: "2. İşlenen Kişisel Veriler",
        body: `Hizmetlerimizden yararlanmanız kapsamında aşağıdaki kişisel veriler işlenebilir:
• Ad, soyad ve iletişim bilgileri (e-posta, telefon)
• Şirket / büro adı ve unvan bilgileri
• Hesap giriş bilgileri (şifrelenmiş)
• Ödeme bildirimi ve dekont bilgileri
• Platform kullanım verileri (log, oturum bilgileri)
• Yüklenen belgeler (hukuk yazılımı kullanıcıları için)`,
    },
    {
        title: "3. Kişisel Verilerin İşlenme Amacı",
        body: `Kişisel verileriniz şu amaçlarla işlenmektedir:
• Hesap oluşturma ve kimlik doğrulama
• Abonelik ve ödeme yönetimi
• Satın alınan hizmetlerin aktivasyonu
• Müşteri destek hizmetlerinin yürütülmesi
• Yasal yükümlülüklerin yerine getirilmesi
• Hizmet kalitesinin artırılması ve sistem güvenliğinin sağlanması`,
    },
    {
        title: "4. Kişisel Verilerin Aktarılması",
        body: `Kişisel verileriniz; yasal zorunluluklar dışında üçüncü taraflarla paylaşılmamaktadır. Ödeme işlemlerine ilişkin veriler, güvenli ödeme altyapısı sağlayıcıları ile sınırlı ölçüde paylaşılabilir. Yurt dışı veri transferi yapılmamaktadır.`,
    },
    {
        title: "5. Kişisel Verilerin Saklanma Süresi",
        body: `Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte veya ilgili mevzuatta öngörülen yasal saklama süresi sonunda silinmekte, yok edilmekte veya anonim hale getirilmektedir. Hesap silme talebi halinde veriler 30 gün içinde silinir.`,
    },
    {
        title: "6. Kişisel Veri Sahibinin Hakları",
        body: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri öğrenme
• Eksik veya yanlış işlenmişse düzeltilmesini isteme
• Silinmesini veya yok edilmesini isteme
• İşlemenin otomatik sistemler vasıtasıyla gerçekleştirilmesi durumunda ortaya çıkabilecek aleyhte sonuca itiraz etme
• Zararın giderilmesini talep etme`,
    },
    {
        title: "7. Veri Güvenliği",
        body: `Kişisel verileriniz, endüstri standardı güvenlik önlemleri (SSL/TLS şifrelemesi, güvenlik duvarları, şifreli veritabanı) ile korunmaktadır. Yüklenen hukuki belgeler sunucu tarafında işlendikten sonra otomatik olarak imha edilmektedir.`,
    },
    {
        title: "8. İletişim",
        body: `KVKK kapsamındaki taleplerinizi info@zygsoft.com adresine e-posta ile iletebilirsiniz. Talepleriniz en geç 30 gün içinde yanıtlanacaktır.\n\nBu metin en son 18.03.2026 tarihinde güncellenmiştir.`,
    },
] as const;

/** English rendering of the same KVKK disclosure (Law No. 6698) for non-Turkish readers. */
const sectionsEn = [
    {
        title: "1. Data controller",
        body: `This disclosure is prepared in accordance with the Turkish Personal Data Protection Law No. 6698 (“KVKK”). The data controller is ZYGSOFT Yazılım & Danışmanlık (“Zygsoft”), based in Antalya, Turkey, which processes your personal data in this capacity.`,
    },
    {
        title: "2. Categories of personal data",
        body: `In connection with our services, we may process the following personal data:
• Name, surname and contact details (email, phone)
• Company / office name and title information
• Account login credentials (stored in protected form)
• Payment notification and receipt-related information
• Platform usage data (logs, session information)
• Documents you upload (for users of our legal software tools)`,
    },
    {
        title: "3. Purposes of processing",
        body: `Your personal data is processed for the following purposes:
• Creating accounts and identity verification
• Managing subscriptions and payments
• Activating purchased services
• Providing customer support
• Fulfilling legal obligations
• Improving service quality and ensuring system security`,
    },
    {
        title: "4. Transfers",
        body: `Your personal data is not shared with third parties except where required by law. Data related to payments may be shared to a limited extent with secure payment infrastructure providers. We do not transfer personal data abroad as described in this disclosure.`,
    },
    {
        title: "5. Retention",
        body: `Personal data is deleted, destroyed or anonymised when the purpose of processing ends or when statutory retention periods expire. If you request account deletion, data is deleted within 30 days, subject to legal retention requirements.`,
    },
    {
        title: "6. Your rights (KVKK Art. 11)",
        body: `Under Article 11 of the KVKK you have the right to:
• Learn whether your personal data is processed
• Request information if it has been processed
• Learn the purpose of processing and whether data is used accordingly
• Know third parties to whom data is transferred domestically or abroad
• Request rectification if data is incomplete or inaccurate
• Request erasure or destruction
• Object to outcomes against you arising solely from automated processing
• Request compensation for damage`,
    },
    {
        title: "7. Security",
        body: `Personal data is protected using industry-standard measures (SSL/TLS encryption, firewalls, encrypted databases). Legal documents uploaded for processing are automatically destroyed on our servers after processing is complete.`,
    },
    {
        title: "8. Contact",
        body: `You may submit requests under the KVKK by email to info@zygsoft.com. We aim to respond within 30 days at the latest.\n\nLast updated: March 18, 2026.`,
    },
] as const;

const shell = {
    tr: {
        eyebrow: "Gizlilik",
        title: "KVKK Aydınlatma Metni",
        subtitle:
            "Kişisel verileriniz Zygsoft tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir. Aşağıdaki metin bilgilendirme amaçlıdır.",
        tocTitle: "İçindekiler",
    },
    en: {
        eyebrow: "Privacy",
        title: "Personal data disclosure (KVKK)",
        subtitle:
            "English version of our disclosure under Turkish Law No. 6698 (KVKK). Use the language switcher (Türkçe) to read the official Turkish text on the same page.",
        tocTitle: "On this page",
    },
} as const;

export default function KvkkPage() {
    const locale = useLocale();
    const tFooter = useTranslations("Footer");
    const isEn = locale === "en";
    const s = isEn ? shell.en : shell.tr;
    const updatedLabel = isEn
        ? "Last updated · March 18, 2026"
        : "Son güncelleme · 18 Mart 2026";

    const sections = isEn ? sectionsEn : sectionsTr;

    return (
        <LegalPageShell
            eyebrow={s.eyebrow}
            title={s.title}
            subtitle={s.subtitle}
            tocTitle={s.tocTitle}
            updatedLabel={updatedLabel}
            icon={Shield}
            sections={sections}
            relatedLinks={[
                { href: "/privacy", label: tFooter("privacyPolicy") },
                { href: "/terms", label: tFooter("termsOfService") },
            ]}
        />
    );
}
