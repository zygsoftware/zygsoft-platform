"use client";

import { Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

const LAST_UPDATED = { tr: "18 Mart 2026", en: "March 18, 2026" };

const content = {
  tr: {
    eyebrow: "Yasal",
    title: "Gizlilik Politikası",
    subtitle:
      "Bu politika, ZYGSOFT Yazılım & Danışmanlık (“Zygsoft”, “biz”) tarafından işletilen web siteleri ve çevrimiçi hizmetler kapsamında kişisel verilerin işlenmesine ilişkin genel ilkeleri açıklar. Türkiye’deki kişisel veri işleme faaliyetleri için ayrıca KVKK aydınlatma metnimizi inceleyiniz.",
    tocTitle: "İçindekiler",
    sections: [
      {
        title: "1. Veri sorumlusu ve kapsam",
        body: `Veri sorumlusu: ZYGSOFT Yazılım & Danışmanlık, Antalya, Türkiye.\nİletişim: info@zygsoft.com\n\nBu Gizlilik Politikası; zygsoft.com alan adlı web sitemiz, müşteri paneli, iletişim formları, bülten kaydı, blog ve benzeri çevrimiçi kanallar üzerinden toplanan bilgiler için geçerlidir. Hizmet sözleşmesi ve kullanım koşullarına ek olarak uygulanır.`,
      },
      {
        title: "2. Toplanan veri kategorileri",
        body: `Duruma göre şunlar işlenebilir:\n• Kimlik ve iletişim: ad, soyad, e-posta, telefon, şirket/unvan\n• Hesap verileri: kullanıcı adı, şifre (tek yönlü hash), oturum tanımlayıcıları\n• İşlem verileri: abonelik, ödeme bildirimi, destek talepleri\n• Teknik veriler: IP adresi, tarayıcı türü, cihaz bilgisi, tarih/saat, çerezler\n• İçerik: iletişim formu mesajları, yüklenen dosyalar (ör. belge dönüştürme araçlarında, işlem sonrası silme politikamıza tabi)\n\nHukuki metinlerimizde ayrıntılı liste için KVKK sayfamıza bakınız.`,
      },
      {
        title: "3. İşleme amaçları ve hukuki sebepler",
        body: `Verileriniz şu amaçlarla işlenir:\n• Web sitesi ve panelin sunulması, hesap oluşturma ve kimlik doğrulama (sözleşmenin ifası, meşru menfaat)\n• Müşteri desteği ve taleplerinize yanıt (sözleşmenin ifası / meşru menfaat)\n• Ödeme ve abonelik süreçlerinin yürütülmesi (sözleşmenin ifası, hukuki yükümlülük)\n• Güvenlik, dolandırıcılığın önlenmesi ve sistem bütünlüğü (meşru menfaat)\n• Yasal yükümlülüklerin yerine getirilmesi (hukuki yükümlülük)\n• Açık rızanız bulunduğu ölçüde pazarlama iletişimi ve bülten (açık rıza — dilediğiniz zaman geri çekilebilir)\n\nKVKK kapsamındaki aydınlatma yükümlülüğümüz ayrı metinde düzenlenmiştir.`,
      },
      {
        title: "4. Çerezler ve benzeri teknolojiler",
        body: `Sitemiz, oturumun sürdürülmesi, tercihlerin hatırlanması, güvenlik ve (varsa) istatistiksel analiz için çerez veya benzeri teknolojiler kullanabilir.\n\nZorunlu çerezler: sitenin çalışması için gereklidir.\nİsteğe bağlı çerezler: analitik veya pazarlama amaçlıysa, yürürlükteki mevzuata uygun şekilde bilgilendirme ve gerekiyorsa onay alınır.\n\nTarayıcı ayarlarınızdan çerezleri sınırlayabilirsiniz; bazı özellikler etkilenebilir.`,
      },
      {
        title: "5. Üçüncü taraflar ve aktarım",
        body: `Hizmet sunumu için sınırlı ölçüde altyapı sağlayıcıları (ör. barındırma, e-posta iletimi, ödeme bildirimi doğrulama) ile çalışılabilir. Sözleşmeler ve teknik önlemlerle veri güvenliği sağlanır.\n\nKişisel verileriniz, yasal zorunluluk veya mahkeme kararı olmadıkça üçüncü kişilere satılmaz veya ticari amaçla paylaşılmaz.\n\nYurt dışına aktarım yapılması halinde KVKK ve ilgili düzenlemelere uygun hukuki dayanak sağlanır ve gerekli bilgilendirme yapılır.`,
      },
      {
        title: "6. Saklama süresi",
        body: `Veriler, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanır. Hesap silme talebinde, yasal saklama yükümlülükleri saklı kalmak kaydıyla verileriniz makul sürede silinir, yok edilir veya anonimleştirilir.`,
      },
      {
        title: "7. Güvenlik",
        body: `Şifreli iletim (HTTPS), erişim kontrolleri, güncel yazılım uygulamaları ve personel bilgilendirmesi ile verilerin gizliliği, bütünlüğü ve erişilebilirliği korumaya çalışıyoruz. İnternet üzerinden hiçbir iletimin %100 güvenli olmadığını unutmayınız.`,
      },
      {
        title: "8. Haklarınız",
        body: `KVKK md. 11 ve ilgili mevzuat kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme/yok etme talep etme, işlemeye itiraz etme ve zararın giderilmesini isteme haklarına sahipsiniz.\n\nAvrupa Ekonomik Alanı’ndan erişen kullanıcılar için GDPR kapsamında benzer haklar (erişim, düzeltme, silme, işlemeyi kısıtlama, itiraz, veri taşınabilirliği vb.) yürürlükteki koşullara tabidir.\n\nTalepleriniz için: info@zygsoft.com — yasal süreler içinde yanıtlanır.`,
      },
      {
        title: "9. Çocukların gizliliği",
        body: `Hizmetlerimiz 18 yaş altına yönelik değildir. Bilerek çocuklardan kişisel veri toplamıyoruz. Böyle bir veri tespit edilirse silinmesi için bizimle iletişime geçiniz.`,
      },
      {
        title: "10. Politika değişiklikleri",
        body: `Bu metni güncelleyebiliriz. Önemli değişikliklerde web sitemiz veya e-posta ile bildirim yapılabilir. Yayındaki sürüm her zaman geçerlidir; son güncelleme tarihi aşağıda belirtilir.`,
      },
      {
        title: "11. İletişim",
        body: `Gizlilik ile ilgili sorularınız: info@zygsoft.com\n\nBu Gizlilik Politikası son güncelleme tarihi: ${LAST_UPDATED.tr}\n\nBu metin genel bilgilendirme sağlar; özel hukuki durumunuz için profesyonel danışmanlık alınız.`,
      },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    subtitle:
      "This policy describes how ZYGSOFT Yazılım & Danışmanlık (“Zygsoft”, “we”) processes personal data in connection with our websites and online services. For processing under Turkish law, please also read our KVKK disclosure.",
    tocTitle: "On this page",
    sections: [
      {
        title: "1. Data controller and scope",
        body: `Controller: ZYGSOFT Yazılım & Danışmanlık, Antalya, Turkey.\nContact: info@zygsoft.com\n\nThis Privacy Policy applies to personal data collected through zygsoft.com, the customer panel, contact forms, newsletter signup, blog, and similar online channels. It supplements our Terms of Service and any product-specific terms.`,
      },
      {
        title: "2. Categories of data",
        body: `Depending on your interaction, we may process:\n• Identity & contact: name, email, phone, company / title\n• Account data: credentials (password stored using one-way hashing), session identifiers\n• Transaction data: subscriptions, payment notifications, support tickets\n• Technical data: IP address, browser type, device information, timestamps, cookies\n• Content: messages via forms, uploaded files (e.g. document tools — subject to our deletion policy after processing)\n\nSee our KVKK page for a more detailed list where Turkish law applies.`,
      },
      {
        title: "3. Purposes and legal bases",
        body: `We process data to:\n• Provide the website and panel, create and authenticate accounts (contract; legitimate interests)\n• Respond to enquiries and support requests (contract; legitimate interests)\n• Operate billing and subscription workflows (contract; legal obligation)\n• Maintain security, prevent abuse and fraud (legitimate interests)\n• Comply with legal obligations\n• Where applicable, send marketing or newsletters only with your consent (withdrawable at any time)\n\nTurkey-specific transparency obligations are addressed in our KVKK disclosure.`,
      },
      {
        title: "4. Cookies and similar technologies",
        body: `We may use cookies or similar technologies for session management, preferences, security, and (where used) analytics.\n\nStrictly necessary cookies are required for the site to function.\nOptional cookies (e.g. analytics or marketing) are used in line with applicable law, including notice and consent where required.\nYou can restrict cookies via your browser; some features may not work.`,
      },
      {
        title: "5. Processors and transfers",
        body: `We use a limited set of infrastructure providers (e.g. hosting, email delivery, payment notification verification). We impose contractual and technical safeguards.\n\nWe do not sell personal data. Disclosure occurs only if required by law, court order, or to protect rights and safety.\n\nIf data is transferred outside Turkey or the EEA, we rely on appropriate legal mechanisms under applicable law.`,
      },
      {
        title: "6. Retention",
        body: `We retain data only as long as necessary for the purposes above and as required by statute of limitations or legal retention duties. After account deletion, data is erased or anonymised within a reasonable period, subject to legal exceptions.`,
      },
      {
        title: "7. Security",
        body: `We use measures such as HTTPS, access controls, and operational practices to protect confidentiality, integrity, and availability. No online transmission is completely risk-free.`,
      },
      {
        title: "8. Your rights",
        body: `Under Turkish law (KVKK Art. 11), you may request information, correction, deletion, objection, and other remedies.\n\nIf you are in the EEA, GDPR may grant rights including access, rectification, erasure, restriction, objection, and data portability, subject to conditions.\n\nContact: info@zygsoft.com — we respond within statutory timelines.`,
      },
      {
        title: "9. Children",
        body: `Our services are not directed at children under 18. We do not knowingly collect children’s personal data. Contact us if you believe such data was provided.`,
      },
      {
        title: "10. Changes",
        body: `We may update this policy. Material changes may be announced on the site or by email. The version on this page is the effective one; the date below shows the last update.`,
      },
      {
        title: "11. Contact",
        body: `Privacy questions: info@zygsoft.com\n\nLast updated: ${LAST_UPDATED.en}\n\nThis policy is for general information and is not a substitute for legal advice.`,
      },
    ],
  },
} as const;

export default function PrivacyPage() {
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
      icon={Lock}
      sections={c.sections}
      relatedLinks={[
        { href: "/terms", label: tFooter("termsOfService") },
        { href: "/kvkk", label: tFooter("legalKvkk") },
      ]}
    />
  );
}
