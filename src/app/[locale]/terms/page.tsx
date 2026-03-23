"use client";

import { ScrollText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

const LAST_UPDATED = { tr: "18 Mart 2026", en: "March 18, 2026" };

const content = {
  tr: {
    eyebrow: "Yasal",
    title: "Kullanıcı Sözleşmesi",
    subtitle:
      "Zygsoft platformunu ve çevrimiçi hizmetlerini kullanarak bu sözleşmeyi kabul etmiş sayılırsınız. Kişisel veriler için Gizlilik Politikası ve KVKK metinlerimize bakınız.",
    tocTitle: "İçindekiler",
    sections: [
      {
        title: "1. Taraflar ve kabul",
        body: `Bu Kullanıcı Sözleşmesi (“Sözleşme”), ZYGSOFT Yazılım & Danışmanlık (“Zygsoft”, “Şirket”) ile platforma kayıt olan veya hizmet alan gerçek/tüzel kişi kullanıcı (“Kullanıcı”) arasındadır.\n\nKayıt tamamlandığında veya ücretli/ücretsiz hizmet kullanıldığında Kullanıcı, bu metni okuduğunu, anladığını ve bağlı olduğunu kabul eder.`,
      },
      {
        title: "2. Hizmetlerin tanımı",
        body: `Zygsoft; web ve uygulama geliştirme, dijital danışmanlık, abonelikli dijital ürünler (ör. hukuk belge araçları paketi: UDF dönüştürme, PDF işlemleri, OCR vb.), müşteri paneli, blog ve iletişim kanalları sunabilir.\n\nHizmet içeriği, özellikler ve fiyatlandırma sitede veya panelde ilan edildiği şekilde geçerlidir; Şirket teknik veya ticari gerekçelerle hizmetleri güncelleme, durdurma veya sonlandırma hakkını saklı tutar; mevcut abonelikler için makul önceden bildirim hedeflenir.`,
      },
      {
        title: "3. Hesap, kimlik ve güvenlik",
        body: `• Kullanıcı doğru ve güncel bilgi vermekle yükümlüdür.\n• Giriş bilgilerinin gizliliği Kullanıcı’nın sorumluluğundadır; üçüncü kişiyle paylaşılmamalıdır.\n• Yetkisiz erişim şüphesinde derhal info@zygsoft.com bildirilmelidir.\n• Şirket, Kullanıcı kaynaklı güvenlik ihlallerinden doğan zararlardan sorumlu tutulamaz.`,
      },
      {
        title: "4. Abonelik, ödeme ve faturalandırma",
        body: `• Ücretli ürünlerde bedel, süre ve kapsam sipariş anında belirtilir.\n• Ödeme yöntemi (ör. Havale/EFT) ve onay süreci panel üzerinden duyurulur; dekont ve bildirim Kullanıcı’ya aittir.\n• Onaylanan ödemeler makul sürede işlenir; süreler yoğunluğa göre değişebilir.\n• Tüketici mevzuatı ve mesafeli sözleşmeler hakkında yürürlükteki istisna ve cayma kuralları saklıdır.\n• İade koşulları ürün/hizmet sayfasında veya ayrı sözleşmede belirtilir; dijital içerik ve anında ifa edilen hizmetlerde mevzuatın izin verdiği ölçüde cayma hakkı sınırlı olabilir.\n• Fiyat değişiklikleri, mevcut abonelik dönemleri için genel olarak geçerli olmaz; yenileme öncesi bildirim yapılabilir.`,
      },
      {
        title: "5. Kabul edilebilir kullanım",
        body: `Kullanıcı özellikle şunları yapmamayı kabul eder:\n• Platforma, altyapıya veya üçüncü taraflara zarar verecek faaliyetler\n• Yetkisiz erişim, tersine mühendislik (yürürlükteki hukukun izin verdiği ölçüde), kötü amaçlı yazılım\n• Fikri mülkiyet ihlali, yanıltıcı veya yasa dışı içerik yükleme\n• Başkalarının kişisel verilerini izinsiz işleme\n• Otomasyonla hizmetleri kötüye kullanma (ör. aşırı yük, scraping yasağına aykırı davranış)\n\nİhlal halinde hesap askıya alınabilir, sonlandırılabilir ve yasal yollara başvurulabilir.`,
      },
      {
        title: "6. Fikri mülkiyet",
        body: `Platform yazılımı, tasarımı, markaları ve Şirket içeriği Zygsoft’a veya lisans verenlere aittir. Kullanıcı yalnızca sözleşme ve lisans kapsamında kullanım hakkı alır.\n\nKullanıcı’nın yüklediği içerikten Kullanıcı sorumludur; gerekli haklara sahip olduğunu beyan eder. Şirket, hizmetin ifası için bu içeriği işleyebilir; gizlilik ve KVKK metinlerine uygun davranır.`,
      },
      {
        title: "7. Belge işleme araçları",
        body: `Abonelikli belge araçlarında yüklenen dosyalar yalnızca talep edilen dönüşüm/işlem için kullanılır; işlem tamamlandıktan sonra politikamız gereği sunuculardan silinir. Kullanıcı, yüklediği belgelerin hukuka uygun olduğunu ve gizlilik yükümlülüklerine uyduğunu taahhüt eder.`,
      },
      {
        title: "8. Hizmet düzeyi ve sorumluluk sınırlaması",
        body: `Hizmetler “olduğu gibi” sunulur. Şirket, mücbir sebep, üçüncü taraf arızaları, bakım veya internet kesintilerinden kaynaklanan kesintilerden, dolaylı veya neticede oluşan zararlardan, veri kaybından — yasal olarak izin verilen azami ölçüde — sorumlu tutulamaz.\n\nProfesyonel hukuk/mali tavsiye niteliği taşıyan çıktılar için Kullanıcı kendi uzmanına danışmalıdır.`,
      },
      {
        title: "9. Sözleşme süresi ve fesih",
        body: `Kullanıcı hesabını kapatabilir. Şirket, ihlal veya risk durumunda bildirimle veya ağır ihlalde bildirimsiz hesabı askıya alabilir veya sonlandırabilir.\n\nFesih sonrası yasal saklama süreleri saklı kalmak üzere veriler silinir veya anonimleştirilir.`,
      },
      {
        title: "10. Uygulanacak hukuk ve uyuşmazlık",
        body: `Türk Hukuku uygulanır. Tüketici sıfatıyla işlem yapanlar için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yasal düzenlemelere göre yetkilidir. Diğer uyuşmazlıklarda Antalya Merkez Mahkemeleri ve İcra Müdürlükleri yetkilidir (yürürlükteki zorunlu hukuk kuralları saklıdır).`,
      },
      {
        title: "11. Diğer hükümler",
        body: `Bu Sözleşmenin bir kısmının geçersiz sayılması geri kalanını etkilemez. Şirket metni güncelleyebilir; önemli değişiklikler sitede yayımlanır; mümkünse e-posta ile bilgi verilir.\n\nGizlilik: /privacy — KVKK aydınlatma: /kvkk\n\nSon güncelleme: ${LAST_UPDATED.tr}`,
      },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Terms of Service",
    subtitle:
      "By using the Zygsoft platform and online services you agree to these terms. See our Privacy Policy and KVKK notice for how we handle personal data.",
    tocTitle: "On this page",
    sections: [
      {
        title: "1. Parties and acceptance",
        body: `These Terms of Service (“Terms”) are between ZYGSOFT Yazılım & Danışmanlık (“Zygsoft”, “Company”) and you, the user (individual or organisation) registering for or using our services.\n\nBy completing registration or using free or paid services, you confirm that you have read and agree to these Terms.`,
      },
      {
        title: "2. Description of services",
        body: `Zygsoft may provide web and application development, digital consulting, subscription digital products (e.g. legal document toolkit: UDF conversion, PDF tools, OCR, etc.), customer panel, blog, and contact channels.\n\nFeatures, scope, and pricing are as stated on the site or panel. We may update, suspend, or discontinue services for technical or business reasons; reasonable advance notice is aimed for active subscriptions where practicable.`,
      },
      {
        title: "3. Account, identity, and security",
        body: `• You must provide accurate, up-to-date information.\n• You are responsible for safeguarding login credentials; do not share them with third parties.\n• Notify info@zygsoft.com promptly of suspected unauthorised access.\n• We are not liable for losses caused by your failure to protect credentials.`,
      },
      {
        title: "4. Subscription, payment, and billing",
        body: `• Fees, duration, and scope for paid products are stated at purchase.\n• Payment methods (e.g. bank transfer) and approval workflows are described in the panel.\n• Approved payments are processed within a reasonable time; timing may vary with volume.\n• Consumer protection and distance-selling rules apply where mandatory.\n• Refund rules are stated on the product page or separate agreement; for digital content and immediately performed services, statutory withdrawal rights may be limited.\n• Price changes generally do not affect the current paid period; renewal may be notified in advance.`,
      },
      {
        title: "5. Acceptable use",
        body: `You agree not to:\n• Harm the platform, infrastructure, or third parties\n• Attempt unauthorised access, reverse engineer except as permitted by law, or deploy malware\n• Infringe intellectual property rights or upload unlawful or misleading content\n• Process others’ personal data without authority\n• Abuse services through automation (e.g. excessive load, scraping contrary to policy)\n\nWe may suspend or terminate accounts and pursue legal remedies for violations.`,
      },
      {
        title: "6. Intellectual property",
        body: `Platform software, design, branding, and Company content belong to Zygsoft or licensors. You receive only the usage rights described in these Terms and any product licence.\n\nYou are responsible for content you upload and warrant you have necessary rights. We process such content only to perform the service, in line with our privacy documents.`,
      },
      {
        title: "7. Document processing tools",
        body: `For subscribed document tools, uploaded files are used only to perform the requested operation and are deleted from our servers after processing according to our policy. You warrant that documents are lawful and that you comply with confidentiality duties.`,
      },
      {
        title: "8. Service levels and limitation of liability",
        body: `Services are provided “as is”. To the fullest extent permitted by law, we are not liable for indirect or consequential damages, data loss, outages due to force majeure, third-party failures, maintenance, or internet disruption.\n\nOutputs are not a substitute for professional legal or financial advice.`,
      },
      {
        title: "9. Term and termination",
        body: `You may close your account. We may suspend or terminate for breach or risk, with notice where reasonable, or without notice in case of serious breach.\n\nAfter termination, data is deleted or anonymised subject to legal retention requirements.`,
      },
      {
        title: "10. Governing law and disputes",
        body: `Turkish law applies. For consumers, consumer arbitration boards and consumer courts have jurisdiction as provided by law. For other disputes, courts and enforcement offices in Antalya (Central) have jurisdiction, subject to mandatory rules.`,
      },
      {
        title: "11. Miscellaneous",
        body: `If any provision is invalid, the remainder stays in effect. We may update these Terms; material changes will be posted on the site and, where possible, communicated by email.\n\nPrivacy: /privacy — KVKK notice: /kvkk\n\nLast updated: ${LAST_UPDATED.en}`,
      },
    ],
  },
} as const;

export default function TermsPage() {
  const locale = useLocale();
  const tFooter = useTranslations("Footer");
  const c = locale === "en" ? content.en : content.tr;
  const updatedLabel =
    locale === "en" ? `Last updated · ${LAST_UPDATED.en}` : `Son güncelleme · ${LAST_UPDATED.tr}`;

  return (
    <LegalPageShell
      eyebrow={c.eyebrow}
      title={c.title}
      subtitle={c.subtitle}
      tocTitle={c.tocTitle}
      updatedLabel={updatedLabel}
      icon={ScrollText}
      sections={c.sections}
      relatedLinks={[
        { href: "/privacy", label: tFooter("privacyPolicy") },
        { href: "/kvkk", label: tFooter("legalKvkk") },
      ]}
    />
  );
}
